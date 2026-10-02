import React, { useContext, useEffect, useState } from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "./theme";
import { TAJAWAL_FACES } from "./fontFaces";

/* ------------------------------------------------------------------ */
/* Fonts                                                              */
/* ------------------------------------------------------------------ */

let fontsPromise: Promise<void> | null = null;
function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all(
      TAJAWAL_FACES.map((f) => {
        const face = new FontFace("Tajawal", `url(${staticFile(`fonts/${f.file}`)}) format("woff2")`, {
          weight: f.weight,
          unicodeRange: f.range,
        });
        document.fonts.add(face);
        return face.load();
      })
    ).then(() => undefined);
  }
  return fontsPromise;
}

/** Holds the render until Tajawal is loaded, so no frame is drawn in a fallback font. */
export function useFonts() {
  const [handle] = useState(() => delayRender("Loading Tajawal"));
  useEffect(() => {
    loadFonts().then(() => continueRender(handle));
  }, [handle]);
}

/* ------------------------------------------------------------------ */
/* Motion helpers                                                     */
/* ------------------------------------------------------------------ */

type SpringCfg = { damping?: number; stiffness?: number; mass?: number };

/** Apple-like spring: quick response, a hint of overshoot, soft settle. */
export function useSpringAt(delay: number, cfg: SpringCfg = {}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 170, mass: 0.9, ...cfg } });
}

export const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Value that tweens between keyframes with the site's ease-out curve. */
export function useTween(input: number[], output: number[]) {
  const frame = useCurrentFrame();
  return interpolate(frame, input, output, { ...clamp, easing: easeOut });
}

/** cubic-bezier(0.22, 1, 0.36, 1) — the same curve the website uses. */
export function easeOut(t: number) {
  // Newton-Raphson solve of the bezier x(t) for the given progress.
  const x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1;
  const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
  const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const x = ((ax * u + bx) * u + cx) * u - t;
    const d = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(d) < 1e-6) break;
    u -= x / d;
  }
  return ((ay * u + by) * u + cy) * u;
}

/* ------------------------------------------------------------------ */
/* Surfaces                                                           */
/* ------------------------------------------------------------------ */

/** Deep navy stage with a soft key light and a faint perspective grid. */
export function Background() {
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 60;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.navyLight} 0%, ${C.navy} 38%, ${C.navyDeep} 100%)` }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 700px at ${540 + drift}px 260px, rgba(47,107,255,0.30), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(800px 600px at ${540 - drift}px 1750px, rgba(95,168,255,0.14), transparent 70%)`,
        }}
      />
      <AbsoluteFill
        style={{
          opacity: 0.22,
          backgroundImage:
            "linear-gradient(rgba(155,188,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(155,188,255,0.12) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
          backgroundPosition: `0 ${frame * 0.6}px`,
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 45%, black, transparent)",
        }}
      />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 55%, rgba(0,0,0,0.55))" }} />
    </AbsoluteFill>
  );
}

export const glass: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.11), rgba(255,255,255,0.04))",
  border: "1.5px solid rgba(255,255,255,0.14)",
  boxShadow: "inset 0 1.5px 0 rgba(255,255,255,0.20), 0 30px 80px rgba(0,0,0,0.38)",
  backdropFilter: "blur(28px) saturate(150%)",
  WebkitBackdropFilter: "blur(28px) saturate(150%)",
};

/**
 * Liquid-Glass scene transition: the scene arrives out of a blur, pushing in
 * from slightly larger, and leaves by sinking back and blurring away.
 */
export function SceneShell({ dur, hold = false, children }: { dur: number; hold?: boolean; children: React.ReactNode }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 20, stiffness: 140, mass: 0.9 } });
  // The last scene holds as the end card instead of leaving.
  const exit = hold ? 0 : interpolate(frame, [dur - 12, dur], [0, 1], { ...clamp, easing: easeOut });
  const scale = interpolate(enter, [0, 1], [1.07, 1]) * interpolate(exit, [0, 1], [1, 0.93]);
  const blur = interpolate(enter, [0, 1], [22, 0], clamp) + exit * 18;
  const opacity = Math.min(interpolate(frame, [0, 8], [0, 1], clamp), 1 - exit);
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, opacity }}>
      {children}
    </AbsoluteFill>
  );
}

/* ------------------------------------------------------------------ */
/* Typography                                                         */
/* ------------------------------------------------------------------ */

/**
 * Headline that pops in word by word (spaces only, so Arabic letter joining
 * is never broken): each word springs up out of a blur.
 */
export function Words({
  text,
  delay = 0,
  stagger = 3,
  style,
  wordStyle,
}: {
  text: string;
  delay?: number;
  stagger?: number;
  style?: React.CSSProperties;
  wordStyle?: (i: number) => React.CSSProperties | undefined;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");
  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: "0.28em", ...style }}>
      {words.map((w, i) => {
        const s = spring({ frame: frame - delay - i * stagger, fps, config: { damping: 13, stiffness: 190, mass: 0.8 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(s, [0, 0.35], [0, 1], clamp),
              transform: `translateY(${interpolate(s, [0, 1], [46, 0])}px) scale(${interpolate(s, [0, 1], [0.86, 1])})`,
              filter: `blur(${interpolate(s, [0, 0.8], [14, 0], clamp)}px)`,
              ...wordStyle?.(i),
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
}

export const silverText: React.CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #dfe8ff 55%, #9bbcff 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
};

/** Small uppercase-style label used above headlines. */
export function Eyebrow({ children, delay = 0, color = C.accent }: { children: React.ReactNode; delay?: number; color?: string }) {
  const s = useSpringAt(delay, { damping: 16 });
  return (
    <div
      style={{
        ...glass,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
        display: "inline-flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 30px",
        borderRadius: 999,
        fontSize: 34,
        fontWeight: 800,
        color,
        opacity: s,
        transform: `scale(${interpolate(s, [0, 1], [0.7, 1])})`,
      }}
    >
      {children}
    </div>
  );
}

/** Left-to-right run for numbers and Latin inside RTL text. */
export const Ltr = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span dir="ltr" style={{ unicodeBidi: "isolate", ...style }}>
    {children}
  </span>
);

/* ------------------------------------------------------------------ */
/* Brand + sound                                                      */
/* ------------------------------------------------------------------ */

/** The site's mark: navy tile, blue four-point star, white core. */
export function Logo({ size = 120 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" style={{ filter: "drop-shadow(0 12px 30px rgba(47,107,255,0.45))" }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5b8eff" />
          <stop offset="1" stopColor="#1a4fe0" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={C.navy} stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <path d="M16 5L19.2 12.8L27 16L19.2 19.2L16 27L12.8 19.2L5 16L12.8 12.8L16 5Z" fill="url(#lg)" />
      <circle cx="16" cy="16" r="2.6" fill="#fff" />
    </svg>
  );
}

/** Master level for every Sfx below it (lowered when a voiceover is present). */
export const SfxVolumeContext = React.createContext(1);

export type SfxName = "pop" | "whoosh" | "tick" | "impact" | "chime" | "type";

/** One-shot sound effect at a frame (relative to the enclosing Sequence). */
export function Sfx({ at, name, volume = 1 }: { at: number; name: SfxName; volume?: number }) {
  const master = useContext(SfxVolumeContext);
  if (master <= 0) return null;
  return (
    <Sequence from={Math.round(at)} durationInFrames={30} layout="none">
      <Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={volume * master} />
    </Sequence>
  );
}
