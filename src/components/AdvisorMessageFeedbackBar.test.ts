import { describe, it, expect } from "vitest";
import { IRAQI_MARKET_FEEDBACK_REASONS } from "./AdvisorMessageFeedbackBar";

describe("Advisor Iraqi Market Feedback System", () => {
  it("should contain all key Iraqi market feedback categories", () => {
    const labels = IRAQI_MARKET_FEEDBACK_REASONS.map((r) => r.label);
    
    expect(labels).toContain("الإجابة عامة وما تراعي خصوصية السوق العراقي");
    expect(labels).toContain("الحساب بالدينار أو كلفة التوصيل مو دقيق");
    expect(labels).toContain("نص المحادثة مو مقنع للزبون العراقي");
    expect(labels).toContain("أحتاج خطوات وتفاصيل عملية أكثر");
    expect(labels).toContain("الإجابة مو مرتبطة بسؤالي بشكل مباشر");
  });

  it("should have an identifier and a label for each feedback reason", () => {
    IRAQI_MARKET_FEEDBACK_REASONS.forEach((reason) => {
      expect(reason.id).toBeDefined();
      expect(reason.label).toBeTruthy();
    });
  });
});
