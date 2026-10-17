// The ministry's mark, drawn in code: cuneiform wedges (the first written records) turning into data.
// Every function returns SVG markup in a 300x300 box. `c` = { ink, accent }.

// A horizontal cuneiform wedge: a triangular head on the left, a tapering tail to the right.
function hWedge(x, cy, h, len, ink) {
  const hw = h * 0.95, t0 = h * 0.16, t1 = h * 0.07, tx = x + hw * 0.62;
  return `<path fill="${ink}" d="M${x} ${cy - h / 2} L${x + hw} ${cy} L${x} ${cy + h / 2} Z"/>` +
    (len > hw * 0.62 ? `<path fill="${ink}" d="M${tx} ${cy - t0} L${x + len} ${cy - t1} L${x + len} ${cy + t1} L${tx} ${cy + t0} Z"/>` : '');
}

// A vertical cuneiform wedge: the head on top, the tail running down.
function vWedge(cx, y, w, len, ink) {
  const hh = w * 0.95, t0 = w * 0.16, t1 = w * 0.07, ty = y + hh * 0.62;
  return `<path fill="${ink}" d="M${cx - w / 2} ${y} L${cx + w / 2} ${y} L${cx} ${y + hh} Z"/>` +
    `<path fill="${ink}" d="M${cx - t0} ${ty} L${cx - t1} ${y + len} L${cx + t1} ${y + len} L${cx + t0} ${ty} Z"/>`;
}

// The same wedge head drawn in pixels: a stepped triangle on a 5x5 grid, as wide as the real head (the moment the record turns digital).
function pxWedge(x, cy, h, ink) {
  const u = h / 5, gap = u * 0.14, rows = [[0, 4], [0, 4], [1, 3], [1, 3], [2, 2]];   // per column: first and last row filled
  let s = '';
  rows.forEach(([a, b], col) => {
    for (let r = a; r <= b; r++) s += `<rect x="${x + col * u + gap / 2}" y="${cy - h / 2 + r * u + gap / 2}" width="${u - gap}" height="${u - gap}" fill="${ink}"/>`;
  });
  return s;
}

const sq = (x, y, s, fill, r = 0) => `<rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${r}" fill="${fill}"/>`;

const MARKS = {
  // A: three rows of wedges; each row dissolves further into pixels
  dissolve(c) {
    let s = '';
    s += hWedge(20, 60, 64, 260, c.ink);
    s += hWedge(20, 150, 64, 140, c.ink) + sq(184, 137, 26, c.ink) + sq(234, 137, 26, c.ink);
    s += hWedge(20, 240, 64, 0.01, c.ink) + sq(98, 222, 36, c.ink) + sq(150, 222, 36, c.ink) + sq(202, 222, 36, c.ink) + sq(254, 222, 36, c.accent);
    return s;
  },
  // B (chosen): a 3x3 grid read left to right like a cuneiform line: a full wedge, then the wedge's head in pixels,
  // then a pixel. The top right pixel is gold: the new value the old record turns into.
  morph(c) {
    let s = '';
    for (let r = 0; r < 3; r++) {
      const cy = 60 + r * 90;
      s += hWedge(12, cy, 62, 96, c.ink);
      s += pxWedge(128, cy, 62, c.ink);
      s += sq(226, cy - 31, 62, r === 0 ? c.accent : c.ink, 5);
    }
    return s;
  },
  // C: vertical wedges standing as a rising bar chart; the last one ends in a gold pixel
  growth(c) {
    let s = '';
    const xs = [48, 116, 184, 252], tops = [168, 124, 80, 36], w = 54;
    xs.forEach((x, i) => {
      if (i < 3) s += vWedge(x, tops[i], w, 270 - tops[i], c.ink);
      else s += sq(x - w / 2, tops[i], w, c.accent, 3) + vWedge(x, tops[i] + w + 12, w, 270 - tops[i] - w - 12, c.ink);
    });
    return s;
  },
};

function markSVG(name, c, size = 300, extra = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="${size}" height="${size}" ${extra}>${MARKS[name](c)}</svg>`;
}

// Loaded by the pages with a <script> tag (the repo's package.json is "type": "module", so require() won't see these).
