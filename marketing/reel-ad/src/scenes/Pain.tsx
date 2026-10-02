import React from "react";
import { AbsoluteFill, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { TrendingUp, Wallet } from "lucide-react";
import { C, SAFE } from "../theme";
import { Ltr, Sfx, Words, clamp, easeOut, glass, useSpringAt } from "../kit";

const TICK_FROM = 14;
const TICK_TO = 58;
const DRAIN_FROM = 26;
const DRAIN_TO = 92;
const PUNCH = 72;

/** 3.3–7.3s. The pain, in numbers: cost per message climbs while the budget drains to nothing. */
export function Pain() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cpm = interpolate(frame, [TICK_FROM, TICK_TO], [0.8, 3.4], { ...clamp, easing: easeOut });
  const budget = interpolate(frame, [DRAIN_FROM, DRAIN_TO], [100, 6], { ...clamp, easing: easeOut });
  const spent = Math.round(((100 - budget) / 94) * 340);

  const card1 = useSpringAt(4);
  const card2 = useSpringAt(16);
  const settle = spring({ frame: frame - TICK_TO, fps, config: { damping: 9, stiffness: 300, mass: 0.6 } });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: SAFE.top + 20, left: SAFE.side, right: SAFE.side, textAlign: "center" }}>
        <Words text="وكل رسالة دا تدفع عليها" stagger={3} style={{ fontSize: 88, fontWeight: 900, lineHeight: 1.15 }} />
      </div>

      {/* Cost per message */}
      <div
        style={{
          ...glass,
          position: "absolute",
          top: 520,
          left: SAFE.side,
          right: SAFE.side,
          height: 420,
          borderRadius: 56,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          opacity: card1,
          transform: `translateY(${interpolate(card1, [0, 1], [80, 0])}px) scale(${interpolate(card1, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 44, fontWeight: 800, color: C.dim }}>
          <TrendingUp size={48} color={C.red} strokeWidth={2.6} />
          سعر الرسالة
        </div>
        <div
          style={{
            fontSize: 220,
            fontWeight: 900,
            lineHeight: 1,
            marginTop: 18,
            color: interpolate(cpm, [0.8, 3.4], [0, 1]) > 0.5 ? C.red : C.white,
            textShadow: "0 20px 70px rgba(255,92,108,0.35)",
            transform: `scale(${interpolate(settle, [0, 1], [1.12, 1])})`,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <Ltr>${cpm.toFixed(2)}</Ltr>
        </div>
      </div>

      {/* Budget draining */}
      <div
        style={{
          ...glass,
          position: "absolute",
          top: 990,
          left: SAFE.side,
          right: SAFE.side,
          height: 300,
          borderRadius: 48,
          padding: "40px 46px",
          opacity: card2,
          transform: `translateY(${interpolate(card2, [0, 1], [80, 0])}px) scale(${interpolate(card2, [0, 1], [0.9, 1])})`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 42, fontWeight: 800 }}>
            <Wallet size={44} color={C.accent} strokeWidth={2.4} />
            ميزانية الإعلان
          </div>
          <div style={{ fontSize: 42, fontWeight: 900, color: C.red }}>
            <Ltr>-${spent}</Ltr>
          </div>
        </div>
        <div style={{ position: "relative", height: 46, marginTop: 34, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
          <div
            style={{
              position: "absolute",
              insetBlock: 0,
              right: 0,
              width: `${budget}%`,
              borderRadius: 999,
              background:
                budget > 40 ? `linear-gradient(90deg, ${C.blueLight}, ${C.blue})` : `linear-gradient(90deg, #ff8a95, ${C.red})`,
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26, fontSize: 34, fontWeight: 700, color: C.dim }}>
          <span>طلبات: <Ltr style={{ color: C.red, fontWeight: 900 }}>0</Ltr></span>
          <span><Ltr>{Math.round(budget)}%</Ltr> باقي</span>
        </div>
        {/* Bills flying out of the bar: the budget leaving. */}
        {Array.from({ length: 9 }).map((_, i) => {
          const start = DRAIN_FROM + i * 7;
          const p = interpolate(frame, [start, start + 34], [0, 1], clamp);
          if (p <= 0 || p >= 1) return null;
          const x = 120 + random(`x${i}`) * 640;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 100,
                left: x + Math.sin(p * 6 + i) * 30,
                transform: `translateY(${-p * 300}px) rotate(${(random(`r${i}`) - 0.5) * 60 * p}deg)`,
                opacity: interpolate(p, [0, 0.15, 0.7, 1], [0, 1, 0.8, 0]),
                filter: `blur(${p * 6}px)`,
                width: 74,
                height: 44,
                borderRadius: 10,
                background: "linear-gradient(180deg,#7ee2a8,#3cb878)",
                color: "#0b3b22",
                fontWeight: 900,
                fontSize: 30,
                display: "grid",
                placeItems: "center",
              }}
            >
              $
            </div>
          );
        })}
      </div>

      {/* Punchline: the last word drifts away like the money. */}
      <div style={{ position: "absolute", top: 1360, left: SAFE.side, right: SAFE.side, textAlign: "center" }}>
        <Words
          text="وفلوسك دا تروح بالهوا"
          delay={PUNCH}
          stagger={3}
          style={{ fontSize: 80, fontWeight: 900 }}
          wordStyle={(i) =>
            i === 3
              ? {
                  color: C.red,
                  transform: `translateY(${interpolate(frame, [PUNCH + 22, PUNCH + 46], [0, -40], clamp)}px)`,
                  filter: `blur(${interpolate(frame, [PUNCH + 22, PUNCH + 46], [0, 6], clamp)}px)`,
                  opacity: interpolate(frame, [PUNCH + 9, PUNCH + 14, PUNCH + 26, PUNCH + 46], [0, 1, 1, 0.35], clamp),
                }
              : undefined
          }
        />
      </div>

      <Sfx at={0} name="whoosh" volume={0.5} />
      {Array.from({ length: 11 }).map((_, i) => (
        <Sfx key={i} at={TICK_FROM + i * 4} name="tick" volume={0.5} />
      ))}
      <Sfx at={TICK_TO} name="pop" volume={0.6} />
      <Sfx at={PUNCH + 6} name="whoosh" volume={0.35} />
    </AbsoluteFill>
  );
}
