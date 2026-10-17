import React from 'react';
import {AbsoluteFill, Easing, Html5Audio, Img, random, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {CameraMotionBlur} from '@remotion/motion-blur';
import {Fonts} from './Fonts';
import {clamp, prog, sp} from './anim';

// allawi.psd: a kinetic-typography ad in the style of the reference reel (short Iraqi lines in pills, 3D icons in
// rounded tiles, outlined counters, chat bubbles, an Instagram card crossed out, swooshes, notifications, a rising
// graph, then the offer and the logo). Dark scenes and paper scenes alternate, in the allawi.psd colours.
export const KINETIC_DURATION = 810;            // 27 s at 30 fps

const C = {ink: '#1f1510', cream: '#fbf3e6', paper: '#ece3d4', orange: '#e2541b', orange2: '#f07a2e', peach: '#ffb37a', red: '#ff4d5e', soft: 'rgba(31,21,16,0.62)'};
const expo = Easing.bezier(0.16, 1, 0.3, 1);
const inout = Easing.bezier(0.65, 0, 0.35, 1);
const emoji = (n: string) => staticFile(`emoji/${n}.png`);
const img = (n: string) => staticFile(`img/kinetic/${n}.jpg`);
const AR = 'Alexandria', RX = '"Readex Pro"', MONO = '"IBM Plex Mono"';

// ================================================================== backgrounds
const DarkBG: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(75% 48% at 50% 46%, #3d2617 0%, #22150d 52%, #110a06 100%)'}}>
    <AbsoluteFill style={{background: 'repeating-radial-gradient(circle at 50% 46%, rgba(255,190,140,0.035) 0 70px, rgba(0,0,0,0) 70px 190px)'}} />
  </AbsoluteFill>
);
const LightBG: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(70% 50% at 50% 44%, #ffffff 0%, #f5f0e8 48%, #e3d9cb 100%)'}}>
    <AbsoluteFill style={{opacity: 0.6,
      backgroundImage: 'linear-gradient(rgba(31,21,16,0.07) 2px, transparent 2px), linear-gradient(90deg, rgba(31,21,16,0.07) 2px, transparent 2px)',
      backgroundSize: '72px 72px', backgroundPosition: '36px 24px',
      WebkitMaskImage: 'radial-gradient(42% 30% at 50% 46%, #000 0%, transparent 100%)', maskImage: 'radial-gradient(42% 30% at 50% 46%, #000 0%, transparent 100%)'}} />
  </AbsoluteFill>
);

// a scene: background, entry/exit whip (zoom + blur), slow push-in. `len` = frames on screen.
const Scene: React.FC<{dark?: boolean; len: number; enter?: 'whip' | 'circle' | 'none'; exit?: boolean; children: React.ReactNode}> =
  ({dark, len, enter = 'whip', exit = true, children}) => {
    const t = useCurrentFrame();
    const inP = enter === 'none' ? 1 : prog(t, 0, enter === 'circle' ? 14 : 7, expo);
    const outP = exit ? prog(t, len - 6, len, Easing.in(Easing.cubic)) : 0;
    const sc = (enter === 'whip' ? 1.12 - 0.12 * inP : 1) * (1 + 0.035 * t / len) * (1 + 0.18 * outP);
    const blur = (enter === 'whip' ? (1 - inP) * 14 : 0) + outP * 16;
    return (
      <AbsoluteFill style={{overflow: 'hidden', clipPath: enter === 'circle' && inP < 1 ? `circle(${inP * 1250}px at 540px 960px)` : undefined}}>
        {dark ? <DarkBG /> : <LightBG />}
        <AbsoluteFill style={{transform: `scale(${sc})`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined, direction: 'rtl'}}>{children}</AbsoluteFill>
      </AbsoluteFill>
    );
  };

// ================================================================== kit
const At: React.FC<{x: number; y: number; children: React.ReactNode; style?: React.CSSProperties}> = ({x, y, children, style}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'max-content', ...style}}>{children}</div>
);
const outK = (f: number, out?: number) => (out === undefined ? 1 : 1 - prog(f, out, out + 7, Easing.in(Easing.cubic)));

// words rise out of a blur, one after another (whole words, so Arabic letters stay joined)
const Lead: React.FC<{f: number; at: number; text: string; size?: number; color?: string; weight?: number; stagger?: number; out?: number}> =
  ({f, at, text, size = 52, color = 'rgba(251,243,230,0.78)', weight = 400, stagger = 3, out}) => {
    const o = outK(f, out);
    return (
      <div style={{display: 'flex', columnGap: '0.26em', fontFamily: RX, fontWeight: weight, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.3, opacity: o, transform: `translateY(${(1 - o) * -30}px)`}}>
        {text.split(' ').map((w, i) => {
          const t = expo(clamp((f - at - i * stagger) / 10));
          return <span key={i} style={{display: 'inline-block', opacity: t, transform: `translateY(${(1 - t) * 22}px)`, filter: `blur(${(1 - t) * 8}px)`}}>{w}</span>;
        })}
      </div>
    );
  };
// bold words pop with overshoot
const Bold: React.FC<{f: number; at: number; text: string; size?: number; color?: string; stagger?: number; out?: number; font?: string}> =
  ({f, at, text, size = 110, color = C.cream, stagger = 4, out, font = AR}) => {
    const o = outK(f, out);
    return (
      <div style={{display: 'flex', columnGap: '0.24em', fontFamily: font, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', lineHeight: 1.2, opacity: o, transform: `scale(${0.9 + 0.1 * o})`}}>
        {text.split(' ').map((w, i) => {
          const s = sp(f, at + i * stagger, {damping: 11, stiffness: 230, mass: 0.7});
          return <span key={i} style={{display: 'inline-block', opacity: clamp(s * 4), transform: `translateY(${(1 - s) * 40}px) scale(${0.55 + 0.45 * s})`}}>{w}</span>;
        })}
      </div>
    );
  };
// stretched word: tatweel (ـ) grows inside it, like the reference's «وتنساهــن»
const Stretch: React.FC<{f: number; at: number; pre: string; post: string; size?: number; color?: string; max?: number}> =
  ({f, at, pre, post, size = 120, color = C.cream, max = 7}) => {
    const s = sp(f, at, {damping: 12, stiffness: 200});
    const n = Math.round(prog(f, at + 4, at + 18, expo) * max);
    return <div style={{fontFamily: AR, fontWeight: 900, fontSize: size, color, whiteSpace: 'nowrap', opacity: clamp(s * 3), transform: `scale(${0.6 + 0.4 * s})`}}>{pre + 'ـ'.repeat(n) + post}</div>;
  };

// rounded pill: the box wipes in from the right, then the text wipes in
const Pill: React.FC<{f: number; at: number; text: string; size?: number; fill?: string; color?: string; stroke?: string; rot?: number; out?: number; spark?: boolean}> =
  ({f, at, text, size = 50, fill = '#fff', color = C.ink, stroke = C.orange2, rot = 0, out, spark}) => {
    if (f < at) return null;
    const w = expo(clamp((f - at) / 9));
    const tx = expo(clamp((f - at - 4) / 10));
    const s = sp(f, at, {damping: 12, stiffness: 220});
    const o = outK(f, out);
    return (
      <div style={{position: 'relative', transform: `rotate(${rot}deg) scale(${(0.86 + 0.14 * s) * (0.6 + 0.4 * o)})`, opacity: o}}>
        <div style={{position: 'relative', padding: `${size * 0.3}px ${size * 0.72}px ${size * 0.42}px`, whiteSpace: 'nowrap'}}>
          <div style={{position: 'absolute', inset: 0, borderRadius: 999, background: fill, border: `${Math.max(4, size * 0.09)}px solid ${stroke}`,
            transform: `scaleX(${w})`, transformOrigin: '100% 50%', boxShadow: '0 18px 40px rgba(0,0,0,0.22)'}} />
          <div style={{position: 'relative', fontFamily: RX, fontWeight: 600, fontSize: size, color, clipPath: `inset(-20% 0 -20% ${(1 - tx) * 100}%)`}}>{text}</div>
        </div>
        {spark && [[-0.06, -0.5, 46, 4], [1.02, -0.35, 36, 7], [0.92, 1.25, 30, 10], [0.06, 1.3, 40, 13], [1.12, 0.8, 26, 16]].map(([px, py, sz, d], i) => {
          const k = sp(f, at + d, {damping: 9, stiffness: 260});
          return <svg key={i} viewBox="0 0 24 24" width={sz} height={sz} style={{position: 'absolute', left: `${px * 100}%`, top: `${py * 100}%`, transform: `translate(-50%,-50%) scale(${k}) rotate(${(1 - k) * 90 + 10 * Math.sin((f + i * 9) / 9)}deg)`}}>
            <path d="M12 2v20M2 12h20" stroke={C.orange2} strokeWidth={5} strokeLinecap="round" /></svg>;
        })}
      </div>
    );
  };

// highlight box with Photoshop-style selection handles
const Mark: React.FC<{f: number; at: number; text: string; size?: number}> = ({f, at, text, size = 96}) => {
  const g = expo(clamp((f - at) / 9));
  const h = sp(f, at + 8, {damping: 10, stiffness: 300});
  const tx = expo(clamp((f - at - 5) / 10));
  return (
    <div style={{position: 'relative', padding: `${size * 0.04}px ${size * 0.3}px ${size * 0.14}px`}}>
      <div style={{position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(240,122,46,0.92)', transform: `scaleX(${g})`, transformOrigin: '100% 50%', boxShadow: '0 16px 40px rgba(226,84,27,0.35)'}} />
      {[['right', 'top'], ['left', 'bottom']].map(([sx, sy], i) => (
        <div key={i} style={{position: 'absolute', [sx]: -4, [sy]: -24, width: 5, height: 'calc(100% + 24px)', background: C.cream, transform: `scaleY(${h})`, transformOrigin: sy === 'top' ? '50% 0' : '50% 100%'}}>
          <div style={{position: 'absolute', [sy]: -12, left: -11, width: 27, height: 27, borderRadius: 99, background: C.cream, transform: `scale(${h})`}} />
        </div>
      ))}
      <div style={{position: 'relative', fontFamily: AR, fontWeight: 900, fontSize: size, color: '#fff', whiteSpace: 'nowrap', clipPath: `inset(-20% 0 -20% ${(1 - tx) * 100}%)`}}>{text}</div>
    </div>
  );
};

// 3D icon in a white rounded tile (or an image filling it); the tile spins in, then the icon pops
const Tile: React.FC<{f: number; at: number; x: number; y: number; size?: number; icon?: string; pics?: string[]; inner?: string; rot?: number; out?: number; to?: {at: number; x: number; y: number; s: number}}> =
  ({f, at, x, y, size = 300, icon, pics, inner = `linear-gradient(160deg, ${C.orange2}, ${C.orange})`, rot = -24, out, to}) => {
    if (f < at) return null;
    const s = sp(f, at, {damping: 11, stiffness: 150, mass: 0.9});
    const k = icon ? sp(f, at + 5, {damping: 8, stiffness: 190}) : 1;
    const o = outK(f, out);
    const m = to ? prog(f, to.at, to.at + 14, inout) : 0;
    const X = x + (to ? (to.x - x) * m : 0), Y = y + (to ? (to.y - y) * m : 0), S = 1 + (to ? (to.s - 1) * m : 0);
    const bob = Math.sin((f - at) / 14) * 7;
    const pic = pics ? pics[Math.min(pics.length - 1, Math.max(0, Math.floor((f - at - 6) / 5)))] : undefined;
    const ar = pics ? 1.25 : 1;
    return (
      <div style={{position: 'absolute', left: X - size / 2, top: Y - (size * ar) / 2, width: size, height: size * ar, borderRadius: size * 0.17, background: '#fff',
        boxShadow: '0 36px 70px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: `translateY(${bob}px) scale(${(0.25 + 0.75 * s) * S * (0.5 + 0.5 * o)}) rotate(${rot * (1 - s)}deg)`, opacity: clamp(s * 3) * o}}>
        <div style={{width: size * (pics ? 0.88 : 0.8), height: size * ar * (pics ? 0.9 : 0.8), borderRadius: size * 0.12, background: inner, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          {icon && <Img src={emoji(icon)} style={{width: size * 0.66, height: size * 0.66, transform: `scale(${k}) rotate(${(1 - k) * -40}deg)`, filter: 'drop-shadow(0 14px 18px rgba(0,0,0,0.3))'}} />}
          {pic && <Img src={img(pic)} style={{width: '100%', height: '100%', objectFit: 'cover'}} />}
        </div>
      </div>
    );
  };
// a free-floating 3D icon
const Icon: React.FC<{f: number; at: number; x: number; y: number; name: string; size?: number; rot?: number; spin?: number; out?: number}> =
  ({f, at, x, y, name, size = 200, rot = -30, spin = 0, out}) => {
    if (f < at) return null;
    const s = sp(f, at, {damping: 9, stiffness: 180});
    const o = outK(f, out);
    return <Img src={emoji(name)} style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, opacity: clamp(s * 3) * o,
      transform: `translateY(${Math.sin((f - at) / 12) * 8}px) scale(${s * (0.5 + 0.5 * o)}) rotate(${rot * (1 - s) + spin * (f - at)}deg)`, filter: 'drop-shadow(0 20px 26px rgba(0,0,0,0.3))'}} />;
  };

// big outlined counter in the background
const Count: React.FC<{f: number; at: number; from: number; to: number; x: number; y: number; size?: number; dur?: number; color?: string; drift?: number}> =
  ({f, at, from, to, x, y, size = 320, dur = 40, color = 'rgba(255,214,180,0.24)', drift = 0.6}) => {
    if (f < at) return null;
    const v = from + (to - from) * prog(f, at, at + dur, Easing.out(Easing.cubic));
    const a = prog(f, at, at + 8);
    return <div style={{position: 'absolute', left: x + drift * (f - at), top: y, direction: 'ltr', fontFamily: AR, fontWeight: 800, fontSize: size, lineHeight: 1,
      color: 'transparent', WebkitTextStroke: `3px ${color}`, opacity: a, whiteSpace: 'nowrap'}}>{Math.round(v).toLocaleString('en-US')}</div>;
  };

// a comet stroke sweeping along a path
const Swoosh: React.FC<{f: number; at: number; d: string; dur?: number; width?: number; color?: string; len?: number}> =
  ({f, at, d, dur = 16, width = 40, color = C.orange2, len = 0.45}) => {
    const t = prog(f, at, at + dur, Easing.bezier(0.45, 0, 0.25, 1));
    if (t <= 0 || t >= 1) return null;
    return (
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray={`${len} 3`} strokeDashoffset={len - t * (1 + len)} />
        <path d={d} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={width * 0.25} strokeLinecap="round" pathLength={1} strokeDasharray={`${len * 0.6} 3`} strokeDashoffset={len * 0.6 - t * (1 + len * 0.6)} />
      </svg>
    );
  };

// blurred shapes flying out of the centre (the hook)
const Particles: React.FC<{f: number; from: number; to: number}> = ({f, from, to}) => {
  if (f < from || f > to) return null;
  return (
    <AbsoluteFill>
      {new Array(14).fill(0).map((_, i) => {
        const a = random(`a${i}`) * Math.PI * 2, sp0 = 9 + random(`s${i}`) * 16, t = f - from + random(`d${i}`) * 30;
        const r = 120 + t * sp0, x = 540 + Math.cos(a) * r, y = 900 + Math.sin(a) * r * 1.4;
        const w = 70 + random(`w${i}`) * 120, o = 0.85 * (1 - prog(f, to - 10, to));
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: w, height: w * 0.42, borderRadius: w, opacity: o,
          background: i % 3 === 0 ? C.peach : i % 3 === 1 ? C.orange2 : '#ffd2a8', filter: `blur(${6 + (i % 4) * 4}px)`, transform: `rotate(${(a * 180) / Math.PI + t * 3}deg)`}} />;
      })}
    </AbsoluteFill>
  );
};

const Bubble: React.FC<{f: number; at: number; text: string; dark?: boolean; side: 'left' | 'right'; out?: number; size?: number}> =
  ({f, at, text, dark, side, out, size = 50}) => {
    if (f < at) return null;
    const s = sp(f, at, {damping: 13, stiffness: 170});
    const o = outK(f, out);
    const dir = side === 'left' ? -1 : 1;
    return (
      <div style={{position: 'relative', padding: `${size * 0.32}px ${size * 0.6}px ${size * 0.42}px`, borderRadius: size * 0.7, whiteSpace: 'nowrap',
        background: dark ? C.ink : C.orange2, color: dark ? C.cream : '#fff', fontFamily: RX, fontWeight: 600, fontSize: size,
        boxShadow: '0 18px 36px rgba(31,21,16,0.22)', opacity: clamp(s * 3) * o,
        transform: `translateX(${dir * 700 * (1 - s) + dir * 300 * (1 - o)}px) rotate(${dir * -3 + dir * 8 * (1 - s)}deg)`}}>
        {text}
        <div style={{position: 'absolute', bottom: -8, [side === 'left' ? 'left' : 'right']: 26, width: 30, height: 30, borderRadius: 4, background: dark ? C.ink : C.orange2,
          transform: 'rotate(45deg)'}} />
      </div>
    );
  };

const InstaCard: React.FC<{f: number; at: number; words: [number, string][]; crossAt: number; out?: number}> = ({f, at, words, crossAt, out}) => {
  if (f < at) return null;
  const s = sp(f, at, {damping: 13, stiffness: 140});
  const o = outK(f, out);
  let cur = words[0], ci = 0;
  words.forEach((w, i) => { if (f >= w[0]) { cur = w; ci = i; } });
  const wp = sp(f, cur[0], {damping: 10, stiffness: 260});
  const a = prog(f, crossAt, crossAt + 6, expo), b = prog(f, crossAt + 5, crossAt + 11, expo);
  return (
    <div style={{position: 'relative', width: 500, height: 500, borderRadius: 54, background: '#2a1a10', padding: 38, boxShadow: '0 40px 80px rgba(31,21,16,0.35)',
      transform: `translateX(${700 * (1 - s)}px) rotate(${10 * (1 - s)}deg) scale(${0.6 + 0.4 * o})`, opacity: o}}>
      <div style={{width: '100%', height: '100%', borderRadius: 10, background: '#fff', display: 'flex', flexDirection: 'column', direction: 'ltr', overflow: 'hidden'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px'}}>
          <div style={{width: 30, height: 30, borderRadius: 9, border: '3px solid #111'}} />
          <div style={{flex: 1, fontFamily: '"Instrument Serif"', fontStyle: 'italic', fontSize: 34, color: '#111'}}>Instagram</div>
          <svg viewBox="0 0 24 24" width={30} height={30}><path d="M12 21s-7-4.4-9.3-8.6C1 9 3 5 6.6 5c2 0 3.4 1.2 4.4 2.6C12 6.2 13.4 5 15.4 5 19 5 21 9 19.3 12.4 17 16.6 12 21 12 21z" fill="none" stroke="#111" strokeWidth={2} /></svg>
        </div>
        <div style={{flex: 1, margin: '0 16px', background: '#f6f2ec', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl'}}>
          <div key={ci} style={{fontFamily: AR, fontWeight: 900, fontSize: 70, color: C.ink, transform: `scale(${0.5 + 0.5 * wp})`, opacity: clamp(wp * 3)}}>{cur[1]}</div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px 6px'}}>
          <svg viewBox="0 0 24 24" width={28} height={28}><path d="M12 21s-7-4.4-9.3-8.6C1 9 3 5 6.6 5c2 0 3.4 1.2 4.4 2.6C12 6.2 13.4 5 15.4 5 19 5 21 9 19.3 12.4 17 16.6 12 21 12 21z" fill={C.red} /></svg>
          <svg viewBox="0 0 24 24" width={28} height={28}><path d="M21 12a8 8 0 1 1-3.3-6.5L21 4l-.8 4A8 8 0 0 1 21 12z" fill="none" stroke="#111" strokeWidth={2} /></svg>
          <svg viewBox="0 0 24 24" width={28} height={28}><path d="M3 11 21 3l-6 18-3-7z" fill="none" stroke="#111" strokeWidth={2} strokeLinejoin="round" /></svg>
          <div style={{flex: 1}} />
          <svg viewBox="0 0 24 24" width={28} height={28}><path d="M6 3h12v18l-6-4-6 4z" fill="none" stroke="#111" strokeWidth={2} strokeLinejoin="round" /></svg>
        </div>
        <div style={{padding: '0 16px 12px', fontFamily: RX, fontWeight: 600, fontSize: 18, color: '#111'}}>12,480 views · 0 messages</div>
      </div>
      <svg width={500} height={500} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', filter: `drop-shadow(0 0 10px ${C.red}aa)`}}>
        <line x1={-20} y1={-20} x2={-20 + 540 * a} y2={-20 + 540 * a} stroke={C.red} strokeWidth={8} strokeLinecap="round" opacity={a > 0 ? 1 : 0} />
        <line x1={520} y1={-20} x2={520 - 540 * b} y2={-20 + 540 * b} stroke={C.red} strokeWidth={8} strokeLinecap="round" opacity={b > 0 ? 1 : 0} />
      </svg>
    </div>
  );
};

const Notif: React.FC<{f: number; at: number; name: string; text: string; slot: number; slots: number[]}> = ({f, at, name, text, slot, slots}) => {
  if (f < at) return null;
  const s = sp(f, at, {damping: 14, stiffness: 160});
  // pushed down by the cards that arrive after it
  const push = slots.filter((t) => t > at && f >= t).length;
  const ps = slots.filter((t) => t > at).reduce((acc, t) => acc + sp(f, t, {damping: 14, stiffness: 160}), 0);
  return (
    <div style={{position: 'absolute', left: 540, top: 760 + ps * 236, width: 800, transform: `translate(-50%, -50%) translateY(${(1 - s) * -420}px) scale(${(0.5 + 0.5 * s) * (1 - 0.04 * ps)}) rotate(${(1 - s) * -10}deg)`,
      opacity: clamp(s * 3) * (1 - 0.15 * push), zIndex: slot + 1, background: 'rgba(255,255,255,0.97)', borderRadius: 38, padding: '24px 30px 28px',
      boxShadow: '0 30px 60px rgba(31,21,16,0.2), 0 2px 6px rgba(31,21,16,0.08)', direction: 'rtl'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, direction: 'ltr', fontFamily: RX, fontWeight: 500, fontSize: 24, color: '#8a8178', letterSpacing: '0.06em'}}>
        <div style={{width: 44, height: 44, borderRadius: 12, background: 'radial-gradient(circle at 30% 107%, #fdf497 0%, #fd5949 45%, #d6249f 60%, #285AEB 90%)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 22, height: 22, borderRadius: 7, border: '3px solid #fff'}} />
        </div>
        INSTAGRAM<div style={{flex: 1}} />now
      </div>
      <div style={{marginTop: 12, fontFamily: RX, fontWeight: 600, fontSize: 38, color: C.ink, textAlign: 'right'}}>{name}</div>
      <div style={{marginTop: 4, fontFamily: RX, fontWeight: 400, fontSize: 36, color: 'rgba(31,21,16,0.75)', textAlign: 'right'}}>{text}</div>
    </div>
  );
};

const Chevrons: React.FC<{f: number; at: number; x: number; y: number}> = ({f, at, x, y}) => {
  if (f < at) return null;
  const o = prog(f, at, at + 8);
  return (
    <div style={{position: 'absolute', left: x - 110, top: y, opacity: o}}>
      {[0, 1, 2, 3].map((i) => {
        const p = ((f - at) / 18 + i / 4) % 1;
        return <svg key={i} viewBox="0 0 220 120" width={220} height={120} style={{position: 'absolute', left: 0, top: 260 - p * 520, opacity: Math.sin(Math.PI * p) * 0.6}}>
          <path d="M20 100 L110 20 L200 100" fill="none" stroke={C.peach} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" /></svg>;
      })}
    </div>
  );
};

const Circle: React.FC<{f: number; at: number; x: number; y: number; text: string; size?: number; icon?: string}> = ({f, at, x, y, text, size = 300, icon}) => {
  if (f < at) return null;
  const s = sp(f, at, {damping: 10, stiffness: 190});
  return (
    <div style={{position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 35% 30%, ${C.orange2}, ${C.orange})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: AR, fontWeight: 800, fontSize: size * 0.17,
      boxShadow: '0 24px 50px rgba(226,84,27,0.35)', transform: `scale(${s}) translateY(${Math.sin((f - at) / 13) * 6}px)`}}>
      {text}
      {icon && <Img src={emoji(icon)} style={{position: 'absolute', width: size * 0.45, height: size * 0.45, left: -size * 0.12, bottom: -size * 0.1,
        transform: `scale(${sp(f, at + 6, {damping: 8, stiffness: 200})}) rotate(-12deg)`, filter: 'drop-shadow(0 12px 16px rgba(0,0,0,0.25))'}} />}
    </div>
  );
};

const Logo: React.FC<{f: number; at: number; size?: number}> = ({f, at, size = 150}) => {
  const letters = 'allawi'.split('');
  const dot = sp(f, at + letters.length * 2 + 4, {damping: 8, stiffness: 220});
  const psd = sp(f, at + letters.length * 2 + 8, {damping: 12, stiffness: 200});
  return (
    <div style={{display: 'flex', alignItems: 'baseline', direction: 'ltr', fontFamily: RX, fontWeight: 600, fontSize: size, color: C.ink, lineHeight: 1}}>
      {letters.map((l, i) => {
        const s = sp(f, at + i * 2, {damping: 11, stiffness: 240});
        return <span key={i} style={{display: 'inline-block', opacity: clamp(s * 3), transform: `translateY(${(1 - s) * 60}px)`}}>{l}</span>;
      })}
      <span style={{display: 'inline-block', width: size * 0.22, height: size * 0.22, borderRadius: '50%', background: C.orange, margin: `0 ${size * 0.04}px`,
        transform: `translateY(${(1 - dot) * -300}px) scale(${0.4 + 0.6 * dot})`, opacity: clamp(dot * 4)}} />
      <span style={{display: 'inline-block', fontFamily: MONO, fontWeight: 500, color: C.orange, fontSize: size * 0.82, opacity: clamp(psd * 3), transform: `translateX(${(1 - psd) * -60}px)`}}>psd</span>
    </div>
  );
};

// ================================================================== scenes (local frames)
// 1. dark: «تصرف على الإعلان..» megaphone, counters, «وتجيك آلاف المشاهدات»
const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene dark len={100} enter="none">
      <Particles f={f} from={0} to={40} />
      <Count f={f} at={40} from={1240} to={8930} x={420} y={250} dur={55} />
      <Count f={f} at={44} from={320} to={2750} x={-120} y={1350} dur={55} drift={-0.5} />
      <Tile f={f} at={4} x={540} y={980} icon="megaphone" size={330} out={40} />
      <At x={540} y={700}><Lead f={f} at={2} text="تصرف على الإعلان.." size={64} out={40} /></At>
      <At x={540} y={940}><Pill f={f} at={46} text="وتجيك آلاف المشاهدات" size={56} spark /></At>
      <At x={540} y={1090}><Lead f={f} at={68} text="بس.." size={70} weight={600} color={C.cream} /></At>
    </Scene>
  );
};
// 2. light: «ولا رسالة وحدة / ولا طلب» bubbles, then the post crossed out: «المشكلة» «مو» «بالإعلان»
const S2: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene len={106}>
      <Icon f={f} at={4} x={180} y={560} name="red_question_mark" size={170} out={38} />
      <Icon f={f} at={14} x={880} y={1320} name="red_question_mark" size={210} rot={30} out={38} />
      <At x={600} y={860}><Bubble f={f} at={2} text="ولا رسالة وحدة" dark side="right" out={40} size={56} /></At>
      <At x={470} y={1010}><Bubble f={f} at={12} text="ولا طلب!" side="left" out={40} size={56} /></At>
      <At x={540} y={960}><InstaCard f={f} at={44} words={[[50, 'المشكلة'], [64, 'مو'], [76, 'بالإعلان']]} crossAt={86} /></At>
    </Scene>
  );
};
// 3. dark: «المشكلة بالتصميم» [ما يوقّف أحد], then the sleepy scroller: «الناس تسكرول بسرعة / وإذا تصميمك ما وقّفهم / يعبــرون»
const S3: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene dark len={112}>
      <Swoosh f={f} at={0} d="M1180 300 C 760 520, 420 300, -120 700" width={46} />
      <At x={540} y={830}><Lead f={f} at={4} text="المشكلة بالتصميم.." size={56} out={46} /></At>
      <At x={540} y={960}><div style={{opacity: outK(f, 46)}}><Mark f={f} at={14} text="ما يوقّف أحد" size={104} /></div></At>
      <Tile f={f} at={52} x={540} y={720} icon="sleeping_face" size={300} rot={22} />
      <At x={540} y={950}><Pill f={f} at={60} text="الناس تسكرول بسرعة" size={50} /></At>
      <At x={540} y={1060}><Lead f={f} at={70} text="وإذا تصميمك ما وقّفهم" size={44} /></At>
      <At x={540} y={1190}><Stretch f={f} at={80} pre="يعبـ" post="رون" size={128} /></At>
      <Swoosh f={f} at={92} d="M-140 1500 C 300 1300, 700 1800, 1220 1380" width={34} dur={18} />
    </Scene>
  );
};
// 4. dark: «فكرة» «كتابة» «تصميم», the work tile flicks through real ads, then «48 HRS» + «تستلمه خلال يومين»
const WORDS: [number, string][] = [[2, 'فكرة'], [12, 'كتابة'], [22, 'تصميم']];
const S4: React.FC = () => {
  const f = useCurrentFrame();
  let cur: [number, string] | null = null;
  WORDS.forEach((w) => { if (f >= w[0] && f < 34) cur = w; });
  const c = cur as [number, string] | null;
  const hrs = sp(f, 74, {damping: 13, stiffness: 170});
  return (
    <Scene dark len={124} exit={false}>
      {c && <At x={540} y={960}><Bold f={f} at={c[0]} text={c[1]} size={150} /></At>}
      {c && <At x={540} y={1120}><div style={{fontFamily: MONO, fontSize: 30, color: 'rgba(251,243,230,0.5)', direction: 'ltr', letterSpacing: '0.2em'}}>{['IDEA', 'COPY', 'DESIGN'][WORDS.indexOf(c)]}</div></At>}
      <Tile f={f} at={34} x={540} y={860} size={420} pics={['sala', 'miswag', 'baly', 'gift', 'after']} rot={-14} to={{at: 66, x: 300, y: 640, s: 0.62}} />
      <At x={540} y={1250}><div style={{opacity: 1 - prog(f, 62, 68)}}><Lead f={f} at={46} text="بأسلوب يخلي الناس توقف" size={48} /></div></At>
      {f >= 74 && (
        <div style={{position: 'absolute', left: 560, top: 520, display: 'flex', alignItems: 'baseline', direction: 'ltr', opacity: clamp(hrs * 3), transform: `scale(${0.6 + 0.4 * hrs})`, transformOrigin: '0 50%'}}>
          <span style={{fontFamily: AR, fontWeight: 800, fontSize: 210, color: C.cream, lineHeight: 1}}>{Math.round(48 * prog(f, 74, 96, Easing.out(Easing.cubic)))}</span>
          <span style={{fontFamily: AR, fontWeight: 800, fontSize: 64, color: 'rgba(240,122,46,0.6)', marginLeft: 10}}>HRS</span>
        </div>
      )}
      <At x={700} y={850}><Pill f={f} at={84} text="وتستلمه خلال يومين" size={46} /></At>
      <Icon f={f} at={78} x={900} y={1420} name="gear" size={320} spin={1.6} />
      <Icon f={f} at={84} x={740} y={1560} name="hourglass_not_done" size={150} rot={20} />
      <Swoosh f={f} at={70} d="M-200 1250 C 200 1120, 380 1380, 760 1300" width={30} dur={22} />
    </Scene>
  );
};
// 5. light: «دزلي صورة منتجك» folder, «والنتيجة؟» notifications stack, rotated pill «رسايل أكثر» + chevrons
const SLOTS = [44, 58, 72];
const S5: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Scene len={140} enter="circle">
      <Icon f={f} at={6} x={540} y={760} name="camera_with_flash" size={260} out={36} />
      <At x={540} y={960}><div style={{opacity: outK(f, 36)}}><Pill f={f} at={12} text="دزلي صورة منتجك" size={54} fill={C.orange2} color="#fff" stroke="#fff" /></div></At>
      <At x={540} y={1090}><Lead f={f} at={22} text="وأرجعهالك إعلان يبيع" size={50} color={C.soft} out={36} /></At>
      <At x={540} y={540}><Lead f={f} at={40} text="والنتيجة؟" size={64} weight={600} color={C.ink} out={96} /></At>
      {f < 104 && <div style={{opacity: outK(f, 96)}}>
        <Notif f={f} at={44} slot={0} slots={SLOTS} name="زبون جديد" text="شكد سعر التوصيل؟ 😍" />
        <Notif f={f} at={58} slot={1} slots={SLOTS} name="أم علي" text="أريد أطلب ثنين" />
        <Notif f={f} at={72} slot={2} slots={SLOTS} name="مصطفى" text="وين موقعكم بالضبط؟" />
      </div>}
      <Chevrons f={f} at={100} x={540} y={760} />
      <At x={540} y={960}><Pill f={f} at={104} text="رسايل أكثر" size={74} rot={-62} fill={C.orange2} color="#fff" stroke="#fff" /></At>
      <Icon f={f} at={110} x={820} y={1300} name="envelope_with_arrow" size={180} />
    </Scene>
  );
};
// 6. light: rising graph + «مبيعات أكثر», circles «متابعين» «طلبات»
const S6: React.FC = () => {
  const f = useCurrentFrame();
  const g = prog(f, 4, 34, Easing.bezier(0.3, 0, 0.2, 1));
  const pts = [[40, 1560], [210, 1300], [330, 1420], [520, 1090], [650, 1230], [840, 860], [1040, 600]];
  const d = 'M' + pts.map((p) => p.join(' ')).join(' L');
  return (
    <Scene len={104}>
      <At x={540} y={520}><div style={{fontFamily: AR, fontWeight: 900, fontSize: 150, color: 'rgba(31,21,16,0.07)', whiteSpace: 'nowrap', transform: `translateX(${(1 - g) * 80}px)`}}>مبيعات أكثر</div></At>
      <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
        <path d={d} fill="none" stroke="rgba(240,122,46,0.55)" strokeWidth={34} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
        <path d={d} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - g} />
      </svg>
      <At x={540} y={700}><Lead f={f} at={8} text="مع تصميم يوقّف الناس" size={50} color={C.soft} /></At>
      <At x={540} y={800}><Bold f={f} at={14} text="تزيد مبيعاتك" size={104} color={C.ink} /></At>
      <Circle f={f} at={40} x={300} y={1180} text="متابعين" icon="fire" />
      <Circle f={f} at={50} x={780} y={1420} text="طلبات" size={330} icon="money_bag" />
      <Swoosh f={f} at={60} d="M1180 1000 C 900 1150, 700 900, 380 1650" width={26} dur={20} />
    </Scene>
  );
};
// 7. light: offer + logo + before/after
const S7: React.FC = () => {
  const f = useCurrentFrame();
  const ba = sp(f, 52, {damping: 13, stiffness: 140}), ba2 = sp(f, 60, {damping: 13, stiffness: 140});
  const arrow = prog(f, 66, 82, expo);
  return (
    <Scene len={224} exit={false}>
      <At x={540} y={420}><Bold f={f} at={4} text="راسلني هسه" size={96} color={C.ink} /></At>
      <At x={540} y={600}><Logo f={f} at={14} /></At>
      <At x={540} y={770}><div style={{display: 'flex', alignItems: 'baseline', gap: 14, fontFamily: RX, fontWeight: 500, fontSize: 48, color: C.ink, direction: 'rtl',
        opacity: prog(f, 34, 44), transform: `translateY(${(1 - prog(f, 34, 46, expo)) * 30}px)`}}>
        التصميم يبدي من <b style={{fontFamily: AR, fontWeight: 900, fontSize: 70, color: C.orange}}>14 ألف</b></div></At>
      {/* before / after */}
      <div style={{position: 'absolute', left: 600, top: 930, width: 400, transform: `translateX(${(1 - ba) * 600}px) rotate(${3 + (1 - ba) * 12}deg)`, opacity: clamp(ba * 3)}}>
        <div style={{fontFamily: RX, fontWeight: 600, fontSize: 40, color: 'rgba(31,21,16,0.55)', textAlign: 'right', marginBottom: 12}}>قبل</div>
        <div style={{background: '#2a1a10', borderRadius: 26, padding: 14, boxShadow: '0 26px 50px rgba(31,21,16,0.3)'}}>
          <Img src={img('before')} style={{display: 'block', width: '100%', borderRadius: 14}} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 90, top: 900, width: 360, transform: `translateX(${(1 - ba2) * -600}px) rotate(${-3 - (1 - ba2) * 12}deg)`, opacity: clamp(ba2 * 3)}}>
        <div style={{fontFamily: RX, fontWeight: 700, fontSize: 40, color: C.orange, textAlign: 'right', marginBottom: 12}}>بعد</div>
        <div style={{background: '#2a1a10', borderRadius: 26, padding: 14, boxShadow: '0 30px 60px rgba(31,21,16,0.35)'}}>
          <Img src={img('after')} style={{display: 'block', width: '100%', borderRadius: 14}} />
        </div>
      </div>
      <svg viewBox="0 0 160 120" width={160} height={120} style={{position: 'absolute', left: 470, top: 1250}}>
        <path d="M150 20 C 140 80, 80 108, 20 92" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrow} />
        <path d="M44 72 L18 92 L46 110" fill="none" stroke={C.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" opacity={clamp((arrow - 0.85) * 7)} />
      </svg>
      <At x={540} y={1530}><Pill f={f} at={90} text="الأسعار كلها بالهايلايت 📌" size={44} spark /></At>
    </Scene>
  );
};

// ================================================================== timeline
// [from, length, scene]; scenes overlap by a few frames where a wipe covers the cut
const TL: [number, number, React.FC][] = [[0, 100, S1], [96, 106, S2], [198, 112, S3], [306, 124, S4], [416, 140, S5], [552, 104, S6], [586 + 64, 160, S7]];

// sweeping strokes on the cuts
const Cuts: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <Swoosh f={f} at={88} d="M-200 1600 C 300 1200, 600 1500, 1300 300" width={150} dur={16} len={0.6} />
      <Swoosh f={f} at={190} d="M1300 1500 C 700 1100, 500 1500, -200 200" width={190} dur={16} len={0.6} color={C.orange} />
      <Swoosh f={f} at={298} d="M-200 400 C 400 700, 700 300, 1300 1400" width={120} dur={14} len={0.55} color={C.peach} />
      <Swoosh f={f} at={544} d="M1300 300 C 800 900, 400 600, -200 1700" width={170} dur={16} len={0.6} />
      <Swoosh f={f} at={642} d="M-200 1500 C 400 1100, 600 1600, 1300 600" width={150} dur={16} len={0.6} color={C.orange} />
    </AbsoluteFill>
  );
};

const FAST: [number, number][] = [[86, 104], [188, 206], [296, 312], [410, 432], [542, 560], [640, 660]];
const Blur: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <CameraMotionBlur shutterAngle={180} samples={FAST.some(([a, b]) => f >= a && f <= b) ? 4 : 1}>{children}</CameraMotionBlur>;
};

const CUES: [number, string, number][] = [
  [0, 'whoosh', 0.6], [4, 'pop', 0.8], [40, 'swoosh', 0.6], [46, 'pop', 0.7], [68, 'click', 0.6],
  [88, 'whoosh2', 0.9], [98, 'pop', 0.6], [108, 'pop', 0.6], [140, 'swoosh', 0.7], [146, 'click', 0.7], [160, 'click', 0.7], [172, 'click', 0.7], [182, 'thump', 0.9],
  [190, 'whoosh2', 0.9], [212, 'zoomin', 0.6], [250, 'pop', 0.8], [258, 'pop', 0.5], [278, 'swoosh', 0.6],
  [298, 'whoosh', 0.8], [308, 'click', 0.8], [318, 'click', 0.8], [328, 'boom', 0.7], [340, 'pop', 0.8], [372, 'swoosh', 0.7], [380, 'riser', 0.5], [390, 'pop', 0.7],
  [414, 'flood', 0.8], [428, 'pop', 0.7], [460, 'success', 0.6], [474, 'success', 0.6], [488, 'success', 0.6], [520, 'pop', 0.8], [530, 'whoosh', 0.5],
  [544, 'whoosh2', 0.9], [556, 'zoomin', 0.6], [592, 'pop', 0.8], [602, 'pop', 0.8],
  [642, 'whoosh2', 1], [654, 'boom', 0.8], [664, 'reveal', 0.7], [690, 'click', 0.5], [702, 'swoosh', 0.6], [710, 'swoosh', 0.6], [740, 'pop', 0.7],
];

export const AllawiKinetic: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    <Fonts />
    <Blur>
      <AbsoluteFill>
        {TL.map(([from, len, Comp], i) => (
          <Sequence key={i} from={from} durationInFrames={len} layout="none"><AbsoluteFill><Comp /></AbsoluteFill></Sequence>
        ))}
        <Cuts />
      </AbsoluteFill>
    </Blur>
    {CUES.map(([f, name, v], i) => (
      <Sequence key={i} from={f} layout="none"><Html5Audio src={staticFile(`sfx/${name}.wav`)} volume={v} /></Sequence>
    ))}
  </AbsoluteFill>
);
