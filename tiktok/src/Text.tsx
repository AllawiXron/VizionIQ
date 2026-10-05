import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// A line of Arabic that comes in word by word (fade, rise, un-blur), right to left.
export const Words: React.FC<{
  text: string;
  start: number;
  stagger?: number;
  rise?: number;
  style?: React.CSSProperties;
}> = ({ text, start, stagger = 4, rise = 18, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ direction: 'rtl', textAlign: 'center', ...style }}>
      {text.split(' ').map((w, i) => {
        const p = spring({ frame: frame - start - i * stagger, fps, config: { damping: 200 }, durationInFrames: 26 });
        return (
          <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', opacity: p, transform: `translateY(${(1 - p) * rise}px)`, filter: `blur(${(1 - p) * 9}px)` }}>
            {w + (i < text.split(' ').length - 1 ? ' ' : '')}
          </span>
        );
      })}
    </div>
  );
};

// Opacity envelope: in at `inAt` (handled by Words), dim to `dimTo` from `dimAt`, out at `outAt`.
export const useFade = (dimAt: number | null, dimTo: number, outAt: number | null, len = 16) => {
  const frame = useCurrentFrame();
  let o = 1;
  if (dimAt !== null) o *= interpolate(frame, [dimAt, dimAt + len], [1, dimTo], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  if (outAt !== null) o *= interpolate(frame, [outAt, outAt + len], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  return o;
};
