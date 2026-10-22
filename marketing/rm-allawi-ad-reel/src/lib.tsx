// The pieces the reel is built from: the clock, the eases, a cut-out with its own motion blur, a phone that plays a
// reel, and a line of words. Every motion is a function of the time t in seconds, stepped at 15 fps.
import React from "react";
import { Img, OffthreadVideo, Sequence, staticFile } from "remotion";

export const FPS = 30, W = 1080, H = 1920, D = 41.2;
export const POSTER = 15, SHUTTER = 1 / 30;
export const INK = "#1f1510";
export const FONT = "'DG Sahabah'";

// the frame steps at 15 fps: every step holds two frames of the 30 fps video
export const stepped = (frame: number) => Math.min(D, Math.floor((frame / FPS + 0.03) * POSTER) / POSTER);

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
// After Effects' temporal ease as a curve: outgoing influence of the first key, incoming influence of the second
const bez = (x1: number, y1: number, x2: number, y2: number) => (p: number) => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  let lo = 0, hi = 1, u = p;
  for (let i = 0; i < 30; i++) {
    u = (lo + hi) / 2;
    if (3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u < p) lo = u; else hi = u;
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
};
export const ae = (out: number, inn: number) => bez(out / 100, 0, 1 - inn / 100, 1);
export const SOFT = ae(20, 80), AWAY = ae(70, 20), PUSH = ae(62, 62), SETTLE = ae(0, 100), DRIFT = ae(33, 100);
export const IN2 = (p: number) => p * p, OUT3 = (p: number) => 1 - Math.pow(1 - p, 3);
export const backOut = (s = 1.7) => (p: number) => { const c = s + 1; return 1 + c * Math.pow(p - 1, 3) + s * Math.pow(p - 1, 2); };
// Smart Bounce, «Elastic»: the keyframed move, then the overshoot v·amp·sin(2π·f·t)/e^(decay·t)
export const smart = (k: number) => (p: number) => { const t = p * (k + 1); return t < k ? t / k : 1 + (0.05 / k) * Math.sin(4 * Math.PI * (t - k)) / Math.exp(4 * (t - k)); };
export const bounce = (t: number, t0: number) => (t < t0 ? 0 : smart(0.16)(clamp((t - t0) / 1.16)));

// a value moving from a to b over d seconds from t0
export const mv = (t: number, t0: number, d: number, a: number, b: number, ease = SOFT) => lerp(a, b, ease(clamp((t - t0) / d)));
// a short push and settle, for a hit on a word
export const punch = (t: number, t0: number, amt = 0.06) => {
  if (t < t0 || t > t0 + 0.55) return 0;
  return t < t0 + 0.1 ? amt * OUT3((t - t0) / 0.1) : amt * (1 - backOut(2)((t - t0 - 0.1) / 0.45));
};

export type Pose = { x?: number; y?: number; r?: number; s?: number; o?: number; ry?: number };

const blurOf = (p: Pose, q: Pose, w: number) => {
  const ds = Math.abs((p.s ?? 1) - (q.s ?? 1)) * w, dr = (Math.abs((p.r ?? 0) - (q.r ?? 0)) * w) / 180;
  const sx = Math.min(16, Math.abs((p.x ?? 0) - (q.x ?? 0)) / 4 + ds / 12 + dr / 6);
  const sy = Math.min(16, Math.abs((p.y ?? 0) - (q.y ?? 0)) / 4 + ds / 12 + dr / 6);
  return [sx, sy];
};
const tf = (p: Pose) => `translate(${p.x ?? 0}px, ${p.y ?? 0}px) rotate(${p.r ?? 0}deg) scale(${p.s ?? 1})` + (p.ry ? ` perspective(1600px) rotateY(${p.ry}deg)` : "");

// a cut-out on the beat: one black-and-white treatment for all of them (grey, contrast, the same print grain inside its
// own outline, one warm shadow), and motion blur along its own move
export const Cut: React.FC<{ id: string; src: string; w: number; left: number; top: number; t: number; pose: (t: number) => Pose; z?: number; colour?: boolean; children?: React.ReactNode }> = ({ id, src, w, left, top, t, pose, z = 10, colour, children }) => {
  const p = pose(t), q = pose(t - SHUTTER), o = p.o ?? 1;
  if (o <= 0.002) return null;
  const [sx, sy] = blurOf(p, q, w), blur = sx + sy > 0.6, url = staticFile("el/" + src);
  return (
    <div style={{ position: "absolute", left, top, width: w, zIndex: z, opacity: o, transform: tf(p), filter: blur ? `url(#mb-${id})` : undefined }}>
      {blur && (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={`mb-${id}`} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
          </filter>
        </svg>
      )}
      <div style={{ position: "relative", filter: "drop-shadow(0 22px 26px rgba(80,25,0,.34))" }}>
        {children}
        <Img src={url} style={{ position: "relative", zIndex: 2, display: "block", width: "100%", filter: colour ? undefined : "grayscale(1) contrast(1.22) brightness(1.04)" }} />
        {!colour && (
          <div style={{ position: "absolute", inset: 0, zIndex: 3, background: `url(${staticFile("img/grain.png")}) 0 0/360px`, mixBlendMode: "overlay", opacity: 0.5, WebkitMaskImage: `url(${url})`, WebkitMaskSize: "100% 100%", maskImage: `url(${url})`, maskSize: "100% 100%" }} />
        )}
      </div>
    </div>
  );
};

// what shows on a phone's screen, under the frame: a reel from my page, or a dark screen with words on it
const screenBox: React.CSSProperties = { position: "absolute", zIndex: 1, left: "9.03%", top: "1.84%", width: "88.04%", height: "96.21%", overflow: "hidden", WebkitMaskImage: `url(${staticFile("el/phone-screen.png")})`, WebkitMaskSize: "100% 100%", maskImage: `url(${staticFile("el/phone-screen.png")})`, maskSize: "100% 100%" };
export const Screen: React.FC<{ clip?: string; from?: number; dur?: number; at?: number; children?: React.ReactNode }> = ({ clip, from = 0, dur = 1, at = 0, children }) => (
  <div style={{ ...screenBox, background: INK }}>
    {clip && (
      <Sequence from={Math.round(from * FPS)} durationInFrames={Math.round(dur * FPS)} layout="none">
        <OffthreadVideo src={staticFile("clips/" + clip)} startFrom={Math.round(at * FPS)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
    )}
    {children}
  </div>
);

// a word: «*» makes it dark, «^» outlined, «~» marks where it stretches with tatweel
export type Wd = { w: string; t: number };
export const Line: React.FC<{ t: number; top: number; size: number; words: Wd[]; out?: number; align?: "c" | "r" | "l"; rot?: number; dim?: boolean; enter?: "up" | "burst" | "side"; stretch?: number }> = ({ t, top, size, words, out, align = "c", rot = 0, dim, enter = "up", stretch = 0 }) => {
  if (t < words[0].t - 0.05) return null;
  const op = out ? 1 - clamp((t - out) / 0.3) : 1;
  if (op <= 0) return null;
  const oy = out ? -40 * IN2(clamp((t - out) / 0.3)) : 0;
  const side = align === "c" ? { left: 50, right: 50 } : align === "r" ? { right: 70, left: 30 } : { left: 70, right: 30 };
  return (
    <div style={{ position: "absolute", top, ...side, zIndex: 30, textAlign: align === "c" ? "center" : align === "r" ? "right" : "left", whiteSpace: "nowrap", direction: "rtl", fontFamily: FONT, fontWeight: 400, fontSynthesis: "none", fontSize: size, lineHeight: 1.15, color: dim ? "rgba(255,255,255,.62)" : "#fff", textShadow: "0 4px 16px rgba(80,25,0,.22)", opacity: op, transform: `translateY(${oy}px) rotate(${rot}deg)` }}>
      {words.map((wd, i) => {
        const dt = t - wd.t;
        const key = wd.w.includes("*"), outl = wd.w.includes("^");
        let txt = wd.w.replace(/[*^]/g, "");
        if (txt.includes("~")) txt = txt.replace("~", "ـ".repeat(Math.round(stretch * SOFT(clamp((dt - 0.06) / 0.45)))));
        let s: React.CSSProperties = { opacity: 0 };
        if (dt >= 0) {
          const p = clamp(dt / (enter === "burst" ? 0.5 : 0.42)), e = OUT3(p);
          const tr = enter === "burst" ? `translateX(${lerp(-460, 0, e)}px) scale(${lerp(0.35, 1, e)})` : enter === "side" ? `translateX(${lerp(300, 0, e)}px)` : `translateY(${lerp(42, 0, e)}px)`;
          s = { opacity: clamp(p * 1.6), transform: tr };
        }
        const look: React.CSSProperties = key ? { color: INK, textShadow: "none" } : outl ? { color: "transparent", WebkitTextStroke: `${Math.max(3, size * 0.022)}px #fff`, textShadow: "none" } : {};
        return (
          <React.Fragment key={i}>
            {i > 0 && " "}
            <span style={{ display: "inline-block", ...look, ...s }}>{txt}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// a star of sixteen points, the burst behind a word
export const Burst: React.FC<{ cx: number; cy: number; r: number; s: number; rot: number }> = ({ cx, cy, r, s, rot }) => {
  if (s <= 0.001) return null;
  const pts = Array.from({ length: 32 }, (_, i) => { const a = (Math.PI * i) / 16, rr = i % 2 ? r * 0.8 : r; return `${(Math.cos(a) * rr).toFixed(1)},${(Math.sin(a) * rr).toFixed(1)}`; }).join(" ");
  return (
    <svg style={{ position: "absolute", left: cx - r, top: cy - r, width: 2 * r, height: 2 * r, zIndex: 20, overflow: "visible", transform: `scale(${s}) rotate(${rot}deg)` }} viewBox={`${-r} ${-r} ${2 * r} ${2 * r}`}>
      <polygon points={pts} fill={INK} />
    </svg>
  );
};
