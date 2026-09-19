/**
 * Utility functions for Vizion AI Advisor guided business diagnostic workflow.
 */

import { BusinessDiagnosticProfile, DiagnosticMetrics, StructuredDiagnosticSection } from "../types";

export function formatIraqiDinar(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "غير محدد";
  return `${amount.toLocaleString("en-US")} د.ع`;
}

/**
 * Normalizes Eastern Arabic numerals (٠-٩) and text notations to standard numbers.
 */
export function normalizeIraqiNumericInput(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === "number") {
    return isNaN(raw) || raw < 0 ? null : raw;
  }

  const str = String(raw).trim();
  if (!str) return null;

  // Convert Eastern Arabic numerals (٠١٢٣٤٥٦٧٨٩) to Western (0123456789)
  const westernized = str.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());

  // Handle "ألف" or "k" shorthand (e.g., "25 ألف" -> 25000, "25k" -> 25000)
  const isKilo = /ألف|الف|k|K/i.test(westernized);
  const cleanDigits = westernized.replace(/[^0-9.]/g, "");

  if (!cleanDigits) return null;

  const parsed = parseFloat(cleanDigits);
  if (isNaN(parsed) || parsed < 0) return null;

  if (isKilo && parsed < 1000) {
    return parsed * 1000;
  }

  return parsed;
}

/**
 * Validates a numeric field input from the diagnostic form.
 */
export function validateDiagnosticNumericInput(
  raw: string | number | null | undefined,
  fieldName: string,
  options?: { min?: number; max?: number; required?: boolean }
): { isValid: boolean; value: number | null; error?: string } {
  const min = options?.min ?? 0;
  const max = options?.max;
  const required = options?.required ?? false;

  if (raw === null || raw === undefined || (typeof raw === "string" && raw.trim() === "")) {
    if (required) {
      return { isValid: false, value: null, error: `حقل ${fieldName} مطلوب.` };
    }
    return { isValid: true, value: null };
  }

  const num = normalizeIraqiNumericInput(raw);

  if (num === null) {
    return {
      isValid: false,
      value: null,
      error: `رجاءً إدخال رقم صحيح لحقل ${fieldName} (مثال: 25000 أو 25 ألف).`,
    };
  }

  if (num < min) {
    return {
      isValid: false,
      value: null,
      error: `يجب أن تكون قيمة ${fieldName} أكبر من أو تساوي ${min.toLocaleString("ar-IQ")}.`,
    };
  }

  if (max !== undefined && num > max) {
    return {
      isValid: false,
      value: null,
      error: `يجب ألا تتجاوز قيمة ${fieldName} ${max.toLocaleString("ar-IQ")}.`,
    };
  }

  return { isValid: true, value: num };
}

/**
 * Format a number as Iraqi Dinars (IQD).
 */
export function formatIQD(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "غير محدد";
  return `${Math.round(amount).toLocaleString("en-US")} د.ع`;
}

/**
 * Calculates essential local e-commerce metrics with transparent assumptions.
 */
export function calculateDiagnosticMetrics(
  profile: Partial<BusinessDiagnosticProfile>
): DiagnosticMetrics {
  const assumptions: string[] = [];
  let conversionRate: number | null = null;
  let conversionRateLabel = "غير كافٍ للحساب";
  let isConversionEstimated = false;

  const messages = profile.dailyMessages ?? null;
  const orders = profile.dailyOrders ?? null;

  if (messages !== null && messages > 0 && orders !== null && orders >= 0) {
    conversionRate = Math.min(100, Math.round(((orders / messages) * 100) * 10) / 10);
    if (conversionRate >= 15) {
      conversionRateLabel = "ممتاز جداً (أعلى من معدل السوق العراقي)";
    } else if (conversionRate >= 8) {
      conversionRateLabel = "جيد وطبيعي (معدل قياسي للمحادثات)";
    } else if (conversionRate >= 4) {
      conversionRateLabel = "متوسط (يحتاج تحسين في سكريبت الإغلاق)";
    } else {
      conversionRateLabel = "منخفض (هدر كبير بالرسائل أو تسعير غير مقنع)";
    }
    assumptions.push(`معدل التحويل مبني على نسبة ${orders} طلبات مؤكدة من أصل ${messages} رسالة يومية.`);
  } else if (messages !== null && messages > 0 && orders === 0) {
    conversionRate = 0;
    conversionRateLabel = "صفر - انعدام إغلاق الطلبات";
    assumptions.push("ماكو طلبات مؤكدة مسجلة مع وجود رسائل يومية.");
  } else {
    isConversionEstimated = true;
    assumptions.push("لم يتم إدخال عدد الرسائل أو الطلبات اليومية لحساب معدل التحويل بدقة.");
  }

  let grossMargin: number | null = null;
  let grossMarginPercent: number | null = null;
  let isMarginEstimated = false;

  const price = profile.sellingPrice ?? null;
  const cost = profile.productCost ?? null;

  if (price !== null && cost !== null && price > 0) {
    grossMargin = price - cost;
    grossMarginPercent = Math.round(((grossMargin / price) * 100) * 10) / 10;
    assumptions.push(
      `هامش الربح الإجمالي (${formatIQD(grossMargin)} للقطعة) محسوب قبل خصم أجور التوصيل (المتوسط 5,000 - 7,000 د.ع)، كلفة الإعلانات (CPA)، ونسبة المرتجع.`
    );
  } else {
    isMarginEstimated = true;
    assumptions.push("لم يتم تحديد سعر البيع أو كلفة المنتج لحساب هامش الربح الإجمالي.");
  }

  let estimatedDailyRevenue: number | null = null;
  let estimatedDailyGrossProfit: number | null = null;

  if (orders !== null && orders > 0 && price !== null && price > 0) {
    estimatedDailyRevenue = orders * price;
    if (grossMargin !== null) {
      estimatedDailyGrossProfit = orders * grossMargin;
    }
  }

  return {
    conversionRate,
    conversionRateLabel,
    grossMargin,
    grossMarginPercent,
    estimatedDailyRevenue,
    estimatedDailyGrossProfit,
    isConversionEstimated,
    isMarginEstimated,
    assumptions,
  };
}

/**
 * Builds the structured diagnostic prompt sent to the Vizion AI Advisor.
 */
export function constructDiagnosticPrompt(
  profile: BusinessDiagnosticProfile,
  metrics: DiagnosticMetrics
): string {
  const parts: string[] = [
    `طلب تشخيص متقدم لمشروع تجارة إلكترونية بالسوق العراقي عبر منصة فيزيون:`,
    `\n📋 بيانات المشروع المدخلة:`,
    `- نوع المشروع والمجال: ${profile.businessType || "غير محدد"}`,
    `- المنتج أو الخدمة: ${profile.productOrService || "غير محدد"}`,
    `- قناة البيع الأساسية: ${profile.salesChannel || "غير محدد"}`,
    `- متوسط سعر البيع: ${profile.sellingPrice ? formatIQD(profile.sellingPrice) : "غير محدد"}`,
    `- كلفة المنتج: ${profile.productCost ? formatIQD(profile.productCost) : "غير محدد"}`,
    `- عدد الرسائل اليومية: ${profile.dailyMessages !== null ? `${profile.dailyMessages} رسالة/يوم` : "غير محدد"}`,
    `- عدد الطلبات المؤكدة اليومية: ${profile.dailyOrders !== null ? `${profile.dailyOrders} طلب/يوم` : "غير محدد"}`,
    `- نسبة المرتجعات: ${profile.returnRate !== null && profile.returnRate !== undefined ? `${profile.returnRate}%` : "غير محددة"}`,
    `- مناطق ومحافظات التوصيل: ${profile.deliveryAreas || "بغداد والمحافظات"}`,
    `- التحدي والمشكلة الأساسية: ${profile.mainProblem || "ضعف الأداء العام للمبيعات"}`,
  ];

  if (profile.notes && profile.notes.trim()) {
    parts.push(`- ملاحظات إضافية من التاجر: ${profile.notes.trim()}`);
  }

  parts.push(`\n📊 الحسابات والمؤشرات المحسوبة محلياً:`);
  if (metrics.conversionRate !== null) {
    parts.push(`- معدل التحويل المحسوب: ${metrics.conversionRate}% (${metrics.conversionRateLabel})`);
  }
  if (metrics.grossMargin !== null && metrics.grossMarginPercent !== null) {
    parts.push(
      `- هامش الربح الإجمالي للقطعة: ${formatIQD(metrics.grossMargin)} (${metrics.grossMarginPercent}%)`
    );
  }

  parts.push(`\n🎯 المطلوب صياغة تقرير تشخيصي متكامل باللهجة العراقية المهنية وفق الأقسام الإجبارية التالية:
1. **التشخيص**: تحليل دقيق ومباشر لواقع المشروع بناءً على أرقام ومعايير السوق العراقي.
2. **الأرقام المهمة**: قراءة للمعدلات الحالية والحسابات مقارنة بالمعيار الموصى به في كورس فيزيون مع بيان الفرضيات.
3. **الأسباب المحتملة**: 2-3 أسباب جذرية للمشكلة.
4. **أول 3 خطوات**: أول 3 خطوات عملية فورية وقابلة للتطبيق السريع خلال 48 ساعة.
5. **النص الجاهز أو التطبيق العملي**: سكريبت محادثة للواتساب أو زاوية إعلانية باللهجة العراقية جاهز للنسخ الفوري.
6. **المقياس الذي تتابعه**: المؤشر الرقمي الأهم لهذا الأسبوع لمراقبة التحسن.
7. **الخطوة التالية**: خطوة واحدة محددة للبدء بها فوراً (مع ذكر الفصل أو الأداة المعنية من فصول فيزيون الـ 11).

*ملاحظة هامة*: إذا كانت هناك معلومة جوهرية ناقصة تؤثر على دقة التشخيص، اطلب توضيحاً سريعاً ومباشراً بلباقة بدلاً من التخمين غير المؤكد.`);

  return parts.join("\n");
}

/**
 * Parses the structured AI advisor response into interactive UI sections.
 */
export function parseStructuredAdvisorResponse(rawText: string): StructuredDiagnosticSection {
  const result: StructuredDiagnosticSection = {
    diagnosis: "",
    keyMetrics: "",
    probableCauses: [],
    next48HoursSteps: [],
    readyScriptOrSOP: "",
    metricToTrack: "",
    recommendedChapterOrTool: {},
  };

  if (!rawText) return result;

  // Clean raw suggestions tag if present
  const clean = rawText.replace(/\[SUGGESTIONS:\s*.*?\]/gi, "").trim();

  // Pattern detection for sections (supports numbered or formatted section titles)
  const headerRegex = /(?:^|\n)(?:(?:\d+[\.\-\)]|\*\*|\#\#)\s*)?(?:[•\-\*]\s*)?(التشخيص الشامل|التشخيص|قراءة الأرقام|الأرقام والمؤشرات|الأرقام المهمة|الأرقام|الأسباب الجذرية|الأسباب المحتملة|الأسباب|أول 3 خطوات|الخطوات الأولى|الخطوات|النص الجاهز أو التطبيق العملي|النص الجاهز|التطبيق العملي|سكربت المحادثة|سكربت أو إجراء جاهز|السكربت الجاهز|السكربت|المقياس الذي تتابعه|المقياس الواجب متابعته|المقياس الذي يجب متابعته|المقياس|المؤشر الأهم|الخطوة التالية|الخطوة القادمة|الفصل والأداة|الفصل أو الأداة المقترحة|الفصل المقترح|الأداة المقترحة)[^\n:]*[:\n]/gi;

  const matches: { key: string; index: number; contentStart: number }[] = [];
  let m: RegExpExecArray | null;

  while ((m = headerRegex.exec(clean)) !== null) {
    matches.push({
      key: m[1],
      index: m.index,
      contentStart: m.index + m[0].length,
    });
  }

  if (matches.length === 0) {
    result.diagnosis = clean;
    return result;
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const end = i + 1 < matches.length ? matches[i + 1].index : clean.length;
    const content = clean.slice(current.contentStart, end).trim();

    if (/التشخيص/i.test(current.key)) {
      result.diagnosis = content;
    } else if (/الأرقام/i.test(current.key)) {
      result.keyMetrics = content;
    } else if (/الأسباب/i.test(current.key)) {
      result.probableCauses = content
        .split("\n")
        .map((line) => line.trim().replace(/^(?:\d+[\.\-\)]|[•\-\*])\s*/, ""))
        .filter(Boolean);
      if (result.probableCauses.length === 0 && content) {
        result.probableCauses = [content];
      }
    } else if (/خطوات|الخطوات/i.test(current.key)) {
      result.next48HoursSteps = content
        .split("\n")
        .map((line) => line.trim().replace(/^(?:\d+[\.\-\)]|[•\-\*])\s*/, ""))
        .filter(Boolean);
      if (result.next48HoursSteps.length === 0 && content) {
        result.next48HoursSteps = [content];
      }
    } else if (/النص|سكربت|السكربت|إجراء|تطبيق/i.test(current.key)) {
      result.readyScriptOrSOP = content;
    } else if (/المقياس|المؤشر/i.test(current.key)) {
      result.metricToTrack = content;
    } else if (/الخطوة التالية|الخطوة القادمة|الفصل|الأداة/i.test(current.key)) {
      result.recommendedChapterOrTool = {
        chapterTitle: content,
      };
      if (content.includes("8") || content.includes("التوصيل") || content.includes("المرتجع")) {
        result.recommendedChapterOrTool.chapterId = "delivery-ops";
      } else if (content.includes("7") || content.includes("الواتساب") || content.includes("المبيعات")) {
        result.recommendedChapterOrTool.chapterId = "sales-closing";
      } else if (content.includes("6") || content.includes("الإعلانات") || content.includes("الحملات")) {
        result.recommendedChapterOrTool.chapterId = "paid-ads";
      } else if (content.includes("5") || content.includes("العرض") || content.includes("Offer")) {
        result.recommendedChapterOrTool.chapterId = "irresistible-offer";
      } else {
        const chMatch = content.match(/الفصل\s*(\d+)/i);
        if (chMatch && chMatch[1]) {
          result.recommendedChapterOrTool.chapterId = `ch${chMatch[1]}`;
        }
      }
    }
  }

  // If diagnosis is empty, set from full text
  if (!result.diagnosis) {
    result.diagnosis = clean;
  }

  return result;
}
