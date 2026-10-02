import { describe, it, expect } from "vitest";
import { sanitizeMessageForHistory, prepareCleanContents, handleAdvisorRequest } from "./gemini";
import { buildRequestInstruction, HISTORY_WINDOW, runAdvisor } from "./advisor/core";

const textOf = (parts: Array<{ text?: string }>) => parts.map((p) => p.text ?? "").join(" ");

describe("Vizion AI Advisor Conversation Reliability", () => {
  it("should sanitize suggestion and profile tags from assistant messages", () => {
    const raw = "هذا هو الجواب على مشكلة الإعلانات بالسوق العراقي.\n[PROFILE: price=35000]\n[SUGGESTIONS: سكريبت واتساب | خطة الراجع | معادلة التسعير]";
    const clean = sanitizeMessageForHistory(raw);
    expect(clean).toBe("هذا هو الجواب على مشكلة الإعلانات بالسوق العراقي.");
    expect(clean).not.toContain("[SUGGESTIONS:");
    expect(clean).not.toContain("[PROFILE:");
  });

  it("should isolate the topic when isNewTopic is true, ignoring previous conversation history", () => {
    const messages = [
      { role: "user" as const, text: "اعطيني سكريبت رد على الزبون بالواتساب بخصوص السعر الغالي" },
      { role: "assistant" as const, text: "هذا سكريبت الرد على السعر الغالي: هلا بيك عيوني، سعرنا يشمل الضمان..." },
      { role: "user" as const, text: "عندي مشكلة ضعف المبيعات بالإعلانات، شنو أسوي؟" },
    ];
    const prepared = prepareCleanContents(messages, { isNewTopic: true });
    expect(prepared.length).toBe(1);
    expect(prepared[0].role).toBe("user");
    const userText = textOf(prepared[0].parts as Array<{ text?: string }>);
    expect(userText).toContain("عندي مشكلة ضعف المبيعات بالإعلانات");
    expect(userText).not.toContain("السعر الغالي");
  });

  it("should keep a sliding window of recent turns", () => {
    const messages = Array.from({ length: 25 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      text: i % 2 === 0 ? `سؤال ${i / 2 + 1}` : `جواب ${(i + 1) / 2}`,
    }));
    const prepared = prepareCleanContents(messages);
    expect(prepared.length).toBeLessThanOrEqual(HISTORY_WINDOW);
    const combined = prepared.map((p) => textOf(p.parts as Array<{ text?: string }>)).join(" ");
    expect(combined).not.toContain("سؤال 1 ");
    expect(combined).toContain("سؤال 13");
    expect(prepared[0].role).toBe("user");
  });

  it("should put the selected topic into the system instruction", () => {
    const messages = [{ role: "user" as const, text: "كيف أخفض نسبة الراجع؟" }];
    const { instruction } = buildRequestInstruction(messages, { topicContext: "delivery_and_returns" });
    expect(instruction).toContain("delivery_and_returns");
  });

  it("should attach images only to the latest user message", () => {
    const img = { mimeType: "image/jpeg", data: "AAAA" };
    const prepared = prepareCleanContents([
      { role: "user", text: "شوف هذا", images: [img] },
      { role: "assistant", text: "شفته" },
      { role: "user", text: "وهذا؟", images: [img, { mimeType: "text/html", data: "x" }] },
    ]);
    const first = prepared[0].parts as Array<{ inlineData?: unknown; text?: string }>;
    const last = prepared[2].parts as Array<{ inlineData?: unknown }>;
    expect(first.some((p) => p.inlineData)).toBe(false);
    expect(textOf(first)).toContain("أرفقت صورة");
    expect(last.filter((p) => p.inlineData).length).toBe(1); // the html "image" is rejected
  });

  it("should ground the instruction in the profile and the course", () => {
    const { instruction, sources } = buildRequestInstruction([{ role: "user", text: "نسبة الراجع عندي عالية والمندوب يرجع الطلبات" }], {
      profile: { product: "ساعات رجالية", price: "35,000", bogus: "x" },
    });
    expect(instruction).toContain("ساعات رجالية");
    expect(instruction).toContain("35,000 د.ع");
    expect(instruction).not.toContain("bogus");
    expect(sources.length).toBeGreaterThan(0);
  });
});

/** Fake Gemini client that streams the given chunks (or throws). */
function fakeClient(script: Array<string[] | Error>) {
  let call = 0;
  return {
    models: {
      generateContentStream: async () => {
        const step = script[Math.min(call++, script.length - 1)];
        if (step instanceof Error) throw step;
        return (async function* () {
          for (const text of step) yield { text };
        })();
      },
    },
  } as never;
}

describe("Advisor streaming", () => {
  it("streams deltas and falls back to the next model on a transient error", async () => {
    const deltas: string[] = [];
    const result = await runAdvisor(
      [{ role: "user", text: "شلون أسعر منتجي؟" }],
      {},
      (t) => deltas.push(t),
      undefined,
      fakeClient([new Error("503 UNAVAILABLE"), new Error("503 UNAVAILABLE"), ["هلا ", "عيني"]])
    );
    expect(result.text).toBe("هلا عيني");
    expect(deltas).toEqual(["هلا ", "عيني"]);
  });

  it("serves the offline Iraqi fallback when every model is down", async () => {
    const result = await runAdvisor([{ role: "user", text: "شلون أسعر منتجي وأحسب الربح؟" }], {}, () => {}, undefined, fakeClient([new Error("503 UNAVAILABLE")]));
    expect(result.fallback).toBe(true);
    expect(result.text.length).toBeGreaterThan(50);
  });

  it("writes NDJSON events over HTTP", async () => {
    const written: string[] = [];
    const headers: Record<string, string> = {};
    const res = {
      statusCode: 0,
      setHeader: (k: string, v: string) => (headers[k.toLowerCase()] = v),
      write: (c: string) => written.push(c) > 0,
      end: (c?: string) => c && written.push(c),
    };
    await handleAdvisorRequest(
      {
        method: "POST",
        headers: { "x-forwarded-for": "10.0.0.1" },
        body: { stream: true, messages: [{ role: "user", text: "مرحبا" }] },
        // Node fires the request's "close" as soon as the body is read — must not cancel the answer.
        on: (_event: string, cb: () => void) => cb(),
      },
      res,
      fakeClient([["أهلاً ", "بيك"]])
    );
    expect(headers["content-type"]).toContain("ndjson");
    const events = written.join("").trim().split("\n").map((l) => JSON.parse(l));
    expect(events[0].t).toBe("start");
    expect(events.filter((e) => e.t === "delta").map((e) => e.v).join("")).toBe("أهلاً بيك");
    expect(events[events.length - 1].t).toBe("done");
  });

  it("keeps the old JSON response when stream is not requested", async () => {
    let body = "";
    const res = { statusCode: 0, setHeader: () => {}, write: () => true, end: (c?: string) => (body = c || "") };
    await handleAdvisorRequest({ method: "POST", headers: {}, body: { messages: [{ role: "user", text: "مرحبا" }] } }, res, fakeClient([["جواب"]]));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(body).reply).toBe("جواب");
  });
});
