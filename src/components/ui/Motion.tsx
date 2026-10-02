import React, { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from "motion/react";
import { EASE_OUT, allowBlur, canHover, riseItem, staggerParent } from "../../lib/motion";

type DivProps = Omit<HTMLMotionProps<"div">, "initial" | "whileInView" | "viewport">;

interface RevealProps extends DivProps {
  delay?: number;
  /** Starting vertical offset in px. */
  y?: number;
  /** Starting scale. */
  scale?: number;
  /** Fraction of the element that must be visible before it reveals. */
  amount?: number;
}

/**
 * Scroll reveal: fades up from a soft blur and settles at full scale the first
 * time the element enters the viewport. Uses IntersectionObserver under the
 * hood (via motion's whileInView), so nothing runs while idle.
 */
export function Reveal({ delay = 0, y = 24, scale = 0.97, amount = 0.15, transition, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  const blur = allowBlur();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, scale, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      transition={transition ?? { duration: reduce ? 0.2 : 0.75, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

interface RevealGroupProps extends DivProps {
  stagger?: number;
  delay?: number;
  amount?: number;
}

/** Container that reveals its <RevealItem> children in a short cascade. */
export function RevealGroup({ stagger = 0.07, delay = 0, amount = 0.1, children, ...rest }: RevealGroupProps) {
  return (
    <motion.div
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, ...rest }: Omit<HTMLMotionProps<"div">, "variants">) {
  return (
    <motion.div variants={riseItem} {...rest}>
      {children}
    </motion.div>
  );
}

interface MagneticProps {
  children: React.ReactNode;
  /** Fraction of the cursor offset the element follows (keep small). */
  strength?: number;
  /** Max travel in px in any direction. */
  max?: number;
  /** Invisible padding (px) around the child that already attracts the cursor. */
  reach?: number;
  className?: string;
}

/**
 * Magnetic wrapper for primary CTAs: the child drifts a few pixels toward the
 * cursor and springs back on leave. Desktop + motion-allowed only.
 */
export function Magnetic({ children, strength = 0.22, max = 8, reach = 16, className }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.6 });

  if (reduce || !canHover()) {
    return <div className={className}>{children}</div>;
  }

  const clamp = (v: number) => Math.max(-max, Math.min(max, v));

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, padding: reach, margin: -reach }}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        x.set(clamp((e.clientX - (r.left + r.width / 2)) * strength));
        y.set(clamp((e.clientY - (r.top + r.height / 2)) * strength));
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
