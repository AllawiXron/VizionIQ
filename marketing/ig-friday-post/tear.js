// Torn paper for the strips, from ../hf-one-second-reel/src/timeline.js (seeded, so every render is the same).
window.tear = (function () {
  function rand(seed) {
    return () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function tearEdge(n, r, inset, amp) {
    // fractal noise along an edge: wavelengths from 360 px down to 5 px, each octave a little weaker
    const waves = [];
    for (let o = 0, a = amp, L = 360; L > 4; o++, a *= 0.6, L /= 2) for (let j = 0; j < 2; j++) waves.push([a * (0.5 + r()), (2 * Math.PI) / (L * (0.7 + 0.6 * r())), r() * 6.283]);
    const e = new Float32Array(n);
    for (let i = 0; i < n; i++) { let v = 0; for (const [a, k, ph] of waves) v += a * Math.sin(k * i + ph); e[i] = inset + v; }
    return e;
  }
  function tear(el, seed) {
    const S = 2, W = el.offsetWidth * S, H = el.offsetHeight * S, r = rand(seed);
    const top = tearEdge(W, r, 11 * S, 2.6 * S), bot = tearEdge(W, r, 12 * S, 2.6 * S), lft = tearEdge(H, r, 10 * S, 2.4 * S), rgt = tearEdge(H, r, 10 * S, 2.4 * S);
    const bT = tearEdge(W, r, 3.2 * S, 1.3 * S), bB = tearEdge(W, r, 3.2 * S, 1.3 * S), bL = tearEdge(H, r, 2.8 * S, 1.2 * S), bR = tearEdge(H, r, 2.8 * S, 1.2 * S);
    // a little mottling: value noise on a 26 px grid
    const G = 26 * S, gw = Math.ceil(W / G) + 2, gh = Math.ceil(H / G) + 2, grid = Float32Array.from({ length: gw * gh }, () => r() - 0.5);
    const cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), px = img.data;
    for (let y = 0; y < H; y++) {
      const gy = y / G, y0 = Math.floor(gy), fy = gy - y0;
      for (let x = 0; x < W; x++) {
        const dt = y - top[x], db = H - 1 - y - bot[x], dl = x - lft[y], dr = W - 1 - x - rgt[y];
        const d = Math.min(dt, db, dl, dr);
        if (d < -1) continue;
        let band = 0;
        for (const [dd, bw] of [[dt, bT[x]], [db, bB[x]], [dl, bL[y]], [dr, bR[y]]]) band = Math.max(band, Math.min(1, Math.max(0, 1 - (dd - bw) / (1.5 * S))));
        const n = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1, fib = Math.abs(n);
        const gx = x / G, x0 = Math.floor(gx), fx = gx - x0, g = (i, j) => grid[(j % gh) * gw + (i % gw)];
        const m = (g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy;
        const k = 1 + m * 0.05 + (fib - 0.5) * 0.025;
        const a = Math.min(1, Math.max(0, d + 0.5)) * (1 - band * (0.16 + 0.24 * fib));
        const i4 = (y * W + x) * 4;
        px[i4] = Math.min(255, 251 * k * (1 - band) + 255 * band);
        px[i4 + 1] = Math.min(255, 243 * k * (1 - band) + 253 * band);
        px[i4 + 2] = Math.min(255, 230 * k * (1 - band) + 248 * band);
        px[i4 + 3] = a * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    // loose fibres poking out of the tear
    ctx.lineCap = 'round';
    for (let i = 0, nH = Math.round((W + H) / S * 0.12); i < nH; i++) {
      const side = Math.floor(r() * 4);
      let x, y, ang;
      if (side === 0) { x = r() * W; y = top[Math.floor(x)]; ang = -Math.PI / 2; }
      else if (side === 1) { x = r() * W; y = H - 1 - bot[Math.floor(x)]; ang = Math.PI / 2; }
      else if (side === 2) { y = r() * H; x = lft[Math.floor(y)]; ang = Math.PI; }
      else { y = r() * H; x = W - 1 - rgt[Math.floor(y)]; ang = 0; }
      ang += (r() - 0.5) * 1.6;
      const L = (2 + r() * 6) * S;
      ctx.strokeStyle = `rgba(255,253,248,${(0.35 + r() * 0.4).toFixed(2)})`;
      ctx.lineWidth = (0.5 + r() * 0.5) * S;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * L, y + Math.sin(ang) * L); ctx.stroke();
    }
    el.style.backgroundImage = `url(${cv.toDataURL('image/png')})`;
    el.style.backgroundColor = 'transparent';
  }

  return tear;
})();
