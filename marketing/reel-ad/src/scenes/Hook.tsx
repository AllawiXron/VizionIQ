import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MessageCircle, PackageX } from "lucide-react";
import { C, SAFE } from "../theme";
import { Ltr, Sfx, Words, clamp, glass } from "../kit";

/** Frame each "بيش؟" notification lands. Front-loaded so the screen fills within a second. */
const PINGS = [3, 9, 14, 19, 23, 27, 31, 35, 39];
const NAMES = ["مصطفى", "زهراء", "أبو حيدر", "سارة", "علي الكرادة", "نور", "حسين", "أم يوسف", "كرار"];
const BODIES = ["بيش؟", "بيش؟ عيني", "بيش اخي", "السعر؟", "بيش؟", "بيش", "اكو توصيل؟ بيش", "بيش؟", "بيش"];
const SLAM = 52;
const GAP = 128;

/**
 * 0–3.5s. The hook: an inbox flooding with "بيش؟" (the price-only messages
 * every Iraqi seller knows) and then the punch — not a single order.
 */
export function Hook() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Camera shake that decays after the slam.
  const since = frame - SLAM;
  const shakeAmp = since >= 0 ? 14 * Math.exp(-since / 6) : 0;
  const shakeX = Math.sin(since * 2.7) * shakeAmp;
  const shakeY = Math.cos(since * 3.3) * shakeAmp * 0.6;

  const slam = spring({ frame: since, fps, config: { damping: 11, stiffness: 260, mass: 0.7 } });
  const messages = Math.round(interpolate(frame, [3, 48], [0, 127], clamp));

  return (
    <AbsoluteFill style={{ transform: `translate(${shakeX}px, ${shakeY}px)` }}>
      {/* Headline */}
      <div style={{ position: "absolute", top: SAFE.top + 10, left: SAFE.side, right: SAFE.side, textAlign: "center" }}>
        <Words text="إعلانك يجيب رسايل هواية…" delay={0} stagger={2} style={{ fontSize: 92, fontWeight: 900, lineHeight: 1.15 }} />
        <div
          style={{
            marginTop: 18,
            fontSize: 128,
            fontWeight: 900,
            lineHeight: 1.1,
            color: C.red,
            textShadow: "0 10px 50px rgba(255,92,108,0.35)",
            opacity: interpolate(slam, [0, 0.3], [0, 1], clamp),
            transform: `scale(${interpolate(slam, [0, 1], [1.9, 1])})`,
            filter: `blur(${interpolate(slam, [0, 0.7], [18, 0], clamp)}px)`,
          }}
        >
          بس ولا طلب!
        </div>
      </div>

      {/* Notification stack: newest lands on top and pushes the rest down. */}
      <div style={{ position: "absolute", top: 690, left: SAFE.side, right: SAFE.side, height: 700 }}>
        {PINGS.map((t, i) => {
          const land = spring({ frame: frame - t, fps, config: { damping: 15, stiffness: 230, mass: 0.7 } });
          // Smoothly pushed down by every newer notification.
          const depth = PINGS.slice(i + 1).reduce(
            (sum, tj) => sum + spring({ frame: frame - tj, fps, config: { damping: 18, stiffness: 220, mass: 0.7 } }),
            0
          );
          if (frame < t) return null;
          const scale = interpolate(depth, [0, 5], [1, 0.84], clamp) * interpolate(land, [0, 1], [0.6, 1]);
          const opacity = interpolate(depth, [3.2, 4.6], [1, 0], clamp) * interpolate(land, [0, 0.4], [0, 1], clamp);
          const y = depth * GAP * interpolate(depth, [0, 5], [1, 0.82], clamp) + interpolate(land, [0, 1], [-90, 0]);
          // After the slam, the whole pile dims: messages that never turned into money.
          const dimmed = interpolate(frame, [SLAM, SLAM + 10], [1, 0.45], clamp);
          return (
            <div
              key={i}
              style={{
                ...glass,
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 112,
                borderRadius: 34,
                display: "flex",
                alignItems: "center",
                gap: 22,
                padding: "0 26px",
                transform: `translateY(${y}px) scale(${scale})`,
                filter: `blur(${interpolate(land, [0, 0.7], [10, 0], clamp)}px)`,
                opacity: opacity * dimmed,
                zIndex: 100 - Math.round(depth),
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: 18,
                  background: "linear-gradient(180deg,#3ee07a,#1fb85a)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <MessageCircle size={40} color="#fff" strokeWidth={2.4} fill="#fff" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={{ fontSize: 32, fontWeight: 800 }}>{NAMES[i]}</span>
                  <span style={{ fontSize: 24, color: C.faint, fontWeight: 700 }}>هسة</span>
                </div>
                <div style={{ fontSize: 34, color: C.dim, fontWeight: 700, marginTop: 2 }}>{BODIES[i]}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Scoreboard */}
      <div style={{ position: "absolute", top: 1400, left: SAFE.side, right: SAFE.side, display: "flex", gap: 22 }}>
        <Stat icon={<MessageCircle size={40} color={C.sky} strokeWidth={2.5} />} label="رسائل" value={<Ltr>{messages}</Ltr>} color={C.white} />
        <Stat
          icon={<PackageX size={40} color={C.red} strokeWidth={2.5} />}
          label="طلبات"
          value={<Ltr>0</Ltr>}
          color={C.red}
          pop={frame < SLAM ? 1 : interpolate(slam, [0, 1], [1.25, 1])}
          ring={frame >= SLAM}
        />
      </div>

      {PINGS.map((t, i) => (
        <Sfx key={i} at={t} name="pop" volume={0.55 - i * 0.03} />
      ))}
      <Sfx at={SLAM - 2} name="impact" volume={0.95} />
    </AbsoluteFill>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
  pop = 1,
  ring = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color: string;
  pop?: number;
  ring?: boolean;
}) {
  return (
    <div
      style={{
        ...glass,
        flex: 1,
        height: 150,
        borderRadius: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        transform: `scale(${pop})`,
        border: ring ? "2px solid rgba(255,92,108,0.55)" : glass.border,
        boxShadow: ring ? "0 0 0 8px rgba(255,92,108,0.10), 0 30px 80px rgba(0,0,0,0.38)" : glass.boxShadow,
      }}
    >
      {icon}
      <span style={{ fontSize: 40, fontWeight: 800, color: C.dim }}>{label}</span>
      <span style={{ fontSize: 76, fontWeight: 900, color, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
