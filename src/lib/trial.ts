import { useSyncExternalStore } from "react";

export const TRIAL_CHAPTERS = ["chapter1", "chapter2"];
export const isTrialChapter = (id: string) => TRIAL_CHAPTERS.includes(id);

export type TrialStage = "idea" | "starting" | "selling";

export interface TrialProfile {
  category: string;
  stage: TrialStage;
  problem: string;
  price: number;
  cost: number;
  delivery: number;
  messageCost: number;
  closeOf10: number;
  returnPct: number;
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
  { id: "selling", label: "أبيع، وأريد أكبر" },
];

export const TRIAL_PROBLEMS: { id: string; label: string }[] = [
  { id: "ghosting", label: "يسألون بيش؟ وبعدين يختفون" },
  { id: "message-cost", label: "الرسالة غالية والإعلان ياكل فلوسي" },
  { id: "returns", label: "الطلبات ترجع وأدفع التوصيل" },
  { id: "more-sales", label: "أريد أبيع أكثر بدون ما أزيد الإعلان" },
  { id: "scale", label: "ما أعرف إعلاني رابح لو لا" },
  { id: "product", label: "ما أعرف شنو أبيع" },
];

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
  thinks: number;
  cpa: number;
  returnLoss: number;
  real: number;
  better: number;
  betterCloseOf10: number;
  betterReturnPct: number;
}

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

export const iqd = (n: number) => `⁦${Math.round(n).toLocaleString("en-US")}⁩`;
