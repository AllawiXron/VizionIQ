// AE exporter, the page side: reads the master timeline itself (every tween's start, length, values and ease) and
// compiles the stage into the layers After Effects will build. A tween becomes two keyframes whose temporal ease is
// the tween's Bézier (speed and influence are worked out per dimension by the builder); an elastic is baked into
// keys; the sine micro-motion becomes an expression added to the keyed value. Nodes become layers: shots, lines and
// words are 3D nulls, cut-outs are footage, words are editable text layers with a rectangle as their track matte,
// bars and pills are shape layers, the camera is Camera 1 under a CAM_CONTROLLER null. The result goes into
// build_reel_in_AE.jsx (tools/export-ae.cjs).
(function (Core) {
  const CH = ["x", "y", "z", "rotation", "scale", "opacity", "fy", "fr", "ry", "ty", "tr", "ts", "bar", "fill", "stretch", "dist", "r", "kick", "dip"];
  const r4 = (x) => Math.round(x * 1e4) / 1e4;
  const rv = (v) => (Array.isArray(v) ? v.map(r4) : typeof v === "number" ? r4(v) : v);
  const hex = (h) => [1, 3, 5].map((i) => r4(parseInt(h.slice(i, i + 2), 16) / 255));
  const WHITE = [1, 1, 1], INK = hex(Core.INK), SHADOW_RGB = [80 / 255, 25 / 255, 0];

  function build() {
    const { M } = Core.reel, tl = M.tl, D = M.D, zoom = M.camera.zoom;
    tl.seek(0, false);
    // every tween, by the object it moves and the channel
    const segs = new Map();
    const warn = [];
    for (const tw of tl.getChildren(false, true, false)) {
      const v = tw.targets()[0];
      if (!v) continue;
      const t0 = tw.startTime(), t1 = t0 + tw.duration();
      for (const ch of CH) {
        if (!(ch in tw.vars)) continue;
        if (!segs.has(v)) segs.set(v, {});
        const m = segs.get(v);
        (m[ch] = m[ch] || []).push({ t0, t1, b: tw.vars[ch], a: tw.vars.startAt && ch in tw.vars.startAt ? tw.vars.startAt[ch] : undefined, ease: tw.vars.ease, repeat: tw.vars.repeat || 0, yoyo: !!tw.vars.yoyo });
      }
    }
    // the start of a plain "to" is where the channel was before it
    for (const [v, m] of segs)
      for (const ch in m) {
        m[ch].sort((p, q) => p.t0 - q.t0);
        let prev = v[ch];
        m[ch].forEach((s, i) => {
          if (s.a === undefined) s.a = i ? m[ch][i - 1].b : prev;
          if (i && s.t0 < m[ch][i - 1].t1 - 1e-4 && !s.repeat) warn.push(`${(v.__node && v.__node.name) || "camera"}.${ch} overlaps at ${s.t0.toFixed(2)}`);
        });
      }
    const segsOf = (v, ch) => ((segs.get(v) || {})[ch] || []).filter((s) => !s.repeat);

    // keys for one channel, mapped to the After Effects value
    const keys = (v, ch, map = (x) => x) => {
      const S = segsOf(v, ch);
      if (!S.length) return null;
      const K = [];
      const put = (t, val, extra) => {
        const last = K[K.length - 1];
        if (last && Math.abs(last.t - t) < 1e-4) { Object.assign(last, extra); return last; }
        if (last && !last.o && !last.lin) last.hold = 1;
        const k = { t: r4(t), v: rv(map(val)), ...extra };
        K.push(k);
        return k;
      };
      for (const s of S) {
        const bz = Core.Ease.bez(s.ease);
        if (bz) {
          put(s.t0, s.a, { o: [r4(bz[0]), r4(bz[1])] });
          put(s.t1, s.b, { i: [r4(bz[2]), r4(bz[3])] });
        } else {
          const f = Core.Ease.fn(s.ease), n = Math.max(2, Math.ceil((s.t1 - s.t0) * 30));
          for (let j = 0; j <= n; j++) put(s.t0 + ((s.t1 - s.t0) * j) / n, s.a + (s.b - s.a) * f(j / n), { lin: 1 });
        }
      }
      const first = JSON.stringify(K[0].v);
      if (K.every((k) => JSON.stringify(k.v) === first)) return null;
      return K;
    };
    // the value of a channel that never moves (or where it starts)
    const at0 = (v, ch, map = (x) => x) => {
      const S = segsOf(v, ch);
      return rv(map(S.length ? S[0].a : v[ch] ?? 0));
    };
    // the sine micro-motion: a repeating yoyo tween is the cosine wave, written as an expression on top of the keys
    const wave = (v, ch) => {
      const s = ((segs.get(v) || {})[ch] || []).find((x) => x.repeat);
      if (!s) return null;
      return `value + ${r4(s.a)} + ${r4(s.b - s.a)} * (1 - Math.cos(Math.PI * Math.max(0, time - ${r4(s.t0)}) / ${r4(s.t1 - s.t0)})) / 2`;
    };

    const out = [];
    let uid = 0;
    const id = (p) => `${p}${++uid}`;
    const life = (n) => [r4(Math.max(0, n.life[0])), r4(Math.min(D, n.life[1]))];
    const layer = (o) => { out.push(o); return o; };

    // a node's own transform: position, turn, scale (times f, the layer's size against its source) and opacity
    const transform = (n, f = 1, o = {}) => {
      const v = n.v, s = (x) => [x * f * 100, x * f * 100, x * f * 100];
      const T = { anchor: o.anchor || [0, 0, 0], pos: [at0(v, "x"), at0(v, "y"), at0(v, "z")], rz: at0(v, "rotation"), ry: at0(v, "ry"), scale: at0(v, "scale", s), opacity: o.noOpacity ? 100 : at0(v, "opacity", (x) => x * 100) };
      const K = { px: keys(v, "x"), py: keys(v, "y"), pz: keys(v, "z"), rz: keys(v, "rotation"), ry: keys(v, "ry"), scale: keys(v, "scale", s) };
      if (!o.noOpacity) K.opacity = keys(v, "opacity", (x) => x * 100);
      return { tf: T, keys: K, expr: { py: wave(v, "fy"), rz: wave(v, "fr") } };
    };
    const shadowFx = (dist, soft, op) => ({ match: "ADBE Drop Shadow", props: { "ADBE Drop Shadow-0001": [...SHADOW_RGB, 1], "ADBE Drop Shadow-0002": r4(op * 255), "ADBE Drop Shadow-0003": 180, "ADBE Drop Shadow-0004": r4(dist), "ADBE Drop Shadow-0005": r4(soft) } });
    const rectShape = (size, pos, colour, round = 0) => ({ kind: "rect", size: size.map(r4), pos: pos.map(r4), colour, round: r4(round) });
    // a rectangle that only serves as a track matte
    const matte = (name, parent, size, centre, span, extra = {}) =>
      layer({ id: id("m"), name: `matte ${name}`, type: "shape", parent, three: true, in: span[0], out: span[1], shape: rectShape(size, [0, 0], WHITE), tf: { anchor: [0, 0, 0], pos: [...centre.map(r4), 0] }, isMatte: true, ...extra });

    // ───── the camera ─────
    const cv = M.camera.v;
    const camCtl = { id: "cam", name: "CAM_CONTROLLER", type: "null", three: true, in: 0, out: D, tf: { anchor: [0, 0, 0], pos: [at0(cv, "x"), at0(cv, "y"), at0(cv, "dist", (d) => zoom - d)], rz: at0(cv, "r") }, keys: { px: keys(cv, "x"), py: keys(cv, "y"), pz: keys(cv, "dist", (d) => zoom - d), rz: keys(cv, "r") } };
    const camera = { id: "camera", name: "Camera 1", type: "camera", parent: "cam", zoom, in: 0, out: D, tf: { pos: [0, 0, -zoom - at0(cv, "dip")], rz: at0(cv, "kick") }, keys: { pz: keys(cv, "dip", (d) => -zoom - d), rz: keys(cv, "kick") } };

    // ───── under everything: the orange field ─────
    layer({ id: "field", name: "orange field", type: "solid", solid: { colour: hex("#e9631f"), size: [1080, 1920] }, in: 0, out: D, tf: { anchor: [540, 960, 0], pos: [540, 960, 0] }, effects: [{ match: "ADBE Ramp", props: { "ADBE Ramp-0001": [370, 0], "ADBE Ramp-0002": [...hex("#f07a2e"), 1], "ADBE Ramp-0003": [710, 1920], "ADBE Ramp-0004": [...hex("#e2541b"), 1], "ADBE Ramp-0005": 1 } }] });

    // ───── the far plane ─────
    const E = Core.Env;
    {
      const n = E.light, [w] = n.box, t = transform(n, 1, { noOpacity: true });
      layer({ id: id("bg"), name: "spotlight", type: "solid", three: true, solid: { colour: n.data.colour.map((c) => r4(c / 255)), size: [w, w] }, in: 0, out: D, ...t, tf: { ...t.tf, anchor: [w / 2, w / 2, 0], opacity: n.data.opacity * 100 }, masks: [{ ellipse: [w / 2, w / 2, w * 0.3, w * 0.3], feather: w * 0.42 }] });
      const g = E.grid, m = Core.TextRig.measureBlock("براندك", g.data.size, g.data.lh), rows = g.data.text.split("\n");
      const hb = rows.length * g.data.size * g.data.lh, tg = transform(g, 1, { noOpacity: true });
      layer({ id: id("bg"), name: "word grid", type: "text", three: true, in: 0, out: D, text: { str: rows.join("\r"), size: g.data.size, fill: WHITE, leading: r4(g.data.size * g.data.lh), just: "c" }, ...tg, tf: { ...tg.tf, anchor: [0, r4(hb / 2 - m.base), 0], opacity: g.data.opacity * 100 } });
    }

    // ───── the shots ─────
    const nulls = [];
    for (const S of M.shots) {
      const t = transform(S, 1, { anchor: [540, 960, 0], noOpacity: true });
      nulls.push({ id: S.id, name: `SHOT ${S.id}`, type: "null", three: true, in: 0, out: D, ...t, tf: { ...t.tf, anchor: [540, 960, 0] } });
    }
    const byShot = (S) => M.nodes.filter((n) => n.shot === S && n.plane === "mid" && Core.kinds[n.kind] && Core.kinds[n.kind].make).sort((a, b) => a.stack - b.stack || a.order - b.order);
    const lineIds = new Map();
    const lineOf = (L) => {
      if (lineIds.has(L)) return lineIds.get(L);
      const lid = id("L"), t = transform(L, 1, { noOpacity: true });
      layer({ id: lid, name: L.name, type: "null", parent: L.parent.id, three: true, in: life(L)[0], out: life(L)[1], ...t });
      lineIds.set(L, lid);
      return lid;
    };
    // the frame of a shot that is still inside a phone screen: it clips the cut-outs until the camera lands
    const frameMatte = (n, span) => {
      const S = n.shot, cu = S.data.clipUntil;
      if (!cu || span[0] >= cu) return null;
      return { id: id("m"), name: `matte frame ${S.id}`, type: "shape", parent: S.id, three: true, in: span[0], out: span[1], shape: rectShape([1080, 1920], [0, 0], WHITE), tf: { anchor: [0, 0, 0], pos: [540, 960, 0] }, keys: { scale: [{ t: span[0], v: [100, 100, 100], hold: 1 }, { t: r4(cu), v: [1000, 1000, 100] }] }, isMatte: true };
    };

    const cutFx = (n, f) => {
      const fx = [];
      if (!n.data.colour) fx.push({ match: "ADBE Tint" }, { match: "ADBE Brightness & Contrast 2", props: { "ADBE Brightness & Contrast 2-0001": 4, "ADBE Brightness & Contrast 2-0002": 22 } }, { match: "ADBE Noise", props: { "ADBE Noise-0001": 8 } });
      if (n.data.defocus) fx.push({ match: "ADBE Gaussian Blur 2", props: { "ADBE Gaussian Blur 2-0001": r4((n.data.defocus * 2.4) / f) } });
      if (n.data.shadow !== false) fx.push(shadowFx(22 / f, 26 / f, 0.34));
      return fx;
    };
    const image = (n, extra = {}) => {
      const [nw, nh] = Core.size(n.data.src), f = n.box[0] / nw, span = life(n);
      const lid = id("i"), t = transform(n, f, { anchor: [nw / 2, nh / 2, 0] });
      const L = layer({ id: lid, nid: n.id, name: n.name, type: "footage", src: `el/${n.data.src}`, parent: n.parent.id, three: true, in: span[0], out: span[1], ...t, effects: cutFx(n, f), ...extra });
      const fm = n.plane === "mid" && frameMatte(n, span);
      if (fm) { layer(fm); L.matte = fm.id; }
      return L;
    };

    // a phone: its screen layers (each with a copy of the screen shape as matte) under the frame
    const phone = (n) => {
      const [nw] = Core.size(n.data.src), g = nw / n.box[0], span = life(n), pid = id("p");
      const bw = n.box[0] * 0.8804, bh = n.box[1] * 0.9621, cx = (n.box[0] * 0.0903 + bw / 2) * g, cy = (n.box[1] * 0.0184 + bh / 2) * g;
      const scrMatte = (name, sp) => layer({ id: id("m"), name: `matte screen ${name}`, type: "footage", src: "el/phone-screen.png", parent: pid, three: true, in: sp[0], out: sp[1], tf: { anchor: [195, 444.5, 0], pos: [r4(cx), r4(cy), 0], scale: [r4((bw * g * 100) / 390), r4((bh * g * 100) / 889), 100] }, isMatte: true });
      const masked = (L, name) => { const m = scrMatte(name, [L.in, L.out]); L.matte = m.id; };
      masked(layer({ id: id("s"), name: `${n.name} screen`, type: "shape", parent: pid, three: true, in: span[0], out: span[1], shape: rectShape([bw * g, bh * g], [0, 0], INK), tf: { anchor: [0, 0, 0], pos: [r4(cx), r4(cy), 0] } }), n.name);
      for (const k of M.nodes.filter((x) => x.host === n)) {
        const ks = [Math.max(span[0], life(k)[0]), Math.min(span[1], life(k)[1])];
        if (k.kind === "video") {
          const sc = Math.max(bw / 540, bh / 960) * g * 100;
          masked(layer({ id: id("v"), name: k.name, type: "footage", src: `clips/${k.data.clip}.mp4`, parent: pid, three: true, start: r4(k.data.from - k.data.at), in: r4(ks[0]), out: r4(ks[1]), tf: { anchor: [270, 480, 0], pos: [r4(cx), r4(cy), 0], scale: [r4(sc), r4(sc), 100] } }), k.name);
        } else if (k.kind === "wipe") {
          masked(layer({ id: id("w"), name: k.name, type: "shape", parent: pid, three: true, in: ks[0], out: ks[1], shape: rectShape([bw * g, bh * g], [0, 0], hex(k.data.colour)), tf: { anchor: [0, 0, 0], pos: [r4(cx), r4(cy + at0(k.v, "ty") * g), 0] }, keys: { py: keys(k.v, "ty", (y) => cy + y * g) } }), k.name);
        } else if (k.kind === "sword") {
          const base = k.data.base - (k.data.size * 1.15) / 2;
          masked(layer({ id: id("t"), name: k.name, type: "text", parent: pid, three: true, in: ks[0], out: ks[1], text: { str: k.data.text, size: r4(k.data.size * g), fill: WHITE, just: "c" }, tf: { anchor: [0, r4(-base * g), 0], pos: [r4(cx), r4(cy + at0(k.v, "ty") * g), 0] }, keys: { py: keys(k.v, "ty", (y) => cy + y * g) } }), k.name);
        }
      }
      const L = image(n);
      L.id = pid;
      return L;
    };

    // a word: a null that carries its place and its punch, the text inside a matte, and its bar or pill
    const word = (n) => {
      const d = n.data, em = d.size, [w, h] = n.box, span = life(n), wid = id("W");
      const t = transform(n, 1, { noOpacity: true });
      layer({ id: wid, nid: n.id, name: `W ${d.text}`, type: "null", parent: lineOf(n.parent), three: true, in: span[0], out: span[1], ...t });
      const op = { opacity: at0(n.v, "opacity", (x) => x * 100) }, opK = keys(n.v, "opacity", (x) => x * 100);
      const colour = d.key ? INK : WHITE;
      const textKeys = { py: keys(n.v, "ty"), rz: keys(n.v, "tr"), scale: keys(n.v, "ts", (x) => [x * 100, x * 100, 100]), opacity: opK };
      if (d.stretch) {
        const S = segsOf(n.v, "stretch"), tk = [];
        let last = -1;
        for (const s of S)
          for (let j = 0; j <= Math.ceil((s.t1 - s.t0) * 60); j++) {
            const p = Math.min(1, j / ((s.t1 - s.t0) * 60)), c = Math.round(s.a + (s.b - s.a) * Core.Ease.fn(s.ease)(p));
            if (c !== last) { tk.push({ t: r4(s.t0 + p * (s.t1 - s.t0)), v: Core.TextRig.full(d.raw, c), hold: 1 }); last = c; }
          }
        textKeys.text = tk;
      }
      const textLayer = (name, look, extra = {}) => layer({
        id: id("t"), name, type: "text", parent: wid, three: true, in: span[0], out: span[1],
        text: { str: d.stretch ? Core.TextRig.full(d.raw, 0) : d.text, size: em, just: "c", ...look },
        tf: { anchor: [0, r4(-d.base), 0], pos: [0, at0(n.v, "ty"), 0], rz: at0(n.v, "tr"), scale: at0(n.v, "ts", (x) => [x * 100, x * 100, 100]), ...op }, keys: textKeys, ...extra,
      });
      if (d.variant === "pill") {
        layer({ id: id("s"), name: `pill ${d.text}`, type: "shape", parent: wid, three: true, in: span[0], out: span[1], shape: rectShape([w, h], [0, 0], INK, h / 2), tf: { anchor: [0, 0, 0], pos: [0, 0, 0], ...op }, keys: { opacity: opK }, effects: [shadowFx(10, 24, 0.3)] });
        textLayer(`T ${d.text}`, { fill: WHITE, ltr: !/[؀-ۿ]/.test(d.text) }, { tf: { anchor: [0, r4(-d.base), 0], pos: [0, 0, 0], ...op }, keys: { opacity: opK } });
        return;
      }
      const maskSize = [w + 0.08 * em, h + 0.36 * em], maskAt = [0, 0.06 * em];
      const withMatte = (L) => { if (d.variant === "punch") return L; const m = matte(d.text, wid, maskSize, maskAt, [L.in, L.out]); L.matte = m.id; return L; };
      if (d.variant === "bar") {
        const bx = w / 2 + 0.18 * em, by = 0.07 * em;
        layer({ id: id("s"), name: `bar ${d.text}`, type: "shape", parent: wid, three: true, in: span[0], out: span[1], shape: rectShape([w + 0.36 * em, h - 0.18 * em], [-bx, 0], INK), tf: { anchor: [0, 0, 0], pos: [r4(bx), r4(by), 0], scale: at0(n.v, "bar", (x) => [x * 100, 100, 100]) }, keys: { scale: keys(n.v, "bar", (x) => [x * 100, 100, 100]) } });
        withMatte(textLayer(`T ${d.text}`, { fill: WHITE }));
        return;
      }
      const shade = d.key ? [] : [shadowFx(5, 18, 0.22)];
      if (d.variant === "fill") {
        withMatte(textLayer(`outline ${d.text}`, { stroke: colour, strokeWidth: r4(Math.max(3, em * 0.022)) }));
        withMatte(textLayer(`T ${d.text}`, { fill: colour }, { effects: [{ match: "ADBE Linear Wipe", props: { "ADBE Linear Wipe-0001": at0(n.v, "fill", (f) => 100 - 100 * f), "ADBE Linear Wipe-0002": 90, "ADBE Linear Wipe-0003": 0 } }, ...shade], fxKeys: { "1:ADBE Linear Wipe-0001": keys(n.v, "fill", (f) => 100 - 100 * f) } }));
        return;
      }
      withMatte(textLayer(`T ${d.text}`, { fill: colour, ...(d.dim ? {} : {}) }, d.dim ? { tf: { anchor: [0, r4(-d.base), 0], pos: [0, at0(n.v, "ty"), 0], rz: at0(n.v, "tr"), opacity: 66 }, effects: shade } : { effects: shade }));
    };

    const block = (n) => {
      const d = n.data, [w] = n.box, span = life(n), t = transform(n, 1);
      layer({ id: id("t"), nid: n.id, name: n.name, type: "text", parent: n.parent.id, three: true, in: span[0], out: span[1], text: { str: d.text, size: d.size, fill: d.colour ? hex(d.colour) : WHITE, just: "c" }, ...t, tf: { ...t.tf, anchor: [r4(n.anchor[0] - w / 2), r4(n.anchor[1] - d.base), 0] }, effects: d.shadow ? [shadowFx(5, 18, 0.22)] : [] });
    };
    const star = (n) => {
      const span = life(n), t = transform(n, 1);
      layer({ id: id("s"), nid: n.id, name: n.name, type: "shape", parent: n.parent.id, three: true, in: span[0], out: span[1], shape: { kind: "star", points: 16, outer: n.data.r, inner: r4(n.data.r * 0.8), colour: INK }, ...t });
    };

    const compile = (n) => {
      if (n.kind === "image") image(n);
      else if (n.kind === "phone") phone(n);
      else if (n.kind === "word") word(n);
      else if (n.kind === "text") block(n);
      else if (n.kind === "star") star(n);
    };
    for (const S of M.shots) byShot(S).forEach(compile);
    M.nodes.filter((n) => n.plane === "fg").sort((a, b) => a.stack - b.stack || a.order - b.order).forEach(compile);

    // ───── over the stage, in screen space ─────
    layer({ id: "paper", name: "paper", type: "footage", src: "img/paper.jpg", in: 0, out: D, blend: "multiply", tf: { anchor: [540, 960, 0], pos: [540, 960, 0], opacity: 14 } });
    layer({ id: "grain", name: "grain", type: "solid", solid: { colour: [0.5, 0.5, 0.5], size: [1080, 1920] }, in: 0, out: D, blend: "overlay", tf: { anchor: [540, 960, 0], pos: [540, 960, 0], opacity: 6 }, effects: [{ match: "ADBE Noise", props: { "ADBE Noise-0001": 100 } }] });
    layer({ id: "vignette", name: "vignette", type: "solid", solid: { colour: [70 / 255, 20 / 255, 0], size: [1080, 1920] }, in: 0, out: D, tf: { anchor: [540, 960, 0], pos: [540, 960, 0], opacity: 22 }, masks: [{ ellipse: [540, 883, 700, 1030], feather: 420, inverted: true }] });
    {
      const m = E.mark, b = Core.TextRig.measureBlock(m.text, m.size, 1.15, "ltr");
      layer({ id: "mark", name: m.text, type: "text", in: 0, out: m.until, text: { str: m.text, size: m.size, fill: WHITE, just: "r", ltr: true }, tf: { anchor: [0, 0, 0], pos: [1080 - m.right, r4(m.top + b.base), 0], opacity: 90 } });
    }
    out.push(...nulls, camCtl, camera);

    // ───── the sound ─────
    for (const c of Core.reel.sound.all()) layer({ id: id("a"), name: c.name, type: "audio", src: `audio/${c.file}.wav`, start: r4(c.t), gain: r4(20 * Math.log10(c.gain)) });
    layer({ id: "steps", name: "15 fps steps", type: "adjustment", in: 0, out: D, effects: [{ match: "ADBE Posterize Time", props: { "ADBE Posterize Time-0001": M.poster } }] });

    tl.seek(0, false);
    return { comp: { name: "allawi_reel", w: 1080, h: 1920, fps: 60, duration: D, colour: hex("#e2541b") }, font: "DGSahabah", layers: out, warnings: warn };
  }

  Core.Exporter = { build };
})(window.Core = window.Core || {});
