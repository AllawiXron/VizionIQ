// «علّق كورس»: the viZion trial reel, one take in the viZion page's look: a single camera travels down one long navy
// canvas past three stations, no cuts. One paused timeline, built after the fonts load, registered on
// window.__timelines.main. build.py's sound cues follow T and MOVES.
(function () {
  const D = 22;
  // camera poses: the canvas point at the centre of the frame, the scale, the roll (deg)
  const POSE = { S1t: [1200, 960, 1.08, 0], S1: [1200, 1000, 1, 0], S2: [1200, 3200, 1, 0], S3: [1200, 5400, 1, 0] };
  // [start, end, pose, roll at mid-move]
  const MOVES = [[0.3, 3.8, 'S1', 0], [6.3, 7.2, 'S2', 1.5], [13.7, 14.6, 'S3', -1.5]];
  // every cue (s); build.py reads this table for the sound cues and the transition clips' start times
  const T = {
    s1w: [0, 0, 0, 1.35, 1.65, 2.55, 2.8, 3.05, 3.65, 3.9, 4.15, 4.4], bubs: [0.3, 0.62, 0.94], dim: 1.75, sel: 4.85, cur1: 4.55, click1: 5.15,
    tr: [6.41, 13.77],
    head2: 6.95, h2w: [7.0, 7.3, 7.75, 7.98, 8.21, 8.44, 8.67], cards: [9.3, 9.75, 10.2, 10.65], slam2: [11.5, 12.15],
    s3w: [14.55, 14.8, 15.05, 15.45], slam3: 16.2, cbox: 16.9, keys: [17.35, 17.5, 17.65, 17.8], cur3: 18.1, click3: 18.7,
    s3b: [19.15, 19.4, 19.65, 19.95], endmark: 20.5,
  };
  const WORD = 'كورس';
  // soft blue glows on the canvas: centre x, centre y, width, height, colour
  const GLOWS = [
    [1250, 1050, 760, 640, 'rgba(40,130,255,.34)'], [1700, 300, 560, 420, 'rgba(60,190,255,.18)'],
    [1200, 3050, 820, 620, 'rgba(40,130,255,.34)'], [700, 3900, 560, 460, 'rgba(60,190,255,.16)'],
    [1200, 5420, 780, 700, 'rgba(40,130,255,.36)'], [1750, 4700, 520, 420, 'rgba(60,190,255,.18)'],
  ];
  // big faint outlines of the mark and line-art arrows along the way (they slide past as the camera moves): x, y, size
  const MARKS = [[1330, -140, 760], [380, 2080, 900], [1420, 3900, 820], [300, 5900, 760]];
  const ARROWS = [[700, 1700, 1640, 2500], [1750, 4000, 900, 4650]];
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];

  const world = $('#world');
  $('#decor').innerHTML = GLOWS.map(([cx, cy, w, h, c]) => `<div class="glow" style="left:${cx - w / 2}px; top:${cy - h / 2}px; width:${w}px; height:${h}px; background:${c}"></div>`).join('')
    + `<svg class="line" width="2400" height="6400" viewBox="0 0 2400 6400">${MARKS.map(([x, y, s]) => `<use href="#vz" x="${x}" y="${y}" width="${s}" height="${s * 0.927}" fill="none" stroke="rgba(130,170,240,0.18)" stroke-width="3.6" />`).join('')}
      ${ARROWS.map(([x0, y0, x1, y1]) => {
        const mx = (x0 + x1) / 2 + (y1 - y0) * 0.25, my = (y0 + y1) / 2 - (x1 - x0) * 0.25, a = Math.atan2(y1 - my, x1 - mx), L = 46;
        const h = (d) => `${(x1 - L * Math.cos(a + d)).toFixed(1)} ${(y1 - L * Math.sin(a + d)).toFixed(1)}`;
        return `<path d="M${x0} ${y0} Q ${mx} ${my} ${x1} ${y1} M${h(0.5)} L${x1} ${y1} L${h(-0.5)}" fill="none" stroke="rgba(130,170,240,0.22)" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />`;
      }).join('')}</svg>`;

  // the pixel-art pointer, as on the posts
  const HAND = [
    '......XX.........', '.....XooX........', '.....XooX........', '.....XooX........',
    '.....XooXXX......', '.....XooXooXXX...', '.....XooXooXooXX.', '..XX.XooXooXooXoX',
    '.XooXXooooooooXoX', '.XoooXooooooooooX', '..XoooooooooooooX', '...XooooooooooooX',
    '...XoooooooooooX.', '....XooooooooooX.', '....XoooooooooX..', '.....XooooooooX..', '.....XXXXXXXXXX..',
  ];
  $$('.cursor').forEach((svg) => {
    svg.innerHTML = HAND.map((row, y) => [...row].map((c, x) => (c === '.' ? '' : `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${c === 'X' ? '#000' : '#fff'}"/>`)).join('')).join('');
    svg.setAttribute('shape-rendering', 'crispEdges');
  });

  // ── the camera: holds drift in a little; moves ease softly, roll a touch, and blur lightly along their direction
  const ease = (p) => -(Math.cos(Math.PI * p) - 1) / 2;
  const drift = (P, dt) => [P[0], P[1], P[2] * (1 + 0.025 * Math.min(1, Math.max(0, dt) / 4)), P[3]];
  function cam(t) {
    let prev = POSE.S1t, prevEnd = 0;
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
  const view = $('#view'), camBlur = $('#cams');
  function place([x, y, s, r]) {
    world.style.transform = `translate(540px, 960px) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(5)}) translate(${(-x).toFixed(2)}px, ${(-y).toFixed(2)}px)`;
  }
  function render(t) {
    const c = cam(t), c0 = cam(Math.max(0, t - 1 / 30));
    place(c);
    const zb = Math.abs(Math.log(c[2] / c0[2])) * 70 + Math.abs(c[3] - c0[3]) * 4;
    const bx = Math.min(22, Math.abs(c[0] - c0[0]) * c[2] * 0.2 + zb), by = Math.min(22, Math.abs(c[1] - c0[1]) * c[2] * 0.2 + zb);
    if (bx < 0.5 && by < 0.5) { view.style.filter = 'none'; camBlur.setAttribute('stdDeviation', '0 0'); }
    else { camBlur.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`); view.style.filter = 'url(#camf)'; }
    // «كورس» typed a letter per key press; the caret blinks while it waits
    const n = T.keys.filter((k) => t >= k).length;
    typed.textContent = WORD.slice(0, n);
    caret.style.opacity = (t > T.keys[0] - 0.05 && t < T.keys[3] + 0.1) || Math.floor(t * 2.6) % 2 === 0 ? 1 : 0;
  }
  const typed = $('#typed'), caret = $('#cbox .caret');

  // the selection box hugs the key words (measured once the fonts are in)
  function fitSelect() {
    const s1 = $('#s1').getBoundingClientRect(), r = $('#selw').getBoundingClientRect(), k = $('#s1').offsetWidth / s1.width;
    Object.assign($('#sel1').style, { left: `${(r.left - s1.left) * k - 18}px`, top: `${(r.top - s1.top) * k + 4}px`, width: `${r.width * k + 36}px`, height: `${r.height * k + 6}px` });
  }

  function build() {
    fitSelect();
    const sel = $('#sel1').style;
    Object.assign($('#cur1').style, { left: `${parseFloat(sel.left) + parseFloat(sel.width) - 40}px`, top: `${parseFloat(sel.top) + 70}px` });
    Object.assign($('#cur3').style, { left: '150px', top: '965px' });
    const tl = gsap.timeline({ paused: true });
    // words pop out of a blur, drifting in from the reading side (each with a pop from his pack: build.py)
    const pop = (w, t) => {
      tl.fromTo(w, { opacity: 0, x: -20, filter: 'blur(10px)' }, { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.4, ease: 'power2.out' }, t);
      tl.fromTo(w, { scale: 0.78 }, { scale: 1, duration: 0.38, ease: 'back.out(2.4)' }, t);
    };
    const words = (sel, times) => $$(sel).forEach((w, i) => pop(w, times[i]));
    // a big line slams in sideways with motion blur (its own SVG filter)
    const slam = (sel, f, t) => {
      tl.fromTo(sel, { opacity: 0, x: -760, scale: 1.04 }, { opacity: 1, x: 0, scale: 1, duration: 0.42, ease: 'power3.out' }, t);
      tl.fromTo(f, { attr: { stdDeviation: '90 0' } }, { attr: { stdDeviation: '0 0' }, duration: 0.4, ease: 'power2.out' }, t);
    };
    const card = (sel, t) => tl.fromTo(sel, { opacity: 0, y: 50, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, t);
    const click = (cur, t) => {
      tl.to(cur, { scale: 0.85, duration: 0.07, yoyo: true, repeat: 1, ease: 'power1.inOut' }, t);
    };

    // ── the hook: the first line is on from frame one; the DMs pile in; «ومحد يشتري؟» lands and they go quiet
    const hw = $$('#s1 .w');
    tl.fromTo(hw.slice(0, 3), { opacity: 0.7, scale: 1.04, filter: 'blur(3px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.35, ease: 'power2.out' }, 0);
    ['#b1', '#b2', '#b3'].forEach((b, i) => {
      tl.fromTo(b, { opacity: 0, scale: 0.4, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2.2)', transformOrigin: i === 1 ? '0% 100%' : '100% 100%' }, T.bubs[i]);
      tl.to(b, { y: '+=10', duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 3 }, T.bubs[i] + 0.45);
    });
    hw.slice(3, 5).forEach((w, i) => tl.fromTo(w, { opacity: 0, scale: 1.3, filter: 'blur(16px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.45, ease: 'power3.out' }, T.s1w[3 + i]));
    tl.to(['#b1', '#b2', '#b3'], { opacity: 0.35, filter: 'grayscale(1)', duration: 0.6, ease: 'power1.out' }, T.dim);
    hw.slice(5).forEach((w, i) => pop(w, T.s1w[5 + i]));
    tl.fromTo('#cur1', { opacity: 0, x: 260, y: 380 }, { opacity: 1, x: 0, y: 0, duration: 0.55, ease: 'power2.out' }, T.cur1);
    tl.fromTo('#sel1', { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, T.sel);
    click('#cur1', T.click1);
    tl.to('#cur1', { opacity: 0, x: 120, y: 200, duration: 0.4, ease: 'power2.in' }, 5.8);

    // ── the course: the card, its words, four cards, then the two lines slam in
    tl.fromTo('#head2', { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.6)' }, T.head2);
    words('#head2 .w', T.h2w);
    ['#c1', '#c2', '#c3', '#c4'].forEach((c, i) => {
      card(c, T.cards[i]);
      tl.fromTo(`${c} .n`, { scale: 0 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }, T.cards[i] + 0.15);
    });
    slam('#slam2a', '#h2s', T.slam2[0]);
    slam('#slam2b', '#h3s', T.slam2[1]);

    // ── the ask: the question, «علّق بـ» slams in, the comment box, «كورس» typed, the cursor taps send
    words('#s3 > .tx:first-child .w', T.s3w);
    slam('#slam3', '#h4s', T.slam3);
    card('#cbox', T.cbox);
    tl.fromTo('#cur3', { opacity: 0, x: 380, y: 520 }, { opacity: 1, x: 0, y: 0, duration: 0.55, ease: 'power2.inOut' }, T.cur3);
    click('#cur3', T.click3);
    tl.to('#cbox .send', { scale: 0.88, duration: 0.08, yoyo: true, repeat: 1, ease: 'power1.inOut' }, T.click3);
    tl.set('#ripB', { opacity: 0.9, scale: 1 }, T.click3);
    tl.to('#ripB', { opacity: 0, scale: 2.6, duration: 0.6, ease: 'power2.out' }, T.click3);
    tl.to('#cur3', { opacity: 0, x: 160, y: 240, duration: 0.4, ease: 'power2.in' }, T.click3 + 0.5);
    words('#s3 > .soft .w', T.s3b);
    tl.fromTo('#endmark', { opacity: 0, scale: 0.6, rotation: -8 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, T.endmark);

    // ── the camera and the typing, driven by one clock so any frame can be rendered on its own
    const clock = { t: 0 };
    render(0);
    tl.to(clock, { t: D, duration: D, ease: 'none', onUpdate: () => render(clock.t) }, 0);
    window.__timelines = window.__timelines || {};
    window.__timelines['main'] = tl;

    // stills (stills/render.cjs): everything on, the camera parked on a station
    window.__still = (name) => {
      tl.progress(1);
      typed.textContent = WORD;
      $$('.cursor').forEach((e) => gsap.set(e, { opacity: 1, x: 0, y: 0 }));
      $$('.bub').forEach((e) => gsap.set(e, { opacity: 1, filter: 'none' }));
      place(POSE[name]);
    };
    document.body.dataset.ready = '1';
  }
  document.fonts.ready.then(build);
})();
