// The allawi.psd brand-ads reel: one paused timeline, built after the fonts load, registered on window.__timelines.main.
// The look is the dollar reel's analog collage: paper pieces move on twos (12 poses a second) and nudge a pixel or two
// 12 times a second, marker lines boil, the camera itself glides. Times in seconds. The music ("Arab Nights", from
// 12.0 s of the track) drops at 4.0 and hits every 2 s after; T keeps every cue the voice may move.
(function () {
  const D = 25;
  const T = {
    // S1 hook: prints land, fan out, stamps on the drop
    land: [0, 1.0, 2.0, 2.75, 3.0], who: 0.35, fan: 3.25, stamps: [4.0, 4.15, 4.3, 4.45, 4.6], legal: 4.75,
    st1: [0.1, 1.25, 2.25, 3.3],
    // S2 the layers
    s2: 5.0, why: 5.1, whyOut: 5.72, tilt: 5.45, explode: 6.0, labels: [6.3, 6.55, 6.8, 7.05], collapse: 8.0, flat: 8.3, out: 9.6,
    st2: [5.8, 6.15, 6.6, 7.1, 7.5],
    // S3 your shop
    shop: [10.0, 11.0, 12.0], tape: [10.2, 11.2, 12.2], tags: [10.35, 11.35], q: 12.3, arrow: 12.75, st3: [10.1, 11.1, 12.1],
    // S4 the price
    sticky: 14.0, st4a: 14.1, st4b: 14.8, x: 15.0, rip: 15.75, list: 16.0, rows: [16.2, 16.45, 16.7, 16.95], circle: 17.3,
    // S5 the ask
    note: 20.0, st5: 20.1, write: 21.2, handle: 22.0, plane: 22.9,
  };
  const SCENES = [0, 5, 10, 14, 20];

  // seeded randomness (deterministic)
  function seeded(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rnd = seeded(40000);
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const $ = (s) => document.querySelector(s);
  const NS = 'http://www.w3.org/2000/svg';
  const addPath = (svg, d, cls = '') => { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', d); p.setAttribute('pathLength', '1'); if (cls) p.setAttribute('class', cls); svg.appendChild(p); return p; };
  // a hand-drawn loop: an ellipse that overshoots its start, with a little wobble
  const loopPath = (cx, cy, rx, ry, turns = 1.12, start = -2.4) => {
    let d = '';
    for (let k = 0; k <= 60; k++) {
      const a = start + (k / 60) * Math.PI * 2 * turns, wob = 1 + (rnd() - 0.5) * 0.06 + k * 0.0012;
      d += (k ? ' L' : 'M') + (cx + Math.cos(a) * rx * wob).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * wob).toFixed(1);
    }
    return d;
  };
  let pinN = 0;
  const PIN = () => { const id = 'pg' + (pinN++); return `<svg viewBox="0 0 46 46"><defs><radialGradient id="${id}" cx=".34" cy=".3" r=".8"><stop offset="0" stop-color="#ffb48c"/><stop offset=".42" stop-color="#e2541b"/><stop offset="1" stop-color="#7a2a0b"/></radialGradient></defs><ellipse cx="28" cy="29" rx="13" ry="6.5" fill="rgba(0,0,0,.38)"/><path d="M22 30 L27 38" stroke="rgba(0,0,0,.35)" stroke-width="2"/><circle cx="21" cy="19" r="14" fill="url(#${id})"/><circle cx="21" cy="19" r="14" fill="none" stroke="#4a0507" stroke-opacity=".5" stroke-width="1"/><ellipse cx="16" cy="13" rx="5.5" ry="3.6" fill="#fff" opacity=".55"/></svg>`; };
  const pin = (parent, x, y, id) => { const p = document.createElement('div'); p.className = 'pin'; p.id = id; p.style.left = x + 'px'; p.style.top = y + 'px'; p.innerHTML = PIN(); $(parent).appendChild(p); return p; };

  // S5: @allawi.psd as a ransom note, every character cut from a different magazine
  const RANS = [   // lowercase faces only, so l never reads as I
    ['@', "400 118px 'Anton'", '#f4efe4', '#151312', -5, 4],
    ['a', "900 118px 'Playfair Display'", '#e2541b', '#efe6d4', 4, -6],
    ['l', "700 116px 'Courier Prime'", '#1d1a17', '#f6f3ec', -3, 2],
    ['l', "900 120px 'Playfair Display'", '#f6f1e6', '#c2441a', 6, 8],
    ['a', "700 112px 'Courier Prime'", '#1d1a17', '#e6d6a2', -6, -4],
    ['w', "400 118px 'Abril Fatface'", '#1d1a17', '#ece3d4', 3, 6],
    ['i', "900 122px 'Playfair Display'", '#f4efe4', '#151312', -4, -8],
    ['.', "400 118px 'Abril Fatface'", '#f4efe4', '#1d1a17', 7, 24],
    ['p', "400 120px 'Abril Fatface'", '#f6f1e6', '#e2541b', -5, 4],
    ['s', "900 118px 'Playfair Display'", '#1d1a17', '#fbf3e6', 4, -4],
    ['d', "700 116px 'Courier Prime'", '#1d1a17', '#f6f3ec', -3, 6],
  ];
  const rans = $('#rans2');
  RANS.forEach(([ch, font, col, bg, rot, dy], i) => {
    const e = document.createElement('span');
    e.className = 'rn jit'; e.id = 'rn' + i; e.textContent = ch;
    e.style.font = font; e.style.color = col; e.style.background = bg; e.style.marginTop = dy + 'px';
    e.dataset.rot = rot;
    const j = () => (rnd() * 7).toFixed(1);   // scissor cuts: four straight-ish edges, never quite square
    e.style.clipPath = `polygon(${j()}% ${j()}%, ${100 - j()}% ${j()}%, ${100 - j()}% ${100 - j()}%, ${j()}% ${100 - j()}%)`;
    rans.appendChild(e);
  });
  document.querySelectorAll('.print, #blank, #who, .ktag, #sticky, #list, #note').forEach((e) => e.classList.add('jit'));

  function build() {
    // where each sheet's right edge lands in the exploded pose, worked out the way the browser does it (GSAP writes
    // translate · rotate · rotateX · scale; #stage has perspective 2300px with its origin at 540,860). Labels sit in 2D
    // beside those points, so they stay readable while the sheets are tilted.
    const Z = [0, 150, 300, 450], POSE = { rotationX: 56, rotation: -28, scale: 0.78, x: 70, y: 70 };
    const lys = ['#lyBg', '#lyPass', '#lyTxt', '#lyLogo'];
    const project = (lx, ly, z) => {
      const ax = POSE.rotationX * Math.PI / 180, az = POSE.rotation * Math.PI / 180;
      const x0 = lx * POSE.scale, y0 = ly * POSE.scale;
      const y1 = y0 * Math.cos(ax) - z * Math.sin(ax), z1 = y0 * Math.sin(ax) + z * Math.cos(ax);
      const x2 = x0 * Math.cos(az) - y1 * Math.sin(az), y2 = x0 * Math.sin(az) + y1 * Math.cos(az);
      const X = 540 + POSE.x + x2, Y = 420 + 405 + POSE.y + y2, f = 2300 / (2300 - z1);
      return { x: 540 + (X - 540) * f, y: 860 + (Y - 860) * f };
    };
    const anc = Z.map((z) => project(324, 0, z));

    const tl = gsap.timeline({ paused: true });
    // stop-motion: a move is shot on twos, 12 poses a second, so pieces step instead of glide
    const SM = (name, dur, fps = 12) => { const f = gsap.parseEase(name); const n = Math.max(1, Math.round(dur * fps)); return (p) => f(Math.round(p * n) / n); };
    const draw = (sel, t, d, ease = 'power1.inOut') => {
      tl.set(sel, { opacity: 0.92 }, t);
      tl.fromTo(sel, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: d, ease: SM(ease, d, 15), immediateRender: false }, t);
    };
    const slap = (sel, t, to, from = {}) => tl.fromTo(sel, { opacity: 0, scale: (to.scale || 1) * 1.28, rotation: (to.rotation || 0) - 7, ...from },
      { opacity: 1, scale: to.scale || 1, rotation: to.rotation || 0, x: to.x || 0, y: to.y || 0, duration: 0.17, ease: SM('power3.out', 0.17, 24) }, t);
    const tape = (sel, t) => { const r = gsap.getProperty(sel, 'rotation'); tl.fromTo(sel, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, rotation: r, duration: 0.17, ease: SM('power2.out', 0.17) }, t); };
    const pop = (sel, t, rot = 0) => tl.fromTo(sel, { opacity: 0, scale: 0.4, rotation: rot - 10 }, { opacity: 1, scale: 1, rotation: rot, duration: 0.25, ease: SM('back.out(2.4)', 0.25) }, t);
    const strip = (sel, tIn, tOut) => {
      tl.fromTo(sel, { opacity: 0, scale: 1.18, rotation: -3 }, { opacity: 1, scale: 1, rotation: -1.2, duration: 0.14, ease: SM('power3.out', 0.14, 24) }, tIn);
      if (tOut) tl.set(sel, { opacity: 0 }, tOut);
    };
    const words = (sel, times) => document.querySelectorAll(sel + ' .w').forEach((w, k) =>
      tl.fromTo(w, { opacity: 0, filter: 'blur(5px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.18, ease: 'power2.out' }, times[k]));

    // camera on every shot: a rack focus in (not on frame one of the hook), then a slow push with a little handheld drift
    document.querySelectorAll('.scene').forEach((sc, i) => {
      const t0 = +sc.dataset.start, d = +sc.dataset.duration, cam = sc.querySelector('.cam');
      const dx = (rnd() - 0.5) * 30, dy = (rnd() - 0.5) * 24, r0 = (rnd() - 0.5) * 1.2;
      tl.fromTo(cam, { scale: 1.04, x: -dx, y: -dy, rotation: r0 }, { scale: 1.1, x: dx, y: dy, rotation: -r0, duration: d, ease: 'sine.inOut' }, t0);
      if (i > 0) tl.fromTo(cam, { filter: 'blur(14px)' }, { filter: 'blur(0px)', duration: 0.3, ease: 'power2.out', immediateRender: false }, t0);
    });
    SCENES.slice(1).forEach((t) => { tl.set('#flash', { opacity: 0.7 }, t); tl.set('#flash', { opacity: 0.25 }, t + 0.034); tl.set('#flash', { opacity: 0 }, t + 0.067); });
    [4.0, 10.0, 16.0, 20.0].forEach((t) => { tl.fromTo('#leak', { opacity: 0 }, { opacity: 0.8, duration: 0.12, immediateRender: false }, t); tl.to('#leak', { opacity: 0, duration: 0.5, ease: 'power2.out' }, t + 0.12); });

    // ── S1: the pile. Pepsi is already down on frame one; the others slam on top of it on the beat
    const cards = ['#pPepsi', '#pQi', '#pIqa', '#pAsia', '#pTalabat'];
    const PILE = [{ x: -8, y: -20, rotation: -5, scale: 1.2 }, { x: 34, y: 18, rotation: 6, scale: 1.18 }, { x: -30, y: 34, rotation: -3, scale: 1.18 },
      { x: 42, y: -6, rotation: 9, scale: 1.16 }, { x: -38, y: 22, rotation: -8, scale: 1.16 }];
    // dealt out into a loose collage so all five ads (and all five stamps) can be read; x/y are centre offsets from #fan's
    // centre (540, 889), scale 0.62 makes each print about 290 px wide
    const FAN = [[270, 700, -6], [800, 690, 5], [540, 965, -2], [262, 1228, 4], [808, 1215, -5]]
      .map(([cx, cy, r]) => ({ x: cx - 540, y: cy - 889, rotation: r, scale: 0.62 }));
    tl.fromTo('#pPepsi', { ...PILE[0], rotation: -8, opacity: 1 }, { ...PILE[0], duration: 0.34, ease: SM('back.out(2)', 0.34) }, 0);
    cards.slice(1).forEach((c, k) => {
      const t = T.land[k + 1];
      gsap.set(c, { opacity: 0 });
      slap(c, t, PILE[k + 1], { y: PILE[k + 1].y - 60 });
      tl.fromTo('#fan', { y: 12 }, { y: 0, duration: 0.2, ease: SM('power2.out', 0.2, 24), immediateRender: false }, t + 0.1);   // the pile jolts
    });
    tl.fromTo('#who', { opacity: 0, scale: 1.25, rotation: -14 }, { opacity: 1, scale: 1, rotation: -9, duration: 0.17, ease: SM('power2.out', 0.17) }, T.who);
    tl.to('#who', { x: -520, rotation: -30, duration: 0.3, ease: SM('power2.in', 0.3) }, T.fan);
    cards.forEach((c, k) => tl.to(c, { ...FAN[k], duration: 0.42, ease: SM('power3.out', 0.42) }, T.fan + k * 0.03));
    // the stamps come down on the drop, one card each
    cards.forEach((c, k) => {
      const t = T.stamps[k], st = $(c + ' .stamp'), r = parseFloat(st.style.transform.match(/-?[\d.]+/)[0]);
      tl.fromTo(st, { opacity: 0, scale: 1.8, rotation: r }, { opacity: 0.92, scale: 1, rotation: r, duration: 0.09, ease: 'power4.in' }, t);
      tl.fromTo(c, { scale: 0.6 }, { scale: 0.62, duration: 0.12, ease: SM('power2.out', 0.12, 24), immediateRender: false }, t + 0.09);
    });
    tl.fromTo('#s1 .cam', { y: 0 }, { y: 0, keyframes: [{ y: 14, duration: 0.04 }, { y: -8, duration: 0.05 }, { y: 0, duration: 0.08 }], immediateRender: false }, T.stamps[0]);
    tl.fromTo('#legal', { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power1.out' }, T.legal);
    tl.set('#st1a', { opacity: 1, rotation: -1.2 }, 0); tl.set('#st1a', { opacity: 0 }, T.st1[1]);   // the hook line is up on frame one
     strip('#st1b', T.st1[1], T.st1[2]); strip('#st1c', T.st1[2], T.st1[3]); strip('#st1d', T.st1[3]);

    // ── S2: «ليش؟», then the Iraqi Airways ad tilts back and comes apart into its real layers
    tl.fromTo('#why', { opacity: 1, clipPath: 'inset(0 0 0 100%)' }, { opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.3, ease: SM('none', 0.3, 15) }, T.why);
    tl.set('#why', { opacity: 0 }, T.whyOut);
    tl.fromTo('#stack', { rotationX: 0, rotation: 0, scale: 1, x: 0, y: 0 }, { ...POSE, duration: 0.5, ease: SM('power2.inOut', 0.5) }, T.tilt);
    lys.forEach((s, i) => tl.fromTo(s, { z: 0 }, { z: Z[i], duration: 0.4, ease: SM('back.out(1.4)', 0.4) }, T.explode + i * 0.06));
    // labels: kraft tags beside each sheet, a thin marker line to its edge
    const leads = $('#leads');
    anc.forEach((a, i) => {
      const lt = $('#lt' + i), tx = 812, ty = a.y - 53 + [40, 10, -10, -30][i];
      lt.style.left = tx + 'px'; lt.style.top = ty + 'px';
      const p = addPath(leads, `M${tx + 8} ${ty + 56} C ${tx - 30} ${ty + 60}, ${a.x + 50} ${a.y + 4}, ${a.x + 8} ${a.y}`, '');
      p.style.strokeWidth = '6';
      pop('#lt' + i, T.labels[i], [-6, 4, -3, 5][i]);
      draw(p, T.labels[i] + 0.1, 0.22, 'power1.out');
      tl.set([lt, p], { opacity: 0 }, T.collapse - 0.05);
    });
    lys.forEach((s, i) => tl.to(s, { z: 0, duration: 0.3, ease: SM('power3.in', 0.3) }, T.collapse));
    tl.to('#stack', { rotationX: 0, rotation: 0, scale: 1, x: 0, y: 0, duration: 0.5, ease: SM('power2.inOut', 0.5) }, T.flat);
    tl.to('#stack', { y: -1500, rotation: 10, duration: 0.36, ease: SM('power2.in', 0.36) }, T.out);
    strip('#st2', T.st2[0]); words('#st2', T.st2);

    // ── S3: your restaurant, your clinic, any shop
    [['#pSaj', -6], ['#pShifa', 5], ['#blank', -2]].forEach(([s, r], k) => { gsap.set(s, { rotation: r, opacity: 0 }); slap(s, T.shop[k], { rotation: r }, { y: -60 }); });
    ['#tp1', '#tp2', '#tp3'].forEach((s, k) => { gsap.set(s, { opacity: 0 }); tape(s, T.tape[k]); });
    pop('#k1', T.tags[0], -9); pop('#k2', T.tags[1], 7);
    tl.fromTo('#blank .q', { opacity: 1, clipPath: 'inset(0 0 0 100%)' }, { opacity: 1, clipPath: 'inset(0 0 0 0%)', duration: 0.4, ease: SM('none', 0.4, 15) }, T.q);
    const bm = $('#blankMk'), bd = $('#blankDash');
    const dash = addPath(bd, 'M28 28 L412 28 L412 522 L28 522 Z'); dash.style.strokeDasharray = '0.035 0.025'; dash.style.strokeWidth = '7';
    tl.fromTo(dash, { opacity: 0 }, { opacity: 0.85, duration: 0.2, ease: SM('none', 0.2) }, T.q - 0.15);
    draw(addPath(bm, 'M950 1372 C 968 1432, 906 1472, 816 1452 M850 1424 L812 1452 L856 1478'), T.arrow, 0.35);
    strip('#st3', T.st3[0]); words('#st3', T.st3);

    // ── S4: «السعر بالخاص 🤫» crossed out and ripped off; the real prices underneath
    pin('#sticky', 268, -14, 'pinS'); pin('#list', 367, -16, 'pinL');
    gsap.set('#sticky', { rotation: 3, opacity: 0 }); slap('#sticky', T.sticky, { rotation: 3 }, { y: -40 });
    tl.fromTo('#pinS', { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.12, ease: SM('power3.in', 0.12, 24) }, T.sticky + 0.17);
    const sx = $('#stickyX');
    draw(addPath(sx, 'M70 90 C 220 240, 360 380, 520 500'), T.x, 0.12, 'none');
    draw(addPath(sx, 'M520 80 C 380 230, 220 390, 70 510'), T.x + 0.14, 0.12, 'none');
    tl.to('#sticky', { x: -1500, y: -1100, rotation: -60, duration: 0.3, ease: SM('power2.in', 0.3, 24) }, T.rip);
    tl.set('#sticky', { opacity: 0 }, T.rip + 0.32);
    gsap.set('#list', { opacity: 0, rotation: -2 }); slap('#list', T.list, { rotation: -2 }, { y: -50 });
    tl.fromTo('#pinL', { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.12, ease: SM('power3.in', 0.12, 24) }, T.list + 0.17);
    ['#r1', '#r2', '#r3', '#r4'].forEach((s, k) => tl.fromTo(s, { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.3, ease: SM('none', 0.3, 15) }, T.rows[k]));
    draw('#r1ul', T.circle, 0.4, 'power2.out');   // underline «٣ بوستات»
    strip('#st4a', T.st4a, T.st4b); strip('#st4b', T.st4b);

    // ── S5: the note, the handle cut out of magazines, a paper plane for the DM
    gsap.set('#noteW', { rotation: -3, opacity: 0 }); slap('#noteW', T.note, { rotation: -3 }, { y: -50 });
    tl.fromTo('#note div', { clipPath: 'inset(0 0 0 100%)' }, { clipPath: 'inset(0 0 0 0%)', duration: 0.65, ease: SM('none', 0.65, 15) }, T.write);
    tl.fromTo('#handleTxt', { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.out' }, T.handle + 0.85);
    RANS.forEach((r, i) => tl.fromTo('#rn' + i, { opacity: 0, scale: 1.4, rotation: r[4] - 10 }, { opacity: 1, scale: 1, rotation: r[4], duration: 0.12, ease: SM('back.out(2)', 0.12, 24) }, T.handle + i * 0.07));
    const pm = $('#planeMk');
    draw(addPath(pm, 'M150 520 L330 448 L262 612 L236 548 Z M236 548 L330 448'), T.plane, 0.4);
    strip('#st5', T.st5);

    // every frame: the grain moves; 12 times a second the marker lines boil and the paper pieces nudge
    const film = { f: 0 };
    const g = $('#grain'), boil = $('#boilT'), jit = [...document.querySelectorAll('.jit')];
    tl.to(film, { f: D * 30, duration: D, ease: 'none', onUpdate: () => {
      const n = Math.floor(film.f), k = Math.floor(n * 0.4);
      g.style.backgroundPosition = `${Math.floor(hash(n) * 420)}px ${Math.floor(hash(n + 7) * 420)}px`;
      boil.setAttribute('seed', String(k % 7 + 1));
      jit.forEach((e, i) => { e.style.rotate = `${((hash(k * 31 + i * 7) - 0.5) * 0.7).toFixed(2)}deg`; e.style.translate = `${((hash(k * 17 + i * 3) - 0.5) * 2.4).toFixed(1)}px ${((hash(k * 13 + i * 5) - 0.5) * 2.4).toFixed(1)}px`; });
    } }, 0);

    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
  }
  document.fonts.ready.then(build);
})();
