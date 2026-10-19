// «علّق كورس»: the viZion trial reel, one take, as in ../hf-one-second-reel: everything sits on one desk and a single
// camera travels across it, no cuts. One paused timeline, built after the fonts load, registered on
// window.__timelines.main. build.py's sound cues follow T and MOVES.
(function () {
  const D = 22;
  // camera poses: the desk point at the centre of the frame, the scale, the roll (deg)
  const POSE = { S1t: [1500, 1140, 1.08, 0], S1: [1500, 1250, 1, 0], S2: [1500, 3700, 1, 0], S3: [1500, 6100, 1, 0] };
  // [start, end, pose, roll at mid-move]
  const MOVES = [[0.4, 4.4, 'S1', 0]];
  // the sheets on the desk: centre x, centre y, width, height, field, rotation
  const SHEETS = [[1500, 1150, 1400, 2600, 'paper', 1], [1500, 3700, 1400, 2400, 'orange', -1.5], [1500, 6100, 1400, 2400, 'paper', -1]];
  // loose props on the desk: image, centre x, centre y, width (px), rotation. The mug and pencil frame the hook.
  const PROPS = [['mug', 2035, 2162, 560, 0], ['pencil', 1230, 2050, 735, -18], ['clip-orange', 2150, 4900, 70, 24], ['pin-cream', 860, 7020, 84, 0]];
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const world = $('#world'), firstStation = $('#s1');
  SHEETS.forEach(([cx, cy, w, h, kind, r]) => {
    const d = document.createElement('div');
    d.className = `bgc ${kind} sheet`;
    d.style.cssText = `left:${cx - w / 2}px; top:${cy - h / 2}px; width:${w}px; height:${h}px; transform:rotate(${r}deg)`;
    world.insertBefore(d, firstStation);
  });
  $('#props').innerHTML = PROPS.map(([img, cx, cy, w, r]) => `<img class="prop" src="assets/props/${img}.png" alt="" style="left:${cx - w / 2}px; top:${cy}px; width:${w}px; transform:translateY(-50%) rotate(${r}deg)" />`).join('');

  // ── the camera: holds drift in a little; moves ease softly, roll a touch, and blur lightly along their direction
  const ease = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
  const drift = (P, dt) => [P[0], P[1], P[2] * (1 + 0.025 * Math.min(1, Math.max(0, dt) / 4)), P[3]];
  function cam(t) {
    let prev = POSE.S1t, prevEnd = 0;
    for (const [t0, t1, name, bank] of MOVES) {
      if (t < t0) return drift(prev, t - prevEnd);
      if (t <= t1) {
        const a = drift(prev, t0 - prevEnd), b = POSE[name], p = (t - t0) / (t1 - t0), e = ease(p);
        return [a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, Math.pow(a[2], 1 - e) * Math.pow(b[2], e), a[3] + (b[3] - a[3]) * e + bank * Math.sin(Math.PI * p)];
      }
      prev = POSE[name]; prevEnd = t1;
    }
    return drift(prev, t - prevEnd);
  }
  const view = $('#view'), camBlur = $('#cams');
  function place([x, y, s, r]) {
    world.style.transform = `translate(540px, 960px) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(5)}) translate(${(-x).toFixed(2)}px, ${(-y).toFixed(2)}px)`;
  }
  function render(t) {
    const [x, y, s, r] = cam(t), [x0, y0, s0] = cam(Math.max(0, t - 1 / 30)), r0 = cam(Math.max(0, t - 1 / 30))[3];
    place([x, y, s, r]);
    const zb = Math.abs(Math.log(s / s0)) * 70 + Math.abs(r - r0) * 4;
    const bx = Math.min(22, Math.abs(x - x0) * s * 0.2 + zb), by = Math.min(22, Math.abs(y - y0) * s * 0.2 + zb);
    if (bx < 0.5 && by < 0.5) { view.style.filter = 'none'; camBlur.setAttribute('stdDeviation', '0 0'); }
    else { camBlur.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); view.style.filter = 'url(#camf)'; }
  }

  // ── torn paper: each strip and label gets its own piece, torn on all four sides with the paper's white core showing
  // along the tear and a few loose fibres, drawn once at its own size (seeded, so every render is the same)
  function rand(seed) {
    return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function tearEdge(n, r, inset, amp) {
    // fractal noise along an edge: wavelengths from 360 px down to 5 px, each octave a little weaker
    const waves = [];
    for (let o = 0, a = amp, L = 360; L > 4; o++, a *= 0.6, L /= 2) for (let j = 0; j < 2; j++) waves.push([a * (0.5 + r()), (2 * Math.PI) / (L * (0.7 + 0.6 * r())), r() * 6.283]);
    const e = new Float32Array(n);
    for (let i = 0; i < n; i++) { let v = 0; for (const [a, k, ph] of waves) v += a * Math.sin(k * i + ph); e[i] = inset + v; }
    return e;
  }
  function tear(el, seed) {
    const S = 2, W = el.offsetWidth * S, H = el.offsetHeight * S, r = rand(seed);
    const top = tearEdge(W, r, 11 * S, 2.6 * S), bot = tearEdge(W, r, 12 * S, 2.6 * S), lft = tearEdge(H, r, 10 * S, 2.4 * S), rgt = tearEdge(H, r, 10 * S, 2.4 * S);
    const bT = tearEdge(W, r, 3.2 * S, 1.3 * S), bB = tearEdge(W, r, 3.2 * S, 1.3 * S), bL = tearEdge(H, r, 2.8 * S, 1.2 * S), bR = tearEdge(H, r, 2.8 * S, 1.2 * S);
    // a little mottling: value noise on a 26 px grid
    const G = 26 * S, gw = Math.ceil(W / G) + 2, gh = Math.ceil(H / G) + 2, grid = Float32Array.from({ length: gw * gh }, () => r() - 0.5);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
    for (let y = 0; y < H; y++) {
      const gy = y / G, y0 = Math.floor(gy), fy = gy - y0;
      for (let x = 0; x < W; x++) {
        const dt = y - top[x], db = H - 1 - y - bot[x], dl = x - lft[y], dr = W - 1 - x - rgt[y];
        const d = Math.min(dt, db, dl, dr);
        if (d < -1) continue;
        let band = 0;
        for (const [dd, bw] of [[dt, bT[x]], [db, bB[x]], [dl, bL[y]], [dr, bR[y]]]) band = Math.max(band, Math.min(1, Math.max(0, 1 - (dd - bw) / (1.5 * S))));
        const n = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1, fib = Math.abs(n);
        const gx = x / G, x0 = Math.floor(gx), fx = gx - x0, g = (i, j) => grid[(j % gh) * gw + (i % gw)];
        const m = (g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy;
        const k = 1 + m * 0.05 + (fib - 0.5) * 0.025;
        const a = Math.min(1, Math.max(0, d + 0.5)) * (1 - band * (0.16 + 0.24 * fib));
        const i4 = (y * W + x) * 4;
        px[i4] = Math.min(255, 251 * k * (1 - band) + 255 * band);
        px[i4 + 1] = Math.min(255, 243 * k * (1 - band) + 253 * band);
        px[i4 + 2] = Math.min(255, 230 * k * (1 - band) + 248 * band);
        px[i4 + 3] = a * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // loose fibres poking out of the tear
    ctx.lineCap = 'round';
    for (let i = 0, nH = Math.round((W + H) / S * 0.12); i < nH; i++) {
      const side = Math.floor(r() * 4);
      let x, y, ang;
      if (side === 0) { x = r() * W; y = top[Math.floor(x)]; ang = -Math.PI / 2; }
      else if (side === 1) { x = r() * W; y = H - 1 - bot[Math.floor(x)]; ang = Math.PI / 2; }
      else if (side === 2) { y = r() * H; x = lft[Math.floor(y)]; ang = Math.PI; }
      else { y = r() * H; x = W - 1 - rgt[Math.floor(y)]; ang = 0; }
      ang += (r() - 0.5) * 1.6;
      const L = (2 + r() * 6) * S;
      ctx.strokeStyle = `rgba(255,253,248,${(0.35 + r() * 0.4).toFixed(2)})`;
      ctx.lineWidth = (0.5 + r() * 0.5) * S;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L); ctx.stroke();
    }
    el.style.backgroundImage = `url(${cv.toDataURL('image/png')})`;
    el.style.backgroundColor = 'transparent';
  }

  function tearBox(el, seed) {   // the comment box's torn paper (its own child, so the box keeps its layout)
    tear(el, seed);
  }

  function build() {
    $$('.strip > span, .lab8 > span').forEach((el, i) => tear(el, 101 + i * 37));
    tearBox($('#cbox .pap'), 907);
    $$('.lab8').forEach((el) => gsap.set(el, { xPercent: -50, rotation: +el.dataset.r }));
    // stills (stills/render.cjs): everything on, the camera parked on a sheet
    window.__still = (name) => {
      $$('.w, .strip, .lab8, .ktag, #cbox').forEach((e) => { e.style.opacity = 1; });
      $$('.mk path').forEach((e) => { e.style.strokeDashoffset = 0; });
      place(POSE[name]);
    };
    document.body.dataset.ready = '1';
  }
  document.fonts.ready.then(build);
})();
