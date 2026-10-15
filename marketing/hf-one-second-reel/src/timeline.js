// «ثانية وحدة» v5, one take: everything sits on one desk and a single camera travels across it, no cuts. One paused
// timeline, built after the fonts load, registered on window.__timelines.main. Times in seconds; build.py's sound
// cues follow T and MOVES.
(function () {
  const D = 38;
  // camera poses: the desk point at the centre of the frame, the scale, the roll (deg)
  const POSE = {
    A1: [10200, 1200, 1, 0], A2: [8900, 1200, 1, 0], A3: [7600, 1200, 1, 0], A4: [6300, 1200, 1, 0],
    B: [6300, 3400, 1, 0], C: [6300, 5700, 1, 0], D: [6300, 5700, 1.08, 0], E: [4700, 5700, 1, 0],
    F1: [4700, 7900, 1, 0], F2: [4700, 9800, 1, 0], F3: [4700, 11700, 1, 0], G: [4800, 9300, 0.29, 0],
    H: [7000, 9300, 1, 0], I: [7000, 11600, 1, 0],
  };
  // [start, end, pose, bank (deg of roll at mid-move)]
  const MOVES = [
    [0.27, 0.45, 'A2', 0], [0.72, 0.9, 'A3', 0], [1.17, 1.35, 'A4', 0], [1.75, 2.35, 'B', 3], [4.55, 5.25, 'C', -3],
    [9.95, 10.5, 'D', 0], [11.9, 12.6, 'E', 4], [14.2, 14.85, 'F1', -3], [17.55, 18.15, 'F2', 2], [20.95, 21.55, 'F3', -2],
    [24.1, 25.4, 'G', 0], [28.2, 28.95, 'H', 3], [31.7, 32.35, 'I', -3],
  ];
  // the sheets on the desk: centre x, centre y, width, height, field, rotation
  const SHEETS = [
    [10200, 1200, 1300, 2300, 'paper', 1.5], [8900, 1200, 1300, 2300, 'orange', -2], [7600, 1200, 1300, 2300, 'paper', 2],
    [6300, 3400, 1300, 2300, 'orange', -1.5], [6300, 5700, 1400, 2300, 'paper', 1], [4700, 9800, 1500, 6200, 'paper', 0.5],
    [4700, 5700, 1300, 2300, 'orange', -3], [7000, 9300, 1300, 2300, 'orange', 2], [7000, 11600, 1300, 2300, 'paper', -1.5],
  ];
  const T = {
    hook: [0.05, 0.4, 0.85, 1.3],
    s2w: [2.35, 2.63, 2.91, 3.75, 4.03], bar: 2.5, fill: 2.9,
    rise: 5.05, t3a: 5.35, t3aw: [5.5, 5.78, 6.3], t3aOut: 7.3, t3b: 7.45, t3bw: [7.6, 7.88, 8.16, 8.44, 8.9],
    flicks: [5.4, 6.4, 7.4, 8.45, 9.2], stop: 10.0, heart: 10.45, t4: 10.15, t4w: [10.3, 10.58, 10.86],
    ico: 12.55, s5w: [12.8, 13.08, 13.45],
    tags: [14.8, 18.1, 21.5], l1: [15.2, 15.48, 15.76, 16.04], l2: [18.5, 18.8, 19.1], l3: [21.9, 22.18, 22.46, 22.74], hls: [16.5, 19.9, 23.3],
    xs: 24.55, t7: 25.25, t7w: [25.4, 25.68, 25.96, 26.24, 26.9, 27.4],
    s8: [29.0, 29.28], slam8: 29.75, s8sub: 30.45,
    t9: 32.4, t9w: [32.55, 32.83], slam9: 33.15, s9b: 33.85, plane: 34.2, s9c: [34.5, 34.78], btn: 35.4, cur: 35.7, click: 36.35, open: 36.45,
  };
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  // ── the desk: lay the sheets under the stations
  const world = $('#world'), firstStation = $('#h1w');
  SHEETS.forEach(([cx, cy, w, h, kind, r]) => {
    const d = document.createElement('div');
    d.className = `bgc ${kind} sheet`;
    d.style.cssText = `left:${cx - w / 2}px; top:${cy - h / 2}px; width:${w}px; height:${h}px; transform:rotate(${r}deg)`;
    world.insertBefore(d, firstStation);
  });

  // ── the camera: holds drift in a little; moves ease in and out, roll a little, and blur along their direction
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  const drift = (P, dt) => [P[0], P[1], P[2] * (1 + 0.025 * Math.min(1, Math.max(0, dt) / 4)), P[3]];
  function cam(t) {
    let prev = POSE.A1, prevEnd = 0;
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
  const view = $('#view'), camBlur = $('#cams'), grain = $('#grain');
  function render(t) {
    const [x, y, s, r] = cam(t), [x0, y0, s0, r0] = cam(Math.max(0, t - 1 / 30));
    world.style.transform = `translate(540px, 960px) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(5)}) translate(${(-x).toFixed(2)}px, ${(-y).toFixed(2)}px)`;
    const zb = Math.abs(Math.log(s / s0)) * 130 + Math.abs(r - r0) * 5;
    const bx = Math.min(55, Math.abs(x - x0) * s * 0.38 + zb), by = Math.min(55, Math.abs(y - y0) * s * 0.38 + zb);
    if (bx < 0.4 && by < 0.4) { view.style.filter = 'none'; camBlur.setAttribute('stdDeviation', '0 0'); }
    else { camBlur.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); view.style.filter = 'url(#camf)'; }
    const n = Math.floor(t * 30);   // film grain moves every frame
    grain.style.backgroundPosition = `${Math.floor(hash(n) * 420)}px ${Math.floor(hash(n + 7) * 420)}px`;
  }

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
    gsap.set('#g', { scale: 1 / POSE.G[2] });
    const tl = gsap.timeline({ paused: true });
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

    // ── hook: one word on each sheet as the camera lands on it
    T.hook.forEach((t, i) => tl.fromTo(`#h${i + 1}w .w`, { opacity: 0, scale: 1.07, filter: 'blur(8px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.2, ease: 'power2.out' }, t));

    // ── one second
    words('#s2', T.s2w);
    tl.fromTo('#bar', { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, T.bar);
    tl.fromTo('#bar .fill', { clipPath: 'inset(0px 0px 0px 100% round 28px)' }, { clipPath: 'inset(0px 0px 0px 0% round 28px)', duration: 1.0, ease: 'none' }, T.fill);

    // ── the feed: the phone slides onto its sheet, the thumb keeps flicking, every post goes past
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
    strip('#t3b', T.t3b, 1, T.t3bw); out('#t3b', T.stop - 0.05, 0.2);

    // ── the stop: the camera pushes in, the phone squares up, a double-tap heart
    tl.to('#phoneW', { rotationX: 0, rotationY: 0, rotation: 0, scale: 1.1, y: -10, duration: 0.6, ease: 'power3.out' }, T.stop);
    tl.fromTo('#bigHeart', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.12, duration: 0.25, ease: 'back.out(2)' }, T.heart);
    tl.to('#bigHeart', { scale: 1, duration: 0.2, ease: 'power2.out' }, T.heart + 0.25);
    tl.to('#bigHeart', { opacity: 0, scale: 1.25, duration: 0.3, ease: 'power2.in' }, T.heart + 0.8);
    strip('#t4', T.t4, -1.4, T.t4w);

    // ── «ليش؟»
    tl.fromTo('#ico5', { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2.2)' }, T.ico);
    [0.2, 1.0].forEach((d) => { tl.set('#rip5', { opacity: 0.8, scale: 1 }, T.ico + d); tl.to('#rip5', { opacity: 0, scale: 2.4, duration: 0.8, ease: 'power2.out' }, T.ico + d); });
    words('#s5 .t76', [T.s5w[0], T.s5w[1]]);
    tl.fromTo('#s5 .big .w', { opacity: 0, scale: 1.12, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'power3.out' }, T.s5w[2]);

    // ── the three things: the tag swings on its string, a tick, the line, a highlighter on the key words
    const TR = [-8, 7, -6];
    [['#l1', T.l1], ['#l2', T.l2], ['#l3', T.l3]].forEach(([l, ts], i) => {
      tl.fromTo(`#k${i + 1}`, { opacity: 0, rotation: TR[i] - 24 }, { opacity: 1, rotation: TR[i], duration: 0.6, ease: 'back.out(2.2)', transformOrigin: '10% 50%' }, T.tags[i]);
      tl.fromTo(`${l} .tick path`, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out' }, ts[0] - 0.2);
      words(l, ts);
      tl.fromTo(`${l} .hlt`, { clipPath: 'polygon(100% 18%, 100% 10%, 100% 16%, 100% 8%, 100% 86%, 100% 94%, 100% 88%, 100% 95%)' },
        { clipPath: 'polygon(1% 18%, 30% 10%, 62% 16%, 99% 8%, 100% 86%, 70% 94%, 36% 88%, 0 95%)', duration: 0.5, ease: 'power2.inOut' }, T.hls[i]);
    });

    // ── the pull-back: the rest of his work lands around the sheet, the caption over it all
    const XR = [-7, 6, 5, -4];
    XR.forEach((r, i) => tl.fromTo(`#x${i + 1}`, { opacity: 0, scale: 1.4, rotation: r + 14, filter: 'blur(10px)' },
      { opacity: 1, scale: 1, rotation: r, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }, T.xs + i * 0.16));
    strip('#t7', T.t7, -1.2, T.t7w);

    // ── the price
    words('#s8 .t76', T.s8);
    slam('#slam8', '#h2s', T.slam8);
    words('#s8 .ruq', T.s8sub);

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

    // ── the camera itself, driven by one clock so any frame can be rendered on its own
    const clock = { t: 0 };
    render(0);
    tl.to(clock, { t: D, duration: D, ease: 'none', onUpdate: () => render(clock.t) }, 0);

    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
  }
  document.fonts.ready.then(build);
})();
