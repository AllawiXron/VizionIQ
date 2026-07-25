import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

export const app = express();
app.use(express.json({ limit: "2mb" }));

// Initialize Gemini AI Client
const getGeminiClient = () => {
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = rawKey ? rawKey.trim() : "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY غير معرف في متغيرة البيئة السيرفرية. يرجى إضافة GEMINI_API_KEY في إعدادات البيئة على منصة الاستضافة.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// AI Advisor Chat Endpoint
app.post(["/api/advisor/chat", "/advisor/chat"], async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `
أنت "فيزيون بوت" (Vizion AI Advisor)، المستشار الرقمي الذكي المخصص لمنظومة "فيزيون • Vizion" للتجارة الإلكترونية في السوق العراقي.

مهمتك ومجال خبرتك:
1. توجيه التجار والشركات الناشئة في العراق لحل مشاكل ضعف المبيعات، ارتفاع نسبة مرتجعات التوصيل، وهدر ميزانيات الإعلانات.
2. استخدام إطار عمل الفصول الـ 11 من كتاب وكورس فيزيون:
   - الفصل 1: التأسيس واختيار المنتج المربح لسوق العراق.
   - الفصل 2: صياغة العرض الفولاذي (Offer Stack) والقيمة المضافة.
   - الفصل 3: الهيكل المالي والتسعير بحساب كلفة الشراء + التوصيل + الإعلانات بالدينار والدولار.
   - الفصل 4: صناعة المحتوى والإعلانات والملاحظات البصرية المؤثرة (Hooks & Angles).
   - الفصل 5: منصات التعديل والتوجيه وإستراتيجية صفحات الهبوط / المتجر.
   - الفصل 6: الاستهداف المتقدم وإطلاق الحملات الإعلانية على فيسبوك وانستغرام وتيك توك.
   - الفصل 7: إغلاق المبيعات وسكريبتات المحادثة عبر الواتساب والديركت (WhatsApp Sales Scripts).
   - الفصل 8: إدارة عمليات التوصيل وتقليل الراجع (Delivery Return Mitigation & Confirmation Calls).
   - الفصل 9: خدمة العملاء والبيع اللاحق (Upsell & Retention).
   - الفصل 10: تحليل البيانات ومؤشرات الأداء الرئيسية (ROAS, CPA, CVR, Delivery Rate).
   - الفصل 11: التوسع والنمو المستدام وبناء الفريق.

أسلوب ردك:
- عملي جداً، مباشر، ومشجع بلهجة مهنية محترمة متناغمة مع بيئة الأعمال العراقية (بغداد والمحافظات).
- اذكر دائماً نصائح وأرقام واقعية (مثلاً: نسبة الراجع الطبيعية 8-12% والمقبولة، وأسباب تأخير شركة التوصيل وكيفية تجاوزها بسكريبت تأكيد المكالمات).
- عند اقتراح حل، وجه المستخدم بوضوح إلى الفصل المخصص أو السكريبت المطلوب في المنظومة.
- حافظ على إجابات منظمة باستخدام النقاط أو الخطوات (1. 2. 3.) والرموز التعبيرية المناسبة.
`;

    // Format messages into Gemini format
    const formattedContents = messages.map((m: { role: string; text: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }],
    }));

    // Include optional context if present
    if (userContext) {
      formattedContents.unshift({
        role: "user",
        parts: [{ text: `سياق المستخدم الحالي: ${JSON.stringify(userContext)}` }],
      });
    }

    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    } catch (firstErr) {
      console.warn("Primary model gemini-2.5-flash failed, trying gemini-2.0-flash:", firstErr);
      try {
        response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (secondErr) {
        console.warn("Fallback gemini-2.0-flash failed, trying gemini-1.5-flash:", secondErr);
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      }
    }

    return res.json({
      reply: response.text || "عذراً، لم أتمكن من توليد الإجابة المناسبة حالياً. يرجى إعادة المحاولة.",
    });
  } catch (error: any) {
    console.error("Gemini Advisor API Error:", error);
    return res.status(500).json({
      error: "حدث خطأ في التواصل مع المستشار الذكي.",
      details: error.message || "Unknown error",
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
