import { useSyncExternalStore } from "react";

const texts = new Map<string, string>();
const listeners = new Map<string, Set<() => void>>();

export function setStreamText(id: string, text: string) {
  if (texts.get(id) === text) return;
  texts.set(id, text);
  listeners.get(id)?.forEach((l) => l());
}

export function clearStreamText(id: string) {
  texts.delete(id);
  listeners.get(id)?.forEach((l) => l());
}

export function getStreamText(id: string): string {
  return texts.get(id) ?? "";
}

export function useStreamText(id: string): string {
  return useSyncExternalStore(
    (cb) => {
      let set = listeners.get(id);
      if (!set) listeners.set(id, (set = new Set()));
      set.add(cb);
      return () => {
        set!.delete(cb);
        if (set!.size === 0) listeners.delete(id);
      };
    },
    () => texts.get(id) ?? "",
    () => ""
  );
}

export function revealUpTo(full: string, shown: number, waitedMs: number, maxWaitMs = 280): number {
  if (full.length <= shown) return shown;
  if (waitedMs >= maxWaitMs) {
    const lastSpace = full.lastIndexOf(" ");
    return lastSpace > shown ? lastSpace + 1 : full.length;
  }
  const pending = full.slice(shown);
  const re = /[\n.!?؟،:]\s|\n/g;
  let end = -1;
  let m: RegExpExecArray | null;
  while ((m = re.exec(pending))) end = m.index + m[0].length;
  return end > 0 ? shown + end : shown;
}
