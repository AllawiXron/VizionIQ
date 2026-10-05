import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// When each word of a line lands (its sound plays on the same frame).
export const wordFrames = (text: string, start: number, stagger: number) => text.split(' ').map((_, i) => start + i * stagger);

// A line of Arabic that pops in word by word, right to left: each word grows from 55% with a little overshoot,
// un-blurs, and flashes a glow as it lands.
export const Words: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  soft?: boolean; // the verse: slower, rounder, no overshoot
  glow?: string;
  style?: React.CSSProperties;
}> = ({ text, start, stagger = 5, soft = false, glow = 'rgba(255, 220, 160, 0.55)', style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{ direction: 'rtl', textAlign: 'center', ...style }}>
      {words.map((w, i) => {
        const s = start + i * stagger;
        const p = spring({ frame: frame - s, fps, config: soft ? { damping: 16, mass: 0.9, stiffness: 90 } : { damping: 10, mass: 0.55, stiffness: 170 } });
        const flash = frame >= s ? Math.exp(-(frame - s) / (soft ? 9 : 5)) : 0;
        const o = interpolate(p, [0, 0.6], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: o,
            transform: `translateY(${(1 - p) * (soft ? 18 : 28)}px) scale(${(soft ? 0.8 : 0.55) + (soft ? 0.2 : 0.45) * p})`,
            filter: `blur(${Math.max(0, 1 - p) * 10}px)`,
            textShadow: `0 0 ${18 + 40 * flash}px ${glow.replace(/[\d.]+\)$/, `${0.25 + 0.6 * flash})`)}` }}>
            {w + (i < words.length - 1 ? ' ' : '')}
          </span>
        );
      })}
    </div>
  );
};

// Opacity envelope: dim to `dimTo` from `dimAt`, out at `outAt`.
export const useFade = (dimAt: number | null, dimTo: number, outAt: number | null, len = 14) => {
  const frame = useCurrentFrame();
  let o = 1;
  if (dimAt !== null) o *= interpolate(frame, [dimAt, dimAt + len], [1, dimTo], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (outAt !== null) o *= interpolate(frame, [outAt, outAt + len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return o;
};
