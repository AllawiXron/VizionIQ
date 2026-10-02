import React from "react";
import { AbsoluteFill, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BookOpen, Bot, ShoppingBag, Target, TrendingDown, Wrench } from "lucide-react";
import { C, SAFE } from "../theme";
import { Ltr, Sfx, Words, clamp, easeOut, glass, useSpringAt } from "../kit";

const DROP_FROM = 16;
const DROP_TO = 74;
const ROWS = [
  { at: 66, icon: TrendingDown, text: "تنزّل سعر الرسالة لأقل شي" },
  { at: 80, icon: Target, text: "توصل للزبون الجاد مو الفضولي" },
  { at: 94, icon: ShoppingBag, text: "تحوّل الرسايل لطلبات ومبيعات" },
];
const PILLS = [
  { at: 124, icon: BookOpen, text: "11 فصل عملي" },
  { at: 131, icon: Wrench, text: "13 أداة جاهزة" },
  { at: 138, icon: Bot, text: "مستشار 24/7" },
];

/** 17.1–23.6s. The outcome: cost per message falls into the green, then what the course teaches. */
export function Results() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const card = useSpringAt(4);

  const value = interpolate(frame, [DROP_FROM, DROP_TO], [3.4, 1.2], { ...clamp, easing: easeOut });
  const t = interpolate(value, [1.2, 3.4], [1, 0]);
  const color = interpolateColors(t, [0, 0.55, 1], [C.red, "#ffb547", C.green]);
  const landed = spring({ frame: frame - DROP_TO, fps, config: { damping: 9, stiffness: 280, mass: 0.6 } });

  // Semicircle gauge: arc length tracks the cost (0..$4).
  const R = 290;
  const arcLen = Math.PI * R;
  const fill = (value / 4) * arcLen;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side, textAlign: "center" }}>
        <Words text="ويا الكورس تتعلم شلون…" stagger={3} style={{ fontSize: 84, fontWeight: 900 }} />
      </div>

      {/* Gauge */}
      <div
        style={{
          ...glass,
          position: "absolute",
          top: 420,
          left: SAFE.side,
          right: SAFE.side,
          height: 540,
          borderRadius: 60,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: card,
          transform: `translateY(${interpolate(card, [0, 1], [90, 0])}px) scale(${interpolate(card, [0, 1], [0.9, 1])})`,
        }}
      >
        <svg width={700} height={350} viewBox="-350 -320 700 350" style={{ marginTop: 40 }}>
          <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0`} stroke="rgba(255,255,255,0.08)" strokeWidth={36} fill="none" strokeLinecap="round" />
          <path
            d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0`}
            stroke={color}
            strokeWidth={36}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${fill} ${arcLen}`}
            style={{ filter: `drop-shadow(0 0 18px ${color}88)` }}
          />
        </svg>
        <div style={{ position: "absolute", top: 150, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 38, fontWeight: 800, color: C.dim }}>
            <TrendingDown size={42} color={color} strokeWidth={2.6} />
            سعر الرسالة
          </div>
          <div
            style={{
              fontSize: 190,
              fontWeight: 900,
              lineHeight: 1,
              marginTop: 8,
              color,
              fontVariantNumeric: "tabular-nums",
              transform: `scale(${interpolate(landed, [0, 1], [1.12, 1])})`,
            }}
          >
            <Ltr>${value.toFixed(2)}</Ltr>
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 34,
            display: "flex",
            alignItems: "center",
            gap: 18,
            opacity: interpolate(landed, [0, 0.5], [0, 1], clamp),
            transform: `scale(${interpolate(landed, [0, 1], [0.7, 1])})`,
          }}
        >
          <span
            style={{
              padding: "10px 26px",
              borderRadius: 999,
              background: "rgba(61,220,151,0.16)",
              border: "1.5px solid rgba(61,220,151,0.45)",
              color: C.green,
              fontSize: 32,
              fontWeight: 800,
            }}
          >
            الهدف: أقل من <Ltr>$1.5</Ltr> للرسالة
          </span>
          <span style={{ fontSize: 22, color: C.faint, fontWeight: 600 }}>*مثال توضيحي</span>
        </div>
      </div>

      {/* What you learn */}
      <div style={{ position: "absolute", top: 1000, left: SAFE.side, right: SAFE.side, display: "flex", flexDirection: "column", gap: 18 }}>
        {ROWS.map((r, i) => {
          const s = spring({ frame: frame - r.at, fps, config: { damping: 15, stiffness: 200 } });
          const Icon = r.icon;
          return (
            <div
              key={i}
              style={{
                ...glass,
                height: 104,
                borderRadius: 34,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 28px",
                opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
                transform: `translateX(${interpolate(s, [0, 1], [-120, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})`,
                filter: `blur(${interpolate(s, [0, 0.8], [10, 0], clamp)}px)`,
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 20,
                  background: `linear-gradient(180deg, ${C.blueLight}, ${C.blueDeep})`,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={36} color="#fff" strokeWidth={2.4} />
              </div>
              <span style={{ fontSize: 40, fontWeight: 800 }}>{r.text}</span>
            </div>
          );
        })}
      </div>

      {/* Course at a glance */}
      <div style={{ position: "absolute", top: 1400, left: SAFE.side - 20, right: SAFE.side - 20, display: "flex", gap: 14, justifyContent: "center" }}>
        {PILLS.map((p, i) => {
          const s = spring({ frame: frame - p.at, fps, config: { damping: 12, stiffness: 240 } });
          const Icon = p.icon;
          return (
            <div
              key={i}
              style={{
                ...glass,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 22px",
                borderRadius: 999,
                fontSize: 30,
                fontWeight: 800,
                whiteSpace: "nowrap",
                opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
                transform: `scale(${interpolate(s, [0, 1], [0.5, 1])})`,
              }}
            >
              <Icon size={30} color={C.accent} strokeWidth={2.4} />
              <DigitsLtr text={p.text} />
            </div>
          );
        })}
      </div>

      <Sfx at={0} name="whoosh" volume={0.45} />
      {Array.from({ length: 10 }).map((_, i) => (
        <Sfx key={i} at={DROP_FROM + i * 5} name="tick" volume={0.4} />
      ))}
      <Sfx at={DROP_TO} name="chime" volume={0.6} />
      {ROWS.map((r, i) => (
        <Sfx key={`r${i}`} at={r.at} name="pop" volume={0.45} />
      ))}
      {PILLS.map((p, i) => (
        <Sfx key={`p${i}`} at={p.at} name="tick" volume={0.5} />
      ))}
    </AbsoluteFill>
  );
}

/** Keeps Latin digits inside the pill's Arabic text in visual order. */
function DigitsLtr({ text }: { text: string }) {
  const parts = text.split(/(\d+(?:\/\d+)?)/);
  return (
    <span>
      {parts.map((part, i) => (/\d/.test(part) ? <Ltr key={i}>{part}</Ltr> : <React.Fragment key={i}>{part}</React.Fragment>))}
    </span>
  );
}

