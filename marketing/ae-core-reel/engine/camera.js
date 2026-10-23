// CameraController: one camera over the whole stage, built the way After Effects builds it. A CAM_CONTROLLER null
// carries x, y, the dolly distance and the roll; the camera under it carries the extra tilt and pull-out a whip adds
// at its middle. Every layer is a flat plane facing the camera, so its picture is the layer turned, scaled by
// zoom / depth and moved around the middle of the frame: the same projection After Effects does for a one-node camera.
(function (Core) {
  const RAD = Math.PI / 180;

  class Camera {
    constructor(tl, zoom) {
      this.tl = tl;
      this.zoom = zoom; // the distance at which a layer shows at 100%
      this.v = { x: 540, y: 960, dist: zoom, r: 0, kick: 0, dip: 0 };
      Object.defineProperty(this.v, "__cam", { value: true });
    }

    // scale is how far in the camera is: 2 shows the stage at twice its size
    cameraTo({ x, y, scale, rotation, duration, ease = "whipPan" }, at) {
      const to = { duration, ease };
      if (x !== undefined) to.x = x;
      if (y !== undefined) to.y = y;
      if (scale !== undefined) to.dist = this.zoom / scale;
      if (rotation !== undefined) to.r = rotation;
      return this.tl.to(this.v, to, at);
    }

    // the whip's own kick: the frame tilts and pulls out into the middle of the move and comes back on landing
    kick(at, duration, roll, dip) {
      this.tl.to(this.v, { kick: roll, dip, duration: duration / 2, ease: "kickIn" }, at);
      this.tl.to(this.v, { kick: 0, dip: 0, duration: duration / 2, ease: "kickOut" }, ">");
    }

    pose() {
      const v = this.v;
      return { x: v.x, y: v.y, z: -(v.dist + v.dip), roll: v.r + v.kick, zoom: this.zoom };
    }

    // a world point and its turn and scale, on the screen
    static project(w, c) {
      const depth = w.z - c.z;
      if (depth < 20) return null;
      const k = c.zoom / depth, dx = w.x - c.x, dy = w.y - c.y;
      const co = Math.cos(-c.roll * RAD), si = Math.sin(-c.roll * RAD);
      return { x: 540 + k * (dx * co - dy * si), y: 960 + k * (dx * si + dy * co), a: w.a - c.roll, k: w.k * k, depth };
    }

    // how far the camera smeared a plane at world depth z during the shutter: the middle of the frame then and now,
    // plus the zoom and the roll
    static smear(c, prev, z = 0) {
      const mid = { x: c.x, y: c.y, z, a: 0, k: 1 };
      const a = Camera.project(mid, c), b = Camera.project(mid, prev);
      if (!a || !b) return [0, 0];
      const zoomBlur = Math.abs(Math.log(a.k / b.k)) * 260 + Math.abs(c.roll - prev.roll) * 6;
      return [Math.min(22, Math.abs(b.x - 540) / 4 + zoomBlur), Math.min(22, Math.abs(b.y - 960) / 4 + zoomBlur)];
    }
  }

  // the lens: one velocity blur per depth layer, an SVG Gaussian with its own X and Y
  class Lens {
    constructor(svg, planes) {
      this.f = {};
      for (const p of planes) {
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.id = `lens-${p}`;
        filter.setAttribute("x", "-5%"); filter.setAttribute("y", "-5%");
        filter.setAttribute("width", "110%"); filter.setAttribute("height", "110%");
        filter.setAttribute("color-interpolation-filters", "sRGB");
        const g = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        filter.appendChild(g);
        svg.appendChild(filter);
        this.f[p] = g;
      }
    }
    set(plane, el, [bx, by]) {
      this.f[plane].setAttribute("stdDeviation", `${bx.toFixed(2)} ${by.toFixed(2)}`);
      el.style.filter = bx + by > 0.8 ? `url(#lens-${plane})` : "";
    }
  }

  Core.Camera = Camera;
  Core.Lens = Lens;
})(window.Core = window.Core || {});
