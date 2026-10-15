// «ثانية وحدة» v4: his highlights' look, the reference reel's motion and calm pace, 38 s. One paused timeline, built
// after the fonts load, registered on window.__timelines.main. Times in seconds; build.py's sound cues follow them.
(function () {
  const D = 38;
  const T = {
    hook: [0, 0.45, 0.9, 1.35],
    s2w: [2.2, 2.48, 2.76, 3.7, 3.98], bar: 2.4, fill: 2.85,
    whip1: 4.9,
    rise: 5.0, t3a: 5.25, t3aw: [5.4, 5.68, 6.2], t3aOut: 7.3, t3b: 7.45, t3bw: [7.6, 7.88, 8.16, 8.44, 8.9],
    flicks: [5.3, 6.35, 7.4, 8.45, 9.2], stop: 10.0, heart: 10.45, t4: 10.2, t4w: [10.35, 10.63, 10.91], zoom1: 11.95,
    ico: 12.3, s5w: [12.55, 12.83, 13.2], reveal1: 14.05,
    cards: [14.5, 17.9, 21.3], l1: [14.95, 15.23, 15.51, 15.79], l2: [18.35, 18.65, 18.95], l3: [21.75, 22.03, 22.31, 22.59],
    hls: [16.2, 19.6, 23.0],
    whip2: 24.6, q0: 24.8, qs: 25.2, t7: 24.95, t7w: [25.1, 25.38, 25.66, 25.94, 26.6], zoom2: 28.3,
    s8: [28.85, 29.13], slam8: 29.7, s8sub: 30.4, reveal2: 31.6,
    t9: 32.15, t9w: [32.3, 32.58], slam9: 32.95, s9b: 33.65, plane: 34.0, s9c: [34.3, 34.58], btn: 35.2, cur: 35.5, click: 36.15, open: 36.25,
  };
  const VIS = { h1w: [0, 0.45], h2w: [0.45, 0.9], h3w: [0.9, 1.35], h4w: [1.35, 2.0], s2: [2.0, 5.07], s3: [4.73, 10.0], phoneL: [4.9, 12.28],
    s4: [10.0, 12.28], s5: [12.25, 14.5], s6: [14.05, 24.77], s7: [24.43, 28.62], s8: [28.6, 32.1], s9: [31.6, D] };
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

  // ── the highlighter swipes: measured once the fonts are in (offsets ignore transforms)
  function buildHighlights() {
    $$('#list .tl').forEach((tlEl) => {
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
    const tl = gsap.timeline({ paused: true });
    Object.entries(VIS).forEach(([id, [a, b]]) => {
      tl.set('#' + id, { visibility: 'visible' }, a);
      if (b < D) tl.set('#' + id, { visibility: 'hidden' }, b);
    });
    // words come out of a blur, drifting in from the reading side
    const words = (sel, times) => $$(sel + ' .w').forEach((w, i) => tl.fromTo(w, { opacity: 0, x: -22, filter: 'blur(12px)' },
      { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.45, ease: 'power2.out' }, Array.isArray(times) ? times[i] : times + i * 0.28));
    const out = (sel, t, d = 0.25) => tl.to(sel, { opacity: 0, filter: 'blur(12px)', duration: d, ease: 'power1.in' }, t);
    // a torn strip lands like a piece of paper, then its words come in
    const strip = (sel, t, r, ws) => {
      tl.fromTo(sel, { opacity: 0, scale: 0.9, rotation: r - 4, y: -20 }, { opacity: 1, scale: 1, rotation: r, y: 0, duration: 0.32, ease: 'back.out(1.6)' }, t);
      words(sel, ws);
    };
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
    const reveal = (sel, x, y, r0, t, d = 0.4) => tl.fromTo(sel, { clipPath: `circle(${r0}px at ${x}px ${y}px)` },
      { clipPath: `circle(1500px at ${x}px ${y}px)`, duration: d, ease: 'power2.in' }, t);
    const through = (sels, t) => tl.to(sels, { scale: 2.3, opacity: 0, filter: 'blur(18px)', duration: 0.3, ease: 'power2.in' }, t);
    // a print slaps down, the tape goes on, the tag swings on its string
    const printIn = (p, tp, tg, t, r, tr) => {
      tl.fromTo(p, { opacity: 0, y: -70, scale: 1.06, rotation: r + 5, filter: 'blur(8px)' }, { opacity: 1, y: 0, scale: 1, rotation: r, filter: 'blur(0px)', duration: 0.42, ease: 'power3.out' }, t);
      tl.fromTo(tp, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power2.out' }, t + 0.3);
      tl.fromTo(tg, { opacity: 0, rotation: tr - 24 }, { opacity: 1, rotation: tr, duration: 0.6, ease: 'back.out(2.2)', transformOrigin: '10% 50%' }, t + 0.5);
    };
    const printOut = (els, t) => tl.to(els, { opacity: 0, x: -640, filter: 'blur(14px)', duration: 0.35, ease: 'power2.in' }, t);

    // ── hook: one word per beat, the field flips each time
    T.hook.forEach((t, i) => tl.fromTo(`#h${i + 1}w .w`, { opacity: 0, scale: 1.07, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.2, ease: 'power2.out' }, t));

    // ── one second
    words('#s2', T.s2w);
    tl.fromTo('#bar', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, T.bar);
    tl.fromTo('#bar .fill', { clipPath: 'inset(0px 0px 0px 100% round 28px)' }, { clipPath: 'inset(0px 0px 0px 0% round 28px)', duration: 1.0, ease: 'none' }, T.fill);
    whip('#s2', '#s3', T.whip1);

    // ── the feed: the phone rises tilted, the thumb keeps flicking, every post goes past
    gsap.set('#phoneW', { transformPerspective: 1600 });
    tl.fromTo('#phoneW', { y: 1150, rotationX: 30, rotationY: -20, rotation: 8, filter: 'blur(10px)' },
      { y: 0, rotationX: 10, rotationY: -16, rotation: 5, filter: 'blur(0px)', duration: 0.85, ease: 'power3.out' }, T.rise);
    tl.to('#phoneW', { rotationX: 7, rotationY: -10, rotation: 3, duration: T.stop - T.rise - 0.85, ease: 'none' }, T.rise + 0.85);
    const tg = [-1550, -3150, -4750, -6350, YF];
    T.flicks.forEach((t, i) => {
      const last = i === T.flicks.length - 1, d = last ? T.stop - t : 0.9;
      tl.to('#feed', { y: tg[i], duration: d, ease: last ? 'power3.out' : 'power2.out' }, t);
      tl.fromTo('#vbs', { attr: { stdDeviation: '0 24' } }, { attr: { stdDeviation: last ? '0 0' : '0 2' }, duration: d, ease: 'power2.out' }, t);
    });
    strip('#t3a', T.t3a, -1.2, T.t3aw); out('#t3a', T.t3aOut);
    strip('#t3b', T.t3b, 1, T.t3bw);

    // ── the stop: the field cuts to brown, the phone squares up, a double-tap heart
    tl.to('#phoneW', { rotationX: 0, rotationY: 0, rotation: 0, scale: 1.12, y: -10, duration: 0.6, ease: 'power3.out' }, T.stop);
    tl.fromTo('#bigHeart', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.12, duration: 0.25, ease: 'back.out(2)' }, T.heart);
    tl.to('#bigHeart', { scale: 1, duration: 0.2, ease: 'power2.out' }, T.heart + 0.25);
    tl.to('#bigHeart', { opacity: 0, scale: 1.25, duration: 0.3, ease: 'power2.in' }, T.heart + 0.8);
    strip('#t4', T.t4, -1.4, T.t4w);
    through(['#phoneW', '#t4'], T.zoom1);

    // ── «ليش؟»: the disc pops with a ripple, then opens into the list
    tl.fromTo('#ico5', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, T.ico);
    [0.2, 1.0].forEach((d) => { tl.set('#rip5', { opacity: 0.8, scale: 1 }, T.ico + d); tl.to('#rip5', { opacity: 0, scale: 2.4, duration: 0.8, ease: 'power2.out' }, T.ico + d); });
    words('#s5 .t76', [T.s5w[0], T.s5w[1]]);
    tl.fromTo('#s5 .big .w', { opacity: 0, scale: 1.12, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, T.s5w[2]);
    out(['#s5 .t76', '#s5 .big'], T.reveal1 - 0.12, 0.2);
    tl.to('#ico5', { scale: 3, duration: 0.25, ease: 'power2.in' }, T.reveal1);
    reveal('#s6', 540, 700, 60, T.reveal1);

    // ── the three things: a print, its tag, a handwritten line with a tick, a highlighter on the key words
    const R = [[-2, -8], [2, 7], [-1.5, -6]];
    [1, 2, 3].forEach((n, i) => {
      printIn(`#c${n}`, `#tp${n}`, `#k${n}`, T.cards[i], R[i][0], R[i][1]);
      tl.to(`#c${n}`, { scale: 1.03, duration: 2.6, ease: 'none' }, T.cards[i] + 0.45);
      if (n < 3) printOut([`#c${n}`, `#tp${n}`, `#k${n}`], T.cards[i + 1] - 0.1);
    });
    [['#l1', T.l1], ['#l2', T.l2], ['#l3', T.l3]].forEach(([l, ts], i) => {
      tl.fromTo(`${l} .tick path`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, ts[0] - 0.2);
      words(l, ts);
      tl.fromTo(`${l} .hlt`, { clipPath: 'polygon(100% 18%, 100% 10%, 100% 16%, 100% 8%, 100% 86%, 100% 94%, 100% 88%, 100% 95%)' },
        { clipPath: 'polygon(1% 18%, 30% 10%, 62% 16%, 99% 8%, 100% 86%, 70% 94%, 36% 88%, 0 95%)', duration: 0.5, ease: 'power2.inOut' }, T.hls[i]);
    });
    whip('#s6', '#s7', T.whip2);

    // ── the collage: the quzi print first, then the rest fly in from the edges and settle
    const PILE = { q1: [-250, -250, -8], q2: [250, -240, 7], q3: [-256, 252, 6], q4: [254, 260, -6], q5: [-140, 8, -3], q6: [140, -8, 4] };
    tl.fromTo('#q0', { opacity: 0, scale: 1.25, rotation: -2, filter: 'blur(14px)' }, { opacity: 1, scale: 1, rotation: -2, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, T.q0);
    Object.entries(PILE).forEach(([id, [x, y, r]], i) => {
      const m = Math.hypot(x, y) || 1;
      tl.fromTo('#' + id, { opacity: 1, x: x + (x / m) * 1300, y: y + (y / m) * 1300, rotation: r * 4, filter: 'blur(16px)' },
        { opacity: 1, x, y, rotation: r, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, T.qs + i * 0.16);
    });
    tl.fromTo('#pile', { scale: 1 }, { scale: 1.06, duration: T.zoom2 - T.q0, ease: 'none' }, T.q0);
    strip('#t7', T.t7, -1.2, T.t7w);
    tl.fromTo('#n7', { opacity: 0 }, { opacity: 1, duration: 0.4 }, T.qs + 1.2);
    through(['#pile'], T.zoom2); out(['#t7', '#n7'], T.zoom2, 0.2);

    // ── the price: «٣ بوستات», then the number slams in
    words('#s8 .t76', T.s8);
    slam('#slam8', '#h2s', T.slam8);
    words('#s8 .ruq', T.s8sub);
    out(['#s8 .tx'], T.reveal2 - 0.2, 0.2);
    tl.fromTo('#dot8', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.15, ease: 'back.out(2)' }, T.reveal2 - 0.1);
    reveal('#s9', 540, 960, 12, T.reveal2 + 0.05, 0.4);

    // ── the ask: «عجبك الشغل؟ راسلني بالدايركت.. ونبدي بمشروعك.», a paper plane, the button opens into his handle
    strip('#t9', T.t9, -1.4, T.t9w);
    slam('#slam9', '#h3s', T.slam9);
    words('#s9 .ax', T.s9b);
    tl.fromTo('#plane1', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, T.plane);
    tl.fromTo('#plane2', { opacity: 0 }, { opacity: 0.85, duration: 0.3 }, T.plane + 0.35);
    words('#s9 .ruq', T.s9c);
    gsap.set('#btn', { clipPath: 'inset(0px 230px 0px 230px round 50px)' });
    tl.fromTo('#btn', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, T.btn);
    tl.fromTo('#cur', { opacity: 0, x: 0, y: 0 }, { opacity: 1, x: -285, y: -305, duration: 0.6, ease: 'power2.inOut' }, T.cur);
    tl.to('#cur', { scale: 0.85, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, T.click);
    tl.set('#ripB', { opacity: 0.9, scale: 1 }, T.click);
    tl.to('#ripB', { opacity: 0, scale: 2.2, duration: 0.6, ease: 'power2.out' }, T.click);
    tl.fromTo('#btn', { clipPath: 'inset(0px 230px 0px 230px round 50px)' }, { clipPath: 'inset(0px 37px 0px 37px round 50px)', duration: 0.5, ease: 'power3.inOut' }, T.open);
    tl.to('#btn svg', { x: -197, duration: 0.5, ease: 'power3.inOut' }, T.open);
    tl.fromTo('#btn .pl', { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, T.open + 0.3);
    tl.to('#cur', { opacity: 0, x: -160, y: -120, duration: 0.4, ease: 'power2.in' }, T.open + 0.4);
    tl.to('#btn', { scale: 1.04, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, T.open + 0.9);

    // every frame the grain moves, as on film
    const film = { f: 0 }, g = $('#grain');
    tl.to(film, { f: D * 30, duration: D, ease: 'none', onUpdate: () => {
      const n = Math.floor(film.f);
      g.style.backgroundPosition = `${Math.floor(hash(n) * 420)}px ${Math.floor(hash(n + 7) * 420)}px`;
    } }, 0);

    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
  }
  document.fonts.ready.then(build);
})();
