// My ad reel for the page: one continuous virtual camera over a big stage. Every group of lines is a shot laid out
// somewhere on the stage at its own position, tilt and scale; the camera whip-pans to the next one, pushes in through a
// phone screen into the shot waiting inside it, or pulls back to reveal a bigger one. The words are kinetic type, the
// black-and-white cut-outs act on them, the background carries a parallax grid of key words under a light that moves
// with the camera. The frame steps at 15 fps with motion blur on the camera and on every moving cut-out. The script,
// the voice and every sound cue are the fitted ones (sound.tsx); only the picture follows the rules below.
import React, { useEffect, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Burst, Cut, D, DRIFT, ENT, EXIT, FONT, INK, OVR, Par, Pose, SHUTTER, Screen, WHIP, bounce, clamp, lerp, punch, stepped } from "./lib";
import { KLine, KW } from "./kinetic";
import { Sound } from "./sound";

// ───────────────────────────── the stage and the camera ─────────────────────────────

type Shot = { id: string; a: number; b: number; cx: number; cy: number; r: number; s: number; tin: "whip" | "push" | "pull" | "slide" };
const DEG = Math.PI / 180;
type Place = { cx: number; cy: number; r: number; s: number };
// a point of a shot's own 1080×1920 frame, on the stage
const on = (p: Place, lx: number, ly: number): [number, number] => {
  const dx = (lx - 540) * p.s, dy = (ly - 960) * p.s, c = Math.cos(p.r * DEG), s = Math.sin(p.r * DEG);
  return [p.cx + dx * c - dy * s, p.cy + dx * s + dy * c];
};
// where the screen of a phone sits in its shot, and how wide it is
const PH = 1500 / 719;
const screenOf = (left: number, top: number, w: number, rot: number): [number, number, number] => {
  const h = w * PH, cx = left + w / 2, cy = top + h / 2;
  const ox = (0.0903 + 0.8804 / 2) * w - w / 2, oy = (0.0184 + 0.9621 / 2) * h - h / 2;
  const c = Math.cos(rot * DEG), s = Math.sin(rot * DEG);
  return [cx + ox * c - oy * s, cy + ox * s + oy * c, 0.8804 * w];
};

// the shots, laid out one from the last
const SHOTS: Shot[] = (() => {
  const L: Shot[] = [];
  const add = (id: string, a: number, b: number, tin: Shot["tin"], p: Place) => L.push({ id, a, b, tin, ...p });
  const last = () => L[L.length - 1];
  const whip = (id: string, a: number, b: number, lx: number, ly: number, dr: number, k = 1) => { const p = last(); const [cx, cy] = on(p, lx, ly); add(id, a, b, "whip", { cx, cy, r: p.r + dr, s: p.s * k }); };
  const into = (id: string, a: number, b: number, scr: [number, number, number], rot: number) => { const p = last(); const [cx, cy] = on(p, scr[0], scr[1]); add(id, a, b, "push", { cx, cy, r: p.r + rot, s: (p.s * scr[2]) / 1080 }); };
  // a bigger shot that holds the last one at one of its own points, out of its frame
  const back = (id: string, a: number, b: number, k: number, lx: number, ly: number, dr: number) => {
    const p = last(), s = p.s * k, r = p.r + dr, c = Math.cos(r * DEG), sn = Math.sin(r * DEG);
    const dx = (lx - 540) * s, dy = (ly - 960) * s;
    add(id, a, b, "pull", { cx: p.cx - (dx * c - dy * sn), cy: p.cy - (dx * sn + dy * c), r, s });
  };
  add("A", 0, 2.6, "whip", { cx: 0, cy: 0, r: 0, s: 1 });
  whip("B", 2.6, 5.2, -1900, 1260, -7);
  into("D1", 5.2, 6.55, screenOf(290, 820, 500, -2), -2);
  whip("D2", 6.55, 7.74, 540, 960 + 2500, 6);
  whip("F", 7.74, 12.62, 540 + 2300, 960 - 500, 9);
  into("I", 12.62, 14.42, screenOf(190, 620, 700, -3), -3);
  whip("J1", 14.42, 16.3, 540 - 2300, 960 + 300, -8);
  back("J2", 16.3, 19.04, 2.3, 540, 960 + 2100, 5);
  whip("L", 19.04, 23.52, 540 + 300, 960 - 2600, -6);
  whip("M1", 23.52, 26.5, 540 - 2300, 960 + 100, 8);
  whip("M2", 26.5, 28.5, 540 + 2000, 960 + 600, -5, 0.92);
  whip("O1", 28.5, 32.45, 540 - 200, 960 + 2500, 6);
  back("O2", 32.45, 35.48, 2.0, 540, 960 - 2100, -4);
  whip("R1", 35.48, 36.65, 540 - 2300, 960, -8);
  back("R2", 36.65, D, 1.8, 540 + 1700, 960, 4);
  return L;
})();

const PRE = 0.28, POST = 0.27, DZ = 0.04, DR = 0.9;
type Cam = { cx: number; cy: number; r: number; z: number; k: number };
const camAt = (t: number): Cam => {
  for (let j = 0; j < SHOTS.length - 1; j++) {
    const T = SHOTS[j].b;
    if (t >= T - PRE && t < T + POST) {
      const A = SHOTS[j], B = SHOTS[j + 1], p = WHIP(clamp((t - (T - PRE)) / (PRE + POST)));
      const zA = (1 / A.s) * (1 + DZ), zB = 1 / B.s, rA = A.r + DR;
      let z = Math.exp(lerp(Math.log(zA), Math.log(zB), p));
      const w = B.tin === "push" ? (z - zA) / (zB - zA) : B.tin === "pull" ? (1 / z - 1 / zA) / (1 / zB - 1 / zA) : p;
      let r = lerp(rA, B.r, p);
      if (B.tin === "whip") { r += (j % 2 ? 1 : -1) * 7 * Math.sin(Math.PI * p); z *= 1 - 0.12 * Math.sin(Math.PI * p); }
      return { cx: lerp(A.cx, B.cx, w), cy: lerp(A.cy, B.cy, w), r, z, k: j + p };
    }
  }
  let k = SHOTS.findIndex((x) => t < x.b);
  if (k < 0) k = SHOTS.length - 1;
  const S = SHOTS[k], a0 = k === 0 ? 0 : S.a + POST, a1 = k === SHOTS.length - 1 ? D : S.b - PRE;
  const q = DRIFT(clamp((t - a0) / Math.max(0.2, a1 - a0)));
  return { cx: S.cx, cy: S.cy, r: S.r + DR * q, z: (1 / S.s) * (1 + DZ * q), k };
};
// a stage point on the screen, through the camera
const toScreen = (c: Cam, x: number, y: number): [number, number] => {
  const dx = x - c.cx, dy = y - c.cy, co = Math.cos(-c.r * DEG), si = Math.sin(-c.r * DEG);
  return [540 + (dx * co - dy * si) * c.z, 960 + (dx * si + dy * co) * c.z];
};
// whether a shot can be seen at all
const visible = (c: Cam, S: Shot) => {
  const pts = [[-500, -700], [1580, -700], [1580, 2620], [-500, 2620]].map(([x, y]) => toScreen(c, ...on(S, x, y)));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const w = Math.max(...xs) - Math.min(...xs);
  return Math.max(...xs) > -200 && Math.min(...xs) < 1280 && Math.max(...ys) > -200 && Math.min(...ys) < 2120 && w > 60;
};
// how far the camera is from a shot, in the shot's own pixels: the foreground layer moves 14% more than the words
const parOf = (c: Cam, S: Shot): [number, number] => {
  const dx = c.cx - S.cx, dy = c.cy - S.cy, co = Math.cos(-S.r * DEG), si = Math.sin(-S.r * DEG);
  const lx = (dx * co - dy * si) / S.s, ly = (dx * si + dy * co) / S.s;
  return [clamp(-0.14 * lx, -260, 260), clamp(-0.14 * ly, -260, 260)];
};

// ───────────────────────────── helpers for the cut-outs ─────────────────────────────

// slam in from an offset with the elastic overshoot, then (optionally) get thrown out
const slam = (t: number, t0: number, d: number, from: Pose, rest: Pose = {}, leave?: [number, Pose, number?]): Pose => {
  if (t < t0) return { o: 0 };
  const k = OVR(clamp((t - t0) / d));
  const p: Pose = { x: lerp(from.x ?? 0, rest.x ?? 0, k), y: lerp(from.y ?? 0, rest.y ?? 0, k), r: lerp(from.r ?? rest.r ?? 0, rest.r ?? 0, k), s: lerp(from.s ?? 1, rest.s ?? 1, k) };
  if (leave && t >= leave[0]) {
    const ld = leave[2] ?? 0.35, l = EXIT(clamp((t - leave[0]) / ld));
    if (t > leave[0] + ld) return { o: 0 };
    p.x = (p.x ?? 0) + (leave[1].x ?? 0) * l; p.y = (p.y ?? 0) + (leave[1].y ?? 0) * l; p.r = (p.r ?? 0) + (leave[1].r ?? 0) * l; p.s = (p.s ?? 1) * (1 + ((leave[1].s ?? 1) - 1) * l);
  }
  return p;
};
// an element waiting in place with a slow float, for when the camera arrives on it
const wait = (t: number, amp = 10, ph = 0): Pose => ({ y: amp * Math.sin(t * 1.3 + ph), r: 0.6 * Math.sin(t * 0.9 + ph) });
const W = (pairs: [string, number, KW["v"]?][]): KW[] => pairs.map(([w, t, v]) => ({ w, t, v }));
const kw = (w: string, t: number, v?: KW["v"], more: Partial<KW> = {}): KW => ({ w, t, v, ...more });

// ───────────────────────────── the shots ─────────────────────────────

// A · مشروعك متعوب عليه، بس أرباحك قليلة: the wallet waits; «أرباحك» fills in; the coin drops, hits «قليلة؟» and knocks
//     it crooked, falls into the wallet and the wallet jumps
const A: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={330} size={92} words={W([["مشروعك", 0.0], ["متعوب", 0.56], ["عليه،", 0.88], ["بس", 1.38]])} />
    <KLine t={t} top={430} size={300} words={[kw("أرباحك", 1.66, "fill", { fill: 1.95 })]} />
    <KLine t={t} top={780} size={210} words={[kw("*قليلة؟", 2.1, "punch", { fx: (t) => (t < 2.28 ? {} : { y: 26 * OVR(clamp((t - 2.28) / 0.3)), r: -8 * OVR(clamp((t - 2.28) / 0.3)) }) })]} />
    <Cut id="wallet" src="wallet.png" w={1000} left={40} top={1110} t={t} pose={(t) => {
      const p: Pose = { y: 40 * (1 - DRIFT(clamp(t / 2.4))), r: -6 + 2 * (1 - DRIFT(clamp(t / 2.4))) };
      if (t > 2.42) { const k = clamp((t - 2.42) / 0.4); p.y = (p.y ?? 0) - 40 * Math.sin(Math.PI * k) * (1 - k); p.r = (p.r ?? 0) + 3 * Math.sin(Math.PI * k); }
      return p;
    }} />
    <Cut id="coin" src="coin.png" w={180} left={450} top={1000} z={14} colour t={t} pose={(t) => {
      if (t < 1.98 || t > 2.62) return { o: 0 };
      if (t < 2.28) { const p = clamp((t - 1.98) / 0.3); return { y: lerp(-1350, -200, p * p), r: lerp(-260, -20, p) }; }
      if (t < 2.42) { const p = clamp((t - 2.28) / 0.14); return { x: lerp(0, 60, p), y: lerp(-200, 40, p * p), r: lerp(-20, 40, p) }; }
      const p = clamp((t - 2.42) / 0.2); return { x: 60, y: lerp(40, 90, p), s: lerp(1, 0.4, p), o: 1 - p };
    }} />
  </>
);

// the phones with my reels; the middle one's screen wipes to orange before the camera goes into it
const phone = (id: string, left: number, top: number, w: number, r: number, t: number, t0: number, clip: string, at: number, from: number, dur: number, turn?: number, wipeAt?: number, fixed?: boolean) => (
  <Cut id={id} src="phone.png" w={w} left={left} top={top} t={t} fixed={fixed} pose={(t) => {
    const p = t0 <= 0 ? { r } as Pose : slam(t, t0, 0.55, { y: 900, r: r * 3 }, { r });
    if (turn && t > turn) p.ry = 360 * ENT(clamp((t - turn) / 0.5));
    return p;
  }}>
    <Screen clip={clip} from={from} dur={dur} at={at}>
      {wipeAt !== undefined && t > wipeAt && <div style={{ position: "absolute", inset: 0, zIndex: 5, background: "#e9631f", transform: `translateY(${100 * (1 - ENT(clamp((t - wipeAt) / 0.22)))}%)` }} />}
    </Screen>
  </Cut>
);

// B · عدنا نصمملك موشن جرافيك وبوستات إعلانية: the phones wait playing my reels; «نصمملك» stretches; «موشن جرافيك» rides
//     a bar; the phones turn on «وبوستات»; «إعلانية» fills; the middle screen wipes to orange and the camera goes in
const B: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={300} size={124} stretch={5} out={4.1} words={W([["عدنا", 2.65], ["*نصم~ملك", 2.91]])} />
    <KLine t={t} top={470} size={140} out={4.1} words={W([["موشن", 3.45, "bar"], ["جرافيك", 3.73, "bar"]])} />
    <KLine t={t} top={300} size={124} words={W([["وبوستات", 4.2]])} />
    <KLine t={t} top={440} size={190} words={[kw("إعلانية", 4.73, "fill", { fill: 4.88 })]} />
    {phone("phL", 20, 960, 400, -10, t, 2.2, "dollar-reel.mp4", 1.3, 2.2, 3.4, 4.2)}
    {phone("phR", 660, 960, 400, 9, t, 2.3, "logos-reel.mp4", 16.3, 2.2, 3.4, 4.26)}
    {phone("phC", 290, 820, 500, -2, t, 0, "vizion-reel.mp4", 7.1, 2.2, 3.0, 4.32, 4.7, true)}
  </>
);

// D1 · تحجي بقوة براندك (inside the phone): the megaphone slams in from the left edge; «براندك» is blasted out of its
//     mouth onto a dark star
const D1: React.FC<{ t: number }> = ({ t }) => {
  const bs = t < 6.06 ? 0 : bounce(t, 6.06);
  const fly = OVR(clamp((t - 6.06) / 0.42));
  return (
    <>
      <KLine t={t} top={300} size={110} words={W([["تحجي", 5.25], ["بقوة", 5.63, "bar"]])} />
      <Cut id="mega" src="megaphone.png" w={860} left={-260} top={820} t={t} pose={(t) => {
        const p = slam(t, 5.22, 0.5, { x: -700, r: -40 }, { r: -18 });
        if (t > 6.04) { const k = clamp((t - 6.04) / 0.35); p.x = (p.x ?? 0) - 60 * Math.sin(Math.PI * k); p.s = 1 + 0.08 * Math.sin(Math.PI * k); }
        return p;
      }} />
      <Burst cx={lerp(470, 700, fly)} cy={lerp(980, 760, fly)} r={310} s={bs} rot={t * 14} />
      {t >= 6.06 && (
        <div style={{ position: "absolute", left: lerp(170, 400, fly), top: lerp(860, 640, fly), width: 600, zIndex: 21, transform: `scale(${lerp(0.2, 1, fly)}) rotate(${lerp(-25, -6, fly)}deg)` }}>
          <div style={{ fontFamily: FONT, fontSize: 200, color: "#fff", textAlign: "center", direction: "rtl", lineHeight: 1.15 }}>براندك</div>
        </div>
      )}
    </>
  );
};

// D2 · وتبيع بمكانك: the shop owner waits with the bag; on «بمكانك» he pushes it at the camera
const D2: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={300} size={136} words={[kw("وتبيع", 6.67), kw("*بمكانك", 7.09, "punch")]} />
    <Cut id="owner" src="shop-owner.png" w={920} left={80} top={960} t={t} pose={(t) => { const p = wait(t, 8); p.s = 1 + punch(t, 7.09, 0.07); p.y = (p.y ?? 0) - 40 * punch(t, 7.09, 1); return p; }} />
  </>
);

// F · حركة / فكرة / نتيجة: one big phone; each word rises inside its screen; what it does rides a bar above; its own thing
//     slams in against the phone and is knocked out by the next; the screen wipes to orange and the camera goes in
const scr = (t: number, w: string, t0: number, t1: number) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const up = 110 * (1 - ENT(clamp((t - t0) / 0.4))), lift = -120 * EXIT(clamp((t - t1) / 0.28));
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ fontFamily: FONT, fontSize: 130, color: "#fff", direction: "rtl", transform: `translateY(${up + lift}%)` }}>{w}</div>
    </div>
  );
};
const knock = (t: number, t0: number, t1: number | undefined, from: Pose, rest: Pose, out: Pose): Pose => slam(t, t0, 0.45, from, rest, t1 !== undefined ? [t1, out, 0.3] : undefined);
const F: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={300} size={112} out={9.1} words={W([["تشد", 8.37, "bar"], ["*العين", 8.61, "punch"]])} />
    <KLine t={t} top={300} size={112} out={10.7} words={W([["تقنع", 9.63, "bar"], ["الزبون", 10.03, "bar"]])} />
    <KLine t={t} top={300} size={112} words={W([["ترفع", 11.45, "bar"], ["*مبيعاتك", 11.83, "punch"]])} />
    <Cut id="phF" src="phone.png" w={700} left={190} top={620} t={t} fixed pose={() => ({ r: -3 })}>
      <Screen>
        {scr(t, "حركة", 7.79, 9.1)}
        {scr(t, "فكرة", 9.19, 10.7)}
        {scr(t, "ونتيجة", 10.77, 12.1)}
        {t > 12.08 && <div style={{ position: "absolute", inset: 0, background: "#e9631f", transform: `translateY(${100 * (1 - ENT(clamp((t - 12.08) / 0.22)))}%)` }} />}
      </Screen>
    </Cut>
    <Cut id="binoF" src="binoculars.png" w={520} left={-120} top={1300} z={14} t={t} pose={(t) => knock(t, 7.79, 9.12, { x: -500, y: 300, r: -30 }, { r: -10 }, { x: -700, r: -40 })} />
    <Cut id="bulbF" src="bulb.png" w={300} left={760} top={430} z={14} t={t} pose={(t) => knock(t, 9.19, 10.72, { y: -900, r: 30 }, { r: 12 }, { x: 600, y: -300, r: 50 })} />
    <Cut id="coinsF" src="coin-stacks.png" w={540} left={600} top={1380} z={14} t={t} pose={(t) => knock(t, 10.77, undefined, { x: 500, y: 300, r: 20 }, { r: 6 }, {})} />
  </>
);

// I · من أول 3 ثواني بإعلانك (inside the phone): «من» stretches across the frame; «أول» on a pill; the hand brings the
//     stopwatch and shoves the giant 3
const I: React.FC<{ t: number }> = ({ t }) => {
  const shove = t < 13.32 ? 0 : OVR(clamp((t - 13.32) / 0.35));
  return (
    <>
      <KLine t={t} top={290} size={210} stretch={11} words={W([["م~ن", 12.67]])} />
      <KLine t={t} top={600} size={110} align="r" words={W([["أول", 12.93, "pill"]])} />
      {t >= 13.17 && (
        <div style={{ position: "absolute", left: 40, top: 640, zIndex: 9, fontFamily: FONT, fontSize: 820, lineHeight: 1, color: INK, transformOrigin: "50% 70%", transform: `translateX(${-50 * shove}px) scale(${bounce(t, 13.17)}) rotate(${-14 * (1 - clamp((t - 13.17) / 0.2)) - 7 * shove}deg)` }}>3</div>
      )}
      <KLine t={t} top={1500} size={104} align="l" words={W([["ثواني", 13.35], ["*بإعلانك", 13.73, "punch"]])} />
      <Cut id="hand" src="stopwatch-hand.png" w={520} left={620} top={930} t={t} pose={(t) => { const p = slam(t, 12.72, 0.5, { y: 900, x: 200, r: 18 }, { r: -6 }); p.x = (p.x ?? 0) - 40 * Math.sin(Math.PI * clamp((t - 13.17) / 0.3)); return p; }} />
    </>
  );
};

// J1 · الزبون راح يلمس الكواليتي العالي: the magnifier slides its glass onto «الكواليتي» and the word swells under it
const J1: React.FC<{ t: number }> = ({ t }) => {
  const sw = t < 15.45 ? 0 : OVR(clamp((t - 15.45) / 0.4));
  return (
    <>
      <KLine t={t} top={300} size={104} words={W([["الزبون", 14.47], ["راح", 14.87], ["يلمس", 15.09]])} />
      <KLine t={t} top={460} size={150} words={[kw("الكواليتي", 15.37, "up", { fx: () => ({ s: 1 + 0.14 * sw, y: -8 * sw }) })]} />
      <KLine t={t} top={680} size={150} words={[kw("*العالي", 15.79, "punch")]} />
      <Cut id="lens" src="magnifier.png" w={520} left={390} top={410} z={32} t={t} pose={(t) => slam(t, 14.62, 0.6, { x: 700, y: 400, r: 30 }, { r: -8 })} />
    </>
  );
};

// J2 · يثق بمنتجك، ويدخل يطلب منك مباشرة: the handshake waits; on «يثق» the hands shake and the words shake with them;
//     «مباشرة» rides a bar and the hands jump
const shakeY = (t: number) => (t > 16.75 && t < 17.2 ? 22 * Math.sin(((t - 16.75) / 0.45) * Math.PI * 3) * (1 - (t - 16.75) / 0.45) : 0);
const J2: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={300} size={160} out={17.45} words={[kw("يثق", 16.41, "up", { fx: (t) => ({ y: shakeY(t) * 0.6 }) }), kw("*بمنتجك", 16.69, "punch", { fx: (t) => ({ y: shakeY(t) * 0.6 }) })]} />
    <KLine t={t} top={300} size={112} words={W([["ويدخل", 17.55], ["يطلب", 17.89], ["منك", 18.23]])} />
    <KLine t={t} top={560} size={210} words={W([["مباشرة", 18.55, "bar"]])} />
    <Cut id="shake" src="handshake.png" w={1320} left={-120} top={1000} t={t} pose={(t) => { const p = wait(t, 6); p.y = (p.y ?? 0) + shakeY(t); p.s = 1 + punch(t, 18.55, 0.06); return p; }} />
  </>
);

// L · لأن ويانا راح يطلع إعلانك بمستوى يعزلك تماما عن منافسيك: the king stands among the pawns; «يعزلك» lands and the
//     pawns are knocked out to both sides; «تماما» fills; «عن منافسيك» topples over like the pawns did
const PAWNS: [number, number, number][] = [[40, 1330, 190], [230, 1400, 170], [680, 1400, 170], [850, 1330, 190]];
const topple = (dir: number) => (t: number) => {
  if (t < 23.05) return {};
  const k = clamp((t - 23.05) / 0.45);
  return { r: dir * 80 * ENT(k), y: 900 * k * k, x: dir * 120 * k };
};
const L: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={300} size={104} out={21.42} words={W([["لأن", 19.09], ["ويانا", 19.65], ["راح", 20.21], ["يطلع", 20.43]])} />
    <KLine t={t} top={440} size={150} out={21.42} words={W([["إعلانك", 20.69, "bar"], ["بمستوى", 21.13, "bar"]])} />
    <KLine t={t} top={300} size={180} words={[kw("يعزلك", 21.75, "punch"), kw("تماما", 22.17, "fill", { fill: 22.4 })]} />
    <KLine t={t} top={540} size={116} dim words={[kw("عن", 22.69, "up", { fx: topple(1) }), kw("منافسيك", 22.77, "up", { fx: topple(-1) })]} />
    {PAWNS.map(([x, y, w], i) => (
      <Cut key={i} id={`pawn${i}`} src="chess-pawn.png" w={w} left={x} top={y} t={t} pose={(t) => {
        if (t < 21.75) return wait(t, 6, i);
        const l = clamp((t - 21.75 - i * 0.04) / 0.5);
        if (l >= 1) return { o: 0 };
        return { x: (i < 2 ? -1 : 1) * 900 * ENT(l), y: -300 * Math.sin(Math.PI * l), r: (i < 2 ? -1 : 1) * 160 * l };
      }} />
    ))}
    <Cut id="king" src="chess-king.png" w={300} left={390} top={860} t={t} pose={(t) => { const p = wait(t, 6); p.s = 1 + punch(t, 21.75, 0.08); return p; }} />
  </>
);

// M1 · ويخلي الزبون يشتري منك مرة ومرتين وعشرة: the counts land tilted across the frame with their ×1 ×2 ×10 pills; a bag
//     drops on each, then the pile, and the pile shoves «وعشرة» up
const BAG = ["bag-orange.png", "bag-black.png", "bag-blue.png", "bag-black2.png"];
const PILE: [number, number][] = [[660, 1210], [150, 1300], [20, 1440], [330, 1480], [620, 1460], [850, 1380], [120, 1630], [470, 1650], [760, 1620], [280, 1740], [600, 1770], [900, 1710]];
const M1: React.FC<{ t: number }> = ({ t }) => {
  const heave = t < 26.0 ? 0 : OVR(clamp((t - 26.0) / 0.35));
  return (
    <>
      <KLine t={t} top={300} size={100} out={24.72} words={W([["ويخلي", 23.57], ["الزبون", 23.93], ["يشتري", 24.27], ["منك", 24.63]])} />
      <KLine t={t} top={330} size={180} align="r" rot={-8} words={W([["مرة", 24.97, "punch"], ["×1", 24.97, "pill"]])} />
      <KLine t={t} top={560} size={180} align="l" rot={5} words={W([["ومرتين", 25.35, "punch"], ["×2", 25.35, "pill"]])} />
      <KLine t={t} top={800} size={215} rot={-4} words={[kw("*وعشرة", 25.97, "punch", { fx: () => ({ y: -70 * heave }) }), kw("×10", 25.97, "pill", { fx: () => ({ y: -70 * heave }) })]} />
      {PILE.map(([x, y], i) => {
        const t0 = i === 0 ? 24.95 : i === 1 ? 25.33 : 25.95 + (i - 2) * 0.04;
        return <Cut key={i} id={`bag${i}`} src={BAG[i % 4]} w={230 + (i % 3) * 30} left={x} top={y} t={t} pose={(t) => slam(t, t0, 0.42, { y: -1600, r: (i % 2 ? 1 : -1) * 40 }, { r: Math.sin(i * 1.9) * 12 })} />;
      })}
    </>
  );
};

// M2 · لأن شاف براند حقيقي قدامه: the man with the binoculars waits on the left looking right; «براند» lands where he
//     looks and he leans in
const M2: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={520} size={112} align="r" words={W([["لأن", 26.67], ["شاف", 27.01]])} />
    <KLine t={t} top={650} size={240} align="r" words={W([["*براند", 27.21, "punch"]])} />
    <KLine t={t} top={930} size={132} align="r" words={W([["حقيقي", 27.57, "bar"], ["قدامه", 27.97, "bar"]])} />
    <Cut id="watcher" src="binoculars-man.png" w={560} left={-10} top={430} t={t} pose={(t) => { const p = wait(t, 8); const k = OVR(clamp((t - 27.21) / 0.4)); p.x = 30 * k; p.r = (p.r ?? 0) + 3 * k; return p; }} />
  </>
);

// O1 · كافي تضيع جمهورك بتصاميم عادية، الكل يتخطاها، ابدأ اليوم: the crowd walks past along the bottom; on «يتخطاها»
//     the next crowd walks straight through the words and drags them along
const O1: React.FC<{ t: number }> = ({ t }) => {
  const drag = t < 31.0 ? 0 : -260 * ENT(clamp((t - 31.0) / 0.5));
  return (
    <>
      <KLine t={t} top={300} size={112} out={30.6} words={W([["كافي", 28.55], ["تضيع", 28.93], ["*جمهورك", 29.15, "punch"]])} />
      <KLine t={t} top={450} size={150} out={30.6} words={[kw("بتصاميم", 29.65), kw("عادية", 30.15, "fill")]} />
      <KLine t={t} top={1000} size={150} out={31.5} x={drag} words={W([["الكل", 30.85], ["يتخطاها", 30.99]])} />
      <KLine t={t} top={360} size={180} words={W([["ابدأ", 31.63, "punch"], ["اليوم", 32.05, "bar"]])} />
      <Cut id="crowd1" src="crowd.png" w={1000} left={0} top={1220} t={t} pose={(t) => ({ x: lerp(1100, -1400, clamp((t - 28.3) / 4.2)) })} />
      <Cut id="crowd2" src="crowd2.png" w={960} left={0} top={1180} z={35} t={t} pose={(t) => (t < 30.6 ? { o: 0 } : { x: lerp(1200, -1300, clamp((t - 30.6) / 2.4)) })} />
    </>
  );
};

// O2 · بتصاميم توقف الزبون وتقفل وياه البيعة: the stop hand slams up and throws «توقف» up; the crowd stops dead against
//     it; the padlock drops onto «البيعة» and locks it
const O2: React.FC<{ t: number }> = ({ t }) => {
  const lockHit = t < 34.37 ? 0 : clamp((t - 34.37) / 0.3);
  return (
    <>
      <KLine t={t} top={300} size={104} words={[kw("بتصاميم", 32.51), kw("*توقف", 33.09, "punch", { fx: (t) => ({ y: t < 33.0 ? 0 : -50 * OVR(clamp((t - 33.0) / 0.3)) }) }), kw("الزبون", 33.51)]} />
      <KLine t={t} top={470} size={140} words={[kw("وتقفل", 34.05), kw("وياه", 34.61), kw("البيعة", 34.85, "bar", { fx: (t) => ({ x: t < 34.9 ? 0 : 10 * Math.sin((t - 34.9) * 60) * (1 - clamp((t - 34.9) / 0.3)) }) })]} />
      <Cut id="crowd3" src="crowd2.png" w={960} left={0} top={1180} t={t} pose={(t) => {
        if (t < 32.2) return { o: 0 };
        if (t > 33.95) { const l = clamp((t - 33.95) / 0.35); return l >= 1 ? { o: 0 } : { x: 220, y: 900 * EXIT(l) }; }
        return { x: t < 33.05 ? lerp(1100, 280, clamp((t - 32.2) / 0.85)) : lerp(280, 220, ENT(clamp((t - 33.05) / 0.3))) };
      }} />
      <Cut id="stop" src="stop-hand.png" w={760} left={160} top={880} z={12} t={t} pose={(t) => slam(t, 32.98, 0.32, { y: 1000, r: 10 }, {}, [33.95, { y: 1000 }, 0.32])} />
      <Cut id="lock" src="padlock.png" w={330} left={375} top={760} t={t} pose={(t) => {
        if (t < 34.05) return { o: 0 };
        if (t < 34.37) return { y: lerp(-1400, 0, clamp((t - 34.05) / 0.32) ** 2) };
        return { y: 16 * Math.sin(Math.PI * lockHit), r: t > 34.85 ? 6 * Math.sin((t - 34.85) * 50) * (1 - clamp((t - 34.85) / 0.3)) : 0 };
      }} />
    </>
  );
};

// R1 · تواصل ويانا بالخاص: the receiver swings in from the right edge and rings on «بالخاص», which sits on a pill
const R1: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={300} size={136} words={W([["تواصل", 35.53], ["ويانا", 35.81, "bar"]])} />
    <KLine t={t} top={700} size={160} align="l" words={W([["بالخاص", 36.09, "pill"]])} />
    <Cut id="recv" src="receiver.png" w={760} left={520} top={540} t={t} pose={(t) => { const p = slam(t, 35.3, 0.45, { x: 700, r: 40 }, {}); if (t > 36.09) p.r = (p.r ?? 0) + 8 * Math.sin((t - 36.09) * 40) * (1 - clamp((t - 36.09) / 0.45)); return p; }} />
  </>
);

// R2 · شوف أعمالنا، وخلي براندك يبيع صح: my reels on the phones, waiting as the camera pulls back; the handle on a pill
const R2: React.FC<{ t: number }> = ({ t }) => (
  <>
    <KLine t={t} top={300} size={150} out={37.45} words={W([["شوف", 36.79], ["*أعمالنا", 36.99, "punch"]])} />
    <KLine t={t} top={300} size={98} words={W([["وخلي", 37.53], ["براندك", 38.05], ["*يبيع", 38.71, "punch"], ["صح", 39.07, "bar"]])} />
    <KLine t={t} top={470} size={92} words={[{ w: "@allawi.psd", t: 39.55, v: "pill" }]} />
    {phone("phL2", 20, 960, 400, -10, t, 36.4, "logos-reel.mp4", 46.0, 36.3, 4.9)}
    {phone("phR2", 660, 960, 400, 9, t, 36.5, "dollar-reel.mp4", 2.0, 36.3, 4.9)}
    {phone("phC2", 290, 820, 500, -2, t, 36.6, "vizion-reel.mp4", 7.4, 36.3, 4.9)}
  </>
);

const SCENES: Record<string, React.FC<{ t: number }>> = { A, B, D1, D2, F, I, J1, J2, L, M1, M2, O1, O2, R1, R2 };

// ───────────────────────────── the background ─────────────────────────────

// a diagonal grid of my key words at 10%, under a light; both move slower than the stage (each shot has its own anchor)
const KEYS = "براندك   مبيعات   كواليتي   إعلانك   تصميم   ";
const Back: React.FC<{ cam: Cam }> = ({ cam }) => {
  const ax = -300 * cam.k, ay = 140 * cam.k;
  const lx = 50 + 32 * Math.sin(cam.k * 0.9), ly = 22 + 14 * Math.cos(cam.k * 0.7);
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(85% 55% at ${lx}% ${ly}%, rgba(255,170,110,.55) 0%, rgba(255,170,110,0) 70%), linear-gradient(170deg, #f07a2e 0%, #e9631f 48%, #e2541b 100%)` }} />
      <div style={{ position: "absolute", left: -3600, top: -2400, width: 9000, height: 7000, transformOrigin: "4140px 3360px", transform: `translate(${ax % 2400}px, ${ay % 1520}px) rotate(${-16 - cam.r * 0.4}deg) scale(${Math.pow(cam.z * SHOTS[Math.min(SHOTS.length - 1, Math.round(cam.k))].s, 0.25)})`, color: "rgba(255,255,255,.1)", fontFamily: FONT, fontSize: 118, lineHeight: 1.6, whiteSpace: "nowrap", direction: "rtl" }}>
        {Array.from({ length: 36 }, (_, i) => <div key={i} style={{ marginRight: (i % 2) * 300 }}>{KEYS.repeat(14)}</div>)}
      </div>
      <AbsoluteFill style={{ background: `url(${staticFile("img/paper.jpg")}) center/cover`, mixBlendMode: "multiply", opacity: 0.14 }} />
    </>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("font"));
  useEffect(() => {
    const f = new FontFace("DG Sahabah", `url(${staticFile("fonts/DG-Sahabah-Reg.ttf")})`, { weight: "400" });
    f.load().then((ff) => { document.fonts.add(ff); continueRender(handle); });
  }, [handle]);
  const t = stepped(frame);
  const cam = camAt(t), prev = camAt(Math.max(0, t - SHUTTER));
  // the camera's motion blur: how far the middle of the frame travelled on screen during the shutter, plus the zoom
  const [px, py] = toScreen(prev, cam.cx, cam.cy);
  const zoomBlur = Math.abs(Math.log(cam.z / prev.z)) * 260 + Math.abs(cam.r - prev.r) * 6;
  const bx = Math.min(22, Math.abs(px - 540) / 4 + zoomBlur), by = Math.min(22, Math.abs(py - 960) / 4 + zoomBlur);
  const world = `translate(540px, 960px) scale(${cam.z}) rotate(${-cam.r}deg) translate(${-cam.cx}px, ${-cam.cy}px)`;
  return (
    <AbsoluteFill style={{ background: "#e2541b", overflow: "hidden" }}>
      <Back cam={cam} />
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id="cam" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB"><feGaussianBlur stdDeviation={`${bx.toFixed(2)} ${by.toFixed(2)}`} /></filter>
      </svg>
      <AbsoluteFill style={{ filter: bx + by > 0.8 ? "url(#cam)" : undefined }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, transformOrigin: "0 0", transform: world }}>
          {SHOTS.map((S) => {
            if (t < S.a - 0.45 || t > S.b + 0.45 || !visible(cam, S)) return null;
            const C = SCENES[S.id];
            const clip = (S.id === "D1" && t < 5.47) || (S.id === "I" && t < 12.89);
            return (
              <div key={S.id} style={{ position: "absolute", left: S.cx - 540, top: S.cy - 960, width: 1080, height: 1920, transformOrigin: "540px 960px", transform: `rotate(${S.r}deg) scale(${S.s})`, overflow: clip ? "hidden" : "visible" }}>
                <Par.Provider value={parOf(cam, S)}>
                  <C t={t} />
                </Par.Provider>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 190, right: 56, zIndex: 60, fontFamily: FONT, fontSize: 34, color: "rgba(255,255,255,.9)", direction: "ltr", opacity: t > 39.4 ? 0 : 1 }}>@allawi.psd</div>
      <AbsoluteFill style={{ background: `url(${staticFile("img/grain.png")}) 0 0/420px`, mixBlendMode: "overlay", opacity: 0.05, pointerEvents: "none" }} />
      <Sound />
    </AbsoluteFill>
  );
};
