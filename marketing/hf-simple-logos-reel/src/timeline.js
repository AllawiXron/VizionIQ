// The reel's motion, copied move for move from the reference reel: words come out of a sideways blur one by one, the
// hero object holds the centre with a deep shadow and a slow push, objects burst in from the corners with an overshoot,
// whips carry a motion blur, and a hard cut lands the next colour world with a logo that drops in trailing its echoes.
// Every cue sits on a word of the voice (faster-whisper word times); build.py reads T for the sounds.
(function () {
  const D = 11.2;
  const T = {
    a1: [0.0, 0.24, 0.88, 1.3], a2: [1.66, 2.1, 2.68], logos: [2.1, 2.42, 2.76], whipAB: 3.24,
    b: [3.44, 4.46, 5.3, 6.0], swaps: [4.46, 5.3, 6.0],
    bOut: 6.48, c: [6.62, 7.14, 7.56, 7.76], burst: [6.66, 6.84, 7.02, 7.2],
    cut: 8.3, drop: 8.36, d1: [8.32, 8.64, 8.88, 9.04], d2: [9.38, 9.94, 10.12],
  };
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  function build() {
    const tl = gsap.timeline({ paused: true });
    // a word slides in from the reading side out of a blur, with a small pop
    const word = (w, t) => {
      tl.fromTo(w, { opacity: 0, x: -46, filter: 'blur(14px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.32, ease: 'power3.out' }, t);
      tl.fromTo(w, { scale: 0.86 }, { scale: 1, duration: 0.34, ease: 'back.out(2.2)' }, t);
    };
    const words = (sel, times) => $$(sel + ' .w').forEach((w, i) => word(w, times[i]));
    const out = (sel, t) => tl.to(sel, { opacity: 0, y: -40, filter: 'blur(16px)', duration: 0.22, ease: 'power2.in' }, t);
    // the hero's slow push and drift while it holds
    const hold = (sel, t0, t1, r = 2) => tl.fromTo(sel, { scale: 1, rotation: -r / 2 }, { scale: 1.07, rotation: r / 2, duration: t1 - t0, ease: 'none' }, t0);
    // a whip: out to the left with a smear, in from the right with a smear and a little overshoot in rotation
    const whipOut = (sel, t) => tl.to(sel, { x: -980, filter: 'blur(26px)', duration: 0.2, ease: 'power2.in' }, t - 0.2);
    const whipIn = (sel, t) => {
      tl.fromTo(sel, { x: 980, opacity: 1, rotation: 9, filter: 'blur(26px)' }, { x: 0, rotation: 0, filter: 'blur(0px)', duration: 0.36, ease: 'power3.out' }, t - 0.04);
    };
    // scenes on and off
    gsap.set(['#sB', '#sD'], { autoAlpha: 0 });
    gsap.set('.obj, .print, .logo', { opacity: 0 });

    // ── A · the hook
    words('#cA1', T.a1);
    words('#cA2', T.a2);
    ['#lgApple', '#lgShell', '#lgCroc'].forEach((s, i) => {
      tl.fromTo(s, { opacity: 0, scale: 0.2, y: 60, filter: 'blur(10px)' }, { opacity: 1, scale: 1, y: 0, filter: 'blur(0px)', duration: 0.42, ease: 'back.out(2.4)' }, T.logos[i]);
      tl.to(s, { y: i % 2 ? 10 : -10, rotation: i % 2 ? -3 : 3, duration: T.whipAB - T.logos[i], ease: 'sine.inOut' }, T.logos[i] + 0.42);
    });
    tl.fromTo('#sA .world', { scale: 1 }, { scale: 1.08, duration: T.whipAB, ease: 'none' }, 0);
    // whip into B: the whole frame smears left, B comes in from the right
    tl.to('#sA', { x: -1100, filter: 'blur(34px)', duration: 0.24, ease: 'power2.in' }, T.whipAB);
    tl.set('#sA', { autoAlpha: 0 }, T.whipAB + 0.24);
    tl.set('#sB', { autoAlpha: 1 }, T.whipAB + 0.1);
    tl.fromTo('#sB', { x: 1100, filter: 'blur(34px)' }, { x: 0, filter: 'blur(0px)', duration: 0.34, ease: 'power3.out' }, T.whipAB + 0.1);

    // ── B · one hero per word
    words('#cB', T.b);
    const heroes = ['#oApple', '#oCroc', '#oShell', '#oBull'];
    tl.set('#oApple', { opacity: 1 }, T.whipAB + 0.1);
    hold('#oApple img', T.b[0], T.swaps[0]);
    heroes.slice(1).forEach((s, i) => {
      const t = T.swaps[i];
      whipOut(heroes[i], t);
      tl.set(heroes[i], { opacity: 0 }, t);
      whipIn(s, t);
      hold(s + ' img', t, i === 2 ? T.cut : T.swaps[i + 1], 2.5);
    });

    // ── C · «أشياء تشوفها كل يوم»: the line swaps, the others burst in around the bull
    out('#cB', T.bOut);
    words('#cC', T.c);
    const corners = [['#cApple', -260, -220, -14], ['#cShell', 260, -220, 12], ['#cCroc', -300, 260, -8], ['#cPrint', 280, 260, 6]];
    corners.forEach(([s, dx, dy, r], i) => {
      tl.fromTo(s, { opacity: 0, x: dx, y: dy, scale: 0.3, rotation: r * 3, filter: 'blur(14px)' },
        { opacity: 1, x: 0, y: 0, scale: 1, rotation: r, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(2)' }, T.burst[i]);
      tl.to(s, { y: (i % 2 ? 1 : -1) * 14, duration: T.cut - T.burst[i] - 0.5, ease: 'sine.inOut' }, T.burst[i] + 0.5);
    });
    tl.to('#oBull', { scale: 0.86, y: 40, duration: 0.5, ease: 'power3.out' }, T.burst[0]);

    // ── D · hard cut into the red world, a punch-in out of a blur, and the logo drops in trailing its echoes
    tl.set('#sB', { autoAlpha: 0 }, T.cut);
    tl.set('#sD', { autoAlpha: 1 }, T.cut);
    tl.fromTo('#sD', { scale: 1.16, filter: 'blur(18px)' }, { scale: 1, filter: 'blur(0px)', duration: 0.34, ease: 'power3.out' }, T.cut);
    words('#cD1', T.d1);
    words('#cD2', T.d2);
    const drop = $('#drop');
    const ECHO = [1, 0.5, 0.32, 0.2, 0.1];
    ECHO.forEach((o, k) => {
      const im = document.createElement('img');
      im.src = 'assets/logos/apple.svg';
      im.style.cssText = `position:absolute; left:0; top:0; width:100%; filter:invert(1) drop-shadow(0 30px 34px rgba(0,0,0,.5)); z-index:${10 - k}`;
      drop.appendChild(im);
      tl.fromTo(im, { y: -1300, opacity: 0 }, { y: 0, opacity: o, duration: 0.5, ease: 'power4.out' }, T.drop + k * 0.05);
      if (k) tl.to(im, { opacity: 0, duration: 0.25, ease: 'power1.out' }, T.drop + 0.5 + k * 0.05);
    });
    const main = drop.firstChild;
    tl.to(main, { scaleY: 0.9, scaleX: 1.06, transformOrigin: '50% 100%', duration: 0.08, ease: 'power2.out' }, T.drop + 0.5);
    tl.to(main, { scaleY: 1, scaleX: 1, duration: 0.4, ease: 'back.out(3)' }, T.drop + 0.58);
    tl.fromTo('#drop', { scale: 1 }, { scale: 1.08, duration: D - T.drop - 0.9, ease: 'none' }, T.drop + 0.9);
    tl.fromTo('#sD .world', { scale: 1 }, { scale: 1.06, duration: D - T.cut, ease: 'none' }, T.cut);

    tl.to({}, { duration: D }, 0);
    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;
  }
  document.fonts.ready.then(build);
})();
