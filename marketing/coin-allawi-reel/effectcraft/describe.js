// Runs inside reel.html: reads every element of the reel as layers for EffectCraft. Each clipped scene, the page
// that tilts away, the lens and every element made of several parts becomes a comp; the camera worlds become nulls;
// words become text layers set on their baseline, cut-outs footage, plain boxes shape layers. Every pose is sampled at
// 60 fps and kept only where a straight line between keys would miss it.
window.describeReel = () => {
  const FPS = 60, D = 41.2, N = Math.round(D * FPS);
  const frame = document.getElementById("frame");
  const elOf = (it) => (it.layer ? it.layer.el : it.el);
  const itemByEl = new Map(items.map((it) => [elOf(it), it]));
  const holdsItems = (el) => [...el.querySelectorAll("*")].some((c) => itemByEl.has(c));
  const SCENES = ["orange", "panel", "dark stage", "page again", "orange end"];
  let scene = 0;

  // ───── layout, with every transform, clip and filter off ─────
  const neutral = document.createElement("style");
  neutral.textContent = "#stage, #stage * { transform: none !important; clip-path: none !important; filter: none !important; }";
  document.head.appendChild(neutral);
  for (const it of items) elOf(it).style.display = "";
  const R = (el) => el.getBoundingClientRect();
  const rel = (r, o) => ({ x: r.left - o.left, y: r.top - o.top, w: r.width, h: r.height });
  const rgba = (c) => {
    const m = c.match(/[\d.]+/g);
    if (!m) return [0, 0, 0, 0];
    return [m[0] / 255, m[1] / 255, m[2] / 255, m.length > 3 ? +m[3] : 1];
  };
  const shadows = (s) => [...(s || "").matchAll(/drop-shadow\(\s*([-\d.]+)px\s+([-\d.]+)px\s+([\d.]+)px\s+(rgba?\([^)]*\))\)/g)].map((m) => ({ dx: +m[1], dy: +m[2], sigma: m[3] / 2, color: rgba(m[4]) }));
  const outerShadow = (s) => {
    const m = (s || "").match(/(rgba?\([^)]*\))\s+([-\d.]+)px\s+([-\d.]+)px\s+([\d.]+)px(?![^,]*inset)/);
    return m ? [{ dx: +m[2], dy: +m[3], sigma: m[4] / 2, color: rgba(m[1]) }] : [];
  };
  const raster = [];

  // what an element is made of, in the coordinates of its own box
  function parts(el) {
    const box = R(el), out = [];
    (function walk(n, opac, fx) {
      const cs = getComputedStyle(n), r = rel(R(n), box);
      const o = n === el ? 1 : opac * +cs.opacity;
      fx = fx.concat(shadows(n.style.filter));
      if (n.tagName === "IMG") return out.push({ type: "img", src: n.src, ...r, nat: [n.naturalWidth, n.naturalHeight], o, shadows: fx });
      if (n.tagName === "VIDEO") return out.push({ type: "video", src: n.src, el: n, ...r, nat: [n.videoWidth, n.videoHeight], radius: parseFloat(cs.borderTopLeftRadius), o });
      if (n.tagName.toLowerCase() === "svg" || /gradient/.test(cs.backgroundImage)) {
        raster.push(n);
        return out.push({ type: "raster", id: raster.length - 1, ...r, o });
      }
      const fill = rgba(cs.backgroundColor), bw = parseFloat(cs.borderTopWidth) || 0;
      const inset = cs.boxShadow.match(/(rgba?\([^)]*\))\s+0px\s+0px\s+0px\s+([\d.]+)px\s+inset/);
      if (fill[3] > 0 || bw > 0 || inset) {
        out.push({
          type: "box", ...r, radius: parseFloat(cs.borderTopLeftRadius) || 0, fill: fill[3] > 0 ? fill : null,
          stroke: bw ? rgba(cs.borderTopColor) : inset ? rgba(inset[1]) : null, strokeW: bw || (inset ? +inset[2] : 0), o, shadows: outerShadow(cs.boxShadow),
        });
      }
      for (const c of n.childNodes) {
        if (c.nodeType === 1 && itemByEl.has(c)) continue;
        if (c.nodeType === 1) walk(c, o, fx);
        else if (c.nodeType === 3 && c.textContent.trim()) out.push(text(c, cs, box, o));
      }
    })(el, 1, []);
    return out;
  }
  // a run of text: its middle, its baseline, its size and colour
  function text(c, cs, box, o) {
    const s = c.textContent, a = s.search(/\S/), b = s.length - s.split("").reverse().join("").search(/\S/);
    const rg = document.createRange();
    rg.setStart(c, a); rg.setEnd(c, b);
    const rr = rg.getBoundingClientRect();
    const m = document.createElement("span");
    m.style.cssText = "display:inline-block;width:0;height:0";
    c.after(m);
    const base = R(m).top;
    m.remove();
    return { type: "text", text: s.slice(a, b), x: rr.left + rr.width / 2 - box.left, base: base - box.top, w: rr.width, size: parseFloat(cs.fontSize), color: rgba(cs.color), o };
  }
  const origin = (el) => getComputedStyle(el).transformOrigin.split(" ").map(parseFloat);

  // ───── the tree of comps and layers ─────
  const comps = [], keyOf = new Map();
  let lk = 0;
  function comp(name, w, h, rootEl) {
    const c = { id: comps.length, name, w: Math.max(1, Math.round(w)), h: Math.max(1, Math.round(h)), layers: [] };
    comps.push(c);
    return c;
  }
  // children in paint order: by z-index, then as written
  const ordered = (el) => [...el.children].map((c, i) => [c, i]).sort((a, b) => (parseInt(a[0].style.zIndex) || 0) - (parseInt(b[0].style.zIndex) || 0) || a[1] - b[1]).map((x) => x[0]);

  // fill comp c with what is inside el; positions are taken from the box of `from`, parent is a null's key
  function fill(c, el, from, parent) {
    for (const ch of ordered(el)) {
      if (ch.tagName === "STYLE" || ch.tagName === "SCRIPT") continue;
      const it = itemByEl.get(ch);
      if (it && it.layer) { clipScene(c, ch, it, from, parent); continue; }
      if (it && holdsItems(ch)) { container(c, ch, it, from, parent); continue; }
      if (it) { leaf(c, ch, it, from, parent); continue; }
      if (ch.classList.contains("paper")) { c.layers.push({ key: ++lk, name: "paper", type: "footage", src: new URL("../rm-allawi-ad-reel/public/img/paper.jpg", location.href).href, cover: [1080, 1920], blend: "multiply", opacity: 32, parent, in: 0, out: D }); continue; }
      if (ch.style.filter && holdsItems(ch)) { staticComp(c, ch, from, parent); continue; }
      if (holdsItems(ch)) { fill(c, ch, from, parent); continue; }
      const p = parts(ch), r = rel(R(ch), R(from));
      for (const q of p) if (q.type === "box" && q.fill && Math.abs(q.w - c.w) < 2 && Math.abs(q.h - c.h) < 2) c.layers.push({ key: ++lk, name: "background", type: "solid", color: q.fill, w: c.w, h: c.h, pos: [r.x + q.x + q.w / 2, r.y + q.y + q.h / 2], parent, in: 0, out: D });
    }
  }
  // a scene that opens and closes through a clip: a comp with a mask on its layer
  function clipScene(c, el, it, from, parent) {
    const name = SCENES[scene++] || "scene";
    const sub = comp(name, 1080, 1920);
    if (getComputedStyle(el).backgroundColor !== "rgba(0, 0, 0, 0)") sub.layers.push({ key: ++lk, name: "background", type: "solid", color: rgba(getComputedStyle(el).backgroundColor), w: 1080, h: 1920, pos: [540, 960], in: 0, out: D });
    fill(sub, el, el, undefined);
    sub.layers.reverse();
    const vis = [], mask = [];
    for (let i = 0; i <= N; i++) { const m = it.layer.clip(i / FPS); vis.push(m !== null); mask.push(m); }
    const a = vis.indexOf(true), b = vis.lastIndexOf(true);
    c.layers.push({ key: ++lk, name, type: "comp", comp: sub.id, anchor: [540, 960], pos: [540, 960], parent, in: a / FPS, out: Math.min(D, (b + 1) / FPS), mask: maskTrack(mask, a, b, 1080, 1920) });
  }
  // a static wrapper with a filter (the soft copy under the lens)
  function staticComp(c, el, from, parent) {
    const sub = comp("lens soft", 1080, 1920);
    fill(sub, el, el, undefined);
    sub.layers.reverse();
    const b = (el.style.filter.match(/blur\(([\d.]+)px/) || [0, 0])[1];
    c.layers.push({ key: ++lk, name: "lens soft", type: "comp", comp: sub.id, anchor: [540, 960], pos: [540, 960], parent, in: 0, out: D, opacity: 100 * (+el.style.opacity || 1), blur: { t: [0], v: [+b] } });
  }
  // an item with items inside: a null when it only moves them, else a comp
  function container(c, el, it, from, parent) {
    const poses = sample(it), r = rel(R(el), R(from));
    const plainMove = !it.abs && poses.every((p) => !p || (p.o === undefined && !p.clip && !p.rx && !p.ry && !p.b));
    if (plainMove) {
      const key = ++lk, o = origin(el);
      c.layers.push({ key, name: (c.name || "") + " camera", type: "null", parent, in: it.life[0], out: Math.min(D, it.life[1]), ...transform(it, poses, r, el, o, 1, [o[0], o[1]]) });
      fill(c, el, el, key);
      return;
    }
    const full = Math.abs(r.w - 1080) < 2 && Math.abs(r.h - 1920) < 2;
    const sub = comp(full ? (rgba(getComputedStyle(el).backgroundColor)[3] > 0 ? "lens sharp" : "page") : nameOf(el), r.w, r.h);
    // a piece made of several parts keeps the ones that are not items of their own
    for (const q of parts(el)) sub.layers.push(...staticPart(q, el, sub));
    fill(sub, el, el, undefined);
    sub.layers.reverse();
    const o = origin(el), mask = poseMask(poses, it, 1, r), p = full ? 0 : pad(sub, mask);
    c.layers.push({ key: ++lk, name: sub.name, type: "comp", comp: sub.id, parent, in: Math.max(0, it.life[0]), out: Math.min(D, it.life[1]), ...transform(it, poses, r, el, o, 1, [o[0] + p, o[1] + p]), mask });
  }
  // a comp made for one piece gets room around its box: the page draws past an element's box (the dots under a final
  // ya, a phone's shadow), a comp stops at its edge
  function pad(sub, mask) {
    const p = Math.ceil(Math.max(60, 0.5 * sub.h));
    sub.w += 2 * p;
    sub.h += 2 * p;
    const sh = (t) => ({ t: t.t, v: t.v.map((v) => v + p) });
    for (const l of sub.layers) {
      if (l.pos) l.pos = [l.pos[0] + p, l.pos[1] + p];
      if (l.px) l.px = sh(l.px);
      if (l.py) l.py = sh(l.py);
    }
    if (mask) mask.v = mask.v.map((m) => ({ ...m, v: m.v.map(([x, y]) => [x + p, y + p]) }));
    return p;
  }
  // a part that doesn't move on its own, inside a comp the size of its box
  function staticPart(q, el, sub, k = 1) {
    if (q.type === "text") return [{ key: ++lk, name: q.text, type: "text", text: q.text, size: q.size, color: q.color, pos: [q.x, q.base], anchor: [0, 0], opacity: 100 * q.o, in: 0, out: D }];
    if (q.type === "box") return [{ key: ++lk, name: "box", type: "shape", w: q.w, h: q.h, radius: q.radius, fill: q.fill, stroke: q.stroke, strokeW: q.strokeW, pos: [q.x + q.w / 2, q.y + q.h / 2], anchor: [0, 0], opacity: 100 * q.o, shadows: q.shadows, in: 0, out: D }];
    if (q.type === "img") return [{ key: ++lk, name: fileName(q.src), type: "footage", src: q.src, pos: [q.x + q.w / 2, q.y + q.h / 2], scale: (100 * q.w) / q.nat[0], opacity: 100 * q.o, shadows: q.shadows, in: 0, out: D }];
    if (q.type === "raster") return [{ key: ++lk, name: "drawing " + q.id, type: "footage", raster: q.id, pos: [q.x + q.w / 2, q.y + q.h / 2], opacity: 100 * q.o, in: 0, out: D }];
    if (q.type === "video") {
      const V = VIDEOS.find((v) => v.v === q.el), s = Math.max(q.w / q.nat[0], q.h / q.nat[1]);
      const w = q.w / s, h = q.h / s, r = q.radius / s, x0 = (q.nat[0] - w) / 2, y0 = (q.nat[1] - h) / 2;
      return [{ key: ++lk, name: fileName(q.src), type: "footage", src: q.src, pos: [q.x + q.w / 2, q.y + q.h / 2], scale: 100 * s, in: V.life[0], out: Math.min(D, V.life[1]), start: V.t0 - V.at, audio: false, mask: { t: [0], v: [roundRect(x0, y0, w, h, r)] } }];
    }
    return [];
  }
  // an item with nothing inside: one layer when it is one thing, a comp when it is several
  function leaf(c, el, it, from, parent) {
    const p = parts(el), poses = sample(it), r = rel(R(el), R(from)), o = origin(el);
    const life = { in: Math.max(0, it.life[0]), out: Math.min(D, it.life[1]) };
    const one = p.length === 1 ? p[0] : null;
    if (one && one.type === "text") {
      c.layers.push({ key: ++lk, name: one.text, type: "text", text: one.text, size: one.size, color: one.color, parent, ...life, ...transform(it, poses, r, el, o, 1, [o[0] - one.x, o[1] - one.base], one.o), blur: blurTrack(poses, it) });
      return;
    }
    if (one && (one.type === "img" || one.type === "box" || one.type === "raster") && Math.abs(one.w - r.w) < 1.5 && Math.abs(one.h - r.h) < 1.5) {
      const k = one.type === "img" ? one.nat[0] / one.w : 1;
      const base = staticPart(one, el, null)[0];
      const anchor = one.type === "box" ? [o[0] - r.w / 2, o[1] - r.h / 2] : [o[0] * k, o[1] * k];
      Object.assign(base, { parent, ...life, ...transform(it, poses, r, el, o, one.type === "img" ? one.w / one.nat[0] : 1, anchor, one.o), blur: blurTrack(poses, it), mask: poseMask(poses, it, one.type === "box" ? 1 : k, r) });
      // a box's mask is drawn around its middle, like its rectangle
      if (one.type === "box" && base.mask) base.mask.v = base.mask.v.map((m) => ({ ...m, v: m.v.map(([x, y]) => [x - r.w / 2, y - r.h / 2]) }));
      c.layers.push(base);
      return;
    }
    const sub = comp(nameOf(el), r.w, r.h);
    for (const q of p) sub.layers.push(...staticPart(q, el, sub));
    sub.layers.reverse();
    const mask = poseMask(poses, it, 1, r), m = pad(sub, mask);
    c.layers.push({ key: ++lk, name: sub.name, type: "comp", comp: sub.id, parent, ...life, ...transform(it, poses, r, el, o, 1, [o[0] + m, o[1] + m]), blur: blurTrack(poses, it), mask });
  }
  const fileName = (src) => decodeURIComponent(src.split("/").pop()).replace(/\.[a-z0-9]+$/i, "");
  function nameOf(el) {
    const v = el.querySelector("video");
    if (v) return "phone " + fileName(v.src);
    const img = el.querySelector("img");
    if (img) return fileName(img.src);
    const runs = [], tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (tw.nextNode()) if (tw.currentNode.textContent.trim()) runs.push(tw.currentNode.textContent.trim());
    if (runs.length) return runs.join(" ").slice(0, 40);
    return el.querySelector("svg") ? "underline" : "drawing";
  }

  // ───── time ─────
  function sample(it) {
    const out = [];
    for (let i = 0; i <= N; i++) {
      const t = i / FPS;
      out.push(t < it.life[0] - 1 / FPS || t > it.life[1] + 1 / FPS ? null : it.pose(t));
    }
    return out;
  }
  // ───── keys the way they are set by hand ─────
  // A key where a move starts, lands or turns back, Bezier ease between keys (speed and influence, as the graph editor
  // shows them), and one more key only where an ease can't follow the move closely enough.
  const bez = (a, b, c, d, u) => { const m = 1 - u; return m * m * m * a + 3 * m * m * u * b + 3 * m * u * u * c + u * u * u * d; };
  // a segment's value at x (0..1 of its time): AE's temporal Bezier in (time, value)
  function eased(v0, v1, s0, f0, s1, f1, dur, x) {
    let lo = 0, hi = 1, u = x;
    for (let n = 0; n < 22; n++) {
      if (bez(0, f0, 1 - f1, 1, u) < x) lo = u; else hi = u;
      u = (lo + hi) / 2;
    }
    return bez(v0, v0 + s0 * f0 * dur, v1 - s1 * f1 * dur, v1, u);
  }
  function fitSegment(vals, a, b, s0, s1, tol) {
    const dur = (b - a) / FPS, v0 = vals[a], v1 = vals[b];
    let best = null;
    const tryIt = (f0, f1, m0 = 1, m1 = 1) => {
      let err = 0, at = a;
      for (let i = a + 1; i < b; i++) {
        const e = Math.abs(eased(v0, v1, s0 * m0, f0, s1 * m1, f1, dur, (i - a) / (b - a)) - vals[i]);
        if (e > err) { err = e; at = i; }
      }
      if (!best || err < best.err - 1e-9) best = { f0, f1, s0: s0 * m0, s1: s1 * m1, err, at };
    };
    tryIt(1 / 3, 1 / 3);
    if (best.err <= tol || b - a < 2) return best;
    // a sharp start or landing pulls its handle steeper, as when the speed graph is dragged up
    const ms = [1, 1.6, 2.5];
    for (const m0 of s0 ? ms : [1]) for (const m1 of s1 ? ms : [1])
      for (let p = 5; p <= 100; p += 5) for (let q = 5; q <= 100; q += 5) tryIt(p / 100, q / 100, m0, m1);
    if (best.err > tol) {
      const c = best, m0 = s0 ? c.s0 / s0 : 1, m1 = s1 ? c.s1 / s1 : 1;
      for (let p = Math.max(1, c.f0 * 100 - 4); p <= Math.min(100, c.f0 * 100 + 4); p++)
        for (let q = Math.max(1, c.f1 * 100 - 4); q <= Math.min(100, c.f1 * 100 + 4); q++) tryIt(p / 100, q / 100, m0, m1);
    }
    return best;
  }
  function fit(vals, tol) {
    let A = 0, B = vals.length - 1;
    while (A <= B && vals[A] === null) A++;
    while (B >= A && vals[B] === null) B--;
    if (A > B) return null;
    let still = true;
    for (let i = A; i <= B && still; i++) if (Math.abs(vals[i] - vals[A]) > tol * 0.25) still = false;
    if (still) return { t: [A / FPS], v: [vals[A]] };
    let lo = Infinity, hi = -Infinity;
    for (let i = A; i <= B; i++) { lo = Math.min(lo, vals[i]); hi = Math.max(hi, vals[i]); }
    // settled once it crawls; a curve within 2% of the move is as close as a hand-set ease gets
    const eps = Math.max(tol / 25, 0.0004 * (hi - lo)), d = (i) => vals[i + 1] - vals[i], moving = (i) => Math.abs(d(i)) > eps;
    const room = (a, b) => Math.max(tol, 0.02 * Math.abs(vals[b] - vals[a]), 0.01 * (hi - lo));
    const at = new Map();
    at.set(A, { sIn: 0, sOut: moving(A) ? d(A) * FPS : 0 });
    at.set(B, { sIn: moving(B - 1) ? d(B - 1) * FPS : 0, sOut: 0 });
    for (let i = A + 1; i < B; i++) {
      const was = moving(i - 1), is = moving(i);
      if (was !== is) at.set(i, { sIn: was ? d(i - 1) * FPS : 0, sOut: is ? d(i) * FPS : 0 });
      else if (was && Math.sign(d(i)) !== Math.sign(d(i - 1))) at.set(i, { sIn: 0, sOut: 0 });
    }
    // keys a frame or two apart are one key, and so are keys a few frames apart that barely change the value
    let prev = -99;
    for (const f of [...at.keys()].sort((x, y) => x - y)) {
      const near = f - prev <= 2 || (f - prev <= 6 && Math.abs(vals[f] - vals[prev]) < 0.02 * (hi - lo));
      if (near && f !== A && f !== B) at.delete(f);
      else prev = f;
    }
    const kept = [...at.keys()].sort((x, y) => x - y);
    if (kept.length > 2 && B - kept[kept.length - 2] <= 2) at.delete(kept[kept.length - 2]);
    const segs = new Map();
    const solve = (a, b) => {
      const r = fitSegment(vals, a, b, at.get(a).sOut, at.get(b).sIn, room(a, b));
      if (r.err <= room(a, b) || b - a < 3 || r.at <= a || r.at >= b) { segs.set(a, r); at.get(a).sOut = r.s0; at.get(b).sIn = r.s1; return; }
      const k = r.at, sp = ((vals[k + 1] - vals[k - 1]) * FPS) / 2;
      at.set(k, { sIn: sp, sOut: sp });
      solve(a, k);
      solve(k, b);
    };
    const first = [...at.keys()].sort((x, y) => x - y);
    for (let i = 0; i < first.length - 1; i++) solve(first[i], first[i + 1]);
    let ks = [...at.keys()].sort((x, y) => x - y);
    // nothing to key while it waits before its first move or after its last: the value holds there anyway
    const same = (f, g) => Math.abs(vals[f] - vals[g]) <= tol * 0.25;
    while (ks.length > 2 && same(ks[0], ks[1])) ks.shift();
    while (ks.length > 2 && same(ks[ks.length - 1], ks[ks.length - 2])) ks.pop();
    const t = [], v = [], e = [], fr = [];
    ks.forEach((f, i) => {
      const inSeg = i ? segs.get(ks[i - 1]) : null, outSeg = i < ks.length - 1 ? segs.get(f) : null;
      const k = at.get(f);
      t.push(f / FPS);
      v.push(vals[f]);
      fr.push(f);
      e.push([round(i ? k.sIn : 0, 3), inSeg ? Math.round(inSeg.f1 * 100) : 33.33, round(outSeg ? k.sOut : 0, 3), outSeg ? Math.round(outSeg.f0 * 100) : 33.33]);
    });
    return { t, v, e, fr };
  }
  const keys = (vals, tol) => {
    const k = fit(vals, tol);
    if (k) delete k.fr;
    return k;
  };
  const round = (x, n = 3) => Math.round(x * 10 ** n) / 10 ** n;
  // pose → position, scale, rotation, opacity, 3D turns; anchor in the layer's own units
  function transform(it, poses, r, el, o, k, anchor, partO = 1) {
    const P = poses.map((p) => {
      if (!p) return null;
      const x = p.x ?? 0, y = p.y ?? 0;
      return it.abs ? [r.x + o[0] + x - r.w / 2, r.y + o[1] + y - r.h / 2] : [r.x + o[0] + x, r.y + o[1] + y];
    });
    const S = poses.map((p) => (p ? round(100 * (p.s ?? 1) * k, 3) : null));
    const seen = poses.map((p, i) => (p && (p.o ?? 1) > 0.003 ? i : -1)).filter((i) => i >= 0);
    const out = {
      seen: seen.length ? [seen[0] / FPS, (seen[seen.length - 1] + 1) / FPS] : null,
      anchor: anchor.map((x) => round(x, 1)),
      px: keys(P.map((q) => (q ? round(q[0], 2) : null)), 0.5),
      py: keys(P.map((q) => (q ? round(q[1], 2) : null)), 0.5),
      scale: keys(S, 0.2 * k),
      rot: keys(poses.map((p) => (p ? round(p.r || 0, 3) : null)), 0.1),
      opacity: keys(poses.map((p) => (p ? round(100 * (p.o ?? 1) * partO, 2) : null)), 0.75),
    };
    if (poses.some((p) => p && (p.rx || p.ry))) {
      out.threeD = true;
      out.rx = keys(poses.map((p) => (p ? round(-(p.rx || 0), 3) : null)), 0.1);
      out.ry = keys(poses.map((p) => (p ? round(p.ry || 0, 3) : null)), 0.1);
    }
    return out;
  }
  const blurTrack = (poses) => (poses.some((p) => p && p.b > 0.05) ? keys(poses.map((p) => (p ? round(p.b || 0, 2) : null)), 0.25) : undefined);

  // ───── masks: circles, polygons and wipes as paths ─────
  const K = 0.5522847498;
  function circlePath(r, x, y) {
    const c = r * K;
    return { v: [[x, y - r], [x + r, y], [x, y + r], [x - r, y]], i: [[-c, 0], [0, -c], [c, 0], [0, c]], o: [[c, 0], [0, c], [-c, 0], [0, -c]] };
  }
  const poly = (pts) => ({ v: pts, i: pts.map(() => [0, 0]), o: pts.map(() => [0, 0]) });
  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    const c = r * K;
    const v = [[x + r, y], [x + w - r, y], [x + w, y + r], [x + w, y + h - r], [x + w - r, y + h], [x + r, y + h], [x, y + h - r], [x, y + r]];
    const i = [[-c, 0], [0, 0], [0, -c], [0, 0], [c, 0], [0, 0], [0, c], [0, 0]];
    const o = [[0, 0], [c, 0], [0, 0], [0, c], [0, 0], [-c, 0], [0, 0], [0, -c]];
    return { v, i, o };
  }
  function parseClip(s, w, h) {
    if (!s) return null;
    let m = s.match(/circle\(([\d.]+)px at ([-\d.]+)px ([-\d.]+)px\)/);
    if (m) return ["c", +m[1], +m[2], +m[3]];
    m = s.match(/inset\(([^)]*)\)/);
    if (m) {
      const q = m[1].trim().split(/\s+/).map((x, i) => (x.endsWith("%") ? (parseFloat(x) / 100) * (i % 2 ? w : h) : parseFloat(x)));
      while (q.length < 4) q.push(q[q.length - 2] ?? q[0]);
      return ["r", q[3], q[0], w - q[1], h - q[2]];
    }
    m = s.match(/polygon\(([^)]*)\)/);
    if (m) return ["p", ...m[1].split(",").flatMap((pt) => pt.trim().split(/\s+/).map(parseFloat))];
    return null;
  }
  const toPath = (q, k) => (q[0] === "c" ? circlePath(q[1] * k, q[2] * k, q[3] * k) : q[0] === "r" ? poly([[q[1] * k, q[2] * k], [q[3] * k, q[2] * k], [q[3] * k, q[4] * k], [q[1] * k, q[4] * k]]) : poly(q.slice(1).reduce((a, x, i, all) => (i % 2 ? a : a.concat([[all[i] * k, all[i + 1] * k]])), [])));
  function maskTrack(list, a, b, w, h, k = 1) {
    const q = list.map((m, i) => (i < a || i > b || m === null ? null : parseClip(m, w, h)));
    if (q.every((x) => !x)) return undefined;
    const kind = q.find((x) => x)[0], live = q.filter((x) => x);
    let dom = 1, span = -1;
    for (let j = 1; j < live[0].length; j++) {
      const r = Math.max(...live.map((x) => x[j])) - Math.min(...live.map((x) => x[j]));
      if (r > span) { span = r; dom = j; }
    }
    const kt = fit(q.map((x) => (x ? x[dom] : null)), 0.75);
    if (!kt) return undefined;
    if (kt.t.length === 1) return { t: kt.t, v: [toPath(q[Math.round(kt.t[0] * FPS)], k)] };
    // a path eases as progress from one key to the next: speeds in progress per second
    const e = kt.e.map(([sIn, fIn, sOut, fOut], i) => {
      const dIn = i ? kt.v[i] - kt.v[i - 1] : 0, dOut = i < kt.v.length - 1 ? kt.v[i + 1] - kt.v[i] : 0;
      return [dIn ? round(sIn / dIn, 4) : 0, fIn, dOut ? round(sOut / dOut, 4) : 0, fOut];
    });
    return { t: kt.t, v: kt.fr.map((f) => toPath(q[f], k)), e };
  }
  const poseMask = (poses, it, k, r) => (poses.some((p) => p && p.clip) ? maskTrack(poses.map((p) => (p ? p.clip || null : null)), 0, N, r.w, r.h, k) : undefined);

  // ───── the main comp ─────
  const main = comp("allawi_orange_coin", 1080, 1920);
  const cam = [];
  for (let i = 0; i <= N; i++) {
    drawFrame(i / FPS);
    const m = stage.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px\)\s*scale\(([\d.]+)\)/);
    // the slow push in on the crowd is keyed; the small push on every word comes from the expression below
    cam.push(m ? [540, 960, (100 * +m[3]) / camera(i / FPS)] : [540, 960, 100]);
  }
  document.head.appendChild(neutral);
  for (const it of items) elOf(it).style.display = "";
  const camKey = ++lk;
  fill(main, stage, stage, camKey);
  main.layers.unshift({ key: ++lk, name: "background", type: "solid", color: rgba(getComputedStyle(frame).backgroundColor), w: 1080, h: 1920, pos: [540, 960], in: 0, out: D });
  main.layers.push({
    key: camKey, name: "camera", type: "null", anchor: [540, 960], pos: [540, 960], scale: keys(cam.map((c) => round(c[2], 4)), 0.05), in: 0, out: D,
    // a little push on every word of the voice (the markers on VOICE), and the shake when the stop hand lands
    scaleExpr: [
      "var m = thisComp.layer(\"VOICE\").marker, b = 0;",
      "function out(p) { return p >= 1 ? 1 : 1 - Math.pow(2, -10 * p); }",
      "function inOut(p) { return p <= 0 ? 0 : p >= 1 ? 1 : p < 0.5 ? Math.pow(2, 20 * p - 10) / 2 : (2 - Math.pow(2, -20 * p + 10)) / 2; }",
      "for (var k = 1; k <= m.numKeys; k++) {",
      "  var d = time - m.key(k).time;",
      "  if (d >= 0 && d <= 1.6) b += 0.011 * out(Math.min(1, d / 0.3)) * (1 - inOut(Math.min(1, Math.max(0, (d - 0.35) / 1.2))));",
      "}",
      "value * (1 + b);",
    ].join("\n"),
    posExpr: [
      "var t0 = 32.62, len = 0.38;",
      "var a = time > t0 && time < t0 + len ? 1 - (time - t0) / len : 0;",
      "value + [16 * a * Math.sin(time * 157), 12 * a * Math.sin(time * 211 + 1)];",
    ].join("\n"),
  });
  main.layers.reverse();
  neutral.remove();
  window.__raster = raster;
  return { fps: FPS, duration: D, main: main.id, comps };
};

// one drawing on its own, on a clear background, for a still image of it
window.isolate = (id) => {
  const el = window.__raster[id];
  const s = document.createElement("style");
  s.id = "isolate";
  s.textContent = "#stage, #stage * { transform: none !important; clip-path: none !important; filter: none !important; visibility: hidden !important; } html, body, #frame { background: transparent !important; } .solo, .solo * { visibility: visible !important; opacity: 1 !important; }";
  document.head.appendChild(s);
  for (const it of items) (it.layer ? it.layer.el : it.el).style.display = "";
  el.classList.add("solo");
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height };
};
window.unisolate = (id) => {
  window.__raster[id].classList.remove("solo");
  document.getElementById("isolate").remove();
};
