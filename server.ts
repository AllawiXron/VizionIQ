import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { handleAdvisorChat } from "./src/lib/gemini.js";

dotenv.config();

export const app = express();
app.use(express.json({ limit: "2mb" }));

// Enable CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Request-ID");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// AI Advisor Chat Endpoint
app.post(["/api/advisor/chat", "/advisor/chat"], async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  const clientRequestId =
    req.headers["x-request-id"] ||
    req.body?.requestId ||
    `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  res.setHeader("X-Request-ID", clientRequestId);

  try {
    const { messages, userContext, isNewTopic, topicContext, diagnosticProfile, requestId } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: "Messages array is required.",
        requestId: clientRequestId,
      });
    }

    const reply = await handleAdvisorChat(messages, {
      userContext,
      isNewTopic: Boolean(isNewTopic),
      topicContext,
      diagnosticProfile,
      requestId: requestId || clientRequestId,
    });

    return res.json({
      reply,
      requestId: clientRequestId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error(`[Advisor API Error] [${clientRequestId}]:`, error);
    const msg = error.message || "حدث خطأ في التواصل مع المستشار الذكي.";
    return res.status(500).json({
      error: msg,
      requestId: clientRequestId,
    });
  }
});

// Health check
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ status: "ok", service: "Vizion AI Advisor Server" });
});



async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Vite development middleware vs Static Production serving
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Vizion System] Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error("Failed to start Vizion server:", err);
  });
}

export default app;
