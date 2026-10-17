/**
 * The free trial: what it opens, and the first-visit diagnosis a trial member
 * fills in (kept in localStorage so Home and the paywall can speak to their
 * own project).
 */
import { useSyncExternalStore } from "react";

/** Chapters a trial member can start (first section, first example, first message, the chapter tool). */
export const TRIAL_CHAPTERS = ["chapter1", "chapter2"];
export const isTrialChapter = (id: string) => TRIAL_CHAPTERS.includes(id);

export type TrialStage = "idea" | "starting" | "selling";

export interface TrialProfile {
  category: string;
  stage: TrialStage;
  /** Playbook id of the problem they picked. */
  problem: string;
  price: number;
  cost: number;
  delivery: number;
  messageCost: number;
  /** Orders out of every 10 conversations. */
  closeOf10: number;
  returnPct: number;
  /** Fields they left on our estimate ("ما أعرف"). */
  estimated: string[];
  doneAt: number;
}

export const TRIAL_CATEGORIES = [
  "ملابس وأحذية",
  "مكياج وعناية",
  "عطور",
  "إكسسوارات وساعات",
  "أدوات منزلية",
  "إلكترونيات",
  "أطفال وألعاب",
  "غيرها",
];

export const TRIAL_STAGES: { id: TrialStage; label: string }[] = [
  { id: "idea", label: "بعده فكرة، ما بديت" },
  { id: "starting", label: "بديت، بس البيع ضعيف" },
  { id: "selling", label: "أبيع، وأريد أكبّر" },
];

/** The problems, in the merchant's words, each opening one playbook. */
export const TRIAL_PROBLEMS: { id: string; icon: string; label: string }[] = [
  { id: "ghosting", icon: "👻", label: "يسألون «بيش؟» وبعدين يختفون" },
  { id: "message-cost", icon: "💸", label: "الرسالة غالية والإعلان ياكل فلوسي" },
  { id: "returns", icon: "📦", label: "الطلبات ترجع وأدفع التوصيل" },
  { id: "more-sales", icon: "📈", label: "أريد أبيع أكثر بدون ما أزيد الإعلان" },
  { id: "scale", icon: "🎯", label: "ما أعرف إعلاني رابح لو لا" },
  { id: "product", icon: "🔎", label: "ما أعرف شنو أبيع" },
];

/** The course's own defaults (same as the playbook calculators). */
export const TRIAL_DEFAULTS = { price: 35000, cost: 12000, delivery: 5000, messageCost: 1500, closeOf10: 1, returnPct: 20 };

const KEY = "vz_trial_profile";
const listeners = new Set<() => void>();
let cache: { raw: string | null; value: TrialProfile | null } | null = null;

function read(): TrialProfile | null {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    raw = null;
  }
  if (cache && cache.raw === raw) return cache.value;
  let value: TrialProfile | null = null;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed.price === "number" && typeof parsed.problem === "string") value = parsed as TrialProfile;
  } catch {
    value = null;
  }
  cache = { raw, value };
  return value;
}

export function saveTrialProfile(profile: TrialProfile) {
  try {
    localStorage.setItem(KEY, JSON.stringify(profile));
  } catch {
    // Storage unavailable (private mode): the result lives for this visit only.
    cache = { raw: null, value: profile };
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTrialProfile(): TrialProfile | null {
  return useSyncExternalStore(subscribe, read, () => null);
}

export interface Diagnosis {
  /** What most sellers count as profit: price minus product cost. */
  thinks: number;
  /** Ad cost for one order: message cost ÷ orders per message. */
  cpa: number;
  /** Margin lost on the share of orders that come back. */
  returnLoss: number;
  /** Real profit per order, after delivery, ads and returns. */
  real: number;
  /** Same product and same ad, replying better and confirming orders. */
  better: number;
  betterCloseOf10: number;
  betterReturnPct: number;
}

/**
 * Per order, the playbooks' model: (1 − returns) × (price − cost) − delivery − ad cost per order.
 * "better" doubles the orders per 10 conversations (up to 5) and brings returns down to 10%.
 */
export function diagnose(p: Pick<TrialProfile, "price" | "cost" | "delivery" | "messageCost" | "closeOf10" | "returnPct">): Diagnosis {
  const margin = p.price - p.cost;
  const r = Math.min(95, Math.max(0, p.returnPct)) / 100;
  const close = Math.min(10, Math.max(0.5, p.closeOf10)) / 10;
  const cpa = p.messageCost / close;
  const returnLoss = r * margin;
  const real = margin - returnLoss - p.delivery - cpa;

  const betterCloseOf10 = Math.min(5, Math.max(p.closeOf10, p.closeOf10 * 2));
  const betterReturnPct = Math.min(p.returnPct, 10);
  const better = (1 - betterReturnPct / 100) * margin - p.delivery - p.messageCost / (betterCloseOf10 / 10);

  return { thinks: margin, cpa, returnLoss, real, better, betterCloseOf10, betterReturnPct };
}

/** "35,000" with the digits kept left-to-right inside Arabic text. */
export const iqd = (n: number) => `⁦${Math.round(n).toLocaleString("en-US")}⁩`;
