/**
 * Per-member reading progress: which chapters are finished and which one was
 * opened last. Kept in localStorage and shared by every screen through a
 * small subscribable store.
 */
import { useSyncExternalStore } from "react";
import { chaptersList } from "../data/chaptersData";

export interface CourseProgress {
  done: string[];
  last: string | null;
}

const EMPTY: CourseProgress = { done: [], last: null };
const listeners = new Set<() => void>();
const cache = new Map<string, CourseProgress>();

const storageKey = (userCode: string) => `vz_progress_${userCode || "guest"}`;

function read(userCode: string): CourseProgress {
  const cached = cache.get(userCode);
  if (cached) return cached;
  let value = EMPTY;
  try {
    const raw = localStorage.getItem(storageKey(userCode));
    if (raw) {
      const parsed = JSON.parse(raw);
      value = {
        done: Array.isArray(parsed.done) ? parsed.done.filter((id: unknown) => typeof id === "string") : [],
        last: typeof parsed.last === "string" ? parsed.last : null,
      };
    }
  } catch {
    value = EMPTY;
  }
  cache.set(userCode, value);
  return value;
}

function write(userCode: string, next: CourseProgress) {
  cache.set(userCode, next);
  try {
    localStorage.setItem(storageKey(userCode), JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode): progress lives for this visit only.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function setChapterDone(userCode: string, id: string, done: boolean) {
  const current = read(userCode);
  const has = current.done.includes(id);
  if (has === done) return;
  write(userCode, { ...current, done: done ? [...current.done, id] : current.done.filter((d) => d !== id) });
}

export function setLastChapter(userCode: string, id: string) {
  const current = read(userCode);
  if (current.last === id) return;
  write(userCode, { ...current, last: id });
}

export function useCourseProgress(userCode: string): CourseProgress {
  return useSyncExternalStore(subscribe, () => read(userCode), () => EMPTY);
}

/** The chapter a member should open next: the last one opened if unfinished, else the first unfinished. */
export function nextChapterId(progress: CourseProgress): string | null {
  const done = new Set(progress.done);
  if (progress.last && !done.has(progress.last)) return progress.last;
  const startAt = progress.last ? chaptersList.findIndex((c) => c.id === progress.last) + 1 : 0;
  const ordered = [...chaptersList.slice(startAt), ...chaptersList.slice(0, startAt)];
  return ordered.find((c) => !done.has(c.id))?.id ?? null;
}

/** The four learning stages the 11 chapters are grouped into. */
export const CHAPTER_STAGES = [
  { id: "foundation", label: "التأسيس والسوق", chapters: ["chapter1", "chapter2", "chapter3"] },
  { id: "marketing", label: "الإعلانات والمحتوى", chapters: ["chapter4", "chapter5", "chapter6"] },
  { id: "sales", label: "المبيعات والتوصيل", chapters: ["chapter7", "chapter8", "chapter9"] },
  { id: "scaling", label: "التحليل والتوسع", chapters: ["chapter10", "chapter11"] },
] as const;

export function stageOf(chapterId: string) {
  const index = CHAPTER_STAGES.findIndex((s) => (s.chapters as readonly string[]).includes(chapterId));
  return index >= 0 ? { index, stage: CHAPTER_STAGES[index] } : null;
}

/* ------------------------------------------------------------------ */
/* Playbook 7-day plans: which days are ticked, per member             */
/* ------------------------------------------------------------------ */

type PlanState = Record<string, number[]>;
const EMPTY_PLANS: PlanState = {};
const planCache = new Map<string, PlanState>();
const plansKey = (userCode: string) => `vz_plans_${userCode || "guest"}`;

function readPlans(userCode: string): PlanState {
  const cached = planCache.get(userCode);
  if (cached) return cached;
  let value = EMPTY_PLANS;
  try {
    const raw = localStorage.getItem(plansKey(userCode));
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && typeof parsed === "object") {
      value = Object.fromEntries(
        Object.entries(parsed).map(([id, days]) => [id, Array.isArray(days) ? days.filter((d): d is number => Number.isInteger(d)) : []])
      );
    }
  } catch {
    value = EMPTY_PLANS;
  }
  planCache.set(userCode, value);
  return value;
}

export function togglePlanDay(userCode: string, playbookId: string, day: number) {
  const current = readPlans(userCode);
  const days = current[playbookId] ?? [];
  const next = { ...current, [playbookId]: days.includes(day) ? days.filter((d) => d !== day) : [...days, day] };
  planCache.set(userCode, next);
  try {
    localStorage.setItem(plansKey(userCode), JSON.stringify(next));
  } catch {
    // Storage unavailable: ticks last for this visit only.
  }
  listeners.forEach((l) => l());
}

export function usePlaybookPlans(userCode: string): PlanState {
  return useSyncExternalStore(subscribe, () => readPlans(userCode), () => EMPTY_PLANS);
}
