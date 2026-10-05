import React from 'react';
import { AbsoluteFill } from 'remotion';
import { Figure } from './Figure';

// Profile picture: the figure on the horizon at dawn, looking up. Kept inside the centre circle Instagram/TikTok crop to.
export const Avatar: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: '#000' }}>
    <svg width={1080} height={1080}>
      <defs>
        <radialGradient id="dawn" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.75" />
          <stop offset="0.35" stopColor="#f2a35e" stopOpacity="0.3" />
          <stop offset="1" stopColor="#b05a2a" stopOpacity="0" />
        </radialGradient>
        <filter id="rim" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="10" result="b" />
          <feFlood floodColor="#ffd59a" floodOpacity="0.5" />
          <feComposite in2="b" operator="in" />
              <feComponentTransfer><feFuncA type="linear" slope="1.06" intercept="-0.04" /></feComponentTransfer>
          <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <ellipse cx={540} cy={790} rx={760} ry={430} fill="url(#dawn)" />
      <rect x={0} y={790} width={1080} height={290} fill="#000" opacity={0.6} />
      <path d="M0 796 L250 788 L420 794 L540 790 L700 786 L860 793 L1080 787" fill="none" stroke="rgba(255,232,190,0.95)" strokeWidth={5} strokeLinejoin="round" />
      <g transform="translate(540 790) scale(4.6)" filter="url(#rim)">
        <Figure slump={1} lift={1} dua={0} open={0.6} breathe={0} />
      </g>
    </svg>
  </AbsoluteFill>
);
