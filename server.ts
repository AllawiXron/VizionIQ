import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { handleAdvisorRequest } from "./src/lib/advisor/core.js";

dotenv.config();

export const app = express();
app.use(express.json({ limit: "12mb" }));

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

// AI Advisor Chat Endpoint (streaming NDJSON, shared with the Vercel function)
app.post(["/api/advisor/chat", "/advisor/chat"], (req, res) => {
  handleAdvisorRequest(req, res).catch((error) => {
    console.error("[Advisor API Error]:", error);
    if (!res.headersSent) res.status(500).json({ error: "حدث خطأ في التواصل مع المستشار الذكي." });
    else res.end();
  });
});

// Health check
app.get(["/api/health", "/health"], (_req, res) => {
  res.json({ status: "ok", service: "Vizion AI Advisor Server" });
});



async function startServer() {
  const PORT = 3000;

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
