import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C } from "../theme";
import { Sfx, clamp, easeOut } from "../kit";
import { P } from "./camera";
import { Beat, Bold, CrossOut, Emoji, FlyCard, HandCircle, Lead, Mark, N, Place, Pop, Strike, VZLogo, useSpr } from "./k";

/* ------------------------------------------------------------------ */
/* 0:00 Hook — the inbox fills with "بيش؟"                             */
/* ------------------------------------------------------------------ */

const ASKS = [
  { x: -300, y: -330, at: 6, r: -7 },
  { x: 70, y: -440, at: 11, r: 5 },
  { x: 320, y: -300, at: 15, r: 8 },
  { x: -150, y: 270, at: 19, r: 6 },
  { x: 270, y: 250, at: 23, r: -6 },
  { x: -330, y: 440, at: 27, r: -4 },
  { x: 160, y: 440, at: 31, r: 7 },
];

export function HookBeat() {
  return (
    <Beat {...P.hook} from={0} to={70}>
      <Place x={300} y={-560}>
        <Emoji name="speech" at={-4} size={210} rot={-25} />
      </Place>
      <Place x={0} y={-60}>
        <Lead text="إعلانك يجيب رسايل" at={-3} size={66} stagger={3} />
        <Bold text="هواية…" at={9} size={140} />
      </Place>
      {ASKS.map((a, i) => (
        <Place key={i} x={a.x} y={a.y}>
          <Pop at={a.at} from={0.2}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px 28px",
                borderRadius: 999,
                background: "#ffffff",
                color: C.navyLight,
                fontSize: 46,
                fontWeight: 900,
                transform: `rotate(${a.r}deg)`,
                boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
              }}
            >
              <span style={{ width: 22, height: 22, borderRadius: 99, background: "#25d366" }} />
              بيش؟
            </div>
          </Pop>
        </Place>
      ))}
      {ASKS.map((a, i) => (
        <Sfx key={i} at={a.at} name="pop" volume={0.5} />
      ))}
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:01.7 Punch — "بس ولا طلب!"                                         */
/* ------------------------------------------------------------------ */

export function PunchBeat() {
  return (
    <Beat {...P.punch} from={50} to={122}>
      <Place x={0} y={-320}>
        <Emoji name="scream" at={58} size={270} rot={20} />
      </Place>
      <Place x={0} y={0}>
        <Mark text="بس ولا طلب!" at={57} size={128} bg="#ff4d5e" />
      </Place>
      <Place x={0} y={200}>
        <Pop at={74}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 52, fontWeight: 300, color: "rgba(255,255,255,0.8)" }}>
            <Emoji name="package" at={74} size={92} float={false} />
            طلبات اليوم: <N style={{ fontWeight: 900, color: "#ff4d5e", fontSize: 72 }}>0</N>
          </div>
        </Pop>
      </Place>
      <Sfx at={50} name="whoosh" volume={0.55} />
      <Sfx at={59} name="impact" volume={0.95} />
      <Sfx at={74} name="pop" volume={0.5} />
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:03.5 Cost — "وكل رسالة دا تدفع عليها"                              */
/* ------------------------------------------------------------------ */

export function CostBeat() {
  const f = useCurrentFrame();
  const price = interpolate(f, [132, 156], [0.8, 3.4], { ...clamp, easing: easeOut });
  // Coin drops in spinning on its vertical axis.
  const drop = useSpr(114, { damping: 10, stiffness: 160 });
  const spin = Math.cos(Math.max(0, f - 114) / 3.2);
  return (
    <Beat {...P.cost} from={104} to={185}>
      <Place x={-250} y={-330}>
        <div style={{ transform: `translateY(${(1 - drop) * -500}px) scaleX(${f < 114 ? 0 : Math.max(0.15, Math.abs(spin))})`, opacity: f < 114 ? 0 : 1 }}>
          <Emoji name="coin" at={114} size={200} rot={0} />
        </div>
      </Place>
      <Place x={0} y={-60}>
        <Lead text="وكل رسالة" at={110} size={66} />
        <Bold text="دا تدفع عليها" at={118} size={116} />
      </Place>
      <Place x={0} y={160}>
        <Mark at={130} size={84} bg="#ff4d5e">
          <div style={{ display: "flex", alignItems: "baseline", gap: 18, fontSize: 84, fontWeight: 900, color: "#fff" }}>
            <N style={{ fontVariantNumeric: "tabular-nums" }}>${price.toFixed(2)}</N>
            <span style={{ fontSize: 46, fontWeight: 500 }}>للرسالة</span>
          </div>
        </Mark>
      </Place>
      <Sfx at={104} name="whoosh" volume={0.55} />
      <Sfx at={116} name="pop" volume={0.45} />
      {Array.from({ length: 8 }).map((_, i) => (
        <Sfx key={i} at={132 + i * 3} name="tick" volume={0.45} />
      ))}
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:05.4 Burn — "وفلوسك دا تروح بالهوا"                                */
/* ------------------------------------------------------------------ */

const BILLS = [
  { at: 172, x: 260, y: 160, size: 220 },
  { at: 180, x: -280, y: 230, size: 190 },
  { at: 188, x: 60, y: 330, size: 240 },
];

export function BurnBeat() {
  const f = useCurrentFrame();
  return (
    <Beat {...P.burn} from={160} to={230}>
      <Place x={0} y={-80}>
        <Lead text="وفلوسك دا تروح" at={166} size={66} />
        <Bold text="بالهوا" at={176} size={170} />
      </Place>
      {BILLS.map((b, i) => {
        const t = interpolate(f, [b.at, b.at + 46], [0, 1], { ...clamp, easing: (x) => x * x });
        if (f < b.at) return null;
        return (
          <Place key={i} x={b.x - t * 760} y={b.y - t * 1050}>
            <div style={{ transform: `rotate(${-18 + Math.sin((f - b.at) / 2.4) * 10}deg)`, filter: `blur(${t * 5}px)`, opacity: 1 - interpolate(t, [0.75, 1], [0, 1], clamp) }}>
              <Emoji name="money-wings" at={b.at} size={b.size} rot={0} float={false} />
            </div>
          </Place>
        );
      })}
      <Sfx at={160} name="whoosh" volume={0.3} />
      {BILLS.map((b, i) => (
        <Sfx key={i} at={b.at + 4} name="whoosh" volume={0.25} />
      ))}
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:07 Advisor intro — "هنا يجي مستشار فيزيون الذكي"                   */
/* ------------------------------------------------------------------ */

export function AdvisorBeat() {
  const f = useCurrentFrame();
  const fade = interpolate(f, [282, 296], [1, 0], clamp);
  return (
    <Beat {...P.advisor} from={211} to={298}>
      <div style={{ opacity: fade }}>
        <Place x={0} y={-430}>
          <VZLogo size={170} at={222} />
        </Place>
        <Place x={0} y={-220}>
          <Lead text="هنا يجي" at={226} size={66} />
        </Place>
        <Place x={0} y={-100}>
          <Mark text="مستشار فيزيون الذكي" at={232} size={96} kind="select" />
        </Place>
        <Place x={0} y={250}>
          <FlyCard at={240} from={{ x: 520, y: 620, r: 38 }} tilt={-3}>
            <div
              style={{
                width: 400,
                padding: "24px 26px 30px",
                borderRadius: 48,
                background: `linear-gradient(180deg, #3d8bff, ${C.blue})`,
                boxShadow: "0 30px 70px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.35)",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 14 }}>
                يشتغل <N>24/7</N>
              </div>
              <div style={{ background: "#fff", borderRadius: 32, height: 250, display: "grid", placeItems: "center" }}>
                <Emoji name="robot" at={246} size={210} rot={10} />
              </div>
            </div>
          </FlyCard>
        </Place>
      </div>
      <Sfx at={222} name="impact" volume={0.35} />
      <Sfx at={232} name="pop" volume={0.5} />
      <Sfx at={240} name="whoosh" volume={0.45} />
      <Sfx at={250} name="pop" volume={0.5} />
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:09 Chat — diagnosis                                               */
/* ------------------------------------------------------------------ */

const QUESTION = "سعر الرسالة 3 دولار وما دا أبيع، شنو المشكلة؟";
const Q_FROM = 290;
const Q_TO = Q_FROM + Math.ceil(QUESTION.length / 1.4);
const DIAG = [
  { at: 338, text: "أول 3 ثواني من الفيديو ضعيفة" },
  { at: 346, text: "الاستهداف واسع: يجيك فضوليين" },
  { at: 354, text: "ردك عالواتساب يطفي الزبون" },
];

export function ChatBeat() {
  const f = useCurrentFrame();
  const typed = QUESTION.slice(0, Math.max(0, Math.floor((f - Q_FROM) * 1.4)));
  const thinking = f > Q_TO + 1 && f < 338;
  return (
    <Beat {...P.chat} from={270} to={400}>
      <Place x={0} y={-590}>
        <Lead text="تحجيله شنو صاير بإعلانك" at={280} size={60} />
      </Place>
      <Place x={0} y={-150}>
        <Pop at={278} from={0.6}>
          <div
            style={{
              width: 860,
              padding: 20,
              borderRadius: 54,
              background: `linear-gradient(180deg, #3d8bff, ${C.blue})`,
              boxShadow: "0 30px 80px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.35)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "6px 14px 18px" }}>
              <div style={{ width: 70, height: 70, borderRadius: 22, background: "#fff", display: "grid", placeItems: "center" }}>
                <Emoji name="robot" at={278} size={58} float={false} rot={0} />
              </div>
              <div>
                <div style={{ fontSize: 38, fontWeight: 900 }}>مستشار فيزيون</div>
                <div style={{ fontSize: 26, fontWeight: 500, color: "#c9ffe4" }}>● متصل الآن</div>
              </div>
            </div>
            <div style={{ background: "#fff", borderRadius: 38, padding: "28px 26px", minHeight: 470, display: "flex", flexDirection: "column", gap: 18, color: C.navyLight }}>
              <div
                style={{
                  alignSelf: "flex-end",
                  maxWidth: "88%",
                  padding: "20px 26px",
                  borderRadius: 30,
                  borderBottomLeftRadius: 8,
                  background: C.blue,
                  color: "#fff",
                  fontSize: 34,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  minHeight: 50,
                  opacity: f < Q_FROM - 2 ? 0 : 1,
                }}
              >
                {typed}
                {f < Q_TO + 4 && <span style={{ opacity: Math.floor(f / 7) % 2 ? 0 : 1, fontWeight: 300 }}>|</span>}
              </div>
              {thinking && (
                <div style={{ alignSelf: "flex-start", display: "flex", gap: 10, padding: "20px 26px", borderRadius: 30, background: "#eef3ff" }}>
                  {[0, 1, 2].map((i) => (
                    <span key={i} style={{ width: 16, height: 16, borderRadius: 99, background: C.blue, opacity: 0.35 + 0.65 * Math.max(0, Math.sin((f - i * 4) / 3)) }} />
                  ))}
                </div>
              )}
              {f >= 336 && (
                <div style={{ alignSelf: "flex-start", width: "94%", padding: "22px 26px", borderRadius: 30, borderBottomRightRadius: 8, background: "#eef3ff" }}>
                  <div style={{ fontSize: 28, fontWeight: 900, color: C.blue, marginBottom: 10 }}>التشخيص:</div>
                  {DIAG.map((d, i) => (
                    <Pop key={i} at={d.at} from={0.7} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: i ? 12 : 0 }}>
                      <Emoji name="cross" at={d.at} size={44} float={false} rot={0} />
                      <span style={{ fontSize: 34, fontWeight: 800 }}>{d.text}</span>
                    </Pop>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Pop>
      </Place>
      <Place x={0} y={330}>
        <Bold text="ويشخصلك وين دا تخسر" at={334} size={84} />
      </Place>
      <Place x={-10} y={460}>
        <Mark text="بالضبط" at={350} size={92} />
      </Place>
      <Place x={300} y={430}>
        <Emoji name="bullseye" at={356} size={170} rot={25} />
      </Place>
      <Sfx at={270} name="whoosh" volume={0.3} />
      <Sfx at={278} name="pop" volume={0.5} />
      {Array.from({ length: Math.ceil((Q_TO - Q_FROM) / 3) }).map((_, i) => (
        <Sfx key={i} at={Q_FROM + i * 3} name="type" volume={0.2} />
      ))}
      {DIAG.map((d, i) => (
        <Sfx key={`d${i}`} at={d.at} name="tick" volume={0.5} />
      ))}
      <Sfx at={350} name="pop" volume={0.5} />
      <Sfx at={358} name="impact" volume={0.3} />
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:12.6 Reply — "ويكتبلك الرد اللي يبيع"                              */
/* ------------------------------------------------------------------ */

export function ReplyBeat() {
  const f = useCurrentFrame();
  const copied = f > 432;
  return (
    <Beat {...P.reply} from={378} to={472}>
      <Place x={0} y={-430}>
        <Lead text="ويكتبلك" at={386} size={66} />
      </Place>
      <Place x={0} y={-300}>
        <Mark text="الرد اللي يبيع" at={392} size={104} kind="select" />
      </Place>
      <Place x={0} y={20}>
        <FlyCard at={404} from={{ x: -640, y: 260, r: -30 }} tilt={2}>
          <div style={{ width: 820, padding: "28px 32px", borderRadius: 44, background: "#fff", color: C.navyLight, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 30, fontWeight: 900, color: "#11a35a" }}>
                <span style={{ width: 20, height: 20, borderRadius: 99, background: "#25d366" }} />
                رد واتساب جاهز
              </span>
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  padding: "8px 22px",
                  borderRadius: 99,
                  background: copied ? "#25d366" : "#e8f8ef",
                  color: copied ? "#fff" : "#11a35a",
                }}
              >
                {copied ? "تم النسخ ✓" : "نسخ"}
              </span>
            </div>
            <div style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.5 }}>هلا بيك عيني، السعر 25 ألف والتوصيل مجاني لبغداد. أثبتلك الطلب باسمك؟</div>
          </div>
        </FlyCard>
      </Place>
      <Place x={320} y={270}>
        <Emoji name="money-mouth" at={420} size={210} rot={-25} />
      </Place>
      <Sfx at={378} name="whoosh" volume={0.55} />
      <Sfx at={392} name="pop" volume={0.5} />
      <Sfx at={404} name="whoosh" volume={0.4} />
      <Sfx at={420} name="pop" volume={0.5} />
      <Sfx at={433} name="chime" volume={0.5} />
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:15 Dinar — "ويحسبلك ربحك الصافي بالدينار"                          */
/* ------------------------------------------------------------------ */

export function DinarBeat() {
  const f = useCurrentFrame();
  const profit = Math.round(interpolate(f, [476, 500], [0, 11500], { ...clamp, easing: easeOut }) / 100) * 100;
  return (
    <Beat {...P.dinar} from={450} to={530}>
      <Place x={300} y={-330}>
        <Emoji name="money-bag" at={468} size={200} rot={20} />
      </Place>
      <Place x={0} y={-90}>
        <Lead text="ويحسبلك ربحك الصافي" at={456} size={64} />
        <Bold text="بالدينار" at={464} size={150} />
      </Place>
      <Place x={0} y={150}>
        <Mark at={474} size={84} bg="#1fbf6e">
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, fontSize: 88, fontWeight: 900, color: "#fff" }}>
            <N style={{ fontVariantNumeric: "tabular-nums" }}>+{profit.toLocaleString("en-US")}</N>
            <span style={{ fontSize: 44, fontWeight: 700 }}>د.ع</span>
          </div>
        </Mark>
      </Place>
      <Sfx at={450} name="whoosh" volume={0.3} />
      <Sfx at={468} name="pop" volume={0.5} />
      {Array.from({ length: 8 }).map((_, i) => (
        <Sfx key={i} at={476 + i * 3} name="tick" volume={0.4} />
      ))}
      <Sfx at={500} name="chime" volume={0.45} />
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:17 Paper section — what the course teaches                        */
/* ------------------------------------------------------------------ */

export function LearnBeats() {
  const faces = ["beard", "woman", "man", "beard", "woman"];
  return (
    <>
      <Beat {...P.learn0} from={510} to={564}>
        <Place x={0} y={-30}>
          <Lead text="وويا الكورس" at={520} size={70} tone="paper" />
          <Bold text="تتعلم شلون…" at={528} size={140} tone="paper" />
        </Place>
        <Sfx at={510} name="whoosh" volume={0.55} />
      </Beat>

      <Beat {...P.learn1} from={546} to={616}>
        <Place x={0} y={-250}>
          <Emoji name="chart-down" at={552} size={210} rot={-15} />
        </Place>
        <Place x={0} y={-20}>
          <Bold text="تنزّل سعر الرسالة" at={556} size={104} tone="paper" />
        </Place>
        <Place x={0} y={150}>
          <div style={{ display: "flex", alignItems: "center", gap: 30, fontSize: 80, fontWeight: 900 }}>
            <Pop at={566}>
              <div style={{ position: "relative", color: "#8b95b0" }}>
                <N>$3.40</N>
                <Strike at={574} />
              </div>
            </Pop>
            <Pop at={580}>
              <span style={{ color: "#8b95b0", fontWeight: 300 }}>←</span>
            </Pop>
            <Pop at={584}>
              <Mark at={584} size={80} bg="#1fbf6e">
                <N style={{ fontSize: 80, fontWeight: 900, color: "#fff" }}>$1.20</N>
              </Mark>
            </Pop>
          </div>
        </Place>
        <Place x={0} y={250}>
          <Lead text="*مثال توضيحي" at={588} size={28} tone="paper" />
        </Place>
        <Sfx at={546} name="whoosh" volume={0.45} />
        <Sfx at={552} name="pop" volume={0.45} />
        <Sfx at={574} name="tick" volume={0.6} />
        <Sfx at={584} name="chime" volume={0.45} />
      </Beat>

      <Beat {...P.learn2} from={598} to={666}>
        <Place x={0} y={-250}>
          <div style={{ position: "relative", display: "flex" }}>
            {faces.map((name, i) => (
              <div key={i} style={{ marginInline: -18, transform: `translateY(${Math.abs(i - 2) * 22}px)` }}>
                <Emoji name={name} at={604 + i * 2} size={150} rot={i % 2 ? 12 : -12} />
              </div>
            ))}
            <CrossOut at={626} w={640} h={230} />
          </div>
        </Place>
        <Place x={0} y={20}>
          <Bold text="توصل للزبون الجاد" at={610} size={104} tone="paper" />
        </Place>
        <Place x={0} y={150}>
          <Lead text="مو اللي بس يسأل بيش؟" at={626} size={58} tone="paper" />
        </Place>
        <Sfx at={598} name="whoosh" volume={0.45} />
        <Sfx at={606} name="pop" volume={0.45} />
        <Sfx at={627} name="tick" volume={0.6} />
      </Beat>

      <Beat {...P.learn3} from={648} to={712}>
        <Place x={-130} y={-250}>
          <Emoji name="package" at={654} size={190} rot={-20} />
        </Place>
        <Place x={130} y={-250}>
          <Emoji name="cart" at={658} size={190} rot={20} />
        </Place>
        <Place x={0} y={10}>
          <Bold text="وتحوّل الرسايل لطلبات" at={660} size={96} tone="paper" />
        </Place>
        <Place x={0} y={170}>
          <Emoji name="check" at={674} size={130} rot={-30} />
        </Place>
        <Sfx at={648} name="whoosh" volume={0.45} />
        <Sfx at={656} name="pop" volume={0.45} />
        <Sfx at={676} name="chime" volume={0.55} />
      </Beat>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 0:23 Plan — "لا تصرف ولا دولار بعد بدون خطة"                         */
/* ------------------------------------------------------------------ */

export function PlanBeat() {
  return (
    <Beat {...P.plan} from={693} to={792}>
      <Place x={300} y={-330}>
        <Emoji name="bulb" at={732} size={180} rot={20} />
      </Place>
      <Place x={0} y={-90}>
        <Lead text="لا تصرف ولا دولار بعد" at={703} size={70} />
      </Place>
      <Place x={0} y={60}>
        <div style={{ position: "relative" }}>
          <Bold text="بدون خطة." at={714} size={150} />
          <HandCircle at={732} w={760} h={250} color={C.sky} />
        </div>
      </Place>
      <Sfx at={693} name="whoosh" volume={0.6} />
      <Sfx at={716} name="impact" volume={0.4} />
      <Sfx at={732} name="whoosh" volume={0.25} />
      <Sfx at={732} name="pop" volume={0.45} />
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* 0:25.6 Offer + CTA                                                   */
/* ------------------------------------------------------------------ */

const TAP = 846;

export function OfferBeat() {
  const f = useCurrentFrame();
  const press = f >= TAP && f < TAP + 8 ? interpolate(f, [TAP, TAP + 3, TAP + 8], [1, 0.92, 1], clamp) : 1;
  const ripple = interpolate(f, [TAP, TAP + 24], [0, 1], clamp);
  const hand = interpolate(f, [TAP - 16, TAP], [1, 0], { ...clamp, easing: easeOut });
  const sweep = ((f - 830) % 40) / 40;
  return (
    <Beat {...P.offer} from={768} to={900}>
      <Place x={0} y={-470}>
        <VZLogo size={190} at={774} />
      </Place>
      <Place x={0} y={-300}>
        <Pop at={790}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <span style={{ fontSize: 64, fontWeight: 900 }}>فيزيون</span>
            <span style={{ fontSize: 34, fontWeight: 300, letterSpacing: "0.32em", color: "rgba(255,255,255,0.6)" }}>VIZION</span>
          </div>
        </Pop>
      </Place>
      <Place x={0} y={-60}>
        <FlyCard at={798} from={{ x: 0, y: 520, r: 10 }}>
          <div
            style={{
              width: 840,
              padding: "30px 36px 34px",
              borderRadius: 52,
              background: `linear-gradient(180deg, #3d8bff, ${C.blue})`,
              boxShadow: "0 30px 80px rgba(0,0,0,0.45), inset 0 2px 0 rgba(255,255,255,0.35)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 38, fontWeight: 500, color: "rgba(255,255,255,0.85)" }}>الكورس الكامل + كل أدوات المنصة</div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 16 }}>
              <N style={{ fontSize: 150, fontWeight: 900, lineHeight: 1.1 }}>29,000</N>
              <span style={{ fontSize: 50, fontWeight: 900 }}>د.ع</span>
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, color: "#d6ffe9" }}>دفعة وحدة • مدى الحياة</div>
          </div>
        </FlyCard>
      </Place>
      <Place x={0} y={140}>
        <Pop at={812}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 36, fontWeight: 300, color: "rgba(255,255,255,0.85)" }}>
            <Emoji name="robot" at={812} size={70} float={false} rot={0} />
            المستشار الذكي: <N style={{ fontWeight: 900, color: "#fff" }}>14,000</N> د.ع / شهرياً
          </div>
        </Pop>
      </Place>
      <Place x={0} y={300}>
        <Pop at={820}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              width: 760,
              height: 150,
              borderRadius: 999,
              background: "#ffffff",
              color: C.blue,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 20,
              fontSize: 66,
              fontWeight: 900,
              transform: `scale(${press})`,
              boxShadow: "0 24px 60px rgba(47,107,255,0.45)",
            }}
          >
            اشترك هسة
            <span style={{ fontSize: 60 }}>←</span>
            {f > 830 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  width: 200,
                  left: `${interpolate(sweep, [0, 0.6], [-30, 130], clamp)}%`,
                  background: "linear-gradient(90deg, transparent, rgba(47,107,255,0.22), transparent)",
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
                  margin: "-450px 0 0 -450px",
                  borderRadius: 999,
                  background: "rgba(47,107,255,0.25)",
                  transform: `scale(${ripple})`,
                  opacity: 1 - ripple,
                }}
              />
            )}
          </div>
        </Pop>
      </Place>
      {f >= TAP - 16 && (
        <Place x={90} y={420 + hand * 260}>
          <div style={{ opacity: interpolate(f, [TAP - 16, TAP - 10, TAP + 18, TAP + 26], [0, 1, 1, 0], clamp), transform: `scale(${f >= TAP && f < TAP + 6 ? 0.9 : 1})` }}>
            <Emoji name="point-up" at={TAP - 16} size={170} rot={0} float={false} />
          </div>
        </Place>
      )}
      <Place x={0} y={450}>
        <Lead text="الرابط بالبايو • vizion-app.com" at={834} size={40} />
      </Place>
      <Sfx at={768} name="whoosh" volume={0.35} />
      <Sfx at={776} name="impact" volume={0.45} />
      <Sfx at={798} name="whoosh" volume={0.4} />
      <Sfx at={812} name="pop" volume={0.45} />
      <Sfx at={820} name="pop" volume={0.55} />
      <Sfx at={TAP} name="tick" volume={0.8} />
      <Sfx at={TAP + 2} name="chime" volume={0.6} />
    </Beat>
  );
}

/* ------------------------------------------------------------------ */
/* Background line art (world space, scattered around the beats)       */
/* ------------------------------------------------------------------ */

const DECO = [
  { x: -420, y: 380, kind: "q", size: 520, r: -12 },
  { x: 480, y: -520, kind: "plus", size: 260, r: 15 },
  { x: 380, y: 1500, kind: "curve", size: 900, r: 0 },
  { x: 1750, y: 600, kind: "q", size: 460, r: 14 },
  { x: 800, y: 2050, kind: "ring", size: 340, r: 0 },
  { x: 3100, y: -150, kind: "curve", size: 900, r: 180 },
  { x: 4150, y: 900, kind: "q", size: 520, r: -10 },
  { x: 3050, y: 1900, kind: "plus", size: 300, r: -20 },
  { x: 2000, y: 3000, kind: "q", size: 480, r: 10 },
  { x: 3050, y: 3500, kind: "curve", size: 900, r: 30 },
  { x: 7500, y: 500, kind: "q", size: 520, r: -14 },
  { x: 8500, y: -500, kind: "ring", size: 360, r: 0 },
  { x: 8450, y: 1500, kind: "curve", size: 900, r: 200 },
];

export function Deco() {
  return (
    <>
      {DECO.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: d.x, top: d.y, transform: `translate(-50%, -50%) rotate(${d.r}deg)`, opacity: 0.16 }}>
          {d.kind === "q" && (
            <div style={{ fontSize: d.size, fontWeight: 300, lineHeight: 1, color: "transparent", WebkitTextStroke: "3px #9bbcff" }}>؟</div>
          )}
          {d.kind === "plus" && (
            <svg width={d.size} height={d.size} viewBox="0 0 100 100">
              <path d="M38 8 H62 V38 H92 V62 H62 V92 H38 V62 H8 V38 H38 Z" fill="none" stroke="#9bbcff" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          )}
          {d.kind === "ring" && (
            <svg width={d.size} height={d.size} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#9bbcff" strokeWidth="1.4" />
              <circle cx="50" cy="50" r="30" fill="none" stroke="#9bbcff" strokeWidth="0.8" />
            </svg>
          )}
          {d.kind === "curve" && (
            <svg width={d.size} height={d.size * 0.5} viewBox="0 0 200 100">
              <path d="M0 90 C 50 90, 60 10, 110 30 S 170 80, 200 10" fill="none" stroke="#9bbcff" strokeWidth="1.2" />
            </svg>
          )}
        </div>
      ))}
    </>
  );
}

