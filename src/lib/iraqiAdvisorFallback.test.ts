import { describe, it, expect } from "vitest";
import { generateIraqiAdvisorFallback } from "./iraqiAdvisorFallback";

describe("Iraqi Advisor Fallback Generator", () => {
  it("should generate relevant WhatsApp script advice when query relates to prices or closing", () => {
    const result = generateIraqiAdvisorFallback("الزبون يقول السعر غالي بالواتساب شلون اقنعه؟");
    expect(result).toContain("الواتساب");
    expect(result).toContain("بصمة صوت");
    expect(result).toContain("سعر البيع");
    expect(result).toContain("[SUGGESTIONS:");
  });

  it("should generate returns and delivery logistics advice when query relates to returns", () => {
    const result = generateIraqiAdvisorFallback("عندي نسبة الراجع عالية بالمحافظات ودا اخسر");
    expect(result).toContain("الراجع");
    expect(result).toContain("كروة");
    expect(result).toContain("مكالمة التثبيت");
  });

  it("should generate advertising and ROAS advice for ad campaign queries", () => {
    const result = generateIraqiAdvisorFallback("ليش ماكو مبيعات في حملة إعلانات تيك توك؟");
    expect(result).toContain("تيك توك");
    expect(result).toContain("CPA");
    expect(result).toContain("الهوك");
  });

  it("should generate pricing and margin calculations for profit leak queries", () => {
    const result = generateIraqiAdvisorFallback("شلون اسعر المنتج حتى اضمن صافي ربح بالدينار؟");
    expect(result).toContain("صافي الربح");
    expect(result).toContain("دينار");
    expect(result).toContain("IQD");
  });
});
