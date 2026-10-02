/**
 * Vizion motion language.
 *
 * One shared vocabulary of easings, springs and presets so every surface in
 * the interface moves the same way: quick response, a hint of overshoot,
 * soft settling. Durations stay short; nothing loops for attention.
 */
import type { Transition, Variants } from "motion/react";

/** Apple-style "ease out expo" curve used for every tweened transition. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
/** Symmetric curve for things that leave and return (e.g. cross-fades). */
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Snappy spring for controls: fast response, ~4% overshoot. */
export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 440, damping: 27, mass: 0.8 };
/** Default spring for surfaces (cards, sheets, nav): lively, ~3% overshoot. */
export const SPRING: Transition = { type: "spring", stiffness: 300, damping: 24, mass: 0.9 };
/** Playful spring for moments of delight (icon pops, success states): ~15% overshoot. */
export const SPRING_BOUNCY: Transition = { type: "spring", stiffness: 380, damping: 18, mass: 0.9 };
/** Soft spring for large, slow-settling elements and scroll smoothing. */
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 180, damping: 28, mass: 1 };

/** True on devices with a precise pointer that can hover (desktop). */
export const canHover = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)").matches === true;

/** Blur is costly on mobile GPUs; only use blur-in reveals on desktop. */
export const allowBlur = (): boolean =>
  typeof window !== "undefined" && window.matchMedia?.("(min-width: 768px)").matches === true;

/* ------------------------------------------------------------------ */
/* Overlays and sheets                                                */
/* ------------------------------------------------------------------ */

/** Backdrop: darkens and (via its constant backdrop-filter) blurs in. */
export const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.36, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.26, ease: EASE_OUT, delay: 0.04 } },
};

/** Centered sheet/modal: rises slightly and scales 0.96 → 1 on a spring. */
export const sheetMotion = {
  initial: { opacity: 0, y: 28, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 340, damping: 26, mass: 0.9, opacity: { duration: 0.3, ease: EASE_OUT } } },
  exit: { opacity: 0, y: 18, scale: 0.97, transition: { duration: 0.24, ease: EASE_OUT } },
};

/** Bottom sheet (mobile): slides from the bottom edge. */
export const bottomSheetMotion = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { type: "spring", stiffness: 340, damping: 34, mass: 0.9 } },
  exit: { y: "100%", transition: { duration: 0.3, ease: EASE_OUT } },
};

/** Dropdowns and popovers: fade, slight scale and drop, blur into focus. */
export const popoverMotion = {
  initial: { opacity: 0, y: -6, scale: 0.97, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { ...SPRING_SNAPPY, opacity: { duration: 0.2 }, filter: { duration: 0.24 } } },
  exit: { opacity: 0, y: -4, scale: 0.98, filter: "blur(4px)", transition: { duration: 0.16, ease: EASE_OUT } },
};

/** Toasts / notices dropping from the top. */
export const toastMotion = {
  initial: { opacity: 0, y: -16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: SPRING_BOUNCY },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2, ease: EASE_OUT } },
};

/** Collapsible content (accordions). */
export const collapseMotion = {
  initial: { opacity: 0, height: 0 },
  animate: { opacity: 1, height: "auto", transition: { height: { ...SPRING, stiffness: 360 }, opacity: { duration: 0.24, delay: 0.04 } } },
  exit: { opacity: 0, height: 0, transition: { height: { duration: 0.26, ease: EASE_OUT }, opacity: { duration: 0.14 } } },
};

/** Swapping views in place (tabs, steps, tool panels): the "page" transition. */
export const viewSwapMotion = {
  initial: { opacity: 0, y: 14, scale: 0.985, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { ...SPRING, opacity: { duration: 0.35, ease: EASE_OUT }, filter: { duration: 0.35, ease: EASE_OUT } } },
  exit: { opacity: 0, y: -6, scale: 0.99, filter: "blur(4px)", transition: { duration: 0.18, ease: EASE_OUT } },
};

/* ------------------------------------------------------------------ */
/* Staged entrances                                                   */
/* ------------------------------------------------------------------ */

/** Parent that staggers its RevealItem children. */
export const staggerParent = (stagger = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

/** Child of a stagger: springs up out of a soft blur and settles with a hint of overshoot. */
export const riseItem: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.96, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 260, damping: 20, mass: 0.9, opacity: { duration: 0.5, ease: EASE_OUT }, filter: { duration: 0.5, ease: EASE_OUT } },
  },
};
