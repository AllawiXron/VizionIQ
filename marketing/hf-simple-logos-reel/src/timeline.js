// The reel's motion, copied move for move from the reference reel: words come out of a sideways blur one by one, the
// hero object holds the centre with a deep shadow and a slow push, objects burst in from the corners with an overshoot,
// whips carry a motion blur, hard cuts land in the next colour world, a logo drops in trailing its echoes, a row of
// logos slides past, a word falls apart. Every cue sits on a word of the voice (src/reel.json, made from the word times
// in src/words.json); build.py reads the same file for the sounds.
(function () {
  const R = window.REEL, D = R.D;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // the captions, from reel.json: [scene, top, size, text («*» marks the coloured word), word times, out time]
  R.lines.forEach(([sc, top, size, text, times], i) => {
    const d = document.createElement('div');
    d.className = 'cap'; d.id = 'L' + i;
    d.style.cssText = `top:${top}px; font-size:${size}px`;
    d.innerHTML = text.split(' ').map((w) => w[0] === '*' ? `<span class="w k">${w.slice(1)}</span>` : `<span class="w">${w}</span>`).join(' ');
    $('#s' + sc).appendChild(d);
  });

  function build() {
    // a line wider than the safe width shrinks to fit (the words are laid out already, only hidden)
    $$('.cap').forEach((c) => {
      const w = c.scrollWidth, max = 960;
      if (w > max) c.style.fontSize = (parseFloat(c.style.fontSize) * max / w).toFixed(1) + 'px';
    });
    const tl = gsap.timeline({ paused: true });
    const at = (t) => Math.max(0, t);
    // a word slides in from the reading side out of a blur, with a small pop
    const word = (w, t) => {
      tl.fromTo(w, { opacity: 0, x: -46, filter: 'blur(14px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.32, ease: 'power3.out' }, at(t));
      tl.fromTo(w, { scale: 0.86 }, { scale: 1, duration: 0.34, ease: 'back.out(2.2)' }, at(t));
    };
    R.lines.forEach(([, , , , times, outT], i) => {
      $$(`#L${i} .w`).forEach((w, j) => word(w, times[j]));
      if (outT) tl.to(`#L${i}`, { opacity: 0, y: -40, filter: 'blur(16px)', duration: 0.22, ease: 'power2.in' }, outT);
    });
    const pop = (sel, t, from = {}) => tl.fromTo(sel, { opacity: 0, scale: 0.2, y: 60, filter: 'blur(10px)', ...from },
      { opacity: 1, scale: 1, x: 0, y: 0, rotation: 0, filter: 'blur(0px)', duration: 0.42, ease: 'back.out(2.4)' }, t);
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

    // ── scenes and the transitions between them
    const S = Object.fromEntries(R.scenes.map(([id, a, b]) => [id, [a, b]]));
    gsap.set('.sc', { autoAlpha: 0 });
    gsap.set('#sA', { autoAlpha: 1 });
    gsap.set('.obj, .print, .logo, .disc', { opacity: 0 });
    R.scenes.forEach(([id, a, b]) => tl.fromTo(`#s${id} .world`, { scale: 1 }, { scale: 1.06, duration: b - a + 0.4, ease: 'none' }, a));
    const show = (b, t) => tl.set(`#s${b}`, { autoAlpha: 1 }, t);
    const hide = (a, t) => tl.set(`#s${a}`, { autoAlpha: 0 }, t);
    const TR = {
      whipH: (a, b, t) => {
        tl.to(`#s${a}`, { x: -1100, filter: 'blur(34px)', duration: 0.24, ease: 'power2.in' }, t - 0.12); hide(a, t + 0.12); show(b, t);
        tl.fromTo(`#s${b}`, { x: 1100, filter: 'blur(34px)' }, { x: 0, filter: 'blur(0px)', duration: 0.34, ease: 'power3.out' }, t);
      },
      whipV: (a, b, t) => {
        tl.to(`#s${a}`, { y: -1950, filter: 'blur(34px)', duration: 0.24, ease: 'power2.in' }, t - 0.12); hide(a, t + 0.12); show(b, t);
        tl.fromTo(`#s${b}`, { y: 1950, filter: 'blur(34px)' }, { y: 0, filter: 'blur(0px)', duration: 0.36, ease: 'power3.out' }, t);
      },
      cut: (a, b, t) => {
        hide(a, t); show(b, t);
        tl.fromTo(`#s${b}`, { scale: 1.16, filter: 'blur(18px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.34, ease: 'power3.out' }, t);
      },
      zoom: (a, b, t) => {
        tl.to(`#s${a}`, { scale: 2.4, filter: 'blur(30px)', opacity: 0, duration: 0.3, ease: 'power2.in' }, t - 0.3); hide(a, t); show(b, t);
        tl.fromTo(`#s${b}`, { scale: 0.7, filter: 'blur(22px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out' }, t);
      },
    };
    [['A', 'B', 'whipH'], ['B', 'Dr', 'cut'], ['Dr', 'E', 'whipV'], ['E', 'F', 'cut'], ['F', 'G', 'whipH'], ['G', 'H', 'whipV'],
     ['H', 'I', 'cut'], ['I', 'J', 'cut'], ['J', 'K', 'zoom'], ['K', 'L', 'whipH'], ['L', 'M', 'whipH'], ['M', 'N', 'cut'],
     ['N', 'O', 'cut'], ['O', 'P', 'whipV'], ['P', 'Q', 'whipH']].forEach(([a, b, k]) => TR[k](a, b, S[b][0]));

    // ── A · three logos spring in under the hook
    [['#lgApple', 2.1], ['#lgShell', 2.42], ['#lgCroc', 2.76]].forEach(([s, t], i) => {
      pop(s, t);
      tl.to(s, { y: i % 2 ? 10 : -10, rotation: i % 2 ? -3 : 3, duration: 3.02 - t, ease: 'sine.inOut' }, t + 0.42);
    });

    // ── B · one hero per word: each whips out to the left as the next whips in from the right
    const heroes = ['#oApple', '#oCroc', '#oShell', '#oBull'], swaps = [4.24, 5.08, 5.78];
    tl.set('#oApple', { opacity: 1 }, 3.02);
    push('#oApple img', 3.22, 4.24, 1.07, 2);
    heroes.slice(1).forEach((s, i) => {
      const t = swaps[i];
      tl.to(heroes[i], { x: -980, filter: 'blur(26px)', duration: 0.2, ease: 'power2.in' }, t - 0.2);
      tl.set(heroes[i], { opacity: 0 }, t);
      tl.fromTo(s, { x: 980, opacity: 1, rotation: 9, filter: 'blur(26px)' }, { x: 0, rotation: 0, filter: 'blur(0px)', duration: 0.36, ease: 'power3.out' }, t - 0.04);
      push(s + ' img', t, i === 2 ? 7.7 : swaps[i + 1], 1.07, 2.5);
    });
    [['#cApple', -260, -220, -14, 6.28], ['#cShell', 260, -220, 12, 6.46], ['#cCroc', -300, 260, -8, 6.64], ['#cPrint', 280, 260, 6, 6.82]].forEach(([s, dx, dy, r, t], i) => {
      tl.fromTo(s, { opacity: 0, x: dx, y: dy, scale: 0.3, rotation: r * 3, filter: 'blur(14px)' }, { opacity: 1, x: 0, y: 0, scale: 1, rotation: r, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(2)' }, t);
      tl.to(s, { y: (i % 2 ? 1 : -1) * 14, duration: 7.7 - t - 0.5, ease: 'sine.inOut' }, t + 0.5);
    });
    tl.to('#oBull', { scale: 0.86, y: 40, duration: 0.5, ease: 'power3.out' }, 6.28);

    // ── Dr · the logo drops in with its echoes
    drop('#drop1', 7.76);
    tl.fromTo('#drop1', { scale: 1 }, { scale: 1.08, duration: 10.1 - 8.7, ease: 'none' }, 8.7);

    // ── E · «يتذكره» falls apart into specks of ink
    const forget = $('#L7 .k'), sE = $('#sE');
    const rb = forget.getBoundingClientRect(), rs = sE.getBoundingClientRect();
    for (let i = 0; i < 46; i++) {
      const d = document.createElement('i');
      d.className = 'dot';
      const x = rb.left - rs.left + hash(i) * rb.width, y = rb.top - rs.top + rb.height * (0.25 + 0.55 * hash(i + 50));
      d.style.cssText += `left:${x}px; top:${y}px; transform:scale(${0.6 + hash(i + 9) * 1.2})`;
      $('#dots').appendChild(d);
      const t = 11.95 + hash(i + 3) * 0.3;
      tl.fromTo(d, { opacity: 0 }, { opacity: 0.9, duration: 0.05 }, t);
      tl.to(d, { x: -120 - hash(i + 7) * 260, y: -60 - hash(i + 11) * 240, opacity: 0, duration: 0.6 + hash(i + 2) * 0.3, ease: 'power2.out' }, t + 0.05);
    }
    tl.to(forget, { opacity: 0, filter: 'blur(14px)', x: -40, duration: 0.35, ease: 'power2.in' }, 11.98);

    // ── F · a black shape flies in spinning, lands, shakes on «بتفصيلة», then gets knocked out
    tl.fromTo('#oSil', { opacity: 1, x: 760, y: -1000, rotation: 220, filter: 'blur(20px)' }, { x: 0, y: 0, rotation: -6, filter: 'blur(0px)', duration: 0.55, ease: 'power3.out' }, 13.32);
    tl.to('#oSil', { rotation: 0, duration: 0.4, ease: 'back.out(3)' }, 13.87);
    tl.to('#oSil', { keyframes: [{ x: -12, duration: 0.05 }, { x: 10, duration: 0.05 }, { x: -6, duration: 0.05 }, { x: 0, duration: 0.05 }] }, 14.27);
    push('#oSil img', 13.9, 15.2, 1.08);
    tl.to('#oSil', { x: -1300, y: 200, rotation: -120, filter: 'blur(18px)', duration: 0.3, ease: 'power2.in' }, 15.18);

    // ── G · the crocodile holds, the logo springs in on «تمساح» and punches on «التمساح»
    tl.set('#oCrocG', { opacity: 1 }, 15.45);
    push('#oCrocG img', 15.5, 20.7, 1.08, 2);
    pop('#lgCrocG', 16.56);
    punch('#lgCrocG', 20.02, 1.25);

    // ── H · the shell rises into the yellow, the logo springs in on «صدفة»
    tl.fromTo('#oShellH', { opacity: 1, y: 800, filter: 'blur(20px)', rotation: 8 }, { y: 0, filter: 'blur(0px)', rotation: 0, duration: 0.5, ease: 'back.out(1.6)' }, 20.79);
    push('#oShellH img', 21.3, 24.75, 1.08, -2);
    pop('#lgShellH', 21.35);
    punch('#oShellH', 24.27, 1.08);

    // ── I · the two logos slapped on the wall as prints, a slow push
    [['#pCroc', 24.95, -4], ['#pShell', 25.3, 3]].forEach(([s, t, r]) => {
      tl.fromTo(s, { opacity: 0, scale: 1.35, rotation: r - 8, filter: 'blur(10px)' }, { opacity: 1, scale: 1, rotation: r, filter: 'blur(0px)', duration: 0.32, ease: 'power3.out' }, t);
    });
    tl.fromTo(['#pCroc', '#pShell'], { y: 0 }, { y: -24, duration: 27.2 - 25.6, ease: 'none' }, 25.6);

    // ── J · black: a small shake under the words
    tl.to('#sJ', { keyframes: [0, 1, 2, 3, 4, 5].map((i) => ({ x: (hash(i) - 0.5) * 14, y: (hash(i + 20) - 0.5) * 10, duration: 0.05 })).concat([{ x: 0, y: 0, duration: 0.05 }]) }, 28.44);

    // ── K · the framed woodcut slams in, the logo springs in on «حورية»
    tl.fromTo('#frameK', { opacity: 1, scale: 1.3, rotation: -8, filter: 'blur(12px)' }, { scale: 1, rotation: -2, filter: 'blur(0px)', duration: 0.4, ease: 'power3.out' }, 29.5);
    push('#frameK', 29.9, 33.1, 1.06);
    pop('#discK', 30.68, { rotation: -30 });
    tl.to('#discK', { rotation: 6, duration: 2.2, ease: 'sine.inOut' }, 31.1);

    // ── L · the bulls charge in from both sides and collide, the sun comes up, the logo
    tl.fromTo('#bullL', { opacity: 1, x: -900, filter: 'blur(22px)' }, { x: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power4.out' }, 33.21);
    tl.fromTo('#bullR', { opacity: 1, x: 900, filter: 'blur(22px)' }, { x: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power4.out' }, 33.21);
    tl.to('#bullL', { x: 16, duration: 0.06, yoyo: true, repeat: 1 }, 33.63);
    tl.to('#bullR', { x: -16, duration: 0.06, yoyo: true, repeat: 1 }, 33.63);
    tl.fromTo('#sunL', { y: 260, opacity: 0, scale: 0.6 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 34.49);
    pop('#lgRB', 35.55);

    // ── M · the six logos slide past with a blur and stop on the two circles; then the circles meet
    const conv = $('#conv');
    const SIX = [['apple.svg', 'invert(0)'], ['lacoste-croc.svg', ''], ['shell.svg', ''], ['redbull.svg', ''], ['starbucks.svg', ''], ['mastercard.svg', '']];
    SIX.forEach(([f, fl], i) => {
      const im = document.createElement('img');
      im.src = 'assets/logos/' + f;
      im.style.cssText = `position:absolute; top:30px; left:${i * 360 + 60}px; width:${f === 'redbull.svg' ? 300 : 220}px; filter:${fl} drop-shadow(0 18px 22px rgba(0,0,0,.35))`;
      conv.appendChild(im);
    });
    tl.fromTo(conv, { x: 1300, filter: 'blur(24px)' }, { x: -1550, filter: 'blur(0px)', duration: 1.1, ease: 'power3.out' }, 36.13);
    tl.to(conv, { opacity: 0, duration: 0.25 }, 37.95);
    tl.fromTo('#cRed', { opacity: 0.95, x: -700, filter: 'blur(16px)' }, { opacity: 0.95, x: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, 38.16);
    tl.fromTo('#cYel', { opacity: 0.95, x: 700, filter: 'blur(16px)' }, { opacity: 0.95, x: 0, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' }, 38.42);
    punch(['#cRed', '#cYel'], 39.96, 1.07);

    // ── N · the giant logo, out of focus, racks in; the camera travels to the bite
    const G = $('#giant'), GW = 3600, GH = GW * 1000 / 814;
    const view = (fx, fy, cx, cy) => ({ x: cx - fx * GW, y: cy - fy * GH });
    tl.fromTo(G, { opacity: 0, ...view(0.62, 0.12, 540, 1150), filter: 'invert(1) blur(30px)' }, { opacity: 0.95, filter: 'invert(1) blur(0px)', duration: 1.4, ease: 'power2.out' }, 42.45);
    tl.to(G, { ...view(0.62, 0.16, 540, 1150), duration: 1.9, ease: 'none' }, 42.45);
    tl.to(G, { ...view(0.985, 0.5, 620, 1150), duration: 0.75, ease: 'power3.inOut' }, 44.39);
    tl.to(G, { scale: 1.06, duration: 0.08, ease: 'power2.out' }, 45.59);
    tl.to(G, { scale: 1, duration: 0.4, ease: 'back.out(3)' }, 45.67);

    // ── O · the real apple drops in, then the bite is taken out of it on «قص»
    const apple = drop('#drop2', 46.4);
    const bite = { r: 0 }, BW = 520, BR = 0.2 * BW;
    const setBite = () => { apple.style.webkitMaskImage = apple.style.maskImage = bite.r > 0.5 ? `radial-gradient(circle ${bite.r}px at calc(100% + ${BR * 0.42}px) 46%, transparent ${bite.r - 1}px, #000 ${bite.r}px)` : 'none'; };
    tl.to(bite, { r: BR, duration: 0.1, ease: 'power3.out', onUpdate: setBite }, 48.72);
    tl.set(bite, { r: 0, onUpdate: setBite }, 46.3);
    tl.to('#drop2', { keyframes: [{ x: 10, duration: 0.04 }, { x: -8, duration: 0.04 }, { x: 0, duration: 0.05 }] }, 48.72);
    tl.to('#drop2', { x: -170, scale: 0.82, duration: 0.5, ease: 'power3.inOut' }, 51.38);
    pop('#lgAppleO', 51.5, { x: 300 });
    punch(['#drop2', '#lgAppleO'], 53.06, 1.06);

    // ── P · the six things bounce in, then each flips into its logo
    const six = $('#six');
    const THINGS = [
      ['obj/apple.png', 'apple.svg', 110, 700, 230, -6], ['obj/croc.png', 'lacoste-croc.svg', 380, 690, 330, 4], ['obj/shell.png', 'shell.svg', 760, 700, 220, 8],
      ['obj/bull.png', 'redbull.svg', 90, 1020, 300, -3], ['obj/mermaid.jpg', 'starbucks.svg', 450, 990, 190, 5], ['obj/circles.jpg', 'mastercard.svg', 720, 1040, 250, -5],
    ];
    THINGS.forEach(([o, l, x, y, w, r], i) => {
      const box = document.createElement('div');
      box.style.cssText = `position:absolute; left:${x}px; top:${y}px; width:${w}px; height:${w}px; z-index:10; perspective:900px`;
      const isPhoto = o.endsWith('.jpg');
      box.innerHTML = `<img class="th" src="assets/${o}" style="position:absolute; left:0; top:0; width:100%; ${isPhoto ? 'height:100%; object-fit:cover; padding:8px; background:#efe7d8; box-shadow:0 18px 26px rgba(0,0,0,.3)' : 'filter:drop-shadow(0 22px 22px rgba(0,0,0,.35))'}; transform:rotate(${r}deg)" />` +
        `<img class="lg" src="assets/logos/${l}" style="position:absolute; left:8%; top:8%; width:84%; filter:drop-shadow(0 14px 18px rgba(0,0,0,.25)); opacity:0" />`;
      six.appendChild(box);
      const t = 54.06 + i * 0.12, f = 56.6 + i * 0.1;
      tl.fromTo(box, { opacity: 0, y: -260, scale: 0.4 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, t);
      tl.to(box.querySelector('.th'), { rotationY: 90, opacity: 0, duration: 0.16, ease: 'power2.in' }, f);
      tl.fromTo(box.querySelector('.lg'), { rotationY: -90, opacity: 1 }, { rotationY: 0, duration: 0.24, ease: 'back.out(2)' }, f + 0.16);
    });

    // ── Q · the ask, then the handle
    pop('#handle', 65.3);
    tl.set('#handle .w', { opacity: 1 }, 65.3);

    tl.to({}, { duration: D }, 0);
    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
  }
  document.fonts.ready.then(build);
})();
