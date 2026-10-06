import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Fonts} from './Fonts';
import {clamp, prog, shake, sp, track} from './anim';

// «صورة عادية.. صارت إعلان يبيع»: a plain stock photo of a gloved hand and a tube gets selected, its background
// deleted, and the Al-Shifa lab offer builds itself around the hand, layer by layer; then before/after and the CTA.
// Layers: public/img/alshifa/*.png, the offer story (1080x1920) split by ../../alshifa-lab/motion-layers.cjs.
export const ALSHIFA_DURATION = 510;           // 17 s at 30 fps

const PAPER = '#ece3d4', INK = '#1f1510', ORANGE = '#e2541b', ORANGE2 = '#f07a2e', CREAM = '#fbf3e6';
const expo = Easing.bezier(0.16, 1, 0.3, 1);   // fast out, long settle
const inout = Easing.bezier(0.65, 0, 0.35, 1);
const src = (n: string) => staticFile(`img/alshifa/${n}`);

// the raw photo (1024x685) lined up with the cut-out hand in the story: hand-tube.png is the photo's (180,58)-(702,652)
// crop drawn 760 px wide at (-70,640), so 1 photo px = 760/522 story px
const PK = 760 / 522;
const RAW = {x: -70 - 180 * PK, y: 640 - 58 * PK, w: 1024 * PK, h: 685 * PK};
const RAWC = {x: RAW.x + RAW.w / 2, y: RAW.y + RAW.h / 2};

// a full-canvas layer (each PNG is the whole 1080x1920 story with one element on it)
const Layer: React.FC<{n: string; style?: React.CSSProperties; origin?: [number, number]}> = ({n, style, origin}) => (
  <Img src={src(n.includes('.') ? n : n + '.png')} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920,
    transformOrigin: origin ? `${origin[0]}px ${origin[1]}px` : '50% 50%', ...style}} />
);

const Cursor: React.FC<{x: number; y: number; press?: number; o?: number}> = ({x, y, press = 0, o = 1}) => (
  <svg viewBox="0 0 24 24" width={66} height={66} style={{position: 'absolute', left: x - 12, top: y - 6, opacity: o, zIndex: 50,
    transform: `scale(${1 - 0.12 * press})`, transformOrigin: '20% 10%', filter: 'drop-shadow(0 6px 8px rgba(0,0,0,0.35))'}}>
    <path d="M5 2.5v17.2l4.6-4.3 2.9 6.6 3-1.3-2.9-6.5 6.3-.3z" fill={INK} stroke={CREAM} strokeWidth={1.4} strokeLinejoin="round" />
  </svg>
);
const Ripple: React.FC<{f: number; at: number; x: number; y: number; c?: string}> = ({f, at, x, y, c = ORANGE}) => {
  const t = clamp((f - at) / 14);
  if (t <= 0 || t >= 1) return null;
  return <div style={{position: 'absolute', left: x - 50, top: y - 50, width: 100, height: 100, borderRadius: '50%', border: `5px solid ${c}`,
    transform: `scale(${0.2 + 1.1 * expo(t)})`, opacity: 1 - t, zIndex: 49}} />;
};

// words rise out of a blur one after another
const Words: React.FC<{f: number; start: number; words: string[]; stagger?: number; style?: React.CSSProperties; color?: (i: number) => string}> =
  ({f, start, words, stagger = 4, style, color}) => (
    <span style={{display: 'inline-flex', gap: '0.28em', direction: 'rtl', ...style}}>
      {words.map((w, i) => {
        const t = expo(clamp((f - start - i * stagger) / 16));
        return <span key={i} style={{display: 'inline-block', opacity: t, filter: `blur(${(1 - t) * 12}px)`, transform: `translateY(${(1 - t) * 40}px)`,
          color: color ? color(i) : undefined}}>{w}</span>;
      })}
    </span>
  );

const GRAIN = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.55 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>")`;

// ------------------------------------------------------------------ the ad being built (story coordinates)
const BuiltAd: React.FC<{f: number}> = ({f}) => {
  // photo group: framed snapshot -> lands exactly where the cut-out hand sits in the ad
  const u = prog(f, 112, 150, inout);
  const s0 = 0.62, tx0 = 540 - RAWC.x, ty0 = 930 - RAWC.y;
  const pop = sp(f, 0, {damping: 13, stiffness: 160});
  const gs = (s0 + (1 - s0) * u) * (0.9 + 0.1 * pop), gr = -2.5 * (1 - u) * (0.5 + 0.5 * pop) + (1 - pop) * -6;
  const drift = (1 - u) * 4;
  const gtx = tx0 * (1 - u) + drift * Math.sin(f / 19), gty = ty0 * (1 - u) + drift * Math.cos(f / 23);
  const rawO = 1 - prog(f, 104, 128);
  const handO = prog(f, 96, 104);
  const frameO = 1 - prog(f, 104, 120);
  const glow = f >= 98 && f < 126 ? Math.sin(Math.PI * clamp((f - 98) / 28)) : 0;
  const dim = prog(f, 98, 106) * (1 - prog(f, 106, 126));

  // the teal floods out from the hand
  const flood = prog(f, 116, 150, Easing.bezier(0.5, 0, 0.2, 1));

  // build
  const lab = prog(f, 156, 172, expo);
  const pill = sp(f, 168, {damping: 12, stiffness: 180});
  const q = prog(f, 174, 194, expo);
  const a1 = sp(f, 196, {damping: 13, stiffness: 170}), a2 = sp(f, 208, {damping: 12, stiffness: 170});
  const card = sp(f, 228, {damping: 15, stiffness: 120});
  const price = sp(f, 284, {damping: 12, stiffness: 170});
  const stk = sp(f, 298, {damping: 8, stiffness: 150});
  const cta = sp(f, 318, {damping: 14, stiffness: 140}), brand = sp(f, 326, {damping: 14, stiffness: 140});
  const sweep = prog(f, 338, 372, inout);

  return (
    <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
      <Layer n="bg.jpg" style={{clipPath: `circle(${flood * 1700}px at 345px 1100px)`}} />

      {/* photo group */}
      <AbsoluteFill style={{transformOrigin: `${RAWC.x}px ${RAWC.y}px`, transform: `translate(${gtx}px, ${gty}px) scale(${gs}) rotate(${gr}deg)`}}>
        <div style={{position: 'absolute', left: RAW.x - 30, top: RAW.y - 30, width: RAW.w + 60, height: RAW.h + 150, background: '#fff', borderRadius: 10,
          opacity: frameO, boxShadow: '0 40px 80px rgba(60,35,15,0.28), 0 4px 10px rgba(60,35,15,0.15)'}}>
          <div style={{position: 'absolute', left: 40, bottom: 34, fontFamily: '"IBM Plex Mono"', fontWeight: 500, fontSize: 46, color: '#8b8178', direction: 'ltr'}}>IMG_2041.jpg</div>
        </div>
        <Img src={src('before.jpg')} style={{position: 'absolute', left: RAW.x, top: RAW.y, width: RAW.w, height: RAW.h, opacity: rawO,
          filter: `brightness(${1 - 0.35 * dim}) saturate(${1 - 0.4 * dim})`}} />
        {/* the cut-out ends at the canvas edge (the wrist): feather it while it sits inside the snapshot */}
        <Layer n="hand" style={{opacity: handO, filter: glow > 0 ? `drop-shadow(0 0 ${3 + 5 * glow}px rgba(255,255,255,${glow})) drop-shadow(0 0 2px rgba(255,255,255,${glow}))` : undefined,
          WebkitMaskImage: u < 1 ? `linear-gradient(90deg, transparent 0px, #000 ${150 * (1 - u)}px)` : undefined,
          maskImage: u < 1 ? `linear-gradient(90deg, transparent 0px, #000 ${150 * (1 - u)}px)` : undefined}} />
        <Layer n="tlabel" style={{clipPath: `inset(${991}px 0 ${1920 - (991 + 126 * lab)}px 0)`, opacity: lab}} />
      </AbsoluteFill>

      {/* headline block */}
      <Layer n="pill" origin={[540, 261]} style={{opacity: clamp(pill * 1.5), transform: `scale(${0.5 + 0.5 * pill})`}} />
      <Layer n="qline" style={{clipPath: `inset(0 0 0 ${232 + 620 * (1 - q)}px)`, opacity: clamp(q * 3), transform: `translateX(${-30 * (1 - q)}px)`}} />
      <Layer n="a1" origin={[783, 487]} style={{opacity: clamp(a1 * 2), transform: `scale(${1.7 - 0.7 * a1})`, filter: `blur(${(1 - clamp(a1)) * 14}px)`}} />
      <Layer n="a2" origin={[288, 508]} style={{opacity: clamp(a2 * 2), transform: `scale(${1.7 - 0.7 * a2})`, filter: `blur(${(1 - clamp(a2)) * 14}px)`}} />

      {/* card */}
      <AbsoluteFill style={{transformOrigin: '822px 1066px', transform: `translateX(${560 * (1 - card)}px) rotate(${12 * (1 - card)}deg)`, opacity: clamp(card * 3)}}>
        <Layer n="card" />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => {
          const t = prog(f, 244 + i * 5, 256 + i * 5, expo);
          return <Layer key={i} n={`li${i}`} style={{opacity: t, transform: `translateX(${40 * (1 - t)}px)`}} />;
        })}
        <Layer n="price" origin={[834, 1246]} style={{opacity: clamp(price * 2), transform: `scale(${0.7 + 0.3 * price})`}} />
      </AbsoluteFill>
      <Layer n="sticker" origin={[616, 1336]} style={{opacity: clamp(stk * 3), transform: `scale(${stk}) rotate(${-50 * (1 - stk)}deg)`}} />

      {/* footer */}
      <Layer n="cta" style={{opacity: clamp(cta * 2), transform: `translateY(${80 * (1 - cta)}px)`}} />
      <Layer n="brand" style={{opacity: clamp(brand * 2), transform: `translateY(${60 * (1 - brand)}px)`}} />

      <Layer n="grain" style={{opacity: flood}} />
      {/* light sweep across the finished ad */}
      {sweep > 0 && sweep < 1 && <AbsoluteFill style={{mixBlendMode: 'soft-light',
        background: `linear-gradient(115deg, transparent ${-40 + 160 * sweep}%, rgba(255,255,255,0.75) ${-25 + 160 * sweep}%, transparent ${-10 + 160 * sweep}%)`}} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ overlays during the photo phase (screen coords)
const PhotoUI: React.FC<{f: number}> = ({f}) => {
  if (f > 140) return null;
  // hook text
  const out = prog(f, 108, 124, Easing.in(Easing.cubic));
  // marquee drag 76 -> 92 around the snapshot
  const m = prog(f, 76, 92, inout), mo = 1 - prog(f, 104, 112);
  const X0 = 74, Y0 = 600, X1 = 1006, Y1 = 1262;
  // "Select Subject" chip
  const chip = sp(f, 90, {damping: 14, stiffness: 180}) * (1 - prog(f, 104, 112));
  const CH = {x: 540, y: 520};
  const CUR = [[40, 1180, 1760], [72, X0 + 6, Y0 + 6], [76, X0 + 6, Y0 + 6], [92, X1 - 6, Y1 - 6], [94, X1 - 6, Y1 - 6], [100, CH.x - 60, CH.y + 6], [106, CH.x - 60, CH.y + 6], [122, 1180, 1400]];
  const [cx, cy] = track(f, CUR, Easing.bezier(0.45, 0.05, 0.2, 1));
  const press = f >= 100 && f < 104 ? 1 : f >= 76 && f < 79 ? 1 : 0;
  const curO = prog(f, 40, 50) * (1 - prog(f, 112, 122));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 300, textAlign: 'center', fontFamily: 'Readex Pro', fontWeight: 700, fontSize: 88, color: INK,
        opacity: 1 - out, transform: `translateY(${-60 * out}px)`, filter: `blur(${out * 10}px)`}}>
        <Words f={f} start={6} words={['صورة', 'عادية..']} stagger={6} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1400, textAlign: 'center', fontFamily: 'Readex Pro', fontWeight: 500, fontSize: 44, color: 'rgba(31,21,16,0.62)',
        opacity: 1 - out}}>
        <Words f={f} start={30} words={['شوف', 'شصار', 'بيها', '👇']} stagger={5} />
      </div>
      {f >= 76 && mo > 0 && (
        <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, opacity: mo}}>
          <rect x={X0} y={Y0} width={(X1 - X0) * m} height={(Y1 - Y0) * m} fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth={4} strokeDasharray="16 12" strokeDashoffset={-f * 2} />
          <rect x={X0} y={Y0} width={(X1 - X0) * m} height={(Y1 - Y0) * m} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="16 12" strokeDashoffset={-f * 2 + 14} />
        </svg>
      )}
      {chip > 0.01 && (
        <div style={{position: 'absolute', left: CH.x - 190, top: CH.y - 40, width: 380, height: 80, borderRadius: 18, background: '#2b2b2b', color: '#eee',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, fontFamily: 'Readex Pro', fontWeight: 600, fontSize: 32, direction: 'ltr',
          opacity: chip, transform: `scale(${0.8 + 0.2 * chip}) translateY(${(1 - chip) * 20}px)`, boxShadow: '0 18px 40px rgba(0,0,0,0.35)',
          outline: f >= 100 ? `3px solid ${ORANGE}` : 'none'}}>
          <svg viewBox="0 0 24 24" width={34} height={34}><path d="M12 2l2.2 6.5L21 10l-5.5 4 2 7L12 17l-5.5 4 2-7L3 10l6.8-1.5z" fill={ORANGE2} /></svg>
          Select Subject
        </div>
      )}
      <Ripple f={f} at={76} x={X0 + 6} y={Y0 + 6} c="#fff" />
      <Ripple f={f} at={100} x={CH.x - 60} y={CH.y + 6} />
      <Cursor x={cx} y={cy} press={press} o={curO} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ before / after + CTA
const ADT = {cx: 300, cy: 990, s: 0.42};
const Finale: React.FC<{f: number}> = ({f}) => {
  const t = f - 372;
  const z = prog(f, 372, 398, Easing.bezier(0.7, 0, 0.2, 1));
  const before = sp(f, 392, {damping: 14, stiffness: 130});
  const lbA = sp(f, 400, {damping: 12, stiffness: 180}), lbB = sp(f, 406, {damping: 12, stiffness: 180});
  const arrow = prog(f, 410, 428, expo);
  const cta = sp(f, 430, {damping: 13, stiffness: 150});
  const price = expo(clamp((f - 440) / 16));
  const press = f >= 462 && f < 467 ? 1 : 0;
  const [cx, cy] = track(f, [[440, 1150, 1800], [458, 640, 1470], [470, 640, 1470], [490, 1180, 1800]], Easing.bezier(0.45, 0.05, 0.2, 1));
  const curO = prog(f, 440, 448) * (1 - prog(f, 482, 492));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* title */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 262, textAlign: 'center', color: INK}}>
        <div style={{fontFamily: 'Readex Pro', fontWeight: 700, fontSize: 64}}><Words f={t} start={10} words={['صورة', 'عادية..']} /></div>
        <div style={{marginTop: 4, fontFamily: '"Aref Ruqaa"', fontWeight: 700, fontSize: 104, lineHeight: 1.3, color: ORANGE}}>
          <Words f={t} start={20} stagger={5} words={['صارت', 'إعلان', 'يبيع']} />
        </div>
      </div>
      {/* before: the snapshot */}
      <div style={{position: 'absolute', left: 588, top: 760, width: 450, padding: '14px 14px 0', background: '#fff', borderRadius: 8,
        transform: `translateX(${520 * (1 - before)}px) rotate(${4 + 10 * (1 - before)}deg)`, opacity: clamp(before * 2),
        boxShadow: '0 26px 50px rgba(60,35,15,0.25), 0 3px 8px rgba(60,35,15,0.12)'}}>
        <Img src={src('before.jpg')} style={{display: 'block', width: '100%', borderRadius: 3}} />
        <div style={{padding: '12px 4px 14px', fontFamily: '"IBM Plex Mono"', fontWeight: 500, fontSize: 22, color: '#8b8178', direction: 'ltr'}}>IMG_2041.jpg</div>
      </div>
      <div style={{position: 'absolute', left: 880, top: 690, padding: '6px 28px 10px', borderRadius: 999, background: '#8b8178', color: '#fff',
        fontFamily: 'Readex Pro', fontWeight: 700, fontSize: 34, transform: `scale(${lbA})`, opacity: clamp(lbA * 2)}}>قبل</div>
      <div style={{position: 'absolute', left: 66, top: 540, padding: '6px 28px 10px', borderRadius: 999, background: ORANGE, color: '#fff', zIndex: 5,
        fontFamily: 'Readex Pro', fontWeight: 700, fontSize: 34, transform: `scale(${lbB})`, opacity: clamp(lbB * 2)}}>بعد</div>
      <svg viewBox="0 0 160 120" width={160} height={120} style={{position: 'absolute', left: 500, top: 1140}}>
        <path d="M150 20 C 140 80, 80 108, 20 92" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrow} />
        <path d="M44 72 L18 92 L46 110" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={clamp((arrow - 0.85) * 7)} />
      </svg>
      {/* CTA */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 1420, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '22px 56px 28px', borderRadius: 26, color: '#fff',
          background: `linear-gradient(180deg, ${ORANGE2}, ${ORANGE})`, fontFamily: 'Readex Pro', fontWeight: 700, fontSize: 50, direction: 'rtl',
          boxShadow: '0 18px 34px rgba(226,84,27,0.38), inset 0 1px 0 rgba(255,255,255,0.3)',
          opacity: clamp(cta * 2), transform: `translateY(${70 * (1 - cta)}px) scale(${(0.9 + 0.1 * cta) * (1 - 0.05 * press)})`}}>
          راسلني هسه
          <svg viewBox="0 0 24 24" width={44} height={44} fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round"><path d="M20 12H4M10 6l-6 6 6 6" /></svg>
        </div>
        <div style={{fontFamily: 'Readex Pro', fontWeight: 500, fontSize: 32, color: 'rgba(31,21,16,0.7)', opacity: price, transform: `translateY(${20 * (1 - price)}px)`}}>
          التصميم يبدي من <b style={{fontFamily: 'Alexandria', fontWeight: 900, color: ORANGE, fontSize: 40}}>14 ألف</b> — <span style={{fontFamily: '"IBM Plex Mono"', direction: 'ltr', unicodeBidi: 'isolate'}}>@allawi.psd</span>
        </div>
      </div>
      <Ripple f={f} at={462} x={640} y={1476} c="#fff" />
      <Cursor x={cx} y={cy} press={press} o={curO} />
      {z < 1 && <AbsoluteFill style={{background: '#fff', opacity: 0}} />}
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ camera + scene
const Scene: React.FC = () => {
  const f = useCurrentFrame();
  // after the build: slow push-in, then the ad shrinks into the before/after layout
  const push = prog(f, 330, 372, inout);
  const z = prog(f, 372, 398, Easing.bezier(0.7, 0, 0.2, 1));
  const sc = (1 + 0.035 * push) * (1 - (1 - ADT.s) * z);
  const tx = (ADT.cx - 540) * z, ty = (ADT.cy - 960) * z;
  const [s1x, s1y] = shake(f, 150, 8);
  const [s2x, s2y] = shake(f, 210, 12);
  const [s3x, s3y] = shake(f, 302, 6);
  const hx = (s1x + s2x + s3x) * (1 - z), hy = (s1y + s2y + s3y) * (1 - z);
  const radius = 64 * z / Math.max(sc, 0.01);
  const flash = 1 - prog(f, 0, 8);
  return (
    <AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 10%, #f1e9dc 0%, ${PAPER} 55%, #e3d6c2 100%)`, overflow: 'hidden', direction: 'rtl'}}>
      <AbsoluteFill style={{transform: `translate(${tx + hx}px, ${ty + hy}px) scale(${sc})`, transformOrigin: '540px 960px'}}>
        <AbsoluteFill style={{borderRadius: radius, overflow: 'hidden', boxShadow: z > 0 ? `0 ${60 * z}px ${120 * z}px rgba(60,35,15,${0.35 * z})` : 'none',
          outline: z > 0.5 ? `${14 / sc}px solid ${CREAM}` : 'none'}}>
          <BuiltAd f={f} />
        </AbsoluteFill>
      </AbsoluteFill>
      <PhotoUI f={f} />
      {f >= 372 && <Finale f={f} />}
      <AbsoluteFill style={{opacity: 0.28, mixBlendMode: 'multiply', backgroundImage: GRAIN, pointerEvents: 'none'}} />
      {flash > 0 && <AbsoluteFill style={{background: '#fff', opacity: flash}} />}
    </AbsoluteFill>
  );
};

// motion blur only where things move fast (it renders each frame several times)
const FAST: [number, number][] = [[0, 10], [110, 156], [196, 222], [228, 250], [296, 312], [370, 402]];
const Blur: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  const fast = FAST.some(([a, b]) => f >= a && f <= b);
  return <CameraMotionBlur shutterAngle={180} samples={fast ? 5 : 1}>{children}</CameraMotionBlur>;
};

const CUES: [number, string, number][] = [
  [0, 'click', 1], [1, 'whoosh', 0.45], [8, 'swoosh', 0.35],
  [76, 'click', 0.9], [78, 'swoosh', 0.45], [92, 'pop', 0.5],
  [100, 'click', 1], [101, 'success', 0.7],
  [108, 'whoosh', 0.8], [116, 'flood', 0.9], [150, 'thump', 0.9],
  [158, 'pop', 0.45], [168, 'pop', 0.7], [174, 'keys', 0.7],
  [196, 'thump', 0.8], [208, 'boom', 0.85],
  [228, 'swoosh', 0.8], [249, 'click', 0.3], [254, 'click', 0.3], [259, 'click', 0.3], [264, 'click', 0.3], [269, 'click', 0.3], [274, 'click', 0.3], [279, 'click', 0.3],
  [284, 'pop', 0.6], [298, 'pop', 1], [318, 'pop', 0.6],
  [338, 'reveal', 0.7], [356, 'riser', 0.7], [372, 'whoosh2', 1],
  [392, 'swoosh', 0.8], [410, 'zoomin', 0.55], [430, 'pop', 0.7], [462, 'click', 1], [463, 'success', 0.75],
];
const Sound: React.FC = () => (
  <>
    {CUES.map(([f, name, v], i) => (
      <Sequence key={i} from={f} layout="none"><Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>
    ))}
  </>
);

export const AlshifaReel: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <Blur><Scene /></Blur>
    <Sound />
  </AbsoluteFill>
);
