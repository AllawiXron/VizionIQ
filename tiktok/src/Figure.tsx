import React from 'react';

// A pictogram figure seen from the side, facing right, drawn from a few joint angles so it can move.
// Units: the figure is about 100 tall, feet at (0, 0), y down. Angles are in degrees from straight down
// (limbs) or straight up (spine, neck, head), positive = leaning forward (towards +x).
type Pose = {
  slump: number; // 0 upright … 1 shoulders forward, head bowed
  lift: number; // 0 … 1 the head comes up (undoes the bow, a little past upright: looking up)
  dua: number; // 0 arms down … 1 forearms raised in du'a
  open?: number; // 0 … 1 arms a little forward, palms open (when the head comes up)
  walk?: number; // 0 standing … 1 walking
  phase?: number; // walk cycle, radians (one step per π)
  breathe: number; // -1 … 1
};

const rad = (d: number) => (d * Math.PI) / 180;
const down = (p: [number, number], a: number, l: number): [number, number] => [p[0] + Math.sin(rad(a)) * l, p[1] + Math.cos(rad(a)) * l];
const up = (p: [number, number], a: number, l: number): [number, number] => [p[0] + Math.sin(rad(a)) * l, p[1] - Math.cos(rad(a)) * l];
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const line = (...pts: [number, number][]) => 'M' + pts.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(' L');

export const Figure: React.FC<Pose & { color?: string }> = ({ slump, lift, dua, breathe, open = 0, walk = 0, phase = 0, color = '#f3efe6' }) => {
  const bow = slump * (1 - lift) - lift * 0.35; // negative = looking up
  const hip: [number, number] = [0, -47 - walk * 1.6 * Math.abs(Math.cos(phase))]; // the body rises over each step
  const lean = mix(7 * slump, 1, lift);
  const shoulder = up(hip, lean, 33 + breathe * 0.5);
  const neck = up(shoulder, lean + 14 * Math.max(bow, 0), 4.5);
  const head = up(neck, lean + 40 * bow, 10.5);

  // legs swing in opposite phase; the knee bends while a leg swings forward
  const legs = [
    [3 + 6 * slump * (1 - lift), -2, 0],
    [-3, 1, Math.PI],
  ].map(([a1, a2, off]) => {
    const sw = Math.sin(phase + off) * walk;
    const thigh = a1 * (1 - walk) + 24 * sw;
    const shin = a2 * (1 - walk) + thigh - walk * 30 * Math.max(0, Math.cos(phase + off));
    const knee = down(hip, thigh, 24);
    return line(hip, knee, down(knee, shin, 23.5));
  });

  const arm = (side: number) => {
    const swing = -20 * Math.sin(phase + (side > 0 ? 0 : Math.PI)) * walk; // arms swing against the legs
    const ua = mix(mix(4 + 12 * slump * (1 - lift), 16, open), 62, dua) + side * 6 + swing;
    const fa = mix(mix(8 + 20 * slump * (1 - lift), 52, open), 158, dua) + side * 4;
    const elbow = down(shoulder, ua, 16);
    const hand = down(elbow, fa, 14.5);
    return { path: line(shoulder, elbow, hand), hand };
  };
  const back = arm(-1), front = arm(1);

  return (
    <g fill="none" stroke={color} strokeLinecap="round" strokeLinejoin="round">
      <path d={back.path} strokeWidth={7} opacity={0.75} />
      <path d={legs[1]} strokeWidth={8.4} opacity={0.75} />
      <path d={legs[0]} strokeWidth={8.4} />
      <path d={line(hip, shoulder)} strokeWidth={11} />
      <path d={line(shoulder, neck)} strokeWidth={7} />
      <circle cx={head[0]} cy={head[1]} r={8.6} fill={color} stroke="none" />
      <path d={front.path} strokeWidth={7} />
      {dua > 0.5 && <circle cx={front.hand[0]} cy={front.hand[1]} r={2.2} fill={color} stroke="none" opacity={(dua - 0.5) * 2} />}
    </g>
  );
};
