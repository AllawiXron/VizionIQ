// «ثانية وحدة» v3: the editing grammar of the user's reference reel. One paused timeline, built after the fonts load,
// registered on window.__timelines.main. Times in seconds; build.py's sound cues follow the same numbers.
(function () {
  // Paced like the reference: ~0.28 s between words, a pause after every line, scenes that hold 3–4 s.
  const D = 45;
  const T = {
    hook: [0, 0.45, 0.9, 1.35],
    s2w: [2.3, 2.58, 2.86, 3.9, 4.18], bar: 2.5, fill: 3.0,
    whip1: 5.3,
    rise: 5.4, t3a: [5.75, 6.03, 6.6], t3aOut: 8.0, t3b: [8.3, 8.58, 8.86, 9.14, 9.65],
    flicks: [5.7, 6.85, 8.0, 9.15, 10.3], stop: 11.2, heart: 11.7, t4: [11.5, 11.8, 12.1], zoom1: 13.35,
    ico: 13.75, s5w: [14.05, 14.33, 14.75], reveal1: 15.85,
    cards: [16.3, 20.5, 24.7], l1: [16.75, 17.03, 17.31, 17.59], l2: [20.95, 21.25, 21.55], l3: [25.15, 25.43, 25.71, 25.99],
    sels: [18.3, 22.3, 26.7],
    whip2: 28.8, q0: 29.0, qs: 29.45, t7: [29.35, 29.63, 29.91, 30.19, 30.85], zoom2: 32.9,
    s8: [33.45, 33.73], slam8: 34.35, s8sub: 35.15, reveal2: 36.75,
    s9: [37.35, 37.63], slam9: 38.05, s9b: 38.85, s9c: 39.9, s9d: 41.2, btn: 42.1, cur: 42.4, click: 43.05, open: 43.15,
  };
  const VIS = { h1w: [0, 0.45], h2w: [0.45, 0.9], h3w: [0.9, 1.35], h4w: [1.35, 2.1], s2: [2.1, 5.47], s3: [5.13, 11.2], phoneL: [5.3, 13.68],
    s4: [11.2, 13.68], s5: [13.65, 16.3], s6: [15.85, 28.97], s7: [28.63, 33.22], s8: [33.2, 37.2], s9: [36.75, D] };
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // ── the feed: eleven ordinary posts, then his quzi post
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
      <div style="position:absolute;right:44px;bottom:110px;width:${200 + Math.round(hash(k + 3) * 150)}px;height:34px;border-radius:8px;background:rgba(255,255,255,.7)"></div>
      <div style="position:absolute;right:44px;bottom:62px;width:${120 + Math.round(hash(k + 4) * 120)}px;height:24px;border-radius:6px;background:rgba(255,255,255,.55)"></div>`;
  };
  $('#feed').innerHTML = Array.from({ length: N + 1 }, (_, k) => `<div class="post">
      <div class="ph"><i class="av" style="background:${k === N ? 'linear-gradient(135deg,#f07a2e,#c2441a)' : `linear-gradient(135deg, ${PAL[(k + 3) % PAL.length]}, #9a9a9a)`}"></i><i class="nb" style="width:${110 + Math.round(hash(k + 9) * 80)}px"></i></div>
      <div class="pimg">${k === N ? `<img src="assets/work/saj.jpg" alt="" /><svg id="bigHeart" viewBox="0 0 24 24"><path d="${ICON.heart}" /></svg>` : generic(k)}</div>
      <div class="pa">${svg(ICON.heart)}${svg(ICON.comment)}${svg(ICON.send)}</div>
      <div class="pc"><i style="width:${60 + Math.round(hash(k + 5) * 25)}%"></i><i style="width:${30 + Math.round(hash(k + 6) * 25)}%"></i></div>
    </div>`).join('');

  // ── the selection highlights: measured once the fonts are in (offsets ignore transforms)
  function buildSelections() {
    $$('#list .tl').forEach((tlEl) => {
      const ws = [...tlEl.querySelectorAll('[data-sel]')];
      const l = Math.min(...ws.map((w) => w.offsetLeft)), r = Math.max(...ws.map((w) => w.offsetLeft + w.offsetWidth));
      const s = document.createElement('div');
      s.className = 'sel';
      s.innerHTML = '<i class="bgx"></i><i class="a"></i><i class="b"></i>';
      s.style.right = (tlEl.offsetWidth - r - 6) + 'px';
      s.style.top = (ws[0].offsetTop + 8) + 'px';
      s.style.height = (ws[0].offsetHeight - 8) + 'px';
      s.style.width = (r - l + 12) + 'px';
      s.dataset.w = String(r - l + 12);
      tlEl.appendChild(s);
    });
  }

  function build() {
    buildSelections();
    const tl = gsap.timeline({ paused: true });
    Object.entries(VIS).forEach(([id, [a, b]]) => {
      tl.set('#' + id, { visibility: 'visible' }, a);
      if (b < D) tl.set('#' + id, { visibility: 'hidden' }, b);
    });
    // words come out of a blur, drifting in from the reading side
    const words = (sel, times) => $$(sel + ' .w').forEach((w, i) => tl.fromTo(w, { opacity: 0, x: -24, filter: 'blur(12px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }, Array.isArray(times) ? times[i] : times + i * 0.28));
    const out = (sel, t, d = 0.25) => tl.to(sel, { opacity: 0, filter: 'blur(12px)', duration: d, ease: 'power1.in' }, t);
    // a big word slams in sideways with motion blur (its own SVG filter)
    const slam = (sel, f, t) => {
      tl.fromTo(sel, { opacity: 0, x: -760, scale: 1.04 }, { opacity: 1, x: 0, scale: 1, duration: 0.42, ease: 'power3.out' }, t);
      tl.fromTo(f, { attr: { stdDeviation: '90 0' } }, { attr: { stdDeviation: '0 0' }, duration: 0.4, ease: 'power2.out' }, t);
    };
    // whip-pan: the old scene slides out left, the new one in from the right, both motion-blurred
    const whip = (a, b, t) => {
      const s = t - 0.16;
      tl.set([a, b], { filter: 'url(#hw)' }, s);
      tl.fromTo(b, { x: 1080 }, { x: 0, duration: 0.32, ease: 'power2.inOut' }, s);
      tl.fromTo(a, { x: 0 }, { x: -1080, duration: 0.32, ease: 'power2.inOut' }, s);
      tl.fromTo('#hws', { attr: { stdDeviation: '0 0' } }, { attr: { stdDeviation: '85 0' }, duration: 0.16, ease: 'power1.in' }, s);
      tl.to('#hws', { attr: { stdDeviation: '0 0' }, duration: 0.16, ease: 'power1.out' }, t);
      tl.set([a, b], { filter: 'none' }, t + 0.17);
    };
    // a circle opens from a point into the next scene
    const reveal = (sel, x, y, r0, t, d = 0.4) => tl.fromTo(sel, { clipPath: `circle(${r0}px at ${x}px ${y}px)` },
      { clipPath: `circle(1500px at ${x}px ${y}px)`, duration: d, ease: 'power2.in' }, t);
    // the camera goes through: everything grows, blurs and goes
    const through = (sels, t) => tl.to(sels, { scale: 2.3, opacity: 0, filter: 'blur(18px)', duration: 0.3, ease: 'power2.in' }, t);

    // ── hook: one word per beat, the field flips each time
    T.hook.forEach((t, i) => tl.fromTo(`#h${i + 1}w .w`, { opacity: 0, scale: 1.07, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.2, ease: 'power2.out' }, t));

    // ── one second
    words('#s2', T.s2w);
    tl.fromTo('#bar', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, T.bar);
    tl.fromTo('#bar .fill', { clipPath: 'inset(0px 0px 0px 100% round 28px)' }, { clipPath: 'inset(0px 0px 0px 0% round 28px)', duration: 1.0, ease: 'none' }, T.fill);
    whip('#s2', '#s3', T.whip1);

    // ── the feed: the phone rises tilted, the thumb keeps flicking, every post goes past
    gsap.set('#phoneW', { transformPerspective: 1600 });
    tl.fromTo('#phoneW', { y: 1150, rotationX: 30, rotationY: -20, rotation: 8, filter: 'blur(10px)' },
      { y: 0, rotationX: 10, rotationY: -16, rotation: 5, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out' }, T.rise);
    tl.to('#phoneW', { rotationX: 7, rotationY: -10, rotation: 3, duration: T.stop - T.rise - 0.85, ease: 'none' }, T.rise + 0.85);
    const tg = [-1550, -3150, -4750, -6350, YF];
    T.flicks.forEach((t, i) => {
      const last = i === T.flicks.length - 1;
      tl.to('#feed', { y: tg[i], duration: 0.9, ease: last ? 'power3.out' : 'power2.out' }, t);
      tl.fromTo('#vbs', { attr: { stdDeviation: '0 24' } }, { attr: { stdDeviation: last ? '0 0' : '0 2' }, duration: 0.9, ease: 'power2.out' }, t);
    });
    words('#t3a', T.t3a); out('#t3a', T.t3aOut);
    words('#t3b', T.t3b);

    // ── the stop: the field cuts to black, the phone squares up, a double-tap heart
    tl.to('#phoneW', { rotationX: 0, rotationY: 0, rotation: 0, scale: 1.12, y: -10, duration: 0.6, ease: 'power3.out' }, T.stop);
    tl.fromTo('#bigHeart', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.12, duration: 0.25, ease: 'back.out(2)' }, T.heart);
    tl.to('#bigHeart', { scale: 1, duration: 0.2, ease: 'power2.out' }, T.heart + 0.25);
    tl.to('#bigHeart', { opacity: 0, scale: 1.25, duration: 0.3, ease: 'power2.in' }, T.heart + 0.8);
    words('#t4', T.t4);
    through(['#phoneW', '#t4'], T.zoom1);

    // ── «ليش؟»: the icon pops with a ripple, then opens into the list
    tl.fromTo('#ico5', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, T.ico);
    [0.2, 1.1].forEach((d) => { tl.set('#rip5', { opacity: 0.8, scale: 1 }, T.ico + d); tl.to('#rip5', { opacity: 0, scale: 2.4, duration: 0.8, ease: 'power2.out' }, T.ico + d); });
    words('#s5 .t64', [T.s5w[0], T.s5w[1]]);
    tl.fromTo('#s5 .big .w', { opacity: 0, scale: 1.12, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, T.s5w[2]);
    out(['#s5 .t64', '#s5 .big'], T.reveal1 - 0.12, 0.2);
    tl.to('#ico5', { scale: 3, duration: 0.25, ease: 'power2.in' }, T.reveal1);
    reveal('#s6', 540, 712, 52, T.reveal1);

    // ── the three things: the card swaps, the list builds, each key phrase gets selected
    const cardIn = (c, t, fromX) => tl.fromTo(c, { opacity: 0, x: fromX, scale: fromX ? 1 : 0.92, y: fromX ? 0 : 40, filter: 'blur(14px)' },
      { opacity: 1, x: 0, scale: 1, y: 0, filter: 'blur(0px)', duration: fromX ? 0.45 : 0.6, ease: 'power3.out' }, t);
    const cardOut = (c, t) => tl.to(c, { opacity: 0, x: -620, filter: 'blur(14px)', duration: 0.35, ease: 'power2.in' }, t);
    cardIn('#c1', T.cards[0], 0); cardOut('#c1', T.cards[1] - 0.05); cardIn('#c2', T.cards[1] + 0.05, 620);
    cardOut('#c2', T.cards[2] - 0.05); cardIn('#c3', T.cards[2] + 0.05, 620);
    ['#c1', '#c2', '#c3'].forEach((c, i) => tl.to(c, { scale: 1.035, duration: 3.6, ease: 'none' }, T.cards[i] + 0.5));
    [['#n1', 0], ['#n2', 1], ['#n3', 2]].forEach(([n, i]) => {
      tl.fromTo(n, { opacity: 0 }, { opacity: 1, duration: 0.3 }, T.cards[i] + 0.35);
      if (i < 2) tl.to(n, { opacity: 0, duration: 0.15 }, T.cards[i + 1] - 0.1);
    });
    [['#l1', T.l1], ['#l2', T.l2], ['#l3', T.l3]].forEach(([l, ts], i) => {
      tl.fromTo(`${l} .dot`, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2.2)' }, ts[0] - 0.1);
      words(l, ts);
      const s = $(`${l} .sel`);
      const w = +s.dataset.w;
      tl.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 0.05 }, T.sels[i]);
      tl.fromTo(s.querySelector('.bgx'), { clipPath: 'inset(0px 0px 0px 100%)' }, { clipPath: 'inset(0px 0px 0px 0%)', duration: 0.5, ease: 'power2.inOut' }, T.sels[i]);
      tl.fromTo(s.querySelector('.b'), { x: w }, { x: 0, duration: 0.5, ease: 'power2.inOut' }, T.sels[i]);
    });
    whip('#s6', '#s7', T.whip2);

    // ── the collage: the quzi post first, then the rest fly in from the edges and settle
    const PILE = { q1: [-262, -262, -8], q2: [262, -254, 7], q3: [-268, 262, 6], q4: [266, 270, -6], q5: [-150, 8, -3], q6: [150, -8, 4] };
    gsap.set('#pile .card', { width: 384, height: 480, left: 348, top: 810 });
    tl.fromTo('#q0', { opacity: 0, scale: 1.25, rotation: -2, filter: 'blur(14px)' }, { opacity: 1, scale: 1, rotation: -2, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, T.q0);
    Object.entries(PILE).forEach(([id, [x, y, r]], i) => {
      const m = Math.hypot(x, y) || 1;
      tl.fromTo('#' + id, { opacity: 1, x: x + (x / m) * 1300, y: y + (y / m) * 1300, rotation: r * 4, filter: 'blur(16px)' },
        { opacity: 1, x, y, rotation: r, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, T.qs + i * 0.16);
    });
    tl.fromTo('#pile', { scale: 1 }, { scale: 1.06, duration: T.zoom2 - T.q0, ease: 'none' }, T.q0);
    words('#t7', T.t7);
    tl.fromTo('#n7', { opacity: 0 }, { opacity: 1, duration: 0.4 }, T.qs + 1.2);
    through(['#pile'], T.zoom2); out(['#t7', '#n7'], T.zoom2, 0.2);

    // ── the price: «٣ بوستات», then the number slams in
    words('#s8 .t64', T.s8);
    slam('#slam8', '#h2s', T.slam8);
    words('#s8 .t48', T.s8sub);
    out(['#s8 .tx'], T.reveal2 - 0.2, 0.2);
    tl.fromTo('#dot8', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2)' }, T.reveal2 - 0.1);
    reveal('#s9', 540, 960, 12, T.reveal2 + 0.05, 0.4);

    // ── the ask: one word in the DM, then the button opens into his handle
    words('#s9 .t64:nth-of-type(1)', T.s9);
    slam('#slam9', '#h3s', T.slam9);
    words('#s9 .t64:nth-of-type(3)', T.s9b);
    words('#s9 .t48 .ln:nth-child(1)', T.s9c);
    words('#s9 .t48 .ln:nth-child(2)', T.s9d);
    gsap.set('#btn', { clipPath: 'inset(0px 232px 0px 232px round 48px)' });
    tl.fromTo('#btn', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, T.btn);
    tl.fromTo('#cur', { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: -285, y: -305, duration: 0.6, ease: 'power2.inOut' }, T.cur);
    tl.to('#cur', { scale: 0.85, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, T.click);
    tl.set('#ripB', { opacity: 0.9, scale: 1 }, T.click);
    tl.to('#ripB', { opacity: 0, scale: 2.2, duration: 0.6, ease: 'power2.out' }, T.click);
    tl.fromTo('#btn', { clipPath: 'inset(0px 232px 0px 232px round 48px)' }, { clipPath: 'inset(0px 0px 0px 0px round 48px)', duration: 0.5, ease: 'power3.inOut' }, T.open);
    tl.to('#btn svg', { x: -232, duration: 0.5, ease: 'power3.inOut' }, T.open);
    tl.fromTo('#btn .pl', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, T.open + 0.3);
    tl.to('#cur', { opacity: 0, x: -160, y: -120, duration: 0.4, ease: 'power2.in' }, T.open + 0.4);
    tl.to('#btn', { scale: 1.04, duration: 0.6, yoyo: true, repeat: 3, ease: 'sine.inOut' }, T.open + 1.0);

    tl.set({}, {}, D);
    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
  }
  document.fonts.ready.then(build);
})();
