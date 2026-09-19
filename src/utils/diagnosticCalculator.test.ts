import { describe, it, expect } from "vitest";
import {
  normalizeIraqiNumericInput,
  formatIraqiDinar,
  calculateDiagnosticMetrics,
  constructDiagnosticPrompt,
  parseStructuredAdvisorResponse,
} from "./diagnosticCalculator";
import { BusinessDiagnosticProfile } from "../types";

describe("Iraqi Numeric Input Normalization", () => {
  it("converts Eastern Arabic numerals to standard numbers", () => {
    expect(normalizeIraqiNumericInput("١٢٣٤٥")).toBe(12345);
    expect(normalizeIraqiNumericInput("٢٥٠٠٠")).toBe(25000);
  });

  it("handles 'k' and 'K' suffix multiplier", () => {
    expect(normalizeIraqiNumericInput("25k")).toBe(25000);
    expect(normalizeIraqiNumericInput("15.5k")).toBe(15500);
    expect(normalizeIraqiNumericInput("100K")).toBe(100000);
  });

  it("handles Arabic 'ألف' and 'الف' shorthand", () => {
    expect(normalizeIraqiNumericInput("30 الف")).toBe(30000);
    expect(normalizeIraqiNumericInput("12.5 ألف")).toBe(12500);
  });

  it("strips commas, currency words, and spaces", () => {
    expect(normalizeIraqiNumericInput(" 35,000 د.ع ")).toBe(35000);
    expect(normalizeIraqiNumericInput("1,250,000 دينار")).toBe(1250000);
  });

  it("returns null for invalid inputs", () => {
    expect(normalizeIraqiNumericInput("")).toBeNull();
    expect(normalizeIraqiNumericInput("غير معروف")).toBeNull();
    expect(normalizeIraqiNumericInput(undefined)).toBeNull();
  });
});

describe("Iraqi Dinar Formatter", () => {
  it("formats numbers with thousand separators and IQD label", () => {
    expect(formatIraqiDinar(25000)).toBe("25,000 د.ع");
    expect(formatIraqiDinar(1250000)).toBe("1,250,000 د.ع");
    expect(formatIraqiDinar(null)).toBe("غير محدد");
  });
});

describe("Diagnostic Metrics Calculation", () => {
  it("calculates conversion rate and gross margin correctly", () => {
    const profile: BusinessDiagnosticProfile = {
      businessType: "e-commerce",
      productOrService: "ساعات رجالية فاخرة",
      salesChannel: "Instagram",
      sellingPrice: 40000,
      productCost: 16000,
      dailyMessages: 50,
      dailyOrders: 5,
      returnRate: 12,
      deliveryAreas: "بغداد وكل المحافظات",
      mainProblem: "الرسائل كثيرة لكن إغلاق الصفقات ضعيف",
    };

    const metrics = calculateDiagnosticMetrics(profile);

    // 5 orders / 50 messages = 10%
    expect(metrics.conversionRate).toBe(10);
    // (40,000 - 16,000) / 40,000 = 60%
    expect(metrics.grossMarginPercent).toBe(60);
    expect(metrics.estimatedDailyGrossProfit).toBe(120000); // 5 * (40000 - 16000) = 120,000
    expect(metrics.assumptions.length).toBeGreaterThan(0);
  });

  it("handles missing or partial fields gracefully with transparent assumptions", () => {
    const profile: BusinessDiagnosticProfile = {
      businessType: "dropshipping",
      productOrService: "ملابس نسائية",
      salesChannel: "WhatsApp",
      sellingPrice: null,
      productCost: null,
      dailyMessages: 20,
      dailyOrders: null,
      returnRate: null,
      deliveryAreas: "",
      mainProblem: "صعوبة الرد السريع",
    };

    const metrics = calculateDiagnosticMetrics(profile);

    expect(metrics.conversionRate).toBeNull();
    expect(metrics.grossMarginPercent).toBeNull();
    expect(metrics.assumptions.length).toBeGreaterThan(0);
  });
});

describe("Prompt Constructor & Response Parser", () => {
  it("constructs full diagnostic prompt in Iraqi context", () => {
    const profile: BusinessDiagnosticProfile = {
      businessType: "fashion",
      productOrService: "عطور فرنسية أصلية",
      salesChannel: "Instagram",
      sellingPrice: 50000,
      productCost: 20000,
      dailyMessages: 100,
      dailyOrders: 8,
      returnRate: 15,
      deliveryAreas: "بغداد والجنوب",
      mainProblem: "الزبون يطلب بالديركت ثم يلغي الطلب عند التوصيل",
    };

    const metrics = calculateDiagnosticMetrics(profile);
    const prompt = constructDiagnosticPrompt(profile, metrics);

    expect(prompt).toContain("عطور فرنسية أصلية");
    expect(prompt).toContain("Instagram");
    expect(prompt).toContain("50,000 د.ع");
    expect(prompt).toContain("8%"); // Conversion rate
    expect(prompt).toContain("60%"); // Margin
    expect(prompt).toContain("بغداد والجنوب");
  });

  it("parses structured advisor response into clean structured sections", () => {
    const sampleResponse = `
1. التشخيص الشامل لواقع المشروع:
المشروع يمتلك هامش ربح ممتاز (60%) ولكن هناك تسريب كبير في مرحلة التثبيت وتأكيد الطلبات قبل التوصيل.

2. قراءة الأرقام والمؤشرات الحيوية:
- معدل التحويل 8% منخفض بالنسبة للعطور عبر الانستغرام (المعدل المستهدف 12-15%).
- نسبة الراجع 15% تشكل ضغطاً على أرباح التوصيلات الناجحة.

3. الأسباب الجذرية المحتملة:
• عدم وجود مكالمة تثبيت صوتية فورية لتأكيد الجدية.
• الاعتماد على الرد النصي البارد بدون سحب رقم هاتف بديل.

4. أول 3 خطوات للبدء خلال 48 ساعة:
1. تطبيق مكالمة تثبيت صوتية خلال 30 دقيقة من استلام الطلب.
2. طلب عربون رمزي أو تأكيد العنوان الدقيق مع نقطة دالة للمحافظات.
3. تجهيز سكريبت إغلاق مخصص يوضح سياسة الفحص والاستبدال.

5. سكربت المحادثة / الإجراء الجاهز للنسخ:
📞 "أهلاً بيك أستاذ [اسم الزبون]، طلبك للعطر الفرنسي تم تجهيزه ومحجوز باسمك. للتأكيد النهائي والتسليم باجر، تفضل العنوان التفصيلي مع رقم هاتف بديل إذا أمكن؟"

6. المقياس الواجب متابعته:
معدل استلام التوصيلات اليومي (Delivery Confirmation Rate) للوصول إلى فوق 90%.

7. الفصل والأداة المقترحة:
الفصل 8: السيطرة على عمليات التوصيل وتقليل نسبة المرتجع.
    `;

    const parsed = parseStructuredAdvisorResponse(sampleResponse);

    expect(parsed.diagnosis).toContain("المشروع يمتلك هامش ربح ممتاز");
    expect(parsed.keyMetrics).toContain("معدل التحويل 8%");
    expect(parsed.probableCauses.length).toBeGreaterThan(0);
    expect(parsed.next48HoursSteps.length).toBe(3);
    expect(parsed.readyScriptOrSOP).toContain("أهلاً بيك أستاذ");
    expect(parsed.metricToTrack).toContain("معدل استلام التوصيلات اليومي");
    expect(parsed.recommendedChapterOrTool?.chapterTitle).toContain("الفصل 8");
    expect(parsed.recommendedChapterOrTool?.chapterId).toBe("delivery-ops");
  });
});
