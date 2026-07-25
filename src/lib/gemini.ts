import { GoogleGenAI } from "@google/genai";

export const getGeminiClient = () => {
  const rawKey = process.env.GEMINI_API_KEY;
  const apiKey = rawKey ? rawKey.trim() : "";
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY غير معرف في متغيرة البيئة السيرفرية. يرجى إضافة GEMINI_API_KEY في إعدادات Vercel (Environment Variables).");
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

export const advisorSystemInstruction = `
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

export async function handleAdvisorChat(messages: any[], userContext?: any) {
  const ai = getGeminiClient();

  const formattedContents = messages.map((m: { role: string; text: string }) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.text }],
  }));

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
        systemInstruction: advisorSystemInstruction,
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
          systemInstruction: advisorSystemInstruction,
          temperature: 0.7,
        },
      });
    } catch (secondErr) {
      console.warn("Fallback gemini-2.0-flash failed, trying gemini-2.5-pro:", secondErr);
      response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: formattedContents,
        config: {
          systemInstruction: advisorSystemInstruction,
          temperature: 0.7,
        },
      });
    }
  }

  return response.text || "عذراً، لم أتمكن من توليد الإجابة المناسبة حالياً. يرجى إعادة المحاولة.";
}
