// «ثانية وحدة» v8, one take: everything sits on one desk and a single camera travels across it, no cuts. Every frame
// it lands on is already composed (text starts as it arrives); moves are long, soft and lightly blurred. One paused
// timeline, built after the fonts load, registered on window.__timelines.main. build.py's sound cues follow T and MOVES.
(function () {
  const D = 38;
  // camera poses: the desk point at the centre of the frame, the scale, the roll (deg)
  const POSE = {
    S1t: [5600, 930, 1.07, 0], S1: [5600, 1250, 1, 0], S2: [5600, 3700, 1, 0], S2z: [5600, 3800, 1.08, 0], S3: [5600, 6100, 1, 0],
    A: [4200, 6060, 1.05, 0], B: [3500, 7010, 1.05, 0], C: [2800, 7960, 1.05, 0], G: [3500, 6800, 0.47, 0],
    H: [6000, 8700, 1, 0], I: [6000, 11100, 1, 0],
  };
  // [start, end, pose, roll at mid-move]
  const MOVES = [
    [0.5, 4.5, 'S1', 0], [4.7, 5.9, 'S2', 1.5], [10.0, 10.8, 'S2z', 0], [11.3, 12.3, 'S3', -1.5], [14.75, 15.85, 'A', 1],
    [18.3, 19.4, 'B', 0], [21.8, 22.9, 'C', 0], [25.0, 26.5, 'G', 0], [29.0, 30.1, 'H', 1.5], [32.6, 33.6, 'I', -1.5],
  ];
  // the sheets on the desk: centre x, centre y, width, height, field, rotation
  const SHEETS = [
    [5600, 1150, 1400, 2600, 'paper', 1], [5600, 3700, 1400, 2400, 'orange', -1.5], [3500, 6900, 2400, 3200, 'paper', 0.6],
    [6000, 8700, 1400, 2400, 'orange', 2], [6000, 11100, 1400, 2400, 'paper', -1.5],
  ];
  // the wall: centre x, centre y, design, rotation, which of the three points it carries (-1: none), and what holds it
  // up (t1–t3: a piece of masking tape; pin-*: a map pin; binder: a binder clip on its top edge)
  const WALL = [
    [4200, 5950, 'asiacell', -2, 0, 't1'], [3500, 5950, 'talabat', 2.5, -1, 'pin-brown'], [2800, 5950, 'qi', -1.5, -1, 't2'],
    [4200, 6900, 'iraqiairways', 1.5, -1, 't3'], [3500, 6900, 'pepsi', 2, 1, 'binder'], [2800, 6900, 'saj', -2.5, -1, 'pin-orange'],
    [4200, 7850, 'sala', -1, -1, 't2'], [3500, 7850, 'miswag', 1.8, -1, 'pin-cream'], [2800, 7850, 'shifa', -1.5, 2, 't1'],
  ];
  // loose props on the desk: image, centre x, centre y, width (px), rotation. The mug and pencil frame the hook; two
  // paper clips lie by «ليش؟».
  const PROPS = [
    ['mug', 6135, 2162, 560, 0], ['pencil', 5330, 2050, 735, -18],
    ['clip-silver', 5250, 6860, 70, 62], ['clip-orange', 5370, 6950, 70, 17],
  ];
  const TAPE_W = { t1: 160, t2: 145, t3: 170 };
  const POINTS = [
    { tag: 'آسيا سيل', sub: 'إعلان غير رسمي', tr: -8, line: '<span class="w">فكرة</span> <span class="w">وحدة</span> <span class="w">تنفهم</span> <span class="w" data-hl="1">بثانية</span>' },
    { tag: 'ببسي', sub: 'إعلان غير رسمي', tr: 7, line: '<span class="w">حجي</span> <span class="w" data-hl="1">بلهجة</span> <span class="w" data-hl="1">زبونك</span>' },
    { tag: 'مختبر', sub: 'نموذج من شغلي', tr: -6, line: '<span class="w">وسبب</span> <span class="w">يخلّيه</span> <span class="w" data-hl="1">يطلب</span> <span class="w" data-hl="1">هسه</span>' },
  ];
  const T = {
    s1w: [0.0, 0.0, 0.6, 0.95, 2.3, 2.58, 2.86, 3.6, 3.88], bar: 2.4, fill: 2.7,
    scroll: 4.9, slow: 9.25, stop: 10.1,
    t3a: 5.55, t3aw: [5.6, 5.88, 6.35], t3aOut: 7.82, t3b: 7.95, t3bw: [7.95, 8.25, 8.55, 8.85, 9.3], t4: 10.15, t4w: [10.2, 10.5, 10.75], heart: 10.45,
    ico: 11.95, why: 12.1, bih: 13.45, three: 13.7,
    tags: [15.6, 19.1, 22.6], ticks: [15.75, 19.2, 22.7], l: [[15.9, 16.18, 16.46, 16.74], [19.35, 19.65, 19.95], [22.85, 23.13, 23.41, 23.69]], hls: [17.25, 20.6, 24.2],
    t7: 26.1, t7w: [26.15, 26.43, 26.71, 26.99, 27.45, 27.85],
    sv: [29.6, 30.05, 30.5, 30.95], slam8: 31.45,
    t9: 33.2, t9w: [33.2, 33.5], slam9: 33.95, s9b: 34.6, plane: 34.85, s9c: [35.1, 35.38], btn: 35.8, cur: 36.0, click: 36.6, open: 36.7,
  };
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // ── the desk: sheets under everything, then the wall of prints
  const world = $('#world'), firstStation = $('#s1');
  SHEETS.forEach(([cx, cy, w, h, kind, r]) => {
    const d = document.createElement('div');
    d.className = `bgc ${kind} sheet`;
    d.style.cssText = `left:${cx - w / 2}px; top:${cy - h / 2}px; width:${w}px; height:${h}px; transform:rotate(${r}deg)`;
    world.insertBefore(d, firstStation);
  });
  const holder = (cx, cy, r, how) => {
    if (how[0] === 't') return `<img class="tape" src="assets/props/tape${how[1]}.png" alt="" style="left:${cx - TAPE_W[how] / 2}px; top:${cy - 364}px; width:${TAPE_W[how]}px; transform:rotate(${(r * 1.6).toFixed(1)}deg)" />`;
    if (how === 'binder') return `<img class="prop" src="assets/props/binder.png" alt="" style="left:${cx - 101}px; top:${cy - 510}px; width:203px; z-index:6; transform:rotate(${r}deg)" />`;
    return `<img class="prop" src="assets/props/${how}.png" alt="" style="left:${cx - 47}px; top:${cy - 347}px; width:84px; z-index:6" />`;
  };
  $('#props').innerHTML = PROPS.map(([img, cx, cy, w, r]) => `<img class="prop" src="assets/props/${img}.png" alt="" style="left:${cx - w / 2}px; top:${cy}px; width:${w}px; transform:translateY(-50%) rotate(${r}deg)" />`).join('');
  $('#wall').innerHTML = WALL.map(([cx, cy, img, r, k, how]) => {
    let h = `<div class="print" style="left:${cx - 260}px; top:${cy - 339}px; transform:rotate(${r}deg)"><img src="assets/work/${img}.jpg" alt="" /></div>
      ${holder(cx, cy, r, how)}`;
    if (k >= 0) {
      const p = POINTS[k];
      h += `<div class="ktag" id="k${k + 1}" style="left:${cx - 390}px; top:${cy + 140}px; transform:rotate(${p.tr}deg)"><i class="tg"></i><i class="hole"></i><div>${p.tag}<small>${p.sub}</small></div></div>
        <div class="li on-paper" id="l${k + 1}" style="left:${cx - 450}px; top:${cy + 352}px"><svg class="tick" viewBox="0 0 54 50"><path pathLength="1" d="M5 26 L20 41 L49 7" /></svg><span class="tl">${p.line}</span></div>`;
    }
    return h;
  }).join('');

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
  function render(t) {
    const [x, y, s, r] = cam(t), [x0, y0, s0, r0] = cam(Math.max(0, t - 1 / 30));
    world.style.transform = `translate(540px, 960px) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(5)}) translate(${(-x).toFixed(2)}px, ${(-y).toFixed(2)}px)`;
    const zb = Math.abs(Math.log(s / s0)) * 70 + Math.abs(r - r0) * 4;
    const bx = Math.min(22, Math.abs(x - x0) * s * 0.2 + zb), by = Math.min(22, Math.abs(y - y0) * s * 0.2 + zb);
    if (bx < 0.5 && by < 0.5) { view.style.filter = 'none'; camBlur.setAttribute('stdDeviation', '0 0'); }
    else { camBlur.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); view.style.filter = 'url(#camf)'; }
  }

  // ── the feed: eleven ordinary posts, then his quzi post; always moving, so none of them is ever read
  const ICON = {
    heart: 'M12 20.5 C 5 16, 2.5 12.5, 2.5 8.6 C 2.5 5.6, 4.8 3.5, 7.4 3.5 C 9.4 3.5, 11 4.6, 12 6.2 C 13 4.6, 14.6 3.5, 16.6 3.5 C 19.2 3.5, 21.5 5.6, 21.5 8.6 C 21.5 12.5, 19 16, 12 20.5 Z',
    comment: 'M20.5 11.5 A 8.5 8.5 0 0 1 8.2 19.1 L 3 20.5 L 4.4 15.6 A 8.5 8.5 0 1 1 20.5 11.5 Z',
    send: 'M22 3 L2 10 L10 13 L13 21 Z M22 3 L10 13',
  };
  const PAL = ['#d8cfc4', '#c3cfd9', '#e9d7b4', '#cbd8c4', '#e4c6c1', '#d2d0dc', '#f0e0cc', '#bcc8c0', '#e7cfd9', '#d6c6b0', '#c9d3e0'];
  const N = 11, P = 742, YF = -N * P + 99;
  const svg = (d) => `<svg viewBox="0 0 24 24"><path d="${d}" /></svg>`;
  const generic = (k) => {
    const c = PAL[k % PAL.length], r = 110 + Math.round(hash(k) * 80), cx = 120 + Math.round(hash(k + 1) * 230), cy = 150 + Math.round(hash(k + 2) * 200);
    return `<div style="position:absolute;inset:0;background:linear-gradient(160deg, ${c}, ${c}cc)"></div>
      <div style="position:absolute;left:${cx - r}px;top:${cy - r}px;width:${2 * r}px;height:${2 * r}px;border-radius:50%;background:rgba(255,255,255,.38)"></div>
      <div style="position:absolute;right:44px;bottom:110px;width:${200 + Math.round(hash(k + 3) * 150)}px;height:34px;border-radius:8px;background:rgba(255,255,255,.7)"></div>`;
  };
  $('#feed').innerHTML = Array.from({ length: N + 1 }, (_, k) => `<div class="post">
      <div class="ph"><i class="av" style="background:${k === N ? 'linear-gradient(135deg,#f07a2e,#c2441a)' : `linear-gradient(135deg, ${PAL[(k + 3) % PAL.length]}, #9a9a9a)`}"></i><i class="nb" style="width:${110 + Math.round(hash(k + 9) * 80)}px"></i></div>
      <div class="pimg">${k === N ? `<img src="assets/work/saj.jpg" alt="" /><svg id="bigHeart" viewBox="0 0 24 24"><path d="${ICON.heart}" /></svg>` : generic(k)}</div>
      <div class="pa">${svg(ICON.heart)}${svg(ICON.comment)}${svg(ICON.send)}</div>
      <div class="pc"><i style="width:${60 + Math.round(hash(k + 5) * 25)}%"></i><i style="width:${30 + Math.round(hash(k + 6) * 25)}%"></i></div>
    </div>`).join('');

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

  // ── the highlighter swipes: measured once the fonts are in (offsets ignore transforms)
  function buildHighlights() {
    $$('.li .tl').forEach((tlEl) => {
      const ws = [...tlEl.querySelectorAll('[data-hl]')];
      const l = Math.min(...ws.map((w) => w.offsetLeft)), r = Math.max(...ws.map((w) => w.offsetLeft + w.offsetWidth));
      const h = document.createElement('div');
      h.className = 'hlt';
      h.style.left = (l - 10) + 'px';
      h.style.width = (r - l + 20) + 'px';
      h.style.top = (ws[0].offsetTop + ws[0].offsetHeight * 0.28) + 'px';
      h.style.height = (ws[0].offsetHeight * 0.62) + 'px';
      tlEl.appendChild(h);
    });
  }

  function build() {
    buildHighlights();
    $$('.strip > span, .lab8 > span').forEach((el, i) => tear(el, 101 + i * 37));
    gsap.set('#g', { scale: 1 / POSE.G[2] });
    const tl = gsap.timeline({ paused: true });
    // words pop out of a blur, drifting in from the reading side (each with a pop from his pack: build.py)
    const pop = (w, t) => {
      tl.fromTo(w, { opacity: 0, x: -20, filter: 'blur(10px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }, t);
      tl.fromTo(w, { scale: 0.78 }, { scale: 1, duration: 0.38, ease: 'back.out(2.4)' }, t);
    };
    const words = (sel, times) => $$(sel + ' .w').forEach((w, i) => pop(w, Array.isArray(times) ? times[i] : times + i * 0.28));
    const out = (sel, t, d = 0.25) => tl.to(sel, { opacity: 0, filter: 'blur(12px)', duration: d, ease: 'power1.in' }, t);
    // a torn strip lands like a piece of paper, its first word with it
    const strip = (sel, t, r, ws) => {
      tl.fromTo(sel, { opacity: 0, scale: 0.92, rotation: r - 3, y: -16 }, { opacity: 1, scale: 1, rotation: r, y: 0, duration: 0.3, ease: 'back.out(1.5)' }, t);
      words(sel, ws);
    };
    // a big word slams in sideways with motion blur (its own SVG filter)
    const slam = (sel, f, t) => {
      tl.fromTo(sel, { opacity: 0, x: -760, scale: 1.04 }, { opacity: 1, x: 0, scale: 1, duration: 0.42, ease: 'power3.out' }, t);
      tl.fromTo(f, { attr: { stdDeviation: '90 0' } }, { attr: { stdDeviation: '0 0' }, duration: 0.4, ease: 'power2.out' }, t);
    };

    // ── the hook: the first word is already half there on frame one
    const hw = $$('#s1 .w');
    // the first line is on screen from frame one (it is also the thumbnail), settling in; the rest arrives word by word
    tl.fromTo(hw.slice(0, 2), { opacity: 0.7, scale: 1.04, filter: 'blur(3px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power2.out' }, 0);
    hw.slice(2).forEach((w, i) => pop(w, T.s1w[i + 2]));
    tl.fromTo('#bar', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, T.bar);
    tl.fromTo('#bar .fill', { clipPath: 'inset(0px 0px 0px 100% round 26px)' }, { clipPath: 'inset(0px 0px 0px 0% round 26px)', duration: 1.0, ease: 'none' }, T.fill);

    // ── the feed: already scrolling as the camera comes down; it slows and stops on his post
    gsap.set('#phoneW', { transformPerspective: 1600, rotationX: 10, rotationY: -16, rotation: 5 });
    tl.to('#phoneW', { rotationX: 6, rotationY: -9, rotation: 3, duration: T.stop - 4.7, ease: 'none' }, 4.7);
    tl.set('#vbs', { attr: { stdDeviation: '0 22' } }, T.scroll);
    tl.fromTo('#feed', { y: 0 }, { y: YF + P, duration: T.slow - T.scroll, ease: 'none' }, T.scroll);
    tl.to('#feed', { y: YF, duration: T.stop - T.slow, ease: 'power1.out' }, T.slow);
    tl.to('#vbs', { attr: { stdDeviation: '0 0' }, duration: T.stop - T.slow, ease: 'power1.out' }, T.slow);
    strip('#t3a', T.t3a, -1.2, T.t3aw); out('#t3a', T.t3aOut);
    strip('#t3b', T.t3b, 1, T.t3bw); out('#t3b', T.stop - 0.12, 0.2);
    tl.to('#phoneW', { rotationX: 0, rotationY: 0, rotation: 0, scale: 1.08, y: -10, duration: 0.7, ease: 'power3.out' }, T.stop);
    tl.fromTo('#bigHeart', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.12, duration: 0.25, ease: 'back.out(2)' }, T.heart);
    tl.to('#bigHeart', { scale: 1, duration: 0.2, ease: 'power2.out' }, T.heart + 0.25);
    tl.to('#bigHeart', { opacity: 0, scale: 1.25, duration: 0.3, ease: 'power2.in' }, T.heart + 0.85);
    strip('#t4', T.t4, -1.4, T.t4w);

    // ── «ليش؟»
    tl.fromTo('#ico5', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, T.ico);
    // «ليش؟» lands on its own and is left to hang for a beat (the disc keeps pulsing), then the answer comes in
    [0.2, 1.0].forEach((d) => { tl.set('#rip5', { opacity: 0.8, scale: 1 }, T.ico + d); tl.to('#rip5', { opacity: 0, scale: 2.4, duration: 0.8, ease: 'power2.out' }, T.ico + d); });
    tl.fromTo('#why .w', { opacity: 0, scale: 0.85, filter: 'blur(12px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'back.out(1.6)' }, T.why);
    tl.to('#why .w', { scale: 1.04, duration: T.bih - T.why - 0.45, ease: 'sine.inOut' }, T.why + 0.45);
    words('#bih', [T.bih]);
    tl.fromTo('#three .w', { opacity: 0, scale: 1.18, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, T.three);

    // ── the wall: at each of the three, the tag swings on its string, a tick, the line, a highlighter
    POINTS.forEach((p, i) => {
      tl.fromTo(`#k${i + 1}`, { opacity: 0, rotation: p.tr - 24 }, { opacity: 1, rotation: p.tr, duration: 0.6, ease: 'back.out(2.2)', transformOrigin: '10% 50%' }, T.tags[i]);
      tl.fromTo(`#l${i + 1} .tick path`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, T.ticks[i]);
      words(`#l${i + 1}`, T.l[i]);
      tl.fromTo(`#l${i + 1} .hlt`, { clipPath: 'polygon(100% 18%, 100% 10%, 100% 16%, 100% 8%, 100% 86%, 100% 94%, 100% 88%, 100% 95%)' },
        { clipPath: 'polygon(1% 18%, 30% 10%, 62% 16%, 99% 8%, 100% 86%, 70% 94%, 36% 88%, 0 95%)', duration: 0.5, ease: 'power2.inOut' }, T.hls[i]);
    });
    strip('#t7', T.t7, -1.2, T.t7w);

    // ── what he makes: each label is slapped on the sheet and pinned, then «وهوية كاملة.» slams in
    $$('.lab8').forEach((el, i) => {
      const r = +el.dataset.r, w = el.querySelector('.w'), pin = el.querySelector('img');
      gsap.set(el, { xPercent: -50 });
      tl.fromTo(el, { opacity: 0, scale: 0.62, rotation: r - 9, y: -14 }, { opacity: 1, scale: 1, rotation: r, y: 0, duration: 0.42, ease: 'back.out(2)' }, T.sv[i]);
      tl.fromTo(w, { opacity: 0, filter: 'blur(8px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, T.sv[i] + 0.04);
      tl.fromTo(pin, { opacity: 0, scale: 1.6, y: -18 }, { opacity: 1, scale: 1, y: 0, duration: 0.22, ease: 'power3.in' }, T.sv[i] + 0.12);
    });
    slam('#slam8', '#h2s', T.slam8);

    // ── the ask: «عجبك الشغل؟ راسلني بالدايركت.. ونبدي بمشروعك.», a paper plane, the button opens into his handle
    strip('#t9', T.t9, -1.4, T.t9w);
    slam('#slam9', '#h3s', T.slam9);
    words('#s9 .ax', T.s9b);
    tl.fromTo('#plane1', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, T.plane);
    tl.fromTo('#plane2', { opacity: 0 }, { opacity: 0.85, duration: 0.3 }, T.plane + 0.35);
    words('#s9 .ruq', T.s9c);
    gsap.set('#btn', { clipPath: 'inset(0px 230px 0px 230px round 50px)' });
    tl.fromTo('#btn', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, T.btn);
    tl.fromTo('#cur', { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: -285, y: -305, duration: 0.55, ease: 'power2.inOut' }, T.cur);
    tl.to('#cur', { scale: 0.85, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, T.click);
    tl.set('#ripB', { opacity: 0.9, scale: 1 }, T.click);
    tl.to('#ripB', { opacity: 0, scale: 2.2, duration: 0.6, ease: 'power2.out' }, T.click);
    tl.fromTo('#btn', { clipPath: 'inset(0px 230px 0px 230px round 50px)' }, { clipPath: 'inset(0px 37px 0px 37px round 50px)', duration: 0.5, ease: 'power3.inOut' }, T.open);
    tl.to('#btn svg', { x: -197, duration: 0.5, ease: 'power3.inOut' }, T.open);
    tl.fromTo('#btn .pl', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, T.open + 0.3);
    tl.to('#cur', { opacity: 0, x: -160, y: -120, duration: 0.4, ease: 'power2.in' }, T.open + 0.4);

    // ── the camera itself, driven by one clock so any frame can be rendered on its own
    const clock = { t: 0 };
    render(0);
    tl.to(clock, { t: D, duration: D, ease: 'none', onUpdate: () => render(clock.t) }, 0);

    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
  }
  document.fonts.ready.then(build);
})();
