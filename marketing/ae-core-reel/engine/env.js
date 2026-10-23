// EnvironmentRig: three depths. Far behind the stage, a plane that moves at about 0.3 of the camera: a warm spotlight
// that follows the camera from shot to shot a beat late, and a diagonal grid of my key words at 8%. The stage in the
// middle carries the type and the cut-outs at 1.0. In front, out-of-focus cut-outs ride each shot at 1.6 and cross
// the lens while the camera whips past them. Over everything, in screen space: the paper, a light grain that jumps a
// few times a second, a soft vignette and the handle.
(function (Core) {
  const KEYS = ["براندك", "مبيعات", "كواليتي", "إعلانك", "تصميم"];
  const Env = { overlays: [] };

  // depth of the far plane, so that it moves at 0.3 of the stage when the camera is at 100%
  Env.setup = (M) => {
    Env.depth = M.camera.zoom * (1 / 0.3 - 1);
  };

  // the far plane: sized from where the camera actually goes
  Env.build = (M, lights) => {
    const Z = Env.depth, zoom = M.camera.zoom, rot = -16, R = (rot * Math.PI) / 180;
    const pts = [];
    for (let t = 0; t <= M.D; t += 0.1) {
      M.tl.seek(t, false);
      const c = M.camera.pose(), f = (Z - c.z) / zoom, co = Math.cos(c.roll * Math.PI / 180), si = Math.sin(c.roll * Math.PI / 180);
      for (const [x, y] of [[-540, -960], [540, -960], [540, 960], [-540, 960]]) pts.push([c.x + f * (x * co - y * si), c.y + f * (x * si + y * co)]);
    }
    M.tl.seek(0, false);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    // the same corners in the grid's own turned frame
    const lx = pts.map(([x, y]) => (x - cx) * Math.cos(-R) - (y - cy) * Math.sin(-R)), ly = pts.map(([x, y]) => (x - cx) * Math.sin(-R) + (y - cy) * Math.cos(-R));
    const gw = Math.ceil((Math.max(...lx.map(Math.abs)) * 2 * 1.08) / 100) * 100, gh = Math.ceil((Math.max(...ly.map(Math.abs)) * 2 * 1.08) / 100) * 100;
    const size = 360, lh = 1.6, rows = Math.ceil(gh / (size * lh)), per = Math.ceil(gw / (size * 0.42 * 7));
    const text = Array.from({ length: rows }, (_, r) => Array.from({ length: per }, (_, i) => KEYS[(i + r * 2) % KEYS.length]).join("   ")).join("\n");
    Env.grid = M.node("grid", { name: "word grid", plane: "bg", stack: 2, box: [gw, gh], anchor: [gw / 2, gh / 2], v: { x: cx, y: cy, z: Z, rotation: rot }, data: { text, size, lh, opacity: 0.08 } });
    // the light: it waits over each shot, up and to one side, and moves on a beat after the camera does
    const L = 4200;
    const first = lights[0];
    Env.light = M.node("glow", { name: "spotlight", plane: "bg", stack: 1, box: [L, L], anchor: [L / 2, L / 2], v: { x: first.x, y: first.y, z: Z }, data: { colour: [255, 170, 110], opacity: 0.55 } });
    for (const l of lights.slice(1)) M.tl.to(Env.light.v, { x: l.x, y: l.y, duration: 0.9, ease: "settle" }, l.t);
  };

  // something out of focus in front of a shot, crossing the frame while the camera whips past it
  Env.passer = (M, shot, src, lx, ly, w, t0, t1, rot) => {
    const n = M.node("image", {
      parent: shot, shot, plane: "fg", stack: 50, name: `foreground ${src.replace(".png", "")}`,
      box: [w, w * Core.size(src)[1] / Core.size(src)[0]], anchor: [w / 2, (w * Core.size(src)[1]) / Core.size(src)[0] / 2],
      v: { x: lx, y: ly, z: -0.375 * M.camera.zoom, rotation: rot }, life: [t0, t1],
      data: { src, defocus: 14, shadow: false },
    });
    M.tl.fromTo(n.v, { rotation: rot }, { rotation: rot + 24, duration: t1 - t0, ease: "glide" }, t0);
    return n;
  };

  const div = (css) => {
    const d = document.createElement("div");
    d.style.cssText = css;
    return d;
  };

  Core.kinds.grid = {
    make(n) {
      const d = n.data;
      const el = div(`width:${n.box[0]}px;height:${n.box[1]}px`);
      el.appendChild(div(`position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:${Core.FONT};font-weight:400;font-synthesis:none;font-size:${d.size}px;line-height:${d.lh};color:rgba(255,255,255,${d.opacity});white-space:pre;text-align:center;direction:rtl`)).textContent = d.text;
      return el;
    },
  };
  Core.kinds.glow = {
    make(n) {
      const [r, g, b] = n.data.colour;
      return div(`width:${n.box[0]}px;height:${n.box[1]}px;background:radial-gradient(closest-side,rgba(${r},${g},${b},${n.data.opacity}) 0%,rgba(${r},${g},${b},${n.data.opacity * 0.5}) 45%,rgba(${r},${g},${b},0) 100%)`);
    },
  };

  // screen-space layers: under the stage, and over it
  Env.mount = (M) => {
    M.under.style.background = "linear-gradient(170deg,#f07a2e 0%,#e9631f 48%,#e2541b 100%)";
    const o = M.over;
    o.appendChild(div(`position:absolute;inset:0;background:url(${Core.MEDIA}img/paper.jpg) center/cover;mix-blend-mode:multiply;opacity:.14`));
    Env.grainEl = div(`position:absolute;left:-150px;top:-150px;width:1380px;height:2220px;background:url(${Core.MEDIA}img/grain.png) 0 0/440px;mix-blend-mode:overlay;opacity:.06`);
    o.appendChild(Env.grainEl);
    o.appendChild(div("position:absolute;inset:0;background:radial-gradient(ellipse 75% 62% at 50% 46%,rgba(70,20,0,0) 60%,rgba(70,20,0,.22) 100%)"));
    const m = Env.mark;
    Env.markEl = div(`position:absolute;top:${m.top}px;right:${m.right}px;font-family:${Core.FONT};font-weight:400;font-synthesis:none;font-size:${m.size}px;line-height:1.15;color:rgba(255,255,255,.9);direction:ltr;white-space:nowrap`);
    Env.markEl.textContent = m.text;
    o.appendChild(Env.markEl);
  };
  Env.mark = { text: "@allawi.psd", top: 190, right: 56, size: 34, until: 39.4 };

  // the grain jumps on every second step of the frame, so it does not crawl
  const jitter = (i) => {
    const s = Math.sin(i * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };
  Env.update = (M, t) => {
    const i = Math.floor(t * 7.5);
    Env.grainEl.style.transform = `translate(${(jitter(i) * 300 - 150).toFixed(0)}px,${(jitter(i + 99) * 300 - 150).toFixed(0)}px)`;
    Env.markEl.style.opacity = t >= Env.mark.until ? "0" : "";
  };

  Core.Env = Env;
})(window.Core = window.Core || {});
