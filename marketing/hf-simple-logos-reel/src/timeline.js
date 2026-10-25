// The reel's motion, rebuilt on the After Effects project the user sent (comp «01»): every shot rides a camera on two
// nulls that lands fast and settles, then speeds into the cut; each cut gets a 0.3 s box-blur pulse (radius 0, 6, 0);
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
  const POSTER = 15, ZOOM = 1050, SHUTTER = 1 / 30, FLASH = [0.15, 6];

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

  // each scene's contents ride on a camera layer; its colour world, far behind, moves a third as much
  $$('.sc').forEach((sc) => {
    const cam = document.createElement('div');
    cam.className = 'cam';
    [...sc.children].filter((c) => !c.classList.contains('world')).forEach((c) => cam.appendChild(c));
    sc.appendChild(cam);
  });

  // the captions, from reel.json: [scene, top, size, text («*» marks the coloured word), word times, out time]
  R.lines.forEach(([sc, top, size, text, times], i) => {
    const d = document.createElement('div');
    d.className = 'cap'; d.id = 'L' + i;
    d.style.cssText = `top:${top}px; font-size:${size}px`;
    d.innerHTML = text.split(' ').map((w) => {
      const k = w[0] === '*', s = k ? w.slice(1) : w;
      return `<span class="w${k ? ' k' : ''}">${[...s].map((c) => `<span class="l">${c}</span>`).join('')}</span>`;
    }).join(' ');
    $(`#s${sc} .cam`).appendChild(d);
  });

  // the camera of every shot, in the project's units: «from» is where the inner null starts and settles from, «drift»
  // the slow moves in between, «exit» the outer null's move into the cut. Shot by shot from comp «01», with the push-ins
  // kept under 220 so the captions stay inside the frame.
  const RIG = {
    A: { from: [0, 0, 200], settle: 1.49, exit: [[-127, 0, 0], 0.34] },
    B: { from: [-200, 0, 0], settle: 1.74, drift: [[4.4, 6.9, [0, 0, 82]]], exit: [[0, 0, -119], 0.68] },
    Dr: { from: [0, 0, 220], settle: 1.06, exit: [[0, -378, 0], 0.48] },
    E: { from: [0, 300, 0], settle: 1.11, exit: [[0, 0, 220], 0.6] },
    F: { from: [0, 0, -121], settle: 2.21, exit: [[-65, 0, 0], 1.12] },
    G: { from: [85, 0, 0], settle: 2.63, drift: [[17.4, 19.6, [0, 0, 120]]], exit: [[0, 0, -103], 0.74] },
    H: { from: [0, 0, 168], settle: 2.13, exit: [[0, -405, 0], 0.88] },
    I: { from: [0, 497, 0], settle: 0.8, drift: [[25.6, 26.7, [0, 0, 60]]], exit: [[0, 0, -370], 0.44] },
    J: { from: [0, 0, 192], settle: 2.3, exit: [[0, 319, 0], 0.75] },
    K: { from: [0, -300, 0], settle: 2.48, drift: [[31.0, 32.6, [0, 0, 82]]], exit: [[0, 0, -161], 0.9] },
    L: { from: [0, 0, 200], settle: 2.13, exit: [[0, 593, 0], 0.75] },
    M: { from: [0, -691, 0], settle: 2.08, exit: [[376, 0, 0], 0.71] },
    N: { from: [-196, 0, 0], settle: 5.0, exit: [[102, 0, 0], 0.87] },
    O: { from: [0, 0, 200], settle: 4.74, drift: [[49.4, 52.9, [0, 0, 70]]], exit: [[0, 0, -122], 0.74] },
    P: { from: [0, 0, 180], settle: 2.5, exit: [[0, 0, -231], 0.85] },
    Q: { from: [0, 0, 220], settle: 2.63, drift: [[62.6, 66.6, [0, 0, -43], HOLD]] },
  };
  const SC = R.scenes.map(([id, a, b], i) => {
    const r = RIG[id], moves = [];
    moves.push([a, a + r.settle, r.from.map((v) => -v), SETTLE]);
    (r.drift || []).forEach(([t0, t1, d, e]) => moves.push([t0, t1, d, e || DRIFT]));
    if (r.exit) moves.push([b - r.exit[1], b, r.exit[0], EXIT]);
    return { id, a, b: i === R.scenes.length - 1 ? D : b, from: r.from, moves, cam: $(`#s${id} .cam`), world: $(`#s${id} .world`) };
  });
  const camAt = (s, t) => {
    const c = [...s.from];
    s.moves.forEach(([t0, t1, d, e]) => { const k = e((t - t0) / (t1 - t0)); c[0] += d[0] * k; c[1] += d[1] * k; c[2] += d[2] * k; });
    const sc = ZOOM / (ZOOM - c[2]);
    return [-c[0] * sc, -c[1] * sc, sc];
  };
  const cuts = SC.slice(1).map((s) => s.a);

  function build() {
    // a line wider than the safe width shrinks to fit (the letters are laid out already, only hidden)
    $$('.cap').forEach((c) => {
      const w = c.scrollWidth, max = 920;
      if (w > max) c.style.fontSize = (parseFloat(c.style.fontSize) * max / w).toFixed(1) + 'px';
    });
    const tl = gsap.timeline({ paused: true });
    const at = (t) => Math.max(0, t);
    // TextEvo: each letter runs the same one-second curve out of a blur, 4.8 frames (at 100 fps) after the one before
    const word = (w, t) => $$('.l', w).forEach((l, j) => {
      tl.fromTo(l, { opacity: 0, filter: 'blur(18px)' }, { opacity: 1, filter: 'blur(0px)', duration: 1, ease: EVO }, at(t + j * 0.048));
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

    // ── scenes: hard cuts, the camera and the blur pulse do the rest
    gsap.set('.sc', { autoAlpha: 0 });
    gsap.set('#sA', { autoAlpha: 1 });
    gsap.set('.obj, .print, .logo, .disc', { opacity: 0 });
    SC.slice(1).forEach((s, i) => { tl.set(`#s${SC[i].id}`, { autoAlpha: 0 }, s.a); tl.set(`#s${s.id}`, { autoAlpha: 1 }, s.a); });

    // ── A · three logos spring in under the hook
    [['#lgApple', 2.1], ['#lgShell', 2.42], ['#lgCroc', 2.76]].forEach(([s, t]) => pop(s, t));

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
    tl.to('#discK', { rotation: 6, duration: 1.3, ease: 'sine.inOut' }, 31.8);

    // ── L · the bulls charge in from both sides and collide, the sun comes up, the logo
    tl.fromTo('#bullL', { opacity: 1, x: -900, filter: 'blur(22px)' }, { x: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power4.out' }, 33.21);
    tl.fromTo('#bullR', { opacity: 1, x: 900, filter: 'blur(22px)' }, { x: 0, filter: 'blur(0px)', duration: 0.42, ease: 'power4.out' }, 33.21);
    tl.to('#bullL', { x: 16, duration: 0.06, yoyo: true, repeat: 1 }, 33.63);
    tl.to('#bullR', { x: -16, duration: 0.06, yoyo: true, repeat: 1 }, 33.63);
    tl.fromTo('#sunL', { y: 260, opacity: 0, scale: 0.6 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 34.49);
    pop('#lgRB', 35.55);

    // ── M · two circles bounce in apart on «دايرتين», slide into each other on «يدخلن», the overlap turns orange on «لون»
    pop('#cRed', 37.44, { x: -160, rotation: 0 });
    pop('#cYel', 37.66, { x: 160, rotation: 0 });
    tl.to('#cRed', { x: 120, duration: 0.42, ease: ae(40, 100) }, 38.6);
    tl.to('#cYel', { x: -120, duration: 0.42, ease: ae(40, 100) }, 38.6);
    tl.fromTo('#cLens', { opacity: 0 }, { opacity: 1, duration: 0.1 }, 39.96);
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

    // the clock HyperFrames drives: it holds every step for 1/15 s, plays the timeline there, places the shot's camera
    // and blurs what moved during the shutter: the whole frame for the camera (plus the pulse on a cut), and each
    // moving thing on its own for its own move
    const mb = $('#mbB'), defs = $('#mb').parentNode;
    const MOV = SC.map((s) => $$('.obj, .logo, .print, .disc, .drop, #cRed, #cYel, #sunL', s.cam).map((el, i) => {
      const wrap = document.createElement('div'), id = `mb${s.id}${i}`;
      wrap.style.cssText = `position:absolute; inset:0; z-index:${getComputedStyle(el).zIndex}`;
      el.parentNode.insertBefore(wrap, el);
      wrap.appendChild(el);
      defs.insertAdjacentHTML('beforeend', `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0" /></filter>`);
      return { el, wrap, id, f: defs.lastElementChild.firstElementChild };
    }));
    const box = (m) => { const r = m.el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width + r.height]; };
    const lens = $('#cLens'), cRed = $('#cRed'), cYel = $('#cYel');
    const render = (t) => {
      const q = Math.min(D, Math.floor((t + 0.03) * POSTER) / POSTER);
      const si = SC.findIndex((x) => q >= x.a && q < x.b), s = SC[si < 0 ? SC.length - 1 : si], mov = MOV[si < 0 ? SC.length - 1 : si];
      tl.totalTime(Math.max(0, q - SHUTTER), true);
      const before = mov.map(box);
      tl.totalTime(q, false);
      lens.style.transform = `translateX(${gsap.getProperty(cRed, 'x') - gsap.getProperty(cYel, 'x')}px)`;
      mov.forEach((m, i) => {
        const [x1, y1, z1] = box(m), [x0, y0, z0] = before[i];
        const sx = Math.min(70, Math.abs(x1 - x0) / 2.5 + Math.abs(z1 - z0) / 6), sy = Math.min(70, Math.abs(y1 - y0) / 2.5 + Math.abs(z1 - z0) / 6);
        const on = sx + sy > 0.6;
        m.wrap.style.filter = on ? `url(#${m.id})` : 'none';
        if (on) m.f.setAttribute('stdDeviation', `${sx.toFixed(2)} ${sy.toFixed(2)}`);
      });
      const [x, y, k] = camAt(s, q), [x0, y0, k0] = camAt(s, Math.max(s.a, q - SHUTTER));
      s.cam.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${k.toFixed(4)})`;
      s.world.style.transform = `translate(${(x * 0.35).toFixed(2)}px, ${(y * 0.35).toFixed(2)}px) scale(${(1 + (k - 1) * 0.35).toFixed(4)})`;
      const near = cuts.reduce((m, c) => Math.min(m, Math.abs(q - c)), 9);
      const f = near < FLASH[0] ? FLASH[1] * (1 - near / FLASH[0]) : 0;
      const sx = Math.min(80, Math.abs(x - x0) / 2.5 + Math.abs(k - k0) * 180) + f, sy = Math.min(80, Math.abs(y - y0) / 2.5 + Math.abs(k - k0) * 320) + f;
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
