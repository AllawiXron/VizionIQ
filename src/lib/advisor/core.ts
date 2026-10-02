/**
 * The advisor's server side, shared by the Vercel function
 * (api/advisor/chat.ts) and the local Express server (server.ts).
 *
 * - Grounds every answer in the merchant's business profile and in the most
 *   relevant chunks of the course.
 * - Keeps a longer conversation window and accepts screenshots (vision).
 * - Streams the answer as NDJSON events ({"t":"delta"} … {"t":"done"}) so the
 *   chat shows words as they are written; falls back across models before the
 *   first token, and to the offline Iraqi fallback if every model is down.
 */
import { GoogleGenAI } from "@google/genai";
import { generateIraqiAdvisorFallback } from "../iraqiAdvisorFallback.js";
import { buildSystemInstruction } from "./prompt.js";
import { retrieveKnowledge } from "./knowledge.js";
import { formatProfileForPrompt, sanitizeProfile } from "./profile.js";

export const ADVISOR_MODELS = ["gemini-3.8-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];

/** How many recent messages the model sees (was 6). */
export const HISTORY_WINDOW = 16;
const MAX_IMAGES = 3;
const MAX_IMAGE_BASE64 = 2_800_000; // ~2 MB per image after base64
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export interface AdvisorImage {
  mimeType: string;
  data: string;
}

export interface ChatMessagePayload {
  role: "user" | "assistant" | "model";
  text: string;
  topicId?: string;
  images?: AdvisorImage[];
  /** Set on history messages that carried images (the bytes are not resent). */
  hadImages?: boolean;
}

export interface ChatOptions {
  userContext?: unknown;
  requestId?: string;
  topicContext?: string;
  isNewTopic?: boolean;
  diagnosticProfile?: unknown;
  profile?: unknown;
  /** Text already shown from an interrupted answer: resume after it. */
  continueFrom?: string;
}

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };
type Content = { role: "user" | "model"; parts: Part[] };

export function sanitizeMessageForHistory(text: string): string {
  if (!text) return "";
  return text
    .replace(/\[SUGGESTIONS:\s*[\s\S]*?\]/gi, "")
    .replace(/\[PROFILE:\s*[\s\S]*?\]/gi, "")
    .trim();
}

function validImages(images: unknown): AdvisorImage[] {
  if (!Array.isArray(images)) return [];
  return images
    .filter(
      (im): im is AdvisorImage =>
        !!im && typeof im === "object" && IMAGE_TYPES.has((im as AdvisorImage).mimeType) && typeof (im as AdvisorImage).data === "string" && (im as AdvisorImage).data.length > 0 && (im as AdvisorImage).data.length <= MAX_IMAGE_BASE64
    )
    .slice(0, MAX_IMAGES);
}

/**
 * Conversation turns for the model: recent window only, tags stripped,
 * images attached to the latest user message, consecutive same-role turns
 * merged (the API expects alternating roles).
 */
export function prepareCleanContents(messages: ChatMessagePayload[], options?: ChatOptions): Content[] {
  if (!messages || messages.length === 0) return [];
  const window = options?.isNewTopic ? [messages[messages.length - 1]] : messages.slice(-HISTORY_WINDOW);
  const lastUserIndex = window.map((m) => m?.role).lastIndexOf("user");

  const contents: Content[] = [];
  window.forEach((m, i) => {
    if (!m || typeof m.text !== "string") return;
    const role: Content["role"] = m.role === "user" ? "user" : "model";
    const images = i === lastUserIndex ? validImages(m.images) : [];
    let text = sanitizeMessageForHistory(m.text);
    if (role === "user" && i !== lastUserIndex && (m.hadImages || (m.images && m.images.length))) text = `${text}\n[أرفقت صورة بهذي الرسالة]`.trim();
    if (!text && images.length === 0) return;
    const parts: Part[] = [...images.map((im) => ({ inlineData: { mimeType: im.mimeType, data: im.data } })), { text: text || "حلل هذي الصورة وشخّصلي." }];
    const prev = contents[contents.length - 1];
    if (prev && prev.role === role) prev.parts.push(...parts);
    else contents.push({ role, parts });
  });
  // The conversation has to start with the user.
  while (contents.length && contents[0].role !== "user") contents.shift();
  return contents;
}

/** System instruction for this request: base prompt + profile + course excerpts. */
export function buildRequestInstruction(messages: ChatMessagePayload[], options: ChatOptions = {}) {
  const profile = sanitizeProfile(options.profile);
  const userTexts = messages.filter((m) => m?.role === "user").map((m) => m.text || "");
  // The last question plus the one before it, so follow-ups ("وضحلي أكثر") still find the topic.
  const query = [userTexts[userTexts.length - 1], userTexts[userTexts.length - 2], options.topicContext].filter(Boolean).join("\n");
  const chunks = retrieveKnowledge(query);
  const knowledge = chunks
    .map((c, i) => {
      const link = c.chapterId ?? c.linkId;
      return `【${i + 1}】 ${c.source}${link ? ` [[${link}]]` : ""}\n${c.text}`;
    })
    .join("\n\n");
  let extra = "";
  if (options.diagnosticProfile) extra += `نتائج فحص المشروع: ${JSON.stringify(options.diagnosticProfile).slice(0, 2000)}\n`;
  if (options.userContext) extra += `سياق المستخدم: ${JSON.stringify(options.userContext).slice(0, 500)}`;
  return {
    instruction: buildSystemInstruction({ profile: formatProfileForPrompt(profile), knowledge, topic: options.topicContext, extra: extra.trim() }),
    sources: chunks.map((c) => ({ id: c.id, source: c.source, chapterId: c.chapterId })),
  };
}

export function getGeminiClient() {
  const apiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error(
      "مفتاح GEMINI_API_KEY غير معرف في إعدادات البيئة. أضفه في Vercel > Settings > Environment Variables (أو ملف .env محلياً) ثم أعد النشر."
    );
  }
  return new GoogleGenAI({ apiKey, httpOptions: { headers: { "User-Agent": "aistudio-build" } } });
}

const errText = (err: unknown) => JSON.stringify((err as Error)?.message || err || "");
const isTransient = (err: unknown) =>
  /503|UNAVAILABLE|high demand|429|RESOURCE_EXHAUSTED|overloaded|deadline|Incomplete JSON|terminated|ECONNRESET|socket|fetch failed|network|aborted|timeout/i.test(errText(err));

export function friendlyError(err: unknown): string {
  const s = errText(err);
  if (/503|UNAVAILABLE|high demand|overloaded/i.test(s)) return "خوادم الذكاء الاصطناعي عليها ضغط مؤقت. اضغط 'إعادة المحاولة' بعد ثواني.";
  if (/429|RESOURCE_EXHAUSTED|Quota/i.test(s)) return "وصلنا الحد المؤقت للطلبات. انتظر شوية وأعد المحاولة.";
  if (/GEMINI_API_KEY/.test(s)) return (err as Error).message;
  if (/Incomplete JSON|terminated|ECONNRESET|socket|fetch failed|network|aborted|timeout/i.test(s)) return "انقطع الاتصال بالمستشار بنص الجواب. اضغط 'جواب جديد' أو أعد المحاولة.";
  return "تعذر الحصول على رد حالياً. جرّب مرة ثانية.";
}

export interface RunResult {
  text: string;
  model?: string;
  fallback?: boolean;
  aborted?: boolean;
  /** Ran out of server time mid-answer: the client should ask for a continuation. */
  truncated?: boolean;
}

/** Vercel kills the function at 60 s (vercel.json); finish cleanly before that. */
export const DEADLINE_MS = 50_000;
/** If a model hasn't written a word by then, move on to the next model. */
export const FIRST_TOKEN_MS = 20_000;
const MAX_CONTINUATIONS = 2;

/** Models that rejected thinkingConfig once are called without it from then on. */
const NO_THINKING_CONFIG = new Set<string>();

/** Turns that make the model resume a broken answer exactly where it stopped. */
export function continuationContents(contents: Content[], partial: string): Content[] {
  const tail = partial.slice(-160);
  return [
    ...contents,
    { role: "model", parts: [{ text: partial }] },
    {
      role: "user",
      parts: [
        {
          text: `انقطع جوابك هنا: «…${tail}». كمّل من آخر كلمة بالضبط، بدون أي مقدمة وبدون ما تعيد شي كتبته، وبنفس التنسيق (إذا كنت بنص بلوك \`\`\` كمّله وسكّره).`,
        },
      ],
    },
  ];
}

/**
 * Runs the advisor. `onDelta` receives text as it streams.
 * - Before the first word: transient failures and slow starts fall through
 *   to the next model, then to the offline Iraqi fallback.
 * - After words have streamed: a broken connection is resumed with a
 *   continuation request, so the merchant sees one uninterrupted answer.
 * - Near the server deadline it stops cleanly with `truncated` so the
 *   browser can request the rest.
 */
export async function runAdvisor(
  messages: ChatMessagePayload[],
  options: ChatOptions,
  onDelta: (text: string) => void,
  isAborted: () => boolean = () => false,
  client?: Pick<GoogleGenAI, "models">,
  timing: { deadlineMs?: number; firstTokenMs?: number } = {}
): Promise<RunResult> {
  const startedAt = Date.now();
  const budget = timing.deadlineMs ?? DEADLINE_MS;
  const deadline = startedAt + budget;
  // Time kept in hand to start another call / finish cleanly (6 s of the 50 s budget).
  const reserve = Math.min(6000, budget / 8);
  const firstTokenMs = timing.firstTokenMs ?? FIRST_TOKEN_MS;
  const base = prepareCleanContents(messages, options);
  if (base.length === 0) throw new Error("ماكو رسائل صالحة للإرسال للمستشار.");
  const { instruction } = buildRequestInstruction(messages, options);
  const ai = client ?? getGeminiClient();

  // Text already shown to the merchant (from an earlier, interrupted request).
  const prior = typeof options.continueFrom === "string" ? options.continueFrom.slice(-20_000) : "";
  let produced = "";
  let continuations = 0;
  let lastError: unknown = null;
  let lastModel: string | undefined;

  const contentsNow = () => (prior || produced ? continuationContents(base, prior + produced) : base);

  /** One streaming call. Resolves "done" | "truncated" | "aborted"; throws on failure. */
  const streamOnce = async (model: string): Promise<"done" | "truncated" | "aborted"> => {
    const controller = new AbortController();
    let gotText = false;
    let timedOut = false;
    const remaining = deadline - Date.now();
    const firstTimer = setTimeout(() => {
      if (!gotText) {
        timedOut = true;
        controller.abort();
      }
    }, Math.max(Math.min(3000, remaining / 2), Math.min(firstTokenMs, remaining - reserve)));
    const deadlineTimer = setTimeout(() => controller.abort(), Math.max(1000, remaining));
    const thinking = NO_THINKING_CONFIG.has(model) ? {} : { thinkingConfig: { thinkingLevel: "LOW" as never } };
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents: contentsNow(),
        config: { systemInstruction: instruction, temperature: 0.6, maxOutputTokens: 4096, abortSignal: controller.signal, ...thinking },
      });
      for await (const chunk of stream) {
        if (isAborted()) return "aborted";
        const t = chunk?.text;
        if (t) {
          gotText = true;
          produced += t;
          onDelta(t);
        }
      }
      return "done";
    } catch (err) {
      if (isAborted()) return "aborted";
      if (gotText && Date.now() >= deadline - Math.min(500, reserve)) return "truncated";
      if (timedOut) throw Object.assign(new Error(`timeout: no first token from ${model}`), { timeout: true });
      // A model that doesn't know thinkingConfig: remember and let the caller retry it plainly.
      if (!NO_THINKING_CONFIG.has(model) && /thinking/i.test(errText(err)) && /400|INVALID_ARGUMENT|not supported|Unknown name/i.test(errText(err))) {
        NO_THINKING_CONFIG.add(model);
        throw Object.assign(new Error("retry without thinking"), { retryPlain: true });
      }
      throw err;
    } finally {
      clearTimeout(firstTimer);
      clearTimeout(deadlineTimer);
    }
  };

  for (const model of ADVISOR_MODELS) {
    for (let attempt = 0; attempt < 3; attempt++) {
      if (Date.now() > deadline - reserve) break;
      lastModel = model;
      try {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 400 + Math.random() * 300));
        const outcome = await streamOnce(model);
        if (outcome === "aborted") return { text: produced, model, aborted: true };
        if (outcome === "truncated") return { text: produced, model, truncated: true };
        if (produced || prior) return { text: produced, model };
      } catch (err) {
        lastError = err;
        const e = err as { retryPlain?: boolean; timeout?: boolean; message?: string };
        console.warn(`[Advisor] ${model} attempt ${attempt + 1} failed:`, e?.message || err);
        if (e.retryPlain) continue;
        // Words already reached the merchant: resume instead of starting over.
        if (produced.length > 0) {
          if (continuations >= MAX_CONTINUATIONS) throw Object.assign(new Error(friendlyError(err)), { partial: produced });
          if (Date.now() > deadline - reserve * 1.3) return { text: produced, model, truncated: true };
          continuations++;
          continue;
        }
        if (e.timeout || !isTransient(err)) break;
      }
    }
    if (Date.now() > deadline - reserve) break;
  }

  if (produced) return { text: produced, model: lastModel, truncated: true };
  if (prior) throw new Error(friendlyError(lastError));

  const lastUser = [...messages].reverse().find((m) => m?.role === "user")?.text || "";
  try {
    const fb = generateIraqiAdvisorFallback(lastUser, { userQuery: lastUser, topicId: options.topicContext, diagnosticProfile: options.diagnosticProfile as never });
    if (fb) {
      onDelta(fb);
      return { text: fb, fallback: true };
    }
  } catch (e) {
    console.error("[Advisor] fallback failed:", e);
  }
  throw new Error(friendlyError(lastError));
}

/* ------------------------------------------------------------------ */
/* HTTP handler (Express and Vercel share it)                           */
/* ------------------------------------------------------------------ */

interface Req {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  on?: (event: string, cb: () => void) => void;
  socket?: { remoteAddress?: string };
}
interface Res {
  statusCode: number;
  setHeader(name: string, value: string): void;
  write(chunk: string): boolean;
  end(chunk?: string): void;
  flushHeaders?: () => void;
  writableEnded?: boolean;
  on?: (event: string, cb: () => void) => void;
}

/** Soft per-IP limit: protects the API key from abuse without bothering real merchants. */
const hits = new Map<string, number[]>();
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 60;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return list.length > RATE_MAX;
}

function sendJson(res: Res, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

export async function handleAdvisorRequest(req: Req, res: Res, client?: Pick<GoogleGenAI, "models">) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Request-ID");
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    return res.end();
  }
  if (req.method !== "POST") return sendJson(res, 405, { error: "Method not allowed" });

  let body = req.body as Record<string, unknown> | string | undefined;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = undefined;
    }
  }
  const b = (body || {}) as Record<string, unknown>;
  const requestId = String(req.headers["x-request-id"] || b.requestId || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`);
  res.setHeader("X-Request-ID", requestId);

  const fwd = req.headers["x-forwarded-for"];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
  if (rateLimited(ip)) return sendJson(res, 429, { error: "أسئلة هواية بوقت قصير. استراحة دقايق وارجع.", requestId });

  const messages = b.messages as ChatMessagePayload[] | undefined;
  if (!Array.isArray(messages) || messages.length === 0) return sendJson(res, 400, { error: "مصفوفة الرسائل مطلوبة.", requestId });

  const options: ChatOptions = {
    userContext: b.userContext,
    topicContext: typeof b.topicContext === "string" ? b.topicContext : undefined,
    isNewTopic: Boolean(b.isNewTopic),
    diagnosticProfile: b.diagnosticProfile,
    profile: b.profile,
    continueFrom: typeof b.continueFrom === "string" ? b.continueFrom : undefined,
    requestId,
  };

  let ai: Pick<GoogleGenAI, "models">;
  try {
    ai = client ?? getGeminiClient();
  } catch (e) {
    return sendJson(res, 500, { error: (e as Error).message, requestId });
  }

  // Non-streaming (older cached clients): same JSON shape as before.
  if (!b.stream) {
    try {
      const result = await runAdvisor(messages, options, () => {}, undefined, ai);
      return sendJson(res, 200, { reply: result.text, requestId, fallback: result.fallback || undefined, timestamp: new Date().toISOString() });
    } catch (e) {
      return sendJson(res, 500, { error: (e as Error).message, requestId });
    }
  }

  // The response (not the request) closes early only when the merchant hits
  // stop or leaves: Node fires the request's "close" as soon as its body is read.
  let aborted = false;
  res.on?.("close", () => {
    if (!res.writableEnded) aborted = true;
  });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/x-ndjson; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();
  const emit = (ev: Record<string, unknown>) => {
    if (!aborted) res.write(`${JSON.stringify(ev)}\n`);
  };
  emit({ t: "start", requestId });
  try {
    const result = await runAdvisor(messages, options, (text) => emit({ t: "delta", v: text }), () => aborted, ai);
    emit({ t: "done", requestId, fallback: result.fallback || undefined, truncated: result.truncated || undefined, model: result.model });
  } catch (e) {
    emit({ t: "error", v: (e as Error).message, partial: Boolean((e as { partial?: string }).partial), requestId });
  }
  res.end();
}

/** Non-streaming helper kept for older call sites. */
export async function handleAdvisorChat(messages: ChatMessagePayload[], options: ChatOptions = {}) {
  return (await runAdvisor(messages, options, () => {})).text;
}
