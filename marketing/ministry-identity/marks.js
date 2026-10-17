// The ministry's mark: the Ishtar Gate as Iraq's digital gateway (the user's pick, round 3).
// Two tall towers and a lower wall with stepped Mesopotamian crenellations, and an open arch framed by two nested gold
// arches: the gate's recessed arches, and signal waves. Earlier rounds (cuneiform grid, clay tablet) are in git history.
// `c` = { ink (the gate), accent (the arches), bg (the ground it sits on: fills the doorway and the seams) }.

const GATE = { G: 262, tTop: 40, wTop: 104, tw: 56, ww: 70, oy: 182, r0: 27, rings: [42, 57], sw: 9 };

// a stepped merlon (three steps), centred on cx, standing on y
function merlon(cx, y, w, fill) {
  const h = w * 0.3;
  return [[w, 0], [w * 0.62, 1], [w * 0.26, 2]]
    .map(([mw, k]) => `<rect x="${cx - mw / 2}" y="${y - (k + 1) * h}" width="${mw}" height="${h + 0.5}" fill="${fill}"/>`).join('');
}

// the arch path (open at the bottom), radius r, spring line at GATE.oy
const archPath = (r, ox = 150) => `M${ox - r} ${GATE.G} V${GATE.oy} A${r} ${r} 0 0 1 ${ox + r} ${GATE.oy} V${GATE.G}`;

function gate(c, o = {}) {
  const g = { ...GATE, ...o };
  const wl = 150 - g.ww, wr = 150 + g.ww, tl = [wl - g.tw, wl], tr = [wr, wr + g.tw];
  let s = '';
  s += `<rect x="${tl[0]}" y="${g.tTop}" width="${g.tw}" height="${g.G - g.tTop}" fill="${c.ink}"/>`;
  s += `<rect x="${tr[0]}" y="${g.tTop}" width="${g.tw}" height="${g.G - g.tTop}" fill="${c.ink}"/>`;
  s += `<rect x="${wl}" y="${g.wTop}" width="${wr - wl}" height="${g.G - g.wTop}" fill="${c.ink}"/>`;
  for (const t of [tl, tr]) { const m = (t[1] - t[0]) / 4; s += merlon(t[0] + m, g.tTop, m * 1.7, c.ink) + merlon(t[1] - m, g.tTop, m * 1.7, c.ink); }
  const step = (wr - wl) / 4;
  for (let i = 0; i < 4; i++) s += merlon(wl + step * (i + 0.5), g.wTop, step * 0.82, c.ink);
  for (const x of [wl, wr]) s += `<rect x="${x - 1.6}" y="${g.tTop - 12}" width="3.2" height="${g.G - g.tTop + 12}" fill="${c.bg}"/>`;  // seams: the towers stand out
  g.rings.slice().reverse().forEach((r) => { s += `<path d="${archPath(r)}" fill="none" stroke="${c.accent}" stroke-width="${g.sw}"/>`; });
  s += `<path d="${archPath(g.r0)} V${g.G + 1} H${150 - g.r0} Z" fill="${c.bg}"/>`;   // the doorway (1px past the ground, no hairline)
  return s;
}

const MARKS = { gate };
const VIEW = { gate: [22, 20, 256, 244] };   // the gate's own box (x, y, w, h)

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

// Loaded by the pages with a <script> tag (the repo's package.json is "type": "module", so require() won't see these).
