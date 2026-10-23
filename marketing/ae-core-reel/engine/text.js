// TextRig: kinetic type. A line is laid out once with the real font (so every word has its box and its baseline, which
// the After Effects text layers need too), then each word is its own node under the line: it rises out of its own
// mask with a turn (120% to 0, 5° to 0), punches in from 175%, rides a dark block that wipes in behind it, fills an
// outline, or sits on a pill. Once in, every word breathes on a slow sine. A word marked * is dark, ~ is where it
// stretches with tatweel.
(function (Core) {
  let meter;
  const sideOf = (align) => (align === "c" ? [40, 40] : align === "r" ? [20, 70] : [70, 20]);
  const LH = 1.15;

  const clean = (w) => w.replace(/[*~]/g, "");
  const full = (w, n) => w.replace("*", "").replace("~", "ـ".repeat(n));
  const isArabic = (s) => /[؀-ۿ]/.test(s);

  // lay out a line the way the browser sets it: where each word sits from the line's pivot, and the baseline
  function measure(o) {
    if (!meter) {
      meter = document.createElement("div");
      meter.style.cssText = "position:absolute;left:0;top:0;width:1080px;height:1920px;visibility:hidden;pointer-events:none";
      document.body.appendChild(meter);
    }
    const [l, r] = sideOf(o.align || "c");
    const line = document.createElement("div");
    line.style.cssText = `position:absolute;top:0;left:${l}px;right:${r}px;text-align:${o.align === "r" ? "right" : o.align === "l" ? "left" : "center"};white-space:nowrap;direction:rtl;font-family:${Core.FONT};font-weight:400;font-synthesis:none;font-size:${o.size}px;line-height:${LH}`;
    const spans = o.words.map((wd, i) => {
      if (i) line.appendChild(document.createTextNode(" "));
      const s = document.createElement("span");
      s.style.display = "inline-block";
      if (wd.v === "pill") {
        s.style.padding = "0.02em 0.42em 0.12em";
        if (!isArabic(wd.w)) { s.style.direction = "ltr"; s.style.unicodeBidi = "isolate"; }
      }
      s.textContent = full(wd.w, o.stretch || 0);
      line.appendChild(s);
      return s;
    });
    const mark = document.createElement("span");
    mark.style.cssText = "display:inline-block;width:0;height:0";
    line.appendChild(mark);
    meter.appendChild(line);
    const L = line.getBoundingClientRect(), base = mark.getBoundingClientRect().top;
    const px = (l + 1080 - r) / 2, py = L.height / 2;
    const words = spans.map((s) => {
      const b = s.getBoundingClientRect();
      return { cx: b.left + b.width / 2 - px, cy: b.top + b.height / 2 - py, w: b.width, h: b.height, base: base - (b.top + b.height / 2) };
    });
    meter.removeChild(line);
    return { px, py: o.top + py, words };
  }

  // one block of type (the flying word, the giant 3, the handle): its box and baseline
  function measureBlock(text, size, lh = LH, dir = "rtl") {
    measure({ words: [], size, top: 0 });
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:0;top:0;white-space:nowrap;direction:${dir};font-family:${Core.FONT};font-weight:400;font-synthesis:none;font-size:${size}px;line-height:${lh}`;
    const s = document.createElement("span");
    s.textContent = text;
    const mark = document.createElement("span");
    mark.style.cssText = "display:inline-block;width:0;height:0";
    d.append(s, mark);
    meter.appendChild(d);
    const b = d.getBoundingClientRect(), base = mark.getBoundingClientRect().top - b.top;
    meter.removeChild(d);
    return { w: b.width, h: b.height, base };
  }

  const shadow = "0 5px 18px rgba(80,25,0,.22)";
  const div = (css) => {
    const d = document.createElement("div");
    d.style.cssText = css;
    return d;
  };

  Core.kinds.word = {
    make(n) {
      const d = n.data, [w, h] = n.box, em = d.size;
      const colour = d.key ? Core.INK : d.dim ? "rgba(255,255,255,.66)" : "#fff";
      const el = div(`width:${w}px;height:${h}px;font-family:${Core.FONT};font-weight:400;font-synthesis:none;font-size:${em}px;line-height:${LH};white-space:nowrap;direction:rtl`);
      if (d.variant === "pill") {
        el.style.cssText += `;background:${Core.INK};color:#fff;border-radius:${em}px;text-align:center;box-shadow:0 10px 24px rgba(80,25,0,.3);padding:${0.02 * em}px 0 0;box-sizing:border-box`;
        if (!isArabic(d.text)) { el.style.direction = "ltr"; el.style.unicodeBidi = "isolate"; }
        el.textContent = d.text;
        return el;
      }
      if (d.variant === "bar") {
        n.barEl = div(`position:absolute;left:${-0.18 * em}px;right:${-0.18 * em}px;top:${0.16 * em}px;bottom:${0.02 * em}px;background:${Core.INK};transform-origin:100% 50%`);
        el.appendChild(n.barEl);
      }
      const masked = d.variant !== "punch";
      const holder = masked ? div(`position:absolute;left:${-0.04 * em}px;top:${-0.12 * em}px;width:${w + 0.08 * em}px;height:${h + 0.36 * em}px;overflow:hidden`) : el;
      const txt = div(`position:absolute;left:${masked ? 0.04 * em : 0}px;top:${masked ? 0.12 * em : 0}px;width:${w}px;height:${h}px;text-align:center;color:${d.variant === "bar" ? "#fff" : colour}`);
      if (d.variant === "fill") {
        const o = div(`color:transparent;-webkit-text-stroke:${Math.max(3, em * 0.022)}px ${colour}`);
        n.fillEl = div(`position:absolute;left:0;top:0;width:100%;color:${colour};text-shadow:${shadow}`);
        txt.append(o, n.fillEl);
        n.strokeEl = o;
      } else if (!d.key) txt.style.textShadow = shadow;
      if (masked) { holder.appendChild(txt); el.appendChild(holder); } else el.appendChild(txt);
      n.txt = txt;
      this.setText(n);
      return el;
    },
    setText(n) {
      const s = n.data.stretch ? full(n.data.raw, Math.round(n.v.stretch)) : clean(n.data.raw);
      if (s === n.shown) return;
      n.shown = s;
      if (n.fillEl) { n.strokeEl.textContent = s; n.fillEl.textContent = s; } else if (n.txt) n.txt.textContent = s;
    },
    update(n, t, ctx) {
      if (n.data.variant === "pill") return;
      this.setText(n);
      const v = n.v;
      n.txt.style.transform = `translateY(${(v.ty || 0).toFixed(2)}px) rotate(${(v.tr || 0).toFixed(2)}deg) scale(${(v.ts ?? 1).toFixed(4)})`;
      // the rise blurs along its own path, like the cut-outs do
      const was = ctx.before.inner.get(n), dy = Math.abs((v.ty || 0) - (was ? was.ty : 0)) * (ctx.P ? ctx.P.k : 1);
      n.txt.style.filter = dy > 2.4 ? `blur(${Math.min(6, dy / 10).toFixed(2)}px)` : "";
      if (n.barEl) n.barEl.style.transform = `scaleX(${Math.max(0, v.bar).toFixed(4)})`;
      if (n.fillEl) n.fillEl.style.clipPath = `inset(0 0 0 ${(100 - 100 * v.fill).toFixed(2)}%)`;
    },
  };

  // a line of words under one null: entries on the voice, the exit, and the breathing
  function line(M, shot, o) {
    const tl = M.tl, lay = measure(o), t0 = o.words[0].t;
    const end = o.out !== undefined ? o.out + 0.35 : shot.life[1];
    const L = M.node("null", { parent: shot, name: o.name || `line ${clean(o.words.map((w) => w.w).join(" "))}`, v: { x: lay.px + (o.x || 0), y: lay.py, rotation: o.rot || 0 }, life: [t0 - 0.05, end] });
    const words = o.words.map((wd, i) => {
      const m = lay.words[i], v = wd.v || "up", h = m.h;
      const W = M.node("word", {
        parent: L, shot, stack: o.stack ?? 30, box: [m.w, m.h], anchor: [m.w / 2, m.h / 2],
        name: clean(wd.w), life: [wd.t, end],
        v: { x: m.cx, y: m.cy, ty: 0, tr: 0, ts: 1, bar: 1, fill: 1, stretch: o.stretch || 0 },
        data: { raw: wd.w, text: full(wd.w, o.stretch || 0), key: wd.w.includes("*"), dim: o.dim, variant: v, size: o.size, base: m.base, stretch: wd.w.includes("~") ? o.stretch : 0 },
      });
      const V = W.v;
      // a word that comes in just before its line leaves finishes its entry in time for the exit
      const fit = (start, d) => (o.out !== undefined ? Math.max(0.06, Math.min(d, o.out - start)) : d);
      if (v === "punch") {
        V.scale = 1.75;
        tl.fromTo(V, { scale: 1.75 }, { scale: 1, duration: fit(wd.t, 0.45), ease: "snapPop" }, wd.t);
      } else if (v === "pill") {
        V.scale = 0; V.rotation = -4;
        tl.fromTo(V, { scale: 0, rotation: -4 }, { scale: 1, rotation: 0, duration: fit(wd.t, 0.42), ease: "snapPop" }, wd.t);
      } else if (v === "bar") {
        V.bar = 0; V.ty = 1.2 * h;
        tl.fromTo(V, { bar: 0 }, { bar: 1, duration: fit(wd.t, 0.24), ease: "kineticSlam" }, wd.t);
        tl.fromTo(V, { ty: 1.2 * h }, { ty: 0, duration: fit(wd.t + 0.08, 0.36), ease: "kineticSlam" }, wd.t + 0.08);
      } else {
        V.ty = 1.2 * h; V.tr = 5;
        tl.fromTo(V, { ty: 1.2 * h, tr: 5 }, { ty: 0, tr: 0, duration: fit(wd.t, 0.38), ease: "kineticSlam" }, wd.t);
        if (v === "fill") {
          V.fill = 0;
          if (wd.fill !== undefined) tl.fromTo(V, { fill: 0 }, { fill: 1, duration: 0.32, ease: "kineticSlam" }, wd.fill);
        }
      }
      if (W.data.stretch) {
        V.stretch = 0;
        tl.fromTo(V, { stretch: 0 }, { stretch: o.stretch, duration: 0.4, ease: "kineticSlam" }, wd.t + 0.12);
      }
      if (o.out !== undefined) {
        if (v === "punch") tl.to(V, { y: V.y - 70, scale: 0.6, opacity: 0, duration: 0.28, ease: "liftOff" }, o.out);
        else if (v === "pill") tl.to(V, { scale: 0, duration: 0.28, ease: "liftOff" }, o.out);
        else {
          tl.to(V, { ty: -1.2 * h, duration: 0.28, ease: "liftOff" }, o.out);
          if (v === "bar") tl.to(V, { bar: 0, duration: 0.28, ease: "liftOff" }, "<");
        }
      }
      const s = wd.t + 0.45, P = 1.5 + (i % 3) * 0.35;
      if (s < end - 0.3) tl.fromTo(V, { fy: 0 }, { fy: 3.5, duration: P, ease: "swing", repeat: Math.ceil((end - s) / P), yoyo: true }, s);
      return W;
    });
    return { line: L, words };
  }

  Core.TextRig = { line, measure, measureBlock, clean, full };
})(window.Core = window.Core || {});
