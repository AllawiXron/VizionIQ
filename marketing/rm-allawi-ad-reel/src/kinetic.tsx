// Words as kinetic type: each word rises out of its own mask, punches in with an overshoot, fills an outline on the
// beat, rides on a dark bar that wipes in behind it, or sits on a pill. Nothing fades. A word can also take a push from
// the thing next to it (fx).
import React from "react";
import { ENT, EXIT, FONT, INK, OVR, clamp, lerp } from "./lib";

export type KW = {
  w: string; // «*» dark word, «~» where it stretches with tatweel
  t: number;
  v?: "up" | "punch" | "fill" | "bar" | "pill";
  fill?: number; // when an outlined word fills in
  fx?: (t: number) => { x?: number; y?: number; r?: number; s?: number };
};

const shadow = "0 5px 18px rgba(80,25,0,.22)";

const Word: React.FC<{ t: number; wd: KW; size: number; out?: number; stretch: number; dim?: boolean }> = ({ t, wd, size, out, stretch, dim }) => {
  const dt = t - wd.t;
  if (dt < 0) return <span style={{ display: "inline-block", visibility: "hidden" }}>{wd.w.replace(/[*~]/g, "")}</span>;
  const key = wd.w.includes("*");
  let txt = wd.w.replace("*", "");
  if (txt.includes("~")) txt = txt.replace("~", "ـ".repeat(Math.round(stretch * ENT(clamp((dt - 0.12) / 0.4)))));
  const colour = key ? INK : dim ? "rgba(255,255,255,.66)" : "#fff";
  const gone = out !== undefined ? clamp((t - out) / 0.28) : 0;
  const fx = wd.fx ? wd.fx(t) : {};
  const outer: React.CSSProperties = { display: "inline-block", position: "relative", transform: `translate(${fx.x ?? 0}px, ${fx.y ?? 0}px) rotate(${fx.r ?? 0}deg) scale(${fx.s ?? 1})` };
  const v = wd.v ?? "up";

  if (v === "punch") {
    const p = clamp(dt / 0.45), k = OVR(p), e = EXIT(gone);
    if (gone >= 1) return null;
    return <span style={outer}><span style={{ display: "inline-block", color: colour, textShadow: key ? "none" : shadow, transform: `translateY(${-70 * e}px) scale(${lerp(1.75, 1, k) * (1 - 0.4 * e)})`, opacity: 1 - e }}>{txt}</span></span>;
  }
  if (v === "pill") {
    const k = OVR(clamp(dt / 0.42)), e = EXIT(gone);
    if (gone >= 1) return null;
    return (
      <span style={outer}>
        <span style={{ display: "inline-block", direction: /[\u0600-\u06ff]/.test(txt) ? "rtl" : "ltr", unicodeBidi: "isolate", background: INK, color: "#fff", borderRadius: size, padding: "0.02em 0.42em 0.12em", transform: `scale(${Math.max(0, k * (1 - e))}) rotate(${-4 * (1 - k)}deg)`, boxShadow: "0 10px 24px rgba(80,25,0,.3)" }}>{txt}</span>
      </span>
    );
  }
  // the mask: the word rises out of it, and later lifts out through its top
  const up = 110 * (1 - ENT(clamp(dt / 0.38))), lift = -118 * EXIT(gone);
  const mask: React.CSSProperties = { display: "inline-block", overflow: "hidden", padding: "0.12em 0.04em 0.24em", margin: "-0.12em -0.04em -0.24em", verticalAlign: "bottom" };
  if (v === "bar") {
    const bar = ENT(clamp(dt / 0.24)), barOut = EXIT(gone);
    return (
      <span style={outer}>
        <span style={{ position: "absolute", left: "-0.18em", right: "-0.18em", top: "0.16em", bottom: "0.02em", background: INK, transformOrigin: "100% 50%", transform: `scaleX(${bar * (1 - barOut)})` }} />
        <span style={{ ...mask, position: "relative" }}>
          <span style={{ display: "inline-block", color: "#fff", transform: `translateY(${110 * (1 - ENT(clamp((dt - 0.08) / 0.36))) + lift}%)` }}>{txt}</span>
        </span>
      </span>
    );
  }
  if (v === "fill") {
    const f = wd.fill !== undefined ? ENT(clamp((t - wd.fill) / 0.32)) : 0;
    return (
      <span style={outer}>
        <span style={mask}>
          <span style={{ display: "inline-block", position: "relative", transform: `translateY(${up + lift}%)` }}>
            <span style={{ color: "transparent", WebkitTextStroke: `${Math.max(3, size * 0.022)}px ${colour}` }}>{txt}</span>
            <span style={{ position: "absolute", left: 0, top: 0, color: colour, textShadow: shadow, clipPath: `inset(0 0 0 ${100 - 100 * f}%)` }}>{txt}</span>
          </span>
        </span>
      </span>
    );
  }
  return (
    <span style={outer}>
      <span style={mask}>
        <span style={{ display: "inline-block", color: colour, textShadow: key ? "none" : shadow, transform: `translateY(${up + lift}%)` }}>{txt}</span>
      </span>
    </span>
  );
};

export const KLine: React.FC<{ t: number; top: number; size: number; words: KW[]; out?: number; align?: "c" | "r" | "l"; rot?: number; dim?: boolean; stretch?: number; x?: number; z?: number }> = ({ t, top, size, words, out, align = "c", rot = 0, dim, stretch = 0, x = 0, z = 30 }) => {
  if (t < words[0].t - 0.05 || (out !== undefined && t > out + 0.35)) return null;
  const side = align === "c" ? { left: 40, right: 40 } : align === "r" ? { right: 70, left: 20 } : { left: 70, right: 20 };
  return (
    <div style={{ position: "absolute", top, ...side, zIndex: z, textAlign: align === "c" ? "center" : align === "r" ? "right" : "left", whiteSpace: "nowrap", direction: "rtl", fontFamily: FONT, fontWeight: 400, fontSynthesis: "none", fontSize: size, lineHeight: 1.15, transform: `translateX(${x}px) rotate(${rot}deg)` }}>
      {words.map((wd, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <Word t={t} wd={wd} size={size} out={out} stretch={stretch} dim={dim} />
        </React.Fragment>
      ))}
    </div>
  );
};
