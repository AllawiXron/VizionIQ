/** Brand tokens, mirrored from the website's @theme so the ad and the site feel like one product. */
export const C = {
  navy: "#040e33",
  navyDeep: "#020823",
  navyLight: "#0b1d58",
  blue: "#2f6bff",
  blueLight: "#5b8eff",
  blueDeep: "#1a4fe0",
  sky: "#5fa8ff",
  accent: "#9bbcff",
  red: "#ff5c6c",
  green: "#3ddc97",
  white: "#ffffff",
  dim: "rgba(255,255,255,0.62)",
  faint: "rgba(255,255,255,0.38)",
};

export const FONT = `"Tajawal", system-ui, sans-serif`;

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * Scene timeline (frames @30fps). Neighbouring scenes overlap by ~10 frames so
 * one dissolves into the next instead of cutting.
 */
export const T = {
  hook: { from: 0, dur: 108 },
  pain: { from: 98, dur: 120 },
  advisor: { from: 208, dur: 314 },
  results: { from: 512, dur: 196 },
  cta: { from: 698, dur: 202 },
  total: 900,
};

/** Instagram Reels safe area: the caption, buttons and profile row cover the edges. */
export const SAFE = { top: 230, bottom: 400, side: 96 };
