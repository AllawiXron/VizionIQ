// The DM order reel's one paused timeline. Built after the fonts load (the chat scroll and the camera push-ins read
// the laid-out message sizes once, at build: this is a single-scene composition, so build-time measuring is allowed),
// then registered on window.__timelines.main. Times in seconds; T holds every cue the voice may move.
(function () {
  const T = {
    slam: [0.05, 0.28, 0.5], notif: 0.85, hl: 1.35, push: 2.55, card: 2.65,
    typeA: 3.55, typeB: 6.15, press: 6.25, m1: 6.4, dots: 6.85, m2: 7.6,
    shots: [8.35, 9.85, 11.35], m6: 13.75, m7: 14.3, gridOpen: 14.75, hiA: 15.3, hiB: 15.9, gridClose: 17.95,
    m8: 18.7, scrim: 19.3, feed: 19.55, strike: 21.0, count: 21.4, stamp: 22.6, out: 23.85, m9: 24.35,
    shrink: 24.7, cta: 24.95, chips: 25.2, tap: 26.6, fill: 26.85, pulse: 27.3, settle: 29.7, end: 31,
  };
  const TYPED = ['ه', 'هل', 'هلو', 'هلو 👋', 'هلو 👋 عن', 'هلو 👋 عندي', 'هلو 👋 عندي مط', 'هلو 👋 عندي مطعم،',
    'هلو 👋 عندي مطعم، أ', 'هلو 👋 عندي مطعم، أريد', 'هلو 👋 عندي مطعم، أريد ٣', 'هلو 👋 عندي مطعم، أريد ٣ بو',
    'هلو 👋 عندي مطعم، أريد ٣ بوستا', 'هلو 👋 عندي مطعم، أريد ٣ بوستات'];
  const AR = '٠١٢٣٤٥٦٧٨٩';
  const ar = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '٬').replace(/\d/g, (d) => AR[d]);
  const $ = (s) => document.querySelector(s);

  function build() {
    // ── measure first: offsets read before any transform exists (a transformed .msg would become the offsetParent)
    const stack = $('#stack'), vpH = $('#vp').clientHeight, CARD = { x: 50, y: 150 }, VP_TOP = 150;
    const G = {};
    const rel = (el) => {
      let top = 0, left = 0, e = el;
      while (e && e !== stack) { top += e.offsetTop; left += e.offsetLeft; e = e.offsetParent; }
      return { el, top, left, w: el.offsetWidth, h: el.offsetHeight, bottom: top + el.offsetHeight };
    };
    ['#m1', '#m2', '#m3', '#m4', '#m5', '#m6', '#m7', '#m8', '#m9', '#m2 .bub', '#m3 .shot', '#m4 .shot', '#m5 .shot']
      .forEach((s) => { G[s] = rel($(s)); });
    const minis = [...document.querySelectorAll('#m7 .mini img')].map(rel);
    const slipH = $('#slip').offsetHeight;
    const lens = {};
    ['#strk', '#arr1', '#arr2'].forEach((s) => { lens[s] = $(s).getTotalLength(); });

    const tl = gsap.timeline({ paused: true });

    // ── background: glow breathes, grain re-seeds 12 times a second ──────────────────────────────────────────
    tl.fromTo('#glow', { scale: 0.94 }, { scale: 1.06, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: 14 }, 0);
    const grain = $('#grain'), gp = { f: 0 };
    tl.to(gp, { f: 372, duration: T.end, ease: 'none', onUpdate() {
      const i = Math.floor(gp.f); grain.style.backgroundPosition = `${(i * 137) % 512}px ${(i * 251) % 512}px`;
    } }, 0);

    // ── b01 hook ────────────────────────────────────────────────────────────────────────────────────────────
    [['#pL', -9, -16], ['#pR', 8, 15], ['#pC', -1.5, -6]].forEach(([id, rot, from], k) => {
      const t = T.slam[k];
      tl.fromTo(id, { scale: 1.5, rotation: from, opacity: 0, filter: 'blur(16px)' },
        { scale: 1, rotation: rot, opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'expo.out' }, t);
      tl.fromTo('#hookcam', { y: 10 }, { y: 0, duration: 0.22, ease: 'power2.out', immediateRender: false }, t + 0.26);
    });
    tl.fromTo('#notif', { y: -280, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.6)' }, T.notif);
    [[0, 70, 0.19], [1, 50, 0.16], [2, 80, 0.2], [3, 90, 0.22]].forEach(([i, dy, d], k) => {
      const w = document.querySelectorAll('#hl .w')[i], t = T.hl + [0, 0.17, 0.36, 0.55][k];
      tl.fromTo(w, { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: d, ease: 'power4.out' }, t);
    });
    tl.fromTo('#hookcam', { scale: 1, filter: 'blur(0px)' }, { scale: 2.4, filter: 'blur(14px)', duration: 0.55, ease: 'power3.in' }, T.push);
    tl.fromTo('#hookcam', { opacity: 1 }, { opacity: 0, duration: 0.3, ease: 'power1.in', immediateRender: false }, T.push + 0.25);

    // ── the chat: the card grows out of the notification ────────────────────────────────────────────────────
    tl.fromTo('#world', { scale: 0.3, x: -26.5, y: -681.5, opacity: 0, filter: 'blur(10px)' },
      { scale: 1, x: 0, y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.55, ease: 'expo.out' }, T.card);

    const box = (sel) => G[sel];
    let curY = 0;
    const gone = new Set(), rows = ['#m0', '#m1', '#m2', '#m3', '#m4', '#m5', '#m6', '#m7', '#m8', '#m9'];
    G['#m0'] = rel($('#m0'));
    const scrollTo = (y, t) => {
      if (y === curY) return;
      tl.fromTo(stack, { y: curY }, { y, duration: 0.45, ease: 'power3.out', immediateRender: false }, t);
      curY = y;
      rows.forEach((r) => { if (!gone.has(r) && G[r].bottom + y < 0) { gone.add(r); tl.to(r, { opacity: 0, duration: 0.2 }, t + 0.3); } });
    };
    const fitY = (sel, room = vpH) => Math.min(0, room - box(sel).bottom - 26);
    const reveal = (sel, t) => {
      scrollTo(fitY(sel), t);
      tl.fromTo(sel, { opacity: 0, y: 46, scale: 0.92 }, { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: 'power3.out' }, t);
    };
    for (let i = 1; i <= 9; i++) gsap.set('#m' + i, { opacity: 0 });

    // b02: the customer types the order and sends it
    const ftext = $('#ftext'), caret = $('#caret'), ph = $('#ph'), ty = { t: 0 };
    const stepT = (T.typeB - T.typeA) / TYPED.length;
    const fieldAt = (t) => {
      if (t >= T.fill && t < T.end) return 'أريد ٣ بوستات';
      if (t >= T.m1 || t < T.typeA) return '';
      return TYPED[Math.min(TYPED.length - 1, Math.floor((t - T.typeA) / stepT))];
    };
    tl.to(ty, { t: T.end, duration: T.end, ease: 'none', onUpdate() {
      const s = fieldAt(ty.t); ftext.textContent = s; ph.style.opacity = s ? 0 : 1;
      const typing = (ty.t >= T.typeA - 0.1 && ty.t < T.m1) || ty.t >= T.fill;
      caret.style.opacity = typing && Math.floor(ty.t * 4) % 2 === 0 ? 1 : 0;
    } }, 0);
    // a slow push toward the input row while the order types on (1.08, the field stays inside x 0–1000), pulled back
    // by the send press as the message rises
    tl.fromTo('#zo', { scale: 1 }, { scale: 1.08, duration: T.typeB - T.typeA + 0.2, ease: 'sine.inOut', immediateRender: false }, T.typeA - 0.25);
    tl.fromTo('#zi', { x: 0, y: 0 }, { x: 3.3, y: -52.6, duration: T.typeB - T.typeA + 0.2, ease: 'sine.inOut', immediateRender: false }, T.typeA - 0.25);
    tl.to('#zo', { scale: 1, duration: 0.45, ease: 'power3.out' }, T.press);
    tl.to('#zi', { x: 0, y: 0, duration: 0.45, ease: 'power3.out' }, T.press);
    tl.to('#send', { scale: 0.88, duration: 0.12, ease: 'power1.in' }, T.press);
    tl.to('#send', { scale: 1, duration: 0.5, ease: 'back.out(2)' }, T.press + 0.12);
    reveal('#m1', T.m1);

    // allawi.psd is typing (the dots sit in the slot the reply will take), then the reply
    scrollTo(fitY('#m2'), T.dots);
    const m2b = box('#m2 .bub');
    gsap.set('#dots', { left: m2b.left, top: curY + m2b.top });
    tl.fromTo('#dots', { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power3.out' }, T.dots);
    document.querySelectorAll('#dots i').forEach((d, k) => {
      tl.fromTo(d, { y: 0 }, { y: -10, duration: 0.18, ease: 'sine.inOut', yoyo: true, repeat: 3 }, T.dots + 0.1 + k * 0.1);
    });
    tl.to('#dots', { opacity: 0, duration: 0.08 }, T.m2);
    reveal('#m2', T.m2);

    // b03: three samples arrive; the camera pushes in on each
    ['#m3', '#m4', '#m5'].forEach((sel, k) => {
      const t = T.shots[k];
      reveal(sel, t);
      const s = box(sel + ' .shot');
      const cx = CARD.x + s.left + s.w / 2, cy = CARD.y + VP_TOP + curY + s.top + s.h / 2;
      const S = Math.min(1.42, (0.86 * 1080) / s.w, (0.86 * 1920) / s.h);
      tl.fromTo('#zo', { scale: 1 }, { scale: S, duration: 0.45, ease: 'power3.out', immediateRender: false }, t + 0.2);
      tl.fromTo('#zi', { x: 0, y: 0 }, { x: 540 - cx, y: 960 - cy, duration: 0.45, ease: 'power3.out', immediateRender: false }, t + 0.2);
      tl.to('#zo', { scale: 1, duration: 0.35, ease: 'power2.inOut' }, t + 1.15);
      tl.to('#zi', { x: 0, y: 0, duration: 0.35, ease: 'power2.inOut' }, t + 1.15);
    });

    // b04: "and for other fields?" — the album opens into a grid of six fields, then gathers back
    reveal('#m6', T.m6);
    reveal('#m7', T.m7);
    const chatParts = ['#vp', '.hdr', '.inbar'];
    tl.to('#scrim', { opacity: 1, duration: 0.35, ease: 'power2.out' }, T.gridOpen);
    tl.to(chatParts, { opacity: 0, duration: 0.3, ease: 'power2.out' }, T.gridOpen + 0.05);
    tl.fromTo('#gttl', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, T.gridOpen + 0.15);
    for (let i = 0; i < 6; i++) {
      const c = i % 3, r = Math.floor(i / 3), tx = 40 + (2 - c) * 278, tyy = 200 + r * 402;
      const tile = $('#t' + i);
      gsap.set(tile, { left: tx, top: tyy, transformOrigin: '0 0' });
      const m = minis[i].el, mx = minis[i].left, my = VP_TOP + curY + minis[i].top, k = 150 / 254;
      const t = T.gridOpen + 0.08 + i * 0.07;
      tl.fromTo(tile, { x: mx - tx, y: my - tyy, scale: k, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.55, ease: 'expo.out' }, t);
      tl.set(m, { opacity: 0 }, t);
      tl.fromTo(tile.querySelector('.lab'), { opacity: 0 }, { opacity: 1, duration: 0.25 }, t + 0.35);
      tl.to(tile, { x: mx - tx, y: my - tyy, scale: k, duration: 0.42, ease: 'power3.in' }, T.gridClose + (5 - i) * 0.03);
      tl.to(tile, { opacity: 0, duration: 0.06 }, T.gridClose + (5 - i) * 0.03 + 0.4);
      tl.set(m, { opacity: 1 }, T.gridClose + (5 - i) * 0.03 + 0.42);
    }
    [['#t0 .hi', T.hiA], ['#t2 .hi', T.hiB]].forEach(([sel, t]) => {
      tl.fromTo(sel, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.25, ease: 'power3.out' }, t);
      tl.to(sel, { opacity: 0, duration: 0.4 }, t + 0.7);
    });
    tl.to('#gttl', { opacity: 0, duration: 0.2 }, T.gridClose);
    tl.to('#scrim', { opacity: 0, duration: 0.35, ease: 'power2.in' }, T.gridClose + 0.2);
    tl.to(chatParts, { opacity: 1, duration: 0.3, ease: 'power2.in' }, T.gridClose + 0.2);

    // b05: "how much?" — a receipt prints out of a slot: 42,000 struck, 40,000 counts up, stamped
    reveal('#m8', T.m8);
    const slip = $('#slip'), H = slipH;
    const zig = [];
    for (let x = 0; x <= 700; x += 25) zig.push(`${x}px ${H - ((x / 25) % 2 ? 0 : 16)}px`);
    slip.style.clipPath = `polygon(0 0, 700px 0, ${zig.reverse().join(', ')})`;
    tl.to('#scrim', { opacity: 1, duration: 0.3 }, T.scrim);
    tl.to(chatParts, { opacity: 0, duration: 0.3 }, T.scrim);
    tl.fromTo('#slot', { scaleX: 0.2, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.8)' }, T.scrim + 0.05);
    tl.fromTo('#slip', { y: -H - 20 }, { y: 0, duration: 1.3, ease: 'steps(13)' }, T.feed);
    const strk = $('#strk'), L = lens['#strk'];
    gsap.set(strk, { strokeDasharray: L, strokeDashoffset: L });
    tl.set('.strike', { opacity: 1 }, T.strike);
    tl.to(strk, { strokeDashoffset: 0, duration: 0.32, ease: 'power2.out' }, T.strike);
    const total = $('#total'), cnt = { v: 0 };
    total.textContent = ar(0);
    tl.fromTo(cnt, { v: 0 }, { v: 40000, duration: 0.8, ease: 'power3.out', onUpdate() { total.textContent = ar(Math.round(cnt.v / 100) * 100); } }, T.count);
    tl.fromTo('#total', { scale: 0.55 }, { scale: 1, duration: 0.8, ease: 'power3.out' }, T.count);
    tl.fromTo('#stamp', { scale: 1.8, rotation: -24, opacity: 0 }, { scale: 1, rotation: -13, opacity: 0.92, duration: 0.22, ease: 'power4.in' }, T.stamp);
    tl.fromTo('#slip', { x: 0 }, { x: 6, duration: 0.05, yoyo: true, repeat: 3, immediateRender: false }, T.stamp + 0.22);
    tl.to('#rcpt', { y: -1500, duration: 0.42, ease: 'power3.in' }, T.out);
    tl.to('#scrim', { opacity: 0, duration: 0.3 }, T.out + 0.2);
    tl.to(chatParts, { opacity: 1, duration: 0.3 }, T.out + 0.2);
    reveal('#m9', T.m9);

    // b06: your turn — the card steps back, the headline lands, three ready-made replies rise
    tl.fromTo('#world', { scale: 1, x: 0, y: 0 }, { scale: 0.8, x: -9, y: 108, duration: 0.55, ease: 'power3.inOut', immediateRender: false }, T.shrink);
    scrollTo(Math.min(0, 560 - box('#m9').bottom), T.chips - 0.1);
    tl.fromTo('#chips', { opacity: 0 }, { opacity: 1, duration: 0.25 }, T.chips - 0.1);
    ['#c3', '#c2', '#c1'].forEach((sel, k) => {
      tl.fromTo(sel, { y: 90, opacity: 0, scale: 0.94 }, { y: 0, opacity: 1, scale: 1, duration: 0.45, ease: 'power3.out' }, T.chips + k * 0.15);
    });
    const ws = document.querySelectorAll('#cta .w');
    [[0, 80, 0.22], [1, 50, 0.16], [2, 60, 0.17], [3, 50, 0.16]].forEach(([i, dy, d], k) => {
      tl.fromTo(ws[i], { opacity: 0, y: dy }, { opacity: 1, y: 0, duration: d, ease: 'power4.out' }, T.cta + [0, 0.22, 0.36, 0.48][k]);
    });
    tl.set('#arrow', { opacity: 1 }, T.cta + 0.6);
    ['#arr1', '#arr2'].forEach((sel, k) => {
      const p = $(sel), l = lens[sel];
      gsap.set(p, { strokeDasharray: l, strokeDashoffset: l });
      tl.to(p, { strokeDashoffset: 0, duration: k ? 0.18 : 0.35, ease: 'power2.out' }, T.cta + 0.6 + k * 0.33);
    });
    // the tap on «٣ بوستات» fills the message; the send button waits for the viewer
    tl.to('#c1', { scale: 0.96, duration: 0.1, ease: 'power2.in', yoyo: true, repeat: 1 }, T.tap);
    tl.fromTo('#c1 .rip', { scale: 0, opacity: 0.9 }, { scale: 3.2, opacity: 0, duration: 0.6, ease: 'power2.out' }, T.tap);
    tl.fromTo('.field', { backgroundColor: '#ece3d4' }, { backgroundColor: '#f8d9c7', duration: 0.12, yoyo: true, repeat: 1, immediateRender: false }, T.fill);
    const pulse = { p: 0 }, cycles = 3;
    tl.to(pulse, { p: Math.PI * 2 * cycles, duration: T.settle - T.pulse, ease: 'none', onUpdate() {
      gsap.set('#send', { scale: 1 + 0.08 * Math.max(0, Math.sin(pulse.p)) });
    } }, T.pulse);
    [0, 0.8, 1.6].forEach((dt, k) => {
      tl.fromTo(k % 2 ? '#ring2' : '#ring1', { scale: 1, opacity: 0.85 }, { scale: 2.3, opacity: 0, duration: 0.75, ease: 'power2.out', immediateRender: false }, T.pulse + 0.1 + dt);
    });

    window.__timelines['main'] = tl;
    if (window.__hfForceTimelineRebind) window.__hfForceTimelineRebind();
  }

  document.fonts.ready.then(build);
})();
