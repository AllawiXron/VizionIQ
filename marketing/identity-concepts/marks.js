// The two logo marks, drawn as SVG strings (viewBox 0 0 200 200) so every slide uses the exact same drawing.

// نَدى: the letter nūn as a bowl, with its dot drawn as a drop of dew (and a glint of light on it).
function nadaMark({ ink = '#4a3029', glint = '#f6efe6', stroke = 20 } = {}) {
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="M30 96 C 26 150, 70 170, 100 170 C 136 170, 176 150, 168 88" fill="none" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" />
    <path d="M100 26 C 106 44, 120 58, 120 78 A20 20 0 0 1 80 78 C 80 58, 94 44, 100 26 Z" fill="${ink}" />
    <path d="M89 76 A11 11 0 0 0 96 88" fill="none" stroke="${glint}" stroke-width="4" stroke-linecap="round" />
  </svg>`;
}

// وَرد: the letter wāw drawn as a rose: its round head is a bud spiralling open, its tail the stem, with one leaf.
function wardPath() {
  const cx = 110, cy = 72, turns = 1.85, r0 = 3, r1 = 40, a0 = 1.3;
  const pts = [];
  const n = 120;
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = a0 + t * turns * Math.PI * 2, r = r0 + (r1 - r0) * Math.pow(t, 0.85);
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    d += ` C${(p1[0] + (p2[0] - p0[0]) / 6).toFixed(1)} ${(p1[1] + (p2[1] - p0[1]) / 6).toFixed(1)}, ${(p2[0] - (p3[0] - p1[0]) / 6).toFixed(1)} ${(p2[1] - (p3[1] - p1[1]) / 6).toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  const [ex, ey] = pts[pts.length - 1];
  // the tail: leaves the bud on its right and sweeps down to the left, like the wāw's tail
  d += ` C ${(ex + 6).toFixed(1)} ${(ey + 40).toFixed(1)}, ${(ex - 10).toFixed(1)} ${(ey + 82).toFixed(1)}, 46 ${(ey + 94).toFixed(1)}`;
  return { d, end: [ex, ey] };
}
function wardMark({ ink = '#5e1624', stroke = 11 } = {}) {
  const { d } = wardPath();
  return `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
    <path d="${d}" fill="none" stroke="${ink}" stroke-width="${stroke}" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M138 140 C 148 120, 166 114, 182 117 C 176 134, 158 144, 138 140 Z" fill="${ink}" />
  </svg>`;
}

if (typeof module !== 'undefined') module.exports = { nadaMark, wardMark };
