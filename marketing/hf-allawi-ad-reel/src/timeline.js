// The motion of my ad reel. One take: the ten ideas sit in a row on a strip over a fixed orange field, and the camera
// holds on each one while it is spoken, then pushes smoothly to the next, right to left. Each idea has one hero cut-out,
// anchored to a frame edge and held through its lines; the words slide up softly in the middle of the frame. From the
// reel standard (../hf-simple-logos-reel): Smart Bounce on the key moments, motion blur on the camera and on everything
// that moves, the frame stepping at 15 fps. Every cue sits on a word of the voice (src/reel.json, from the word times in
// src/words.json); build.py reads the same file for the sounds.
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
  const SETTLE = ae(0, 100), PUSH = ae(62, 62), SOFT = ae(20, 80), AWAY = ae(70, 20);
  // Smart Bounce, «Elastic»: the keyframed move, then the overshoot v·amp·sin(2π·f·t)/e^(decay·t) for a second
  const smart = (k) => (p) => { const t = p * (k + 1); return t < k ? t / k : 1 + 0.05 / k * Math.sin(4 * Math.PI * (t - k)) / Math.exp(4 * (t - k)); };

  // the bags: one on the right, one on the left, then a pile on the bottom of the frame
  const BAG = ['bag-orange', 'bag-black', 'bag-blue', 'bag-black2'];
  const PILE = [[640, 1240], [170, 1260], [20, 1420], [330, 1470], [620, 1450], [840, 1360], [120, 1620], [470, 1640], [760, 1610], [280, 1730], [600, 1760], [900, 1700]];
  PILE.forEach(([x, y], i) => {
    $('#bags').insertAdjacentHTML('beforeend', `<div class="obj bw bag" style="left:${x}px; top:${y}px; width:${220 + (i % 3) * 30}px; transform:rotate(${(Math.sin(i * 1.9) * 10).toFixed(1)}deg)"><img src="assets/el/${BAG[i % 4]}.png" /></div>`);
  });
  $('#patL').innerHTML = Array.from({ length: 16 }, () => `<div>${'منافسيك   '.repeat(3)}</div>`).join('');

  // the captions, from reel.json: [beat, top, size, text («*» marks the dark word), word times, out time, style]; the
  // three words of the phone beat are written on its screen
  R.lines.forEach(([sc, top, size, text, , , st = {}], i) => {
    const d = document.createElement('div');
    d.className = (st.tick ? 'tk' : 'cap') + (st.a ? ' ' + st.a : '') + (st.c ? ' ' + st.c : '');
    d.id = 'L' + i;
    d.style.cssText = `top:${top}px; font-size:${size}px` + (st.rot ? `; transform:rotate(${st.rot}deg)` : '');
    d.innerHTML = text.split(' ').map((w) => (w[0] === '*' ? `<span class="w k">${w.slice(1)}</span>` : `<span class="w">${w}</span>`)).join(' ');
    (st.tick ? $('#tick') : $(`#s${sc}`)).appendChild(d);
  });

  // the one take: the camera holds still on an idea and pushes to the next across each change (0.35 s before it to
  // 0.45 s after), so the words and things of one idea leave together as the next arrives
  const SC = R.scenes.map(([id, a, b], i) => {
    const el = $('#s' + id);
    return { id, a, b: i === R.scenes.length - 1 ? D : b, el, c: el.offsetLeft + 540 };
  });
  const PRE = 0.35, POST = 0.45;
  const camAt = (t) => {
    for (let j = 0; j < SC.length - 1; j++) {
      const B = SC[j].b;
      if (t >= B - PRE && t < B + POST) return SC[j].c + (SC[j + 1].c - SC[j].c) * PUSH((t - (B - PRE)) / (PRE + POST));
    }
    const s = SC.find((x) => t < x.b) || SC[SC.length - 1];
    return s.c;
  };
  const view = (t) => 540 - camAt(t);

  function build() {
    // a line wider than the safe width shrinks to fit
    $$('.cap').forEach((c) => {
      const w = c.scrollWidth, max = 940;
      if (w > max) c.style.fontSize = (parseFloat(c.style.fontSize) * max / w).toFixed(1) + 'px';
    });
    const tl = gsap.timeline({ paused: true });
    // a word rises a little into place; a line leaves by lifting out
    const word = (w, t, st) => {
      if (st.burst) {
        tl.fromTo(w, { opacity: 0, x: -460, scale: 0.35 }, { opacity: 1, x: 0, scale: 1, duration: 0.5, ease: 'power3.out' }, t);
      } else if (st.tick) {
        tl.fromTo(w, { opacity: 0, x: 300 }, { opacity: 1, x: 0, duration: 0.45, ease: 'power3.out' }, t);
      } else {
        tl.fromTo(w, { opacity: 0, y: 42 }, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' }, t);
      }
    };
    R.lines.forEach(([, , , , times, outT, st = {}], i) => {
      $$(`#L${i} .w`).forEach((w, j) => word(w, times[j], st));
      if (outT) {
        if (st.tick) tl.to(`#L${i}`, { x: -300, opacity: 0, duration: 0.3, ease: 'power2.in' }, outT);
        else tl.to(`#L${i}`, { y: -40, opacity: 0, duration: 0.3, ease: 'power2.in' }, outT);
      }
    });
    const pop = (sel, t, from = {}) => {
      tl.set(sel, { opacity: 1 }, t);
      tl.fromTo(sel, { scale: 0 }, { scale: 1, duration: 1.16, ease: smart(0.16) }, t);
      tl.fromTo(sel, { rotation: from.rotation ?? 20 }, { rotation: 0, duration: 1.09, ease: smart(0.09) }, t);
    };
    const punch = (sel, t, s = 1.06) => { tl.to(sel, { scale: s, duration: 0.1, ease: 'power2.out' }, t); tl.to(sel, { scale: 1, duration: 0.45, ease: 'back.out(2)' }, t + 0.1); };
    const enter = (sel, t, from, d = 0.6) => { tl.set(sel, { opacity: 1 }, t); tl.fromTo(sel, from, { x: 0, y: 0, scale: 1, duration: d, ease: SOFT }, t); };
    // a thing that leaves is gone for good once it is out
    const leave = (sel, t, to, d = 0.4) => { tl.to(sel, { ...to, duration: d, ease: AWAY }, t); tl.set(sel, { opacity: 0 }, t + d); };
    const hold = (sel, t0, t1, to) => tl.to(sel, { ...to, duration: t1 - t0, ease: 'sine.inOut' }, t0);

    gsap.set('.obj', { opacity: 0 });

    // ── A · the empty wallet is there from the first frame and turns slowly; «قليلة»: one coin drops in, bounces off and
    //    flies on with the push, landing on the middle phone of the next idea
    tl.set('#wallet', { opacity: 1 }, 0);
    tl.fromTo('#wallet', { y: 60, rotation: -2 }, { y: 0, rotation: -6, duration: 2.6, ease: SETTLE }, 0);
    tl.set('#coin', { opacity: 1 }, 2.1);
    tl.fromTo('#coin', { y: -1300, rotation: -220 }, { y: 0, rotation: 10, duration: 0.28, ease: 'power2.in' }, 2.1);
    tl.to('#wallet', { keyframes: [{ y: 14, duration: 0.06 }, { y: 0, duration: 0.2, ease: 'back.out(3)' }] }, 2.38);
    tl.to('#coin', { x: -700, y: -560, rotation: -200, duration: 0.36, ease: 'power2.out' }, 2.38);
    tl.to('#coin', { x: -1500, y: -40, rotation: -380, scale: 0.6, duration: 0.42, ease: 'power2.in' }, 2.74);
    tl.to('#coin', { opacity: 0, duration: 0.1 }, 3.12);

    // ── B · the phones come up playing my reels and stay; the middle one takes the coin
    [['#phL', 2.25, -9], ['#phR', 2.36, 8], ['#phC', 2.47, -2]].forEach(([sel, t, r]) => {
      enter(sel, t, { y: 1000 }, 0.65);
      tl.fromTo(sel, { rotation: r * 2 }, { rotation: r, duration: 0.65, ease: SOFT }, t);
    });
    punch('#phC', 3.12, 1.04);
    hold('#phC', 3.5, 5.0, { y: -20 });

    // ── D · the megaphone swings in from the left edge and «براندك» comes out of its mouth; it swings away as the shop
    //    owner comes up on «وتبيع»
    enter('#mega', 4.9, { x: -600 }, 0.7);
    tl.fromTo('#mega', { rotation: -26 }, { rotation: -12, duration: 0.7, ease: SOFT }, 4.9);
    tl.to('#mega', { keyframes: [{ scale: 1.08, x: -18, duration: 0.08 }, { scale: 1, x: 0, duration: 0.35, ease: 'back.out(2)' }] }, 6.06);
    leave('#mega', 6.5, { x: -800, rotation: -30 });
    enter('#owner', 6.6, { y: 900 }, 0.6);
    hold('#owner', 7.2, 7.74, { y: -16 });

    // ── F · the phone comes up; on its screen the three words play one after another while the line above changes
    enter('#phF', 7.4, { y: 1000 }, 0.7);
    tl.fromTo('#phF', { rotation: 6 }, { rotation: -3, duration: 0.7, ease: SOFT }, 7.4);
    punch('#phF', 11.83, 1.04);

    // ── I · the hand with the stopwatch comes up from the bottom right; the 3 lands on its word
    enter('#hand', 12.3, { y: 900 }, 0.7);
    tl.fromTo('#hand', { rotation: 8 }, { rotation: -6, duration: 0.7, ease: SOFT }, 12.3);
    pop('#n3', 13.17, { rotation: -14 });

    // ── J · the magnifier glides in and settles on «الكواليتي», which grows under the glass; the handshake comes up,
    //    shakes on «يثق» and holds through «ويدخل يطلب منك مباشرة»
    enter('#lens', 14.5, { x: 600, y: 120 }, 0.85);
    tl.fromTo('#lens', { rotation: 20 }, { rotation: -8, duration: 0.85, ease: SOFT }, 14.5);
    tl.to('#L18 .w:first-child', { scale: 1.16, duration: 0.4, ease: 'power2.out' }, 15.5);
    leave('#lens', 16.25, { x: 700, rotation: 25 });
    enter('#shake', 16.3, { y: 800 }, 0.45);
    tl.to('#shake', { keyframes: [{ y: 18, duration: 0.12 }, { y: -10, duration: 0.12 }, { y: 0, duration: 0.18 }] }, 16.75);
    punch('#shake', 18.55, 1.05);

    // ── L · the king and the pawns come up as the camera arrives; on «يعزلك» the pawns are knocked away to both sides
    //    and منافسيك fills the background
    enter('#king', 18.72, { y: 700 }, 0.7);
    $$('#sL .pawn').forEach((el, i) => enter(el, 18.8 + i * 0.06, { y: 600 }, 0.6));
    $$('#sL .pawn').forEach((el, i) => leave(el, 21.75 + i * 0.05, { x: (i < 2 ? -1 : 1) * 760, y: -200, rotation: (i < 2 ? -1 : 1) * 120 }, 0.55));
    punch('#king', 21.75, 1.06);
    tl.to('#patL', { opacity: 1, duration: 0.6 }, 22.6);

    // ── M · a bag drops on «مرة», another on «ومرتين», the pile on «وعشرة»; the bags sink away and the man with the
    //    binoculars comes up, looking at «براند»
    $$('#bags .bag').forEach((el, i) => enter(el, i === 0 ? 24.95 : i === 1 ? 25.33 : 25.95 + (i - 2) * 0.05, { y: -1500 }, 0.4));
    leave($$('#bags .bag'), 26.45, { y: 900 }, 0.4);
    enter('#watcher', 26.6, { y: 1000 }, 0.65);
    hold('#watcher', 27.3, 28.5, { y: -24 });

    // ── O · the crowd walks along the bottom; the second crowd stops dead when the stop hand comes up on «توقف»;
    //    then the padlock drops and locks on «وتقفل»
    tl.set('#crowd1', { opacity: 1 }, 28.8);
    tl.fromTo('#crowd1', { x: 1100 }, { x: -1100, duration: 3.2, ease: 'none' }, 28.8);
    tl.set('#crowd1', { opacity: 0 }, 32.0);
    tl.set('#crowd2', { opacity: 1 }, 30.7);
    tl.fromTo('#crowd2', { x: 1100 }, { x: 260, duration: 2.35, ease: 'none' }, 30.7);
    tl.to('#crowd2', { x: 200, duration: 0.3, ease: 'power2.out' }, 33.05);
    enter('#stop', 33.0, { y: 900 }, 0.35);
    leave(['#stop', '#crowd2'], 33.95, { y: 900 }, 0.4);
    tl.set('#lock', { opacity: 1 }, 34.05);
    tl.fromTo('#lock', { y: -1200 }, { y: 0, duration: 0.32, ease: 'power2.in' }, 34.05);
    tl.to('#lock', { keyframes: [{ y: 14, duration: 0.06 }, { y: 0, duration: 0.25, ease: 'back.out(3)' }] }, 34.37);

    // ── R · the receiver swings in from the right edge; it goes, and my reels come up on the phones and stay to the end
    enter('#recv', 35.16, { x: 700 }, 0.7);
    tl.fromTo('#recv', { rotation: 24 }, { rotation: 0, duration: 0.7, ease: SOFT }, 35.16);
    punch('#recv', 36.09, 1.05);
    leave('#recv', 36.6, { x: 700, rotation: 20 });
    $$('#sR .rph').forEach((el, i) => enter(el, 36.68 + i * 0.12, { y: 1000 }, 0.65));
    hold($$('#sR .rph')[2], 37.5, 41.2, { y: -24 });
    tl.set('#handle', { opacity: 1 }, 39.55);
    tl.fromTo('#handle', { scale: 0 }, { scale: 1, duration: 1.16, ease: smart(0.16) }, 39.55);
    tl.to('#mark', { opacity: 0, duration: 0.3 }, 39.4);

    // once the camera has left an idea its things are put away
    SC.slice(0, -1).forEach((s) => tl.set($$('.obj, #n3', s.el).filter((e) => e.id !== 'coin'), { opacity: 0 }, s.b + POST + 0.05));

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
        const sx = Math.min(16, Math.abs(x1 - x0) / 4 + Math.abs(z1 - z0) / 20), sy = Math.min(16, Math.abs(y1 - y0) / 4 + Math.abs(z1 - z0) / 20);
        const on = sx + sy > 0.6;
        m.wrap.style.filter = on ? `url(#${m.id})` : 'none';
        if (on) m.f.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
      });
      const x = view(q), x0 = view(Math.max(0, q - SHUTTER));
      strip.style.transform = `translate(${x.toFixed(2)}px, 0px)`;
      mb.setAttribute('stdDeviation', `${Math.min(7, Math.abs(x - x0) / 11).toFixed(2)} 0`);
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
