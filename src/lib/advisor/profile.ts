/**
 * The merchant's business profile ("ملف مشروعي"): what the advisor knows
 * about this person's shop. It is filled in by the merchant or learned from
 * the conversation (the model emits [PROFILE: key=value | ...]) and sent with
 * every question, so answers are about *their* numbers, not generic ones.
 *
 * Shared by the browser and the server — no Node or DOM APIs here.
 */

export type ProfileFieldKind = "text" | "iqd" | "usd" | "percent" | "number" | "choice";

export interface ProfileField {
  key: keyof BusinessProfile;
  label: string;
  kind: ProfileFieldKind;
  placeholder?: string;
  options?: string[];
  group: "shop" | "numbers" | "ads" | "goals";
}

export interface BusinessProfile {
  businessName?: string;
  product?: string;
  niche?: string;
  city?: string;
  stage?: string;
  price?: number;
  productCost?: number;
  deliveryCost?: number;
  platform?: string;
  dailyBudget?: number;
  costPerMessage?: number;
  closeRate?: number;
  returnRate?: number;
  ordersPerDay?: number;
  mainProblem?: string;
  goal?: string;
}

export const PROFILE_FIELDS: ProfileField[] = [
  { key: "businessName", label: "اسم الصفحة / المشروع", kind: "text", placeholder: "مثلاً: متجر نور", group: "shop" },
  { key: "product", label: "المنتج الأساسي", kind: "text", placeholder: "مثلاً: ساعات رجالية", group: "shop" },
  { key: "niche", label: "المجال", kind: "text", placeholder: "إكسسوارات، ملابس، عناية…", group: "shop" },
  { key: "city", label: "المدينة / التغطية", kind: "text", placeholder: "بغداد + المحافظات", group: "shop" },
  { key: "stage", label: "مرحلة المشروع", kind: "choice", options: ["بعدني فكرة", "بديت وماكو مبيعات ثابتة", "عندي مبيعات يومية", "دا أكبّر الشغل"], group: "shop" },
  { key: "price", label: "سعر البيع", kind: "iqd", placeholder: "35000", group: "numbers" },
  { key: "productCost", label: "كلفة المنتج", kind: "iqd", placeholder: "15000", group: "numbers" },
  { key: "deliveryCost", label: "كروة التوصيل", kind: "iqd", placeholder: "5000", group: "numbers" },
  { key: "returnRate", label: "نسبة الراجع", kind: "percent", placeholder: "12", group: "numbers" },
  { key: "platform", label: "منصة الإعلان", kind: "choice", options: ["فيسبوك وانستغرام", "تيك توك", "الاثنين", "ما دا أعلن"], group: "ads" },
  { key: "dailyBudget", label: "الميزانية اليومية", kind: "usd", placeholder: "20", group: "ads" },
  { key: "costPerMessage", label: "كلفة الرسالة", kind: "usd", placeholder: "1.5", group: "ads" },
  { key: "closeRate", label: "نسبة الإغلاق (من الرسايل)", kind: "percent", placeholder: "10", group: "ads" },
  { key: "ordersPerDay", label: "الطلبات باليوم", kind: "number", placeholder: "5", group: "ads" },
  { key: "mainProblem", label: "أكبر مشكلة هسة", kind: "text", placeholder: "رسايل هواية وطلبات قليلة", group: "goals" },
  { key: "goal", label: "الهدف خلال 30 يوم", kind: "text", placeholder: "20 طلب باليوم بربح صافي", group: "goals" },
];

const FIELD_BY_KEY = new Map(PROFILE_FIELDS.map((f) => [f.key, f]));
const NUMERIC: ProfileFieldKind[] = ["iqd", "usd", "percent", "number"];

/** "35,000" / "٣٥ ألف" / "35k" / "1.5$" → number. */
export function parseNumber(raw: string): number | undefined {
  if (!raw) return undefined;
  let s = raw
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/٫/g, ".")
    .replace(/[,،٬\s]/g, "")
    .toLowerCase();
  let mult = 1;
  if (/(الف|ألف|آلاف|الاف|k)$/.test(s)) {
    mult = 1000;
    s = s.replace(/(الف|ألف|آلاف|الاف|k)$/, "");
  }
  const m = s.match(/-?\d+(\.\d+)?/);
  if (!m) return undefined;
  const n = parseFloat(m[0]) * mult;
  return Number.isFinite(n) ? n : undefined;
}

export function profileFilledCount(p: BusinessProfile): number {
  return PROFILE_FIELDS.filter((f) => p[f.key] !== undefined && p[f.key] !== "").length;
}

/** Keeps only known keys with sane values (protects the prompt from junk). */
export function sanitizeProfile(input: unknown): BusinessProfile {
  if (!input || typeof input !== "object") return {};
  const out: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(input as Record<string, unknown>)) {
    const field = FIELD_BY_KEY.get(k as keyof BusinessProfile);
    if (!field || v === undefined || v === null || v === "") continue;
    if (NUMERIC.includes(field.kind)) {
      const n = typeof v === "number" ? v : parseNumber(String(v));
      if (n !== undefined && n >= 0 && n < 1e9) out[k] = n;
    } else {
      const s = String(v).replace(/[\[\]\n\r|]/g, " ").trim().slice(0, 140);
      if (s) out[k] = s;
    }
  }
  return out as BusinessProfile;
}

export function formatProfileValue(field: ProfileField, v: string | number): string {
  if (typeof v !== "number") return v;
  switch (field.kind) {
    case "iqd":
      return `${Math.round(v).toLocaleString("en-US")} د.ع`;
    case "usd":
      return `$${v}`;
    case "percent":
      return `${v}%`;
    default:
      return String(v);
  }
}

/** Profile rendered for the system prompt. Empty string when nothing is known. */
export function formatProfileForPrompt(p: BusinessProfile): string {
  const lines = PROFILE_FIELDS.filter((f) => p[f.key] !== undefined).map((f) => `- ${f.label} (${f.key}): ${formatProfileValue(f, p[f.key] as string | number)}`);
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Tags emitted by the model                                           */
/* ------------------------------------------------------------------ */

const SUGGESTIONS_RE = /\[SUGGESTIONS:\s*([\s\S]*?)\]/gi;
const PROFILE_RE = /\[PROFILE:\s*([\s\S]*?)\]/gi;

/** Profile updates the model inferred from what the merchant said. */
export function parseProfileTags(text: string): BusinessProfile {
  const raw: Record<string, string> = {};
  for (const m of text.matchAll(PROFILE_RE)) {
    for (const pair of m[1].split("|")) {
      const i = pair.indexOf("=");
      if (i <= 0) continue;
      raw[pair.slice(0, i).trim()] = pair.slice(i + 1).trim();
    }
  }
  return sanitizeProfile(raw);
}

export function parseSuggestionTags(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(SUGGESTIONS_RE)) {
    for (const s of m[1].split("|")) {
      const t = s.trim();
      if (t && out.length < 4) out.push(t);
    }
  }
  return out;
}

/**
 * Text without machine tags. While streaming, a tag that has started but not
 * closed yet is hidden too, so "[SUGGES…" never flashes on screen.
 */
export function stripAdvisorTags(text: string, streaming = false): string {
  let out = text.replace(SUGGESTIONS_RE, "").replace(PROFILE_RE, "");
  if (streaming) {
    const i = out.lastIndexOf("[");
    if (i >= 0) {
      const tail = out.slice(i);
      if (!tail.includes("]") && ("[SUGGESTIONS:".startsWith(tail.slice(0, 13)) || "[PROFILE:".startsWith(tail.slice(0, 9)))) {
        out = out.slice(0, i);
      }
    }
  }
  return out.replace(/\n{3,}/g, "\n\n").trimEnd();
}

/** Human summary of what changed, for the "updated your profile" chip. */
export function describeProfileUpdate(update: BusinessProfile): string[] {
  return PROFILE_FIELDS.filter((f) => update[f.key] !== undefined).map((f) => `${f.label}: ${formatProfileValue(f, update[f.key] as string | number)}`);
}
