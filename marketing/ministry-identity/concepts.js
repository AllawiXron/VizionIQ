// Round 3: three new directions after the user turned down the tablet ("looks like an app icon", "the idea itself").
// Each returns SVG markup in a 300x300 box. `c` = { ink, accent, bg }.

// A: the Ishtar Gate built from glazed bricks = pixels. A gate is a portal: the state's digital gateway. Towers with
// stepped Mesopotamian crenellations, an open arch in the middle, one gold band of bricks.
function gate(c) {
  const u = 22, cols = 11, x0 = 150 - cols * u / 2, y0 = 34, gap = 3.2, r = 2.5;
  const H = 11;                                            // rows
  let s = '';
  const top = (col) => (col <= 2 || col >= 8) ? 0 : 2;    // towers start at row 0, the middle at row 2
  const arch = (col, row) => {                             // inside the arch opening?
    const cx = x0 + 5.5 * u, ax = x0 + col * u + u / 2, ay = y0 + row * u + u / 2;
    const rw = 1.62 * u, springY = y0 + 6.2 * u;
    if (Math.abs(ax - cx) > rw) return false;
    if (ay >= springY) return true;
    return Math.hypot(ax - cx, ay - springY) < rw;
  };
  for (let col = 0; col < cols; col++) {
    for (let row = top(col); row < H; row++) {
      if (arch(col, row)) continue;
      const gold = row === 4 && !arch(col, row);
      s += `<rect x="${x0 + col * u + gap / 2}" y="${y0 + row * u + gap / 2}" width="${u - gap}" height="${u - gap}" rx="${r}" fill="${gold ? c.accent : c.ink}"/>`;
    }
  }
  // stepped crenellations on the towers and the middle
  const merlon = (cx, y) => { let m = ''; [[0, 3], [1, 1]].forEach(([k, w]) => {
    m += `<rect x="${cx - w * u / 2 + gap / 2}" y="${y - (k + 1) * u * 0.62 + gap / 2}" width="${w * u - gap}" height="${u * 0.62 - gap}" rx="${r}" fill="${c.ink}"/>`; }); return m; };
  s += merlon(x0 + 1.5 * u, y0) + merlon(x0 + 9.5 * u, y0) + merlon(x0 + 5.5 * u, y0 + 2 * u);
  return s;
}

// B: the two rivers. The Tigris and Euphrates come down as two lines and meet in one node (as they meet at Qurna):
// separate institutions joined into one connected, transparent system. Data points ride the rivers.
function rivers(c) {
  let s = '';
  const L = 'M70 30 C 70 110, 120 120, 138 190 L 150 232';
  const R = 'M230 30 C 230 95, 196 120, 168 180 L 150 232';
  s += `<path d="${L}" fill="none" stroke="${c.ink}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="${R}" fill="none" stroke="${c.ink}" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<circle cx="150" cy="248" r="26" fill="${c.accent}"/>`;
  // data points: little squares cut into the rivers
  for (const [x, y] of [[71, 64], [92, 128], [229, 64], [214, 112]]) s += `<rect x="${x - 5}" y="${y - 5}" width="10" height="10" fill="${c.bg}" transform="rotate(45 ${x} ${y})"/>`;
  return s;
}

// C: the Malwiya of Samarra, its spiral ramp drawn as five rising tiers: steady growth, step by step, to a gold top.
function malwiya(c) {
  let s = '';
  const base = 262, th = 30, gapY = 9, widths = [216, 174, 132, 92, 54];
  widths.forEach((w, i) => {
    const y = base - (i + 1) * th - i * gapY, x = 150 - w / 2;
    // each tier is a slanted band: the ramp climbing around the tower
    s += `<path d="M${x} ${y + th} L${x + w} ${y + th} L${x + w - 8} ${y} L${x + 8} ${y} Z" fill="${c.ink}"/>`;
    s += `<path d="M${x + w * 0.18} ${y + th} L${x + w * 0.62} ${y}" stroke="${c.bg}" stroke-width="5"/>`;
  });
  s += `<rect x="141" y="${base - 5 * th - 4 * gapY - 34}" width="18" height="26" rx="3" fill="${c.accent}"/>`;
  return s;
}

const CONCEPTS = { gate, rivers, malwiya };

// A2: the gate, drawn properly. Two towers and a wall with stepped Mesopotamian crenellations, and an open arch whose
// nested gold arches are both the gate's recessed arches and signal waves: the state's gateway, connected.
// o.bricks: brick-course lines; o.pixTop: the towers' tops break into pixels.
function gate2(c, o = {}) {
  const G = 262, tw = o.tw ?? 54, wl = 150 - (o.ww ?? 72), wr = 150 + (o.ww ?? 72);
  const tl = [wl - tw, wl], tr = [wr, wr + tw], tTop = o.tTop ?? 60, wTop = o.wTop ?? 96;
  const ox = 150, oy = o.oy ?? 178, r0 = o.r0 ?? 28, rings = o.rings ?? [44, 60], sw = o.sw ?? 9;
  let s = '';
  const merlon = (cx, y, w = 22) => {               // stepped: three steps, as on the Ishtar Gate
    const h = w * 0.3;
    return [[w, 0], [w * 0.62, 1], [w * 0.26, 2]].map(([mw, k]) => `<rect x="${cx - mw / 2}" y="${y - (k + 1) * h}" width="${mw}" height="${h + 0.5}" fill="${c.ink}"/>`).join('');
  };
  s += `<rect x="${tl[0]}" y="${tTop}" width="${tw}" height="${G - tTop}" fill="${c.ink}"/>`;
  s += `<rect x="${tr[0]}" y="${tTop}" width="${tw}" height="${G - tTop}" fill="${c.ink}"/>`;
  s += `<rect x="${wl}" y="${wTop}" width="${wr - wl}" height="${G - wTop}" fill="${c.ink}"/>`;
  for (const t of [tl, tr]) { const m = (t[1] - t[0]) / 4; s += merlon(t[0] + m, tTop, m * 1.7) + merlon(t[1] - m, tTop, m * 1.7); }
  const n = o.wallMerlons ?? 4, step = (wr - wl) / n;
  for (let i = 0; i < n; i++) s += merlon(wl + step * (i + 0.5), wTop, step * 0.82);
  if (o.seams !== false) for (const x of [wl, wr]) s += `<rect x="${x - 1.6}" y="${tTop - 12}" width="3.2" height="${G - tTop + 12}" fill="${c.bg}"/>`;   // towers stand out from the wall
  if (o.bricks) for (let y = G - 14; y > tTop; y -= 14) s += `<line x1="${tl[0]}" y1="${y}" x2="${tr[1]}" y2="${y}" stroke="${c.bg}" stroke-opacity=".22" stroke-width="1.6"/>`;
  // nested arches, then the opening
  const arch = (r) => `M${ox - r} ${G} V${oy} A${r} ${r} 0 0 1 ${ox + r} ${oy} V${G}`;
  rings.slice().reverse().forEach((r) => { s += `<path d="${arch(r)}" fill="none" stroke="${c.accent}" stroke-width="${sw}"/>`; });
  s += `<path d="${arch(r0)} Z" fill="${c.bg}"/>`;
  return s;
}
CONCEPTS.gate2 = (c) => gate2(c);
CONCEPTS.gate3 = (c) => gate2(c, { tTop: 40, wTop: 104, tw: 56, ww: 70, oy: 182, r0: 27, rings: [42, 57], sw: 9 });
CONCEPTS.gate2b = (c) => gate2(c, { bricks: true });
CONCEPTS.gate2c = (c) => gate2(c, { rings: [42, 58, 74], r0: 26, sw: 7, ww: 84, tw: 46, wTop: 84, oy: 172, wallMerlons: 5 });
