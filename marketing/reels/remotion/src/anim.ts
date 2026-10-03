import {Easing, spring} from 'remotion';

export const FPS = 30;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const smooth = Easing.bezier(0.65, 0, 0.35, 1);          // a keyframe ease, the way an editor sets it
export const prog = (f: number, a: number, b: number, ease = smooth) => ease(clamp((f - a) / (b - a)));
export const sp = (f: number, start: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  f < start ? 0 : spring({frame: f - start, fps: FPS, config: {damping: 14, stiffness: 140, mass: 1, ...cfg}});

// keyframes [[frame, v1, v2, ...], ...] eased between; holds outside
export function track(f: number, keys: number[][], ease = smooth): number[] {
  if (f <= keys[0][0]) return keys[0].slice(1);
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (f <= b[0]) {
      const t = ease(clamp((f - a[0]) / (b[0] - a[0])));
      return a.slice(1).map((v, k) => v + (b[k + 1] - v) * t);
    }
  }
  return keys[keys.length - 1].slice(1);
}

// a short decaying shake after an impact frame
export const shake = (f: number, at: number, amp: number) => {
  const d = f - at;
  if (d < 0 || d > 14) return [0, 0];
  const k = amp * Math.exp(-d / 3.2);
  return [k * Math.sin(d * 2.7), k * Math.cos(d * 3.4) * 0.6];
};
