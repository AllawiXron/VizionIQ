// The motion of my ad reel: one take over a table of paper sheets, one sheet per line of the voice; the camera glides
// from sheet to sheet and drifts closer while the voice is on one. From the reel standard (../hf-simple-logos-reel):
// letters come out of a blur one at a time, 4.8 frames apart (TextEvo); things pop in with Smart Bounce (amplitude 50,
// frequency 2, decay 4); the whole frame steps (Posterize Time, here 15 fps so every step holds two frames of the 30 fps
// video) with a long shutter so each step carries its motion blur, and a grunge layer sits over it all on multiply.
// Every cue sits on a word of the voice (src/reel.json, made from the word times in src/words.json); build.py reads the
// same file for the sounds.
(function () {
  const R = window.REEL, D = R.D;
  const $ = (s) => document.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
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
  const SETTLE = ae(0, 100), EXIT = ae(100, 0.01), DRIFT = ae(33, 100), EVO = ae(0.1, 100), HOLD = ae(17, 17);
  // Smart Bounce, «Elastic»: the keyframed move, then the overshoot v·amp·sin(2π·f·t)/e^(decay·t) for a second
  const smart = (k) => (p) => { const t = p * (k + 1); return t < k ? t / k : 1 + 0.05 / k * Math.sin(4 * Math.PI * (t - k)) / Math.exp(4 * (t - k)); };

  // the bags: one, two, then a pile of ten
  const BAG = ['bag-orange', 'bag-black', 'bag-blue', 'bag-black2'];
  for (let i = 0; i < 12; i++) {
    const w = 220 + (i % 3) * 30, x = i < 2 ? [260, 560][i] : 60 + ((i * 197) % 780), y = i < 2 ? 760 : 620 + ((i * 131) % 300);
    $('#bags').insertAdjacentHTML('beforeend', `<div class="obj bag" style="left:${x}px; top:${y}px; width:${w}px; transform:rotate(${(Math.sin(i * 1.9) * 12).toFixed(1)}deg)"><img src="assets/el/${BAG[i % 4]}.png" /></div>`);
  }

  // the captions, from reel.json: [scene, top, size, text («*» marks the coloured word), word times, out time, «l» to
  // set the line on the left]
  R.lines.forEach(([sc, top, size, text, times, , align], i) => {
    const d = document.createElement('div');
    d.className = 'cap'; d.id = 'L' + i;
    d.style.cssText = `top:${top}px; font-size:${size}px` + (align === 'l' ? '; text-align:left; left:70px' : '');
    d.innerHTML = text.split(' ').map((w) => {
      // a lam-alef stays in one piece: it is one shape, drawn from two letters
      const k = w[0] === '*', s = k ? w.slice(1) : w;
      return `<span class="w${k ? ' k' : ''}">${(s.match(/ل[اأإآ]|./gu) || []).map((c) => `<span class="l">${c}</span>`).join('')}</span>`;
    }).join(' ');
    $(`#s${sc}`).appendChild(d);
  });

  // the one take: the camera holds on a sheet while its lines are spoken, drifting closer, and glides to the next sheet
  // across each change (0.2 s before it to 0.38 s after), pulling back a little mid-flight
  const SC = R.scenes.map(([id, a, b], i) => ({ id, a, b: i === R.scenes.length - 1 ? D : b, el: $('#s' + id) }));
  const centre = (id) => { const el = $('#p' + id); return [el.offsetLeft + 500, el.offsetTop + 890]; };
  SC.forEach((s) => { s.c = centre(s.id); });
  const K0 = 0.9, K1 = 0.97, PRE = 0.2, POST = 0.38, GLIDE = ae(45, 45);
  const camAt = (t) => {
    for (let j = 0; j < SC.length - 1; j++) {
      const B = SC[j].b;
      if (t >= B - PRE && t < B + POST) {
        const p = GLIDE((t - (B - PRE)) / (PRE + POST)), a = SC[j].c, n = SC[j + 1].c;
        return [a[0] + (n[0] - a[0]) * p, a[1] + (n[1] - a[1]) * p, K1 + (K0 - K1) * p - 0.1 * Math.sin(Math.PI * p)];
      }
    }
    const s = SC.find((x) => t < x.b) || SC[SC.length - 1];
    const a0 = s === SC[0] ? 0 : s.a + POST, a1 = s.b - PRE;
    return [s.c[0], s.c[1], K0 + (K1 - K0) * DRIFT(Math.min(1, Math.max(0, (t - a0) / Math.max(0.1, a1 - a0))))];
  };
  const view = (t) => { const [x, y, k] = camAt(t); return [540 - x * k, 960 - y * k, k]; };

  function build() {
    // a line wider than the safe width shrinks to fit (the letters are laid out already, only hidden)
    $$('.cap').forEach((c) => {
      const w = c.scrollWidth, max = 920;
      if (w > max) c.style.fontSize = (parseFloat(c.style.fontSize) * max / w).toFixed(1) + 'px';
    });
    const tl = gsap.timeline({ paused: true });
    const at = (t) => Math.max(0, t);
    // TextEvo, quicker than the project's (0.55 s a letter, 3.5 frames apart) so every line is sharp before its cut
    const word = (w, t) => $$('.l', w).forEach((l, j) => {
      tl.fromTo(l, { opacity: 0, filter: 'blur(14px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: EVO }, at(t + j * 0.035));
    });
    R.lines.forEach(([, , , , times, outT], i) => {
      $$(`#L${i} .w`).forEach((w, j) => word(w, times[j]));
      if (outT) tl.to(`#L${i}`, { opacity: 0, y: -40, filter: 'blur(16px)', duration: 0.22, ease: 'power2.in' }, outT);
    });
    // Smart Bounce: scale 0 to 100 in 0.16 s and rotation 20 to 0 in 0.09 s, then the elastic overshoot
    const pop = (sel, t, from = {}) => {
      tl.set(sel, { opacity: 1, filter: 'blur(0px)' }, t);
      tl.fromTo(sel, { scale: 0 }, { scale: 1, duration: 1.16, ease: smart(0.16) }, t);
      tl.fromTo(sel, { rotation: from.rotation ?? 20 }, { rotation: 0, duration: 1.09, ease: smart(0.09) }, t);
      tl.fromTo(sel, { x: from.x || 0, y: from.y || 0 }, { x: 0, y: 0, duration: 0.6, ease: SETTLE }, t);
    };
    const push = (sel, t0, t1, s = 1.07, r = 0) => tl.fromTo(sel, { scale: 1, rotation: -r / 2 }, { scale: s, rotation: r / 2, duration: t1 - t0, ease: 'none' }, t0);
    const punch = (sel, t, s = 1.18) => { tl.to(sel, { scale: s, duration: 0.08, ease: 'power2.out' }, t); tl.to(sel, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, t + 0.08); };
    // an object drops in from above trailing four ghost copies of itself, then squashes on landing
    const drop = (sel, t) => {
      const box = $(sel), src = box.dataset.src, f = box.dataset.f;
      [1, 0.5, 0.32, 0.2, 0.1].forEach((o, k) => {
        const im = document.createElement('img');
        im.src = src;
        im.style.cssText = `position:absolute; left:0; top:0; width:100%; filter:${f}; z-index:${10 - k}`;
        box.appendChild(im);
        tl.fromTo(im, { y: -1400, opacity: 0 }, { y: 0, opacity: o, duration: 0.5, ease: 'power4.out' }, t + k * 0.05);
        if (k) tl.to(im, { opacity: 0, duration: 0.25, ease: 'power1.out' }, t + 0.5 + k * 0.05);
      });
      const main = box.firstChild;
      tl.to(main, { scaleY: 0.9, scaleX: 1.06, transformOrigin: '50% 100%', duration: 0.08, ease: 'power2.out' }, t + 0.5);
      tl.to(main, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'back.out(3)' }, t + 0.58);
      return main;
    };

    // ── everything waits on its sheet and comes in as the camera lands there
    gsap.set('.obj', { opacity: 0 });

    const enter = (sel, t, from, to = {}, d = 0.5) => { tl.set(sel, { opacity: 1 }, t); tl.fromTo(sel, from, { x: 0, y: 0, rotation: 0, scale: 1, ...to, duration: d, ease: SETTLE }, t); };
    const leave = (sel, t, to, d = 0.3) => tl.to(sel, { ...to, duration: d, ease: ae(80, 20) }, t);

    // ── A · hands hold out the box; on «أرباحك» it is thrown off and the empty wallet slams down; one coin drops in
    enter('#box', 0.05, { x: 900, y: 120, rotation: 18 }, {}, 0.45);
    push('#box img', 0.5, 1.6, 1.05);
    leave('#box', 1.56, { x: -1300, rotation: -30 });
    enter('#wallet', 1.62, { y: -1300, rotation: -40 }, { rotation: -7 }, 0.32);
    tl.set('#coin', { opacity: 1 }, 2.1);
    tl.fromTo('#coin', { y: -900, rotation: -200 }, { y: 280, rotation: 30, duration: 0.32, ease: 'power2.in' }, 2.1);
    tl.to('#coin', { y: -200, x: 420, rotation: 260, duration: 0.3, ease: 'power2.out' }, 2.42);
    tl.to('#coin', { y: 900, x: 700, rotation: 420, duration: 0.35, ease: 'power2.in' }, 2.72);
    tl.to('#wallet', { keyframes: [{ x: -12, duration: 0.05 }, { x: 10, duration: 0.05 }, { x: 0, duration: 0.05 }] }, 2.42);

    // ── B · the phones come up with my reels playing, the film camera rolls in; on «وبوستات» the phones turn
    [['#phL', 2.66, -9], ['#phR', 2.8, 8], ['#phC', 2.94, -2]].forEach(([sel, t, r]) => enter(sel, t - 0.06, { y: 1300, rotation: r * 3 }, { rotation: r }, 0.55));
    enter('#cam', 2.9, { x: -700, rotation: -20 }, {}, 0.5);
    tl.to(['#phL', '#phR', '#phC'], { rotationY: 360, duration: 0.6, ease: ae(60, 100), stagger: 0.08 }, 4.2);
    tl.to('#cam', { x: -700, rotation: -20, duration: 0.3, ease: ae(80, 20) }, 4.15);

    // ── D · the megaphone swings up and blasts on «براندك»
    enter('#mega', 5.2, { y: 1100, rotation: 30 }, { rotation: -8 }, 0.5);
    tl.to('#mega', { keyframes: [{ scale: 1.12, x: -20, duration: 0.07 }, { scale: 0.98, x: 8, duration: 0.07 }, { scale: 1.04, x: -4, duration: 0.07 }, { scale: 1, x: 0, duration: 0.1 }] }, 6.09);

    // ── E · the shop owner comes up and hands the bag over on «بمكانك»
    enter('#owner', 6.62, { y: 1200 }, {}, 0.5);
    punch('#owner', 7.09, 1.05);

    // ── F · the binoculars come up in front of «حركة» on «تشد العين»
    enter('#bino', 7.74, { y: 1300, rotation: 10 }, {}, 0.45);
    push('#bino img', 8.75, 9.14, 1.06);

    // ── G · the bulb drops on its socket and flickers on
    enter('#bulb', 9.14, { y: -1100 }, {}, 0.4);
    tl.fromTo('#bulb img', { filter: 'brightness(.35) drop-shadow(0 40px 40px rgba(0,0,0,.6))' }, { keyframes: [
      { filter: 'brightness(1.3) drop-shadow(0 0 60px rgba(255,210,120,.9))', duration: 0.05 }, { filter: 'brightness(.5) drop-shadow(0 40px 40px rgba(0,0,0,.6))', duration: 0.06 },
      { filter: 'brightness(1.25) drop-shadow(0 0 70px rgba(255,210,120,.95))', duration: 0.05 }] }, 9.6);
    tl.to('#glow', { backgroundColor: 'rgba(255,200,90,.55)', duration: 0.2 }, 9.7);

    // ── H · the coins rise on «ونتيجة», the cash lands on «مبيعاتك»
    enter('#coins', 10.72, { y: 900 }, {}, 0.55);
    enter('#cash', 11.83, { y: -1200, rotation: -30 }, { rotation: 8 }, 0.35);

    // ── I · the hand comes up with the stopwatch, the «3» bounces in on its word
    enter('#hand', 12.62, { y: 1200, rotation: 10 }, { rotation: -8 }, 0.6);
    pop('#n3', 13.17, { rotation: -20 });

    // ── J · the magnifier sweeps across on «الكواليتي», then the handshake slams in on «يثق»
    enter('#jbag', 14.42, { y: 1200 }, {}, 0.5);
    enter('#lens', 14.6, { x: 900, rotation: 30 }, {}, 0.5);
    tl.to('#lens', { x: -180, y: 160, rotation: -8, duration: 0.6, ease: ae(40, 100) }, 15.37);
    leave('#jbag', 16.3, { y: 1400 });
    tl.to('#lens', { scale: 1.12, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 }, 15.79);
    leave('#lens', 16.3, { x: -1300, rotation: -40 });
    enter('#shake', 16.41, { scale: 2.2 }, {}, 0.3);
    punch('#shake', 16.69, 1.05);

    // ── K · the finger comes down and presses on «مباشرة»
    enter('#press', 17.5, { y: -1300 }, {}, 0.5);
    tl.to('#press', { y: 60, duration: 0.07, ease: 'power2.in', yoyo: true, repeat: 1 }, 18.5);

    // ── L · the king lands in the light among the pawns; on «يعزلك» the pawns fall
    enter('#king', 19.04, { y: -1200 }, {}, 0.45);
    $$('#sL .pawn').forEach((el, i) => enter(el, 19.1 + i * 0.08, { y: 900 }, {}, 0.4));
    $$('#sL .pawn').forEach((el, i) => tl.to(el, { rotation: (i < 2 ? -1 : 1) * 95, x: (i < 2 ? -1 : 1) * 700, y: -120, duration: 0.45, ease: ae(60, 100) }, 21.75 + i * 0.06));
    tl.to('#king', { scale: 1.08, duration: 0.5, ease: 'power2.out' }, 21.75);
    tl.set('#L25', { className: 'cap dim' }, 22.6);

    // ── M · one bag on «مرة», one on «ومرتين», the pile on «وعشرة»
    $$('#bags .bag').forEach((el, i) => enter(el, i === 0 ? 24.97 : i === 1 ? 25.35 : 25.97 + (i - 2) * 0.05, { y: -1400, x: (i % 2 ? 1 : -1) * 150 }, {}, 0.35));

    // ── N · the man with the binoculars rises and leans in
    enter('#watcher', 26.62, { y: 1300 }, {}, 0.55);
    push('#watcher', 27.3, 28.5, 1.08);

    // ── O · the crowd walks past and off; «توقف»: the stop hand slams down; «وتقفل»: the padlock locks
    tl.set('#crowd1', { opacity: 1 }, 28.5);
    tl.fromTo('#crowd1', { x: 1300 }, { x: -1400, duration: 4.4, ease: 'none' }, 28.5);
    tl.set('#crowd2', { opacity: 1 }, 30.6);
    tl.fromTo('#crowd2', { x: 1300 }, { x: -60, duration: 2.45, ease: 'none' }, 30.6);
    tl.to('#crowd2', { x: -1400, duration: 0.5, ease: ae(80, 20) }, 33.05);
    enter('#stop', 33.05, { y: -1400, scale: 1.4 }, {}, 0.25);
    leave('#stop', 33.95, { y: 1400, rotation: 20 });
    enter('#lock', 34.05, { y: -1300 }, {}, 0.3);
    tl.to('#lock', { y: 18, duration: 0.06, yoyo: true, repeat: 1 }, 34.35);

    // ── Q · the receiver swings in, punches on «بالخاص»
    enter('#recv', 35.48, { x: 900, rotation: 40 }, {}, 0.5);
    punch('#recv', 36.09, 1.1);

    // ── R · «شوف أعمالنا»: my reels on the phones; «وخلي»: the phones go and the register drops and rings, cash bursts out; the handle
    $$('#sR .rph').forEach((el, i) => { enter(el, 36.74 + i * 0.08, { y: 1300, rotation: (i - 1) * 30 }, { rotation: [-9, 8, -2][i] }, 0.5); leave(el, 37.45 + i * 0.03, { y: 1500, rotation: (i - 1) * 40 }, 0.35); });
    enter('#register', 37.55, { y: -1400 }, {}, 0.35);
    tl.set('#cashfan', { opacity: 1 }, 38.05);
    tl.fromTo('#cashfan', { y: 300, scale: 0.4, rotation: -20 }, { y: -140, scale: 1, rotation: 6, duration: 0.5, ease: SETTLE }, 38.05);
    punch('#register', 38.71, 1.06);
    tl.set('#handle', { opacity: 1 }, 39.55);
    tl.fromTo('#handle', { scale: 0 }, { scale: 1, duration: 1.16, ease: smart(0.16) }, 39.55);

    tl.to({}, { duration: D }, 0);

    // the clock HyperFrames drives: it holds every step for 1/15 s, plays the timeline there, places the camera over the
    // table and blurs what moved during the shutter: the whole frame for the camera, and each moving thing for its own move
    const mb = $('#mbB'), defs = $('#mb').parentNode, table = $('#table');
    const MOV = SC.map((s) => $$('.obj, #n3', s.el).map((el, i) => {
      const wrap = document.createElement('div'), id = `mb${s.id}${i}`;
      wrap.style.cssText = `position:absolute; inset:0; z-index:${getComputedStyle(el).zIndex}`;
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      defs.insertAdjacentHTML('beforeend', `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0" /></filter>`);
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
        const sx = Math.min(50, Math.abs(x1 - x0) / 2.5 + Math.abs(z1 - z0) / 16), sy = Math.min(50, Math.abs(y1 - y0) / 2.5 + Math.abs(z1 - z0) / 16);
        const on = sx + sy > 0.6;
        m.wrap.style.filter = on ? `url(#${m.id})` : 'none';
        if (on) m.f.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
      });
      const [x, y, k] = view(q), [x0, y0, k0] = view(Math.max(0, q - SHUTTER));
      table.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${k.toFixed(4)})`;
      const sx = Math.min(22, Math.abs(x - x0) / 5 + Math.abs(k - k0) * 110), sy = Math.min(22, Math.abs(y - y0) / 5 + Math.abs(k - k0) * 190);
      mb.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
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
