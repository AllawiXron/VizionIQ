// My ad reel for the page, on the engine: fifteen shots laid out on one stage, one camera that whips between them,
// pushes in through a phone screen or pulls back to a bigger shot, kinetic type and black-and-white cut-outs acting on
// the words. The script, the voice and every sound cue are the fitted ones (sound.js); all motion is GSAP tweens on
// node channels, placed on the voice's labels, so the After Effects exporter can turn every one of them into keys.
(async function () {
  const { TextRig, Env } = Core;
  const D = 41.2;
  const SRC = ["bag-black.png", "bag-black2.png", "bag-blue.png", "bag-orange.png", "binoculars-man.png", "binoculars.png", "box-hand.png", "bulb.png", "button-finger.png", "cash-fan.png", "cash-pile.png", "chess-king.png", "chess-pawn.png", "coin-stacks.png", "coin.png", "crowd.png", "crowd2.png", "film-camera.png", "handshake.png", "magnifier.png", "megaphone.png", "padlock.png", "phone.png", "receiver.png", "register.png", "shop-owner.png", "stop-hand.png", "stopwatch-hand.png", "wallet.png"];
  const sizes = {};
  await Promise.all([
    ...SRC.map((s) => new Promise((ok, no) => { const i = new Image(); i.onload = () => { sizes[s] = [i.naturalWidth, i.naturalHeight]; ok(); }; i.onerror = no; i.src = Core.MEDIA + "el/" + s; })),
    new FontFace("DG Sahabah", `url(${Core.MEDIA}fonts/DG-Sahabah-Reg.ttf)`, { weight: "400" }).load().then((f) => document.fonts.add(f)),
  ]);
  Core.size = (s) => sizes[s];
  Core.sources = SRC;

  const M = new Core.Master({ duration: D, zoom: 2400, root: document.getElementById("viewport") });
  const tl = M.tl, cam = M.camera;
  Env.setup(M);

  // ───── the stage: each shot is a 1080×1920 frame placed from the last one ─────
  const DEG = Math.PI / 180;
  const on = (p, lx, ly) => {
    const dx = (lx - 540) * p.s, dy = (ly - 960) * p.s, c = Math.cos(p.r * DEG), s = Math.sin(p.r * DEG);
    return [p.cx + dx * c - dy * s, p.cy + dx * s + dy * c];
  };
  // where a phone's screen sits in its shot and how wide it is
  const PH = 1500 / 719;
  const screenOf = (left, top, w, rot) => {
    const h = w * PH, cx = left + w / 2, cy = top + h / 2;
    const ox = (0.0903 + 0.8804 / 2) * w - w / 2, oy = (0.0184 + 0.9621 / 2) * h - h / 2;
    const c = Math.cos(rot * DEG), s = Math.sin(rot * DEG);
    return [cx + ox * c - oy * s, cy + ox * s + oy * c, 0.8804 * w];
  };
  const P = [];
  const add = (id, a, b, tin, p) => P.push({ id, a, b, tin, ...p });
  const last = () => P[P.length - 1];
  const whip = (id, a, b, lx, ly, dr, k = 1) => { const p = last(), [cx, cy] = on(p, lx, ly); add(id, a, b, "whip", { cx, cy, r: p.r + dr, s: p.s * k }); };
  const into = (id, a, b, scr, rot) => { const p = last(), [cx, cy] = on(p, scr[0], scr[1]); add(id, a, b, "push", { cx, cy, r: p.r + rot, s: (p.s * scr[2]) / 1080 }); };
  const back = (id, a, b, k, lx, ly, dr) => {
    const p = last(), s = p.s * k, r = p.r + dr, c = Math.cos(r * DEG), sn = Math.sin(r * DEG), dx = (lx - 540) * s, dy = (ly - 960) * s;
    add(id, a, b, "pull", { cx: p.cx - (dx * c - dy * sn), cy: p.cy - (dx * sn + dy * c), r, s });
  };
  add("A", 0, 2.6, "whip", { cx: 540, cy: 960, r: 0, s: 1 });
  whip("B", 2.6, 5.2, -1900, 1260, -7);
  whip("D1", 5.2, 6.55, 540 + 2300, 960 + 400, 7);
  whip("D2", 6.55, 7.74, 540, 960 + 2500, 6);
  whip("F", 7.74, 12.62, 540 + 2300, 960 - 500, 9);
  whip("I", 12.62, 14.42, 540 - 2200, 960 - 700, -6);
  whip("J1", 14.42, 16.3, 540 - 2300, 960 + 300, -8);
  back("J2", 16.3, 19.04, 2.3, 540, 960 + 2100, 5);
  whip("L", 19.04, 23.52, 540 + 300, 960 - 2600, -6);
  whip("M1", 23.52, 26.5, 540 - 2300, 960 + 100, 8);
  whip("M2", 26.5, 28.5, 540 + 2000, 960 + 600, -5, 0.92);
  whip("O1", 28.5, 32.45, 540 - 200, 960 + 2500, 6);
  back("O2", 32.45, 35.48, 2.0, 540, 960 - 2100, -4);
  whip("R1", 35.48, 36.65, 540 - 2300, 960, -8);
  back("R2", 36.65, D, 1.8, 540 + 1700, 960, 4);

  const S = {};
  for (const p of P) {
    M.label(p.id, p.a);
    S[p.id] = M.node("shot", { id: p.id, name: `SHOT ${p.id}`, anchor: [540, 960], v: { x: p.cx, y: p.cy, rotation: p.r, scale: p.s }, life: [p.a - 0.45, p.b + 0.45], data: { place: p } });
  }

  // ───── the camera: a drift on every hold, a whip, push or pull into the next shot ─────
  const PRE = 0.28, POST = 0.27, DZ = 0.04, DR = 0.9;
  Object.assign(cam.v, { x: P[0].cx, y: P[0].cy, dist: cam.zoom * P[0].s, r: P[0].r });
  P.forEach((p, j) => {
    const a0 = j === 0 ? 0 : p.a + POST, a1 = j === P.length - 1 ? D : p.b - PRE;
    cam.cameraTo({ rotation: p.r + DR, scale: (1 + DZ) / p.s, duration: a1 - a0, ease: "settle" }, a0);
    const n = P[j + 1];
    if (!n) return;
    cam.cameraTo({ x: n.cx, y: n.cy, rotation: n.r, scale: 1 / n.s, duration: PRE + POST, ease: "whipPan" }, `${n.id}-=${PRE}`);
    if (n.tin === "whip") cam.kick(`${n.id}-=${PRE}`, PRE + POST, (j % 2 ? 1 : -1) * 7, 0.136 * cam.zoom * (p.s + n.s) / 2);
  });

  // ───── helpers for the cut-outs ─────
  const img = (sh, src, w, left, top, o = {}) => {
    const [nw, nh] = Core.size(src), h = (w * nh) / nw;
    return M.node(o.kind || "image", { parent: sh, shot: sh, name: o.name || src.replace(".png", ""), stack: o.z ?? 10, box: [w, h], anchor: [w / 2, h / 2], v: { x: left + w / 2, y: top + h / 2, rotation: o.r || 0 }, life: (o.life || sh.life).slice(), data: { src, colour: o.colour } });
  };
  // slam in from an offset with the overshoot; from and rest are offsets from where it was laid out, r and s absolute
  const slam = (n, t0, d, from, rest = {}) => {
    const b = n.base;
    const A = { x: b.x + (from.x || 0), y: b.y + (from.y || 0), rotation: from.r ?? rest.r ?? 0, scale: from.s ?? 1 };
    const B = { x: b.x + (rest.x || 0), y: b.y + (rest.y || 0), rotation: rest.r ?? 0, scale: rest.s ?? 1 };
    Object.assign(n.v, A);
    n.life[0] = t0;
    tl.fromTo(n.v, A, { ...B, duration: d, ease: "snapPop" }, t0);
    n.rest = B;
  };
  // thrown out: the offset is added to where it rests
  const leave = (n, t, by, d = 0.35) => {
    const r = n.rest, to = { duration: d, ease: "liftOff" };
    if (by.x) to.x = r.x + by.x;
    if (by.y) to.y = r.y + by.y;
    if (by.r) to.rotation = r.rotation + by.r;
    tl.to(n.v, to, t);
    n.life[1] = t + d;
  };
  // waiting in place for the camera: a slow float on the sine
  const wait = (n, amp = 10, ph = 0) => {
    const [a, b] = n.life, s = a - ph;
    tl.fromTo(n.v, { fy: -amp }, { fy: amp, duration: Math.PI / 1.3, ease: "swing", repeat: Math.ceil((b - s) / (Math.PI / 1.3)), yoyo: true }, s);
    tl.fromTo(n.v, { fr: -0.6 }, { fr: 0.6, duration: Math.PI / 0.9, ease: "swing", repeat: Math.ceil((b - s) / (Math.PI / 0.9)), yoyo: true }, s);
    n.v.fy = -amp; n.v.fr = -0.6;
  };
  // a short push out and back, for a hit on a word
  const punch = (n, t0, amt, dy = 0) => {
    const b = n.rest || { scale: n.v.scale, y: n.v.y };
    tl.to(n.v, { scale: b.scale * (1 + amt), y: b.y + dy, duration: 0.1, ease: "kickOut" }, t0);
    tl.to(n.v, { scale: b.scale, y: b.y, duration: 0.45, ease: "snapPop" }, ">");
  };
  // a shake that dies out: half swings alternating around the base value
  const shake = (v, ch, t0, base, amp, dur, n) => {
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n, val = base + (k % 2 ? -1 : 1) * amp * (1 - u);
      tl.to(v, { [ch]: val, duration: k ? dur / n : dur / n / 2, ease: k ? "swing" : "kickOut" }, k ? ">" : t0);
    }
    tl.to(v, { [ch]: base, duration: dur / n / 2, ease: "swing" }, ">");
  };
  const W = (pairs) => pairs.map(([w, t, v]) => ({ w, t, v }));
  const kw = (w, t, v, more = {}) => ({ w, t, v, ...more });
  const line = (sh, o) => TextRig.line(M, sh, o);
  const block = (sh, text, size, o) => {
    const m = TextRig.measureBlock(text, size, o.lh);
    const w = o.width || m.w, h = m.h, [fx, fy] = o.origin || [0.5, 0.5];
    return M.node("text", { parent: sh, shot: sh, name: o.name || text, stack: o.z ?? 30, box: [w, h], anchor: [w * fx, h * fy], v: { x: o.left + w * fx, y: o.top + h * fy }, life: (o.life || sh.life).slice(), data: { text, size, lh: o.lh, colour: o.colour, base: m.base, shadow: o.shadow } });
  };
  // a phone with one of my reels on its screen, optionally turning, optionally wiping to orange
  const phone = (sh, name, left, top, w, r, t0, clip, turn, wipeAt) => {
    const n = img(sh, "phone.png", w, left, top, { kind: "phone", r, name });
    if (t0 > 0) slam(n, t0, 0.55, { y: 900, r: r * 3 }, { r });
    if (turn) tl.fromTo(n.v, { ry: 0 }, { ry: 360, duration: 0.5, ease: "kineticSlam" }, turn);
    const bw = n.box[0] * 0.8804, bh = n.box[1] * 0.9621;
    if (clip) M.node("video", { host: n, plane: "screen", name: `${name} reel`, box: [bw, bh], life: [clip.from, clip.from + clip.dur], data: clip });
    if (wipeAt !== undefined) {
      const wp = M.node("wipe", { host: n, plane: "screen", name: `${name} wipe`, box: [bw, bh], v: { ty: bh }, life: [wipeAt, sh.life[1]], data: { colour: "#e9631f" } });
      tl.fromTo(wp.v, { ty: bh }, { ty: 0, duration: 0.22, ease: "kineticSlam" }, wipeAt);
    }
    return n;
  };

  // ───── A · مشروعك متعوب عليه، بس أرباحك قليلة ─────
  line(S.A, { top: 330, size: 92, words: W([["مشروعك", 0.0], ["متعوب", 0.56], ["عليه،", 0.88], ["بس", 1.38]]) });
  line(S.A, { top: 430, size: 300, words: [kw("أرباحك", 1.66, "fill", { fill: 1.95 })] });
  const few = line(S.A, { top: 780, size: 210, words: [kw("*قليلة؟", 2.1, "punch")] }).words[0];
  tl.to(few.v, { y: few.v.y + 26, rotation: -8, duration: 0.3, ease: "snapPop" }, 2.28);
  const wallet = img(S.A, "wallet.png", 1000, 40, 1110);
  {
    const b = wallet.base;
    Object.assign(wallet.v, { y: b.y + 40, rotation: -4 });
    tl.fromTo(wallet.v, { y: b.y + 40, rotation: -4 }, { y: b.y, rotation: -6, duration: 2.4, ease: "settle" }, 0);
    tl.to(wallet.v, { y: b.y - 23, rotation: -3.5, duration: 0.12, ease: "rise" }, 2.42);
    tl.to(wallet.v, { y: b.y, rotation: -6, duration: 0.28, ease: "snapPop" }, ">");
  }
  const coin = img(S.A, "coin.png", 180, 450, 1000, { z: 14, colour: true, life: [1.98, 2.62] });
  {
    const b = coin.base;
    Object.assign(coin.v, { y: b.y - 1350, rotation: -260 });
    tl.fromTo(coin.v, { y: b.y - 1350, rotation: -260 }, { y: b.y - 200, rotation: -20, duration: 0.3, ease: "gravity" }, 1.98);
    tl.to(coin.v, { x: b.x + 60, duration: 0.14, ease: "kickOut" }, 2.28);
    tl.to(coin.v, { y: b.y + 40, rotation: 40, duration: 0.14, ease: "gravity" }, 2.28);
    tl.to(coin.v, { y: b.y + 90, scale: 0.4, opacity: 0, duration: 0.2, ease: "gravity" }, 2.42);
  }

  // ───── B · عدنا نصمملك موشن جرافيك وبوستات إعلانية ─────
  line(S.B, { top: 250, size: 128, stretch: 3, out: 4.1, words: W([["عدنا", 2.65], ["*نصم~ملك", 2.91]]) });
  line(S.B, { top: 430, size: 160, out: 4.1, words: W([["موشن", 3.45, "bar"], ["جرافيك", 3.73, "bar"]]) });
  line(S.B, { top: 260, size: 170, words: W([["وبوستات", 4.2]]) });
  line(S.B, { top: 480, size: 250, words: [kw("إعلانية", 4.73, "fill", { fill: 4.88 })] });
  // the film camera rolls in from the right edge and kicks on each word of «موشن جرافيك», then rolls out
  const film = img(S.B, "film-camera.png", 980, 300, 860, { name: "film camera" });
  slam(film, 2.55, 0.55, { x: 900, r: 18 }, { r: -4 });
  punch(film, 3.45, 0.05, -20);
  punch(film, 3.73, 0.05, -20);
  leave(film, 4.1, { x: 1200, r: 25 }, 0.35);
  // a hand brings the box in from the left on «وبوستات» and lifts it on «إعلانية»
  const box = img(S.B, "box-hand.png", 1100, -60, 1080, { name: "box in hand" });
  slam(box, 4.2, 0.5, { x: -1200, r: -14 }, { r: -3 });
  punch(box, 4.73, 0.05, -40);

  // ───── D1 · تحجي بقوة براندك ─────
  line(S.D1, { top: 300, size: 110, words: W([["تحجي", 5.25], ["بقوة", 5.63, "bar"]]) });
  const mega = img(S.D1, "megaphone.png", 860, -260, 820);
  slam(mega, 5.22, 0.5, { x: -700, r: -40 }, { r: -18 });
  tl.to(mega.v, { x: mega.rest.x - 60, scale: 1.08, duration: 0.12, ease: "kickOut" }, 6.04);
  tl.to(mega.v, { x: mega.rest.x, scale: 1, duration: 0.23, ease: "snapPop" }, ">");
  const star = M.node("star", { parent: S.D1, shot: S.D1, name: "burst", stack: 20, box: [620, 620], anchor: [310, 310], v: { x: 470, y: 980, scale: 0, rotation: 85 }, life: [6.06, S.D1.life[1]], data: { r: 310 } });
  tl.fromTo(star.v, { scale: 0 }, { scale: 1, duration: 1, ease: "snapElastic" }, 6.06);
  tl.fromTo(star.v, { x: 470, y: 980 }, { x: 700, y: 760, duration: 0.42, ease: "snapPop" }, 6.06);
  tl.fromTo(star.v, { rotation: 85 }, { rotation: 99, duration: 0.94, ease: "glide" }, 6.06);
  const brand = block(S.D1, "براندك", 200, { left: 170, top: 860, width: 600, z: 21, life: [6.06, S.D1.life[1]], shadow: true });
  {
    const b = brand.base, dx = 230, dy = -220;
    Object.assign(brand.v, { scale: 0.2, rotation: -25 });
    tl.fromTo(brand.v, { x: b.x, y: b.y, scale: 0.2, rotation: -25 }, { x: b.x + dx, y: b.y + dy, scale: 1, rotation: -6, duration: 0.42, ease: "snapPop" }, 6.06);
  }

  // ───── D2 · وتبيع بمكانك ─────
  line(S.D2, { top: 300, size: 136, words: [kw("وتبيع", 6.67), kw("*بمكانك", 7.09, "punch")] });
  const owner = img(S.D2, "shop-owner.png", 920, 80, 960);
  wait(owner, 8);
  punch(owner, 7.09, 0.07, -40);

  // ───── F · حركة تشد العين، فكرة تقنع الزبون، ونتيجة ترفع مبيعاتك ─────
  line(S.F, { top: 250, size: 150, out: 9.1, words: W([["تشد", 8.37, "bar"], ["*العين", 8.61, "punch"]]) });
  line(S.F, { top: 250, size: 150, out: 10.7, words: W([["تقنع", 9.63, "bar"], ["الزبون", 10.03, "bar"]]) });
  line(S.F, { top: 250, size: 150, words: W([["ترفع", 11.45, "bar"], ["*مبيعاتك", 11.83, "punch"]]) });
  // three huge words, each one shoving the last off the left edge as it comes in from the right
  const huge = (text, t0, t1) => {
    const n = block(S.F, text, 330, { left: 40, top: 520, width: 1000, shadow: true, life: [t0, t1 ? t1 + 0.32 : S.F.life[1]] });
    n.v.x = n.base.x + 1150; n.v.rotation = 8;
    tl.fromTo(n.v, { x: n.base.x + 1150, rotation: 8 }, { x: n.base.x, rotation: 0, duration: 0.42, ease: "kineticSlam" }, t0);
    if (t1) tl.to(n.v, { x: n.base.x - 1250, rotation: -8, duration: 0.3, ease: "liftOff" }, t1);
  };
  huge("حركة", 7.79, 9.14);
  huge("فكرة", 9.19, 10.72);
  huge("ونتيجة", 10.77);
  // what each word does, anchored to the bottom edge: eyes on the move, the idea dropping in, the till ringing
  const bino = img(S.F, "binoculars.png", 900, 90, 1150, { z: 14 });
  slam(bino, 7.79, 0.45, { y: 800, r: 10 }, {});
  leave(bino, 9.14, { y: 900, r: -12 }, 0.3);
  const bulb = img(S.F, "bulb.png", 500, 290, 1080, { z: 14 });
  slam(bulb, 9.19, 0.5, { y: -1700, r: 25 }, { r: -6 });
  leave(bulb, 10.72, { y: 1100, r: 30 }, 0.3);
  const till = img(S.F, "register.png", 820, 130, 1040, { z: 14, name: "cash register" });
  slam(till, 10.77, 0.45, { y: 1000 }, {});
  punch(till, 11.83, 0.06, -20);
  const cash = img(S.F, "cash-fan.png", 560, 260, 700, { z: 12, name: "cash out of the till", life: [11.83, S.F.life[1]] });
  slam(cash, 11.83, 0.5, { y: 520, s: 0.3, r: -20 }, { r: -8 });

  // ───── I · من أول 3 ثواني بإعلانك ─────
  line(S.I, { top: 290, size: 210, stretch: 11, words: W([["م~ن", 12.67]]) });
  line(S.I, { top: 600, size: 110, align: "r", words: W([["أول", 12.93, "pill"]]) });
  const three = block(S.I, "3", 820, { left: 40, top: 640, lh: 1, colour: Core.INK, origin: [0.5, 0.7], z: 9, life: [13.17, S.I.life[1]] });
  three.v.scale = 0; three.v.rotation = -14;
  tl.fromTo(three.v, { scale: 0 }, { scale: 1, duration: 1, ease: "snapElastic" }, 13.17);
  tl.fromTo(three.v, { rotation: -14 }, { rotation: 0, duration: 0.15, ease: "kineticSlam" }, 13.17);
  tl.to(three.v, { x: three.base.x - 50, rotation: -7, duration: 0.35, ease: "snapPop" }, 13.32);
  line(S.I, { top: 1500, size: 104, align: "l", words: W([["ثواني", 13.35], ["*بإعلانك", 13.73, "punch"]]) });
  const hand = img(S.I, "stopwatch-hand.png", 520, 620, 930);
  slam(hand, 12.72, 0.5, { y: 900, x: 200, r: 18 }, { r: -6 });
  tl.to(hand.v, { x: hand.rest.x - 40, duration: 0.1, ease: "kickOut" }, 13.22);
  tl.to(hand.v, { x: hand.rest.x, duration: 0.2, ease: "snapPop" }, ">");

  // ───── J1 · الزبون راح يلمس الكواليتي العالي ─────
  line(S.J1, { top: 300, size: 104, words: W([["الزبون", 14.47], ["راح", 14.87], ["يلمس", 15.09]]) });
  const qual = line(S.J1, { top: 460, size: 150, words: [kw("الكواليتي", 15.37)] }).words[0];
  tl.to(qual.v, { scale: 1.14, y: qual.v.y - 8, duration: 0.4, ease: "snapPop" }, 15.45);
  line(S.J1, { top: 680, size: 150, words: [kw("*العالي", 15.79, "punch")] });
  const lens = img(S.J1, "magnifier.png", 520, 390, 410, { z: 32 });
  slam(lens, 14.62, 0.6, { x: 700, y: 400, r: 30 }, { r: -8 });

  // ───── J2 · يثق بمنتجك، ويدخل يطلب منك مباشرة ─────
  const trust = line(S.J2, { top: 300, size: 160, out: 17.45, words: [kw("يثق", 16.41), kw("*بمنتجك", 16.69, "punch")] }).words;
  line(S.J2, { top: 300, size: 112, words: W([["ويدخل", 17.55], ["يطلب", 17.89], ["منك", 18.23]]) });
  line(S.J2, { top: 560, size: 210, words: W([["مباشرة", 18.55, "bar"]]) });
  const hands = img(S.J2, "handshake.png", 1320, -120, 1000);
  wait(hands, 6);
  shake(hands.v, "y", 16.75, hands.base.y, 22, 0.45, 3);
  for (const w of trust) shake(w.v, "y", 16.75, w.v.y, 13, 0.45, 3);
  punch(hands, 18.55, 0.06);

  // ───── L · لأن ويانا راح يطلع إعلانك بمستوى يعزلك تماما عن منافسيك ─────
  line(S.L, { top: 300, size: 104, out: 21.42, words: W([["لأن", 19.09], ["ويانا", 19.65], ["راح", 20.21], ["يطلع", 20.43]]) });
  line(S.L, { top: 440, size: 150, out: 21.42, words: W([["إعلانك", 20.69, "bar"], ["بمستوى", 21.13, "bar"]]) });
  line(S.L, { top: 300, size: 180, words: [kw("يعزلك", 21.75, "punch"), kw("تماما", 22.17, "fill", { fill: 22.4 })] });
  const rivals = line(S.L, { top: 540, size: 116, dim: true, words: [kw("عن", 22.69), kw("منافسيك", 22.77)] }).words;
  rivals.forEach((w, i) => {
    const dir = i ? -1 : 1;
    tl.to(w.v, { rotation: dir * 80, duration: 0.45, ease: "kineticSlam" }, 23.05);
    tl.to(w.v, { y: w.v.y + 900, duration: 0.45, ease: "gravity" }, 23.05);
    tl.to(w.v, { x: w.v.x + dir * 120, duration: 0.45, ease: "glide" }, 23.05);
    w.life[1] = 23.5;
  });
  [[40, 1330, 190], [230, 1400, 170], [680, 1400, 170], [850, 1330, 190]].forEach(([x, y, w], i) => {
    const p = img(S.L, "chess-pawn.png", w, x, y, { name: `pawn ${i + 1}` });
    const t0 = 21.75 + i * 0.04, dir = i < 2 ? -1 : 1;
    p.life[1] = t0 + 0.5;
    wait(p, 6, i);
    tl.to(p.v, { x: p.base.x + dir * 900, duration: 0.5, ease: "kineticSlam" }, t0);
    tl.to(p.v, { y: p.base.y - 300, duration: 0.25, ease: "rise" }, t0);
    tl.to(p.v, { y: p.base.y, duration: 0.25, ease: "gravity" }, ">");
    tl.to(p.v, { rotation: dir * 160, duration: 0.5, ease: "glide" }, t0);
  });
  const king = img(S.L, "chess-king.png", 300, 390, 860);
  wait(king, 6);
  punch(king, 21.75, 0.08);

  // ───── M1 · ويخلي الزبون يشتري منك مرة ومرتين وعشرة ─────
  line(S.M1, { top: 300, size: 100, out: 24.72, words: W([["ويخلي", 23.57], ["الزبون", 23.93], ["يشتري", 24.27], ["منك", 24.63]]) });
  line(S.M1, { top: 330, size: 180, align: "r", rot: -8, words: W([["مرة", 24.97, "punch"], ["×1", 24.97, "pill"]]) });
  line(S.M1, { top: 560, size: 180, align: "l", rot: 5, words: W([["ومرتين", 25.35, "punch"], ["×2", 25.35, "pill"]]) });
  const ten = line(S.M1, { top: 800, size: 190, rot: -4, words: [kw("*وعشرة", 25.97, "punch"), kw("×10", 25.97, "pill")] }).words;
  for (const w of ten) tl.to(w.v, { y: w.v.y - 70, duration: 0.35, ease: "snapPop" }, 26.0);
  const BAG = ["bag-orange.png", "bag-black.png", "bag-blue.png", "bag-black2.png"];
  [[660, 1210], [150, 1300], [20, 1440], [330, 1480], [620, 1460], [850, 1380], [120, 1630], [470, 1650], [760, 1620], [280, 1740], [600, 1770], [900, 1710]].forEach(([x, y], i) => {
    const t0 = i === 0 ? 24.95 : i === 1 ? 25.33 : 25.95 + (i - 2) * 0.04;
    const b = img(S.M1, BAG[i % 4], 230 + (i % 3) * 30, x, y, { name: `bag ${i + 1}` });
    slam(b, t0, 0.42, { y: -1600, r: (i % 2 ? 1 : -1) * 40 }, { r: Math.sin(i * 1.9) * 12 });
  });

  // ───── M2 · لأن شاف براند حقيقي قدامه ─────
  line(S.M2, { top: 520, size: 112, align: "r", words: W([["لأن", 26.67], ["شاف", 27.01]]) });
  line(S.M2, { top: 650, size: 240, align: "r", words: W([["*براند", 27.21, "punch"]]) });
  line(S.M2, { top: 930, size: 132, align: "r", words: W([["حقيقي", 27.57, "bar"], ["قدامه", 27.97, "bar"]]) });
  const watcher = img(S.M2, "binoculars-man.png", 560, -10, 430);
  wait(watcher, 8);
  tl.to(watcher.v, { x: watcher.base.x + 30, rotation: 3, duration: 0.4, ease: "snapPop" }, 27.21);

  // ───── O1 · كافي تضيع جمهورك بتصاميم عادية، الكل يتخطاها، ابدأ اليوم ─────
  line(S.O1, { top: 300, size: 112, out: 30.6, words: W([["كافي", 28.55], ["تضيع", 28.93], ["*جمهورك", 29.15, "punch"]]) });
  line(S.O1, { top: 450, size: 150, out: 30.6, words: [kw("بتصاميم", 29.65), kw("عادية", 30.15, "fill")] });
  const all = line(S.O1, { top: 1000, size: 150, out: 31.5, words: W([["الكل", 30.85], ["يتخطاها", 30.99]]) }).line;
  tl.to(all.v, { x: all.v.x - 260, duration: 0.5, ease: "kineticSlam" }, 31.0);
  line(S.O1, { top: 360, size: 180, words: W([["ابدأ", 31.63, "punch"], ["اليوم", 32.05, "bar"]]) });
  const crowd1 = img(S.O1, "crowd.png", 1000, 0, 1220, { name: "crowd 1", life: [28.3, S.O1.life[1]] });
  crowd1.v.x = crowd1.base.x + 1100;
  tl.fromTo(crowd1.v, { x: crowd1.base.x + 1100 }, { x: crowd1.base.x - 1400, duration: 4.2, ease: "glide" }, 28.3);
  const crowd2 = img(S.O1, "crowd2.png", 960, 0, 1180, { name: "crowd 2", z: 35, life: [30.6, S.O1.life[1]] });
  crowd2.v.x = crowd2.base.x + 1200;
  tl.fromTo(crowd2.v, { x: crowd2.base.x + 1200 }, { x: crowd2.base.x - 1300, duration: 2.4, ease: "glide" }, 30.6);

  // ───── O2 · بتصاميم توقف الزبون وتقفل وياه البيعة ─────
  const stops = line(S.O2, { top: 300, size: 104, words: [kw("بتصاميم", 32.51), kw("*توقف", 33.09, "punch"), kw("الزبون", 33.51)] }).words;
  tl.to(stops[1].v, { y: stops[1].v.y - 50, duration: 0.3, ease: "snapPop" }, 33.0);
  const sale = line(S.O2, { top: 470, size: 140, words: [kw("وتقفل", 34.05), kw("وياه", 34.61), kw("البيعة", 34.85, "bar")] }).words[2];
  shake(sale.v, "x", 34.9, sale.v.x, 10, 0.31, 6);
  const crowd3 = img(S.O2, "crowd2.png", 960, 0, 1180, { name: "crowd 3", life: [32.2, 34.3] });
  crowd3.v.x = crowd3.base.x + 1100;
  tl.fromTo(crowd3.v, { x: crowd3.base.x + 1100 }, { x: crowd3.base.x + 280, duration: 0.85, ease: "kineticSlam" }, 32.2);
  tl.to(crowd3.v, { x: crowd3.base.x + 220, duration: 0.3, ease: "kineticSlam" }, 33.05);
  tl.to(crowd3.v, { y: crowd3.base.y + 900, duration: 0.35, ease: "liftOff" }, 33.95);
  const stop = img(S.O2, "stop-hand.png", 760, 160, 880, { z: 12 });
  slam(stop, 32.98, 0.32, { y: 1000, r: 10 }, {});
  leave(stop, 33.95, { y: 1000 }, 0.32);
  const lock = img(S.O2, "padlock.png", 330, 375, 760, { life: [34.05, S.O2.life[1]] });
  lock.v.y = lock.base.y - 1400;
  tl.fromTo(lock.v, { y: lock.base.y - 1400 }, { y: lock.base.y, duration: 0.32, ease: "gravity" }, 34.05);
  tl.to(lock.v, { y: lock.base.y + 16, duration: 0.15, ease: "kickOut" }, 34.37);
  tl.to(lock.v, { y: lock.base.y, duration: 0.15, ease: "swing" }, ">");
  shake(lock.v, "rotation", 34.85, 0, 6, 0.3, 5);

  // ───── R1 · تواصل ويانا بالخاص ─────
  line(S.R1, { top: 300, size: 136, words: W([["تواصل", 35.53], ["ويانا", 35.81, "bar"]]) });
  line(S.R1, { top: 700, size: 160, align: "l", words: W([["بالخاص", 36.09, "pill"]]) });
  const recv = img(S.R1, "receiver.png", 760, 520, 540);
  slam(recv, 35.3, 0.45, { x: 700, r: 40 }, {});
  shake(recv.v, "rotation", 36.09, 0, 8, 0.47, 6);

  // ───── R2 · شوف أعمالنا، وخلي براندك يبيع صح ─────
  line(S.R2, { top: 330, size: 200, out: 37.45, words: W([["شوف", 36.79], ["*أعمالنا", 36.99, "punch"]]) });
  const fan = img(S.R2, "cash-fan.png", 760, 200, 960, { name: "cash fan" });
  slam(fan, 36.99, 0.45, { y: 900, r: 30 }, { r: -12 });
  leave(fan, 37.45, { y: 1100, r: 20 }, 0.3);
  line(S.R2, { top: 260, size: 150, words: W([["وخلي", 37.53], ["براندك", 38.05]]) });
  line(S.R2, { top: 450, size: 210, words: W([["*يبيع", 38.71, "punch"], ["صح", 39.07, "bar"]]) });
  line(S.R2, { top: 760, size: 120, words: [{ w: "@allawi.psd", t: 39.55, v: "pill" }] });
  // a finger comes down from the top edge and presses the button next to the handle
  const press = img(S.R2, "button-finger.png", 700, 480, 420, { name: "finger on the button" });
  slam(press, 39.2, 0.4, { y: -1500, r: 8 }, {});
  punch(press, 39.55, 0.03, 34);

  // ───── the depths: the far plane, and what crosses the lens on every whip ─────
  Env.build(M, P.map((p, j) => ({ t: j ? p.a - 0.1 : 0, x: p.cx + (j % 2 ? 800 : -800) * Math.max(0.6, p.s), y: p.cy - 900 * Math.max(0.6, p.s) })));
  const PASS = ["cash-fan.png", "coin.png", "bag-black.png", "cash-pile.png", "bulb.png", "coin.png", "bag-orange.png", "cash-fan.png", "coin-stacks.png", "cash-pile.png", "coin.png"];
  let pi = 0;
  P.forEach((n, j) => {
    if (!j || n.tin !== "whip") return;
    const a = P[j - 1], sh = S[n.id], side = pi % 2 ? 1 : -1;
    // halfway between the two shots, off to one side of the path, in the next shot's own frame
    const mx = (a.cx + n.cx) / 2, my = (a.cy + n.cy) / 2, len = Math.hypot(n.cx - a.cx, n.cy - a.cy);
    const px = mx + (side * -(n.cy - a.cy) / len) * 330 * n.s, py = my + (side * (n.cx - a.cx) / len) * 330 * n.s;
    const c = Math.cos(-n.r * DEG), s = Math.sin(-n.r * DEG), dx = (px - n.cx) / n.s, dy = (py - n.cy) / n.s;
    Env.passer(M, sh, PASS[pi % PASS.length], 540 + dx * c - dy * s, 960 + dx * s + dy * c, 640, n.a - PRE - 0.05, n.a + POST + 0.08, side * 20);
    pi++;
  });

  Core.reel = { M, S, P, sound: window.SOUND };
  M.mount();
  const q = new URLSearchParams(location.search);
  if (!q.has("render")) {
    document.body.classList.add("preview");
    await M.renderAt(q.has("t") ? +q.get("t") : 0);
    document.getElementById("viewport").addEventListener("click", () => M.play(window.SOUND), { once: true });
  }
  Core.ready = true;
})();
