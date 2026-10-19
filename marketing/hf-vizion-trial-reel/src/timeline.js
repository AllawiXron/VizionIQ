// «علّق كورس»: the viZion trial reel, one take in the viZion page's look: a single camera travels down one long navy
// canvas past three stations, no cuts. One paused timeline, built after the fonts load, registered on
// window.__timelines.main. build.py's sound cues follow T and MOVES.
(function () {
  const D = 22;
  // camera poses: the canvas point at the centre of the frame, the scale, the roll (deg)
  const POSE = { S1t: [1200, 960, 1.08, 0], S1: [1200, 1000, 1, 0], S2: [1200, 3200, 1, 0], S3: [1200, 5400, 1, 0] };
  // [start, end, pose, roll at mid-move]
  const MOVES = [[0.4, 4.4, 'S1', 0]];
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
  }

  // the selection box hugs the key words (measured once the fonts are in)
  function fitSelect() {
    const s1 = $('#s1').getBoundingClientRect(), r = $('#selw').getBoundingClientRect(), k = $('#s1').offsetWidth / s1.width;
    Object.assign($('#sel1').style, { left: `${(r.left - s1.left) * k - 18}px`, top: `${(r.top - s1.top) * k + 4}px`, width: `${r.width * k + 36}px`, height: `${r.height * k + 6}px` });
  }

  function build() {
    place(POSE.S1);
    fitSelect();
    // stills (stills/render.cjs): everything on, the camera parked on a station
    window.__still = (name) => {
      $$('.w, .bub, .glass, .select, .cursor, #endmark').forEach((e) => { e.style.opacity = 1; });
      Object.assign($('#cur1').style, { left: `${parseFloat($('#sel1').style.left) + parseFloat($('#sel1').style.width) - 40}px`, top: `${parseFloat($('#sel1').style.top) + 70}px` });
      Object.assign($('#cur3').style, { left: '150px', top: '965px' });
      place(POSE[name]);
    };
    document.body.dataset.ready = '1';
  }
  document.fonts.ready.then(build);
})();
