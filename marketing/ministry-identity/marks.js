// The ministry's mark: the Ishtar Gate as Iraq's digital gateway (the user's pick, round 3).
// Two tall towers and a lower wall with stepped Mesopotamian crenellations, and an open arch framed by two nested gold
// arches: the gate's recessed arches, and signal waves. Earlier rounds (cuneiform grid, clay tablet) are in git history.
// `c` = { ink (the gate), accent (the arches), bg (the ground it sits on: fills the doorway and the seams) }.

// Everything sits on one grid of U units, so every edge lands on a whole number and nothing is cut by the view box:
// towers 11U wide, the wall 23U, a seam of U/2 between them (a real gap, not painted), every merlon 5U×3U in equal
// U steps (two per tower, four on the wall, all flush with the edges), and the arch in equal bands of 1.5U from one
// centre: doorway, blue, gold, blue, gold, blue to the wall's edge. The doorway, the seams and (with accent: 'none')
// the gold bands are holes, so the mark sits on any ground or photo.
const U = 6;
const GATE = (() => {
  const cx = 150, tw = 11 * U, ww = 23 * U, seam = U / 2, G = 282, b = 1.5 * U;
  const wl = cx - ww / 2, wr = cx + ww / 2;
  return {
    U, cx, G, tTop: G - 41 * U, wTop: G - 28 * U, mh: 3 * U, b,
    towers: [[wl - seam - tw, wl - seam], [wr + seam, wr + seam + tw]], wall: [wl, wr],
    r0: ww / 2 - 5 * b,                                       // 24: the doorway
    rings: [ww / 2 - 3.5 * b, ww / 2 - 1.5 * b],              // centre lines of the gold bands (37.5, 55.5)
    oy: G - 28 * U + 2 * b + ww / 2 - b,                      // spring line: 2 bands of blue above the outer gold (wTop + 78)
  };
})();

// the top edge of a block from x0 to x1 at height y, with n merlons (5U wide, U apart, flush with both ends)
function crenTop(x0, x1, y, n) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const m = x0 + i * 6 * U;
    pts.push([m, y - U], [m + U, y - U], [m + U, y - 2 * U], [m + 2 * U, y - 2 * U], [m + 2 * U, y - 3 * U],
      [m + 3 * U, y - 3 * U], [m + 3 * U, y - 2 * U], [m + 4 * U, y - 2 * U], [m + 4 * U, y - U], [m + 5 * U, y - U]);
    if (i < n - 1) pts.push([m + 5 * U, y], [m + 6 * U, y]);
  }
  return pts;
}
// a block (tower or wall) as one closed outline: up the left edge, along the crenellated top, down the right
function gateBlock(x0, x1, y, n, G) {
  return 'M' + [[x0, G], ...crenTop(x0, x1, y, n), [x1, G]].map((p) => p.join(' ')).join(' L') + ' Z';
}
// a U-shaped band (outer radius R, inner r) standing on the ground; r = 0 gives the solid arch shape
function archBand(R, r = 0, { cx, oy, G } = GATE) {
  let d = `M${cx - R} ${G} V${oy} A${R} ${R} 0 0 1 ${cx + R} ${oy} V${G}`;
  return r ? d + ` H${cx + r} V${oy} A${r} ${r} 0 0 0 ${cx - r} ${oy} V${G} Z` : d + ' Z';
}

// a stepped merlon on its own (for the crenellation pattern), centred on cx, standing on y
function merlon(cx, y, w, fill) {
  const k = w / 5;
  return `<path d="M${cx - w / 2} ${y} V${y - k} H${cx - 1.5 * k} V${y - 2 * k} H${cx - k / 2} V${y - 3 * k} H${cx + k / 2} V${y - 2 * k} H${cx + 1.5 * k} V${y - k} H${cx + w / 2} V${y} Z" fill="${fill}"/>`;
}

// `c` = { ink (the gate), accent (the gold bands; 'none' leaves them open) }. `c.bg` is no longer needed.
function gate(c) {
  const g = GATE, [wl, wr] = g.wall, b = g.b, outer = wr - g.cx - b;   // 60: the outer edge of the outer gold
  const ink = g.towers.map(([x0, x1]) => gateBlock(x0, x1, g.tTop, 2, g.G)).join(' ')
    + ' ' + gateBlock(wl, wr, g.wTop, 4, g.G) + ' ' + archBand(outer)           // the wall, with the whole arch cut out
    + ' ' + archBand(outer - b, outer - 2 * b) + ' ' + archBand(g.r0 + b, g.r0); // the two blue bands
  let s = `<path d="${ink}" fill="${c.ink}" fill-rule="evenodd"/>`;
  if (c.accent && c.accent !== 'none') s += `<path d="${archBand(outer, outer - b)} ${archBand(outer - 2 * b, outer - 3 * b)}" fill="${c.accent}"/>`;
  return s;
}

const MARKS = { gate };
const VIEW = { gate: [GATE.towers[0][0], GATE.tTop - GATE.mh, GATE.towers[1][1] - GATE.towers[0][0], GATE.G - GATE.tTop + GATE.mh] };   // the gate's own box (x, y, w, h)

// `size` is the height in px
function markSVG(name, c, size = 300, extra = '') {
  const [x, y, w, h] = VIEW[name] || [0, 0, 300, 300];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${size * w / h}" height="${size}" ${extra}>${MARKS[name](c)}</svg>`;
}

// Patterns from the mark, as SVG <pattern> tiles.
// crenellation band: a row of stepped merlons (for borders and dividers)
function crenelBand(fill, w = 40) {
  return `<pattern id="cren-${fill.slice(1)}" width="${w}" height="${w * 0.9}" patternUnits="userSpaceOnUse">${merlon(w / 2, w * 0.9, w * 0.82, fill)}</pattern>`;
}
// arches: nested arches in a grid (for large fields: covers, backgrounds)
function archTile(stroke, op = 1, s = 120) {
  const a = (r, ox, oy) => `M${ox - r} ${oy + r * 0.9} V${oy} A${r} ${r} 0 0 1 ${ox + r} ${oy} V${oy + r * 0.9}`;
  const one = (ox, oy) => [s * 0.36, s * 0.24, s * 0.12].map((r) => `<path d="${a(r, ox, oy)}" fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${s * 0.03}"/>`).join('');
  return `<pattern id="arch-${stroke.slice(1)}" width="${s}" height="${s * 0.8}" patternUnits="userSpaceOnUse">${one(s / 2, s * 0.42)}</pattern>`;
}

// The same two patterns as explicit shapes, for anything that is printed: Chrome prints an SVG <pattern> fill as a
// blurry bitmap. Same geometry as archTile and crenelBand, so the document and the mockups match exactly.
function archField(w, h, stroke, op = 1, s = 120) {
  const a = (r, ox, oy) => `M${ox - r} ${oy + r * 0.9} V${oy} A${r} ${r} 0 0 1 ${ox + r} ${oy} V${oy + r * 0.9}`;
  let d = '';
  for (let y = 0; y < h; y += s * 0.8) for (let x = 0; x < w; x += s)
    for (const r of [s * 0.36, s * 0.24, s * 0.12]) d += a(r, x + s / 2, y + s * 0.42) + ' ';
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="${s * 0.03}"/>`;
}
// one row of merlons (tile t wide), standing on y
function crenRow(w, fill, t = 40, y = t * 0.9) {
  let s = '';
  for (let x = 0; x < w; x += t) s += merlon(x + t / 2, y, t * 0.82, fill);
  return s;
}

// Loaded by the pages with a <script> tag (the repo's package.json is "type": "module", so require() won't see these).
