import type { Transition, Variants } from "motion/react";

export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

export const SPRING_SNAPPY: Transition = { type: "spring", stiffness: 440, damping: 27, mass: 0.8 };
export const SPRING: Transition = { type: "spring", stiffness: 300, damping: 24, mass: 0.9 };
export const SPRING_BOUNCY: Transition = { type: "spring", stiffness: 380, damping: 18, mass: 0.9 };
export const SPRING_SOFT: Transition = { type: "spring", stiffness: 180, damping: 28, mass: 1 };

export const canHover = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(hover: hover) and (pointer: fine)").matches === true;

export const allowBlur = (): boolean =>
  typeof window !== "undefined" && window.matchMedia?.("(min-width: 768px)").matches === true;

const BLUR_OK = allowBlur();
const blurOf = (px: number) => (BLUR_OK ? { filter: `blur(${px}px)` } : {});


export const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.36, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.26, ease: EASE_OUT, delay: 0.04 } },
};

export const sheetMotion = {
  initial: { opacity: 0, y: 28, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 340, damping: 26, mass: 0.9, opacity: { duration: 0.3, ease: EASE_OUT } } },
  exit: { opacity: 0, y: 18, scale: 0.97, transition: { duration: 0.24, ease: EASE_OUT } },
};

export const bottomSheetMotion = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { type: "spring", stiffness: 340, damping: 34, mass: 0.9 } },
  exit: { y: "100%", transition: { duration: 0.3, ease: EASE_OUT } },
};

export const popoverMotion = {
  initial: { opacity: 0, y: -6, scale: 0.97, ...blurOf(6) },
  animate: { opacity: 1, y: 0, scale: 1, ...blurOf(0), transition: { ...SPRING_SNAPPY, opacity: { duration: 0.2 }, filter: { duration: 0.24 } } },
  exit: { opacity: 0, y: -4, scale: 0.98, ...blurOf(4), transition: { duration: 0.16, ease: EASE_OUT } },
};

export const toastMotion = {
  initial: { opacity: 0, y: -16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: SPRING_BOUNCY },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2, ease: EASE_OUT } },
};

export const islandMotion = {
  initial: { opacity: 0, scaleX: 0.32, scaleY: 0.55, y: -10, ...blurOf(8) },
  animate: {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    y: 0,
    ...blurOf(0),
    transition: {
      scaleX: { type: "spring", stiffness: 360, damping: 19, mass: 0.8 },
      scaleY: { type: "spring", stiffness: 520, damping: 26, mass: 0.8 },
      y: { type: "spring", stiffness: 420, damping: 28 },
      opacity: { duration: 0.16, ease: EASE_OUT },
      filter: { duration: 0.3, ease: EASE_OUT },
    },
  },
  exit: {
    opacity: 0,
    scaleX: 0.36,
    scaleY: 0.5,
    y: -8,
    ...blurOf(6),
    transition: { duration: 0.26, ease: EASE_OUT, opacity: { duration: 0.18, delay: 0.06 } },
  },
};
export const islandContentMotion = {
  initial: { opacity: 0, scale: 0.94, ...blurOf(6) },
  animate: { opacity: 1, scale: 1, ...blurOf(0), transition: { delay: 0.09, duration: 0.32, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

export const collapseMotion = {
  initial: { opacity: 0, height: 0, ...blurOf(6) },
  animate: { opacity: 1, height: "auto", ...blurOf(0), transition: { height: { ...SPRING, stiffness: 360 }, opacity: { duration: 0.24, delay: 0.04 }, filter: { duration: 0.34, ease: EASE_OUT } } },
  exit: { opacity: 0, height: 0, ...blurOf(4), transition: { height: { duration: 0.26, ease: EASE_OUT }, opacity: { duration: 0.14 }, filter: { duration: 0.2 } } },
};

export const viewSwapMotion = {
  initial: { opacity: 0, y: 14, scale: 0.985, ...blurOf(6) },
  animate: { opacity: 1, y: 0, scale: 1, ...blurOf(0), transition: { ...SPRING, opacity: { duration: 0.35, ease: EASE_OUT }, filter: { duration: 0.35, ease: EASE_OUT } } },
  exit: { opacity: 0, y: -6, scale: 0.99, ...blurOf(4), transition: { duration: 0.18, ease: EASE_OUT } },
};


export const staggerParent = (stagger = 0.07, delayChildren = 0): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: stagger, delayChildren } },
});

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 26, scale: 0.96, ...blurOf(8) },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    ...blurOf(0),
    transition: { type: "spring", stiffness: 260, damping: 20, mass: 0.9, opacity: { duration: 0.5, ease: EASE_OUT }, filter: { duration: 0.5, ease: EASE_OUT } },
  },
};
