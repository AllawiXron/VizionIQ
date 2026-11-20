import { useEffect, type RefObject } from "react";

// Real refraction for glass surfaces. A displacement map is drawn for the element's own size and
// fed to an SVG filter that the element uses as its backdrop-filter, so the page behind it bends
// at the rim (and, for a lens, magnifies in the middle). Only Chromium renders SVG filters inside
// backdrop-filter; everywhere else the CSS glass stays as it is.

export interface LiquidGlassOptions {
  /** width of the bending rim in px */
  bezel?: number;
  /** how far the rim pulls the picture, in px */
  strength?: number;
  /** 0 = flat middle, 0.3 = clear magnifying lens */
  magnify?: number;
  /** split red, green and blue a little at the rim */
  dispersion?: boolean;
  /** extra backdrop functions after the refraction */
  extra?: string;
  enabled?: boolean;
}

let supported: boolean | null = null;
export const refractionSupported = (): boolean => {
  if (supported !== null) return supported;
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands;
  const chromium = !!brands?.some((b) => /Chromium/i.test(b.brand));
  const reduced = window.matchMedia?.("(prefers-reduced-transparency: reduce)").matches === true;
  supported = chromium && !reduced;
  return supported;
};

const SVG_NS = "http://www.w3.org/2000/svg";
let defs: SVGDefsElement | null = null;
let counter = 0;

const getDefs = (): SVGDefsElement => {
  if (defs && defs.isConnected) return defs;
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("width", "0");
  svg.setAttribute("height", "0");
  svg.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
  defs = document.createElementNS(SVG_NS, "defs");
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
};

// red = horizontal pull, green = vertical pull, 128 = none
const drawMap = (w: number, h: number, r: number, bezel: number, magnify: number): string => {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(w, h);
  const cx = w / 2;
  const cy = h / 2;
  const hw = w / 2 - r;
  const hh = h / 2 - r;
  const reach = Math.max(cx, cy);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - cx;
      const py = y + 0.5 - cy;
      const qx = Math.abs(px) - hw;
      const qy = Math.abs(py) - hh;
      let nx = 0;
      let ny = 0;
      let dist: number;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        dist = r - len;
        nx = (qx / len) * Math.sign(px);
        ny = (qy / len) * Math.sign(py);
      } else if (qx > qy) {
        dist = r - qx;
        nx = Math.sign(px);
      } else {
        dist = r - qy;
        ny = Math.sign(py);
      }
      let dx = 0;
      let dy = 0;
      if (dist >= 0 && dist < bezel) {
        // convex edge: strongest at the rim, easing to nothing at the bezel's inner side
        const t = 1 - dist / bezel;
        const m = t * t * (3 - 2 * t);
        dx -= nx * m;
        dy -= ny * m;
      }
      if (magnify > 0 && dist >= 0) {
        dx -= (px / reach) * magnify;
        dy -= (py / reach) * magnify;
      }
      const i = (y * w + x) * 4;
      img.data[i] = Math.max(0, Math.min(255, Math.round(128 + dx * 127)));
      img.data[i + 1] = Math.max(0, Math.min(255, Math.round(128 + dy * 127)));
      img.data[i + 2] = 128;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL("image/png");
};

const channel = (c: "r" | "g" | "b") =>
  c === "r" ? "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" : c === "g" ? "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" : "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0";

const filterMarkup = (w: number, h: number, map: string, strength: number, dispersion: boolean): string => {
  const image = `<feImage href="${map}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="none" result="map"/>`;
  if (!dispersion) {
    return `${image}<feDisplacementMap in="SourceGraphic" in2="map" scale="${strength}" xChannelSelector="R" yChannelSelector="G"/>`;
  }
  const pass = (c: "r" | "g" | "b", k: number) =>
    `<feDisplacementMap in="SourceGraphic" in2="map" scale="${(strength * k).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="d${c}"/>` +
    `<feColorMatrix in="d${c}" type="matrix" values="${channel(c)}" result="${c}"/>`;
  return (
    image +
    pass("r", 1) +
    pass("g", 0.965) +
    pass("b", 0.93) +
    `<feBlend in="r" in2="g" mode="screen" result="rg"/><feBlend in="rg" in2="b" mode="screen"/>`
  );
};

export function useLiquidGlass<T extends HTMLElement>(ref: RefObject<T | null>, options: LiquidGlassOptions = {}): void {
  const { bezel = 16, strength = 34, magnify = 0, dispersion = false, extra = "blur(5px) saturate(170%)", enabled = true } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !refractionSupported()) return;

    const id = `vz-lg-${++counter}`;
    const filter = document.createElementNS(SVG_NS, "filter");
    filter.setAttribute("id", id);
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("primitiveUnits", "userSpaceOnUse");
    filter.setAttribute("color-interpolation-filters", "sRGB");
    getDefs().appendChild(filter);

    let lastKey = "";
    const build = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      if (w < 4 || h < 4) return;
      const radius = Math.min(parseFloat(getComputedStyle(el).borderTopLeftRadius) || 0, w / 2, h / 2);
      const key = `${w}x${h}r${radius}`;
      if (key === lastKey) return;
      lastKey = key;
      filter.setAttribute("x", "0");
      filter.setAttribute("y", "0");
      filter.setAttribute("width", String(w));
      filter.setAttribute("height", String(h));
      const map = drawMap(w, h, radius, Math.min(bezel, Math.min(w, h) / 2), magnify);
      filter.innerHTML = filterMarkup(w, h, map, strength, dispersion);
      const value = `url(#${id}) ${extra}`.trim();
      el.style.setProperty("backdrop-filter", value, "important");
      el.style.setProperty("-webkit-backdrop-filter", value, "important");
      el.dataset.refraction = "on";
    };

    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    return () => {
      ro.disconnect();
      filter.remove();
      el.style.removeProperty("backdrop-filter");
      el.style.removeProperty("-webkit-backdrop-filter");
      delete el.dataset.refraction;
    };
  }, [ref, bezel, strength, magnify, dispersion, extra, enabled]);
}
