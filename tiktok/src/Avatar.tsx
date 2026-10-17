import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Figure } from './Figure';

// Profile picture, in the look of the videos: crescent moon, mountains, the figure on the still lake at first light.
// Everything that matters sits inside the centre circle that TikTok and Instagram crop to.
const ridge = (top: number, amp: number, f: number, ph: number) => {
  let d = `M0 1080 L0 ${top}`;
  for (let x = 0; x <= 1080; x += 12) d += ` L${x} ${(top - (Math.sin(x * f + ph) * 0.6 + Math.sin(x * f * 2.7 + ph * 2) * 0.4) * amp).toFixed(1)}`;
  return d + ' L1080 1080 Z';
};
const HZ = 700;

const World: React.FC = () => (
  <>
    <rect width={1080} height={HZ} fill="url(#sky)" />
    <ellipse cx={540} cy={HZ - 60} rx={620} ry={360} fill="url(#sun)" />
    <g transform="translate(770 250) rotate(-18)"><circle r={150} fill="url(#moonglow)" /><circle r={52} fill="#fbf1dc" mask="url(#cres)" /></g>
    <path d={ridge(HZ - 150, 60, 0.006, 1)} fill="#0d1531" />
    <path d={ridge(HZ - 80, 36, 0.011, 3)} fill="#080d1f" />
    <path d={ridge(HZ - 26, 14, 0.02, 5)} fill="#04060f" />
    <g transform={`translate(540 ${HZ}) scale(4.2)`} filter="url(#rim)"><Figure slump={1} lift={1} dua={0} open={0.6} breathe={0} /></g>
  </>
);

export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <svg width={1080} height={1080}>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#070a1c" /><stop offset="0.55" stopColor="#2a2340" /><stop offset="1" stopColor="#f0a868" />
        </linearGradient>
        <radialGradient id="sun"><stop offset="0" stopColor="#fff1d6" stopOpacity="0.9" /><stop offset="0.25" stopColor="#ffcf8a" stopOpacity="0.45" /><stop offset="1" stopColor="#e07a3c" stopOpacity="0" /></radialGradient>
        <radialGradient id="moonglow"><stop offset="0" stopColor="#fff4dc" stopOpacity="0.3" /><stop offset="1" stopColor="#fff4dc" stopOpacity="0" /></radialGradient>
        <mask id="cres"><circle r={52} fill="#fff" /><circle cx={21} cy={-12} r={47} fill="#000" /></mask>
        <filter id="rim" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="6" result="b" /><feFlood floodColor="#ffd59a" floodOpacity="0.55" /><feComposite in2="b" operator="in" />
          <feComponentTransfer><feFuncA type="linear" slope="1.06" intercept="-0.04" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="deep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#02040b" stopOpacity="0.2" /><stop offset="1" stopColor="#010205" stopOpacity="0.9" /></linearGradient>
        <clipPath id="above"><rect width={1080} height={HZ} /></clipPath>
      </defs>
      <g clipPath="url(#above)"><World /></g>
      {/* the lake */}
      <g transform={`translate(0 ${2 * HZ}) scale(1 -1)`} opacity={0.5} style={{ filter: 'blur(2px)' }}><g clipPath="url(#above)"><World /></g></g>
      <rect y={HZ} width={1080} height={1080 - HZ} fill="url(#deep)" />
      <line x1={0} x2={1080} y1={HZ} y2={HZ} stroke="rgba(255,225,180,0.7)" strokeWidth={2} />
    </svg>
  </AbsoluteFill>
);
