/**
 * Virtual camera over one big world canvas, the way After Effects explainer
 * ads are built: every phrase lives somewhere on the canvas and the camera
 * whips or glides to it. Velocity is exposed so the renderer can smear the
 * frame with directional motion blur during fast moves.
 */
export type Cam = { x: number; y: number; s: number; r: number };

type Move = { at: number; dur: number; to: Cam; ease?: "whip" | "glide" };

/** Strong ease-in-out: slow start, very fast middle, soft landing. */
function whip(t: number) {
  return t < 0.5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2;
}
/** Gentle ease-in-out for push-ins and drifts. */
function glide(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

/** World positions of each beat (centre of what the camera frames). */
export const P = {
  hook: { x: 0, y: 0 },
  punch: { x: -150, y: 1150 },
  cost: { x: 1250, y: 1050 },
  burn: { x: 1250, y: 1700 },
  advisor: { x: 3600, y: 400 },
  chat: { x: 3600, y: 1450 },
  reply: { x: 2500, y: 2600 },
  dinar: { x: 2500, y: 3250 },
  learn0: { x: 5200, y: 0 },
  learn1: { x: 5200, y: 700 },
  learn2: { x: 5200, y: 1400 },
  learn3: { x: 5200, y: 2100 },
  plan: { x: 8000, y: 0 },
  offer: { x: 8000, y: 1000 },
};

const at = (p: { x: number; y: number }, s = 1, r = 0): Cam => ({ x: p.x, y: p.y, s, r });

const START: Cam = at(P.hook, 1.04);

export const MOVES: Move[] = [
  { at: 50, dur: 13, to: at(P.punch, 1, -1.5), ease: "whip" },
  { at: 104, dur: 13, to: at(P.cost, 1, 1), ease: "whip" },
  { at: 160, dur: 18, to: at(P.burn, 1.06, 0), ease: "glide" },
  { at: 211, dur: 15, to: at(P.advisor, 1, 0), ease: "whip" },
  { at: 270, dur: 20, to: at(P.chat, 1.06, 0), ease: "glide" },
  { at: 378, dur: 13, to: at(P.reply, 1, -1), ease: "whip" },
  { at: 450, dur: 18, to: at(P.dinar, 1.05, 0), ease: "glide" },
  { at: 510, dur: 15, to: at(P.learn0, 1, 0), ease: "whip" },
  { at: 546, dur: 14, to: at(P.learn1, 1, 0), ease: "whip" },
  { at: 598, dur: 14, to: at(P.learn2, 1, 0), ease: "whip" },
  { at: 648, dur: 14, to: at(P.learn3, 1, 0), ease: "whip" },
  { at: 693, dur: 15, to: at(P.plan, 1.04, 0), ease: "whip" },
  { at: 768, dur: 22, to: at(P.offer, 1, 0), ease: "glide" },
];

/** Frames where the camera hits hard (a quick decaying shake). */
const SHAKES = [{ at: 61, amp: 18 }];

export function camAt(f: number): Cam {
  let c = START;
  for (const m of MOVES) {
    if (f <= m.at) break;
    const t = Math.min(1, (f - m.at) / m.dur);
    const e = (m.ease === "glide" ? glide : whip)(t);
    c = {
      x: c.x + (m.to.x - c.x) * e,
      y: c.y + (m.to.y - c.y) * e,
      s: c.s + (m.to.s - c.s) * e,
      r: c.r + (m.to.r - c.r) * e,
    };
  }
  // Constant, barely-there handheld drift so the frame is never static.
  let x = c.x + Math.sin(f / 47) * 9;
  let y = c.y + Math.cos(f / 61) * 7;
  const s = c.s * (1 + 0.012 * Math.sin(f / 83));
  for (const k of SHAKES) {
    const d = f - k.at;
    if (d >= 0 && d < 30) {
      const a = k.amp * Math.exp(-d / 5);
      x += Math.sin(d * 2.9) * a;
      y += Math.cos(d * 3.7) * a * 0.7;
    }
  }
  return { x, y, s, r: c.r };
}

/** Screen-space velocity (px per frame) — drives the motion blur. */
export function camVelocity(f: number) {
  const a = camAt(f - 0.5);
  const b = camAt(f + 0.5);
  return { vx: (b.x - a.x) * b.s, vy: (b.y - a.y) * b.s };
}
