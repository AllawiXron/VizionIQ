/**
 * Browser side of the advisor stream. Reads NDJSON events from
 * /api/advisor/chat and reports text as it arrives. Falls back to the old
 * JSON response shape transparently (e.g. if a proxy buffers the stream or
 * an older server answers).
 */
import type { BusinessProfile } from "./profile";

export interface AdvisorImagePayload {
  mimeType: string;
  data: string;
}

export interface AdvisorRequest {
  messages: { role: "user" | "assistant"; text: string; topicId?: string; images?: AdvisorImagePayload[]; hadImages?: boolean }[];
  requestId: string;
  topicContext?: string;
  isNewTopic?: boolean;
  diagnosticProfile?: unknown;
  userContext?: unknown;
  profile?: BusinessProfile;
  /** Answer text already on screen; the server continues after it. */
  continueFrom?: string;
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  signal: AbortSignal;
}

export interface StreamOutcome {
  text: string;
  requestId?: string;
  fallback?: boolean;
  /** Set when the stream failed after some text had already arrived. */
  error?: string;
  /** The server stopped near its time limit; ask for a continuation. */
  truncated?: boolean;
  /** The connection ended without a "done" event (e.g. the platform cut it). */
  cut?: boolean;
}

export class AdvisorHttpError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export async function streamAdvisor(body: AdvisorRequest, { onDelta, signal }: StreamHandlers): Promise<StreamOutcome> {
  const res = await fetch("/api/advisor/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Request-ID": body.requestId },
    body: JSON.stringify({ ...body, stream: true }),
    signal,
  });

  const type = res.headers.get("content-type") || "";
  if (!type.includes("ndjson")) {
    const raw = await res.text();
    let data: { reply?: string; error?: string; requestId?: string; fallback?: boolean } = {};
    try {
      data = JSON.parse(raw);
    } catch {
      /* not JSON */
    }
    if (!res.ok || !data.reply) throw new AdvisorHttpError(data.error || `تعذر الحصول على رد (${res.status}).`, res.status);
    onDelta(data.reply);
    return { text: data.reply, requestId: data.requestId, fallback: data.fallback };
  }

  if (!res.body) throw new AdvisorHttpError("المتصفح ما يدعم استقبال الرد.", 500);
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let sawEnd = false;
  const outcome: StreamOutcome = { text: "" };

  const handle = (line: string) => {
    if (!line.trim()) return;
    let ev: { t: string; v?: string; requestId?: string; fallback?: boolean; truncated?: boolean };
    try {
      ev = JSON.parse(line);
    } catch {
      return;
    }
    if (ev.t === "delta" && ev.v) {
      text += ev.v;
      onDelta(ev.v);
    } else if (ev.t === "start" || ev.t === "done") {
      outcome.requestId = ev.requestId ?? outcome.requestId;
      if (ev.fallback) outcome.fallback = true;
      if (ev.t === "done") {
        sawEnd = true;
        if (ev.truncated) outcome.truncated = true;
      }
    } else if (ev.t === "error") {
      sawEnd = true;
      if (!text && !body.continueFrom) throw new AdvisorHttpError(ev.v || "صار خلل بالمستشار.", 500);
      outcome.error = ev.v || "انقطع الرد.";
    }
  };

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let nl: number;
    while ((nl = buffer.indexOf("\n")) >= 0) {
      handle(buffer.slice(0, nl));
      buffer = buffer.slice(nl + 1);
    }
  }
  handle(buffer + decoder.decode());
  outcome.text = text;
  if (!sawEnd) outcome.cut = true;
  if (!text && !outcome.error && !body.continueFrom) {
    throw new AdvisorHttpError(sawEnd ? "وصل رد فارغ من المستشار. جرّب مرة ثانية." : "انقطع الاتصال قبل لا يوصل الجواب. جرّب مرة ثانية.", 500);
  }
  return outcome;
}
