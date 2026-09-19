import { describe, it, expect } from "vitest";
import { sanitizeMessageForHistory, prepareCleanContents } from "./gemini";

describe("Vizion AI Advisor Conversation Reliability", () => {
  it("should sanitize system suggestion tags from assistant messages", () => {
    const raw = "هذا هو الجواب على مشكلة الإعلانات بالسوق العراقي.\n\n[SUGGESTIONS: سكريبت واتساب | خطة الراجع | معادلة التسعير]";
    const clean = sanitizeMessageForHistory(raw);
    expect(clean).toBe("هذا هو الجواب على مشكلة الإعلانات بالسوق العراقي.");
    expect(clean).not.toContain("[SUGGESTIONS:");
    expect(clean).not.toContain("سكريبت واتساب");
  });

  it("should isolate the topic when isNewTopic is true, ignoring previous conversation history", () => {
    const messages = [
      { role: "user" as const, text: "اعطيني سكريبت رد على الزبون بالواتساب بخصوص السعر الغالي" },
      { role: "assistant" as const, text: "هذا سكريبت الرد على السعر الغالي: هلا بيك عيوني، سعرنا يشمل الضمان..." },
      { role: "user" as const, text: "عندي مشكلة ضعف المبيعات بالإعلانات، شنو أسوي؟" }
    ];

    const prepared = prepareCleanContents(messages, { isNewTopic: true });
    
    // When isNewTopic is true, only the last user turn is sent to prevent contamination
    expect(prepared.length).toBe(1);
    expect(prepared[0].role).toBe("user");
    const userText = prepared[0].parts.map((p) => p.text).join(" ");
    expect(userText).toContain("عندي مشكلة ضعف المبيعات بالإعلانات");
    expect(userText).not.toContain("السعر الغالي");
  });

  it("should enforce a sliding window of max 6 recent turns to avoid context bloat", () => {
    const messages = [
      { role: "user" as const, text: "سؤال 1" },
      { role: "assistant" as const, text: "جواب 1" },
      { role: "user" as const, text: "سؤال 2" },
      { role: "assistant" as const, text: "جواب 2" },
      { role: "user" as const, text: "سؤال 3" },
      { role: "assistant" as const, text: "جواب 3" },
      { role: "user" as const, text: "سؤال 4" },
      { role: "assistant" as const, text: "جواب 4" },
      { role: "user" as const, text: "سؤال 5" }
    ];

    const prepared = prepareCleanContents(messages);
    expect(prepared.length).toBeLessThanOrEqual(6);
    const combined = prepared.map((p) => p.parts.map((part) => part.text).join(" ")).join(" ");
    expect(combined).not.toContain("سؤال 1");
    expect(combined).toContain("سؤال 5");
  });

  it("should preserve user topic context if explicitly provided", () => {
    const messages = [
      { role: "user" as const, text: "كيف أخفض نسبة الراجع؟" }
    ];

    const prepared = prepareCleanContents(messages, { topicContext: "delivery_and_returns" });
    expect(prepared.length).toBeGreaterThanOrEqual(1);
    const combined = prepared.map((p) => p.parts.map((part) => part.text).join(" ")).join(" ");
    expect(combined).toContain("delivery_and_returns");
    expect(combined).toContain("كيف أخفض نسبة الراجع؟");
  });
});
