// The 37 s reel for the Iraq internet speed site, in the language of a phone launch film: short single lines with a
// lot of air, the phone off to one side with soft buttons beside it, horizontal whip pans with a real shutter blur,
// and the camera punching in close on the button being pressed and on the numbers. Every station of the film sits
// side by side in one wide world; the camera moves between them.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, Easing, delayRender, continueRender } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import data from './data.json';

export const FPS = 30, DUR = 37;
const LIGHT = '#E5E5EA', DARK = '#121215', FIELD = '#0B6E4F', BLUE = '#0A84FF', PILL = '#EFEFF4', PILL_DARK = '#1E1E23';
const INK = '#1d1d1f', INK2 = '#3a3a3c', SOFT = '#6e6e73', WHITE = '#ffffff';
const RED = '#d2483f', RED_T = '#c0352c', HOT = '#ff453a', GREEN = '#12795a', LEAF = '#5aa85e', AMBER = '#e3b021', ORANGE = '#ea8a2e', WIN = '#0D8A4E';
const FONT = 'Rubik, RubikL';

// ---------- time ----------
const soft = Easing.bezier(0.22, 1, 0.36, 1);      // landings
const whipE = Easing.bezier(0.65, 0, 0.35, 1);     // whip pans
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, t0: number, d: number) => clamp((t - t0) / d);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const expoIn = (x: number) => x <= 0 ? 0 : x >= 1 ? 1 : (Math.pow(2, 10 * x) - 1) / 1023;
const AR = (n: number) => String(Math.round(n)).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
const ARd = (v: number) => v < 10 ? `${AR(Math.floor(v))}٫${AR(Math.round(v * 10) % 10)}` : AR(v);
const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
const bandFill = (v: number) => v < 10 ? RED : v < 25 ? ORANGE : v < 50 ? AMBER : v < 100 ? LEAF : GREEN;

// ---------- the world: stations side by side, each a 1080 x 1920 frame, the next one always to the left ----------
const GAP = 1400;
const SX = (i: number) => -i * GAP;                 // left edge of station i in the world
// the phone in station 2, on the right half of the frame
const PH2 = { cx: 760, cy: 960, w: 470 };
const phoneGeo = (w: number) => { const h = w * 1344 / 646, bz = w * 22 / 646, sw = w - 2 * bz; return { h, bz, sw, sh: sw * 844 / 390, k: sw / 390 }; };
const onScreen = (P: { cx: number; cy: number; w: number }, u: number, v: number) => { const g = phoneGeo(P.w); return [P.cx - g.sw / 2 + u * g.k, P.cy - g.h / 2 + g.bz + v * g.k]; };
const PILL2 = { cx: 290, cy: 1010, w: 400, h: 112 };

type Key = [number, number, number, number, number, string];   // time, station, x and y in the station, zoom, how it goes on
const S2_COUNT = onScreen(PH2, 235, 215), S2_VERDICT = onScreen(PH2, 200, 240);
const KEYS: Key[] = [
  [0, 0, 540, 960, 1.0, 'L'], [1.7, 0, 540, 960, 1.04, 'W'],                       // the question
  [2.1, 1, 540, 960, 1.0, 'L'], [2.9, 1, 540, 960, 1.03, 'W'],                     // your line against your area
  [3.3, 2, 540, 960, 1.0, 'L'], [4.0, 2, 540, 960, 1.02, 'G'],                     // the phone and the button
  [4.4, 2, PILL2.cx, PILL2.cy, 2.2, 'L'], [4.8, 2, PILL2.cx + 4, PILL2.cy, 2.24, 'G'],   // close on the press
  [5.3, 2, S2_COUNT[0], S2_COUNT[1], 1.7, 'L'], [6.3, 2, S2_COUNT[0], S2_COUNT[1] + 6, 1.76, 'G'],   // the test counting
  [6.7, 2, S2_VERDICT[0], S2_VERDICT[1], 2.45, 'L'], [7.6, 2, S2_VERDICT[0], S2_VERDICT[1] + 4, 2.5, 'W'],   // the result
  [8.0, 3, 540, 960, 1.0, 'L'], [10.6, 3, 540, 960, 1.05, 'W'],                    // the share card
  [11.0, 4, 540, 960, 1.0, 'L'], [12.0, 4, 540, 960, 1.02, 'G'],                   // for gamers
  [12.4, 4, 540, 1000, 1.3, 'L'], [14.9, 4, 540, 1000, 1.62, 'W'],                 // the ping, closer and closer
  [15.3, 5, 540, 960, 1.0, 'L'], [16.9, 5, 540, 960, 1.04, 'W'],                   // lowest and highest
  [17.3, 6, 540, 960, 1.0, 'L'], [21.6, 6, 540, 960, 1.05, 'W'],                   // 4G against the home line
  [22.0, 7, 540, 960, 1.0, 'L'], [25.6, 7, 540, 960, 1.04, 'W'],                   // two areas
  [26.0, 8, 540, 960, 1.0, 'L'], [29.75, 8, 540, 960, 1.05, 'C'],                  // the ministry's map
  [29.75, 9, 540, 960, 1.0, 'L'], [32.9, 9, 540, 960, 1.04, 'W'],                  // Iraq since 2019
  [33.3, 10, 540, 960, 1.0, 'L'], [37, 10, 540, 940, 1.05, 'L'],                   // the end
];
const WHIPS = KEYS.map((k, i) => k[5] === 'W' && KEYS[i + 1] ? [k[0], KEYS[i + 1][0]] : null).filter(Boolean) as number[][];
function camAt(t: number) {
  let i = 0; while (i < KEYS.length - 1 && t >= KEYS[i + 1][0]) i++;
  const A = KEYS[i], B = KEYS[i + 1];
  const pos = (k: Key) => [SX(k[1]) + k[2], k[3], k[4]];
  if (!B || t <= A[0]) return pos(A);
  const x = (t - A[0]) / (B[0] - A[0]), e = A[5] === 'W' ? whipE(x) : A[5] === 'G' ? soft(x) : A[5] === 'C' ? 0 : x;
  const a = pos(A), b = pos(B);
  // a whip dips the zoom a little in the middle, like a real fast pan
  const dip = A[5] === 'W' ? 1 - 0.08 * Math.sin(Math.PI * x) : 1;
  return [lerp(a[0], b[0], e), lerp(a[1], b[1], e), lerp(a[2], b[2], e) * dip];
}

// ---------- the room ----------
function room(t: number) {
  const dark = (t0: number, t1: number) => smoothStep(seg(t, t0, 0.4)) * (1 - smoothStep(seg(t, t1, 0.4)));
  if (t >= 29.75 && t < 32.9) return FIELD;
  if (t >= 32.9 && t < 33.3) return mix(FIELD, DARK, seg(t, 32.9, 0.4));
  if (t >= 33.3) return DARK;
  return mix(LIGHT, DARK, dark(7.6, 14.9));
}
const smoothStep = (x: number) => x * x * (3 - 2 * x);
const isDark = (t: number) => t >= 7.8 && t < 15.1 || t >= 33.1;

// ---------- parts ----------
const at = (i: number, x: number, y: number): React.CSSProperties => ({ position: 'absolute', left: SX(i) + x, top: y, transform: 'translate(-50%, -50%)' });
const T: React.FC<{ size: number; weight?: number; color?: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ size, weight = 500, color = INK, style, children }) => (
  <div style={{ fontFamily: FONT, fontSize: size, fontWeight: weight, color, direction: 'rtl', lineHeight: 1.25, whiteSpace: 'nowrap', ...style }}>{children}</div>
);
// a scene's line, set to fit inside 960 px, and under it a quieter line that may wrap
let MEASURE: CanvasRenderingContext2D | null = null;
function fit(str: string, size: number, weight: number, maxW: number) {
  if (typeof document === 'undefined') return size;
  if (!MEASURE) MEASURE = document.createElement('canvas').getContext('2d');
  MEASURE!.font = `${weight} ${size}px ${FONT}`;
  const w = MEASURE!.measureText(str).width;
  return w > maxW ? Math.floor(size * maxW / w) : size;
}
const Title: React.FC<{ i: number; x?: number; y: number; st: React.CSSProperties; text: string; shown?: React.ReactNode; size?: number; color?: string; sub?: string; subSize?: number; subColor?: string; maxW?: number }> =
  ({ i, x = 540, y, st, text, shown, size = 62, color = INK, sub, subSize = 34, subColor, maxW = 900 }) => {
  const fs = fit(text, size, 700, maxW);
  return (
    <div style={{ ...at(i, x, y) }}><div style={{ ...st, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: Math.round(fs * 0.32) }}>
      <T size={fs} weight={700} color={color} style={{ letterSpacing: 0 }}>{shown || text}</T>
      {sub ? <T size={subSize} weight={500} color={subColor || color} style={{ opacity: subColor ? 1 : 0.65, whiteSpace: 'normal', maxWidth: maxW - 60, textAlign: 'center', lineHeight: 1.35, textWrap: 'balance' } as React.CSSProperties}>{sub}</T> : null}
    </div></div>
  );
};
// in: up from a little below, solid almost at once; out: away and gone
function show(t: number, t0: number, t1 = Infinity, d = 0.6) {
  const k = soft(seg(t, t0, d)), o = soft(seg(t, t1, 0.35));
  return { opacity: clamp(k * 3) * (1 - o), transform: `translateY(${(1 - k) * 28 - o * 30}px)` };
}
// a number with ms glued to it at 0.45 of its size, 6 px apart, as «٤٣<small>ms</small>» reads in the browser
const Ms: React.FC<{ v: number }> = ({ v }) => <span style={{ direction: 'ltr', unicodeBidi: 'isolate', display: 'inline-block' }}>{AR(v)}<small style={{ fontSize: '0.45em', marginLeft: 6 }}>ms</small></span>;
// the soft matte buttons: off-white, a hairline of light along the top, a soft shadow; brand colour when active
const Pill: React.FC<{ w: number; h: number; on?: number; onColor?: string; dark?: boolean; s?: number; style?: React.CSSProperties; children: React.ReactNode }> = ({ w, h, on = 0, onColor = BLUE, dark, s = 1, style, children }) => (
  <div style={{
    width: w, height: h, borderRadius: h / 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18,
    background: mix(dark ? PILL_DARK : PILL, onColor, on), transform: `scale(${s})`,
    boxShadow: dark ? 'inset 0 1px 1px rgba(255,255,255,0.12), 0 8px 20px rgba(0,0,0,0.35)' : 'inset 0 1px 1px #FFFFFF, 0 8px 20px rgba(0,0,0,0.08)',
    color: on > 0.5 ? WHITE : dark ? WHITE : INK, fontFamily: FONT, direction: 'rtl', ...style,
  }}>{children}</div>
);
const Track: React.FC<{ w: number; h: number; k: number; color: string }> = ({ w, h, k, color }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: PILL, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.07), inset 0 -1px 1px #FFFFFF, 0 8px 20px rgba(0,0,0,0.06)', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: Math.max(h, w * k), borderRadius: h / 2, background: color, boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.35)' }} />
  </div>
);
// the button press: 1 -> 0.94 -> 1.02 -> 1, and the colour from the moment it is pressed
function press(t: number, tp: number) {
  if (t < tp) return { s: 1, on: 0 };
  const x = t - tp;
  const s = x < 0.08 ? lerp(1, 0.94, soft(x / 0.08)) : x < 0.2 ? lerp(0.94, 1.02, soft((x - 0.08) / 0.12)) : lerp(1.02, 1, soft(clamp((x - 0.2) / 0.16)));
  return { s, on: smoothStep(seg(t, tp + 0.02, 0.14)) };
}
const badgeStyle: React.CSSProperties = { position: 'absolute', fontFamily: FONT, fontWeight: 700, color: WHITE, background: 'rgba(29,29,31,0.88)', borderRadius: 12, padding: '6px 16px', direction: 'rtl', whiteSpace: 'nowrap' };

// the phone, flat on to us, with the real site on its screen
const Phone: React.FC<{ cx: number; cy: number; w: number; img: string; dark?: boolean; btn?: { s: number; on: number } }> = ({ cx, cy, w, img, dark, btn }) => {
  const g = phoneGeo(w), r = w * 86 / 646;
  const go = MARKS.go;
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: cy - g.h / 2, width: w, height: g.h, borderRadius: r,
      background: 'linear-gradient(90deg, #8e8e93, #48484a 8%, #48484a 92%, #7c7c80)',
      boxShadow: dark ? '0 25px 60px rgba(0,0,0,0.5)' : '0 25px 60px rgba(0,0,0,0.12), 0 3px 8px rgba(0,0,0,0.08)' }}>
      <div style={{ position: 'absolute', inset: w * 6 / 646, borderRadius: r - w * 6 / 646, background: '#050505' }} />
      <div style={{ position: 'absolute', left: g.bz, top: g.bz, width: g.sw, height: g.sh, borderRadius: w * 62 / 646, overflow: 'hidden', background: WHITE }}>
        <Img src={staticFile(`site/${img}.png`)} style={{ width: '100%', height: '100%', display: 'block' }} />
        {btn && btn.s !== 1 || btn && btn.on > 0 ? (
          <div style={{ position: 'absolute', left: go[0] * g.k, top: go[1] * g.k, width: go[2] * g.k, height: go[3] * g.k, transform: `scale(${btn.s})`, borderRadius: 10 * g.k, overflow: 'hidden', boxShadow: '0 0 0 4px #fff' }}>
            <Img src={staticFile(`site/${img}.png`)} style={{ position: 'absolute', left: -go[0] * g.k, top: -go[1] * g.k, width: g.sw, height: g.sh }} />
            <div style={{ position: 'absolute', inset: 0, background: BLUE, opacity: btn.on, mixBlendMode: 'lighten' }} />
          </div>
        ) : null}
        <div style={{ ...badgeStyle, left: 14 * g.k, top: 64 * g.k, fontSize: 13 * g.k, padding: `${3 * g.k}px ${10 * g.k}px`, borderRadius: 7 * g.k }}>نموذج فحص</div>
      </div>
    </div>
  );
};
// the pointer: a black arrow with a white edge, in on a curve, a press, and away on another curve
const ARROW = 'M0 0 L0 23.2 L5.5 17.9 L9.2 26.6 L13.1 25 L9.5 16.5 L16.9 16.5 Z';
const cubic = (p0: number[], p1: number[], p2: number[], p3: number[], k: number) => { const u = 1 - k; return [0, 1].map(i => u * u * u * p0[i] + 3 * u * u * k * p1[i] + 3 * u * k * k * p2[i] + k * k * k * p3[i]); };
const Pointer: React.FC<{ t: number; target: number[]; tin: number; tp: number; from: number[]; to: number[] }> = ({ t, target, tin, tp, from, to }) => {
  const tl = tp + 0.3;
  if (t < tin || t > tl + 0.8) return null;
  let p: number[];
  if (t < tp) p = cubic(from, [from[0] - 30, target[1] + 300], [target[0] + 170, target[1] + 80], target, soft(seg(t, tin, tp - 0.1 - tin)));
  else if (t < tl) p = target;
  else p = cubic(target, [target[0] + 80, target[1] + 50], [to[0] - 60, to[1] - 160], to, soft(seg(t, tl, 0.75)));
  const s = t >= tp && t < tp + 0.28 ? 1 - 0.12 * Math.sin(Math.PI * seg(t, tp, 0.28)) : 1;
  return (
    <svg width={50} height={74} viewBox="-2 -2 21 31" style={{ position: 'absolute', left: p[0], top: p[1], transformOrigin: '0 0', transform: `scale(${s})`, filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.3))', overflow: 'visible' }}>
      <path d={ARROW} fill="#000" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" paintOrder="stroke" />
    </svg>
  );
};

// ---------- the stations ----------
const D: any = data;
let MARKS: any = { go: [18, 366, 354, 62] };

function Hook({ t }: { t: number }) {
  return <Title i={0} y={960} st={show(t, 0.12)} text="الخلل من برجك.. لو من منطقتك؟" sub="تحليل أكثر من مليون فحص سرعة حقيقي بالعراق" />;
}
function Bars({ t }: { t: number }) {
  const k1 = soft(seg(t, 2.2, 0.8)), k2 = soft(seg(t, 2.15, 0.6));
  const row = (y: number, label: string, val: string, k: number, col: string, tc: string, t0: number) => (
    <div style={{ ...at(1, 540, y) }}><div style={{ ...show(t, t0), display: 'flex', flexDirection: 'column', gap: 22, alignItems: 'stretch', width: 880 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', direction: 'rtl' }}><T size={40} color={INK2}>{label}</T><T size={44} weight={700} color={tc}>{val}</T></div>
      <Track w={880} h={44} k={k} color={col} />
    </div></div>
  );
  return <>{row(860, 'خطك', '١٢ ميغابت', k1 * 12 / 95, RED, RED_T, 2.05)}{row(1070, 'معدل منطقتك', '٨٧ ميغابت', k2 * 87 / 95, LEAF, GREEN, 2.12)}</>;
}
const P2_AT = 4.5;
function LineTest({ t }: { t: number }) {
  const img = t < 4.9 ? 'home' : t < 6.3 ? 'test-' + String(Math.min(13, Math.floor((t - 4.9) / 0.1))).padStart(2, '0') : 'result';
  const b = press(t, P2_AT), X = SX(2);
  return (
    <>
      <div style={{ position: 'absolute', left: X, top: 0 }}><div style={show(t, 3.25, Infinity, 0.7)}><Phone cx={PH2.cx} cy={PH2.cy} w={PH2.w} img={img} /></div></div>
      <div style={{ ...at(2, PILL2.cx, PILL2.cy - 170) }}><div style={show(t, 3.45)}><T size={50} weight={700} style={{ whiteSpace: 'normal', width: 420, textAlign: 'center' }}>اكشف سرعة خطك الحقيقية</T></div></div>
      <div style={{ ...at(2, PILL2.cx, PILL2.cy) }}><div style={show(t, 3.5)}>
        <Pill w={PILL2.w} h={PILL2.h} on={b.on} s={b.s}><T size={46} weight={700} color={b.on > 0.5 ? WHITE : INK}>ابدأ الفحص</T></Pill>
      </div></div>
      <Pointer t={t} target={[X + PILL2.cx + 40, PILL2.cy + 14]} tin={3.75} tp={P2_AT} from={[X + 1150, 1650]} to={[X + 560, 1500]} />
    </>
  );
}
function Share({ t }: { t: number }) {
  const k = soft(seg(t, 8.05, 0.8)), side = soft(seg(t, 8.25, 0.8));
  const card = (img: string, x: number, w: number, o: React.CSSProperties) => (
    <div style={{ position: 'absolute', left: SX(3) + x - w / 2, top: 1010 - w * 16 / 18, width: w, height: w * 16 / 9, borderRadius: w * 0.05, overflow: 'hidden', ...o }}>
      <Img src={staticFile(`site/${img}.png`)} style={{ width: '100%', height: '100%', display: 'block' }} />
      <div style={{ ...badgeStyle, left: w * 0.04, top: w * 0.04, fontSize: w * 0.04, padding: `${w * 0.008}px ${w * 0.02}px`, borderRadius: w * 0.012 }}>نموذج فحص</div>
    </div>
  );
  return (
    <>
      <Title i={3} y={320} st={show(t, 8.1)} text="وثق فحصك.. وشاركه بضغطة" size={60} color="#f5f5f7" sub="دليل بالأرقام گدام مجهز الخدمة" subColor="#a1a1a6" />
      {card('share-ping', 885, 290, { opacity: 0.55 * side, filter: 'brightness(0.62)', transform: `translateY(${80 + (1 - side) * 60}px)` })}
      {card('share-fast', 195, 290, { opacity: 0.55 * side, filter: 'brightness(0.62)', transform: `translateY(${80 + (1 - side) * 60}px)` })}
      {card('share', 540, 360, { opacity: clamp(k * 3), transform: `translateY(${(1 - k) * 90 - 40 * k}px) scale(${0.94 + 0.06 * k})`, boxShadow: `0 30px 80px rgba(0,0,0,0.5), 0 0 ${140 * k}px rgba(234,138,46,${0.38 * k})` })}
    </>
  );
}
const SPIKE = 13.2;
function Ping({ t }: { t: number }) {
  const jump = soft(seg(t, SPIKE, 0.3)), v = lerp(12, 162, jump), hot = smoothStep(seg(t, SPIKE, 0.35));
  const k = soft(seg(t, 12.0, 0.7));
  return (
    <>
      <Title i={4} y={960} st={show(t, 11.05, 11.95)} text="تلعب أونلاين؟ اكشف سبب اللاگ" color="#f5f5f7" />
      <div style={{ ...at(4, 540, 1000) }}>
        <div style={{ opacity: clamp(k * 3), transform: `translateY(${(1 - k) * 50}px)`, width: 620, height: 380, borderRadius: 44, background: PILL_DARK, position: 'relative',
          boxShadow: `inset 0 1px 1px rgba(255,255,255,0.12), 0 20px 50px rgba(0,0,0,0.5), 0 0 ${120 * hot}px rgba(255,69,58,${0.35 * hot})` }}>
          <div style={{ ...badgeStyle, left: 30, top: 30, fontSize: 22, background: 'rgba(255,255,255,0.12)' }}>نموذج فحص</div>
          <T size={30} color="#a1a1a6" style={{ position: 'absolute', right: 40, top: 34 }}>{t < SPIKE ? 'البنك والخط فارغ' : 'البنك وقت التحميل'}</T>
          <T size={190} weight={700} color={mix('#f5f5f7', HOT, hot)} style={{ position: 'absolute', left: 40, bottom: 26, direction: 'rtl', textShadow: `0 0 ${36 * hot}px rgba(255,69,58,${0.7 * hot})` }}><Ms v={v} /></T>
        </div>
      </div>
      <div style={{ ...at(4, 540, 1300) }}><div style={{ ...show(t, 13.6), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <T size={36} weight={500} color="#d1d1d6">البنگ يقفز وقت التحميل بالبيت</T>
        <T size={36} weight={700} color={HOT}>وهذا سبب اللاگ!</T>
      </div></div>
    </>
  );
}
function Govs({ t }: { t: number }) {
  const g = (y: number, label: string, name: string, v: number, col: string, t0: number, on: number) => (
    <div style={{ ...at(5, 540, y) }}><div style={{ ...show(t, t0), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
      <T size={34} color={SOFT}>{label}</T>
      <Pill w={760} h={150} on={on} onColor={col} style={{ justifyContent: 'space-between', padding: '0 56px', boxSizing: 'border-box' }}>
        <T size={56} weight={700} color={on > 0.5 ? WHITE : INK}>{name}</T>
        <T size={84} weight={700} color={on > 0.5 ? WHITE : col}><Ms v={v} /></T>
      </Pill>
    </div></div>
  );
  return <><Title i={5} y={560} st={show(t, 15.3)} text="أسرع وأبطأ بنگ بالمحافظات" size={52} />{g(820, 'أقل بنك بين المحافظات', 'السليمانية', D.ping.alsulaimaniyah, GREEN, 15.35, smoothStep(seg(t, 15.9, 0.25)))}{g(1120, 'أعلى بنك بين المحافظات', 'الأنبار', D.ping.alanbar, '#9a7408', 15.5, 0)}</>;
}
function FourG({ t }: { t: number }) {
  const S = D.saq, k1 = soft(seg(t, 18.6, 1.2)), k2 = soft(seg(t, 18.8, 0.8));
  const n = Math.round(824 * soft(seg(t, 17.4, 1.0)));
  const up = soft(seg(t, 18.2, 0.7));
  const row = (y: number, label: string, v: number, k: number, col: string, tc: string, t0: number) => (
    <div style={{ ...at(6, 540, y) }}><div style={{ ...show(t, t0), display: 'flex', flexDirection: 'column', gap: 20, width: 880 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', direction: 'rtl' }}><T size={40} color={INK2}>{label}</T><T size={44} weight={700} color={tc}>{ARd(v * k)} ميغابت</T></div>
      <Track w={880} h={44} k={Math.min(1, v * k / 55)} color={col} />
    </div></div>
  );
  return (
    <>
      <Title i={6} y={960 - 300 * up} st={show(t, 17.35)} size={58} text="بـ ٨٢٤ منطقة.. الـ 4G يتفوق عالواي فاي!"
        shown={<>بـ {AR(n)} منطقة.. الـ&nbsp;<bdi dir="ltr">4G</bdi> يتفوق عالواي فاي!</>} />
      <div style={{ ...at(6, 540, 830) }}><div style={show(t, 18.4)}><T size={34} color={INK} style={{ opacity: 0.65 }}>الصقلاوية، الأنبار</T></div></div>
      {row(960, 'إنترنت البيت', S.f.d, k1, RED, RED_T, 18.5)}
      {row(1150, 'إنترنت الموبايل', S.m.d, k2, LEAF, GREEN, 18.65)}
      <div style={{ ...at(6, 540, 1350) }}><div style={show(t, 19.7)}><Pill w={680} h={96} on={smoothStep(seg(t, 20.0, 0.25))} onColor={WIN}><T size={40} weight={700} color={t > 20.1 ? WHITE : INK}>إنترنت الموبايل أسرع بـ ١٤ ضعف</T></Pill></div></div>
    </>
  );
}
const better = (a: number, b: number, dir: number) => a === b ? 0 : (a > b) === (dir > 0) ? 1 : 2;
function Compare({ t }: { t: number }) {
  const A = D.kar, B = D.man;
  const rows: [string, string, string, number, string][] = [['البيت، التنزيل', 'f', 'd', 1, 'ميغابت'], ['البيت، الرفع', 'f', 'u', 1, 'ميغابت'], ['البيت، البنك', 'f', 'l', -1, 'ms'], ['الموبايل، التنزيل', 'm', 'd', 1, 'ميغابت']];
  const card = (P: any, x: number, me: number, t0: number, from: number) => {
    const k = soft(seg(t, t0, 0.8));
    return (
      <div style={{ position: 'absolute', left: SX(7) + x + (1 - k) * from, top: 560, width: 440, height: 860, borderRadius: 44, background: PILL, opacity: clamp(k * 3),
        boxShadow: 'inset 0 1px 1px #FFFFFF, 0 8px 20px rgba(0,0,0,0.08), 0 30px 60px rgba(0,0,0,0.06)', padding: '44px 40px', boxSizing: 'border-box', direction: 'rtl', fontFamily: FONT }}>
        <T size={60} weight={700}>{P.n}</T>
        <T size={30} color={SOFT}>بغداد</T>
        {rows.map(([lab, m, key, dir, unit], i) => {
          const win = better(A[m][key], B[m][key], dir) === me, lit = smoothStep(seg(t, 23.0 + i * 0.3, 0.25));
          return (
            <div key={i} style={{ marginTop: i ? 22 : 44 }}>
              <T size={28} color={SOFT}>{lab}</T>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 8 }}>
                <Pill w={150} h={78} on={win ? lit : 0} onColor={WIN}><T size={46} weight={700} color={win && lit > 0.5 ? WHITE : INK}>{unit === 'ms' ? AR(P[m][key]) : AR(P[m][key])}</T></Pill>
                <T size={26} color={SOFT} style={{ direction: unit === 'ms' ? 'ltr' : 'rtl' }}>{unit}</T>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  return (
    <>
      <Title i={7} y={440} st={show(t, 22.05)} size={58} text="قبل لا تسكن أو تأجر.. قارن منطقتين" />
      {card(A, 570, 1, 22.1, 700)}
      {card(B, 70, 2, 22.22, -700)}
    </>
  );
}
const GZ = 2, GX = 140, GY = 960 - 403;
const POLE = [GX + 267.5 * GZ, GY + 93.5 * GZ];
function MapStation({ t }: { t: number }) {
  const M = D.map, zp = seg(t, 29.3, 0.45), clear = 1 - soft(seg(t, 29.0, 0.3)), focus = soft(seg(t, 27.4, 0.45)) * clear;
  const z = 1 + 34 * expoIn(zp), q = [lerp(POLE[0], 540, smoothStep(zp)), lerp(POLE[1], 960, smoothStep(zp))];
  const d = (g: any) => g.polys.map((p: number[][]) => 'M' + p.map(([x, y]) => `${(GX + x * GZ).toFixed(1)} ${(GY + y * GZ).toFixed(1)}`).join('L') + 'Z').join('');
  const diy = M.shapes.find((g: any) => g.id === 'diyala');
  const ax = GX + diy.x * GZ, ay = GY + diy.y * GZ;
  return (
    <>
      <Title i={8} y={960} st={show(t, 26.05, 27.0)} size={60} text="خارطة بيانات أمام وزارة الاتصالات" sub="وين الخلل، ويا محافظة تحتاج أولوية بالخدمة؟" subSize={36} />
      <div style={{ position: 'absolute', left: SX(8), top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${q[0]}px, ${q[1]}px) scale(${z}) translate(${-POLE[0]}px, ${-POLE[1]}px)` }}>
        <svg width={1080} height={1920} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
          {M.shapes.map((g: any) => {
            const e = soft(seg(t, 27.1 + (g.y / M.h) * 0.5, 0.5)), sul = g.id === 'alsulaimaniyah' && zp > 0;
            let a = e * (g.id === 'diyala' ? 1 : lerp(1, 0.3, sul ? focus * (1 - smoothStep(seg(zp, 0, 0.35))) : focus));
            const c = sul ? mix(bandFill(g.d), FIELD, smoothStep(seg(zp, 0.15, 0.6))) : bandFill(g.d);
            return <path key={g.id} d={d(g)} fill={c} fillOpacity={a} stroke={zp > 0 ? 'none' : LIGHT} strokeWidth={2.2} strokeOpacity={e} strokeLinejoin="round" />;
          })}
          {focus > 0 ? <path d={d(diy)} fill="none" stroke={INK} strokeWidth={5} strokeOpacity={focus} strokeLinejoin="round" /> : null}
          {focus > 0 ? <line x1={360} y1={1230} x2={lerp(360, ax, focus)} y2={lerp(1230, ay, focus)} stroke={INK} strokeWidth={3} strokeOpacity={focus} /> : null}
        </svg>
      </div>
      <div style={{ position: 'absolute', left: SX(8) + 120, top: 1180, opacity: focus }}>
        <Pill w={360} h={104} on={1} onColor="#a8561a"><T size={52} weight={700} color={WHITE}>ديالى {AR(D.diy)}٪</T></Pill>
        <T size={30} color={INK2} style={{ marginTop: 18, textAlign: 'center', width: 360 }}>من مناطقها تعاني من بطء الإنترنت</T>
      </div>
      <div style={{ position: 'absolute', left: SX(8) + 150, top: 1480, opacity: soft(seg(t, 27.6, 0.5)) * clear, display: 'flex', flexDirection: 'column', gap: 10, direction: 'rtl' }}>
        {[['سريع جدا', GREEN], ['جيد', LEAF], ['متوسط', AMBER], ['مقبول', ORANGE], ['بطيء', RED]].map(([w, c]) => (
          <div key={w} style={{ display: 'flex', alignItems: 'center', gap: 12 }}><div style={{ width: 30, height: 12, borderRadius: 6, background: c }} /><T size={26} color={INK2}>{w}</T></div>
        ))}
      </div>
    </>
  );
}
function Chart({ t }: { t: number }) {
  const yrs: number[] = D.years, BW = 80, GAPB = 26, X0 = 958, BOT = 1500, HMAX = 560;
  const L = soft(seg(t, 31.4, 0.6));
  const tops = yrs.map((v, i) => [X0 - (i + 1) * BW - i * GAPB + BW / 2, BOT - HMAX * v / yrs[yrs.length - 1] - 30]);
  let tot = 0; tops.slice(1).forEach((p, i) => { tot += Math.hypot(p[0] - tops[i][0], p[1] - tops[i][1]); });
  return (
    <>
      <Title i={9} y={560} st={show(t, 29.9)} size={60} color={WHITE} text="قفزة العراق: من ١٧ إلى ٦٢ ميغابت" sub="تطور واضح من ٢٠١٩ إلى ٢٠٢٦.. والخطوة الجاية عدالة الخدمة بكل حي" subColor="rgba(255,255,255,0.8)" />
      {yrs.map((v, i) => {
        const e = soft(seg(t, 30.3 + 0.07 * i, 0.8)), h = HMAX * v / yrs[yrs.length - 1] * e, x = X0 - (i + 1) * BW - i * GAPB;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: SX(9) + x, top: BOT - h, width: BW, height: h, borderRadius: 18, background: 'rgba(255,255,255,0.92)', boxShadow: 'inset 0 1px 1px #fff, 0 10px 24px rgba(0,0,0,0.12)' }} />
            <T size={28} color="rgba(255,255,255,0.8)" style={{ position: 'absolute', left: SX(9) + x + BW / 2, top: BOT + 20, transform: 'translateX(-50%)', opacity: e }}>{AR(2019 + i)}</T>
          </React.Fragment>
        );
      })}
      <svg width={1080} height={1920} style={{ position: 'absolute', left: SX(9), top: 0 }}>
        <path d={'M' + tops.map(p => p.join(' ')).join('L')} fill="none" stroke={WHITE} strokeWidth={6} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${tot * L} ${tot + 10}`} />
        {L >= 1 ? <circle cx={tops[tops.length - 1][0]} cy={tops[tops.length - 1][1]} r={12} fill={WHITE} /> : null}
      </svg>
    </>
  );
}
function End({ t }: { t: number }) {
  const rise = soft(seg(t, 33.45, 0.9)), cy = lerp(2900, 1640, rise) - 40 * seg(t, 34.3, 2.7);
  const b = press(t, 35.6), img = t < 35.9 ? 'home' : 'test-' + String(Math.min(13, Math.floor((t - 35.9) / 0.1))).padStart(2, '0');
  const P = { cx: 540, cy, w: 760 }, go = onScreen(P, ...[MARKS.go[0] + MARKS.go[2] / 2, MARKS.go[1] + MARKS.go[3] / 2] as [number, number]);
  return (
    <>
      <Title i={10} y={370} st={show(t, 33.4)} color="#f5f5f7" text="منصة سرعة الإنترنت في العراق" />
      <div style={{ ...at(10, 540, 465) }}><div style={show(t, 33.6)}><T size={fit('افحص خطك وقارن منطقتك مجانا الآن — الرابط بالبايو', 36, 500, 940)} color="#c7c7cc">افحص خطك وقارن منطقتك مجانا الآن — الرابط بالبايو</T></div></div>
      <div style={{ ...at(10, 540, 535) }}><div style={show(t, 33.8)}><T size={30} color="rgba(255,255,255,0.8)">تطوير وتصميم <bdi dir="ltr" style={{ color: '#ff9f0a' }}>@allawi.psd</bdi></T></div></div>
      <div style={{ position: 'absolute', left: SX(10), top: 0 }}><Phone cx={P.cx} cy={P.cy} w={P.w} img={img} dark btn={b} /></div>
      <Pointer t={t} target={[SX(10) + go[0] + 60, go[1] + 14]} tin={34.8} tp={35.6} from={[SX(10) + 1150, 2000]} to={[SX(10) + 1200, 1500]} />
    </>
  );
}

// ---------- the frame ----------
const WIN_AT = (t: number, a: number, b: number) => t > a - 0.6 && t < b + 0.6;
const Scene: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const [x, y, s] = camAt(t);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(540px, 960px) scale(${s}) translate(${-x}px, ${-y}px)` }}>
        {WIN_AT(t, 0, 2.1) && <Hook t={t} />}
        {WIN_AT(t, 1.7, 3.3) && <Bars t={t} />}
        {WIN_AT(t, 2.9, 8.0) && <LineTest t={t} />}
        {WIN_AT(t, 7.6, 11.0) && <Share t={t} />}
        {WIN_AT(t, 10.6, 15.3) && <Ping t={t} />}
        {WIN_AT(t, 14.9, 17.3) && <Govs t={t} />}
        {WIN_AT(t, 16.9, 22.0) && <FourG t={t} />}
        {WIN_AT(t, 21.6, 26.0) && <Compare t={t} />}
        {t >= 25.4 && t < 29.75 && <MapStation t={t} />}
        {t >= 29.75 && t < 33.4 && <Chart t={t} />}
        {t >= 32.7 && <End t={t} />}
      </div>
      {t >= 29.4 && t < 29.75 ? <AbsoluteFill style={{ background: FIELD, opacity: smoothStep(seg(t, 29.5, 0.25)) }} /> : null}
    </AbsoluteFill>
  );
};
// film grain, very light, changed twelve times a second
const GRAIN = (() => {
  if (typeof document === 'undefined') return [] as string[];
  return Array.from({ length: 4 }, (_, k) => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!, im = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const r = Math.sin((i * 7.31 + k * 1013) * 127.1 + 311.7) * 43758.5453, v = 128 + (r - Math.floor(r) - 0.5) * 80; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); return c.toDataURL();
  });
})();

export const Reel: React.FC = () => {
  const frame = useCurrentFrame(), t = frame / FPS;
  const [handle] = useState(() => delayRender('fonts and marks'));
  useEffect(() => {
    const faces = [['Rubik', 'Rubik-Arabic-500', '500', 'U+0600-06FF, U+200C-200F, U+FE70-FEFF'], ['Rubik', 'Rubik-Arabic-700', '700', 'U+0600-06FF, U+200C-200F, U+FE70-FEFF'],
      ['RubikL', 'Rubik-Latin-400', '400 500', 'U+0000-00FF'], ['RubikL', 'Rubik-Latin-700', '600 800', 'U+0000-00FF']];
    Promise.all([
      ...faces.map(([f, file, w, r]) => new FontFace(f, `url(${staticFile(`fonts/${file}.woff2`)})`, { weight: w, unicodeRange: r }).load().then(ff => (document.fonts as any).add(ff))),
      fetch(staticFile('site/marks.json')).then(r => r.json()).then(m => { MARKS = m; }),
    ]).then(() => continueRender(handle));
  }, [handle]);
  const whip = WHIPS.some(([a, b]) => t >= a - 0.05 && t <= b + 0.05);
  return (
    <AbsoluteFill style={{ background: room(t) }}>
      {whip ? <CameraMotionBlur shutterAngle={180} samples={48}><Scene /></CameraMotionBlur> : <Scene />}
      {GRAIN.length ? <AbsoluteFill style={{ backgroundImage: `url(${GRAIN[Math.floor(t * 12) % 4]})`, mixBlendMode: 'overlay', opacity: 0.1 }} /> : null}
    </AbsoluteFill>
  );
};
