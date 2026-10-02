import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C } from "../theme";
import { clamp, easeOut } from "../kit";

/**
 * Kinetic-typography kit in the style of the reference ad: a thin lead-in
 * line, a bold keyword line, marker boxes that draw in behind words, emoji
 * that pop with overshoot, cards that fly in tilted and settle.
 */

export type Tone = "dark" | "paper";

export const INK = {
  dark: { lead: "rgba(255,255,255,0.72)", bold: "#ffffff" },
  paper: { lead: "#5d6b8f", bold: "#0b1d58" },
};

type Cfg = { damping?: number; stiffness?: number; mass?: number };
export function useSpr(at: number, cfg: Cfg = {}) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - at, fps, config: { damping: 13, stiffness: 200, mass: 0.8, ...cfg } });
}

/** Absolutely places its children centred on a world (or local) point. */
export function Place({ x, y, z, children, style }: { x: number; y: number; z?: number; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
        zIndex: z,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "max-content",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A beat: a group placed on the canvas that only renders while it can be on screen. */
export function Beat({ x, y, from, to, children }: { x: number; y: number; from: number; to: number; children: React.ReactNode }) {
  const f = useCurrentFrame();
  if (f < from - 1 || f > to) return null;
  return <div style={{ position: "absolute", left: x, top: y }}>{children}</div>;
}

function splitWords(text: string) {
  return text.split(" ").filter(Boolean);
}

/** Thin lead-in line: words fade up softly, one after another. */
export function Lead({ text, at, tone = "dark", size = 58, stagger = 3, color }: { text: string; at: number; tone?: Tone; size?: number; stagger?: number; color?: string }) {
  const f = useCurrentFrame();
  return (
    <div style={{ display: "flex", columnGap: "0.26em", fontSize: size, fontWeight: 300, color: color ?? INK[tone].lead, whiteSpace: "nowrap", lineHeight: 1.25 }}>
      {splitWords(text).map((w, i) => {
        const t = interpolate(f, [at + i * stagger, at + i * stagger + 7], [0, 1], { ...clamp, easing: easeOut });
        return (
          <span key={i} style={{ display: "inline-block", opacity: t, transform: `translateY(${(1 - t) * 18}px)`, filter: `blur(${(1 - t) * 6}px)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
}

/** Bold keyword line: each word pops in with a springy overshoot. */
export function Bold({
  text,
  at,
  tone = "dark",
  size = 108,
  stagger = 4,
  color,
  style,
}: {
  text: string;
  at: number;
  tone?: Tone;
  size?: number;
  stagger?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", columnGap: "0.24em", fontSize: size, fontWeight: 900, color: color ?? INK[tone].bold, whiteSpace: "nowrap", lineHeight: 1.18, ...style }}>
      {splitWords(text).map((w, i) => {
        const s = spring({ frame: f - at - i * stagger, fps, config: { damping: 11, stiffness: 230, mass: 0.7 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: interpolate(s, [0, 0.25], [0, 1], clamp),
              transform: `translateY(${interpolate(s, [0, 1], [34, 0])}px) scale(${interpolate(s, [0, 1], [0.55, 1])})`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Marker box that wipes in from the reading edge (right, for Arabic), then
 * the words pop inside it. `select` adds text-selection handles.
 */
export function Mark({
  text,
  at,
  size = 100,
  bg = C.blue,
  color = "#fff",
  kind = "box",
  children,
}: {
  text?: string;
  at: number;
  size?: number;
  bg?: string;
  color?: string;
  kind?: "box" | "select";
  children?: React.ReactNode;
}) {
  const f = useCurrentFrame();
  const grow = interpolate(f, [at, at + 8], [0, 1], { ...clamp, easing: easeOut });
  const select = kind === "select";
  return (
    <div style={{ position: "relative", padding: `${size * 0.06}px ${size * 0.28}px ${size * 0.1}px` }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: select ? 6 : size * 0.16,
          background: select ? "rgba(91,142,255,0.55)" : bg,
          border: select ? `3px solid ${C.blueLight}` : undefined,
          transform: `scaleX(${grow})`,
          transformOrigin: "100% 50%",
          boxShadow: select ? undefined : "0 14px 40px rgba(0,0,0,0.25)",
        }}
      />
      {select && grow > 0.98 && (
        <>
          <Handle side="right" at={at + 8} />
          <Handle side="left" at={at + 10} />
        </>
      )}
      <div style={{ position: "relative" }}>{children ?? <Bold text={text!} at={at + 4} size={size} color={color} />}</div>
    </div>
  );
}

function Handle({ side, at }: { side: "left" | "right"; at: number }) {
  const s = useSpr(at, { damping: 10, stiffness: 300 });
  const top = side === "right";
  return (
    <div
      style={{
        position: "absolute",
        [side]: -4,
        [top ? "top" : "bottom"]: -22,
        width: 4,
        height: "calc(100% + 22px)",
        background: C.blueLight,
        transformOrigin: top ? "50% 0%" : "50% 100%",
        transform: `scaleY(${s})`,
      }}
    >
      <div
        style={{
          position: "absolute",
          [top ? "top" : "bottom"]: -10,
          left: -10,
          width: 24,
          height: 24,
          borderRadius: 99,
          background: C.blueLight,
          transform: `scale(${s})`,
        }}
      />
    </div>
  );
}

/** Red strike-through that draws across its parent (parent must be position: relative). */
export function Strike({ at, color = "#ff4d5e", tilt = -6, thickness = 9 }: { at: number; color?: string; tilt?: number; thickness?: number }) {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 7], [0, 1], { ...clamp, easing: easeOut });
  return (
    <div
      style={{
        position: "absolute",
        left: "-6%",
        right: "-6%",
        top: "52%",
        height: thickness,
        borderRadius: 99,
        background: color,
        transform: `rotate(${tilt}deg) scaleX(${t})`,
        transformOrigin: "100% 50%",
        boxShadow: `0 0 18px ${color}66`,
      }}
    />
  );
}

/** A big red X drawn over a w×h area, stroke by stroke (centred on its parent). */
export function CrossOut({ at, w, h, color = "#ff4d5e" }: { at: number; w: number; h: number; color?: string }) {
  const f = useCurrentFrame();
  const a = interpolate(f, [at, at + 6], [0, 1], { ...clamp, easing: easeOut });
  const b = interpolate(f, [at + 5, at + 11], [0, 1], { ...clamp, easing: easeOut });
  const line = (x1: number, y1: number, x2: number, y2: number, t: number) => (
    <line x1={x1} y1={y1} x2={x1 + (x2 - x1) * t} y2={y1 + (y2 - y1) * t} stroke={color} strokeWidth={12} strokeLinecap="round" opacity={t > 0 ? 1 : 0} />
  );
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -w / 2, marginTop: -h / 2, overflow: "visible", filter: `drop-shadow(0 0 10px ${color}88)` }}>
      {line(0, 0, w, h, a)}
      {line(w, 0, 0, h, b)}
    </svg>
  );
}

/** Hand-drawn loop around its parent: two slightly offset passes, like a marker. */
export function HandCircle({ at, color = "#ffffff", w, h }: { at: number; color?: string; w: number; h: number }) {
  const f = useCurrentFrame();
  const t = interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: easeOut });
  const d = `M ${w * 0.62} ${h * 0.06} C ${w * 1.02} ${h * 0.02}, ${w * 1.04} ${h * 0.92}, ${w * 0.5} ${h * 0.96} C ${-w * 0.04} ${h * 0.99}, ${-w * 0.03} ${h * 0.08}, ${w * 0.45} ${h * 0.04} C ${w * 0.7} ${h * 0.01}, ${w * 0.86} ${h * 0.1}, ${w * 0.9} ${h * 0.16}`;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -w / 2, marginTop: -h / 2, overflow: "visible" }}>
      <path d={d} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - t} opacity={0.9} />
    </svg>
  );
}

/** 3D emoji that pops in with overshoot, then floats gently. */
export function Emoji({
  name,
  at,
  size = 200,
  rot = -18,
  float = true,
  out,
}: {
  name: string;
  at: number;
  size?: number;
  rot?: number;
  float?: boolean;
  /** Frame to pop back out. */
  out?: number;
}) {
  const f = useCurrentFrame();
  const sIn = useSpr(at, { damping: 9, stiffness: 190, mass: 0.8 });
  const sOut = out ? interpolate(f, [out, out + 6], [1, 0], { ...clamp, easing: easeOut }) : 1;
  const s = sIn * sOut;
  if (f < at) return null;
  const bob = float ? Math.sin((f - at) / 11) * 8 : 0;
  const sway = float ? Math.sin((f - at) / 17) * 4 : 0;
  return (
    <Img
      src={staticFile(`emoji/${name}.png`)}
      style={{
        width: size,
        height: size,
        transform: `translateY(${bob}px) scale(${s}) rotate(${(1 - sIn) * rot + sway}deg)`,
        filter: "drop-shadow(0 18px 30px rgba(0,0,0,0.35))",
      }}
    />
  );
}

/** Card that flies in from an offset, tilted and blurred, and lands with a bounce. */
export function FlyCard({
  at,
  from,
  children,
  tilt = 0,
}: {
  at: number;
  from: { x: number; y: number; r: number };
  children: React.ReactNode;
  tilt?: number;
}) {
  const f = useCurrentFrame();
  const s = useSpr(at, { damping: 14, stiffness: 150, mass: 0.9 });
  if (f < at) return null;
  const k = 1 - s;
  return (
    <div
      style={{
        transform: `translate(${from.x * k}px, ${from.y * k}px) rotate(${from.r * k + tilt}deg) scale(${interpolate(s, [0, 1], [0.7, 1])})`,
        filter: k > 0.04 ? `blur(${Math.min(14, k * 18)}px)` : undefined,
        opacity: interpolate(s, [0, 0.15], [0, 1], clamp),
      }}
    >
      {children}
    </div>
  );
}

/** Pops a block in with a quick spring scale. */
export function Pop({ at, children, from = 0.4, style }: { at: number; children: React.ReactNode; from?: number; style?: React.CSSProperties }) {
  const f = useCurrentFrame();
  const s = useSpr(at, { damping: 11, stiffness: 240, mass: 0.7 });
  if (f < at) return null;
  return (
    <div style={{ transform: `scale(${interpolate(s, [0, 1], [from, 1])})`, opacity: interpolate(s, [0, 0.3], [0, 1], clamp), ...style }}>
      {children}
    </div>
  );
}

/** Left-to-right run for numbers inside Arabic text. */
export const N = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <span dir="ltr" style={{ unicodeBidi: "isolate", ...style }}>
    {children}
  </span>
);

/**
 * The Vizion "VZ" mark (blue strokes, yellow arrow). Pieces assemble from
 * different directions when `at` is given.
 */
export function VZLogo({ size = 200, at }: { size?: number; at?: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = (d: number) => (at === undefined ? 1 : spring({ frame: f - at - d, fps, config: { damping: 13, stiffness: 170, mass: 0.8 } }));
  const a = p(0);
  const b = p(4);
  const c = p(8);
  const arrow = at === undefined ? 1 : interpolate(f, [at + 12, at + 22], [0, 1], { ...clamp, easing: easeOut });
  const piece = (s: number, dx: number, dy: number) => ({
    transform: `translate(${dx * (1 - s)}px, ${dy * (1 - s)}px)`,
    opacity: interpolate(s, [0, 0.3], [0, 1], clamp),
  });
  return (
    <svg width={size} height={size * 0.9} viewBox="40 80 680 610" style={{ overflow: "visible", filter: "drop-shadow(0 16px 40px rgba(47,107,255,0.45))" }}>
      <defs>
        <linearGradient id="vzb" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f7bff" />
          <stop offset="1" stopColor="#1a5cff" />
        </linearGradient>
      </defs>
      {/* V with the rising swoosh */}
      <path style={piece(a, -160, 60)} fill="url(#vzb)" d="M66 214 Q60 188 92 188 L158 188 Q170 188 176 200 L292 410 Q372 392 432 318 L452 334 Q368 452 248 524 Q232 532 222 516 Z" />
      {/* Top of the Z */}
      <path style={piece(b, 120, -120)} fill="url(#vzb)" d="M236 100 L606 100 Q636 102 628 132 L548 290 L470 238 L488 190 L292 190 Q276 190 268 176 Z" />
      {/* Bottom of the Z */}
      <path style={piece(c, 120, 160)} fill="url(#vzb)" d="M540 326 L616 400 Q624 410 618 420 L532 580 L676 580 Q700 582 690 606 L664 656 Q656 668 640 668 L300 668 Q272 666 282 640 Z" />
      {/* Yellow arrow */}
      <g style={{ opacity: arrow, transform: `translate(${(1 - arrow) * -60}px, ${(1 - arrow) * 50}px)` }}>
        <path d="M420 300 L484 280 L480 344 L462 326 L440 348 L424 332 L446 312 Z" fill="#ffd60a" style={{ filter: "drop-shadow(0 0 10px rgba(255,214,10,0.6))" }} />
      </g>
    </svg>
  );
}
