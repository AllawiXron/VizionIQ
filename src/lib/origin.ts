/**
 * Spatial continuity, the way iOS opens apps: a sheet grows out of the exact
 * control that summoned it and shrinks back into it when dismissed.
 *
 * One capture-phase listener remembers the bounding box of the last pressed
 * control (pointer or keyboard). Sheets read it the moment they open and turn
 * it into a transform from that box to their resting place, blurred in flight
 * and sharpening as they land.
 */
import { useMemo } from "react";
import { useReducedMotion } from "motion/react";
import { EASE_OUT, sheetMotion } from "./motion";

interface Origin {
  x: number;
  y: number;
  w: number;
  h: number;
  t: number;
}

let lastOrigin: Origin | null = null;

const CONTROL = "button, a, [role='button'], summary";

function remember(el: Element | null) {
  const target = el?.closest?.(CONTROL) as HTMLElement | null;
  if (!target) return;
  const r = target.getBoundingClientRect();
  if (!r.width || !r.height) return;
  lastOrigin = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, t: performance.now() };
}

export function initOriginTracker(): () => void {
  if (typeof window === "undefined") return () => {};
  const onPointer = (e: PointerEvent) => remember(e.target as Element);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") remember(document.activeElement);
  };
  document.addEventListener("pointerdown", onPointer, { capture: true, passive: true });
  document.addEventListener("keydown", onKey, { capture: true, passive: true });
  return () => {
    document.removeEventListener("pointerdown", onPointer, { capture: true });
    document.removeEventListener("keydown", onKey, { capture: true });
  };
}

/** The last pressed control, if it was pressed recently enough to have caused this. */
export function takeOrigin(maxAgeMs = 2000): Origin | null {
  if (!lastOrigin || performance.now() - lastOrigin.t > maxAgeMs) return null;
  return lastOrigin;
}

interface OriginSheetOptions {
  /** Approximate rendered width of the sheet (px), used to size the starting scale. */
  width?: number;
  /** Where the sheet rests: centred in the viewport, or anchored to the bottom edge. */
  anchor?: "center" | "bottom";
  /** Approximate height for bottom-anchored sheets (px). */
  height?: number;
}

/**
 * Motion props for a sheet that opens from the control that summoned it.
 * Falls back to the standard rise-and-settle when there is no recent origin
 * (e.g. opened programmatically on load) or when reduced motion is on.
 */
export function useOriginSheet(isOpen: boolean, { width = 640, anchor = "center", height = 560 }: OriginSheetOptions = {}) {
  const reduce = useReducedMotion();
  return useMemo(() => {
    if (!isOpen || reduce || typeof window === "undefined") return sheetMotion;
    const origin = takeOrigin();
    if (!origin) return sheetMotion;

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const sheetW = Math.min(width, vw);
    const sheetH = Math.min(height, vh * 0.85);
    const restX = vw / 2;
    const restY = anchor === "bottom" ? vh - sheetH / 2 : vh / 2;
    const dx = origin.x - restX;
    const dy = origin.y - restY;
    const scale = Math.min(0.6, Math.max(0.14, Math.max(origin.w, origin.h * 1.6) / sheetW));

    const away = { opacity: 0, x: dx, y: dy, scale, filter: "blur(14px)" };
    return {
      initial: away,
      animate: {
        opacity: 1,
        x: 0,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
          // Position and size ride one lively spring; content sharpens as it lands.
          type: "spring",
          stiffness: 280,
          damping: 27,
          mass: 0.85,
          opacity: { duration: 0.18, ease: EASE_OUT },
          filter: { duration: 0.42, ease: EASE_OUT },
        },
      },
      exit: {
        ...away,
        filter: "blur(10px)",
        transition: {
          // Back into the control: quicker, critically damped (no bounce on the way out).
          type: "spring",
          stiffness: 420,
          damping: 40,
          mass: 0.8,
          opacity: { duration: 0.2, delay: 0.1, ease: EASE_OUT },
          filter: { duration: 0.24, ease: EASE_OUT },
        },
      },
    };
  }, [isOpen, reduce, width, anchor, height]);
}
