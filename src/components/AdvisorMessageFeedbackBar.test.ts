import { describe, it, expect } from "vitest";
import { IRAQI_MARKET_FEEDBACK_REASONS } from "./AdvisorMessageFeedbackBar";

describe("Advisor Iraqi Market Feedback System", () => {
  it("should contain all key Iraqi market feedback categories", () => {
    const labels = IRAQI_MARKET_FEEDBACK_REASONS.map((r) => r.label);
    
    expect(labels).toContain("عام وغير مخصص للسوق العراقي");
    expect(labels).toContain("الحسبة بالدينار أو كروة التوصيل غير دقيقة");
    expect(labels).toContain("السكريبت غير مقنع للزبون العراقي");
    expect(labels).toContain("أريد خطوات وتفاصيل عملية أكثر");
    expect(labels).toContain("مو مرتبط بسؤالي المباشر");
  });

  it("should have icons and identifiers for each feedback reason", () => {
    IRAQI_MARKET_FEEDBACK_REASONS.forEach((reason) => {
      expect(reason.id).toBeDefined();
      expect(reason.label).toBeTruthy();
      expect(reason.icon).toBeTruthy();
    });
  });
});
