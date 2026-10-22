// The motion of my ad reel. One take: the content sits on a long strip over a fixed coral field and the camera pushes
// through it, mostly right to left with three drops, so each idea pushes the last one out of the frame. The words kick in
// one by one with a small overshoot; the cut-outs come in from the frame edges and act on the words. From the reel
// standard (../hf-simple-logos-reel): Smart Bounce pop-ins, motion blur on the camera and on everything that moves, the
// frame stepping at 15 fps. Every cue sits on a word of the voice (src/reel.json, from the word times in src/words.json);
// build.py reads the same file for the sounds.
(function () {
  const R = window.REEL, D = R.D;
  const $ = (s) => document.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const POSTER = 15, SHUTTER = 1 / 30;

  // After Effects' temporal ease as a curve: outgoing influence of the first key, incoming influence of the second
  const bez = (x1, y1, x2, y2) => (p) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0, hi = 1, u = p;
    for (let i = 0; i < 32; i++) {
      u = (lo + hi) / 2;
      if (3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u < p) lo = u; else hi = u;
    }
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  };
  const ae = (out, inn) => bez(out / 100, 0, 1 - inn / 100, 1);
  const SETTLE = ae(0, 100), PUSH = ae(55, 85), DRIFT = ae(33, 100);
  // Smart Bounce, «Elastic»: the keyframed move, then the overshoot v·amp·sin(2π·f·t)/e^(decay·t) for a second
  const smart = (k) => (p) => { const t = p * (k + 1); return t < k ? t / k : 1 + 0.05 / k * Math.sin(4 * Math.PI * (t - k)) / Math.exp(4 * (t - k)); };

  // the bags: one, two, then a pile at the bottom of the frame
  const BAG = ['bag-orange', 'bag-black', 'bag-blue', 'bag-black2'];
  const PILE = [[180, 1230], [600, 1210], [30, 1400], [330, 1450], [640, 1420], [850, 1330], [120, 1600], [470, 1620], [760, 1600], [280, 1700], [600, 1760], [900, 1690]];
  PILE.forEach(([x, y], i) => {
    $('#bags').insertAdjacentHTML('beforeend', `<div class="obj bw bag" style="left:${x}px; top:${y}px; width:${210 + (i % 3) * 30}px; transform:rotate(${(Math.sin(i * 1.9) * 12).toFixed(1)}deg)"><img src="assets/el/${BAG[i % 4]}.png" /></div>`);
  });
  // the faint words behind two of the beats
  const pattern = (sel, word) => { $(sel).innerHTML = Array.from({ length: 16 }, () => `<div>${(word + '   ').repeat(8)}</div>`).join(''); };
  pattern('#patL', 'منافسيك');
  pattern('#patR', 'أعمالنا');

  // the captions, from reel.json: [beat, top, size, text («*» marks the dark word), word times, out time, style]
  R.lines.forEach(([sc, top, size, text, , , st = {}], i) => {
    const d = document.createElement('div');
    d.className = 'cap' + (st.a ? ' ' + st.a : '') + (st.c ? ' ' + st.c : '');
    d.id = 'L' + i;
    d.style.cssText = `top:${top}px; font-size:${size}px` + (st.rot ? `; transform:rotate(${st.rot}deg)` : '');
    d.innerHTML = text.split(' ').map((w) => (w[0] === '*' ? `<span class="w k">${w.slice(1)}</span>` : `<span class="w">${w}</span>`)).join(' ');
    $(`#s${sc}`).appendChild(d);
  });

  // the one take: the camera holds on a beat while it is spoken, drifting a little towards the next one, and pushes
  // across each change (0.25 s before it to 0.35 s after)
  const SC = R.scenes.map(([id, a, b], i) => {
    const el = $('#s' + id);
    return { id, a, b: i === R.scenes.length - 1 ? D : b, el, c: [el.offsetLeft + 540, el.offsetTop + 960] };
  });
  const PRE = 0.25, POST = 0.35;
  const camAt = (t) => {
    for (let j = 0; j < SC.length - 1; j++) {
      const B = SC[j].b;
      if (t >= B - PRE && t < B + POST) {
        const p = PUSH((t - (B - PRE)) / (PRE + POST)), a = lean(j, B - PRE), n = SC[j + 1].c;
        return [a[0] + (n[0] - a[0]) * p, a[1] + (n[1] - a[1]) * p];
      }
    }
    const j = SC.findIndex((x) => t < x.b);
    return lean(j < 0 ? SC.length - 1 : j, t);
  };
  // while a beat holds, the camera leans 40 px towards where it goes next
  function lean(j, t) {
    const s = SC[j], n = SC[j + 1], a0 = j === 0 ? 0 : s.a + POST, a1 = s.b - PRE;
    if (!n) return s.c;
    const k = DRIFT(Math.min(1, Math.max(0, (t - a0) / Math.max(0.1, a1 - a0))));
    const dx = Math.sign(n.c[0] - s.c[0]) * 40, dy = Math.sign(n.c[1] - s.c[1]) * 40;
    return [s.c[0] + dx * k, s.c[1] + dy * k];
  }
  const view = (t) => { const [x, y] = camAt(t); return [540 - x, 960 - y]; };

  function build() {
    // a line wider than the safe width shrinks to fit
    $$('.cap').forEach((c) => {
      const w = c.scrollWidth, max = c.classList.contains('r') || c.classList.contains('l') ? 960 : 950;
      if (w > max) c.style.fontSize = (parseFloat(c.style.fontSize) * max / w).toFixed(1) + 'px';
    });
    const tl = gsap.timeline({ paused: true });
    // a word kicks in from below with a small overshoot; a line leaves by lifting out
    const word = (w, t, burst) => {
      tl.fromTo(w, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: 'none' }, t);
      if (burst) tl.fromTo(w, { x: -420, scale: 0.2, rotation: -12 }, { x: 0, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(1.6)' }, t);
      else tl.fromTo(w, { y: 70, scale: 0.6 }, { y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.9)' }, t);
    };
    R.lines.forEach(([sc, , , , times, outT, st = {}], i) => {
      $$(`#L${i} .w`).forEach((w, j) => word(w, times[j], sc === 'D' && i === 7));
      if (outT) tl.to(`#L${i}`, { y: -90, opacity: 0, duration: 0.24, ease: ae(80, 20) }, outT);
    });
    const pop = (sel, t, from = {}) => {
      tl.set(sel, { opacity: 1 }, t);
      tl.fromTo(sel, { scale: 0 }, { scale: 1, duration: 1.16, ease: smart(0.16) }, t);
      tl.fromTo(sel, { rotation: from.rotation ?? 20 }, { rotation: from.to ?? 0, duration: 1.09, ease: smart(0.09) }, t);
    };
    const punch = (sel, t, s = 1.1) => { tl.to(sel, { scale: s, duration: 0.08, ease: 'power2.out' }, t); tl.to(sel, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t + 0.08); };
    const enter = (sel, t, from, to = {}, d = 0.5) => { tl.set(sel, { opacity: 1 }, t); tl.fromTo(sel, from, { x: 0, y: 0, scale: 1, ...to, duration: d, ease: SETTLE }, t); };
    const leave = (sel, t, to, d = 0.3) => tl.to(sel, { ...to, duration: d, ease: ae(80, 20) }, t);

    gsap.set('.obj', { opacity: 0 });

    // ── A · the box comes in from the right edge; «أرباحك»: the wallet slams it away; «قليلة»: one coin drops on the
    //    wallet and bounces off into the next beat, onto the middle phone
    enter('#box', 0.0, { x: 700, rotation: 14 }, { rotation: 0 }, 0.5);
    leave('#box', 1.58, { x: 900, rotation: 24 });
    enter('#wallet', 1.62, { y: -1300, rotation: -40 }, { rotation: -7 }, 0.3);
    tl.to('#wallet', { keyframes: [{ x: -14, duration: 0.05 }, { x: 10, duration: 0.05 }, { x: 0, duration: 0.05 }] }, 2.38);
    tl.set('#coin', { opacity: 1 }, 2.1);
    tl.fromTo('#coin', { y: -900, rotation: -220 }, { y: 250, rotation: 20, duration: 0.28, ease: 'power2.in' }, 2.1);
    tl.to('#coin', { x: -560, y: -160, rotation: -200, duration: 0.3, ease: 'power2.out' }, 2.38);
    tl.to('#coin', { x: -1095, y: 305, rotation: -380, scale: 0.5, duration: 0.42, ease: 'power2.in' }, 2.68);
    tl.to('#coin', { opacity: 0, duration: 0.06 }, 3.08);

    // ── B · the phones come up from the bottom playing my reels; the film camera rolls in; on «وبوستات» they turn over
    [['#phL', 2.5, -10], ['#phR', 2.62, 9], ['#phC', 2.74, -2]].forEach(([sel, t, r]) => enter(sel, t, { y: 1300, rotation: r * 3 }, { rotation: r }, 0.5));
    enter('#cam', 3.4, { x: -600, rotation: -20 }, { rotation: 0 }, 0.45);
    punch('#phC', 3.1, 1.06);
    tl.to(['#phL', '#phR', '#phC'], { rotationY: 360, duration: 0.6, ease: ae(60, 100), stagger: 0.08 }, 4.2);

    // ── D · the megaphone swings in from the left edge and blasts «براندك» out of its mouth; it is thrown out as the
    //    shop owner rises from the bottom on «وتبيع»
    enter('#mega', 5.2, { x: -700, rotation: -40 }, { rotation: -14 }, 0.45);
    tl.to('#mega', { keyframes: [{ scale: 1.1, x: -26, duration: 0.07 }, { scale: 0.97, x: 8, duration: 0.07 }, { scale: 1.03, x: -4, duration: 0.07 }, { scale: 1, x: 0, duration: 0.1 }] }, 6.06);
    leave('#mega', 6.55, { x: -900, rotation: -40 });
    enter('#owner', 6.6, { y: 1150 }, {}, 0.5);
    punch('#owner', 7.09, 1.04);

    // ── F · binoculars up from the bottom on «حركة»; the bulb drops on its cord on «فكرة» and flickers on; the coins
    //    rise on «ونتيجة», the cash lands on «مبيعاتك»
    enter('#bino', 7.74, { y: 900 }, {}, 0.5);
    tl.set(['#bulb', '#cord'], { opacity: 1 }, 9.14);
    tl.fromTo(['#bulb', '#cord'], { y: -760 }, { y: 0, duration: 0.42, ease: 'back.out(1.4)' }, 9.14);
    tl.fromTo('#bulb img', { filter: 'grayscale(1) brightness(.6) drop-shadow(0 18px 22px rgba(110,10,0,.35))' }, { keyframes: [
      { filter: 'grayscale(0) brightness(1.3) drop-shadow(0 0 60px rgba(255,226,150,.95))', duration: 0.05 },
      { filter: 'grayscale(1) brightness(.6) drop-shadow(0 18px 22px rgba(110,10,0,.35))', duration: 0.06 },
      { filter: 'grayscale(0) brightness(1.25) drop-shadow(0 0 80px rgba(255,226,150,.95))', duration: 0.05 }] }, 9.6);
    enter('#coins', 10.72, { y: 900 }, {}, 0.5);
    enter('#cash', 11.83, { y: -1000, rotation: -30 }, { rotation: 8 }, 0.32);

    // ── I · the hand with the stopwatch comes up; the giant 3 bounces in on its word
    enter('#hand', 12.6, { y: 1200, rotation: 10 }, { rotation: -6 }, 0.55);
    pop('#n3', 13.17, { rotation: -16 });

    // ── J · the magnifier comes in from the right and passes over «الكواليتي», which swells under it; the handshake
    //    slams in on «يثق»; the finger comes down from the top and presses on «مباشرة»
    enter('#lens', 14.5, { x: 700, rotation: 30 }, { rotation: -12 }, 0.5);
    tl.to('#lens', { x: -380, y: 90, rotation: -4, duration: 0.6, ease: ae(40, 100) }, 15.37);
    tl.to('#L18 .w:first-child', { scale: 1.22, duration: 0.25, ease: 'power2.out' }, 15.55);
    tl.to('#L18 .w:first-child', { scale: 1, duration: 0.3, ease: 'power2.inOut' }, 16.0);
    leave('#lens', 16.3, { x: -1200, rotation: -40 });
    enter('#shake', 16.41, { scale: 1.7 }, {}, 0.28);
    punch('#shake', 16.69, 1.04);
    leave('#shake', 17.42, { y: 1200 });
    enter('#press', 17.5, { y: -900 }, {}, 0.45);
    tl.to('#press', { y: 50, duration: 0.07, ease: 'power2.in', yoyo: true, repeat: 1 }, 18.48);

    // ── L · the king drops in among the pawns; on «يعزلك» the pawns are knocked out of the frame and the word
    //    منافسيك fills the background
    enter('#king', 19.04, { y: -1200 }, {}, 0.45);
    $$('#sL .pawn').forEach((el, i) => enter(el, 19.12 + i * 0.07, { y: 700 }, {}, 0.4));
    $$('#sL .pawn').forEach((el, i) => tl.to(el, { x: (i < 2 ? -1 : 1) * 900, y: -260, rotation: (i < 2 ? -1 : 1) * 140, duration: 0.5, ease: ae(60, 100) }, 21.75 + i * 0.05));
    punch('#king', 21.75, 1.08);
    tl.to('#patL', { opacity: 1, duration: 0.5 }, 21.8);
    tl.to('#patL', { opacity: 0, duration: 0.25 }, 23.25);

    // ── M · a bag drops on «مرة», another on «ومرتين», the pile on «وعشرة»
    $$('#bags .bag').forEach((el, i) => enter(el, i === 0 ? 24.97 : i === 1 ? 25.35 : 25.97 + (i - 2) * 0.05, { y: -1500, rotation: (i % 2 ? 1 : -1) * 30 }, { rotation: Math.sin(i * 1.9) * 12 }, 0.35));

    // ── N · the man with the binoculars comes up from the bottom, looking at «براند»
    enter('#watcher', 26.6, { y: 1300 }, {}, 0.55);
    tl.to('#watcher', { y: -30, duration: 1.3, ease: DRIFT }, 27.2);

    // ── O · the crowds walk along the bottom without looking; «توقف»: the stop hand comes up and the crowd scatters;
    //    «وتقفل»: the padlock drops and locks
    tl.set('#crowd1', { opacity: 1 }, 28.4);
    tl.fromTo('#crowd1', { x: 1100 }, { x: -1150, duration: 3.9, ease: 'none' }, 28.4);
    tl.set('#crowd2', { opacity: 1 }, 30.6);
    tl.fromTo('#crowd2', { x: 1100 }, { x: 40, duration: 2.45, ease: 'none' }, 30.6);
    leave('#crowd2', 33.05, { x: -1200 }, 0.4);
    enter('#stop', 33.05, { y: 1100 }, {}, 0.25);
    leave('#stop', 33.95, { y: 1200 });
    enter('#lock', 34.05, { y: -1100 }, {}, 0.3);
    tl.to('#lock', { y: 16, duration: 0.06, yoyo: true, repeat: 1 }, 34.35);

    // ── R · the receiver swings in from the right edge; my reels come up on the phones under «أعمالنا»; the register
    //    comes up, rings and throws its cash; the handle
    enter('#recv', 35.45, { x: 800, rotation: 35 }, { rotation: 0 }, 0.5);
    punch('#recv', 36.09, 1.08);
    leave('#recv', 36.7, { x: 900, rotation: 30 });
    $$('#sR .rph').forEach((el, i) => { enter(el, 36.74 + i * 0.08, { y: 1300, rotation: (i - 1) * 30 }, { rotation: [-10, 9, -2][i] }, 0.5); leave(el, 37.42 + i * 0.03, { y: 1500 }, 0.32); });
    tl.to('#patR', { opacity: 1, duration: 0.5 }, 36.8);
    tl.to('#patR', { opacity: 0, duration: 0.3 }, 37.45);
    enter('#register', 37.5, { y: 1200 }, {}, 0.42);
    tl.set('#cashfan', { opacity: 1 }, 38.05);
    tl.fromTo('#cashfan', { y: 320, scale: 0.4, rotation: -20 }, { y: -140, scale: 1, rotation: 6, duration: 0.5, ease: SETTLE }, 38.05);
    punch('#register', 38.71, 1.06);
    tl.set('#handle', { opacity: 1 }, 39.55);
    tl.fromTo('#handle', { scale: 0 }, { scale: 1, duration: 1.16, ease: smart(0.16) }, 39.55);
    tl.to('#mark', { opacity: 0, duration: 0.2 }, 39.45);

    // a beat's things go once the camera has left it
    SC.slice(0, -1).forEach((s) => tl.set($$('.obj', s.el).filter((e) => e.id !== 'coin'), { opacity: 0 }, s.b + 0.7));

    tl.to({}, { duration: D }, 0);

    // the clock HyperFrames drives: it holds every step for 1/15 s, plays the timeline there, places the camera on the
    // strip and blurs what moved during the shutter: the whole frame for the camera, each moving thing for its own move
    const mb = $('#mbB'), defs = $('#mb').parentNode, strip = $('#strip');
    const MOV = SC.map((s) => $$('.obj, #n3', s.el).map((el, i) => {
      const wrap = document.createElement('div'), id = `mb${s.id}${i}`;
      wrap.style.cssText = `position:absolute; inset:0; z-index:${getComputedStyle(el).zIndex}`;
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      defs.insertAdjacentHTML('beforeend', `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0" /></filter>`);
      return { el, wrap, id, f: defs.lastElementChild.firstElementChild };
    }));
    const box = (m) => { const r = m.el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width + r.height]; };
    const render = (t) => {
      const q = Math.min(D, Math.floor((t + 0.03) * POSTER) / POSTER);
      let si = SC.findIndex((x) => q < x.b); if (si < 0) si = SC.length - 1;
      const mov = [].concat(MOV[si - 1] || [], MOV[si], MOV[si + 1] || []);
      tl.totalTime(Math.max(0, q - SHUTTER), true);
      const before = mov.map(box);
      tl.totalTime(q, false);
      mov.forEach((m, i) => {
        const [x1, y1, z1] = box(m), [x0, y0, z0] = before[i];
        const sx = Math.min(40, Math.abs(x1 - x0) / 2.5 + Math.abs(z1 - z0) / 16), sy = Math.min(40, Math.abs(y1 - y0) / 2.5 + Math.abs(z1 - z0) / 16);
        const on = sx + sy > 0.6;
        m.wrap.style.filter = on ? `url(#${m.id})` : 'none';
        if (on) m.f.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
      });
      const [x, y] = view(q), [x0, y0] = view(Math.max(0, q - SHUTTER));
      strip.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      mb.setAttribute('stdDeviation', `${Math.min(24, Math.abs(x - x0) / 5).toFixed(2)} ${Math.min(24, Math.abs(y - y0) / 5).toFixed(2)}`);
    };
    const clock = { now: 0 };
    Object.defineProperty(clock, 't', { get() { return this.now; }, set(v) { this.now = v; render(v); } });
    const main = gsap.timeline({ paused: true });
    main.fromTo(clock, { t: 0 }, { t: D, duration: D, ease: 'none' }, 0);
    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = main;
  }
  document.fonts.ready.then(build);
})();
