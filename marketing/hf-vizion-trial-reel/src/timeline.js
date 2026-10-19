// «علّق كورس» v2: shots on a studio wall, after the user's reference. Objects and words fly in fast and land with a
// little overshoot; shots leave with a whip. The stage drifts like a handheld camera and kicks on every slam. Motion
// blur and the 15 fps "on twos" look come from build.py's post step (120 fps render, blended down), not from here.
// One paused timeline, built after the fonts load, registered on window.__timelines.main. build.py reads T.
(function () {
  const D = 23;
  const T = {
    hook: [0, 0, 0.15], bubs: [0.35, 0.65, 0.95], outA: 2.3,
    mahad: 2.45, buy: 2.7, outB: 3.85,
    tag: 3.95, cw: [4.1, 4.3], price: 4.55, strike: 5.0, outC: 5.5,
    floorD: 5.55, mega: 5.6, dw: [5.85, 6.1, 6.35], ads: 6.7, bar: 6.9, kick: 6.72,
    tr: [7.21, 16.97], cut1: 7.55, cut2: 17.35,
    logo: 7.6, ew: [7.9, 8.15, 8.6, 8.8, 9.1, 9.3, 9.5], parcel: 9.6, outE: 10.45,
    beats: [10.55, 11.65, 12.75, 13.85], outF: 14.95,
    gw: [15.05, 15.3, 15.75], sales: 16.0, coins: 16.1,
    hw: [17.45, 17.7, 17.95], forc: 18.3, ask: 18.9, cb: 19.5, keys: [19.95, 20.1, 20.25, 20.4], hb: [20.9, 21.15, 21.4, 21.65], logo2: 22.0,
  };
  const WORD = 'كورس';
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const stage = $('#stage'), typed = $('#typed'), caret = $('#caret');
  // a kick on each slam: a short, decaying shake of the whole stage
  const KICKS = [T.buy, T.price, T.ads, T.cut1, T.sales, T.ask];

  function render(t) {
    let x = 4 * Math.sin(t * 1.3) + 2.5 * Math.sin(t * 2.9 + 1), y = 4 * Math.sin(t * 1.1 + 2) + 2 * Math.sin(t * 3.3), r = 0.25 * Math.sin(t * 0.9), s = 1;
    for (const k of KICKS) {
      const d = t - k;
      if (d >= 0 && d < 0.4) {
        const e = Math.exp(-d * 11);
        x += 16 * e * Math.sin(d * 70); y += 22 * e * Math.sin(d * 55 + 1); r += 0.6 * e * Math.sin(d * 48); s += 0.03 * e;
      }
    }
    stage.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(4)})`;
    typed.textContent = WORD.slice(0, T.keys.filter((k) => t >= k).length);
    caret.style.opacity = t < T.cb || (t > T.keys[0] - 0.05 && t < T.keys[3] + 0.1) || Math.floor(t * 2.6) % 2 === 0 ? 1 : 0;
  }

  function build() {
    const tl = gsap.timeline({ paused: true });
    // a word drops in big and settles, out of a blur (a pop from his pack on each: build.py)
    const pop = (w, t, big = false) => {
      tl.fromTo(w, { opacity: 0, scale: big ? 1.7 : 1.35, y: big ? -30 : -14, filter: `blur(${big ? 18 : 10}px)` },
        { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: big ? 0.32 : 0.28, ease: 'back.out(2.2)' }, t);
    };
    const words = (sel, times) => $$(sel).forEach((w, i) => pop(w, times[i]));
    // an object flies in from a side, spinning a little, and lands
    // (plus a blur while it travels fast, on top of the post step's blend, so the smear has no steps in it)
    const fly = (el, t, from = {}, d = 0.45) => {
      el = typeof el === 'string' ? $(el) : el;
      tl.fromTo(el, { x: from.x || 0, y: from.y || 0, rotation: from.r || 0, scale: from.s || 1 },
        { x: 0, y: 0, rotation: 0, scale: 1, duration: d, ease: 'back.out(1.5)' }, t);
      tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.06 }, t);
      const base = getComputedStyle(el).filter.replace('none', '');
      tl.fromTo(el, { filter: `blur(18px) ${base}`.trim() }, { filter: `blur(0px) ${base}`.trim(), duration: d * 0.55, ease: 'power2.in' }, t);
    };
    // a shot leaves with a whip
    const whip = (el, t, to) => {
      tl.to(el, { ...to, duration: 0.28, ease: 'power3.in' }, t);
      tl.fromTo(el, { filter: 'blur(0px)' }, { filter: 'blur(26px)', duration: 0.28, ease: 'power3.in' }, t);
    };
    const hide = (el, t) => tl.set(el, { visibility: 'hidden' }, t);
    const floor = $('#floor');
    tl.set(floor, { scaleY: 0 }, 0);

    // ── A · the hook: the title is there from frame one; three DMs fly up and stack
    const aw = $$('#A .w');
    tl.fromTo(aw.slice(0, 2), { opacity: 0.6, scale: 1.08, filter: 'blur(4px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out' }, 0);
    pop(aw[2], T.hook[2], true);
    ['#b1', '#b2', '#b3'].forEach((b, i) => {
      fly(b, T.bubs[i], { y: 900, r: i === 1 ? -14 : 12, s: 0.8 }, 0.5);
      tl.to(b, { y: -8, rotation: i === 1 ? 1.2 : -1.2, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 1 }, T.bubs[i] + 0.5);
    });
    whip('#A', T.outA, { y: -1700 });
    hide('#A', T.outA + 0.3);

    // ── B · «ومحد يشتري؟»
    pop('#B .sm .w', T.mahad);
    [['#buy', 1.9], ['#buyr', 1.9]].forEach(([w, s]) => tl.fromTo(w, { opacity: 0, scale: s, filter: 'blur(26px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out' }, T.buy));
    tl.to('#buy', { scale: 1.04, duration: 1.0, ease: 'sine.inOut' }, T.buy + 0.3);
    whip('#B', T.outB, { x: 1500, rotation: 6 });
    hide('#B', T.outB + 0.3);

    // ── C · the tag swings down on its string; «الخلل مو بسعرك..», struck through
    tl.fromTo('#tag', { y: -1000 }, { y: 0, duration: 0.42, ease: 'power3.out' }, T.tag);
    tl.fromTo('#tag', { rotation: 24 }, { rotation: 0, duration: 1.5, ease: 'elastic.out(1.2, 0.3)' }, T.tag);
    tl.fromTo('#tag', { opacity: 0 }, { opacity: 1, duration: 0.06 }, T.tag);
    words('#C .sm .w', T.cw);
    tl.fromTo('#price', { opacity: 0, scale: 1.6, filter: 'blur(20px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out' }, T.price);
    tl.fromTo('#strk', { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.22, ease: 'power2.out' }, T.strike);
    tl.to('#price', { opacity: 0.55, duration: 0.2 }, T.strike + 0.1);
    whip('#C', T.outC, { y: 1700 });
    hide('#C', T.outC + 0.3);

    // ── D · the floor comes up; the megaphone flies in and kicks on «وإعلانك!»
    tl.to(floor, { scaleY: 1, duration: 0.35, ease: 'power3.out' }, T.floorD);
    fly('#mega', T.mega, { x: -1000, r: -30, s: 0.8 }, 0.5);
    tl.to('#mega', { x: 24, rotation: -4, duration: 0.07, yoyo: true, repeat: 3, ease: 'power1.inOut' }, T.kick);
    words('#D .sm .w, #D .sc1 .w', T.dw);
    tl.fromTo('#D .hv .w', { opacity: 0, scale: 1.8, filter: 'blur(22px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out' }, T.ads);
    tl.to('#barD', { scaleX: 1, duration: 0.25, ease: 'power2.out' }, T.bar);
    hide('#D', T.cut1);

    // ── E · dark, on the flash: the mark turns in; «كورس viZion يحول الرسائل إلى طلبات حقيقية.»
    tl.set('#dark', { opacity: 1 }, T.cut1);
    tl.set(floor, { scaleY: 0 }, T.cut1);
    tl.fromTo('#logo', { rotationY: 110, scale: 0.6, y: 120 }, { rotationY: 0, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, T.logo);
    tl.fromTo('#logo', { opacity: 0 }, { opacity: 1, duration: 0.1 }, T.logo);
    tl.to('#logo', { rotationY: -14, y: -10, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: 1 }, T.logo + 0.7);
    words('#E .w', T.ew);
    fly('#parcel', T.parcel, { y: 700, r: -40, s: 0.7 }, 0.45);
    whip('#E', T.outE, { y: -1700 });
    tl.to('#dark', { opacity: 0, duration: 0.2 }, T.outE + 0.1);
    hide('#E', T.outE + 0.3);

    // ── F · the four: the number, the name, the object from the left; each leaves to the right for the next
    tl.to(floor, { scaleY: 1, duration: 0.3, ease: 'power3.out' }, T.outE + 0.1);
    T.beats.forEach((t, i) => {
      const k = i + 1;
      tl.fromTo(`#n${k}`, { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out' }, t);
      tl.fromTo(`#f${k} .w`, { opacity: 0, scale: 1.5, filter: 'blur(16px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.28, ease: 'expo.out' }, t + 0.05);
      fly(`#o${k}`, t, { x: -1200, r: -35, s: 0.85 }, 0.42);
      tl.to(`#o${k}`, { rotation: i % 2 ? 3 : -3, y: -10, duration: 0.6, ease: 'sine.inOut' }, t + 0.42);
      const out = i < 3 ? T.beats[i + 1] - 0.12 : T.outF;
      tl.to([`#o${k}`, `#f${k}`, `#n${k}`], { x: 1300, rotation: 20, filter: 'blur(24px)', duration: 0.24, ease: 'power3.in' }, out);
      tl.set([`#o${k}`, `#f${k}`, `#n${k}`], { visibility: 'hidden' }, out + 0.25);
    });

    // ── G · «يوقف خسارتك ويضاعف مبيعاتك», the coins grow out of the floor
    words('#G .w:not(#sales)', T.gw);
    tl.fromTo('#sales', { opacity: 0, scale: 1.8, filter: 'blur(24px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out' }, T.sales);
    tl.fromTo('#coins2', { scaleY: 0.1, scaleX: 0.7, y: 60 }, { scaleY: 1, scaleX: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, T.coins);
    tl.fromTo('#coins2', { opacity: 0 }, { opacity: 1, duration: 0.06 }, T.coins);
    hide('#G', T.cut2);
    tl.set(floor, { scaleY: 0 }, T.cut2);

    // ── H · the ask, on the second flash
    words('#H > .tx:nth-child(1) .w', T.hw);
    pop('#H .sc1 .w', T.forc, true);
    tl.fromTo('#ask', { opacity: 0, x: -900, scale: 1.1, filter: 'blur(30px)' }, { opacity: 1, x: 0, scale: 1, filter: 'blur(0px)', duration: 0.34, ease: 'power4.out' }, T.ask);
    fly('#cb', T.cb, { y: 900, r: 10, s: 0.8 }, 0.5);
    T.keys.forEach((k) => tl.fromTo('#cb', { scale: 1 }, { scale: 1.035, duration: 0.05, yoyo: true, repeat: 1 }, k));
    words('#H > .sm .w', T.hb);
    fly('#logo2', T.logo2, { y: 400, r: -60, s: 0.5 }, 0.5);
    tl.to('#H', { scale: 1.04, duration: D - T.logo2, ease: 'none' }, T.logo2);

    // ── the stage and the typing, driven by one clock so any frame can be rendered on its own
    const clock = { t: 0 };
    render(0);
    tl.to(clock, { t: D, duration: D, ease: 'none', onUpdate: () => render(clock.t) }, 0);
    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
    document.body.dataset.ready = '1';
  }
  document.fonts.ready.then(build);
})();
