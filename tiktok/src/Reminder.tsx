import React, { useEffect } from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Figure } from './Figure';
import { useFade, wordFrames, Words } from './Text';
import { BRAND, Episode } from './episodes';
import { loadFonts, SANS, SERIF } from './fonts';

export const W = 1080, H = 1920, FPS = 30, DUR = 480;
const HY = 1180; // the shoreline the figure stands on, in world units (= screen pixels in the wide shot)
const FIG = 2.05; // figure scale (it is ~100 units tall)
const C: [number, number] = [540, 960]; // screen centre
const BASE: [number, number] = [540, 910]; // where the camera rests in the wide shot
const cream = '#f6ead2';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// the timeline, in frames (30 fps)
export const T = {
  walkStop: 104, // the figure stops walking
  intro: 40, list: 140, listStep: 28, listOut: 222,
  bridge: 258, star: 268, bridgeOut: 298, riser: 240,
  impact: 312, // the camera lands back on the horizon: boom, flash, dawn
  verse: 322, end: 456,
};

// --- camera -------------------------------------------------------------------------------------------------
// keyframes: frame, centre x, centre y (world), zoom, roll (deg), easing into this key
const ease = {
  io: Easing.inOut(Easing.cubic),
  whip: Easing.bezier(0.16, 1, 0.3, 1),
  sine: Easing.inOut(Easing.sin),
  land: Easing.bezier(0.5, 0, 0.2, 1),
  inn: Easing.in(Easing.cubic),
};
const figX = (f: number) => interpolate(f, [0, T.walkStop], [270, 540], { ...clamp, easing: Easing.out(Easing.quad) });
type Key = [number, number, number, number, number, (t: number) => number];
const KEYS: Key[] = [
  [0, figX(0) + 34, HY - 106, 3.6, -2.4, ease.io], // close, tracking the walk
  [70, figX(70) + 22, HY - 112, 3.05, -1.2, ease.io],
  [110, 520, 918, 1.24, 0, ease.whip], // whip back: the first words land
  [222, 612, 926, 1.32, 0.9, ease.sine], // slow truck right, parallax
  [254, 590, 470, 1.12, -0.5, ease.io], // tilt up to the moon
  [300, 572, 430, 1.24, 0, ease.sine], // drift in while the riser builds
  [T.impact, 540, 905, 1, 0, ease.land], // drop back to the horizon
  [452, 540, 880, 1.08, 0, ease.sine], // slow push in on the verse
  [DUR, 540, 640, 1.1, 0, ease.inn], // tilt up into the sky as it fades
];
const camera = (f: number) => {
  let i = KEYS.findIndex((k) => k[0] > f);
  if (i === -1) i = KEYS.length - 1;
  if (i === 0) i = 1;
  const a = KEYS[i - 1], b = KEYS[i];
  const t = b[5](Math.min(1, Math.max(0, (f - a[0]) / (b[0] - a[0]))));
  const m = (j: number) => a[j] + (b[j] - a[j]) * t;
  return { x: m(1), y: m(2), k: m(3), r: m(4) };
};
// world -> screen for a layer at depth p (0 far … 1 the figure's plane … >1 in front)
const layer = (cam: { x: number; y: number; k: number }, p: number) => {
  const s = 1 + (cam.k - 1) * p, cx = BASE[0] + (cam.x - BASE[0]) * p, cy = BASE[1] + (cam.y - BASE[1]) * p;
  return `translate(${C[0] - cx * s} ${C[1] - cy * s}) scale(${s})`;
};

// --- the world, built once --------------------------------------------------------------------------------
const ridge = (seed: string, top: number, amp: number, step = 18) => {
  let d = `M-900 ${HY + 1600} L-900 ${top}`;
  for (let x = -900; x <= 2000; x += step) {
    const n = Math.sin(x * 0.004 + random(seed + 'a') * 6) * 0.55 + Math.sin(x * 0.011 + random(seed + 'b') * 6) * 0.3 + Math.sin(x * 0.031 + random(seed + 'c') * 6) * 0.15;
    d += ` L${x} ${(top - n * amp).toFixed(1)}`;
  }
  return d + ` L2000 ${HY + 1600} Z`;
};
const MOUNTAINS = [
  { p: 0.26, d: ridge('far', HY - 300, 90), fill: '#0d1531', fog: 'rgba(120,140,190,0.10)' },
  { p: 0.5, d: ridge('mid', HY - 175, 62, 14), fill: '#080d1f', fog: 'rgba(110,130,180,0.08)' },
  { p: 0.78, d: ridge('near', HY - 62, 26, 12), fill: '#04060f', fog: 'rgba(0,0,0,0)' },
];

export const Reminder: React.FC<{ ep: Episode }> = ({ ep }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useEffect(() => void loadFonts(), []);

  // camera, plus a punch on every list line and a shake when it lands
  const cam = camera(frame);
  const punch = ep.list.reduce((a, _, i) => {
    const s = T.list + i * T.listStep;
    return a + (frame >= s ? (1 - Math.exp(-(frame - s) / 2)) * Math.exp(-(frame - s) / 9) : 0);
  }, 0);
  cam.k *= 1 + 0.03 * punch;
  const since = frame - T.impact;
  const shake = since >= 0 ? 16 * Math.exp(-since / 7) : 0;
  const sx = shake * Math.sin(frame * 2.3), sy = shake * Math.cos(frame * 3.1);

  // the story beats
  const dawn = spring({ frame: since, fps, config: { damping: 200 }, durationInFrames: 60 });
  const flash = since >= 0 ? Math.exp(-since / 6) : 0;
  const lift = spring({ frame: since - 4, fps, config: { damping: 200 }, durationInFrames: 40 });
  const walk = interpolate(frame, [78, T.walkStop], [1, 0], clamp);
  const phase = ((figX(frame) - figX(0)) / 60) * Math.PI; // one step every 60 px
  const target = ep.scene === 'dua' ? 0.35 : ep.scene === 'rain' ? 0.9 : 1;
  const slump = interpolate(frame, [96, 130], [0.55, target], clamp);
  const dua = ep.scene === 'dua' ? spring({ frame: frame - 150, fps, config: { damping: 200 }, durationInFrames: 30 }) : 0;
  const breathe = Math.sin((frame / fps) * Math.PI * 2 * 0.22);
  const x = figX(frame);
  const hS = C[1] + (HY - cam.y) * cam.k; // the shoreline on screen

  // text
  const introO = useFade(T.list, 0.42, T.listOut);
  const listO = useFade(null, 1, T.listOut);
  const bridgeO = useFade(null, 1, T.bridgeOut, 10);
  const verseStarts: number[] = [];
  ep.verse.forEach((l, i) => verseStarts.push(i ? verseStarts[i - 1] + ep.verse[i - 1].split(' ').length * 8 + 12 : T.verse));
  const lastVerse = verseStarts[verseStarts.length - 1] + ep.verse[ep.verse.length - 1].split(' ').length * 8;
  const refP = spring({ frame: frame - lastVerse - 12, fps, config: { damping: 200 }, durationInFrames: 24 });
  const orn = spring({ frame: frame - T.verse + 6, fps, config: { damping: 12, mass: 0.6 }, durationInFrames: 30 });
  const verseTop = ep.verse.length > 1 ? 396 : 470, LINE = 178;
  const black = Math.max(interpolate(frame, [0, 10], [1, 0], clamp), interpolate(frame, [T.end, DUR], [0, 1], clamp));

  const scene = (mirror: boolean) => (
    <Scene cam={cam} frame={frame} dawn={dawn} ep={ep} x={x} mirror={mirror}
      figure={<Figure slump={slump} lift={lift} dua={dua} open={ep.scene === 'dua' ? 0 : lift} walk={walk} phase={phase} breathe={breathe} />} />
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: SANS, color: cream }}>
      <Sounds ep={ep} verseStarts={verseStarts} />

      {/* everything the camera sees; rolled as one, a little oversized so the corners never show */}
      <AbsoluteFill style={{ transform: `translate(${sx}px, ${sy}px) rotate(${cam.r}deg) scale(1.06)` }}>
        <AbsoluteFill style={{ clipPath: `inset(0 0 ${Math.max(0, H - hS)}px 0)` }}>{scene(false)}</AbsoluteFill>
        {/* the lake: the same scene mirrored at the shoreline, softened and darkened */}
        <AbsoluteFill style={{ clipPath: `inset(${Math.max(0, hS)}px 0 0 0)` }}>
          <AbsoluteFill style={{ transformOrigin: '0 0', transform: `translateY(${2 * hS}px) scaleY(-1)`, opacity: 0.5, filter: 'blur(1.6px)' }}>{scene(true)}</AbsoluteFill>
          <Lake frame={frame} hS={hS} dawn={dawn} rain={ep.scene === 'rain' ? 1 - dawn : 0} />
        </AbsoluteFill>
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
          <line x1={-100} x2={W + 100} y1={hS} y2={hS} stroke={`rgba(255, ${235 - 20 * dawn}, ${210 - 60 * dawn}, ${0.35 + 0.4 * dawn})`} strokeWidth={1.6} />
        </svg>
        <Bokeh cam={cam} frame={frame} dawn={dawn} />
      </AbsoluteFill>

      {ep.scene === 'rain' && <Rain frame={frame} amount={1 - dawn} />}

      {/* words */}
      <div style={{ position: 'absolute', left: 120, right: 120, top: 452, opacity: introO }}>
        <Words text={ep.intro} start={T.intro} style={{ fontSize: 70, fontWeight: 600 }} />
      </div>
      {ep.list.map((t, i) => (
        <div key={i} style={{ position: 'absolute', left: 120, right: 120, top: 572 + i * 82, opacity: listO }}>
          <Words text={t} start={T.list + i * T.listStep} style={{ fontSize: 54, fontWeight: 400 }} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 120, right: 120, top: 760, opacity: bridgeO }}>
        <Words text={ep.bridge} start={T.bridge} stagger={6} style={{ fontSize: 64, fontWeight: 500 }} />
      </div>
      <div style={{ position: 'absolute', left: -100, right: -100, top: verseTop - 160, height: ep.verse.length * LINE + 300, opacity: 0.8 * dawn,
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(10, 6, 16, 0.45), rgba(10, 6, 16, 0))' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, top: verseTop - 120, textAlign: 'center', fontFamily: SERIF, fontSize: 80, lineHeight: 1,
        color: '#ecc98a', opacity: Math.min(1, orn), transform: `scale(${0.5 + 0.5 * orn}) rotate(${(1 - orn) * 90}deg)`, textShadow: '0 0 30px rgba(255,200,120,0.6)' }}>۞</div>
      {ep.verse.map((l, i) => (
        <div key={i} style={{ position: 'absolute', left: 70, right: 70, top: verseTop + i * LINE }}>
          <Words text={l} start={verseStarts[i]} stagger={8} soft glow="rgba(255, 205, 130, 0.6)"
            style={{ fontFamily: SERIF, fontSize: 108, fontWeight: 600, lineHeight: 1.55, color: cream }} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: verseTop + ep.verse.length * LINE + 22, textAlign: 'center', direction: 'rtl',
        fontSize: 32, fontWeight: 300, letterSpacing: 1, color: 'rgba(246, 234, 210, 0.7)', opacity: refP, transform: `translateY(${(1 - refP) * 12}px)` }}>
        {ep.ref}
      </div>

      {/* brand, small, on the water */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1420, textAlign: 'center', direction: 'rtl', fontSize: 26, color: 'rgba(246, 234, 210, 0.3)', letterSpacing: 1,
        opacity: interpolate(frame, [206, 222, T.impact + 10, T.impact + 30], [1, 0, 0, 1], clamp) }}>
        {BRAND.name} <span style={{ fontWeight: 300, fontSize: 21, direction: 'ltr', unicodeBidi: 'isolate' }}>· {BRAND.handle}</span>
      </div>

      {/* finish */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 80% 62% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)' }} />
      <AbsoluteFill style={{ backgroundColor: '#ffe9c4', opacity: 0.45 * flash, mixBlendMode: 'screen' }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile('grain.png')})`, backgroundSize: '384px 384px', mixBlendMode: 'screen', opacity: 0.045,
        backgroundPosition: `${Math.floor(random('gx' + frame) * 384)}px ${Math.floor(random('gy' + frame) * 384)}px` }} />
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

// --- everything above the water ------------------------------------------------------------------------------
const Scene: React.FC<{ cam: { x: number; y: number; k: number }; frame: number; dawn: number; ep: Episode; x: number; figure: React.ReactNode; mirror: boolean }> = ({ cam, frame, dawn, ep, x, figure, mirror }) => {
  const L = (p: number) => layer(cam, p);
  const since = frame - T.impact;
  const sky = (a: number[], b: number[]) => `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * dawn)).join(',')})`;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sky${mirror}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky([1, 2, 8], [10, 12, 30])} />
          <stop offset="0.45" stopColor={sky([5, 9, 26], [40, 32, 58])} />
          <stop offset="0.7" stopColor={sky([13, 21, 48], [176, 104, 82])} />
          <stop offset="1" stopColor={sky([20, 30, 62], [244, 170, 104])} />
        </linearGradient>
        <radialGradient id={`sun${mirror}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1d6" stopOpacity="0.95" />
          <stop offset="0.2" stopColor="#ffcf8a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#e07a3c" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`moon${mirror}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff4dc" stopOpacity="0.32" />
          <stop offset="1" stopColor="#fff4dc" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`ray${mirror}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#ffe2b0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffe2b0" stopOpacity="0" />
        </linearGradient>
        <mask id={`cres${mirror}`}><circle cx={0} cy={0} r={46} fill="#fff" /><circle cx={19} cy={-11} r={42} fill="#000" /></mask>
        <filter id={`rim${mirror}`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="5" result="b" />
          <feFlood floodColor="#ffd59a" floodOpacity={0.6 * dawn} />
          <feComposite in2="b" operator="in" />
          <feComponentTransfer><feFuncA type="linear" slope="1.06" intercept="-0.04" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g transform={L(0)}><rect x={-700} y={-900} width={2500} height={HY + 1500} fill={`url(#sky${mirror})`} /></g>
      <g transform={L(0.04)}>
        {Array.from({ length: 130 }, (_, i) => {
          const tw = 0.5 + 0.5 * Math.sin(frame * (0.05 + random('st' + i) * 0.1) + random('sp' + i) * 6.28);
          return <circle key={i} cx={random('sx' + i) * 1700 - 310} cy={random('sy' + i) * 1050 - 250} r={0.7 + random('sr' + i) * 1.7} fill="#fff"
            opacity={(0.15 + 0.6 * tw) * (1 - 0.7 * dawn)} />;
        })}
      </g>
      <g transform={L(0.07)} opacity={1 - 0.55 * dawn}>
        <circle cx={812} cy={300} r={190} fill={`url(#moon${mirror})`} />
        <g transform="translate(812 300) rotate(-18)"><circle cx={0} cy={0} r={46} fill="#fbf1dc" mask={`url(#cres${mirror})`} /></g>
      </g>
      <ShootingStar frame={frame} cam={cam} />

      {/* dawn: the sun's glow and rays behind the far mountains */}
      <g transform={L(0.22)} opacity={dawn}>
        <g style={{ mixBlendMode: 'screen' }}>
          {Array.from({ length: 11 }, (_, i) => {
            const a = -75 + i * 15 + Math.sin(frame * 0.01 + i) * 2;
            return <path key={i} d="M-14 0 L14 0 L70 -1500 L-70 -1500 Z" fill={`url(#ray${mirror})`} opacity={0.35 * (0.5 + 0.5 * random('ray' + i))}
              transform={`translate(560 ${HY - 120}) rotate(${a})`} />;
          })}
        </g>
        <ellipse cx={560} cy={HY - 120} rx={720} ry={480} fill={`url(#sun${mirror})`} />
      </g>

      {MOUNTAINS.map((m, i) => (
        <g key={i} transform={L(m.p)}>
          <path d={m.d} fill={m.fill} />
          <rect x={-900} y={HY - 140 + i * 50} width={2900} height={170} fill={m.fog} style={{ filter: 'blur(30px)' }} />
          {/* the dawn catches the ridge */}
          <path d={m.d} fill="none" stroke="#ffc888" strokeOpacity={0.35 * dawn * (1 - i * 0.3)} strokeWidth={2} />
        </g>
      ))}

      {ep.scene === 'dawn' && since > 0 && <Birds frame={since} cam={cam} />}

      <g transform={L(1)}>
        {ep.scene === 'dua' && <Lanterns since={since} x={x} />}
        <g transform={`translate(${x} ${HY}) scale(${FIG})`} filter={`url(#rim${mirror})`}>{figure}</g>
      </g>
    </svg>
  );
};

const ShootingStar: React.FC<{ frame: number; cam: { x: number; y: number; k: number } }> = ({ frame, cam }) => {
  const t = (frame - T.star) / 18;
  if (t < 0 || t > 1.4) return null;
  const e = Math.min(t, 1), x = 980 - 620 * e, y = 160 + 300 * e;
  return (
    <g transform={layer(cam, 0.05)} opacity={t > 1 ? 1 - (t - 1) / 0.4 : 1}>
      <defs><linearGradient id="tail" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="1" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient></defs>
      <g transform={`translate(${x} ${y}) rotate(${(Math.atan2(-300, 620) * 180) / Math.PI})`}>
        <rect x={0} y={-1.6} width={260} height={3.2} rx={1.6} fill="url(#tail)" />
        <circle cx={0} cy={0} r={4} fill="#fff" />
      </g>
    </g>
  );
};

const Birds: React.FC<{ frame: number; cam: { x: number; y: number; k: number } }> = ({ frame, cam }) => (
  <g transform={layer(cam, 0.55)} fill="none" stroke="#1a1418" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    {Array.from({ length: 6 }, (_, i) => {
      const t = frame - 8 - i * 7;
      if (t < 0) return null;
      const x = -120 + t * (6.2 + random('bv' + i) * 2), y = HY - 430 - i * 26 + random('by' + i) * 60 + Math.sin(t * 0.08 + i) * 10;
      const w = Math.sin(t * 0.45 + i * 1.3) * 9, s = 0.8 + random('bs' + i) * 0.5;
      return <path key={i} transform={`translate(${x} ${y}) scale(${s})`} d={`M-14 ${-w} Q-7 ${-w * 0.2 - 4} 0 0 Q7 ${-w * 0.2 - 4} 14 ${-w}`} />;
    })}
  </g>
);

const Lanterns: React.FC<{ since: number; x: number }> = ({ since, x }) => (
  <g>
    {Array.from({ length: 16 }, (_, i) => {
      const t = since - 6 - i * 4;
      if (t < 0) return null;
      const r = 6 + random('lr' + i) * 9, x0 = x + (random('lx' + i) - 0.5) * 520;
      const y = HY - 8 - t * (2.2 + random('lv' + i) * 2.2), xx = x0 + Math.sin(t * 0.05 + i) * 16;
      // they fade before they reach the words
      const o = Math.min(1, t / 10) * (0.75 + 0.25 * Math.sin(t * 0.3 + i)) * Math.min(1, Math.max(0, (y - (HY - 480)) / 170));
      return (
        <g key={i} opacity={o}>
          <circle cx={xx} cy={y} r={r * 3.2} fill="#ffcf8a" opacity={0.12} />
          <circle cx={xx} cy={y} r={r} fill="#ffe2b0" />
        </g>
      );
    })}
  </g>
);

// --- the water ---------------------------------------------------------------------------------------------
const Lake: React.FC<{ frame: number; hS: number; dawn: number; rain: number }> = ({ frame, hS, dawn, rain }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0 }}>
    <defs>
      <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#02040b" stopOpacity="0.15" />
        <stop offset="1" stopColor="#010205" stopOpacity="0.85" />
      </linearGradient>
      <radialGradient id="streak" cx="0.5" cy="0" r="1" gradientTransform="translate(0.5 0) scale(0.18 1) translate(-0.5 0)">
        <stop offset="0" stopColor="#ffdcaa" stopOpacity="0.6" />
        <stop offset="0.6" stopColor="#ffcf8a" stopOpacity="0.12" />
        <stop offset="1" stopColor="#ffcf8a" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect x={0} y={hS} width={W} height={H} fill="url(#deep)" />
    {/* sunlight laid on the water */}
    <rect x={0} y={hS} width={W} height={H - hS} fill="url(#streak)" opacity={dawn * 0.8} />
    {/* calm ripple lines, closer together near the shore */}
    {Array.from({ length: 70 }, (_, i) => {
      const d = (i / 70) ** 1.8, y = hS + 6 + d * (H - hS);
      const len = 40 + random('ll' + i) * 220 * (0.4 + d), x = ((random('lx' + i) * 1400 + frame * (0.3 + d)) % 1400) - 160;
      return <line key={i} x1={x} x2={x + len} y1={y} y2={y} stroke={dawn > 0.1 ? '#ffe2b8' : '#c9d6f5'} strokeWidth={1 + d * 1.6} opacity={0.05 + 0.1 * random('lo' + i) + 0.06 * dawn} />;
    })}
    {/* rain rings */}
    {rain > 0 && Array.from({ length: 60 }, (_, i) => {
      const period = 26, t = (frame + random('rt' + i) * period) % period, gen = Math.floor((frame + random('rt' + i) * period) / period);
      const d = random(`rd${i}-${gen}`) ** 1.4, x = random(`rx${i}-${gen}`) * 1080, y = hS + 10 + d * (H - hS - 10);
      const r = (6 + 50 * (t / period)) * (0.3 + d);
      return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.22} fill="none" stroke="#dfe7f7" strokeWidth={1.4} opacity={(1 - t / period) * 0.35 * rain} />;
    })}
  </svg>
);

// soft out-of-focus dust in front of everything (moves fastest: depth)
const Bokeh: React.FC<{ cam: { x: number; y: number; k: number }; frame: number; dawn: number }> = ({ cam, frame, dawn }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible', filter: 'blur(3px)' }}>
    <g transform={layer(cam, 1.7)}>
      {Array.from({ length: 22 }, (_, i) => {
        const x = random('bx' + i) * 1500 - 200 + Math.sin(frame * 0.015 + i) * 30, y = ((random('by' + i) * 1700 - frame * (0.4 + random('bv' + i) * 0.6) + 3400) % 1700) + 200;
        return <circle key={i} cx={x} cy={y} r={3 + random('br' + i) * 7} fill={dawn > 0.1 ? '#ffe0b0' : '#dfe8ff'} opacity={0.08 + random('bo' + i) * 0.16} />;
      })}
    </g>
  </svg>
);

const Rain: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: amount }}>
    {Array.from({ length: 190 }, (_, i) => {
      const v = 36 + random('rv' + i) * 16, l = 30 + random('rl' + i) * 40;
      const y = ((random('ry' + i) * 2200 + frame * v) % 2200) - 140;
      const x = random('rx' + i) * 1240 - 80 - y * 0.1;
      return <line key={i} x1={x} y1={y} x2={x - l * 0.1} y2={y + l} stroke="#dfe6f2" strokeWidth={1.7} strokeLinecap="round" opacity={0.12 + random('ro' + i) * 0.22} />;
    })}
  </svg>
);

// --- sound ---------------------------------------------------------------------------------------------------
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 1 }) => (
  <Sequence from={Math.round(at)} layout="none"><Audio src={staticFile(`sfx/${src}.wav`)} volume={volume} /></Sequence>
);

const Sounds: React.FC<{ ep: Episode; verseStarts: number[] }> = ({ ep, verseStarts }) => {
  // footsteps: one each time the walk cycle passes a step, softer as the figure slows
  const steps: number[] = [];
  for (let f = 1; f < T.walkStop; f++) {
    const a = Math.floor(((figX(f - 1) - figX(0)) / 60)), b = Math.floor(((figX(f) - figX(0)) / 60));
    if (b > a) steps.push(f);
  }
  // a pop for each word before the verse; within a line the pops climb
  const lines: [string, number, number][] = [[ep.intro, T.intro, 5], ...ep.list.map((t, i) => [t, T.list + i * T.listStep, 5] as [string, number, number]), [ep.bridge, T.bridge, 6]];
  const pops = lines.flatMap(([t, s, st], li) => wordFrames(t, s, st).map((f, wi) => ({ f, n: Math.min(8, 1 + wi + (li % 3)) })));
  const drops = ep.verse.flatMap((l, i) => wordFrames(l, verseStarts[i], 8)).map((f, i) => ({ f, n: 1 + (i % 4) }));
  return (
    <>
      <Audio src={staticFile('sfx/wind.wav')} volume={(f) => interpolate(f, [0, 12, T.impact, T.impact + 30, T.end, DUR], [0, 0.4, 0.55, 0.35, 0.35, 0], clamp)} />
      {ep.scene === 'rain' && <Audio src={staticFile('sfx/rain.wav')} volume={(f) => interpolate(f, [0, 12, T.impact, T.impact + 40], [0, 0.5, 0.5, 0], clamp)} />}
      {steps.map((f) => <Sfx key={'s' + f} at={f} src="step" volume={0.45 * interpolate(f, [0, 80, T.walkStop], [1, 1, 0.3], clamp)} />)}
      <Sfx at={66} src="whoosh" volume={0.55} />
      {pops.map(({ f, n }) => <Sfx key={'p' + f} at={f} src={`pop-${n}`} volume={0.6} />)}
      <Sfx at={218} src="whoosh" volume={0.45} />
      <Sfx at={T.star - 2} src="sparkle" volume={0.5} />
      <Sfx at={T.riser} src="riser" volume={0.42} />
      <Sfx at={T.impact - 14} src="whoosh" volume={0.32} />
      <Sfx at={T.impact} src="boom" volume={0.62} />
      {drops.map(({ f, n }) => <Sfx key={'d' + f} at={f} src={`drop-${n}`} volume={0.7} />)}
      <Sfx at={T.end - 6} src="whoosh" volume={0.3} />
    </>
  );
};
