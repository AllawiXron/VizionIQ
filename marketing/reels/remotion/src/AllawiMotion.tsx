import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Fonts} from './Fonts';
import {clamp, prog, shake, sp, track} from './anim';
import {BOX} from './alshifaBoxes';

// «صورة عادية.. صارت إعلان يبيع», cut in the edit style of the reference reel (pills, highlight boxes, masked
// line reveals, brush/swoosh wipes, dark and paper scenes) but paced to be read and built on a strict centred
// layout. One object carries the story: the plain photo of the lab tube, which becomes the Al-Shifa ad.
export const MOTION_DURATION = 720;            // 24 s at 30 fps

const C = {ink: '#1f1510', cream: '#fbf3e6', paper: '#ece3d4', orange: '#e2541b', orange2: '#f07a2e', peach: '#ffb37a',
  creamSoft: 'rgba(251,243,230,0.72)', inkSoft: 'rgba(31,21,16,0.62)'};
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const inout = Easing.bezier(0.65, 0, 0.35, 1);
const accel = Easing.bezier(0.55, 0, 0.9, 0.4);
const AR = 'Alexandria', RX = '"Readex Pro"', MONO = '"IBM Plex Mono"';
const lay = (n: string) => staticFile(`img/alshifa/${n}`);
const pic = (n: string) => staticFile(`img/kinetic/${n}.jpg`);

// the raw photo (1024x685) lined up with the cut-out hand in the story canvas (see AlshifaReel)
const PK = 760 / 522;
const RAW = {x: -70 - 180 * PK, y: 640 - 58 * PK, w: 1024 * PK, h: 685 * PK};

// ================================================================== backgrounds
const DarkBG: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(75% 48% at 50% 46%, #3d2617 0%, #22150d 52%, #110a06 100%)'}}>
    <AbsoluteFill style={{background: 'repeating-radial-gradient(circle at 50% 46%, rgba(255,190,140,0.03) 0 70px, rgba(0,0,0,0) 70px 190px)'}} />
  </AbsoluteFill>
);
const LightBG: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(70% 50% at 50% 44%, #ffffff 0%, #f5f0e8 48%, #e3d9cb 100%)'}}>
    <AbsoluteFill style={{opacity: 0.55, backgroundImage: 'linear-gradient(rgba(31,21,16,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(31,21,16,0.07) 2px, transparent 2px)',
      backgroundSize: '72px 72px', backgroundPosition: '36px 24px',
      WebkitMaskImage: 'radial-gradient(45% 32% at 50% 46%, #000 0%, transparent 100%)', maskImage: 'radial-gradient(45% 32% at 50% 46%, #000 0%, transparent 100%)'}} />
  </AbsoluteFill>
);

// a scene: background, a short zoom settle after the cut, a zoom-push into the next cut, a slow drift in between
const Scene: React.FC<{dark?: boolean; len: number; whipIn?: boolean; whipOut?: boolean; children: React.ReactNode}> =
  ({dark, len, whipIn = true, whipOut = true, children}) => {
    const t = useCurrentFrame();
    const i = whipIn ? prog(t, 0, 12, expo) : 1;
    const o = whipOut ? prog(t, len - 11, len, Easing.in(Easing.cubic)) : 0;
    const sc = (1.07 - 0.07 * i) * (1 + 0.07 * o) * (1 + 0.02 * (t / len));
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        {dark ? <DarkBG /> : <LightBG />}
        <AbsoluteFill style={{transform: `scale(${sc})`, direction: 'rtl'}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  };

// ================================================================== type
// everything sits on one centred column; y is the line's centre
const Row: React.FC<{y: number; children: React.ReactNode}> = ({y, children}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', transform: 'translateY(-50%)'}}>{children}</div>
);
// a line that slides up out of a mask (and back up out of it on exit)
const Line: React.FC<{f: number; at: number; out?: number; size: number; color: string; weight?: number; font?: string; children: React.ReactNode}> =
  ({f, at, out, size, color, weight = 500, font = RX, children}) => {
    const i = prog(f, at, at + 18, expo);
    const o = out === undefined ? 0 : prog(f, out, out + 12, Easing.in(Easing.cubic));
    const pad = size * 0.3;
    return (
      <div style={{overflow: 'hidden', padding: `${pad}px ${pad}px`, margin: `${-pad}px ${-pad}px`}}>
        <div style={{transform: `translateY(${(1 - i) * 135 - o * 135}%)`, fontFamily: font, fontWeight: weight, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.25, direction: 'rtl'}}>
          {children}
        </div>
      </div>
    );
  };
// rounded pill: the box grows from the right (reading side), then the text rises inside it
const Pill: React.FC<{f: number; at: number; out?: number; size?: number; fill?: string; color?: string; stroke?: string; children: React.ReactNode}> =
  ({f, at, out, size = 56, fill = '#fff', color = C.ink, stroke = C.orange2, children}) => {
    if (f < at) return null;
    const w = prog(f, at, at + 12, expo);
    const o = out === undefined ? 0 : prog(f, out, out + 10, Easing.in(Easing.cubic));
    return (
      <div style={{position: 'relative', padding: `${size * 0.3}px ${size * 0.75}px ${size * 0.42}px`, transform: `scale(${1 - 0.15 * o})`, opacity: 1 - o}}>
        <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: fill, border: `${Math.max(4, size * 0.08)}px solid ${stroke}`,
          transform: `scaleX(${w})`, transformOrigin: '100% 50%', boxShadow: '0 18px 40px rgba(0,0,0,0.18)'}} />
        <Line f={f} at={at + 5} size={size} color={color} weight={600}>{children}</Line>
      </div>
    );
  };
// highlight box with selection handles (the reference's marker), text rises inside
const Mark: React.FC<{f: number; at: number; size?: number; children: React.ReactNode}> = ({f, at, size = 110, children}) => {
  const g = prog(f, at, at + 12, expo);
  const h = sp(f, at + 10, {damping: 12, stiffness: 260});
  return (
    <div style={{position: 'relative', padding: `${size * 0.06}px ${size * 0.3}px ${size * 0.16}px`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 10, background: C.orange2, transform: `scaleX(${g})`, transformOrigin: '100% 50%', boxShadow: '0 18px 44px rgba(226,84,27,0.35)'}} />
      {[['right', 'top'], ['left', 'bottom']].map(([sx, sy], i) => (
        <div key={i} style={{position: 'absolute', [sx]: -4, [sy]: -26, width: 5, height: 'calc(100% + 26px)', background: C.cream, transform: `scaleY(${h})`, transformOrigin: sy === 'top' ? '50% 0' : '50% 100%'}}>
          <div style={{position: 'absolute', [sy]: -13, left: -11, width: 27, height: 27, borderRadius: 99, background: C.cream, transform: `scale(${h})`}} />
        </div>
      ))}
      <Line f={f} at={at + 6} size={size} color="#fff" weight={900} font={AR}>{children}</Line>
    </div>
  );
};
// a word whose tatweel stretches (the reference's «وتنساهــن»)
const Stretch: React.FC<{f: number; at: number; pre: string; post: string; size?: number; color: string; max?: number; dur?: number}> =
  ({f, at, pre, post, size = 130, color, max = 8, dur = 26}) => {
    const n = Math.round(prog(f, at + 6, at + 6 + dur, inout) * max);
    return <Line f={f} at={at} size={size} color={color} weight={900} font={AR}>{pre + 'ـ'.repeat(n) + post}</Line>;
  };

// ================================================================== transitions
// a brush stroke sweeps across, covers the cut at at+11, and pulls away to reveal the next scene
const BRUSH = 'M -500 2400 C 0 1500, 1100 1600, 540 960 S 1100 260, 1600 -500';
const Brush: React.FC<{f: number; at: number; color?: string; lead?: string}> = ({f, at, color = C.orange, lead = C.peach}) => {
  if (f < at - 4 || f > at + 24) return null;
  const e = Easing.bezier(0.5, 0, 0.25, 1);
  const seg = (a: number, b: number) => ({strokeDasharray: `${Math.max(0.0001, a - b)} 4`, strokeDashoffset: -b});
  const a1 = prog(f, at - 4, at + 8, e), b1 = prog(f, at + 6, at + 18, e);
  const a2 = prog(f, at, at + 11, e), b2 = prog(f, at + 11, at + 22, e);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}}>
      <path d={BRUSH} fill="none" stroke={lead} strokeWidth={1100} strokeLinecap="round" pathLength={1} style={seg(a1, b1)} />
      <path d={BRUSH} fill="none" stroke={color} strokeWidth={2700} strokeLinecap="round" pathLength={1} style={seg(a2, b2)} />
    </svg>
  );
};
// a thin swoosh line as decoration
const Swoosh: React.FC<{f: number; at: number; d: string; dur?: number; width?: number; color?: string}> = ({f, at, d, dur = 22, width = 14, color = C.orange2}) => {
  const t = prog(f, at, at + dur, Easing.bezier(0.45, 0, 0.25, 1));
  if (t <= 0 || t >= 1) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray="0.4 3" strokeDashoffset={0.4 - t * 1.4} />
    </svg>
  );
};

// ================================================================== the photo, as a print and as a post
const Print: React.FC<{w?: number}> = ({w = 760}) => (
  <div style={{width: w, padding: 16, paddingBottom: 0, background: '#fff', borderRadius: 14, boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)'}}>
    <Img src={pic('before')} style={{display: 'block', width: '100%', borderRadius: 6}} />
    <div style={{padding: '16px 6px 20px', fontFamily: MONO, fontWeight: 500, fontSize: 28, color: '#8b8178', direction: 'ltr'}}>IMG_2041.jpg</div>
  </div>
);
const Post: React.FC<{plain?: boolean}> = ({plain}) => (
  <div style={{width: 720, background: '#fff', borderRadius: 30, overflow: 'hidden', boxShadow: '0 30px 60px rgba(31,21,16,0.18)', direction: 'ltr'}}>
    <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px'}}>
      <div style={{width: 54, height: 54, borderRadius: 99, background: plain ? '#d9d0c4' : `linear-gradient(135deg, ${C.orange2}, ${C.orange})`}} />
      <div style={{flex: 1}}>
        <div style={{width: plain ? 200 : 'auto', height: plain ? 18 : 'auto', borderRadius: 9, background: plain ? '#e6dfd5' : undefined, fontFamily: RX, fontWeight: 600, fontSize: 28, color: C.ink}}>{plain ? '' : 'your.business'}</div>
      </div>
      <div style={{fontFamily: RX, fontSize: 36, color: '#999', letterSpacing: 2}}>···</div>
    </div>
    {plain ? <div style={{height: 480, background: 'linear-gradient(160deg, #e9e1d6, #d8cdbd)'}} /> : <Img src={pic('before')} style={{display: 'block', width: '100%'}} />}
    <div style={{display: 'flex', gap: 22, padding: '18px 24px 8px'}}>
      {['M12 21s-7-4.4-9.3-8.6C1 9 3 5 6.6 5c2 0 3.4 1.2 4.4 2.6C12 6.2 13.4 5 15.4 5 19 5 21 9 19.3 12.4 17 16.6 12 21 12 21z', 'M21 12a8 8 0 1 1-3.3-6.5L21 4l-.8 4A8 8 0 0 1 21 12z', 'M3 11 21 3l-6 18-3-7z'].map((d, i) => (
        <svg key={i} viewBox="0 0 24 24" width={38} height={38}><path d={d} fill="none" stroke="#222" strokeWidth={1.9} strokeLinejoin="round" /></svg>
      ))}
    </div>
    <div style={{padding: '0 24px 22px', fontFamily: RX, fontWeight: 500, fontSize: 24, color: '#555'}}>{plain ? '' : '12,480 views'}</div>
  </div>
);

// ================================================================== scenes (local frames)
// A, dark: «عندك صورة / [عادية لمنتجك؟]», the print drops in
const SA: React.FC = () => {
  const f = useCurrentFrame();
  const p = sp(f, 16, {damping: 15, stiffness: 120, mass: 1});
  return (
    <Scene dark len={90} whipIn={false}>
      <div style={{position: 'absolute', left: -30, top: 120, fontFamily: MONO, fontWeight: 500, fontSize: 250, color: 'transparent', WebkitTextStroke: '3px rgba(255,214,180,0.12)',
        direction: 'ltr', transform: `translateX(${f * 0.5}px)`, opacity: prog(f, 0, 12)}}>2041</div>
      <Row y={420}><Line f={f} at={4} size={58} color={C.creamSoft}>عندك صورة</Line></Row>
      <Row y={540}><Pill f={f} at={12} size={64}>عادية لمنتجك؟</Pill></Row>
      <div style={{position: 'absolute', left: 540, top: 1060, transform: `translate(-50%, -50%) translateY(${(1 - p) * 900 + Math.sin(f / 16) * 6}px) rotate(${-3 + 9 * (1 - p)}deg)`}}>
        <Print />
      </div>
      <Row y={1440}><Line f={f} at={44} size={42} color="rgba(251,243,230,0.55)">صورتها بالتلفون.. ونزلتها</Line></Row>
    </Scene>
  );
};
// B, light: the same photo as a post scrolls past: «الناس تشوفها.. / وتعبــر», then «ولا رسالة»
const SB: React.FC = () => {
  const f = useCurrentFrame();
  const s = prog(f, 30, 62, accel);
  const y = -s * 1900;
  const v = (prog(f + 1, 30, 62, accel) - s) * 1900;
  return (
    <Scene len={90}>
      <Row y={400}><Line f={f} at={4} size={58} color={C.inkSoft}>الناس تشوفها..</Line></Row>
      <Row y={530}><Stretch f={f} at={24} pre="وتعبـ" post="ر" size={140} color={C.ink} dur={34} /></Row>
      <div style={{position: 'absolute', left: 540, top: 720, transform: `translateX(-50%) translateY(${y}px)`, filter: v > 2 ? `blur(${Math.min(18, v * 0.25)}px)` : undefined}}>
        <Post />
        <div style={{height: 40}} />
        <Post plain />
      </div>
      <Row y={1080}><Pill f={f} at={64} size={60}>ولا رسالة وحدة</Pill></Row>
    </Scene>
  );
};
// C, dark: «خليني أحولها / [لإعلان يبيع]», then the camera dives into the orange box
const SC: React.FC = () => {
  const f = useCurrentFrame();
  const z = prog(f, 54, 80, Easing.bezier(0.7, 0, 0.84, 0));
  return (
    <Scene dark len={80} whipOut={false}>
      <AbsoluteFill style={{transform: `scale(${1 + 22 * z})`, transformOrigin: '540px 975px'}}>
        <Row y={840}><Line f={f} at={6} size={62} color={C.creamSoft} out={50}>خليني أحولها</Line></Row>
        <Row y={975}><Mark f={f} at={16} size={116}>لإعلان يبيع</Mark></Row>
      </AbsoluteFill>
    </Scene>
  );
};

// D, light: the build inside a Photoshop-style canvas, one numbered step at a time
const K = 0.6, CW = 1080 * K, CH = 1920 * K, CX = 540 - CW / 2, CY = 1010 - CH / 2;
const STEPS: [number, string, string][] = [[14, '01', 'نقص المنتج'], [66, '02', 'لون البراند'], [114, '03', 'العنوان'], [174, '04', 'العرض'], [246, '05', 'جاهز للنشر']];
const Layer: React.FC<{n: string; style?: React.CSSProperties; origin?: [number, number]}> = ({n, style, origin}) => {
  const [x, y, w, h] = n.endsWith('.jpg') ? [0, 0, 1080, 1920] : BOX[n];
  return <Img src={lay(n.includes('.') ? n : n + '.png')} style={{position: 'absolute', left: x, top: y, width: w, height: h,
    transformOrigin: origin ? `${origin[0] - x}px ${origin[1] - y}px` : '50% 50%', ...style}} />;
};
const CHECKER: React.CSSProperties = {backgroundColor: '#fff', backgroundSize: '60px 60px', backgroundPosition: '0 0, 0 30px, 30px -30px, -30px 0',
  backgroundImage: 'linear-gradient(45deg, #e9e9e9 25%, transparent 25%), linear-gradient(-45deg, #e9e9e9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e9e9e9 75%), linear-gradient(-45deg, transparent 75%, #e9e9e9 75%)'};

const Build: React.FC<{t: number}> = ({t}) => {
  const glow = t >= 22 && t < 50 ? Math.sin(Math.PI * clamp((t - 22) / 28)) : 0;
  const rawO = 1 - prog(t, 34, 54);
  const flood = prog(t, 70, 98, Easing.bezier(0.5, 0, 0.2, 1));
  const lab = prog(t, 116, 130, expo);
  const pill = sp(t, 122, {damping: 13, stiffness: 180});
  const q = prog(t, 128, 148, expo);
  const a1 = sp(t, 148, {damping: 14, stiffness: 170}), a2 = sp(t, 158, {damping: 13, stiffness: 170});
  const card = sp(t, 180, {damping: 16, stiffness: 120});
  const price = sp(t, 232, {damping: 13, stiffness: 170});
  const stk = sp(t, 240, {damping: 9, stiffness: 150});
  const cta = sp(t, 248, {damping: 15, stiffness: 140}), brand = sp(t, 254, {damping: 15, stiffness: 140});
  const sweep = prog(t, 254, 276, inout);
  return (
    <AbsoluteFill style={{width: 1080, height: 1920, ...CHECKER}}>
      <Layer n="bg.jpg" style={{clipPath: `circle(${flood * 1700}px at 345px 1100px)`}} />
      <Img src={pic('before')} style={{position: 'absolute', left: RAW.x, top: RAW.y, width: RAW.w, height: RAW.h, opacity: rawO}} />
      <Layer n="hand" style={{filter: glow > 0 ? `drop-shadow(0 0 ${4 + 6 * glow}px rgba(255,255,255,${glow})) drop-shadow(0 0 2px rgba(240,122,46,${glow}))` : undefined,
        opacity: prog(t, 30, 36)}} />
      <Layer n="tlabel" style={{clipPath: `inset(0 0 ${(1 - lab) * 100}% 0)`, opacity: lab}} />
      <Layer n="pill" origin={[540, 261]} style={{opacity: clamp(pill * 2), transform: `scale(${0.6 + 0.4 * pill})`}} />
      <Layer n="qline" style={{clipPath: `inset(0 0 0 ${(1 - q) * 100}%)`, opacity: clamp(q * 3)}} />
      <Layer n="a1" origin={[783, 487]} style={{opacity: clamp(a1 * 2), transform: `scale(${1.5 - 0.5 * a1})`}} />
      <Layer n="a2" origin={[288, 508]} style={{opacity: clamp(a2 * 2), transform: `scale(${1.5 - 0.5 * a2})`}} />
      <AbsoluteFill style={{transformOrigin: '822px 1066px', transform: `translateX(${520 * (1 - card)}px) rotate(${10 * (1 - card)}deg)`, opacity: clamp(card * 3)}}>
        <Layer n="card" />
        {[1, 2, 3, 4, 5, 6, 7].map((i) => {
          const r = prog(t, 192 + i * 5, 204 + i * 5, expo);
          return <Layer key={i} n={`li${i}`} style={{opacity: r, transform: `translateX(${36 * (1 - r)}px)`}} />;
        })}
        <Layer n="price" origin={[834, 1246]} style={{opacity: clamp(price * 2), transform: `scale(${0.75 + 0.25 * price})`}} />
      </AbsoluteFill>
      <Layer n="sticker" origin={[616, 1336]} style={{opacity: clamp(stk * 3), transform: `scale(${stk}) rotate(${-40 * (1 - stk)}deg)`}} />
      <Layer n="cta" style={{opacity: clamp(cta * 2), transform: `translateY(${70 * (1 - cta)}px)`}} />
      <Layer n="brand" style={{opacity: clamp(brand * 2), transform: `translateY(${50 * (1 - brand)}px)`}} />
      {sweep > 0 && sweep < 1 && <AbsoluteFill style={{mixBlendMode: 'soft-light',
        background: `linear-gradient(115deg, transparent ${-40 + 160 * sweep}%, rgba(255,255,255,0.8) ${-25 + 160 * sweep}%, transparent ${-10 + 160 * sweep}%)`}} />}
    </AbsoluteFill>
  );
};
// the step label: number + name in a pill, swapped with a masked slide
const StepLabel: React.FC<{t: number}> = ({t}) => (
  <>
    {STEPS.map(([at, n, name], i) => {
      const next = STEPS[i + 1]?.[0];
      if (t < at || (next !== undefined && t > next + 12)) return null;
      const last = i === STEPS.length - 1;
      return (
        <Row key={n} y={300}>
          <Pill f={t} at={at} out={next} size={48} fill={last ? C.orange2 : '#fff'} color={last ? '#fff' : C.ink} stroke={last ? '#fff' : C.orange2}>
            <span style={{fontFamily: MONO, fontWeight: 500, color: last ? '#fff' : C.orange, marginLeft: 18, direction: 'ltr', unicodeBidi: 'isolate'}}>{n}</span>{name}
          </Pill>
        </Row>
      );
    })}
  </>
);
const SD: React.FC = () => {
  const t = useCurrentFrame();
  const open = prog(t, 0, 18, expo);
  const frame = sp(t, 4, {damping: 16, stiffness: 120});
  // the viewport: zoom on the step being worked on, story coordinates of the focus point (kept at least 1080/2z
  // and 1920/2z from the document's edges, so the zoom never shows past them)
  const [z, px, py] = track(t, [[0, 1, 540, 960], [108, 1, 540, 960], [122, 1.32, 540, 735], [168, 1.32, 540, 735], [182, 1.24, 640, 1080], [238, 1.24, 640, 1080], [250, 1, 540, 960]], inout);
  const [sx, sy] = shake(t, 160, 7);
  const dx = -z * (px * K - CW / 2), dy = -z * (py * K - CH / 2);
  return (
    <AbsoluteFill style={{background: C.orange2}}>
      <AbsoluteFill style={{clipPath: open < 1 ? `circle(${open * 1250}px at 540px 975px)` : undefined}}>
        <Scene len={270} whipIn={false}>
          <StepLabel t={t} />
          <div style={{position: 'absolute', left: CX, top: CY - 56, height: 44, padding: '0 20px', borderRadius: '14px 14px 0 0', background: '#2b2b2b', color: '#ddd',
            display: 'flex', alignItems: 'center', gap: 12, fontFamily: MONO, fontWeight: 500, fontSize: 22, direction: 'ltr', opacity: clamp(frame * 2)}}>
            <span style={{width: 10, height: 10, borderRadius: 99, background: C.orange2}} />alshifa_offer.psd
          </div>
          <div style={{position: 'absolute', left: CX, top: CY, width: CW, height: CH, borderRadius: '0 26px 26px 26px', overflow: 'hidden',
            boxShadow: '0 40px 90px rgba(31,21,16,0.28), 0 0 0 6px #2b2b2b', transform: `scale(${0.92 + 0.08 * frame})`, opacity: clamp(frame * 2)}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: CW, height: CH, transformOrigin: `${CW / 2}px ${CH / 2}px`, transform: `translate(${dx + sx}px, ${dy + sy}px) scale(${z})`}}>
              <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${K})`, transformOrigin: '0 0'}}>
                <Build t={t} />
              </div>
            </div>
          </div>
        </Scene>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
// E, dark: before / after
const SE: React.FC = () => {
  const f = useCurrentFrame();
  const b = sp(f, 22, {damping: 15, stiffness: 120}), a = sp(f, 34, {damping: 15, stiffness: 120});
  const arrow = prog(f, 52, 72, expo);
  return (
    <Scene dark len={100}>
      <Row y={380}><Line f={f} at={4} size={56} color={C.creamSoft}>من صورة عادية..</Line></Row>
      <Row y={500}><Line f={f} at={12} size={96} color={C.cream} weight={900} font={AR}>لإعلان يجيب رسايل</Line></Row>
      <div style={{position: 'absolute', left: 800, top: 900, transform: `translate(-50%, -50%) translateX(${(1 - b) * 600}px) rotate(${4 + 10 * (1 - b)}deg)`}}>
        <Row y={-70}><Pill f={f} at={30} size={40} fill="rgba(251,243,230,0.14)" color={C.cream} stroke="rgba(251,243,230,0.4)">قبل</Pill></Row>
        <Print w={420} />
      </div>
      <div style={{position: 'absolute', left: 300, top: 1010, transform: `translate(-50%, -50%) translateX(${(1 - a) * -600}px) rotate(${-3 - 10 * (1 - a)}deg)`}}>
        <Row y={-70}><Pill f={f} at={42} size={40} fill={C.orange2} color="#fff" stroke={C.orange2}>بعد</Pill></Row>
        <div style={{width: 400, padding: 14, background: C.cream, borderRadius: 26, boxShadow: '0 40px 80px rgba(0,0,0,0.45)'}}>
          <Img src={pic('after')} style={{display: 'block', width: '100%', borderRadius: 16}} />
        </div>
      </div>
      <svg viewBox="0 0 200 150" width={200} height={150} style={{position: 'absolute', left: 520, top: 1150}}>
        <path d="M185 20 C 175 100, 100 135, 25 115" fill="none" stroke={C.peach} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrow} />
        <path d="M54 92 L22 115 L56 136" fill="none" stroke={C.peach} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={clamp((arrow - 0.85) * 7)} />
      </svg>
      <Swoosh f={f} at={60} d="M-100 1560 C 300 1420, 700 1700, 1180 1460" />
    </Scene>
  );
};
// F, light: the offer
const Logo: React.FC<{f: number; at: number; size?: number}> = ({f, at, size = 150}) => {
  const letters = 'allawi'.split('');
  const dot = sp(f, at + 16, {damping: 8, stiffness: 220});
  const psd = sp(f, at + 20, {damping: 13, stiffness: 200});
  return (
    <div style={{display: 'flex', alignItems: 'baseline', direction: 'ltr', fontFamily: RX, fontWeight: 600, fontSize: size, color: C.ink, lineHeight: 1}}>
      {letters.map((l, i) => {
        const s = prog(f, at + i * 2, at + i * 2 + 14, expo);
        return <span key={i} style={{display: 'inline-block', overflow: 'hidden', paddingBottom: size * 0.2, marginBottom: -size * 0.2}}>
          <span style={{display: 'inline-block', transform: `translateY(${(1 - s) * 120}%)`}}>{l}</span></span>;
      })}
      <span style={{display: 'inline-block', width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: C.orange, margin: `0 ${size * 0.04}px`,
        transform: `translateY(${(1 - dot) * -260}px) scale(${0.4 + 0.6 * dot})`, opacity: clamp(dot * 4)}} />
      <span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 500, color: C.orange, fontSize: size * 0.82, opacity: clamp(psd * 3), transform: `translateX(${(1 - psd) * -50}px)`}}>psd</span>
    </div>
  );
};
const SF: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene len={90} whipOut={false}>
      <Row y={660}><Line f={f} at={4} size={56} color={C.inkSoft}>تريد إعلانك يصير هيچ؟</Line></Row>
      <Row y={840}><Logo f={f} at={12} /></Row>
      <Row y={1040}><Pill f={f} at={34} size={66} fill={C.orange2} color="#fff" stroke={C.orange2}>راسلني هسه</Pill></Row>
      <Row y={1170}><Line f={f} at={46} size={44} color={C.inkSoft}>التصميم يبدي من <b style={{fontFamily: AR, fontWeight: 900, color: C.orange, fontSize: 56}}>14 ألف</b></Line></Row>
    </Scene>
  );
};

// ================================================================== timeline
const TL: [number, number, React.FC][] = [[0, 90, SA], [90, 90, SB], [180, 80, SC], [260, 270, SD], [530, 100, SE], [630, 90, SF]];
const BRUSHES = [90, 180, 530, 630].map((cut) => cut - 11);
const FAST: [number, number][] = [...BRUSHES.map((b) => [b - 2, b + 24] as [number, number]), [118, 152], [236, 262], [420, 426]];
const Blur: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <CameraMotionBlur shutterAngle={180} samples={FAST.some(([a, b]) => f >= a && f <= b) ? 4 : 1}>{children}</CameraMotionBlur>;
};
const Wipes: React.FC = () => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{pointerEvents: 'none'}}>{BRUSHES.map((at, i) => <Brush key={i} f={f} at={at} color={i % 2 ? C.orange : C.orange2} />)}</AbsoluteFill>;
};

const CUES: [number, string, number][] = [
  [4, 'swoosh', 0.35], [12, 'pop', 0.55], [16, 'whoosh', 0.45], [30, 'thump', 0.6],
  ...BRUSHES.map((b) => [b, 'whoosh2', 0.85] as [number, string, number]),
  [94, 'swoosh', 0.3], [120, 'whoosh', 0.7], [154, 'pop', 0.55],
  [186, 'swoosh', 0.3], [196, 'zoomin', 0.55], [234, 'riser', 0.7],
  [274, 'click', 0.6], [282, 'success', 0.45], [326, 'click', 0.6], [330, 'flood', 0.75], [374, 'click', 0.6], [382, 'pop', 0.5], [388, 'keys', 0.55], [408, 'thump', 0.7], [418, 'boom', 0.6],
  [434, 'click', 0.6], [440, 'swoosh', 0.7], ...[1, 2, 3, 4, 5, 6, 7].map((i) => [452 + i * 5, 'click', 0.22] as [number, string, number]), [492, 'pop', 0.55], [500, 'pop', 0.85],
  [506, 'click', 0.6], [508, 'success', 0.6], [514, 'reveal', 0.5],
  [552, 'swoosh', 0.6], [564, 'swoosh', 0.6], [582, 'zoomin', 0.45],
  [642, 'reveal', 0.6], [664, 'pop', 0.7],
];

export const AllawiMotion: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <Blur>
      <AbsoluteFill>
        {TL.map(([from, len, Comp], i) => (
          <Sequence key={i} from={from} durationInFrames={len} layout="none"><AbsoluteFill><Comp /></AbsoluteFill></Sequence>
        ))}
        <Wipes />
      </AbsoluteFill>
    </Blur>
    {CUES.map(([f, name, v], i) => (
      <Sequence key={i} from={f} layout="none"><Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>
    ))}
  </AbsoluteFill>
);
