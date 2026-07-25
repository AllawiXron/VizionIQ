import { handleAdvisorChat } from "../../src/lib/gemini.js";

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages, userContext } = req.body || {};

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const reply = await handleAdvisorChat(messages, userContext);
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error("Vercel Advisor API Error:", error);
    return res.status(500).json({
      error: "حدث خطأ في التواصل مع المستشار الذكي.",
      details: error.message || "Unknown error",
    });
  }
}
