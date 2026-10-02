import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type HTMLMotionProps,
  type MotionValue,
} from "motion/react";
import { EASE_OUT, SPRING_SNAPPY, allowBlur, canHover, riseItem, staggerParent } from "../../lib/motion";

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

/* ------------------------------------------------------------------ */
/* Typography in motion                                               */
/* ------------------------------------------------------------------ */

type WordSegment = string | { text: string; className?: string } | { br: string };

interface WordsRevealProps {
  segments: WordSegment[];
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
  /** "mount" plays on first render (hero); "view" plays when scrolled into view. */
  trigger?: "mount" | "view";
  delay?: number;
  stagger?: number;
}

/**
 * Headline reveal: each word springs up out of a soft blur in reading order,
 * then a band of light sweeps once across any silver words — the way Apple
 * introduces a product name. Words are split on spaces only, so Arabic letter
 * joining inside a word is never broken.
 */
export function WordsReveal({ segments, as = "h2", className, trigger = "view", delay = 0, stagger = 0.05 }: WordsRevealProps) {
  const reduce = useReducedMotion();
  const blur = allowBlur();
  const [shine, setShine] = useState(false);

  useEffect(() => {
    if (trigger === "mount") setShine(true);
  }, [trigger]);

  const tokens: Array<{ word: string; className?: string } | { br: string } | { space: true }> = [];
  for (const seg of segments) {
    if (typeof seg !== "string" && "br" in seg) {
      tokens.push({ br: seg.br });
      continue;
    }
    const { text, className: segClass } = typeof seg === "string" ? { text: seg, className: undefined } : seg;
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      tokens.push(/^\s+$/.test(part) ? { space: true } : { word: part, className: segClass });
    });
  }
  const label = segments.map((seg) => (typeof seg === "string" ? seg : "text" in seg ? seg.text : " ")).join("");

  const word = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: "0.5em", scale: 0.96, filter: blur ? "blur(10px)" : "blur(0px)" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: { type: "spring", stiffness: 240, damping: 20, mass: 0.9, opacity: { duration: 0.45, ease: EASE_OUT }, filter: { duration: 0.5, ease: EASE_OUT } },
    },
  };
  const parent = { hidden: {}, visible: { transition: { staggerChildren: reduce ? 0 : stagger, delayChildren: delay } } };
  const Tag = motion[as];
  const playProps =
    trigger === "mount"
      ? { animate: "visible" as const }
      : { whileInView: "visible" as const, viewport: { once: true, amount: 0.4 }, onViewportEnter: () => setShine(true) };

  let silverIndex = 0;
  return (
    <Tag className={className} aria-label={label} variants={parent} initial="hidden" {...playProps}>
      {tokens.map((t, i) => {
        if ("br" in t) return <br key={i} className={t.br} />;
        if ("space" in t) return <React.Fragment key={i}> </React.Fragment>;
        const isSilver = t.className?.includes("vz-silver-text");
        const shineDelay = isSilver ? delay + 0.55 + silverIndex++ * 0.07 : 0;
        return (
          <motion.span
            key={i}
            aria-hidden="true"
            variants={word}
            className={`inline-block ${t.className ?? ""} ${isSilver && shine && !reduce ? "vz-shine" : ""}`}
            style={isSilver ? ({ "--shine-delay": `${shineDelay}s` } as React.CSSProperties) : undefined}
          >
            {t.word}
          </motion.span>
        );
      })}
    </Tag>
  );
}

/**
 * Scroll-scrubbed statement: words brighten one after another as the
 * paragraph travels up the screen, and dim again when scrolling back.
 */
export function ScrollWords({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className}>
      {words.map((w, i) => (
        <ScrollWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]} still={!!reduce}>
          {w}
        </ScrollWord>
      ))}
    </p>
  );
}

function ScrollWord({ progress, range, still, children }: { key?: React.Key; progress: MotionValue<number>; range: [number, number]; still: boolean; children: React.ReactNode }) {
  const opacity = useTransform(progress, range, [0.16, 1]);
  return (
    <>
      <motion.span style={{ opacity: still ? 1 : opacity }}>{children}</motion.span>{" "}
    </>
  );
}

/**
 * Number that counts up on a spring the first time it is seen, and glides to
 * new values afterwards (e.g. when a filter changes the count).
 */
export function CountUp({
  value,
  className,
  format = (n: number) => n.toLocaleString("en-US"),
}: {
  value: number;
  className?: string;
  format?: (n: number) => string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const mv = useMotionValue(reduce ? value : 0);
  const spring = useSpring(mv, { stiffness: 90, damping: 22, mass: 1 });

  useEffect(() => {
    if (inView || reduce) mv.set(value);
  }, [inView, reduce, value, mv]);

  useEffect(
    () =>
      spring.on("change", (v) => {
        if (ref.current) ref.current.textContent = format(Math.round(v));
      }),
    [spring, format]
  );

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`}>
      {format(reduce ? value : 0)}
    </span>
  );
}

/**
 * Scroll-linked zoom: the block scales up from slightly smaller and rises into
 * place as it approaches the middle of the screen — reversible, scrubbed by
 * the scroll position, smoothed by a spring (desktop). On phones the same zoom
 * plays once as a spring when the block enters the viewport, so nothing is
 * measured or re-composited on every scroll frame.
 */
export function ScrollZoom(props: { children: React.ReactNode; className?: string; from?: number }) {
  const [desktop] = useState(allowBlur);
  return desktop ? <ScrollZoomScrubbed {...props} /> : <ScrollZoomOnce {...props} />;
}

function ScrollZoomScrubbed({ children, className, from = 0.9 }: { children: React.ReactNode; className?: string; from?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.3"] });
  const progress = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.6 });
  const scale = useTransform(progress, [0, 1], [reduce ? 1 : from, 1]);
  const y = useTransform(progress, [0, 1], [reduce ? 0 : 70, 0]);
  const opacity = useTransform(progress, [0, 0.55], [reduce ? 1 : 0.25, 1]);
  return (
    <motion.div ref={ref} style={{ scale, y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

function ScrollZoomOnce({ children, className }: { children: React.ReactNode; className?: string; from?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 36, scale: 0.93 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ type: "spring", stiffness: 230, damping: 21, mass: 0.9, opacity: { duration: 0.45, ease: EASE_OUT } }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Sliding selection pill for `.vz-chip` groups: one per group, keyed by layoutId. */
export function ChipPill({ layoutId }: { layoutId: string }) {
  return <motion.span layoutId={layoutId} transition={SPRING_SNAPPY} className="vz-chip-pill" aria-hidden="true" />;
}
