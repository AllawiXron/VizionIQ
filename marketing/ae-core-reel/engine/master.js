// MasterTimeline and the stage. Every element is a node parented the way an After Effects layer is (anchor, position,
// rotation, scale, depth), every move is a GSAP tween on a node's channels inside one paused master timeline, and the
// timeline carries a label on every line of the voice so moves are placed against the audio ("J2-=0.28"). A frame is
// drawn by seeking the timeline twice: at t - 1/30 for the shutter and at t, so each layer's own move and the
// camera's move become motion blur. The frame steps at 15 fps.
(function (Core) {
  const RAD = Math.PI / 180;
  const SVGNS = "http://www.w3.org/2000/svg";
  Core.INK = "#1f1510";
  Core.FONT = "'DG Sahabah'";
  Core.MEDIA = "media/";

  class Node {
    constructor(M, kind, o) {
      this.M = M;
      this.kind = kind;
      this.id = o.id || `${kind}${M.nodes.length}`;
      this.name = o.name || this.id;
      this.parent = o.parent || null;
      this.shot = o.shot || (o.parent && o.parent.shot) || null;
      this.plane = o.plane || "mid"; // bg, mid, fg, or screen for what plays inside a phone
      this.host = o.host || null;
      this.stack = o.stack ?? 10;
      this.anchor = o.anchor || [0, 0];
      this.box = o.box || null;
      this.life = o.life || [-1e9, 1e9];
      this.data = o.data || {};
      this.v = Object.assign({ x: 0, y: 0, z: 0, rotation: 0, scale: 1, opacity: 1, fy: 0, fr: 0, ry: 0 }, o.v || {});
      Object.defineProperty(this.v, "__node", { value: this });
      this.base = { x: this.v.x, y: this.v.y, rotation: this.v.rotation, scale: this.v.scale };
      this.order = M.nodes.length;
    }
    alive(t) {
      return t >= this.life[0] && t < this.life[1];
    }
  }

  // where a node's anchor sits in the world, and its turn and scale; a parent's anchor is the origin of its children
  const worldOf = (n, cache) => {
    let w = cache.get(n);
    if (w) return w;
    const L = n.v, lx = L.x, ly = L.y + L.fy, la = L.rotation + L.fr;
    if (!n.parent) w = { x: lx, y: ly, z: L.z, a: la, k: L.scale };
    else {
      const P = worldOf(n.parent, cache), pa = n.parent.anchor;
      const dx = lx - pa[0], dy = ly - pa[1], c = Math.cos(P.a * RAD), s = Math.sin(P.a * RAD);
      w = { x: P.x + P.k * (dx * c - dy * s), y: P.y + P.k * (dx * s + dy * c), z: P.z + P.k * L.z, a: P.a + la, k: P.k * L.scale };
    }
    cache.set(n, w);
    return w;
  };
  // a point of a node's own layer space, in the world
  const mapPoint = (w, n, px, py) => {
    const dx = px - n.anchor[0], dy = py - n.anchor[1], c = Math.cos(w.a * RAD), s = Math.sin(w.a * RAD);
    return { x: w.x + w.k * (dx * c - dy * s), y: w.y + w.k * (dx * s + dy * c), z: w.z, a: w.a, k: w.k };
  };

  class Master {
    constructor({ duration, fps = 30, poster = 15, zoom = 2400, root }) {
      this.D = duration;
      this.fps = fps;
      this.poster = poster;
      this.shutter = 1 / 30;
      this.tl = gsap.timeline({ paused: true, defaults: { immediateRender: false, overwrite: false } });
      this.camera = new Core.Camera(this.tl, zoom);
      this.nodes = [];
      this.shots = [];
      this.root = root;
      this.kinds = Core.kinds;
    }

    label(name, t) {
      this.tl.addLabel(name, t);
    }
    node(kind, o = {}) {
      const n = new Node(this, kind, o);
      this.nodes.push(n);
      if (kind === "shot") this.shots.push(n);
      return n;
    }
    // the frame on the 15 fps steps, for a 30 fps frame number
    stepped(frame) {
      return Math.min(this.D, Math.floor((frame / this.fps + 0.03) * this.poster) / this.poster);
    }

    // the DOM: #viewport > #world-canvas > one plane per depth; each shot gets its own box in the middle plane
    mount() {
      const R = this.root;
      R.innerHTML = "";
      const mk = (id, parent, style = "") => {
        const d = document.createElement("div");
        d.id = id;
        d.style.cssText = `position:absolute;left:0;top:0;width:1080px;height:1920px;${style}`;
        parent.appendChild(d);
        return d;
      };
      this.svg = document.createElementNS(SVGNS, "svg");
      this.svg.setAttribute("width", "0");
      this.svg.setAttribute("height", "0");
      this.svg.style.position = "absolute";
      R.appendChild(this.svg);
      this.under = mk("under", R);
      this.canvas = mk("world-canvas", R);
      this.planes = { bg: mk("plane-bg", this.canvas), mid: mk("plane-mid", this.canvas), fg: mk("plane-fg", this.canvas) };
      this.over = mk("over", R, "pointer-events:none");
      this.lens = new Core.Lens(this.svg, ["bg", "mid", "fg"]);
      for (const S of this.shots) S.box = mk(`shot-${S.id}`, this.planes.mid);
      const draw = this.nodes.filter((n) => this.kinds[n.kind] && this.kinds[n.kind].make);
      draw.sort((a, b) => a.stack - b.stack || a.order - b.order);
      for (const n of draw) {
        n.el = this.kinds[n.kind].make(n, this);
        if (!n.el) continue;
        n.el.style.position = "absolute";
        n.el.style.left = "0";
        n.el.style.top = "0";
        n.el.style.transformOrigin = "0 0";
        n.el.style.display = "none";
        if (n.plane === "screen") n.host.screenEl.appendChild(n.el);
        else if (n.plane === "mid" && n.shot) n.shot.box.appendChild(n.el);
        else this.planes[n.plane === "mid" ? "mid" : n.plane].appendChild(n.el);
      }
      this.draw = draw;
      if (Core.Env.mount) Core.Env.mount(this);
      // every tween gets its start values in order once, so any seek after this lands on the same frame
      this.tl.seek(this.D, false);
      this.tl.seek(0, false);
    }

    blurFilter(n, sx, sy) {
      if (!n.blurEl) {
        const f = document.createElementNS(SVGNS, "filter");
        f.id = `mb-${n.id}`;
        f.setAttribute("x", "-25%"); f.setAttribute("y", "-25%");
        f.setAttribute("width", "150%"); f.setAttribute("height", "150%");
        f.setAttribute("color-interpolation-filters", "sRGB");
        n.blurEl = document.createElementNS(SVGNS, "feGaussianBlur");
        f.appendChild(n.blurEl);
        this.svg.appendChild(f);
      }
      n.blurEl.setAttribute("stdDeviation", `${sx.toFixed(2)} ${sy.toFixed(2)}`);
      return `url(#mb-${n.id})`;
    }

    snapshot(t) {
      this.tl.seek(Math.max(0, t), false);
      const cache = new Map(), inner = new Map();
      for (const n of this.draw) {
        if (n.plane !== "screen") worldOf(n, cache);
        inner.set(n, { ty: n.v.ty || 0, ts: n.v.ts ?? 1 });
      }
      return { t, cam: this.camera.pose(), world: cache, inner };
    }

    async renderAt(t) {
      const before = this.snapshot(t - this.shutter);
      const now = this.snapshot(t);
      const cam = now.cam, waits = [];
      const C = Core.Camera;
      for (const S of this.shots) {
        const clip = S.data.clipUntil && t < S.data.clipUntil;
        if (clip) {
          const w = worldOf(S, now.world);
          const pts = [[0, 0], [1080, 0], [1080, 1920], [0, 1920]].map(([x, y]) => C.project(mapPoint(w, S, x, y), cam));
          S.box.style.clipPath = pts.every(Boolean) ? `polygon(${pts.map((p) => `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`).join(",")})` : "";
        } else S.box.style.clipPath = "";
      }
      for (const n of this.draw) {
        const K = this.kinds[n.kind], el = n.el;
        if (!el) continue;
        if (!n.alive(t) || n.v.opacity <= 0.002 || (n.host && !n.host.alive(t))) {
          el.style.display = "none";
          continue;
        }
        if (n.plane === "screen") {
          el.style.display = "";
          K.update && K.update(n, t, { waits, now, before });
          continue;
        }
        const P = C.project(now.world.get(n), cam);
        const size = n.box ? Math.max(n.box[0], n.box[1]) : 200;
        if (!P || P.x + P.k * size < -300 || P.x - P.k * size > 1380 || P.y + P.k * size < -300 || P.y - P.k * size > 2220) {
          el.style.display = "none";
          continue;
        }
        el.style.display = "";
        // the node's own move during the shutter, seen through this frame's camera
        const Q = C.project(before.world.get(n), cam) || P;
        const ds = Math.abs(P.k - Q.k) * size, dr = (Math.abs(P.a - Q.a) * size * P.k) / 180;
        const sx = Math.min(16, Math.abs(P.x - Q.x) / 4 + ds / 12 + dr / 6), sy = Math.min(16, Math.abs(P.y - Q.y) / 4 + ds / 12 + dr / 6);
        const ry = n.v.ry ? ` perspective(1600px) rotateY(${n.v.ry}deg)` : "";
        el.style.transform = `translate(${P.x.toFixed(2)}px,${P.y.toFixed(2)}px) rotate(${P.a.toFixed(3)}deg) scale(${P.k.toFixed(5)})${ry} translate(${-n.anchor[0]}px,${-n.anchor[1]}px)`;
        el.style.opacity = n.v.opacity >= 1 ? "" : n.v.opacity.toFixed(3);
        el.style.filter = n.data.noBlur || sx + sy < 0.6 ? n.data.filter || "" : `${n.data.filter || ""} ${this.blurFilter(n, sx, sy)}`;
        K.update && K.update(n, t, { waits, now, before, P });
      }
      const planeZ = { bg: Core.Env.depth || 5600, mid: 0 };
      this.lens.set("bg", this.planes.bg, C.smear(cam, before.cam, planeZ.bg));
      const mid = C.smear(cam, before.cam, 0);
      this.lens.set("mid", this.planes.mid, mid);
      this.lens.set("fg", this.planes.fg, [Math.min(22, mid[0] * 1.6), Math.min(22, mid[1] * 1.6)]);
      Core.Env.update && Core.Env.update(this, t, cam);
      await Promise.all(waits);
    }

    // live preview with the sound: the frame follows the audio clock, stepped at 15 fps
    async play(cues) {
      const ctx = new AudioContext();
      const buf = {};
      const load = async (name) => {
        if (!buf[name]) buf[name] = await ctx.decodeAudioData(await (await fetch(`${Core.MEDIA}audio/${name}.wav`)).arrayBuffer());
        return buf[name];
      };
      const list = cues.all();
      await Promise.all(list.map((c) => load(c.file)));
      const t0 = ctx.currentTime + 0.15;
      for (const c of list) {
        const src = ctx.createBufferSource(), g = ctx.createGain();
        src.buffer = buf[c.file];
        g.gain.value = c.gain;
        src.connect(g).connect(ctx.destination);
        src.start(t0 + c.t);
      }
      let last = -1;
      const tick = async () => {
        const t = ctx.currentTime - t0;
        if (t > this.D) return;
        const s = this.stepped(Math.max(0, t) * this.fps);
        if (s !== last) {
          last = s;
          await this.renderAt(s);
        }
        requestAnimationFrame(tick);
      };
      tick();
    }
  }

  // ───── the node kinds that draw themselves ─────

  const div = (css = "") => {
    const d = document.createElement("div");
    d.style.cssText = css;
    return d;
  };
  const BW = "grayscale(1) contrast(1.22) brightness(1.04)";
  const SHADOW = "drop-shadow(0 22px 26px rgba(80,25,0,.34))";

  // a cut-out: grey, more contrast, print grain inside its own outline, one warm shadow; foreground ones out of focus
  const cutout = (n) => {
    const [w, h] = n.box, url = Core.MEDIA + "el/" + n.data.src;
    const el = div(`width:${w}px;height:${h}px`);
    const inner = div(`position:relative;width:100%;height:100%;filter:${n.data.shadow === false ? "none" : SHADOW}`);
    const img = document.createElement("img");
    img.src = url;
    img.style.cssText = `position:relative;z-index:2;display:block;width:100%;height:100%;${n.data.colour ? "" : `filter:${BW}`}`;
    inner.appendChild(img);
    if (!n.data.colour)
      inner.appendChild(div(`position:absolute;inset:0;z-index:3;background:url(${Core.MEDIA}img/grain.png) 0 0/360px;mix-blend-mode:overlay;opacity:.5;-webkit-mask-image:url(${url});-webkit-mask-size:100% 100%`));
    el.appendChild(inner);
    if (n.data.defocus) n.data.filter = `blur(${n.data.defocus}px)`;
    n.inner = inner;
    return el;
  };

  Core.kinds = {
    image: { make: cutout },

    // a phone: the frame over its screen, and the screen plays what is put in it (a reel, an orange wipe, a word)
    phone: {
      make(n) {
        const el = cutout(n);
        const scr = div(`position:absolute;z-index:1;left:9.03%;top:1.84%;width:88.04%;height:96.21%;overflow:hidden;background:${Core.INK};-webkit-mask-image:url(${Core.MEDIA}el/phone-screen.png);-webkit-mask-size:100% 100%`);
        n.inner.insertBefore(scr, n.inner.firstChild);
        n.screenEl = scr;
        return el;
      },
    },
    video: {
      make(n) {
        const v = document.createElement("video");
        v.src = Core.MEDIA + "clips/" + n.data.clip + ".webm";
        v.muted = true;
        v.preload = "auto";
        v.playsInline = true;
        v.style.cssText = `width:${n.box[0]}px;height:${n.box[1]}px;object-fit:cover`;
        n.video = v;
        return v;
      },
      update(n, t, ctx) {
        const want = n.data.at + (t - n.data.from);
        n.el.style.transform = "";
        if (Math.abs(n.video.currentTime - want) > 0.004) {
          ctx.waits.push(new Promise((ok) => {
            const done = () => { n.video.removeEventListener("seeked", done); ok(); };
            n.video.addEventListener("seeked", done);
            n.video.currentTime = want;
            setTimeout(ok, 3000);
          }));
        }
      },
    },
    // a fill that slides up over the screen
    wipe: {
      make(n) {
        return div(`width:${n.box[0]}px;height:${n.box[1]}px;background:${n.data.colour}`);
      },
      update(n) {
        n.el.style.transform = `translateY(${n.v.ty.toFixed(2)}px)`;
      },
    },
    // a word that rises inside the screen and lifts out of it
    sword: {
      make(n) {
        const el = div(`width:${n.box[0]}px;height:${n.box[1]}px`);
        el.appendChild(div(`position:absolute;left:0;width:100%;top:${(n.box[1] - n.data.size * 1.15) / 2}px;text-align:center;font-family:${Core.FONT};font-weight:400;font-synthesis:none;font-size:${n.data.size}px;line-height:1.15;color:#fff;direction:rtl;white-space:nowrap`)).textContent = n.data.text;
        return el;
      },
      update(n) {
        n.el.style.transform = `translateY(${n.v.ty.toFixed(2)}px)`;
      },
    },
    // a star of sixteen points
    star: {
      make(n) {
        const r = n.data.r, el = div(`width:${2 * r}px;height:${2 * r}px`);
        const pts = Array.from({ length: 32 }, (_, i) => {
          const a = (Math.PI * i) / 16, rr = i % 2 ? r * 0.8 : r;
          return `${(r + Math.cos(a) * rr).toFixed(1)},${(r + Math.sin(a) * rr).toFixed(1)}`;
        }).join(" ");
        el.innerHTML = `<svg width="${2 * r}" height="${2 * r}" style="overflow:visible"><polygon points="${pts}" fill="${Core.INK}"/></svg>`;
        return el;
      },
    },
    // a block of type that moves as one piece
    text: {
      make(n) {
        const d = n.data;
        const el = div(`width:${n.box[0]}px;height:${n.box[1]}px;font-family:${Core.FONT};font-weight:400;font-synthesis:none;font-size:${d.size}px;line-height:${d.lh || 1.15};color:${d.colour || "#fff"};text-align:center;white-space:nowrap;direction:${d.dir || "rtl"}`);
        el.textContent = d.text;
        if (d.shadow) el.style.textShadow = "0 5px 18px rgba(80,25,0,.22)";
        return el;
      },
    },
  };

  Core.Node = Node;
  Core.Master = Master;
  Core.worldOf = worldOf;
  Core.mapPoint = mapPoint;
})(window.Core = window.Core || {});
