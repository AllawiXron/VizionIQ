import { describe, it, expect } from "vitest";
import { sanitizeMessageForHistory, prepareCleanContents, handleAdvisorRequest } from "./gemini";
import { buildRequestInstruction, HISTORY_WINDOW, resetTrialCounts, runAdvisor, thinkingLevelFor } from "./advisor/core";

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
    expect(last.filter((p) => p.inlineData).length).toBe(1);
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
        body: { stream: true, code: "ali4#vip", messages: [{ role: "user", text: "مرحبا" }] },
        on: (_event: string, cb: () => void) => cb(),
      },
      res,
      fakeClient([["أهلا ", "بيك"]])
    );
    expect(headers["content-type"]).toContain("ndjson");
    const events = written.join("").trim().split("\n").map((l) => JSON.parse(l));
    expect(events[0].t).toBe("start");
    expect(events.filter((e) => e.t === "delta").map((e) => e.v).join("")).toBe("أهلا بيك");
    expect(events[events.length - 1].t).toBe("done");
  });

  it("keeps the old JSON response when stream is not requested", async () => {
    let body = "";
    const res = { statusCode: 0, setHeader: () => {}, write: () => true, end: (c?: string) => (body = c || "") };
    await handleAdvisorRequest({ method: "POST", headers: {}, body: { code: "ali4#vip", messages: [{ role: "user", text: "مرحبا" }] } }, res, fakeClient([["جواب"]]));
    expect(res.statusCode).toBe(200);
    expect(JSON.parse(body).reply).toBe("جواب");
  });

  it("gives the free trial three questions per phone, then says the trial is over", async () => {
    resetTrialCounts();
    const ask = async (device: string, extra: Record<string, unknown> = {}, client: ReturnType<typeof fakeClient> = fakeClient([["جواب"]])) => {
      let body = "";
      const res = { statusCode: 0, setHeader: () => {}, write: () => true, end: (c?: string) => (body = c || "") };
      await handleAdvisorRequest({ method: "POST", headers: { "x-forwarded-for": "10.9.9.9" }, body: { code: "free#1", device, messages: [{ role: "user", text: "مرحبا" }], ...extra } }, res, client);
      return { status: res.statusCode, data: JSON.parse(body) };
    };
    const first = await ask("phone-a");
    expect(first.status).toBe(200);
    expect(first.data.trialLeft).toBe(2);
    // finishing a cut-off answer is not a new question
    expect((await ask("phone-a", { continueFrom: "نص" })).data.trialLeft).toBe(2);
    expect((await ask("phone-a")).data.trialLeft).toBe(1);
    expect((await ask("phone-a")).data.trialLeft).toBe(0);
    const over = await ask("phone-a");
    expect(over.status).toBe(403);
    expect(over.data.trialOver).toBe(true);
    // another phone behind the same network address still gets its own questions
    expect((await ask("phone-b")).status).toBe(200);
    // a failed answer gives the question back
    await ask("phone-c", {}, fakeClient([new Error("down")]));
    expect((await ask("phone-c")).data.trialLeft).toBe(2);
  });

  it("refuses unknown codes and requests without a code", async () => {
    for (const code of ["made-up#vip", undefined]) {
      let body = "";
      const res = { statusCode: 0, setHeader: () => {}, write: () => true, end: (c?: string) => (body = c || "") };
      await handleAdvisorRequest({ method: "POST", headers: {}, body: { code, messages: [{ role: "user", text: "مرحبا" }] } }, res, fakeClient([["جواب"]]));
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(body).reply).toBeUndefined();
    }
  });

  it("puts the student's own lesson answers into the instructions", () => {
    const { instruction } = buildRequestInstruction([{ role: "user", text: "شلون أكتب إعلاني؟" }], {
      lessonNotes: "الفصل 1، الدرس 1 (اكتب جملة زبونك):\n- منو زبونك؟ موظف ببغداد",
    });
    expect(instruction).toContain("طبقها على منتجك");
    expect(instruction).toContain("موظف ببغداد");
  });

  it("tells the advisor when it is answering a free trial question, and never to sell", () => {
    const { instruction } = buildRequestInstruction([{ role: "user", text: "ليش ماكو طلبات؟" }], { trial: { n: 3, of: 3 } });
    expect(instruction).toContain("السؤال رقم 3 من 3");
    expect(instruction).toContain("لا تبيع");
    expect(instruction).toContain("آخر سؤال مجاني");
    expect(buildRequestInstruction([{ role: "user", text: "سؤال" }], {}).instruction).not.toContain("تجربة مجانية");
  });
});

function scriptedClient(steps: Array<(req: any) => AsyncIterable<{ text: string }> | Promise<never>>) {
  const calls: any[] = [];
  return {
    calls,
    client: {
      models: {
        generateContentStream: async (req: any) => {
          calls.push(req);
          const step = steps[Math.min(calls.length - 1, steps.length - 1)];
          return step(req);
        },
      },
    } as never,
  };
}
const chunks = (...parts: string[]) => async function* () { for (const p of parts) yield { text: p }; };
const breaksAfter = (...parts: string[]) => async function* () {
  for (const p of parts) yield { text: p };
  throw new Error("Incomplete JSON segment at the end");
};
const hangs = () => (req: any) =>
  (async function* () {
    await new Promise((_, reject) => req.config.abortSignal.addEventListener("abort", () => reject(new Error("aborted"))));
    yield { text: "" };
  })();

describe("Advisor resilience", () => {
  it("resumes an answer that breaks mid-stream instead of failing", async () => {
    const { client, calls } = scriptedClient([() => breaksAfter("أول ", "جزء")(), () => chunks(" وبعدين", " الباقي")()]);
    const deltas: string[] = [];
    const r = await runAdvisor([{ role: "user", text: "سؤال" }], {}, (t) => deltas.push(t), undefined, client);
    expect(r.text).toBe("أول جزء وبعدين الباقي");
    expect(deltas.join("")).toBe(r.text);
    const resumed = calls[1].contents;
    expect(resumed[resumed.length - 2]).toMatchObject({ role: "model" });
    expect(JSON.stringify(resumed[resumed.length - 1])).toContain("كمل من آخر كلمة");
  });

  it("moves to the next model when the first one is too slow to start", async () => {
    const { client, calls } = scriptedClient([hangs(), () => chunks("جواب سريع")()]);
    const r = await runAdvisor([{ role: "user", text: "سؤال" }], {}, () => {}, undefined, client, { firstTokenMs: 3000 });
    expect(r.text).toBe("جواب سريع");
    expect(calls[1].model).not.toBe(calls[0].model);
  }, 10000);

  it("steps the thinking level down (minimal, then low, then none) when a model rejects it", async () => {
    const reject = async () => {
      throw new Error("400 INVALID_ARGUMENT: Thinking level is not supported for this model.");
    };
    const { client, calls } = scriptedClient([reject, reject, () => chunks("تمام")()]);
    const r = await runAdvisor([{ role: "user", text: "سؤال" }], {}, () => {}, undefined, client);
    expect(r.text).toBe("تمام");
    expect(calls[0].config.thinkingConfig.thinkingLevel).toBe("MINIMAL");
    expect(calls[1].config.thinkingConfig.thinkingLevel).toBe("LOW");
    expect(calls[2].config.thinkingConfig).toBeUndefined();
    expect(new Set(calls.map((c: any) => c.model)).size).toBe(1);
  });

  it("uses minimal thinking for quick questions and low thinking for heavier ones", () => {
    expect(thinkingLevelFor([{ role: "user", text: "شنو أحسن وقت للنشر؟" }], {})).toBe("MINIMAL");
    expect(thinkingLevelFor([{ role: "user", text: "احسبلي الربح إذا السعر 35 ألف" }], {})).toBe("LOW");
    expect(thinkingLevelFor([{ role: "user", text: "شوف", images: [{ mimeType: "image/png", data: "x" }] }], {})).toBe("LOW");
  });

  it("stops cleanly before the server deadline and flags the answer as truncated", async () => {
    const slow = (req: any) =>
      (async function* () {
        for (let i = 0; ; i++) {
          if (req.config.abortSignal.aborted) throw new Error("aborted");
          await new Promise((r) => setTimeout(r, 20));
          yield { text: `${i} ` };
        }
      })();
    const { client } = scriptedClient([slow]);
    const r = await runAdvisor([{ role: "user", text: "سؤال" }], {}, () => {}, undefined, client, { deadlineMs: 1200, firstTokenMs: 1000 });
    expect(r.truncated).toBe(true);
    expect(r.text.length).toBeGreaterThan(5);
  });

  it("continues from text the browser already has", async () => {
    const { client, calls } = scriptedClient([() => chunks(" والباقي")()]);
    const r = await runAdvisor([{ role: "user", text: "سؤال" }], { continueFrom: "النص الأول" }, () => {}, undefined, client);
    expect(r.text).toBe(" والباقي");
    expect(JSON.stringify(calls[0].contents)).toContain("النص الأول");
  });
});
