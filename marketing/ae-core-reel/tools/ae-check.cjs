// Checks build_reel_in_AE.jsx without After Effects: parses it as ES3 (what ExtendScript reads), runs it against a
// small model of the After Effects scripting API that only knows the property and effect names the script may use,
// then evaluates the keys it set (After Effects' temporal ease: speed and influence on a cubic Bezier), the
// parenting and the camera at sample times, and compares where every cut-out and word lands with the page.
const fs = require("fs"), path = require("path"), vm = require("vm"), acorn = require("acorn");
const { chromium } = require("playwright-core");
const ROOT = path.resolve(__dirname, "..");
const src = fs.readFileSync(path.join(ROOT, "ae/build_reel_in_AE.jsx"), "utf8");
acorn.parse(src.replace(/^#target.*$/m, ""), { ecmaVersion: 3 });

// ───── the model ─────
const enums = (names) => Object.fromEntries(names.map((n) => [n, n]));
const LEAF = new Set(["ADBE Anchor Point", "ADBE Position", "ADBE Position_0", "ADBE Position_1", "ADBE Position_2", "ADBE Scale", "ADBE Rotate Z", "ADBE Rotate Y", "ADBE Opacity", "ADBE Camera Zoom", "ADBE Audio Levels", "ADBE Text Document", "ADBE Vector Rect Size", "ADBE Vector Rect Position", "ADBE Vector Rect Roundness", "ADBE Vector Star Type", "ADBE Vector Star Points", "ADBE Vector Star Outer Radius", "ADBE Vector Star Inner Radius", "ADBE Vector Star Rotation", "ADBE Vector Fill Color", "ADBE Mask Shape", "ADBE Mask Feather"]);
const EFFECTS = { "ADBE Tint": 3, "ADBE Brightness & Contrast 2": 3, "ADBE Noise": 3, "ADBE Gaussian Blur 2": 3, "ADBE Drop Shadow": 6, "ADBE Linear Wipe": 3, "ADBE Ramp": 7, "ADBE Posterize Time": 1 };
const GROUPS = { "ADBE Transform Group": 1, "ADBE Text Properties": 1, "ADBE Effect Parade": 1, "ADBE Root Vectors Group": 1, "ADBE Vector Group": 1, "ADBE Vectors Group": 1, "ADBE Vector Shape - Rect": 1, "ADBE Vector Shape - Star": 1, "ADBE Vector Graphic - Fill": 1, "ADBE Mask Parade": 1, "ADBE Mask Atom": 1, "ADBE Camera Options Group": 1, "ADBE Audio Group": 1 };
const errors = [];
class Prop {
  constructor(name, owner) { this.name = name; this.owner = owner; this.kids = {}; this.list = []; this.keys = []; this.value = name === "ADBE Text Document" ? new TextDocument("") : 0; this.dimensionsSeparated = false; this.isSpatial = name === "ADBE Position" || name === "ADBE Anchor Point"; this.propertyValueType = name === "ADBE Text Document" ? "TEXT_DOCUMENT" : "X"; this.expression = ""; }
  property(n) {
    if (typeof n === "number") { if (!this.list[n - 1]) throw new Error(`no property #${n} in ${this.name}`); return this.list[n - 1]; }
    if (this.name in EFFECTS) {
      const m = /-(\d{4})$/.exec(n);
      if (!n.startsWith(this.name + "-") || !m || +m[1] > EFFECTS[this.name]) throw new Error(`${n} is not a parameter of ${this.name}`);
    } else if (!LEAF.has(n) && !GROUPS[n]) throw new Error(`unknown property ${n} under ${this.name}`);
    if (n === "ADBE Position_2" || n === "ADBE Position_1" || n === "ADBE Position_0") { if (!this.kids["ADBE Position"].dimensionsSeparated) throw new Error(`${n} before separating`); }
    return (this.kids[n] = this.kids[n] || new Prop(n, this.owner));
  }
  addProperty(n) {
    if (this.name === "ADBE Effect Parade" && !(n in EFFECTS)) throw new Error(`unknown effect ${n}`);
    const p = new Prop(n, this.owner);
    this.list.push(p);
    if (!(this.name === "ADBE Effect Parade")) this.kids[n] = p;
    return p;
  }
  setValue(v) { if (this.keys.length) throw new Error(`setValue on keyed ${this.name}`); this.value = v; }
  setValueAtTime(t, v) { if (this.keys.length && t <= this.keys[this.keys.length - 1].t - 1e-9) throw new Error(`keys out of order on ${this.name} ${this.owner.name} at ${t}`); this.keys.push({ t, v: v instanceof TextDocument ? v.text : v }); }
  setInterpolationTypeAtKey(i, a, b) { const k = this.keys[i - 1]; if (!k) throw new Error("no key " + i); k.inType = a; k.outType = b; }
  setTemporalEaseAtKey(i, a, b) {
    const k = this.keys[i - 1], nd = this.isSpatial && !this.dimensionsSeparated ? 1 : Array.isArray(k.v) ? k.v.length : 1;
    if (a.length !== nd || b.length !== nd) throw new Error(`ease dims ${a.length} for ${nd} on ${this.name} ${this.owner.name}`);
    for (const e of [...a, ...b]) if (!(e.influence >= 0.1 && e.influence <= 100) || !isFinite(e.speed)) throw new Error(`bad ease ${JSON.stringify(e)} on ${this.name} ${this.owner.name}`);
    k.easeIn = a; k.easeOut = b;
  }
}
class TextDocument { constructor(t) { this.text = t; } resetCharStyle() {} resetParagraphStyle() {} }
class Layer {
  constructor(comp, type, name) { this.comp = comp; this.type = type; this.name = name; this.root = new Prop("root", this); this.root.kids = {}; this.threeDLayer = false; this.startTime = 0; this.inPoint = 0; this.outPoint = comp.duration; this.parent = null; this.enabled = true; }
  property(n) {
    if (n === "ADBE Camera Options Group" && this.type !== "camera") throw new Error("camera options on " + this.type);
    if (n === "ADBE Text Properties" && this.type !== "text") throw new Error("text on " + this.type);
    if (n === "ADBE Root Vectors Group" && this.type !== "shape") throw new Error("contents on " + this.type);
    return this.root.property(n);
  }
  setParentWithJump(p) { this.parent = p; }
  setTrackMatte(m, type) { this.matte = m; }
  get index() { return this.comp.order.length - this.comp.order.indexOf(this); }
  moveBefore() {}
}
const comps = [];
const app = {
  project: null,
  newProject() {
    app.project = { items: { addComp(name, w, h, pa, duration, fps) { const c = { name, w, h, duration, fps, order: [], layers: null, openInViewer() {}, get numLayers() { return this.order.length; } };
      const add = (type, name) => { const l = new Layer(c, type, name); c.order.push(l); return l; };
      c.layers = { addNull: () => add("null", "Null"), add: (it) => add(it.audio ? "audio" : "footage", it.name), addText: (s) => { const l = add("text", s); l.property("ADBE Text Properties").property("ADBE Text Document").value = new TextDocument(s); return l; }, addShape: () => add("shape", "Shape"), addSolid: (c3, n) => add("solid", n), addCamera: (n) => add("camera", n) };
      comps.push(c); return c; }, addFolder: (n) => ({ name: n }) }, importFile: (io) => ({ name: io.file.name, audio: /\.wav$/.test(io.file.name) }), save: (f) => { saved.push(f.fsName); } };
  },
  beginUndoGroup() {}, endUndoGroup() {},
};
const saved = [];
// ExtendScript's File and Folder work with and without new
function File(p) { return { fsName: p, name: path.basename(p), exists: true, parent: { fsName: path.join(ROOT, "ae") } }; }
function Folder() { return { exists: true }; }
const ctx = {
  app, File, Folder, ImportOptions: class { constructor(f) { this.file = f; } }, Shape: class {}, KeyframeEase: class { constructor(s, i) { this.speed = s; this.influence = i; } },
  PropertyValueType: { TEXT_DOCUMENT: "TEXT_DOCUMENT" }, KeyframeInterpolationType: enums(["BEZIER", "LINEAR", "HOLD"]), ParagraphJustification: enums(["CENTER_JUSTIFY", "RIGHT_JUSTIFY", "LEFT_JUSTIFY"]),
  BlendingMode: enums(["MULTIPLY", "OVERLAY", "SCREEN"]), AutoOrientType: enums(["NO_AUTO_ORIENT"]), TrackMatteType: enums(["ALPHA"]),
  alert: (m) => { ctx.message = m; }, $: { fileName: path.join(ROOT, "ae/build_reel_in_AE.jsx") }, Math,
};
vm.createContext(ctx);
vm.runInContext(src.replace(/^#target.*$/m, ""), ctx, { timeout: 60000 });
console.log(ctx.message);
const comp = comps[0];
const DOC = JSON.parse(/var DOC = (\{.*\});/.exec(src)[1]);
const L = DOC.layers.map((d, i) => ({ d, l: comp.order[i] }));
if (comp.order.length !== DOC.layers.length) throw new Error("layer count differs");

// ───── After Effects' value at a time ─────
const bez = (p0, p1, p2, p3, u) => (1 - u) ** 3 * p0 + 3 * (1 - u) ** 2 * u * p1 + 3 * (1 - u) * u * u * p2 + u ** 3 * p3;
function valueAt(prop, t) {
  const K = prop.keys;
  let v;
  if (!K.length) v = prop.value;
  else if (t <= K[0].t) v = K[0].v;
  else if (t >= K[K.length - 1].t) v = K[K.length - 1].v;
  else {
    let i = 0;
    while (K[i + 1].t < t) i++;
    const a = K[i], b = K[i + 1], dt = b.t - a.t;
    if (a.outType === "HOLD" || prop.name === "ADBE Text Document") v = a.v;
    else if (a.outType === "LINEAR" && b.inType === "LINEAR") v = Array.isArray(a.v) ? a.v.map((x, j) => x + ((b.v[j] - x) * (t - a.t)) / dt) : a.v + ((b.v - a.v) * (t - a.t)) / dt;
    else {
      const one = (va, vb, eo, ei) => {
        const fo = eo ? eo.influence / 100 : 1 / 3, so = eo ? eo.speed : 0, fi = ei ? ei.influence / 100 : 1 / 3, si = ei ? ei.speed : 0;
        const x1 = a.t + fo * dt, y1 = va + so * fo * dt, x2 = b.t - fi * dt, y2 = vb - si * fi * dt;
        let lo = 0, hi = 1, u = 0.5;
        for (let k = 0; k < 50; k++) { u = (lo + hi) / 2; if (bez(a.t, x1, x2, b.t, u) < t) lo = u; else hi = u; }
        return bez(va, y1, y2, vb, u);
      };
      v = Array.isArray(a.v) ? a.v.map((x, j) => one(x, b.v[j], a.easeOut && a.easeOut[j], b.easeIn && b.easeIn[j])) : one(a.v, b.v, a.easeOut && a.easeOut[0], b.easeIn && b.easeIn[0]);
    }
  }
  if (prop.expression) v = new Function("value", "time", "return " + prop.expression)(v, t);
  return v;
}
const T = (l, n) => l.root.kids["ADBE Transform Group"] && l.root.kids["ADBE Transform Group"].kids[n];
function local(l, t) {
  const pos = T(l, "ADBE Position");
  let p = pos && pos.dimensionsSeparated ? [0, 1, 2].map((j) => (T(l, "ADBE Position_" + j) ? valueAt(T(l, "ADBE Position_" + j), t) : 0)) : pos ? valueAt(pos, t) : [0, 0, 0];
  if (p.length === 2) p = [p[0], p[1], 0];
  const an = T(l, "ADBE Anchor Point") ? valueAt(T(l, "ADBE Anchor Point"), t) : [0, 0, 0];
  const sc = T(l, "ADBE Scale") ? valueAt(T(l, "ADBE Scale"), t) : [100, 100, 100];
  const rz = T(l, "ADBE Rotate Z") ? valueAt(T(l, "ADBE Rotate Z"), t) : 0;
  return { p, an: [an[0], an[1], an[2] || 0], k: sc[0] / 100, kz: (sc[2] ?? 100) / 100, a: rz };
}
const RAD = Math.PI / 180;
function world(l, t) {
  const m = local(l, t);
  if (!l.parent) return { x: m.p[0], y: m.p[1], z: m.p[2], a: m.a, k: m.k };
  const P = world(l.parent, t), pm = local(l.parent, t), dx = m.p[0] - pm.an[0], dy = m.p[1] - pm.an[1], c = Math.cos(P.a * RAD), s = Math.sin(P.a * RAD);
  return { x: P.x + P.k * (dx * c - dy * s), y: P.y + P.k * (dx * s + dy * c), z: P.z + P.k * (m.p[2] - pm.an[2]), a: P.a + m.a, k: P.k * m.k };
}
const camL = comp.order.find((l) => l.type === "camera");
const zoom = valueAt(camL.property("ADBE Camera Options Group").property("ADBE Camera Zoom"), 0);
function project(w, t) {
  const c = world(camL, t), depth = w.z - c.z, k = zoom / depth, dx = w.x - c.x, dy = w.y - c.y, co = Math.cos(-c.a * RAD), si = Math.sin(-c.a * RAD);
  return { x: 540 + k * (dx * co - dy * si), y: 960 + k * (dx * si + dy * co), a: w.a - c.a, k: w.k * k };
}

(async () => {
  const BROWSER = fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")).map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];
  const browser = await chromium.launch({ executablePath: BROWSER, args: ["--allow-file-access-from-files"] });
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto("file://" + path.join(ROOT, "index.html") + "?render");
  await p.waitForFunction(() => window.Core && Core.ready, null, { timeout: 60000 });
  const times = Array.from({ length: 160 }, (_, i) => +(i * 0.2577).toFixed(3)).filter((t) => t < 41.2);
  const page = await p.evaluate((times) => {
    const M = Core.reel.M, out = {};
    for (const t of times) {
      const s = M.snapshot(t), o = (out[t] = {});
      for (const n of M.nodes) {
        if (!n.alive(t) || n.plane === "screen" || !Core.kinds[n.kind] || !Core.kinds[n.kind].make) continue;
        const P = Core.Camera.project(Core.worldOf(n, s.world), s.cam);
        if (P) o[n.id] = { x: P.x, y: P.y, a: P.a, k: P.k * (n.box ? n.box[0] : 1), on: P.x > -200 && P.x < 1280 && P.y > -200 && P.y < 2120 };
      }
    }
    return out;
  }, times);
  await browser.close();
  let n = 0, worst = { d: 0 };
  for (const t of times)
    for (const { d, l } of L) {
      if (!d.nid || !page[t][d.nid] || !page[t][d.nid].on || t < l.inPoint || t >= l.outPoint) continue;
      const q = page[t][d.nid], P = project(world(l, t), t), dd = Math.hypot(P.x - q.x, P.y - q.y);
      const box = d.type === "footage" ? P.k * DOC.layers.find((x) => x === d) && P.k : null;
      n++;
      if (dd > worst.d) worst = { d: dd, t, name: d.name, ae: [P.x, P.y], page: [q.x, q.y] };
      if (dd > 2) errors.push(`${t}s ${d.name}: ${dd.toFixed(1)} px off (ae ${P.x.toFixed(1)},${P.y.toFixed(1)} page ${q.x.toFixed(1)},${q.y.toFixed(1)})`);
    }
  console.log(`${n} placements compared over ${times.length} times; worst ${worst.d.toFixed(2)} px`, worst.name || "", worst.t ?? "");
  console.log(errors.length ? errors.slice(0, 25).join("\n") + (errors.length > 25 ? `\n… ${errors.length - 25} more` : "") : "every layer lands where the page puts it");
  console.log("saves:", saved.map((s) => path.basename(s)).join(", "));
})().catch((e) => { console.error(e); process.exit(1); });
