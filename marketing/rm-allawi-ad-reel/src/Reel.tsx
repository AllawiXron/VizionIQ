// My ad reel for the page, built on the Brandek reel's visual language: one orange field for the whole reel, big white
// words with the key word in my brown, an outlined word or a stretched word where the voice leans on it, and one
// black-and-white cut-out per idea, anchored to a frame edge and acting on the words. One take: the ten ideas sit in a
// row on a strip and the camera holds on each while it is spoken, then pushes to the next, right to left. The motion
// keeps the reel standard: Smart Bounce on the hits, motion blur on the camera and on everything that moves, 15 fps
// steps. Every cue sits on a word of the voice (word times from the take, after its pauses were tightened).
import React, { useEffect, useState } from "react";
import { AbsoluteFill, Audio, Sequence, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { AWAY, Burst, Cut, D, DRIFT, FPS, IN2, INK, Line, Pose, PUSH, SETTLE, SHUTTER, SOFT, Screen, ae, bounce, clamp, lerp, mv, punch, stepped } from "./lib";

const BEATS = ["A", "B", "D", "F", "I", "J", "L", "M", "O", "R"];
const ENDS = [2.6, 5.2, 7.74, 12.62, 14.42, 19.04, 23.52, 28.5, 35.48, D];
const GAP = 1500;
const beatX = (i: number) => (BEATS.length - 1 - i) * GAP;
const PRE = 0.35, POST = 0.45;
// where the camera looks along the strip
const camAt = (t: number) => {
  for (let j = 0; j < BEATS.length - 1; j++) {
    const B = ENDS[j];
    if (t >= B - PRE && t < B + POST) return lerp(beatX(j), beatX(j + 1), PUSH(clamp((t - (B - PRE)) / (PRE + POST))));
  }
  const j = ENDS.findIndex((e) => t < e);
  return beatX(j < 0 ? BEATS.length - 1 : j);
};

// a thing that comes in from an offset and stays, then (optionally) leaves along an offset
const arrive = (t: number, t0: number, d: number, from: Pose, rest: Pose = {}, leave?: [number, Pose, number?]): Pose => {
  if (t < t0) return { o: 0 };
  const k = SOFT(clamp((t - t0) / d));
  const p: Pose = { x: lerp(from.x ?? 0, rest.x ?? 0, k), y: lerp(from.y ?? 0, rest.y ?? 0, k), r: lerp(from.r ?? rest.r ?? 0, rest.r ?? 0, k), s: lerp(from.s ?? 1, rest.s ?? 1, k) };
  if (leave && t >= leave[0]) {
    const ld = leave[2] ?? 0.4, l = AWAY(clamp((t - leave[0]) / ld));
    if (t > leave[0] + ld) return { o: 0 };
    p.x = (p.x ?? 0) + (leave[1].x ?? 0) * l; p.y = (p.y ?? 0) + (leave[1].y ?? 0) * l; p.r = (p.r ?? 0) + (leave[1].r ?? 0) * l;
  }
  return p;
};
const W = (pairs: [string, number][]) => pairs.map(([w, t]) => ({ w, t }));

// ── A · مشروعك متعوب عليه، بس أرباحك قليلة: the open, empty wallet; «أرباحك» outlined; one coin drops in on «قليلة»,
//    bounces off it and flies on with the push into the middle phone
const A: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={330} size={92} words={W([["مشروعك", 0.0], ["متعوب", 0.56], ["عليه،", 0.88], ["بس", 1.38]])} />
    <Line t={t} top={440} size={280} words={W([["^أرباحك", 1.66]])} />
    <Line t={t} top={770} size={200} words={W([["*قليلة؟", 2.1]])} />
    <Cut id="wallet" src="wallet.png" w={980} left={50} top={1100} t={t} pose={(t) => ({ y: mv(t, 0, 2.6, 110, 0, SETTLE) + 18 * Math.sin(Math.PI * clamp((t - 2.38) / 0.18)) * (t > 2.38 ? 1 : 0), r: mv(t, 0, 2.6, -1, -6, SETTLE) })} />
    <Cut id="coin" src="coin.png" w={190} left={445} top={990} z={12} colour t={t} pose={(t) => {
      if (t < 2.1 || t > 3.14) return { o: 0 };
      if (t < 2.38) { const p = IN2(clamp((t - 2.1) / 0.28)); return { y: lerp(-1300, 0, p), r: lerp(-220, 10, p) }; }
      if (t < 2.74) { const p = 1 - Math.pow(1 - clamp((t - 2.38) / 0.36), 2); return { x: lerp(0, -700, p), y: lerp(0, -620, p), r: lerp(10, -200, p) }; }
      const p = IN2(clamp((t - 2.74) / 0.4)); return { x: lerp(-700, -1500, p), y: lerp(-620, -40, p), r: lerp(-200, -380, p), s: lerp(1, 0.6, p) };
    }} />
  </>
);

// ── B · عدنا نصمملك موشن جرافيك وبوستات إعلانية: «نصمملك» stretches; three phones play my dollar, viZion and logos reels
const phone = (id: string, left: number, top: number, w: number, r: number, t0: number, t: number, clip: string, at: number, from: number, dur: number, turn?: number) => (
  <Cut id={id} src="phone.png" w={w} left={left} top={top} t={t} pose={(t) => {
    const p = arrive(t, t0, 0.65, { y: 1000, r: r * 2.5 }, { r });
    if (turn && t > turn) p.ry = 360 * ae(60, 100)(clamp((t - turn) / 0.6));
    return p;
  }}>
    <Screen clip={clip} from={from} dur={dur} at={at} />
  </Cut>
);
const B: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={300} size={120} stretch={5} out={4.1} words={W([["عدنا", 2.65], ["*نصم~ملك", 2.91]])} />
    <Line t={t} top={450} size={150} out={4.1} words={W([["موشن", 3.45], ["جرافيك", 3.73]])} />
    <Line t={t} top={300} size={120} words={W([["وبوستات", 4.2]])} />
    <Line t={t} top={430} size={190} words={W([["^إعلانية", 4.73]])} />
    {phone("phL", 20, 960, 400, -10, 2.25, t, "dollar-reel.mp4", 1.3, 2.25, 3.4, 4.2)}
    {phone("phR", 660, 960, 400, 9, 2.36, t, "logos-reel.mp4", 16.3, 2.25, 3.4, 4.28)}
    {phone("phC", 290, 820, 500, -2, 2.47, t, "vizion-reel.mp4", 7.1, 2.25, 3.4, 4.36)}
  </>
);

// ── D · تحجي بقوة براندك، وتبيع بمكانك: the megaphone from the left edge; «براندك» bursts out of its mouth on a dark star;
//    then the shop owner comes up
const Dd: React.FC<{ t: number }> = ({ t }) => {
  const bs = t < 6.5 ? bounce(t, 6.06) : Math.max(0, 1 - IN2(clamp((t - 6.5) / 0.3)));
  return (
    <>
      <Line t={t} top={300} size={100} out={6.5} words={W([["تحجي", 5.25], ["بقوة", 5.63]])} />
      <Cut id="mega" src="megaphone.png" w={820} left={-250} top={800} t={t} pose={(t) => {
        const p = arrive(t, 4.9, 0.7, { x: -600, r: -34 }, { r: -18 }, [6.5, { x: -900, r: -30 }]);
        p.s = (p.s ?? 1) + punch(t, 6.06, 0.08);
        return p;
      }} />
      <Burst cx={700} cy={760} r={300} s={bs} rot={t * 12} />
      {t >= 6.06 && t < 6.85 && (
        <div style={{ position: "absolute", left: 400, top: 640, width: 600, zIndex: 21, textAlign: "center", transform: `scale(${bs})` }}>
          <Line t={t} top={0} size={200} enter="burst" words={W([["براندك", 6.09]])} />
        </div>
      )}
      <Line t={t} top={300} size={130} words={W([["وتبيع", 6.67], ["*بمكانك", 7.09]])} />
      <Cut id="owner" src="shop-owner.png" w={900} left={90} top={980} t={t} pose={(t) => {
        const p = arrive(t, 6.6, 0.6, { y: 900 });
        p.y = (p.y ?? 0) - 16 * DRIFT(clamp((t - 7.2) / 0.6));
        return p;
      }} />
    </>
  );
};

// ── F · حركة / فكرة / نتيجة: one big phone; each word plays on its screen while what it does is written above, and its
//    own thing pops in at the phone's corner (binoculars, a bulb, coins)
const screenWord = (t: number, w: string, t0: number, t1: number) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const pin = OUTp(clamp((t - t0) / 0.45)), pout = IN2(clamp((t - t1) / 0.3));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", direction: "rtl", fontFamily: "'DG Sahabah'", fontSize: 128, color: "#fff", opacity: Math.min(clamp(pin * 1.6), 1 - pout), transform: `translateX(${lerp(300, 0, pin) - 300 * pout}px)` }}>{w}</div>
  );
};
const OUTp = (p: number) => 1 - Math.pow(1 - p, 3);
const prop = (id: string, src: string, w: number, left: number, top: number, t: number, t0: number, t1: number | undefined, r: number) => (
  <Cut id={id} src={src} w={w} left={left} top={top} z={14} t={t} pose={(t) => {
    if (t < t0) return { o: 0 };
    if (t1 !== undefined && t > t1 + 0.3) return { o: 0 };
    const s = bounce(t, t0) * (t1 !== undefined && t > t1 ? 1 - IN2(clamp((t - t1) / 0.3)) : 1);
    return { s, r: r * (1 - clamp((t - t0) / 0.5)) + r * 0.2 };
  }} />
);
const F: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={300} size={110} out={9.1} words={W([["تشد", 8.37], ["*العين", 8.61]])} />
    <Line t={t} top={300} size={110} out={10.7} words={W([["تقنع", 9.63], ["الزبون", 10.03]])} />
    <Line t={t} top={300} size={110} words={W([["ترفع", 11.45], ["*مبيعاتك", 11.83]])} />
    <Cut id="phF" src="phone.png" w={700} left={190} top={620} t={t} pose={(t) => {
      const p = arrive(t, 7.4, 0.7, { y: 1000, r: 6 }, { r: -3 });
      p.s = (p.s ?? 1) + punch(t, 11.83, 0.04);
      return p;
    }}>
      <Screen>
        {screenWord(t, "حركة", 7.79, 9.1)}
        {screenWord(t, "فكرة", 9.19, 10.7)}
        {screenWord(t, "ونتيجة", 10.77, 99)}
      </Screen>
    </Cut>
    {prop("binoF", "binoculars.png", 470, -80, 1330, t, 7.79, 9.1, -12)}
    {prop("bulbF", "bulb.png", 280, 770, 470, t, 9.19, 10.7, 14)}
    {prop("coinsF", "coin-stacks.png", 520, 620, 1400, t, 10.77, undefined, 10)}
  </>
);

// ── I · من أول 3 ثواني بإعلانك: «من» stretches across the frame on a long line; a giant 3; the stopwatch held up
const I: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={290} size={200} stretch={11} words={W([["م~ن", 12.67]])} />
    <Line t={t} top={560} size={150} align="r" words={W([["أول", 12.93]])} />
    {t >= 13.17 && (
      <div style={{ position: "absolute", left: 60, top: 600, zIndex: 9, fontFamily: "'DG Sahabah'", fontSize: 820, lineHeight: 1, color: INK, transformOrigin: "50% 60%", transform: `scale(${bounce(t, 13.17)}) rotate(${-14 * (1 - clamp((t - 13.17) / 0.2))}deg)` }}>3</div>
    )}
    <Line t={t} top={1440} size={112} align="l" words={W([["ثواني", 13.35], ["*بإعلانك", 13.73]])} />
    <Cut id="hand" src="stopwatch-hand.png" w={520} left={620} top={930} t={t} pose={(t) => arrive(t, 12.3, 0.7, { y: 900, r: 8 }, { r: -6 })} />
  </>
);

// ── J · الكواليتي، يثق، مباشرة: the magnifier settles its glass on «الكواليتي», which grows under it; the handshake comes
//    up and shakes on «يثق»; «مباشرة» lands over it
const J: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={300} size={100} out={16.3} words={W([["الزبون", 14.47], ["راح", 14.87], ["يلمس", 15.09]])} />
    <div style={{ position: "absolute", inset: 0, zIndex: 30, transformOrigin: "700px 520px", transform: `scale(${1 + 0.1 * SOFT(clamp((t - 15.5) / 0.4)) * (t < 16.3 ? 1 : 0)})` }}>
      <Line t={t} top={430} size={132} out={16.3} words={W([["الكواليتي", 15.37], ["*العالي", 15.79]])} />
    </div>
    <Cut id="lens" src="magnifier.png" w={560} left={600} top={370} z={32} t={t} pose={(t) => arrive(t, 14.6, 0.85, { x: 600, y: 220, r: 24 }, { r: -8 }, [16.25, { x: 700, r: 25 }])} />
    <Line t={t} top={300} size={150} out={17.45} words={W([["يثق", 16.41], ["*بمنتجك", 16.69]])} />
    <Line t={t} top={300} size={110} words={W([["ويدخل", 17.55], ["يطلب", 17.89], ["منك", 18.23]])} />
    <Line t={t} top={560} size={230} words={W([["*مباشرة", 18.55]])} />
    <Cut id="shake" src="handshake.png" w={1300} left={-110} top={1010} t={t} pose={(t) => {
      const p = arrive(t, 16.3, 0.45, { y: 800 });
      if (t > 16.75 && t < 17.17) p.y = (p.y ?? 0) + 18 * Math.sin(((t - 16.75) / 0.42) * Math.PI * 2) * (1 - (t - 16.75) / 0.42);
      p.s = (p.s ?? 1) + punch(t, 18.55, 0.05);
      return p;
    }} />
  </>
);

// ── L · يعزلك تماما عن منافسيك: the king among the pawns; on «يعزلك» the pawns are knocked out to both sides and
//    «منافسيك» fills the background
const PAWNS: [number, number, number][] = [[40, 1330, 190], [230, 1400, 170], [680, 1400, 170], [850, 1330, 190]];
const L: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", left: -300, top: -300, width: 1680, height: 2520, zIndex: 1, overflow: "hidden", transform: "rotate(-11deg)", color: "rgba(255,255,255,.09)", fontFamily: "'DG Sahabah'", fontSize: 96, lineHeight: 1.45, whiteSpace: "nowrap", direction: "rtl", opacity: SOFT(clamp((t - 22.6) / 0.6)) }}>
      {Array.from({ length: 18 }, (_, i) => <div key={i} style={{ marginRight: (i % 2) * 120 }}>{"منافسيك   ".repeat(4)}</div>)}
    </div>
    <Line t={t} top={300} size={100} out={21.6} words={W([["لأن", 19.09], ["ويانا", 19.65], ["راح", 20.21], ["يطلع", 20.43]])} />
    <Line t={t} top={430} size={140} out={21.6} words={W([["إعلانك", 20.69], ["بمستوى", 21.13]])} />
    <Line t={t} top={300} size={170} words={W([["يعزلك", 21.75], ["^تماما", 22.17]])} />
    <Line t={t} top={520} size={110} dim words={W([["عن", 22.69], ["منافسيك", 22.77]])} />
    {PAWNS.map(([x, y, w], i) => (
      <Cut key={i} id={`pawn${i}`} src="chess-pawn.png" w={w} left={x} top={y} t={t} pose={(t) => arrive(t, 18.8 + i * 0.06, 0.6, { y: 600 }, {}, [21.75 + i * 0.05, { x: (i < 2 ? -1 : 1) * 760, y: -200, r: (i < 2 ? -1 : 1) * 120 }, 0.55])} />
    ))}
    <Cut id="king" src="chess-king.png" w={300} left={390} top={860} t={t} pose={(t) => { const p = arrive(t, 18.72, 0.7, { y: 700 }); p.s = (p.s ?? 1) + punch(t, 21.75, 0.06); return p; }} />
  </>
);

// ── M · مرة ومرتين وعشرة: the words tilt in, a bag on each, then a pile; then the man with the binoculars looks at «براند»
const BAG = ["bag-orange.png", "bag-black.png", "bag-blue.png", "bag-black2.png"];
const PILE: [number, number][] = [[640, 1240], [170, 1260], [20, 1420], [330, 1470], [620, 1450], [840, 1360], [120, 1620], [470, 1640], [760, 1610], [280, 1730], [600, 1760], [900, 1700]];
const M: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={300} size={100} out={24.72} words={W([["ويخلي", 23.57], ["الزبون", 23.93], ["يشتري", 24.27], ["منك", 24.63]])} />
    <Line t={t} top={330} size={170} align="r" rot={-6} out={26.5} words={W([["مرة", 24.97]])} />
    <Line t={t} top={520} size={170} align="l" rot={6} out={26.5} words={W([["ومرتين", 25.35]])} />
    <Line t={t} top={740} size={260} rot={-3} out={26.5} words={W([["*وعشرة", 25.97]])} />
    {PILE.map(([x, y], i) => {
      const t0 = i === 0 ? 24.95 : i === 1 ? 25.33 : 25.95 + (i - 2) * 0.05;
      return <Cut key={i} id={`bag${i}`} src={BAG[i % 4]} w={220 + (i % 3) * 30} left={x} top={y} t={t} pose={(t) => arrive(t, t0, 0.4, { y: -1500, r: (i % 2 ? 1 : -1) * 20 }, { r: Math.sin(i * 1.9) * 10 }, [26.45, { y: 900 }])} />;
    })}
    <Line t={t} top={520} size={110} align="r" words={W([["لأن", 26.67], ["شاف", 27.01]])} />
    <Line t={t} top={640} size={230} align="r" words={W([["*براند", 27.21]])} />
    <Line t={t} top={900} size={130} align="r" words={W([["حقيقي", 27.57], ["قدامه", 27.97]])} />
    <Cut id="watcher" src="binoculars-man.png" w={540} left={0} top={440} t={t} pose={(t) => { const p = arrive(t, 26.6, 0.65, { y: 1000 }); p.y = (p.y ?? 0) - 24 * DRIFT(clamp((t - 27.3) / 1.2)); return p; }} />
  </>
);

// ── O · the crowd walks past without looking; «توقف»: the stop hand comes up and the second crowd stops; «وتقفل»: the
//    padlock drops and locks
const O: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={300} size={110} out={30.6} words={W([["كافي", 28.55], ["تضيع", 28.93], ["جمهورك", 29.15]])} />
    <Line t={t} top={440} size={140} out={30.6} words={W([["بتصاميم", 29.65], ["عادية", 30.15]])} />
    <Line t={t} top={360} size={180} out={31.5} words={W([["الكل", 30.85], ["يتخطاها", 30.99]])} />
    <Line t={t} top={360} size={170} out={32.45} words={W([["ابدأ", 31.63], ["اليوم", 32.05]])} />
    <Line t={t} top={300} size={120} words={W([["بتصاميم", 32.51], ["*توقف", 33.09], ["الزبون", 33.51]])} />
    <Line t={t} top={460} size={130} words={W([["وتقفل", 34.05], ["وياه", 34.61], ["البيعة", 34.85]])} />
    <Cut id="crowd1" src="crowd.png" w={1000} left={0} top={1200} t={t} pose={(t) => (t < 28.8 || t > 32.0 ? { o: 0 } : { x: mv(t, 28.8, 3.2, 1100, -1100, (p) => p) })} />
    <Cut id="crowd2" src="crowd2.png" w={960} left={0} top={1160} t={t} pose={(t) => {
      if (t < 30.7 || t > 34.35) return { o: 0 };
      const x = t < 33.05 ? mv(t, 30.7, 2.35, 1100, 260, (p) => p) : mv(t, 33.05, 0.3, 260, 200, (p) => 1 - (1 - p) * (1 - p));
      return { x, y: t > 33.95 ? 900 * AWAY(clamp((t - 33.95) / 0.4)) : 0 };
    }} />
    <Cut id="stop" src="stop-hand.png" w={760} left={160} top={900} z={12} t={t} pose={(t) => arrive(t, 33.0, 0.35, { y: 900 }, {}, [33.95, { y: 900 }])} />
    <Cut id="lock" src="padlock.png" w={330} left={375} top={760} t={t} pose={(t) => {
      if (t < 34.05) return { o: 0 };
      if (t < 34.37) return { y: lerp(-1300, 0, IN2(clamp((t - 34.05) / 0.32))) };
      return { y: 14 * Math.sin(Math.PI * clamp((t - 34.37) / 0.3)) };
    }} />
  </>
);

// ── R · تواصل ويانا بالخاص، شوف أعمالنا، وخلي براندك يبيع صح: the receiver swings in; my reels come up on the phones and
//    stay to the end; the handle
const R: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Line t={t} top={300} size={130} out={36.65} words={W([["تواصل", 35.53], ["ويانا", 35.81]])} />
    <Line t={t} top={640} size={220} align="l" out={36.65} words={W([["*بالخاص", 36.09]])} />
    <Cut id="recv" src="receiver.png" w={760} left={520} top={520} t={t} pose={(t) => { const p = arrive(t, 35.16, 0.7, { x: 700, r: 24 }, {}, [36.6, { x: 700, r: 20 }]); p.s = (p.s ?? 1) + punch(t, 36.09, 0.05); return p; }} />
    <Line t={t} top={300} size={140} out={37.45} words={W([["شوف", 36.79], ["*أعمالنا", 36.99]])} />
    <Line t={t} top={300} size={110} words={W([["وخلي", 37.53], ["براندك", 38.05], ["*يبيع", 38.71], ["صح", 39.07]])} />
    {phone("phL2", 20, 960, 400, -10, 36.68, t, "logos-reel.mp4", 46.0, 36.5, 4.7)}
    {phone("phR2", 660, 960, 400, 9, 36.8, t, "dollar-reel.mp4", 2.0, 36.5, 4.7)}
    {phone("phC2", 290, 820, 500, -2, 36.92, t, "vizion-reel.mp4", 7.4, 36.5, 4.7)}
    {t >= 39.55 && (
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, zIndex: 31, textAlign: "center", fontFamily: "'DG Sahabah'", fontSize: 100, color: "#fff", direction: "ltr", textShadow: "0 4px 16px rgba(80,25,0,.25)", transform: `scale(${bounce(t, 39.55)})` }}>@allawi.psd</div>
    )}
  </>
);

const SCENES: Record<string, React.FC<{ t: number }>> = { A, B, D: Dd, F, I, J, L, M, O, R };

// the sounds: a pop on every word (the dark key words get the smoother pops), and the cues on the moves and hits
const NPOP: [string, number][] = [["npop1", 0.24], ["npop2", 0.17], ["npop3", 0.2], ["npop4", 0.18], ["npop5", 0.24]];
const PPOP: [string, number][] = [["ppop1", 0.19], ["ppop2", 0.13], ["ppop3", 0.17], ["ppop4", 0.13]];
const WORDS: [number, boolean][] = [
  [0, false], [0.56, false], [0.88, false], [1.38, false], [1.66, false], [2.1, true], [2.65, false], [2.91, true], [3.45, false], [3.73, false], [4.2, false], [4.73, false],
  [5.25, false], [5.63, false], [6.09, false], [6.67, false], [7.09, true], [8.37, false], [8.61, true], [9.63, false], [10.03, false], [11.45, false], [11.83, true],
  [12.67, false], [12.93, false], [13.35, false], [13.73, true], [14.47, false], [14.87, false], [15.09, false], [15.37, false], [15.79, true], [16.41, false], [16.69, true],
  [17.55, false], [17.89, false], [18.23, false], [18.55, true], [19.09, false], [19.65, false], [20.21, false], [20.43, false], [20.69, false], [21.13, false], [21.75, false],
  [22.17, false], [22.69, false], [22.77, false], [23.57, false], [23.93, false], [24.27, false], [24.63, false], [24.97, false], [25.35, false], [25.97, true], [26.67, false],
  [27.01, false], [27.21, true], [27.57, false], [27.97, false], [28.55, false], [28.93, false], [29.15, false], [29.65, false], [30.15, false], [30.85, false], [30.99, false],
  [31.63, false], [32.05, false], [32.51, false], [33.09, true], [33.51, false], [34.05, false], [34.61, false], [34.85, false], [35.53, false], [35.81, false], [36.09, true],
  [36.79, false], [36.99, true], [37.53, false], [38.05, false], [38.71, true], [39.07, false],
];
const FX: [number, string, number][] = [
  [0.05, "airy", 0.18], [2.1, "softpop", 0.3], [2.38, "flick", 0.24], [2.25, "smooth", 0.24], [3.08, "mpop", 0.22], [4.2, "simple", 0.18],
  [4.85, "smooth", 0.24], [5.25, "whooshcon", 0.2], [6.06, "hit", 0.28], [6.5, "simple", 0.2], [7.39, "smooth", 0.24], [7.79, "select", 0.26],
  [9.19, "select", 0.26], [10.77, "select", 0.26], [11.83, "money", 0.24], [12.27, "smooth", 0.24], [12.66, "gear", 0.2], [13.17, "hit", 0.26],
  [14.07, "smooth", 0.24], [14.6, "airy", 0.2], [16.3, "simple", 0.2], [16.41, "cinclick", 0.28], [18.55, "cinclick", 0.32], [18.69, "smooth", 0.24],
  [19.1, "sweet", 0.2], [21.75, "whooshcon", 0.22], [23.17, "smooth", 0.24], [25.97, "money", 0.28], [26.45, "simple", 0.2], [28.15, "smooth", 0.24],
  [29.0, "data", 0.14], [33.0, "hit", 0.3], [33.95, "simple", 0.18], [34.37, "clickb", 0.34], [35.13, "smooth", 0.24], [35.2, "simple", 0.18],
  [36.6, "softpop", 0.2], [36.74, "softpop", 0.18], [36.88, "softpop", 0.18], [39.55, "sweet", 0.28],
];

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("font"));
  useEffect(() => {
    const f = new FontFace("DG Sahabah", `url(${staticFile("fonts/DG-Sahabah-Reg.ttf")})`, { weight: "400" });
    f.load().then((ff) => { document.fonts.add(ff); continueRender(handle); });
  }, [handle]);
  const t = stepped(frame);
  const cam = camAt(t), cam0 = camAt(Math.max(0, t - SHUTTER));
  const camBlur = Math.min(7, Math.abs(cam - cam0) / 11);
  let ni = 0, pi = 0;
  return (
    <AbsoluteFill style={{ background: "#e2541b", overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(110% 65% at 20% 6%, #f58a45 0%, rgba(245,138,69,0) 62%), linear-gradient(170deg, #f07a2e 0%, #e9631f 46%, #e2541b 100%)" }} />
      <AbsoluteFill style={{ background: `url(${staticFile("img/paper.jpg")}) center/cover`, mixBlendMode: "multiply", opacity: 0.16 }} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="cam" x="-5%" y="0" width="110%" height="100%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${camBlur.toFixed(2)} 0`} /></filter>
      </svg>
      <div style={{ position: "absolute", left: 0, top: 0, width: GAP * BEATS.length, height: 1920, transform: `translateX(${-cam}px)`, filter: camBlur > 0.3 ? "url(#cam)" : undefined }}>
        {BEATS.map((id, i) => {
          if (Math.abs(cam - beatX(i)) > GAP + 200) return null;
          const S = SCENES[id];
          return (
            <div key={id} style={{ position: "absolute", left: beatX(i), top: 0, width: 1080, height: 1920 }}>
              <S t={t} />
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", top: 190, right: 56, zIndex: 60, fontFamily: "'DG Sahabah'", fontSize: 34, color: "rgba(255,255,255,.9)", direction: "ltr", opacity: 1 - clamp((t - 39.4) / 0.3) }}>@allawi.psd</div>
      <AbsoluteFill style={{ background: `url(${staticFile("img/grain.png")}) 0 0/420px`, mixBlendMode: "overlay", opacity: 0.05, pointerEvents: "none" }} />
      <Audio src={staticFile("voice.wav")} />
      {WORDS.map(([wt, key], i) => {
        const [n, v] = key ? PPOP[pi++ % 4] : NPOP[ni++ % 5];
        return <Sequence key={"w" + i} from={Math.round((wt + 0.02) * FPS)} layout="none"><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>;
      })}
      {FX.map(([ft, n, v], i) => <Sequence key={"f" + i} from={Math.round(ft * FPS)} layout="none"><Audio src={staticFile(`sfx/${n}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
