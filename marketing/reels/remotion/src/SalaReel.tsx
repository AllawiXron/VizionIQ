import React from 'react';
import {AbsoluteFill, Easing, Img, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Fonts} from './Fonts';
import {clamp, prog, shake, sp, track} from './anim';
import {B_END, S, SalaAd} from './SalaAd';
import {Sound} from './Sound';

export const DURATION = 450;              // 15 s at 30 fps; cuts sit on a 120 BPM grid (15 frames a beat)
const BUILD0 = 66;                        // frame where the build starts
const WHIP = 316, CUT = 330;              // whip zoom into the canvas, then cut to the end card

// workspace geometry (1080x1920 screen, a Photoshop window)
const CV = {x: 80, y: 330, w: 640, h: 800};
const K = CV.w / 1080;
const PANEL = {x: 740, y: 330, w: 320};
const ROW0 = PANEL.y + 100, ROW_H = 62;
const LAYERS: [keyof typeof S, string, string][] = [['logo', 'Logo', 'logo'], ['txt', 'Headline & footer', 'txt'], ['card', 'App card', 'card'],
  ['food', 'Egg basket (photo)', 'food'], ['bg', 'Red + doodles', 'bg']];           // top first, as Photoshop lists them
const eye = (key: string) => ({x: PANEL.x + 26, y: ROW0 + LAYERS.findIndex((l) => l[0] === key) * ROW_H + ROW_H / 2});
const adToWs = (x: number, y: number) => ({x: CV.x + x * K, y: CV.y + y * K});
const BUTTON = adToWs(557, 661);

// build time: finished during the hook, rewinds fast, then builds forward in real time
const buildTime = (f: number) => {
  if (f < 36) return B_END;
  if (f < 50) return B_END * (1 - Easing.in(Easing.quad)(clamp((f - 36) / 14)));
  return Math.max(0, f - BUILD0);
};

const C = {bg: '#262626', panel: '#323232', head: '#2b2b2b', line: '#1c1c1c', text: '#d4d4d4', dim: '#8c8c8c', orange: '#e2541b', orange2: '#f07a2e'};

// ---------------- camera ----------------
const CAM = [
  [0, 1.5, 400, 730, 540, 820], [34, 1.56, 400, 730, 540, 820], [50, 1.18, 400, 730, 540, 850], [64, 1, 540, 960, 540, 960], [80, 1, 540, 960, 540, 960],
  [94, 1.07, 400, 730, 520, 870], [118, 1.07, 400, 730, 520, 870], [127, 1.42, 400, 860, 540, 900], [152, 1.44, 400, 860, 540, 900],
  [166, 1.3, 500, 722, 540, 860], [204, 1.34, 500, 722, 540, 860], [214, 1.4, 400, 450, 540, 760], [246, 1.44, 400, 450, 540, 760],
  [254, 1.42, 400, 500, 540, 790], [283, 1.3, 390, 690, 540, 900], [297, 1, 540, 960, 540, 960], [WHIP, 1, 540, 960, 540, 960],
];
const camera = (f: number) => {
  let [z, fx, fy, sx, sy] = track(f, CAM);
  if (f > WHIP) {                                          // whip zoom: accelerate into the canvas
    const t = Easing.in(Easing.cubic)(clamp((f - WHIP) / (CUT - WHIP)));
    z = 1 + 2.8 * t; fx = 540 + (400 - 540) * t; fy = 960 + (730 - 960) * t; sx = 540; sy = 960;
  }
  const [s1x, s1y] = shake(f, BUILD0 + S.food + 7, 10);    // the basket lands
  const [s2x, s2y] = shake(f, BUILD0 + S.stamp + 5, 12);   // «إلا هاي.» stamps down
  const hx = 3 * Math.sin(f / 17) + 2 * Math.sin(f / 29 + 1), hy = 2.5 * Math.sin(f / 23 + 2) + 1.5 * Math.sin(f / 13);   // handheld drift
  return {transform: `translate(${sx - fx * z + hx + s1x + s2x}px, ${sy - fy * z + hy + s1y + s2y}px) scale(${z}) rotate(${0.12 * Math.sin(f / 31)}deg)`, transformOrigin: '0 0'};
};

// ---------------- cursor ----------------
const CUR = [
  [0, 690, 1050], [36, 690, 1050], [50, 640, 1000], [68, 640, 1000], [79, eye('bg').x, eye('bg').y],
  [111, eye('bg').x, eye('bg').y], [124, eye('food').x, eye('food').y], [157, eye('food').x, eye('food').y], [169, eye('card').x, eye('card').y],
  [183, eye('card').x, eye('card').y], [195, BUTTON.x, BUTTON.y], [203, BUTTON.x, BUTTON.y], [214, eye('txt').x, eye('txt').y],
  [228, eye('txt').x, eye('txt').y], [241, 860, 905], [287, 860, 905], [299, eye('logo').x, eye('logo').y], [310, eye('logo').x, eye('logo').y], [322, 905, 1010],
];
const CLICKS = [BUILD0 + S.bg, BUILD0 + S.food, BUILD0 + S.card, BUILD0 + S.click, BUILD0 + S.txt, BUILD0 + S.logo];
const mouse = Easing.bezier(0.45, 0.05, 0.2, 1);
const cursorAt = (f: number) => {
  for (let i = 0; i < CUR.length - 1; i++) {
    const a = CUR[i], b = CUR[i + 1];
    if (f <= b[0]) {
      const t = mouse(clamp((f - a[0]) / (b[0] - a[0])));
      const dx = b[1] - a[1], dy = b[2] - a[2], bulge = 0.14 * Math.sin(Math.PI * t);   // hands move in arcs, not lines
      return {x: a[1] + dx * t - dy * bulge, y: a[2] + dy * t + dx * bulge};
    }
  }
  const l = CUR[CUR.length - 1];
  return {x: l[1], y: l[2]};
};

// ---------------- Photoshop window ----------------
const ToolIcon: React.FC<{d: string}> = ({d}) => (
  <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke={C.text} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const TOOLS = ['M5 3v16l4-4 3 6 2-1-3-6h6z', 'M4 4h16v16H4z', 'M6 18c-3-4 0-12 7-12 5 0 7 4 5 7-2 4-8 1-9 5', 'M6 2v16h16M2 6h16v16', 'M3 21l6-2 11-11-4-4L5 15z',
  'M7 21h10M9 17l-5-5 8-8 8 8-5 5z', 'M5 5h14M12 5v14M9 19h6', 'M12 3l3 9-3 9-3-9z', 'M8 11V5a2 2 0 0 1 4 0v5m0-1a2 2 0 0 1 4 0v3m0-1a2 2 0 0 1 4 0v4c0 4-3 7-7 7s-7-3-8-7l-1-4a2 2 0 0 1 4 0',
  'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5'];
const HISTORY: [number, string][] = [[-1, 'Open'], [S.bg, 'Fill'], [S.food, 'Place Embedded'], [S.card, 'Paste'], [S.click, 'Edit Smart Object'], [S.txt, 'Type Tool'],
  [S.arrow, 'Brush Tool'], [S.logo, 'Place Embedded']];

const Workspace: React.FC<{f: number; b: number}> = ({f, b}) => {
  const order = ['bg', 'food', 'card', 'txt', 'logo'] as const;
  let active = -1; order.forEach((k, i) => { if (b >= S[k]) active = i; });
  const hist = HISTORY.filter(([t]) => b >= t);
  const cur = cursorAt(f);
  const lastClick = CLICKS.filter((c) => c <= f).pop() ?? -99;
  const press = 1 - 0.18 * Math.sin(Math.PI * clamp((f - lastClick + 3) / 7));
  const ripple = clamp((f - lastClick) / 12);
  const curFade = 1 - prog(f, WHIP, WHIP + 6);
  const clickPos = cursorAt(lastClick);
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, background: C.bg, fontFamily: '"Readex Pro"', color: C.text, ...camera(f)}}>
      {/* menu + options bars */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 54, background: '#1f1f1f', display: 'flex', alignItems: 'center', gap: 26, padding: '0 26px', fontSize: 19, borderBottom: `1px solid ${C.line}`}}>
        {['File', 'Edit', 'Image', 'Layer', 'Type', 'Select', 'Filter', 'View', 'Window', 'Help'].map((m) => <span key={m}>{m}</span>)}
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 54, height: 58, background: C.head, borderBottom: `1px solid ${C.line}`, display: 'flex', alignItems: 'center', gap: 22, padding: '0 22px', fontSize: 16, color: C.dim}}>
        <ToolIcon d={TOOLS[0]} /><span>Auto-Select: Layer</span><span>Show Transform Controls</span>
      </div>
      {/* document tab */}
      <div style={{position: 'absolute', left: 70, top: 270, height: 44, padding: '0 18px', background: C.panel, borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 14, fontSize: 17, color: '#e8e8e8'}}>
        sala_ad.psd @ 59.3% (RGB/8) <span style={{color: C.dim}}>×</span>
      </div>
      {/* toolbar */}
      <div style={{position: 'absolute', left: 10, top: 330, width: 54, padding: '10px 0', background: C.panel, borderRadius: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14}}>
        {TOOLS.map((d, i) => <div key={i} style={{width: 40, height: 40, borderRadius: 8, display: 'grid', placeItems: 'center', background: i === 0 ? '#4a4a4a' : 'transparent'}}><ToolIcon d={d} /></div>)}
      </div>
      {/* canvas */}
      <div style={{position: 'absolute', left: CV.x, top: CV.y, width: CV.w, height: CV.h, overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        background: '#fff conic-gradient(#d9d9d9 25%, #fff 0 50%, #d9d9d9 0 75%, #fff 0) 0 0 / 24px 24px'}}>
        <div style={{transform: `scale(${K})`, transformOrigin: '0 0'}}><SalaAd b={b} /></div>
      </div>
      <div style={{position: 'absolute', left: CV.x, top: CV.y + CV.h + 12, fontSize: 16, color: C.dim, display: 'flex', gap: 28}}><span>59.26%</span><span>1080 px × 1350 px (72 ppi)</span></div>
      {/* layers panel */}
      <div style={{position: 'absolute', left: PANEL.x, top: PANEL.y, width: PANEL.w, background: C.panel, borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.35)'}}>
        <div style={{height: 44, display: 'flex', alignItems: 'flex-end', gap: 20, padding: '0 14px', background: C.head, fontSize: 16}}>
          <span style={{paddingBottom: 9, borderBottom: `2px solid ${C.text}`}}>Layers</span><span style={{paddingBottom: 11, color: C.dim}}>Channels</span><span style={{paddingBottom: 11, color: C.dim}}>Paths</span>
        </div>
        <div style={{height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px', fontSize: 15, color: C.dim, borderBottom: `1px solid ${C.line}`}}>
          <span style={{padding: '4px 10px', background: '#262626', borderRadius: 5}}>Normal ▾</span><span>Opacity: 100%</span>
        </div>
        {LAYERS.map(([k, name, file]) => {
          const on = b >= S[k], idx = order.indexOf(k as typeof order[number]), sel = idx === active;
          return (
            <div key={k} style={{height: ROW_H, display: 'flex', alignItems: 'center', gap: 12, padding: '0 12px', borderBottom: `1px solid ${C.line}`,
              background: sel ? `linear-gradient(180deg, ${C.orange2}, ${C.orange})` : 'transparent', color: sel ? '#fff' : on ? C.text : C.dim}}>
              <div style={{width: 28, height: 28, display: 'grid', placeItems: 'center', border: `1px solid ${sel ? 'rgba(255,255,255,0.4)' : '#484848'}`, borderRadius: 4}}>
                {on && <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth={1.8}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>}
              </div>
              <div style={{width: 34, height: 42, flex: 'none', outline: '1px solid #555', background: 'conic-gradient(#9a9a9a 25%, #c2c2c2 0 50%, #9a9a9a 0 75%, #c2c2c2 0) 0 0 / 10px 10px', position: 'relative', overflow: 'hidden'}}>
                <Img src={staticFile(`img/layers/${file}.png`)} style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}} />
              </div>
              <span style={{fontSize: 16, whiteSpace: 'nowrap', opacity: on ? 1 : 0.6}}>{name}</span>
            </div>
          );
        })}
        <div style={{height: 40, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 16, padding: '0 14px', color: C.dim, fontSize: 15}}><span>fx</span><span>◐</span><span>▭</span><span>＋</span><span>🗑︎</span></div>
      </div>
      {/* history panel */}
      <div style={{position: 'absolute', left: PANEL.x, top: 800, width: PANEL.w, height: 330, background: C.panel, borderRadius: 10, overflow: 'hidden'}}>
        <div style={{height: 44, display: 'flex', alignItems: 'flex-end', padding: '0 14px', background: C.head, fontSize: 16}}><span style={{paddingBottom: 9, borderBottom: `2px solid ${C.text}`}}>History</span></div>
        {hist.map(([t, label], i) => {
          const s = t < 0 ? 1 : sp(b, t, {damping: 16, stiffness: 200});
          const last = i === hist.length - 1;
          return (
            <div key={i} style={{height: 34, display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px', fontSize: 15, opacity: s, transform: `translateX(${(1 - s) * 30}px)`,
              background: last ? '#4a4a4a' : 'transparent', color: last ? '#fff' : C.text}}>
              <span style={{width: 16, height: 16, border: '1px solid #666', borderRadius: 3}} />{label}
            </div>
          );
        })}
      </div>
      {/* click ripple + cursor */}
      {ripple < 1 && f >= BUILD0 && (
        <div style={{position: 'absolute', left: clickPos.x - 30, top: clickPos.y - 30, width: 60, height: 60, borderRadius: '50%',
          border: `3px solid ${C.orange2}`, opacity: (1 - ripple) * 0.9 * curFade, transform: `scale(${0.4 + 1.2 * ripple})`}} />
      )}
      <svg viewBox="0 0 24 24" width={46} height={46} style={{position: 'absolute', left: cur.x - 7, top: cur.y - 4, opacity: curFade, transform: `scale(${press})`, transformOrigin: '20% 10%',
        filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.45))'}}>
        <path d="M5 2.5v17.2l4.6-4.3 2.9 6.6 3-1.3-2.9-6.5 6.3-.3z" fill="#111" stroke="#fff" strokeWidth={1.4} strokeLinejoin="round" />
      </svg>
    </div>
  );
};

// ---------------- captions: the hook, then one numbered step per layer ----------------
const CAPS: [number, number, string[], number[]][] = [
  [3, 34, ['شلون', 'سويت', 'هذا', 'الإعلان؟'], [3]],
  [52, 78, ['نبدي', 'من', 'الصفر'], [2]],
  [81, 122, ['١', 'لون', 'البراند'], [0]],
  [126, 167, ['٢', 'صورة', 'المنتج'], [0]],
  [171, 212, ['٣', 'كارت', 'من', 'تطبيقهم'], [0]],
  [216, 296, ['٤', 'العنوان', 'والسهم'], [0]],
  [301, 324, ['٥', 'اللوگو'], [0]],
];
// Apple-style word reveal: each word rises out of a soft blur, one after another, no bounce
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const Words: React.FC<{f: number; start: number; words: string[]; stagger?: number; color?: (i: number) => string; gap?: number}> = ({f, start, words, stagger = 4, color = () => '#fff', gap = 16}) => (
  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'baseline', gap, direction: 'rtl', whiteSpace: 'nowrap'}}>
    {words.map((w, i) => {
      const p = expo(clamp((f - start - i * stagger) / 14));
      return <span key={i} style={{display: 'inline-block', color: color(i), opacity: p, filter: `blur(${(1 - p) * 14}px)`, transform: `translateY(${(1 - p) * 26}px) scale(${0.96 + 0.04 * p})`}}>{w}</span>;
    })}
  </div>
);

const Captions: React.FC<{f: number}> = ({f}) => {
  const c = CAPS.find(([a, e]) => f >= a && f < e);
  if (!c) return null;
  const [a, e, words, hi] = c;
  const pin = expo(clamp((f - a + 2) / 12));
  const out = Easing.in(Easing.cubic)(clamp((f - (e - 7)) / 7));
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1300, display: 'flex', justifyContent: 'center',
      opacity: 1 - out, filter: `blur(${out * 10}px)`, transform: `translateY(${-out * 10}px)`}}>
      <div style={{padding: '18px 38px 22px', borderRadius: 999, background: 'rgba(24, 22, 22, 0.58)', backdropFilter: 'blur(26px) saturate(1.5)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.14), 0 18px 40px rgba(0,0,0,0.35)', opacity: pin, transform: `scale(${0.94 + 0.06 * pin})`,
        fontFamily: 'Alexandria', fontWeight: 700, fontSize: 58, lineHeight: 1.25}}>
        <Words f={f} start={a} words={words} color={(i) => (hi.includes(i) ? '#ff8a3d' : '#fff')} />
      </div>
    </div>
  );
};

// ---------------- rewind look ----------------
const Rewind: React.FC<{f: number}> = ({f}) => {
  if (f < 35 || f > 52) return null;
  const o = Math.sin(Math.PI * clamp((f - 35) / 17));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{opacity: 0.35 * o, background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0 2px, transparent 2px 6px)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center', opacity: o}}>
        <svg viewBox="0 0 48 24" width={150} height={75} style={{filter: 'drop-shadow(0 6px 14px rgba(0,0,0,0.5))'}}><path d="M22 2 4 12l18 10zM44 2 26 12l18 10z" fill="#fff" /></svg>
      </div>
    </AbsoluteFill>
  );
};

// ---------------- end card ----------------
const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")`;
const EndCard: React.FC<{f: number}> = ({f}) => {
  const t = f - CUT;
  const s = sp(t, 0, {damping: 17, stiffness: 120});
  const W = 740, sc = W / 1080, x = 170, y = 392, H = 1350 * sc;
  const float = 5 * Math.sin(t / 18);
  const ring = sp(t, 4, {damping: 18, stiffness: 90});
  const chip = expo(clamp((t - 46) / 14));
  const tag = expo(clamp((t - 6) / 14));
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 80% at 50% 10%, #f1e9dc 0%, #ece3d4 55%, #e3d6c2 100%)', fontFamily: 'Alexandria', color: '#1f1510', direction: 'rtl'}}>
      <div style={{position: 'absolute', left: 540 - 540, top: y + H / 2 - 540, width: 1080, height: 1080, borderRadius: '50%', border: '22px solid #e2541b', filter: 'blur(2.2px)',
        transform: `scale(${0.6 + 0.4 * ring})`, opacity: ring}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: 222, textAlign: 'center'}}>
        <div style={{fontFamily: '"IBM Plex Mono"', fontWeight: 500, fontSize: 24, letterSpacing: '0.16em', direction: 'ltr', color: 'rgba(31,21,16,0.62)',
          opacity: tag, filter: `blur(${(1 - tag) * 8}px)`}}>
          <span style={{display: 'inline-block', width: 12, height: 12, borderRadius: '50%', background: '#e2541b', marginRight: 14, verticalAlign: 2}} />@ALLAWI.PSD
        </div>
        <div style={{marginTop: 4, fontWeight: 800, fontSize: 80, lineHeight: 1.3}}>
          <Words f={t} start={10} stagger={5} gap={22} words={['طبقة', 'فوق', 'طبقة']} color={(i) => (i === 2 ? '#e2541b' : '#1f1510')} />
        </div>
      </div>
      <div style={{position: 'absolute', left: x, top: y + float, width: W, height: H, transformOrigin: '50% 50%',
        transform: `scale(${1 + 0.9 * (1 - s)}) rotate(${(1 - s) * -3}deg)`, boxShadow: '18px 30px 60px rgba(70,30,10,0.3), 0 3px 8px rgba(70,30,10,0.15)'}}>
        <div style={{transform: `scale(${sc})`, transformOrigin: '0 0'}}><SalaAd b={B_END + 40} /></div>
      </div>
      <div style={{position: 'absolute', left: 40, right: 40, top: 1420, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, direction: 'rtl'}}>
        <div style={{fontWeight: 800, fontSize: 46}}><Words f={t} start={26} stagger={4} gap={13} words={['تحب', 'إعلان', 'مثله', 'لمشروعك؟']} color={() => '#1f1510'} /></div>
        <span style={{height: 68, padding: '0 30px', borderRadius: 999, display: 'flex', alignItems: 'center', color: '#fbf3e6', fontWeight: 700, fontSize: 30,
          background: 'linear-gradient(180deg, #f07a2e, #e2541b)', boxShadow: '0 12px 24px rgba(150,50,10,0.3)',
          opacity: chip, filter: `blur(${(1 - chip) * 10}px)`, transform: `translateY(${(1 - chip) * 22}px) scale(${0.92 + 0.08 * chip})`}}>راسلني</span>
      </div>
      <AbsoluteFill style={{opacity: 0.3, mixBlendMode: 'multiply', backgroundImage: GRAIN}} />
      <AbsoluteFill style={{background: '#fff', opacity: 0.6 * (1 - prog(t, 0, 6))}} />
    </AbsoluteFill>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= CUT) return <EndCard f={f} />;
  const b = buildTime(f);
  const rgb = f >= 36 && f < 50 ? Math.sin(Math.PI * (f - 36) / 14) : 0;
  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <AbsoluteFill style={{filter: rgb > 0 ? `drop-shadow(${8 * rgb}px 0 0 rgba(255,0,60,0.45)) drop-shadow(${-8 * rgb}px 0 0 rgba(0,220,255,0.45))` : 'none'}}>
        <Workspace f={f} b={b} />
      </AbsoluteFill>
      <Rewind f={f} />
      <Captions f={f} />
    </AbsoluteFill>
  );
};

export const SalaReel: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <CameraMotionBlur shutterAngle={200} samples={6}>
      <Scene />
    </CameraMotionBlur>
    <Sound />
  </AbsoluteFill>
);
