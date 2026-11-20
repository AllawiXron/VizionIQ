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
  continueFrom?: string;
  /** the student's access code: the server answers paid codes only */
  code?: string;
  /** what the student wrote in the course's write-your-own steps */
  lessonNotes?: string;
  /** this phone's id, so the free trial is counted per phone */
  device?: string;
}

export interface StreamHandlers {
  onDelta: (text: string) => void;
  signal: AbortSignal;
}

export interface StreamOutcome {
  text: string;
  requestId?: string;
  fallback?: boolean;
  error?: string;
  truncated?: boolean;
  cut?: boolean;
  /** free trial: questions left after this answer */
  trialLeft?: number;
}

export class AdvisorHttpError extends Error {
  constructor(message: string, readonly status: number, readonly trialOver = false) {
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
    let data: { reply?: string; error?: string; requestId?: string; fallback?: boolean; trialOver?: boolean; trialLeft?: number } = {};
    try {
      data = JSON.parse(raw);
    } catch {
    }
    if (!res.ok || !data.reply) throw new AdvisorHttpError(data.error || `تعذر الحصول على رد (${res.status}).`, res.status, Boolean(data.trialOver));
    onDelta(data.reply);
    return { text: data.reply, requestId: data.requestId, fallback: data.fallback, trialLeft: data.trialLeft };
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
    let ev: { t: string; v?: string; requestId?: string; fallback?: boolean; truncated?: boolean; trialLeft?: number };
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
        if (typeof ev.trialLeft === "number") outcome.trialLeft = ev.trialLeft;
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
    throw new AdvisorHttpError(sawEnd ? "وصل رد فارغ من المستشار. جرب مرة ثانية." : "انقطع الاتصال قبل لا يوصل الجواب. جرب مرة ثانية.", 500);
  }
  return outcome;
}
