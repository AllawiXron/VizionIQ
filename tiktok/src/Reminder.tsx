import React, { useEffect } from 'react';
import { AbsoluteFill, Audio, Easing, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { Figure } from './Figure';
import { Words, useFade } from './Text';
import { BRAND, Episode } from './episodes';
import { loadFonts, SANS, SERIF } from './fonts';

export const W = 1080, H = 1920, FPS = 30, DUR = 450;
const GROUND = 1250; // horizon height; the figure stands on it at x = 540
const FIG = 1.95; // figure scale (it is ~100 units tall)
const F: [number, number] = [540, 1158]; // where the camera looks at the start (the figure's middle)
const START_ZOOM = 3;
const cream = '#f6ead2';
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;

// the timeline, in frames (30 fps)
const T = { intro: 34, list: 112, listStep: 30, out: 228, bridge: 246, bridgeOut: 298, climax: 292, verse: 306, end: 432 };

const horizon = (() => {
  // a hand-drawn horizon: straight runs with small kinks, passing exactly under the figure's feet
  const pts: [number, number][] = [];
  for (let x = -300; x <= 1380; x += 150) {
    const y = x === 600 || x === 450 ? GROUND : GROUND + (random('h' + x) - 0.5) * 16 - (x - 540) * 0.012;
    pts.push([x, y]);
  }
  pts.push([540, GROUND]);
  pts.sort((a, b) => a[0] - b[0]);
  return 'M' + pts.map((p) => p.join(' ')).join(' L');
})();

export const Reminder: React.FC<{ ep: Episode }> = ({ ep }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  useEffect(() => void loadFonts(), []);

  // camera: starts close on the figure, pulls back to the wide shot, then drifts in a touch
  const zoomOut = interpolate(frame, [0, 100], [START_ZOOM, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  const k = zoomOut * interpolate(frame, [100, DUR], [1, 1.035], clamp);
  const z = (zoomOut - 1) / (START_ZOOM - 1);
  const P = [F[0], F[1] + (1000 - F[1]) * z];
  const camera = `translate(${P[0] - F[0] * k}px, ${P[1] - F[1] * k}px) scale(${k})`;

  // the turn: dawn comes up, the figure lifts its head, the rain stops, the plant grows
  const dawn = spring({ frame: frame - T.climax, fps, config: { damping: 200 }, durationInFrames: 70 });
  const lift = spring({ frame: frame - T.climax - 6, fps, config: { damping: 200 }, durationInFrames: 44 });
  const breathe = Math.sin((frame / fps) * Math.PI * 2 * 0.22);
  const pose =
    ep.scene === 'dua' ? { slump: 0.35, dua: 1 } : ep.scene === 'rain' ? { slump: 0.85, dua: 0 } : { slump: 1, dua: 0 };

  // text envelopes
  const introO = useFade(T.list, 0.38, T.out);
  const listO = useFade(null, 1, T.out);
  const bridgeO = useFade(null, 1, T.bridgeOut, 12);
  const verseWords = ep.verse.map((l) => l.split(' ').length);
  const verseStarts = ep.verse.map((_, i) => T.verse + verseWords.slice(0, i).reduce((a, b) => a + b * 7 + 10, 0));
  const refAt = verseStarts[verseStarts.length - 1] + verseWords[verseWords.length - 1] * 7 + 18;
  const ornament = spring({ frame: frame - T.verse + 4, fps, config: { damping: 200 }, durationInFrames: 30 });
  const refP = spring({ frame: frame - refAt, fps, config: { damping: 200 }, durationInFrames: 30 });
  const verseTop = ep.verse.length > 1 ? 470 : 580;
  const LINE = 182;

  const black = Math.max(interpolate(frame, [0, 12], [1, 0], clamp), interpolate(frame, [T.end, DUR], [0, 1], clamp));

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', fontFamily: SANS, color: cream }}>
      <Audio src={staticFile('audio/ambience.wav')} volume={(f) => interpolate(f, [0, 15, T.climax, T.climax + 40, T.end, DUR], [0, 0.5, 0.5, 0.75, 0.75, 0], clamp)} />

      {/* the world, under the camera */}
      <AbsoluteFill style={{ transformOrigin: '0 0', transform: camera }}>
        <World frame={frame} dawn={dawn} ep={ep} />
        <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
          <defs>
            <filter id="rim" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feFlood floodColor="#ffd59a" floodOpacity={0.55 * dawn} />
              <feComposite in2="b" operator="in" />
              <feComponentTransfer><feFuncA type="linear" slope="1.06" intercept="-0.04" /></feComponentTransfer>
              <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="shadow"><stop offset="0" stopColor="#000" stopOpacity="0.8" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient>
          </defs>
          <ellipse cx={540} cy={GROUND + 3} rx={44} ry={7} fill="url(#shadow)" />
          {ep.scene === 'dua' && <Plant frame={frame} fps={fps} dawn={dawn} />}
          <g transform={`translate(540 ${GROUND}) scale(${FIG})`} filter="url(#rim)">
            <Figure slump={pose.slump} dua={pose.dua} lift={lift} open={pose.dua ? 0 : lift} breathe={breathe} />
          </g>
        </svg>
      </AbsoluteFill>

      {ep.scene === 'rain' && <Rain frame={frame} amount={1 - dawn} />}

      {/* words */}
      <div style={{ position: 'absolute', left: 150, right: 150, top: 512, opacity: introO }}>
        <Words text={ep.intro} start={T.intro} style={{ fontSize: 58, fontWeight: 500, letterSpacing: 0 }} />
      </div>
      {ep.list.map((t, i) => (
        <div key={i} style={{ position: 'absolute', left: 150, right: 150, top: 630 + i * 74, opacity: listO }}>
          <Words text={t} start={T.list + i * T.listStep} style={{ fontSize: 44, fontWeight: 300, opacity: 0.92 }} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 150, right: 150, top: 610, opacity: bridgeO }}>
        <Words text={ep.bridge} start={T.bridge} style={{ fontSize: 50, fontWeight: 400 }} />
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: verseTop - 128, textAlign: 'center', fontFamily: SERIF, fontSize: 84, lineHeight: 1, color: '#e9c98f',
        opacity: ornament * 0.9, transform: `scale(${0.8 + 0.2 * ornament})` }}>۞</div>
      {ep.verse.map((l, i) => (
        <div key={i} style={{ position: 'absolute', left: 90, right: 90, top: verseTop + i * LINE }}>
          <Words text={l} start={verseStarts[i]} stagger={7} rise={10}
            style={{ fontFamily: SERIF, fontSize: 96, fontWeight: 500, lineHeight: 1.6, color: cream, textShadow: '0 0 28px rgba(255, 210, 140, 0.35)' }} />
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: verseTop + ep.verse.length * LINE + 30, textAlign: 'center', direction: 'rtl',
        fontSize: 30, fontWeight: 300, letterSpacing: 1, color: 'rgba(246, 234, 210, 0.62)', opacity: refP, transform: `translateY(${(1 - refP) * 10}px)` }}>
        {ep.ref}
      </div>

      {/* brand, on the ground under the figure */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 1318, textAlign: 'center', direction: 'rtl', fontSize: 27, fontWeight: 400,
        color: 'rgba(246, 234, 210, 0.34)', letterSpacing: 1 }}>
        {BRAND.name} <span style={{ fontWeight: 300, fontSize: 22, direction: 'ltr', unicodeBidi: 'isolate' }}>· {BRAND.handle}</span>
      </div>

      {/* finish: vignette, moving grain, fade in/out (so it loops) */}
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 75% 62% at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)' }} />
      <AbsoluteFill style={{ backgroundImage: `url(${staticFile('grain.png')})`, backgroundSize: '384px 384px', mixBlendMode: 'screen', opacity: 0.05,
        backgroundPosition: `${Math.floor(random('gx' + frame) * 384)}px ${Math.floor(random('gy' + frame) * 384)}px` }} />
      <AbsoluteFill style={{ backgroundColor: '#000', opacity: black }} />
    </AbsoluteFill>
  );
};

const World: React.FC<{ frame: number; dawn: number; ep: Episode }> = ({ frame, dawn }) => {
  const stars = Array.from({ length: 90 }, (_, i) => {
    const x = random('sx' + i) * 1240 - 80, y = random('sy' + i) * 1080 + 20, r = 0.8 + random('sr' + i) * 1.6;
    const tw = 0.5 + 0.5 * Math.sin(frame * (0.04 + random('st' + i) * 0.08) + random('sp' + i) * 6.28);
    return <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={(0.12 + 0.45 * tw) * (1 - 0.45 * dawn)} />;
  });
  const dust = Array.from({ length: 46 }, (_, i) => {
    const x0 = random('dx' + i) * 1080, y0 = random('dy' + i) * 1150 + 300, r = 1.3 + random('dr' + i) * 2;
    const y = ((y0 - frame * (0.25 + random('dv' + i) * 0.35) - 300 + 1150 * 4) % 1150) + 300;
    const x = x0 + Math.sin(frame * 0.02 + i) * 12;
    return <circle key={i} cx={x} cy={y} r={r} fill={dawn > 0.05 ? '#ffe3b8' : '#fff'} opacity={0.12 + random('do' + i) * 0.3 + 0.15 * dawn} />;
  });
  const horizonColor = `rgba(${235 + 20 * dawn}, ${232 - 6 * dawn}, ${225 - 45 * dawn}, ${0.7 + 0.25 * dawn})`;
  return (
    <svg width={W} height={H} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" />
          <stop offset="0.55" stopColor="#020309" />
          <stop offset={GROUND / H} stopColor={`rgb(${6 + 40 * dawn}, ${7 + 22 * dawn}, ${14 + 6 * dawn})`} />
          <stop offset={GROUND / H} stopColor="#040405" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <radialGradient id="dawn" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#f2a35e" stopOpacity="0.22" />
          <stop offset="1" stopColor="#b05a2a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#sky)" />
      {stars}
      <ellipse cx={540} cy={GROUND} rx={980} ry={560} fill="url(#dawn)" opacity={dawn} />
      <ellipse cx={540} cy={GROUND} rx={380} ry={90} fill="url(#dawn)" opacity={dawn * 0.9} />
      <rect x={-300} y={GROUND} width={W + 600} height={H} fill="#000" opacity={0.55} />
      <path d={horizon} fill="none" stroke={horizonColor} strokeWidth={2.6} strokeLinejoin="round" />
      {dust}
    </svg>
  );
};

const Plant: React.FC<{ frame: number; fps: number; dawn: number }> = ({ frame, fps, dawn }) => {
  const g = spring({ frame: frame - T.climax - 8, fps, config: { damping: 200 }, durationInFrames: 60 });
  const leaf = (d: number) => spring({ frame: frame - T.climax - d, fps, config: { damping: 14, mass: 0.6 }, durationInFrames: 40 });
  const len = 96, l1 = leaf(34), l2 = leaf(46), bud = leaf(58);
  const c = '#f3efe6';
  return (
    <g transform={`translate(628 ${GROUND})`} fill="none" stroke={c} strokeLinecap="round">
      <path d="M0 0 C 3 -26, -9 -48, 1 -78" strokeWidth={4.4} strokeDasharray={len} strokeDashoffset={len * (1 - g)} />
      <path d="M-1 -34 C -14 -38, -24 -32, -28 -22 C -18 -20, -8 -24, -1 -34 Z" fill={c} stroke="none"
        transform={`translate(-1 -34) scale(${l1}) translate(1 34)`} />
      <path d="M0 -54 C 12 -62, 24 -58, 30 -48 C 18 -44, 8 -46, 0 -54 Z" fill={c} stroke="none"
        transform={`translate(0 -54) scale(${l2}) translate(0 54)`} />
      <circle cx={1} cy={-82} r={6 * bud} fill="#ffe2b0" stroke="none" opacity={0.9 * dawn} />
      <circle cx={1} cy={-82} r={22 * bud} fill="#ffd28a" stroke="none" opacity={0.18 * dawn} />
    </g>
  );
};

const Rain: React.FC<{ frame: number; amount: number }> = ({ frame, amount }) => (
  <svg width={W} height={H} style={{ position: 'absolute', inset: 0, opacity: amount }}>
    {Array.from({ length: 170 }, (_, i) => {
      const v = 34 + random('rv' + i) * 14, l = 28 + random('rl' + i) * 34;
      const y = ((random('ry' + i) * 2200 + frame * v) % 2200) - 140;
      const x = random('rx' + i) * 1240 - 80 - y * 0.09;
      return <line key={i} x1={x} y1={y} x2={x - l * 0.09} y2={y + l} stroke="#dfe6f2" strokeWidth={1.6} strokeLinecap="round" opacity={0.14 + random('ro' + i) * 0.22} />;
    })}
  </svg>
);
