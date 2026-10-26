// IraqSpeed, a 21 s film for the site in two shapes (1920 x 1080 and 1080 x 1920). One question on a clean wall,
// the map of Iraq drawn out of the dark in the colours the site gives each governorate, then the real site as a
// phone and floating cards on a soft bloom: the governorates, the search, Karrada's result, its streets, then the
// name over the dark, and three phones rising under the address. Everything is the live site, captured.
import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig, Easing, delayRender, continueRender } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import iraq from './iraq.json';

export const FPS = 30, DUR = 21;
const FONT = 'Rubik, RubikL';
const INK = '#14202b', WHITE = '#ffffff';

// ---------- time ----------
const soft = Easing.bezier(0.22, 1, 0.36, 1);       // landings
const inout = Easing.bezier(0.65, 0, 0.35, 1);      // moves from one place to another
const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const seg = (t: number, t0: number, d: number) => clamp((t - t0) / d);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const hex = (c: string) => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
// values held between keys and crossing over a short time at each key: [time, value, crossing time]
function keyed<T>(t: number, keys: [number, T, number?][], blend: (a: T, b: T, k: number) => T | string): T | string {
  let v: T | string = keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, b, d = 0.5] = keys[i];
    if (t >= t0) v = keys[i][1];
    if (t >= t0 && t < t0 + d) return blend(keys[i - 1][1], b, inout(seg(t, t0, d)));
    if (t < t0) break;
  }
  return v;
}
const colorAt = (t: number, keys: [number, string, number?][]) => keyed(t, keys, mix) as string;
const numAt = (t: number, keys: [number, number, number?][]) => keyed(t, keys, (a, b, k) => lerp(a, b, k)) as number;
// a rectangle moving through keys: [time, cx, cy, width]
type R = [number, number, number, number];
function rectAt(t: number, keys: R[], ease = inout) {
  if (t <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) if (t < keys[i + 1][0]) {
    const k = ease(seg(t, keys[i][0], keys[i + 1][0] - keys[i][0]));
    return [1, 2, 3].map(j => lerp(keys[i][j], keys[i + 1][j], k));
  }
  return keys[keys.length - 1].slice(1);
}

// ---------- the two layouts ----------
const LAYOUT = {
  wide: {
    hook: { x: 960, y: 540, size: 74 },
    map2: [[3.0, 760, 545, 760], [5.4, 760, 545, 760], [6.15, 470, 562, 470]] as R[],
    title2: { x: 1390, y: 545, size: 60 },
    gov: { cx: 470, cy: 560, w: 500 },
    phone: [[6.2, 960, 1500, 380], [7.0, 960, 560, 380], [14.9, 960, 560, 380], [15.8, 1240, 560, 400], [17.9, 1240, 560, 400], [18.7, 960, 925, 400]] as R[],
    iraqCard: { cx: 1450, cy: 420, w: 500 },
    search: { cx: 1450, top: 700, w: 540 },
    karrada: { cx: 1430, cy: 335, w: 600 },
    kmap: { cx: 1430, cy: 795, w: 600 },
    compare: { cx: 470, cy: 560, w: 520 },
    cam: [[0, 960, 540, 1], [10.45, 960, 540, 1], [11.3, 1430, 345, 1.32], [11.9, 1430, 350, 1.34], [12.6, 1430, 790, 1.3], [13.15, 1430, 795, 1.32],
      [13.85, 520, 560, 1.28], [14.35, 520, 560, 1.3], [15.0, 960, 540, 1]] as R[],
    pointer: { from: [2050, 1180], to: [2050, 1250] },
    title5: { x: 600, y: 470, size: 64 }, sub5: { x: 600, y: 560, size: 34 },
    outline5: { cx: 960, cy: 540, h: 1000 },
    side: { dx: 470, dy: 150, w: 330 },
    title6: { x: 960, y: 200, size: 66 }, url6: { x: 960, y: 292, size: 42 },
  },
  tall: {
    hook: { x: 540, y: 940, size: 74 },
    map2: [[3.0, 540, 860, 900], [5.4, 540, 860, 900], [6.15, 540, 470, 618]] as R[],
    title2: { x: 540, y: 1480, size: 66 },
    gov: { cx: 540, cy: 470, w: 620 },
    phone: [[6.2, 540, 2600, 440], [7.0, 540, 1370, 440], [9.95, 540, 1370, 440], [10.7, 540, 3400, 440], [14.9, 540, 3400, 520], [15.8, 540, 1230, 520], [17.9, 540, 1230, 520], [18.7, 540, 1360, 480]] as R[],
    iraqCard: { cx: 540, cy: 470, w: 760 },
    search: { cx: 540, top: 1040, w: 860 },
    karrada: { cx: 540, cy: 520, w: 900 },
    kmap: { cx: 540, cy: 1235, w: 900 },
    compare: { cx: 540, cy: 1830, w: 860 },
    cam: [[0, 540, 960, 1], [10.45, 540, 960, 1], [11.3, 540, 640, 1.12], [11.9, 540, 650, 1.13], [12.6, 540, 1240, 1.1], [13.15, 540, 1245, 1.11],
      [13.85, 540, 1640, 1.04], [14.35, 540, 1650, 1.05], [15.0, 540, 960, 1]] as R[],
    pointer: { from: [1180, 2050], to: [1200, 2150] },
    title5: { x: 540, y: 330, size: 72 }, sub5: { x: 540, y: 432, size: 38 },
    outline5: { cx: 540, cy: 1130, h: 1450 },
    side: { dx: 330, dy: 150, w: 360 },
    title6: { x: 540, y: 390, size: 70 }, url6: { x: 540, y: 492, size: 46 },
  },
};

// ---------- the room: a clean wall, the dark, a soft bloom whose colour follows the story, and the dark again.
// Each new room opens as a circle from the thing the eye is on, so no frame passes through a muddy middle.
const WALL = '#F3F2F6', NIGHT = '#0C0D10', PAPER = '#FBF7FC';
const Blob: React.FC<{ x: number; y: number; c: string; r: number; o?: number }> = ({ x, y, c, r, o = 1 }) => (
  <div style={{ position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', background: c, filter: `blur(${r * 0.28}px)`, opacity: o }} />
);
const Layer: React.FC<{ open: number; at: [number, number]; W: number; H: number; children: React.ReactNode }> = ({ open, at, W, H, children }) => {
  if (open <= 0) return null;
  const r = open >= 1 ? 99999 : inout(open) * Math.hypot(W, H) * 1.05, m = `radial-gradient(circle at ${at[0]}px ${at[1]}px, #000 ${r}px, transparent ${r + 3}px)`;
  return <AbsoluteFill style={{ overflow: 'hidden', WebkitMaskImage: m, maskImage: m }}>{children}</AbsoluteFill>;
};
const Room: React.FC<{ t: number; W: number; H: number; L: any }> = ({ t, W, H, L }) => {
  const R = Math.max(W, H) * 0.62, dx = 70 * Math.sin(t * 0.35), dy = 50 * Math.sin(t * 0.27);
  const mapC = [L.map2[0][1], L.map2[0][2]] as [number, number], ph = L.phone.find((k: R) => k[0] >= 15.8) as R;
  const bloomA = colorAt(t, [[0, '#F6B6E3'], [10.0, '#BFE5CC', 0.9]]), bloomB = colorAt(t, [[0, '#CDBFFF'], [10.0, '#E4F0C8', 0.9]]);
  return (
    <AbsoluteFill style={{ background: WALL }}>
      <Blob x={W * 0.36 + dx} y={H * 0.42 + dy} c="#E6DEF6" r={R} o={0.55} />
      <Blob x={W * 0.66 - dx} y={H * 0.62 - dy} c="#F1E6EF" r={R * 0.85} o={0.55} />
      <Layer open={seg(t, 2.6, 0.75) * (t < 6.3 ? 1 : 0)} at={[W / 2, H / 2]} W={W} H={H}>
        <AbsoluteFill style={{ background: NIGHT }}>
          <Blob x={W * 0.4 + dx} y={H * 0.45} c="#1B1F3C" r={R * 0.8} o={0.7} />
          <Blob x={W * 0.65} y={H * 0.6 + dy} c="#101326" r={R * 0.7} o={0.7} />
        </AbsoluteFill>
      </Layer>
      <Layer open={seg(t, 5.4, 0.8) * (t < 15.7 ? 1 : 0)} at={mapC} W={W} H={H}>
        <AbsoluteFill style={{ background: PAPER }}>
          <Blob x={W * 0.36 + dx} y={H * 0.42 + dy} c={bloomA} r={R} />
          <Blob x={W * 0.66 - dx} y={H * 0.62 - dy} c={bloomB} r={R * 0.85} />
        </AbsoluteFill>
      </Layer>
      <Layer open={seg(t, 14.95, 0.75)} at={[ph[1], ph[2]]} W={W} H={H}>
        <AbsoluteFill style={{ background: NIGHT }}>
          <Blob x={W * 0.38 + dx} y={H * 0.48} c="#15402F" r={R * 0.85} o={0.75} />
          <Blob x={W * 0.66} y={H * 0.56 + dy} c="#2A2450" r={R * 0.8} o={0.75} />
        </AbsoluteFill>
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- type: one line, coming out of a soft focus and leaving into it ----------
const Line: React.FC<{ t: number; t0: number; t1?: number; x: number; y: number; size: number; weight?: number; color: string; children: React.ReactNode; dir?: 'rtl' | 'ltr'; halo?: string }> =
  ({ t, t0, t1 = 99, x, y, size, weight = 700, color, children, dir = 'rtl', halo }) => {
  const k = soft(seg(t, t0, 0.9)), o = inout(seg(t, t1, 0.5));
  if (k <= 0 || o >= 1) return null;
  return (
    <div style={{ position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) translateY(${(1 - k) * 18}px) scale(${1 + 0.03 * o})`,
      fontFamily: FONT, fontSize: size, fontWeight: weight, color, direction: dir, whiteSpace: 'nowrap', lineHeight: 1.25,
      opacity: k * (1 - o), textShadow: halo ? `0 0 18px ${halo}, 0 0 40px ${halo}, 0 0 70px ${halo}` : undefined, filter: `blur(${(1 - k) * 14 + o * 12}px)` }}>{children}</div>
  );
};

// ---------- the map of Iraq: the governorates as the site draws them, in its speed colours ----------
const IraqMap: React.FC<{ cx: number; cy: number; h: number; t: number; trace: number; fill: number; stroke: string; glow?: number; fillAlpha?: number }> =
  ({ cx, cy, h, t, trace, fill, stroke, glow = 0, fillAlpha = 1 }) => {
  const w = h * iraq.w / iraq.h, sw = 1.4 * iraq.h / h * 1.6;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${iraq.w} ${iraq.h}`} style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2, overflow: 'visible' }}>
      {glow > 0 ? <g style={{ filter: `blur(${6 * iraq.h / h * 2}px)` }} opacity={glow}>
        {iraq.govs.map(g => <path key={g.id} d={g.d} fill="none" stroke={stroke} strokeWidth={sw * 3} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trace} />)}
      </g> : null}
      {iraq.govs.map(g => {
        const e = soft(seg(fill, g.y / iraq.h * 0.55, 0.45));
        return <path key={g.id} d={g.d} fill={g.fill} fillOpacity={e * fillAlpha} stroke={stroke} strokeWidth={sw} strokeLinejoin="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trace} />;
      })}
    </svg>
  );
};

// ---------- the real site on a phone, flat on to us ----------
const Phone: React.FC<{ cx: number; cy: number; w: number; img: string; img2?: string; swap?: number; dark?: boolean; sweep?: number; dim?: number }> =
  ({ cx, cy, w, img, img2, swap = 0, dark, sweep = -1, dim = 0 }) => {
  const h = w * 1344 / 646, bz = w * 22 / 646, sw = w - 2 * bz, sh = sw * 844 / 390, r = w * 86 / 646;
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, #8e8e93, #48484a 8%, #48484a 92%, #7c7c80)',
      boxShadow: dark ? '0 40px 90px rgba(0,0,0,0.55)' : '0 40px 80px rgba(60,30,90,0.16), 0 8px 18px rgba(60,30,90,0.10)' }}>
      <div style={{ position: 'absolute', inset: w * 6 / 646, borderRadius: r - w * 6 / 646, background: '#050505' }} />
      <div style={{ position: 'absolute', left: bz, top: bz, width: sw, height: sh, borderRadius: w * 62 / 646, overflow: 'hidden', background: WHITE }}>
        <Img src={staticFile(`ui/${img}.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
        {img2 && swap > 0 ? <Img src={staticFile(`ui/${img2}.png`)} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: swap }} /> : null}
        {sweep >= 0 && sweep <= 1 ? <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(115deg, transparent ${lerp(-40, 110, sweep)}%, rgba(255,255,255,0.55) ${lerp(-30, 120, sweep)}%, transparent ${lerp(-20, 130, sweep)}%)` }} /> : null}
        {dim > 0 ? <div style={{ position: 'absolute', inset: 0, background: '#0C0D10', opacity: dim }} /> : null}
      </div>
    </div>
  );
};

// ---------- a part of the site lifted off it as a card ----------
const NAT: Record<string, [number, number]> = { 'e-govmap': [1098, 1104], 'e-iraq': [1098, 699], 'e-search-empty': [1086, 192], 'e-search-hits': [1086, 636],
  'e-karrada': [1098, 771], 'e-karrada-map': [1062, 708], 'e-compare': [1098, 609] };
const Card: React.FC<{ src: string; cx: number; cy: number; w: number; k: number; o?: number; from?: [number, number]; to?: [number, number]; h?: number; children?: React.ReactNode }> =
  ({ src, cx, cy, w, k, o = 0, from = [0, 60], to = [0, -40], h, children }) => {
  if (k <= 0 || o >= 1) return null;
  const [iw, ih] = NAT[src], hh = h ?? w * ih / iw;
  const dx = (1 - k) * from[0] + o * to[0], dy = (1 - k) * from[1] + o * to[1], s = 0.94 + 0.06 * k - 0.04 * o;
  return (
    <div style={{ position: 'absolute', left: cx - w / 2, top: cy - hh / 2, width: w, height: hh, borderRadius: w * 0.05, overflow: 'hidden', background: WHITE,
      transform: `translate(${dx}px, ${dy}px) scale(${s})`, opacity: clamp(k * 2.5) * (1 - o),
      boxShadow: '0 34px 70px rgba(70,30,100,0.16), 0 8px 18px rgba(70,30,100,0.08)' }}>
      <Img src={staticFile(`ui/${src}.png`)} style={{ position: 'absolute', left: 0, top: 0, width: w, height: w * ih / iw }} />
      {children}
    </div>
  );
};

// ---------- the pointer: a black arrow with a white edge, travelling on curves and pressing ----------
const ARROW = 'M0 0 L0 23.2 L5.5 17.9 L9.2 26.6 L13.1 25 L9.5 16.5 L16.9 16.5 Z';
function pointerAt(t: number, path: [number, number, number][], presses: number[]) {
  if (t < path[0][0] || t > path[path.length - 1][0]) return null;
  let i = 0; while (i < path.length - 2 && t >= path[i + 1][0]) i++;
  const [t0, x0, y0] = path[i], [t1, x1, y1] = path[i + 1], k = soft(seg(t, t0, t1 - t0));
  // a gentle arc: the middle of each leg bows away from the straight line
  const bow = Math.sin(Math.PI * k) * Math.min(120, Math.hypot(x1 - x0, y1 - y0) * 0.18);
  const nx = -(y1 - y0), ny = x1 - x0, nl = Math.hypot(nx, ny) || 1;
  const p = presses.find(p0 => t >= p0 && t < p0 + 0.28);
  return { x: lerp(x0, x1, k) + nx / nl * bow, y: lerp(y0, y1, k) + ny / nl * bow, s: p != null ? 1 - 0.14 * Math.sin(Math.PI * seg(t, p, 0.28)) : 1 };
}
const Pointer: React.FC<{ p: { x: number; y: number; s: number } | null; scale: number }> = ({ p, scale }) => !p ? null : (
  <svg width={50 * scale} height={74 * scale} viewBox="-2 -2 21 31" style={{ position: 'absolute', left: p.x, top: p.y, transformOrigin: '0 0', transform: `scale(${p.s})`, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))', overflow: 'visible' }}>
    <path d={ARROW} fill="#000" stroke="#fff" strokeWidth={1.5} strokeLinejoin="round" paintOrder="stroke" />
  </svg>
);
// a pressed card dips and springs back, 1, 0.96, 1.01, 1
const pressScale = (t: number, tp: number) => {
  const x = t - tp; if (x < 0) return 1;
  return x < 0.08 ? lerp(1, 0.96, soft(x / 0.08)) : x < 0.2 ? lerp(0.96, 1.01, soft((x - 0.08) / 0.12)) : lerp(1.01, 1, soft(clamp((x - 0.2) / 0.16)));
};

// ---------- the film ----------
const Film: React.FC<{ t: number; W: number; H: number; wide: boolean }> = ({ t, W, H, wide }) => {
  const L = wide ? LAYOUT.wide : LAYOUT.tall;
  const [fx, fy, cs] = rectAt(t, L.cam);
  // shot 2: the map, drawn out of the dark, then flown into the governorates card
  const [mx, my, mh] = rectAt(t, L.map2);
  const mapOn = t >= 3.0 && t < 6.35;
  const trace = soft(seg(t, 3.1, 1.5)), fillK = seg(t, 4.0, 1.3), mapFade = 1 - seg(t, 5.95, 0.35);
  const toLight = seg(t, 5.45, 0.75);
  // shot 3: the governorates card, the phone, the Iraq card, the search
  const govK = seg(t, 5.85, 0.35), govOut = wide ? soft(seg(t, 10.0, 0.6)) : soft(seg(t, 7.55, 0.5));
  const iraqK = wide ? soft(seg(t, 7.1, 0.8)) : soft(seg(t, 7.75, 0.8)), iraqOut = soft(seg(t, 10.0, 0.6));
  const S = L.search, sw = S.w, sE = sw * 192 / 1086, sH = sw * 636 / 1086;
  const open = soft(seg(t, 9.0, 0.45)), sK = soft(seg(t, 8.2, 0.7)), sOut = soft(seg(t, 10.05, 0.4));
  const sh = lerp(sE, sH, open), scy = S.top + sh / 2;
  const P1: [number, number] = [S.cx + sw * 0.18, S.top + sE * 0.55], P2: [number, number] = [S.cx + sw * 0.05, S.top + sH * 0.5];
  const ptr = pointerAt(t, [[8.4, L.pointer.from[0], L.pointer.from[1]], [8.85, P1[0], P1[1]], [9.35, P1[0], P1[1]], [9.7, P2[0], P2[1]], [10.05, P2[0], P2[1]], [10.7, L.pointer.to[0], L.pointer.to[1]]], [8.9, 9.75]);
  // shot 4: Karrada's result grows out of the row that was pressed, its streets, the comparison
  const K = L.karrada, kK = soft(seg(t, 10.0, 0.75)), kOut = soft(seg(t, 14.95, 0.55));
  const kStart: R = [10.0, S.cx, S.top + sH * 0.5, sw], kEnd: R = [10.75, K.cx, K.cy, K.w];
  const [kx, ky, kw] = rectAt(t, [kStart, kEnd]);
  const mapK = soft(seg(t, 10.9, 0.8)), cmpK = soft(seg(t, wide ? 12.9 : 12.5, 0.8));
  // the phone throughout, and its screen
  const [px, py, pw] = rectAt(t, L.phone);
  const phoneOn = t >= 6.2 && t < 15.0;   // after 15 s the same phone is drawn over the dark, outside the camera
  const swapK = seg(t, 10.0, 0.4);
  const dark5 = seg(t, 14.95, 0.6);
  // shot 5 and 6
  const outlineK = soft(seg(t, 15.4, 1.6)) * (1 - seg(t, 20.4, 0.6));
  const sideK = soft(seg(t, 18.35, 0.9));
  const endFade = seg(t, 20.55, 0.45);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, transformOrigin: '0 0', transform: `translate(${W / 2}px, ${H / 2}px) scale(${cs}) translate(${-fx}px, ${-fy}px)` }}>
        {/* 1. the question */}
        <Line t={t} t0={0.3} t1={2.2} x={L.hook.x} y={L.hook.y} size={L.hook.size} color={INK}>تعرف سرعة الإنترنت بمنطقتك؟</Line>
        {/* 2. the map out of the dark */}
        {mapOn ? <div style={{ position: 'absolute', inset: 0, opacity: mapFade }}>
          <IraqMap cx={mx} cy={my} h={mh} t={t} trace={trace} fill={fillK} stroke={mix('#ffffff', '#ffffff', 0)} glow={0.55 * (1 - toLight)} fillAlpha={0.92} />
        </div> : null}
        <Line t={t} t0={4.35} t1={5.25} x={L.title2.x} y={L.title2.y} size={L.title2.size} color="#F4F3F7">سرعة الإنترنت في العراق</Line>
        {/* 3. the site, lifted off as cards */}
        <Card src="e-govmap" cx={L.gov.cx} cy={L.gov.cy} w={L.gov.w} k={govK} o={govOut} from={[0, 0]} to={wide ? [-120, 0] : [-160, 0]} />
        {phoneOn ? <Phone cx={px} cy={py} w={pw} img="m-home" img2="m-karrada" swap={swapK} dark={dark5 > 0.5} sweep={seg(t, 16.0, 1.3)} dim={0} /> : null}
        <Card src="e-iraq" cx={L.iraqCard.cx} cy={L.iraqCard.cy} w={L.iraqCard.w} k={iraqK} o={iraqOut} from={wide ? [0, 60] : [160, 0]} to={[0, -60]} />
        {t < 10.6 ? <div style={{ position: 'absolute', left: 0, top: 0, transform: `scale(1)` }}>
          <Card src="e-search-empty" cx={S.cx} cy={scy} w={sw} h={sh} k={sK} o={sOut} from={[0, 70]} to={[0, 0]}>
            <Img src={staticFile('ui/e-search-hits.png')} style={{ position: 'absolute', left: 0, top: 0, width: sw, height: sH, opacity: smoothOpen(open) }} />
          </Card>
        </div> : null}
        {/* 4. Karrada, its streets, the comparison */}
        <Card src="e-karrada" cx={kx} cy={ky} w={kw} k={kK} o={kOut} from={[0, 0]} to={[0, -80]} />
        <Card src="e-karrada-map" cx={L.kmap.cx} cy={L.kmap.cy} w={L.kmap.w} k={mapK} o={kOut} from={wide ? [0, 90] : [0, 90]} to={[0, -80]} />
        <Card src="e-compare" cx={L.compare.cx} cy={L.compare.cy} w={L.compare.w} k={cmpK} o={kOut} from={wide ? [-90, 0] : [0, 90]} to={[0, -80]} />
        <Pointer p={ptr} scale={wide ? 1 : 1.3} />
      </div>
      {/* 5. the name over the dark, the map of Iraq behind the phone */}
      {outlineK > 0 ? <div style={{ position: 'absolute', inset: 0, opacity: outlineK * 0.85 }}>
        <IraqMap cx={L.outline5.cx} cy={L.outline5.cy} h={L.outline5.h} t={t} trace={soft(seg(t, 15.3, 2.2))} fill={0} stroke="#D9D2FF" glow={1} />
      </div> : null}
      {/* 6. three phones rising under the address */}
      {sideK > 0 ? <>
        <Phone cx={W / 2 + L.side.dx} cy={lerp(H + 400, L.phone[L.phone.length - 1][2] + L.side.dy, sideK)} w={L.side.w} img="m-govs" dark dim={0.35} />
        <Phone cx={W / 2 - L.side.dx} cy={lerp(H + 400, L.phone[L.phone.length - 1][2] + L.side.dy, sideK)} w={L.side.w} img="m-home" dark dim={0.35} />
      </> : null}
      {t >= 15.0 ? <Phone cx={px} cy={py} w={pw} img="m-karrada" dark sweep={seg(t, 16.0, 1.3)} /> : null}
      <Line t={t} t0={15.55} t1={17.75} x={L.title5.x} y={L.title5.y} size={L.title5.size} color="#F4F3F7" halo={NIGHT}>سرعة الإنترنت في العراق</Line>
      <Line t={t} t0={15.85} t1={17.75} x={L.sub5.x} y={L.sub5.y} size={L.sub5.size} weight={500} color="#A9A6B8" halo={NIGHT}>بكل محافظة ومدينة وحي</Line>
      <Line t={t} t0={18.3} x={L.title6.x} y={L.title6.y} size={L.title6.size} color="#F4F3F7">اكتشف سرعة الإنترنت في العراق</Line>
      <Line t={t} t0={18.6} x={L.url6.x} y={L.url6.y} size={L.url6.size} weight={500} color="#CFC6FF" dir="ltr">iraqspeed.vercel.app</Line>
      {endFade > 0 ? <AbsoluteFill style={{ background: '#0C0D10', opacity: endFade }} /> : null}
    </AbsoluteFill>
  );
};
const smoothOpen = (x: number) => clamp(x * 3);

// film grain, very light, changed twelve times a second
const GRAIN = (() => {
  if (typeof document === 'undefined') return [] as string[];
  return Array.from({ length: 4 }, (_, k) => {
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d')!, im = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) { const r = Math.sin((i * 7.31 + k * 1013) * 127.1 + 311.7) * 43758.5453, v = 128 + (r - Math.floor(r) - 0.5) * 70; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    g.putImageData(im, 0, 0); return c.toDataURL();
  });
})();
// fast moves get a real shutter blur
const BLUR_AT: [number, number][] = [[5.4, 6.3], [9.95, 10.8], [14.9, 15.9], [18.3, 19.3]];

export const Ad: React.FC = () => {
  const frame = useCurrentFrame(), t = frame / FPS, { width: W, height: H } = useVideoConfig(), wide = W > H;
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    const faces = [['Rubik', 'Rubik-Arabic-500', '500', 'U+0600-06FF, U+200C-200F, U+FE70-FEFF'], ['Rubik', 'Rubik-Arabic-700', '700', 'U+0600-06FF, U+200C-200F, U+FE70-FEFF'],
      ['RubikL', 'Rubik-Latin-400', '400 500', 'U+0000-00FF'], ['RubikL', 'Rubik-Latin-700', '600 800', 'U+0000-00FF']];
    Promise.all(faces.map(([f, file, w, r]) => new FontFace(f, `url(${staticFile(`fonts/${file}.woff2`)})`, { weight: w, unicodeRange: r }).load().then(ff => (document.fonts as any).add(ff))))
      .then(() => continueRender(handle));
  }, [handle]);
  const blur = BLUR_AT.some(([a, b]) => t >= a && t <= b);
  const Scene = () => { const f = useCurrentFrame(); return <Film t={f / FPS} W={W} H={H} wide={wide} />; };
  return (
    <AbsoluteFill>
      <Room t={t} W={W} H={H} L={wide ? LAYOUT.wide : LAYOUT.tall} />
      {blur ? <CameraMotionBlur shutterAngle={180} samples={16}><Scene /></CameraMotionBlur> : <Film t={t} W={W} H={H} wide={wide} />}
      {GRAIN.length ? <AbsoluteFill style={{ backgroundImage: `url(${GRAIN[Math.floor(t * 12) % 4]})`, mixBlendMode: 'overlay', opacity: 0.08 }} /> : null}
    </AbsoluteFill>
  );
};
