// «ثانية وحدة»: one paused timeline, built after the fonts load, registered on window.__timelines.main.
// Times in seconds; every cue the voice may move is in T, and build.py's sound cues follow the same numbers.
(function () {
  const D = 30;
  const T = {
    // S1 hook (ink): the feed scrolls fast under «زبونك يقرّر بـ ثانية وحدة»
    cA: 0.1, cAout: 1.75, cB: 1.9, cBout: 3.25, settle: 3.25,
    // S2 (paper): dull posts flicked away one by one
    cC: 3.55, cCout: 5.25, cD: 5.4, cDout: 7.45, flicks: [4.2, 4.9, 5.6, 6.3], long: 6.95,
    // S3 (orange): the scroll stops dead on his post, a double-tap heart
    stop: 7.6, heart: 7.95, cE: 7.7, cEout: 8.55, cF: 8.7, cFout: 9.55, phoneOut: 9.45,
    // the three rules
    r: [9.8, 13.0, 16.2],
    // S5 (ink): his designs stack up, then the price
    pile: 19.55, cG: 19.9, cGout: 21.75, price: 22.1, per: 22.5,
    // S6 (orange): «بوست» typed and sent, his reply, the handle
    cH: 24.4, bar: 24.95, keys: [25.5, 25.62, 25.74, 25.86], send: 26.2, him: 26.9, handle: 28.1, rings: [28.6, 29.3],
  };

  function seeded(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rnd = seeded(1508);
  const hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const $ = (s) => document.querySelector(s);
  // a hand-drawn loop: an ellipse that overshoots its start, with a little wobble
  const loopPath = (cx, cy, rx, ry, turns = 1.14, start = -2.5) => {
    let d = '';
    for (let k = 0; k <= 64; k++) {
      const a = start + (k / 64) * Math.PI * 2 * turns, wob = 1 + (rnd() - 0.5) * 0.05 + k * 0.0013;
      d += (k ? ' L' : 'M') + (cx + Math.cos(a) * rx * wob).toFixed(1) + ' ' + (cy + Math.sin(a) * ry * wob).toFixed(1);
    }
    return d;
  };

  // ── the feed: 13 dull posts (made up for the reel), then his quzi post
  const ICON = {
    heart: 'M12 20.5 C 5 16, 2.5 12.5, 2.5 8.6 C 2.5 5.6, 4.8 3.5, 7.4 3.5 C 9.4 3.5, 11 4.6, 12 6.2 C 13 4.6, 14.6 3.5, 16.6 3.5 C 19.2 3.5, 21.5 5.6, 21.5 8.6 C 21.5 12.5, 19 16, 12 20.5 Z',
    comment: 'M20.5 11.5 A 8.5 8.5 0 0 1 8.2 19.1 L 3 20.5 L 4.4 15.6 A 8.5 8.5 0 1 1 20.5 11.5 Z',
    send: 'M22 3 L2 10 L10 13 L13 21 Z M22 3 L10 13',
    save: 'M6 3 H18 V21 L12 16.5 L6 21 Z',
  };
  const DULL = {
    A: '<div class="dull dA"><i class="burst"></i><div class="k">خصم</div><div class="n">٢٠٪</div><div class="s">على جميع المنتجات</div><div class="s2">لفترة محدودة!!</div></div>',
    B: '<div class="dull dB"><i class="c"></i><div class="k">تابعونا</div><div class="s">لكل جديد</div><div class="r"><i style="background:#3b5998"></i><i style="background:#e1306c"></i><i style="background:#25d366"></i></div></div>',
    C: '<div class="dull dC"><div class="k">قريباً</div><div class="n">افتتاح</div><div class="s">انتظرونا</div></div>',
    D: '<div class="dull dD"><div class="k">توصيل مجاني</div><div class="b">اطلب الآن</div><div class="s">07XX XXX XXXX</div></div>',
    E: '<div class="dull dE"><div class="k">عرض خاص</div><div class="s">اشتري واحد واحصل على الثاني مجاناً</div><div class="s2">العرض ساري لنهاية الشهر</div></div>',
    F: '<div class="dull dF"><i class="fl"></i><div class="k">جمعة مباركة</div><div class="s">تقبل الله طاعاتكم</div></div>',
  };
  const ORDER = ['A', 'B', 'C', 'D', 'E', 'F', 'A', 'C', 'B', 'D', 'F', 'E', 'A', 'SAJ'];
  const PH = 833, Y = (k) => -k * PH;
  const svg = (d, id = '') => `<svg viewBox="0 0 24 24"${id ? ` id="${id}"` : ''}><path d="${d}" /></svg>`;
  $('#feed').innerHTML = ORDER.map((o, k) => `<div class="post">
      <div class="ph"><i class="av"></i><i class="nb" style="width:${120 + Math.round(hash(k) * 70)}px"></i><i class="dots"></i></div>
      <div class="pimg">${o === 'SAJ' ? '<img src="assets/work/saj.jpg" alt="" /><svg id="bigHeart" viewBox="0 0 24 24"><path d="' + ICON.heart + '" /></svg>' : DULL[o]}</div>
      <div class="pa">${svg(ICON.heart, o === 'SAJ' ? 'likeHeart0' : '')}${svg(ICON.comment)}${svg(ICON.send)}<span class="bm">${svg(ICON.save)}</span></div>
      <div class="pc"><i style="width:${62 + Math.round(hash(k + 3) * 20)}%"></i><i style="width:${32 + Math.round(hash(k + 5) * 20)}%"></i></div>
    </div>`).join('');

  function build() {
    const tl = gsap.timeline({ paused: true });
    const words = (sel, t, st = 0.075) => {
      tl.fromTo(`${sel} .w`, { opacity: 0, y: 46, filter: 'blur(14px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.38, ease: 'power3.out', stagger: st }, t);
      tl.fromTo(`${sel} .pill`, { scale: 0.7 }, { scale: 1, duration: 0.45, ease: 'back.out(2.2)', stagger: st }, t + 0.06);
    };
    const out = (sel, t) => tl.to(sel, { opacity: 0, y: -34, filter: 'blur(10px)', duration: 0.22, ease: 'power2.in' }, t);
    const draw = (sel, t, dur = 0.5) => tl.fromTo(sel, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: dur, ease: 'power2.out' }, t);
    const blur = (v, t, dur) => tl.to('#vb', { attr: { stdDeviation: `0 ${v}` }, duration: dur, ease: 'none' }, t);

    // ── S1–S3: the phone
    tl.fromTo('#phone', { y: 70 }, { y: 0, duration: 0.45, ease: 'power2.out' }, 0);
    gsap.set('#feed', { y: 0 });
    tl.to('#feed', { y: Y(4.6), duration: T.settle, ease: 'none' }, 0);   // fast thumb scroll from frame one
    blur(16, 0, 0.12);
    tl.to('#feed', { y: Y(5), duration: 0.35, ease: 'power2.out' }, T.settle);
    blur(0, T.settle + 0.05, 0.2);
    T.flicks.forEach((t, i) => {   // each dull post gets flicked away
      tl.to('#feed', { y: Y(6 + i), duration: 0.3, ease: 'power3.inOut' }, t);
      blur(12, t + 0.04, 0.1); blur(0, t + 0.16, 0.12);
    });
    tl.to('#feed', { y: Y(13), duration: T.stop - T.long, ease: 'expo.inOut' }, T.long);   // the long flick… that stops dead on his post
    blur(24, T.long + 0.12, 0.2); blur(0, T.stop - 0.12, 0.1);
    tl.to('#phone', { scale: 1.08, duration: 0.1, ease: 'power2.out' }, T.stop);
    tl.to('#phone', { scale: 1.04, duration: 0.4, ease: 'power2.inOut' }, T.stop + 0.1);
    tl.fromTo('#bigHeart', { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1.15, duration: 0.22, ease: 'back.out(2)' }, T.heart);
    tl.to('#bigHeart', { scale: 1, duration: 0.16, ease: 'power2.out' }, T.heart + 0.22);
    tl.to('#bigHeart', { opacity: 0, scale: 1.3, duration: 0.25, ease: 'power2.in' }, T.heart + 0.65);
    tl.set('#likeHeart0 path', { attr: { fill: '#ed4956', stroke: '#ed4956' } }, T.heart + 0.02);
    tl.fromTo('#likeHeart0', { scale: 0.6 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, T.heart + 0.02);
    tl.to('#phone', { scale: 1.5, y: -160, opacity: 0, duration: 0.35, ease: 'power2.in' }, T.phoneOut);

    words('#cA', T.cA); out('#cA', T.cAout);
    words('#cB', T.cB); out('#cB', T.cBout);
    words('#cC', T.cC); out('#cC', T.cCout);
    words('#cD', T.cD); out('#cD', T.cDout);
    words('#cE', T.cE, 0.1); out('#cE', T.cEout);
    words('#cF', T.cF, 0.1); out('#cF', T.cFout);

    // ── the three rules: badge, line, his design pops in, the exact part gets circled
    const LOOPS = [[355, 557, 318, 78], [192, 312, 194, 118], [384, 655, 78, 70]];
    T.r.forEach((t, i) => {
      const s = `#r${i + 1}`, rot = [-2, 2, -1.5][i];
      tl.fromTo(`${s} .badge`, { scale: 0, rotation: -90 }, { scale: 1, rotation: 0, duration: 0.42, ease: 'back.out(2)' }, t + 0.05);
      words(`#cR${i + 1}`, t + 0.2, 0.09);
      tl.fromTo(`#k${i + 1}`, { opacity: 0, y: 320, rotationX: 32, rotation: rot - 8, scale: 0.8 },
        { opacity: 1, y: 0, rotationX: 0, rotation: rot, scale: 1, duration: 0.62, ease: 'back.out(1.3)' }, t + 0.12);
      tl.to(`#k${i + 1}`, { scale: 1.045, y: -14, duration: 3.2 - 0.74, ease: 'none' }, t + 0.74);
      tl.to(`${s} .lab`, { opacity: 1, duration: 0.3 }, t + 0.7);
      $(`#m${i + 1}`).setAttribute('d', loopPath(...LOOPS[i]));
      draw(`#m${i + 1}`, t + 1.05, 0.5);
    });

    // ── S5: the stack, then the price slams in
    const PILE = [[-150, -60, -12], [160, -40, 10], [-120, 70, -6], [140, 90, 8], [-40, -20, -3], [60, 40, 5], [0, 10, -1]];
    PILE.forEach(([x, y, r], i) => {
      const from = [{ x: -1200, y: y - 200, rotation: r - 40 }, { x: 1200, y: y - 150, rotation: r + 40 }, { x: x, y: 1500, rotation: r - 20 }][i % 3];
      tl.fromTo(`#q${i}`, { ...from, opacity: 1 }, { x, y, rotation: r, opacity: 1, duration: 0.42, ease: 'power3.out' }, T.pile + i * 0.16);
    });
    tl.fromTo('#pile', { scale: 1 }, { scale: 1.05, duration: T.cGout - T.pile, ease: 'none' }, T.pile);
    tl.to('#pileLab', { opacity: 1, duration: 0.3 }, T.pile + 1.2);
    words('#cG', T.cG, 0.09); out('#cG', T.cGout); out('#pileLab', T.cGout);
    tl.to('#pile', { scale: 0.86, y: -30, duration: 0.4, ease: 'power2.inOut' }, T.cGout + 0.05);
    tl.to('#dim', { opacity: 1, duration: 0.3 }, T.cGout + 0.1);
    tl.fromTo('#price', { opacity: 0, scale: 2.3, rotation: -12 }, { opacity: 1, scale: 1, rotation: -3, duration: 0.25, ease: 'power3.in' }, T.price - 0.25);
    tl.fromTo('#price', { y: 0 }, { y: 10, duration: 0.06, yoyo: true, repeat: 3, ease: 'none' }, T.price);
    tl.to('#price', { scale: 1.03, duration: 1.8, ease: 'none' }, T.price + 0.3);
    tl.fromTo('#per', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, T.per);

    // ── S6: one word in the DM
    words('#cH', T.cH, 0.1);
    tl.fromTo('#bar', { opacity: 0, y: 90 }, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' }, T.bar);
    tl.set('#bar .ph2', { opacity: 0 }, T.keys[0] - 0.02);
    T.keys.forEach((t, i) => tl.set(`#bar .typed i:nth-child(${i + 1})`, { opacity: 1 }, t));
    for (let t = T.bar + 0.25, k = 0; t < T.send + 1.2; t += 0.27, k++) tl.set('#bar .caret', { opacity: k % 2 ? 1 : 0 }, t);
    tl.set('#bar .typed i', { opacity: 0 }, T.send);
    tl.set('#bar .ph2', { opacity: 1 }, T.send);
    tl.fromTo('#me', { opacity: 0, y: 380, scale: 0.55, transformOrigin: '0% 100%' }, { opacity: 1, y: 0, scale: 1, duration: 0.38, ease: 'back.out(1.5)' }, T.send);
    tl.fromTo('#him', { opacity: 0, y: 60, scale: 0.7, transformOrigin: '100% 100%' }, { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'back.out(1.4)' }, T.him);
    tl.fromTo('#handle', { opacity: 0, scale: 0.6, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.42, ease: 'back.out(2)' }, T.handle);
    T.rings.forEach((t) => { tl.set('#ring', { opacity: 0.9, scale: 1 }, t); tl.to('#ring', { opacity: 0, scale: 1.35, duration: 0.7, ease: 'power2.out' }, t); });

    // every frame the grain moves
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
