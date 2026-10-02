import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ArrowLeft, Bot, Infinity as InfinityIcon } from "lucide-react";
import { C, SAFE } from "../theme";
import { Logo, Ltr, Sfx, Words, clamp, glass, silverText, useSpringAt } from "../kit";

/** Prices and link as shown on the website's pricing section. */
const COURSE_PRICE = "29,000";
const ADVISOR_PRICE = "14,000";
const SITE = "vizion-app.com";
const TAP = 112;

/** 23.3–30s. The close: one clear line, the offer, a button that gets pressed. */
export function Cta() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logo = useSpringAt(2, { damping: 12, stiffness: 160 });
  const card = useSpringAt(40);
  const button = useSpringAt(66, { damping: 12, stiffness: 200 });
  const link = useSpringAt(84);

  // The tap: finger lands, button sinks and springs back, ripple spreads.
  const press = frame >= TAP && frame < TAP + 5 ? interpolate(frame, [TAP, TAP + 2, TAP + 5], [1, 0.93, 0.95], clamp) : 1;
  const release = spring({ frame: frame - (TAP + 5), fps, config: { damping: 8, stiffness: 320, mass: 0.6 } });
  const btnScale = frame < TAP + 5 ? press : interpolate(release, [0, 1], [0.95, 1]);
  const ripple = interpolate(frame, [TAP, TAP + 26], [0, 1], clamp);
  const finger = interpolate(frame, [TAP - 18, TAP, TAP + 14, TAP + 26], [0, 1, 1, 0], clamp);
  const fingerY = interpolate(frame, [TAP - 18, TAP], [90, 0], clamp);

  // Light sweep across the button, repeating every 1.5s once it is in.
  const sweep = ((frame - 70) % 45) / 45;

  return (
    <AbsoluteFill>
      {/* Brand */}
      <div
        style={{
          position: "absolute",
          top: SAFE.top - 10,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          opacity: logo,
          transform: `scale(${interpolate(logo, [0, 1], [0.6, 1])})`,
        }}
      >
        <Logo size={110} />
        <div>
          <div style={{ fontSize: 62, fontWeight: 900, lineHeight: 1 }}>فيزيون</div>
          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: "0.3em", color: C.faint, marginTop: 6 }}>VIZION</div>
        </div>
      </div>

      {/* The line */}
      <div style={{ position: "absolute", top: 420, left: SAFE.side, right: SAFE.side, textAlign: "center" }}>
        <Words text="لا تصرف ولا دولار بعد" delay={10} stagger={3} style={{ fontSize: 86, fontWeight: 900, lineHeight: 1.15 }} />
        <Words
          text="بدون خطة."
          delay={24}
          stagger={4}
          style={{ fontSize: 112, fontWeight: 900, lineHeight: 1.2, marginTop: 4 }}
          wordStyle={() => ({ color: C.blueLight, textShadow: "0 10px 50px rgba(47,107,255,0.45)" })}
        />
      </div>

      {/* Offer */}
      <div
        style={{
          ...glass,
          position: "absolute",
          top: 790,
          left: SAFE.side,
          right: SAFE.side,
          borderRadius: 56,
          padding: "40px 44px 36px",
          textAlign: "center",
          opacity: card,
          transform: `translateY(${interpolate(card, [0, 1], [90, 0])}px) scale(${interpolate(card, [0, 1], [0.9, 1])})`,
          filter: `blur(${interpolate(card, [0, 0.8], [14, 0], clamp)}px)`,
        }}
      >
        <div style={{ fontSize: 38, fontWeight: 800, color: C.dim }}>الكورس الكامل + كل أدوات المنصة</div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16, marginTop: 6 }}>
          <span style={{ fontSize: 150, fontWeight: 900, lineHeight: 1.05, ...silverText }}>
            <Ltr>{COURSE_PRICE}</Ltr>
          </span>
          <span style={{ fontSize: 46, fontWeight: 900, color: C.accent }}>د.ع</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontSize: 34, fontWeight: 800, color: C.green }}>
          <InfinityIcon size={40} color={C.green} strokeWidth={2.6} />
          دفعة وحدة • مدى الحياة
        </div>
        <div
          style={{
            marginTop: 26,
            paddingTop: 24,
            borderTop: "1.5px solid rgba(255,255,255,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
            fontSize: 32,
            fontWeight: 700,
            color: C.dim,
          }}
        >
          <Bot size={36} color={C.sky} strokeWidth={2.4} />
          المستشار الذكي: <Ltr style={{ color: C.white, fontWeight: 900 }}>{ADVISOR_PRICE}</Ltr> د.ع / شهرياً
        </div>
      </div>

      {/* Button */}
      <div
        style={{
          position: "absolute",
          top: 1268,
          left: SAFE.side,
          right: SAFE.side,
          height: 150,
          opacity: button,
          transform: `translateY(${interpolate(button, [0, 1], [70, 0])}px) scale(${interpolate(button, [0, 1], [0.8, 1]) * btnScale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 999,
            overflow: "hidden",
            background: `linear-gradient(180deg, ${C.blueLight} 0%, ${C.blue} 50%, ${C.blueDeep} 100%)`,
            boxShadow: "0 24px 60px rgba(47,107,255,0.5), inset 0 2px 0 rgba(255,255,255,0.4), inset 0 -3px 0 rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 22,
            fontSize: 62,
            fontWeight: 900,
          }}
        >
          اشترك هسة
          <ArrowLeft size={60} color="#fff" strokeWidth={3} />
          {frame > 70 && (
            <div
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                width: 220,
                left: `${interpolate(sweep, [0, 0.6], [-30, 130], clamp)}%`,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
                transform: "skewX(-20deg)",
              }}
            />
          )}
          {ripple > 0 && ripple < 1 && (
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 900,
                height: 900,
                marginLeft: -450,
                marginTop: -450,
                borderRadius: 999,
                background: "rgba(255,255,255,0.35)",
                transform: `scale(${ripple})`,
                opacity: 1 - ripple,
              }}
            />
          )}
        </div>
        {/* Fingertip */}
        <div
          style={{
            position: "absolute",
            left: "56%",
            top: 50 + fingerY,
            width: 92,
            height: 92,
            borderRadius: 999,
            background: "rgba(255,255,255,0.32)",
            border: "3px solid rgba(255,255,255,0.75)",
            boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
            opacity: finger,
            transform: `scale(${frame >= TAP && frame < TAP + 6 ? 0.85 : 1})`,
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          top: 1448,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 36,
          fontWeight: 800,
          color: C.dim,
          opacity: link,
          transform: `translateY(${interpolate(link, [0, 1], [30, 0])}px)`,
        }}
      >
        الرابط بالبايو • <Ltr style={{ color: C.white }}>{SITE}</Ltr>
      </div>

      <Sfx at={0} name="whoosh" volume={0.5} />
      <Sfx at={2} name="impact" volume={0.45} />
      <Sfx at={40} name="pop" volume={0.5} />
      <Sfx at={66} name="pop" volume={0.6} />
      <Sfx at={TAP} name="tick" volume={0.8} />
      <Sfx at={TAP + 2} name="chime" volume={0.6} />
    </AbsoluteFill>
  );
}
