/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from "vitest";
import {
  ADVISOR_EVALUATION_DATASET,
  evaluateAdvisorResponse,
  runAdvisorEvaluationSuite,
} from "./advisorEvaluator";
import {
  sanitizeAnalyticsProperties,
  trackEvent,
  getAnalyticsSummary,
} from "../lib/analytics";

describe("Advisor Quality Evaluation Suite (8 Benchmarks & 6 Rubrics)", () => {
  it("should cover all 8 required evaluation categories in the benchmark dataset", () => {
    const categories = ADVISOR_EVALUATION_DATASET.map((t) => t.category);
    expect(categories).toContain("pricing");
    expect(categories).toContain("low_conversion");
    expect(categories).toContain("high_returns");
    expect(categories).toContain("ad_performance");
    expect(categories).toContain("product_page");
    expect(categories).toContain("whatsapp_scripts");
    expect(categories).toContain("ambiguous_question");
    expect(categories).toContain("unrelated_sequential_questions");
    expect(ADVISOR_EVALUATION_DATASET.length).toBe(8);
  });

  it("should successfully evaluate pricing queries for Iraqi Dinar math, relevance, and action steps", () => {
    const pricingTest = ADVISOR_EVALUATION_DATASET.find((t) => t.category === "pricing")!;
    const report = evaluateAdvisorResponse(pricingTest, pricingTest.sampleGoldAnswer!);
    
    expect(report.passedAll).toBe(true);
    expect(report.criteria.topicRelevance.passed).toBe(true);
    expect(report.criteria.correctCalculations.passed).toBe(true);
    expect(report.criteria.concreteNextAction.passed).toBe(true);
    expect(report.criteria.iraqiArabicOutput.passed).toBe(true);
  });

  it("should detect and penalize context contamination in unrelated sequential questions", () => {
    const sequentialTest = ADVISOR_EVALUATION_DATASET.find(
      (t) => t.category === "unrelated_sequential_questions"
    )!;

    // A contaminated answer that leaks previous phone script into China import calculations
    const contaminatedAnswer =
      "أهلاً بيك يا غالي.. كلفة الاستيراد من الصين تعتمد على الجمارك، وألو سلام عليكم أخوية طالعلك المندوب اليوم لتثبيت الأوردر!";

    const report = evaluateAdvisorResponse(sequentialTest, contaminatedAnswer);
    expect(report.criteria.noContextContamination.passed).toBe(false);
    expect(report.passedAll).toBe(false);

    // A clean answer
    const cleanReport = evaluateAdvisorResponse(sequentialTest, sequentialTest.sampleGoldAnswer!);
    expect(cleanReport.criteria.noContextContamination.passed).toBe(true);
    expect(cleanReport.passedAll).toBe(true);
  });

  it("should evaluate ambiguous questions for calibrated uncertainty and clarification questions", () => {
    const ambiguousTest = ADVISOR_EVALUATION_DATASET.find(
      (t) => t.category === "ambiguous_question"
    )!;

    // Bad response that assumes facts blindly
    const blindAnswer = "حلك هو تزيد ميزانية الإعلان لـ 100 دولار فوراً وتبيع كوزمتكس.";
    const badReport = evaluateAdvisorResponse(ambiguousTest, blindAnswer);
    expect(badReport.criteria.appropriateUncertainty.passed).toBe(false);

    // Good response that asks clarifying questions
    const goodReport = evaluateAdvisorResponse(ambiguousTest, ambiguousTest.sampleGoldAnswer!);
    expect(goodReport.criteria.appropriateUncertainty.passed).toBe(true);
    expect(goodReport.passedAll).toBe(true);
  });

  it("should run the full automated suite with 100% pass on standard reference benchmark", () => {
    const suiteResult = runAdvisorEvaluationSuite();
    const failingReports = suiteResult.reports.filter((r) => !r.passedAll);
    if (failingReports.length > 0) {
      console.log("Failing Test Cases:", JSON.stringify(failingReports, null, 2));
    }
    expect(suiteResult.totalTests).toBe(8);
    expect(suiteResult.passedTests).toBe(8);
    expect(suiteResult.failedTests).toBe(0);
    expect(suiteResult.averageScore).toBeGreaterThanOrEqual(90);
  });
});

describe("Privacy-Conscious Product Analytics Engine", () => {
  it("should sanitize and scrub private customer phone numbers, emails, and API keys", () => {
    const dirtyProps = {
      chapterId: "chapter3",
      source: "whatsapp",
      phone: "07701234567", // Disallowed key
      customerInfo: "علي 07809988776 email: test@domain.com API: AIzaSyD983949823489234892348923489234",
    };

    const clean = sanitizeAnalyticsProperties(dirtyProps);
    expect(clean.chapterId).toBe("chapter3");
    expect(clean.source).toBe("whatsapp");
    expect((clean as any).phone).toBeUndefined(); // Key not allowed
    expect((clean as any).customerInfo).toBeUndefined();
  });

  it("should allow safe tracking of allowed product event types without logging private text", () => {
    const tracked = trackEvent("advisor_feedback_submitted", {
      rating: "helpful",
      reason: "أريد تفاصيل أكثر",
      topicId: "pricing",
    });

    expect(tracked).not.toBeNull();
    expect(tracked?.eventType).toBe("advisor_feedback_submitted");
    expect(tracked?.properties.rating).toBe("helpful");
    expect(tracked?.properties.reason).toBe("أريد تفاصيل أكثر");

    const summary = getAnalyticsSummary();
    expect(summary.totalEvents).toBeGreaterThan(0);
  });
});
