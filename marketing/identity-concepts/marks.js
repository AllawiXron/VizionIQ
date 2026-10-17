// Logo drawings shared by every slide and mockup (SVG strings), plus the helper that builds the Arabic wordmarks.

// a dew drop with a glint of light (viewBox 0 0 40 52)
function nadaDrop({ ink = '#4a3029', glint = '#f6efe6' } = {}) {
  return `<svg viewBox="0 0 40 52" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 1 C 23 12, 37 22, 37 34 A17 17 0 0 1 3 34 C 3 22, 17 12, 20 1 Z" fill="${ink}" />
    <path d="M10.5 33 A10 10 0 0 0 16.5 43.5" fill="none" stroke="${glint}" stroke-width="2.6" stroke-linecap="round" />
  </svg>`;
}

// the letter wāw drawn as a rose in one fine line: a bud spiralling open inside two petals and a cup,
// the stem sweeping down to the left as the letter's tail, one leaf. (viewBox 0 0 200 200)
const GOLD_STOPS = [[0, '#8c6a3c'], [0.22, '#e8cd8e'], [0.42, '#b98f52'], [0.6, '#f4e2ad'], [0.8, '#a67c43'], [1, '#d9b877']];
function goldDefs(id) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">${GOLD_STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}" />`).join('')}</linearGradient>`;
}
function spiral(cx, cy, r0, r1, turns, a0) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, a = a0 + t * turns * Math.PI * 2, r = r0 + (r1 - r0) * t;
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L');
}
function roseParts(line) {
  return `<path d="${spiral(119, 58, 2.5, 13, 1.35, 3.4)}" ${line} />
    <path d="M100 44 C 106 33, 126 30, 138 40" ${line} />
    <path d="M136 50 C 143 64, 138 80, 120 85" ${line} />
    <path d="M102 54 C 97 68, 103 81, 120 85" ${line} />
    <path d="M92 44 C 83 70, 96 98, 120 99 C 144 99, 157 74, 147 46" ${line} />
    <path d="M120 99 C 125 128, 113 160, 52 176" ${line} />
    <path d="M115 140 C 126 124, 146 118, 162 121 C 155 138, 134 147, 115 140 Z" ${line} />`;
}
// the rose wāw alone (viewBox 0 0 200 200): the brand's symbol
function wardRose({ ink = '#5e1624', gold = false, stroke = 5.2, id = 'g' + Math.random().toString(36).slice(2, 7) } = {}) {
  const paint = gold ? `url(#${id})` : ink;
  const line = `fill="none" stroke="${paint}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${gold ? `<defs>${goldDefs(id)}</defs>` : ''}${roseParts(line)}</svg>`;
}
// the whole word «ورد» in the same fine line: the rose wāw, then rā and dāl drawn to match (viewBox 0 0 400 200)
function wardWordmark({ ink = '#5e1624', gold = false, stroke = 5.2, id = 'g' + Math.random().toString(36).slice(2, 7) } = {}) {
  const paint = gold ? `url(#${id})` : ink;
  const line = `fill="none" stroke="${paint}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round"`;
  return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">${gold ? `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="40" y1="20" x2="380" y2="190">${GOLD_STOPS.map(([o, c]) => `<stop offset="${o}" stop-color="${c}" />`).join('')}</linearGradient></defs>` : ''}
    <g transform="translate(200 0)">${roseParts(line)}</g>
    <path d="M226 118 C 231 138, 222 158, 182 170" ${line} />
    <path d="M128 96 C 140 108, 147 124, 142 140 C 138 150, 118 154, 82 152" ${line} />
  </svg>`;
}

// Arabic wordmark «ندى» with the nūn's dot replaced by the dew drop. The word is drawn on a canvas twice, with the
// dot (ن) and without it (U+066E, the dotless form); the difference is exactly where the font puts the dot, and the
// drop is placed there. Returns an element sized to the word (in CSS px for `size`).
function nadaWordmark({ family = "'El Messiri'", weight = 500, size = 120, ink = '#4a3029', glint = '#f6efe6', scale = 1.25 } = {}) {
  // canvas sizes must be whole pixels, or the pixel scan below reads the wrong rows
  const R = 3, fs = Math.round(size * R), w = Math.round(fs * 3.2), h = Math.round(fs * 2.4), base = Math.round(h * 0.72);
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  const draw = (s) => { g.clearRect(0, 0, w, h); g.font = `${weight} ${fs}px ${family}`; g.direction = 'rtl'; g.textAlign = 'center'; g.fillStyle = ink; g.fillText(s, w / 2, base); return g.getImageData(0, 0, w, h).data; };
  const withDot = draw('ندى'), bare = draw('\u066Eدى');
  let dx0 = w, dy0 = h, dx1 = 0, dy1 = 0, bx0 = w, by0 = h, bx1 = 0, by1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4 + 3;
    if (withDot[i] > 100 && bare[i] < 30) { dx0 = Math.min(dx0, x); dx1 = Math.max(dx1, x); dy0 = Math.min(dy0, y); dy1 = Math.max(dy1, y); }
    if (bare[i] > 30) { bx0 = Math.min(bx0, x); bx1 = Math.max(bx1, x); by0 = Math.min(by0, y); by1 = Math.max(by1, y); }
  }
  // the drop: twice the dot's width, its round end where the dot was, rising above it
  const dotW = dx1 - dx0, dcx = (dx0 + dx1) / 2, dcy = (dy0 + dy1) / 2;
  const dw = dotW * scale * 1.55, dh = dw * 1.3;
  const top = Math.min(by0, dcy - dh * 0.68), pad = fs * 0.04;
  const X0 = Math.floor(bx0 - pad), Y0 = Math.floor(top - pad), W = Math.ceil(bx1 - bx0 + 2 * pad), H = Math.ceil(by1 - Y0 + pad);
  const out = document.createElement('canvas');
  out.width = W; out.height = H;
  out.getContext('2d').drawImage(c, -X0, -Y0);
  const el = document.createElement('div');
  el.style.cssText = `position:relative; width:${W / R}px; height:${H / R}px; display:inline-block`;
  el.innerHTML = `<img src="${out.toDataURL()}" style="position:absolute; inset:0; width:100%; height:100%" />
    <div style="position:absolute; width:${dw / R}px; height:${dh / R}px; left:${(dcx - dw / 2 - X0) / R}px; top:${(dcy - dh * 0.66 - Y0) / R}px">${nadaDrop({ ink, glint })}</div>`;
  return el;
}

if (typeof module !== 'undefined') module.exports = { nadaDrop, wardRose, wardWordmark, goldDefs, GOLD_STOPS, nadaWordmark };
