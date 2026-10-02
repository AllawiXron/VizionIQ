import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { Calculator, Eye, MessageSquareText, Sparkles, Target } from "lucide-react";
import { C, SAFE } from "../theme";
import { Eyebrow, Ltr, Sfx, Words, clamp, glass, silverText } from "../kit";

const QUESTION = "سعر الرسالة عندي 3 دولار وما دا أبيع.. شنو المشكلة؟";
const Q_FROM = 40;
const Q_CPS = 1.25; // characters per frame
const Q_TO = Q_FROM + Math.ceil(QUESTION.length / Q_CPS);
const THINK_TO = Q_TO + 22;
const ROWS = [
  { at: THINK_TO + 4, icon: Eye, title: "أول 3 ثواني ضعيفة", body: "الناس تعبر إعلانك قبل لا تفهم العرض" },
  { at: THINK_TO + 30, icon: Target, title: "الاستهداف واسع", body: "دا يجيك فضوليين مو مشترين" },
  { at: THINK_TO + 56, icon: MessageSquareText, title: "ردك يطفي الزبون", body: "جرّب هذا الرد بدال \"السعر بالخاص\":" },
];
const SCRIPT_AT = THINK_TO + 84;
const SCRIPT = "هلا بيك عيني، السعر 25 ألف والتوصيل مجاني لبغداد. أثبتلك الطلب باسمك؟";
const CAPTIONS = [
  { at: 0, text: "يشخّص وين دا تخسر" },
  { at: THINK_TO, text: "ويكتبلك الرد اللي يبيع" },
  { at: SCRIPT_AT + 46, text: "ويحسب ربحك بالدينار" },
];

/**
 * 6.9–17.4s. The product moment: the AI advisor's chat blooms open from a
 * pill (Liquid Glass), the seller types the problem, the advisor answers
 * with a diagnosis and a ready-to-send WhatsApp reply.
 */
export function Advisor() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Panel blooms like the Dynamic Island: width and height on different springs.
  const bx = spring({ frame: frame - 8, fps, config: { damping: 14, stiffness: 150, mass: 0.9 } });
  const by = spring({ frame: frame - 12, fps, config: { damping: 18, stiffness: 120, mass: 1 } });
  const panelOpacity = interpolate(frame, [8, 16], [0, 1], clamp);

  const typed = QUESTION.slice(0, Math.max(0, Math.floor((frame - Q_FROM) * Q_CPS)));
  const qBubble = spring({ frame: frame - (Q_FROM - 4), fps, config: { damping: 16, stiffness: 220 } });
  const thinking = frame >= Q_TO + 2 && frame < THINK_TO + 4;
  const answer = spring({ frame: frame - THINK_TO, fps, config: { damping: 17, stiffness: 180 } });
  const script = spring({ frame: frame - SCRIPT_AT, fps, config: { damping: 14, stiffness: 200 } });

  // Chat scrolls up as the conversation grows, like a real thread.
  const scroll = interpolate(frame, [SCRIPT_AT - 6, SCRIPT_AT + 14], [0, -150], clamp);

  const caption = [...CAPTIONS].reverse().find((c) => frame >= c.at)!;
  const capSpring = spring({ frame: frame - caption.at, fps, config: { damping: 15, stiffness: 190 } });

  return (
    <AbsoluteFill>
      {/* Title + rotating benefit caption */}
      <div style={{ position: "absolute", top: SAFE.top - 10, left: SAFE.side, right: SAFE.side, textAlign: "center" }}>
        <Eyebrow delay={0}>
          <Sparkles size={34} color={C.accent} strokeWidth={2.4} />
          الحل: مستشار فيزيون الذكي
        </Eyebrow>
        <div
          key={caption.at}
          style={{
            marginTop: 22,
            fontSize: 78,
            fontWeight: 900,
            ...silverText,
            opacity: interpolate(capSpring, [0, 0.4], [0, 1], clamp),
            transform: `translateY(${interpolate(capSpring, [0, 1], [36, 0])}px)`,
            filter: `blur(${interpolate(capSpring, [0, 0.8], [12, 0], clamp)}px)`,
          }}
        >
          {caption.text}
        </div>
      </div>

      {/* Chat panel */}
      <div
        style={{
          ...glass,
          position: "absolute",
          top: 470,
          left: SAFE.side - 20,
          right: SAFE.side - 20,
          height: 1050,
          borderRadius: 64,
          overflow: "hidden",
          opacity: panelOpacity,
          transform: `scale(${interpolate(bx, [0, 1], [0.3, 1])}, ${interpolate(by, [0, 1], [0.12, 1])})`,
          transformOrigin: "50% 0%",
          filter: `blur(${interpolate(by, [0, 0.8], [16, 0], clamp)}px)`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            padding: "30px 38px",
            borderBottom: "1.5px solid rgba(255,255,255,0.09)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 26,
              background: `linear-gradient(180deg, ${C.blueLight}, ${C.blueDeep})`,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 12px 30px rgba(47,107,255,0.45), inset 0 1.5px 0 rgba(255,255,255,0.35)",
            }}
          >
            <Sparkles size={46} color="#fff" strokeWidth={2.3} />
          </div>
          <div>
            <div style={{ fontSize: 40, fontWeight: 900 }}>مستشار فيزيون</div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 28, fontWeight: 700, color: C.green }}>
              <span style={{ width: 14, height: 14, borderRadius: 99, background: C.green, boxShadow: `0 0 12px ${C.green}` }} />
              متصل <Ltr>24/7</Ltr>
            </div>
          </div>
        </div>

        <div style={{ position: "relative", height: 905, overflow: "hidden" }}>
        <div style={{ padding: "34px 34px 0", display: "flex", flexDirection: "column", gap: 26, transform: `translateY(${scroll}px)` }}>
          {/* Seller's question (outgoing sits on the left in RTL chat) */}
          <div
            style={{
              alignSelf: "flex-end",
              maxWidth: "84%",
              padding: "24px 30px",
              borderRadius: 36,
              borderBottomLeftRadius: 10,
              background: `linear-gradient(180deg, ${C.blue}, ${C.blueDeep})`,
              fontSize: 36,
              fontWeight: 700,
              lineHeight: 1.45,
              minHeight: 58,
              opacity: interpolate(qBubble, [0, 0.4], [0, 1], clamp),
              transform: `scale(${interpolate(qBubble, [0, 1], [0.6, 1])})`,
              transformOrigin: "0% 100%",
              boxShadow: "0 16px 40px rgba(26,79,224,0.4)",
            }}
          >
            {typed}
            {frame < Q_TO + 6 && (
              <span style={{ opacity: Math.floor(frame / 8) % 2 ? 0 : 1, marginInlineStart: 4, fontWeight: 400 }}>|</span>
            )}
          </div>

          {thinking && <TypingDots frame={frame} />}

          {/* Diagnosis */}
          {frame >= THINK_TO && (
            <div
              style={{
                alignSelf: "flex-start",
                width: "92%",
                padding: "30px 32px",
                borderRadius: 40,
                borderBottomRightRadius: 12,
                background: "rgba(255,255,255,0.07)",
                border: "1.5px solid rgba(255,255,255,0.12)",
                opacity: interpolate(answer, [0, 0.4], [0, 1], clamp),
                transform: `scale(${interpolate(answer, [0, 1], [0.7, 1])})`,
                transformOrigin: "100% 100%",
              }}
            >
              <div style={{ fontSize: 30, fontWeight: 800, color: C.accent, marginBottom: 18 }}>التشخيص:</div>
              {ROWS.map((r, i) => {
                const s = spring({ frame: frame - r.at, fps, config: { damping: 15, stiffness: 200 } });
                const Icon = r.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      gap: 20,
                      alignItems: "flex-start",
                      marginTop: i ? 22 : 0,
                      opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
                      transform: `translateX(${interpolate(s, [0, 1], [-40, 0])}px)`,
                      filter: `blur(${interpolate(s, [0, 0.8], [8, 0], clamp)}px)`,
                    }}
                  >
                    <div
                      style={{
                        width: 62,
                        height: 62,
                        flexShrink: 0,
                        borderRadius: 20,
                        background: "rgba(47,107,255,0.18)",
                        border: "1.5px solid rgba(91,142,255,0.35)",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <Icon size={34} color={C.sky} strokeWidth={2.4} />
                    </div>
                    <div>
                      <div style={{ fontSize: 36, fontWeight: 900 }}>{r.title}</div>
                      <div style={{ fontSize: 30, fontWeight: 600, color: C.dim, marginTop: 4 }}>{r.body}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Ready-to-send WhatsApp reply */}
          {frame >= SCRIPT_AT && (
            <div
              style={{
                alignSelf: "flex-start",
                width: "92%",
                padding: "26px 30px",
                borderRadius: 34,
                background: "linear-gradient(180deg, rgba(61,220,151,0.16), rgba(61,220,151,0.07))",
                border: "1.5px solid rgba(61,220,151,0.45)",
                opacity: interpolate(script, [0, 0.4], [0, 1], clamp),
                transform: `scale(${interpolate(script, [0, 1], [0.75, 1])})`,
                transformOrigin: "100% 0%",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: C.green }}>رد واتساب جاهز</span>
                <span
                  style={{
                    fontSize: 26,
                    fontWeight: 800,
                    padding: "8px 20px",
                    borderRadius: 999,
                    background: frame > SCRIPT_AT + 30 ? C.green : "rgba(61,220,151,0.2)",
                    color: frame > SCRIPT_AT + 30 ? "#06301d" : C.green,
                  }}
                >
                  {frame > SCRIPT_AT + 30 ? "تم النسخ ✓" : "نسخ"}
                </span>
              </div>
              <div style={{ fontSize: 35, fontWeight: 700, lineHeight: 1.5 }}>{SCRIPT}</div>
            </div>
          )}
        </div>

        </div>

        {/* Profit chip slides in for the last caption */}
        <ProfitChip at={SCRIPT_AT + 46} />
      </div>

      <Sfx at={8} name="whoosh" volume={0.45} />
      {Array.from({ length: Math.ceil((Q_TO - Q_FROM) / 3) }).map((_, i) => (
        <Sfx key={i} at={Q_FROM + i * 3} name="type" volume={0.22} />
      ))}
      <Sfx at={THINK_TO} name="pop" volume={0.6} />
      {ROWS.map((r, i) => (
        <Sfx key={`r${i}`} at={r.at} name="tick" volume={0.55} />
      ))}
      <Sfx at={SCRIPT_AT} name="pop" volume={0.6} />
      <Sfx at={SCRIPT_AT + 30} name="chime" volume={0.5} />
      <Sfx at={SCRIPT_AT + 46} name="whoosh" volume={0.3} />
    </AbsoluteFill>
  );
}

function TypingDots({ frame }: { frame: number }) {
  return (
    <div
      style={{
        alignSelf: "flex-start",
        display: "flex",
        gap: 12,
        padding: "26px 32px",
        borderRadius: 34,
        background: "rgba(255,255,255,0.07)",
        border: "1.5px solid rgba(255,255,255,0.12)",
      }}
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 18,
            height: 18,
            borderRadius: 99,
            background: C.accent,
            opacity: 0.4 + 0.6 * Math.max(0, Math.sin((frame - i * 4) / 3.2)),
            transform: `translateY(${-6 * Math.max(0, Math.sin((frame - i * 4) / 3.2))}px)`,
          }}
        />
      ))}
    </div>
  );
}

function ProfitChip({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - at, fps, config: { damping: 14, stiffness: 180 } });
  if (frame < at) return null;
  const profit = Math.round(interpolate(frame, [at + 6, at + 40], [0, 11500], clamp) / 100) * 100;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 34,
        left: 34,
        right: 34,
        height: 128,
        borderRadius: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 34px",
        background: "linear-gradient(180deg, rgba(47,107,255,0.30), rgba(26,79,224,0.22))",
        border: "1.5px solid rgba(91,142,255,0.5)",
        boxShadow: "0 -20px 60px rgba(2,8,35,0.7)",
        opacity: interpolate(s, [0, 0.4], [0, 1], clamp),
        transform: `translateY(${interpolate(s, [0, 1], [160, 0])}px)`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 34, fontWeight: 800 }}>
        <Calculator size={40} color={C.accent} strokeWidth={2.4} />
        ربحك الصافي من الطلب
      </div>
      <div style={{ fontSize: 50, fontWeight: 900, color: C.green, fontVariantNumeric: "tabular-nums" }}>
        <Ltr>{profit.toLocaleString("en-US")}</Ltr> <span style={{ fontSize: 30 }}>د.ع</span>
      </div>
    </div>
  );
}
