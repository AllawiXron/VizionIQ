import { handleAdvisorChat } from "../../src/lib/gemini.ts";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Request-ID");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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

    return res.status(200).json({
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
}

