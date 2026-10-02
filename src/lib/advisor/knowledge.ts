/**
 * Course knowledge for the advisor: every chapter section, case study,
 * insight, swipe file and phone script is split into small chunks and
 * ranked against the merchant's question, so answers are grounded in what
 * the course actually teaches (and can point to the right chapter).
 */
import { chaptersDetailedMap, chaptersList, phoneScripts } from "../../data/chaptersData.js";
import { caseStudiesList } from "../../data/caseStudiesData.js";
import { insightsList } from "../../data/insightsData.js";
import { swipeFilesList } from "../../data/swipeFilesData.js";

export interface KnowledgeChunk {
  id: string;
  /** Human label shown to the model, e.g. "الفصل الثالث — سلم الأسعار". */
  source: string;
  chapterId?: string;
  text: string;
}

const MAX_CHUNK_CHARS = 1600;

/* ------------------------------------------------------------------ */
/* Arabic normalisation + tokenising                                   */
/* ------------------------------------------------------------------ */

export function normalizeArabic(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "") // diacritics + tatweel
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/گ/g, "ك")
    .replace(/چ/g, "ج")
    .replace(/ڤ/g, "ف")
    .replace(/پ/g, "ب")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

const STOPWORDS = new Set(
  (
    "و في من على الى الي عن ما لا لم لن شنو شلون اني انا انت انتو هو هي هم هذا هذه هاي هذي ذلك تلك كل مع بس يعني اذا لو او ثم حتى عند كيف ليش شكد اكو ماكو دا راح هل قد لقد كان كانت يكون تكون اللي الذي التي الذين بعد قبل فوق تحت بين عندي عنده عندك مال مالت مالتي هيج هيچ جدا كلش هواي هواية شي شيء اريد ابي احتاج ممكن لازم يمكن خلي خليني اعطيني اعطني سوي سويلي the and or of to a in is for"
  ).split(/\s+/)
);

/** Synonym groups: any token in a group is indexed as the group's key. */
const SYNONYMS: Record<string, string[]> = {
  رساله: ["رساله", "رسايل", "رسائل", "مسج", "مسجات", "ميسج", "استفسار", "استفسارات", "message", "messages", "cpm", "cpr"],
  اعلان: ["اعلان", "اعلانات", "اعلاني", "حمله", "حملات", "ads", "ad", "ممول", "تمويل", "بوست", "sponsored", "campaign"],
  راجع: ["راجع", "مرتجع", "مرتجعات", "ارجاع", "رجوع", "مردود", "كنسل", "الغاء", "رفض", "returns", "return"],
  سعر: ["سعر", "اسعار", "تسعير", "ثمن", "غالي", "رخيص", "price", "pricing"],
  ربح: ["ربح", "ارباح", "صافي", "هامش", "margin", "profit", "خساره", "خسران", "يخسر"],
  توصيل: ["توصيل", "مندوب", "كروه", "شحن", "delivery", "مناديب"],
  واتساب: ["واتساب", "واتس", "خاص", "whatsapp", "دردشه", "محادثه", "رد", "ردود"],
  زبون: ["زبون", "زباين", "زبائن", "عميل", "عملاء", "مشتري", "customer"],
  مبيعات: ["مبيعات", "بيع", "بيعه", "طلب", "طلبات", "اوردر", "orders", "order", "sales", "اغلاق", "يشتري"],
  تيكتوك: ["تيكتوك", "تيك", "توك", "tiktok"],
  فيسبوك: ["فيسبوك", "فيس", "ميتا", "انستغرام", "انستا", "انستكرام", "facebook", "instagram", "meta"],
  محتوى: ["محتوى", "فيديو", "فديو", "تصوير", "هوك", "hook", "كريتف", "creative", "ريلز", "reel"],
  عرض: ["عرض", "عروض", "باكيج", "بكج", "بكجات", "هديه", "هدايا", "bundle", "offer", "خصم"],
  استهداف: ["استهداف", "جمهور", "اهتمامات", "targeting", "audience", "محافظات"],
  منتج: ["منتج", "منتجات", "بضاعه", "سلعه", "product"],
  ميزانيه: ["ميزانيه", "صرف", "budget", "دولار", "انفاق"],
};
const SYN_INDEX = new Map<string, string>();
for (const [key, words] of Object.entries(SYNONYMS)) for (const w of words) SYN_INDEX.set(normalizeArabic(w), key);

function stem(token: string): string {
  let t = token;
  // Definite article and attached prepositions: "بالاعلان" → "اعلان".
  for (const p of ["وبال", "وال", "بال", "كال", "فال", "لل", "ال"]) {
    if (t.startsWith(p) && t.length - p.length >= 3) {
      t = t.slice(p.length);
      break;
    }
  }
  for (const s of ["ات", "ين", "ون", "ها", "هم", "كم"]) {
    if (t.endsWith(s) && t.length - s.length >= 3) {
      t = t.slice(0, -s.length);
      break;
    }
  }
  return t;
}

export function tokenize(text: string): string[] {
  const out: string[] = [];
  for (const raw of normalizeArabic(text).split(/[^a-z0-9ء-ي]+/)) {
    if (!raw || raw.length < 2 || STOPWORDS.has(raw)) continue;
    const direct = SYN_INDEX.get(raw);
    if (direct) {
      out.push(direct);
      continue;
    }
    const s = stem(raw);
    if (STOPWORDS.has(s)) continue;
    out.push(SYN_INDEX.get(s) ?? s);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Chunking the course                                                 */
/* ------------------------------------------------------------------ */

const clip = (s: string) => (s.length > MAX_CHUNK_CHARS ? `${s.slice(0, MAX_CHUNK_CHARS)}…` : s);

function chapterLabel(id: string) {
  const ch = chaptersList.find((c) => c.id === id);
  return ch ? `${ch.number}: ${ch.title}` : id;
}

function buildChunks(): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  for (const [id, ch] of Object.entries(chaptersDetailedMap)) {
    const label = chapterLabel(id);
    ch.coreFramework?.sections?.forEach((s, i) =>
      chunks.push({
        id: `${id}-core-${i}`,
        chapterId: id,
        source: `${label} — ${s.heading}`,
        text: clip([s.content, s.keyTakeaway && `الخلاصة: ${s.keyTakeaway}`, ...(s.bulletPoints ?? []).map((b) => `• ${b}`)].filter(Boolean).join("\n")),
      })
    );
    ch.deepDive?.sections?.forEach((s, i) =>
      chunks.push({
        id: `${id}-deep-${i}`,
        chapterId: id,
        source: `${label} — ${s.heading}`,
        text: clip([s.content, ...(s.examples ?? []).map((e) => `مثال: ${e}`)].join("\n")),
      })
    );
    if (ch.actionSteps?.length)
      chunks.push({
        id: `${id}-steps`,
        chapterId: id,
        source: `${label} — خطوات التطبيق`,
        text: clip(ch.actionSteps.map((a) => `${a.step}. ${a.title} (${a.timeframe}): ${a.description}`).join("\n")),
      });
    if (ch.commonMistakes?.length)
      chunks.push({
        id: `${id}-mistakes`,
        chapterId: id,
        source: `${label} — أخطاء شائعة`,
        text: clip(ch.commonMistakes.map((m) => `✗ ${m.mistake} — ليش يفشل: ${m.whyItFails} — الحل: ${m.fix}`).join("\n")),
      });
    if (ch.advancedTactics?.length)
      chunks.push({
        id: `${id}-tactics`,
        chapterId: id,
        source: `${label} — تكتيكات متقدمة`,
        text: clip(ch.advancedTactics.map((t) => `${t.title}: ${t.description} (الأثر: ${t.impact})`).join("\n")),
      });
  }
  for (const c of caseStudiesList) {
    chunks.push({
      id: `case-${c.id}`,
      chapterId: c.chapterId,
      source: `دراسة حالة: ${c.title} (${c.city})`,
      text: clip(
        [
          `المشكلة: ${c.theProblem}`,
          `قبل: ROAS ${c.beforeMetrics.roas}، CPA ${c.beforeMetrics.cpa}، راجع ${c.beforeMetrics.returnRate}، طلبات ${c.beforeMetrics.dailyOrders}`,
          `بعد: ROAS ${c.afterMetrics.roas}، CPA ${c.afterMetrics.cpa}، راجع ${c.afterMetrics.returnRate}، طلبات ${c.afterMetrics.dailyOrders}`,
          `النفسية: ${c.thePsychology}`,
          `العرض: ${c.theOfferStack.join("، ")}`,
          `هوك الإعلان: ${c.adCreativeHook}`,
          `سكريبت: ${c.whatsappScriptSnippet}`,
          `الدروس: ${c.keyLearnings.join("، ")}`,
        ].join("\n")
      ),
    });
  }
  for (const it of insightsList as Array<{ id: string; categoryLabel?: string; text: string; lesson?: string; practicalAction?: string }>) {
    chunks.push({
      id: `insight-${it.id}`,
      source: `خلاصة عراقية (${it.categoryLabel ?? "عام"})`,
      text: clip([it.text, it.lesson, it.practicalAction && `التطبيق: ${it.practicalAction}`].filter(Boolean).join("\n")),
    });
  }
  for (const s of swipeFilesList) {
    chunks.push({ id: `swipe-${s.id}`, chapterId: s.chapterId, source: `قالب جاهز: ${s.title}`, text: clip(`${s.description}\n${s.content}`) });
  }
  phoneScripts.forEach((p, i) =>
    chunks.push({
      id: `phone-${i}`,
      source: `سكريبت مكالمة: ${p.title}`,
      text: clip([`نوع الزبون: ${p.customerType}`, `النفسية: ${p.psychologyNote}`, ...p.dialog.map((d) => `${d.speaker}: ${d.text}`)].join("\n")),
    })
  );
  return chunks;
}

/* ------------------------------------------------------------------ */
/* Index + retrieval (BM25-style)                                      */
/* ------------------------------------------------------------------ */

interface Indexed {
  chunk: KnowledgeChunk;
  tf: Map<string, number>;
  titleTokens: Set<string>;
  len: number;
}

let INDEX: { docs: Indexed[]; df: Map<string, number>; avgLen: number } | null = null;

function getIndex() {
  if (INDEX) return INDEX;
  const docs: Indexed[] = buildChunks().map((chunk) => {
    const tokens = tokenize(`${chunk.source}\n${chunk.text}`);
    const tf = new Map<string, number>();
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
    return { chunk, tf, titleTokens: new Set(tokenize(chunk.source)), len: tokens.length };
  });
  const df = new Map<string, number>();
  for (const d of docs) for (const t of d.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
  const avgLen = docs.reduce((s, d) => s + d.len, 0) / Math.max(1, docs.length);
  INDEX = { docs, df, avgLen };
  return INDEX;
}

export function knowledgeSize() {
  return getIndex().docs.length;
}

/**
 * Most relevant course chunks for a question, within a character budget and
 * with at most two chunks from the same chapter (so answers stay broad).
 */
export function retrieveKnowledge(query: string, { k = 5, budgetChars = 6500 }: { k?: number; budgetChars?: number } = {}): KnowledgeChunk[] {
  const { docs, df, avgLen } = getIndex();
  const q = [...new Set(tokenize(query))];
  if (q.length === 0) return [];
  const N = docs.length;
  const k1 = 1.4;
  const b = 0.7;
  const scored = docs
    .map((d) => {
      let score = 0;
      for (const t of q) {
        const f = d.tf.get(t);
        if (!f) continue;
        const idf = Math.log(1 + (N - (df.get(t) ?? 0) + 0.5) / ((df.get(t) ?? 0) + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / avgLen)));
        if (d.titleTokens.has(t)) score += idf * 0.6;
      }
      return { d, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b2) => b2.score - a.score);

  const picked: KnowledgeChunk[] = [];
  const perChapter = new Map<string, number>();
  let used = 0;
  for (const { d } of scored) {
    if (picked.length >= k) break;
    const ch = d.chunk.chapterId ?? d.chunk.source;
    if ((perChapter.get(ch) ?? 0) >= 2) continue;
    if (used + d.chunk.text.length > budgetChars && picked.length > 0) continue;
    picked.push(d.chunk);
    used += d.chunk.text.length;
    perChapter.set(ch, (perChapter.get(ch) ?? 0) + 1);
  }
  return picked;
}

/** Chapter list for the prompt, generated from the real course data. */
export function chapterCatalog(): string {
  return chaptersList.map((c) => `- [[${c.id}]] ${c.number}: ${c.title} — ${c.subtitle}`).join("\n");
}
