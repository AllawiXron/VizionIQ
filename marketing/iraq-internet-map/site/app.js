(() => {
'use strict';

// ---------- numbers, words, colour ----------

const LN4 = Math.log(4), LN200 = Math.log(200), SPAN = LN200 - LN4;
const RAMP = [[0, [110, 28, 8]], [0.35, [226, 104, 28]], [0.65, [255, 184, 86]], [1, [255, 244, 222]]];
const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const ORDINAL = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة',
  'الثانية عشرة', 'الثالثة عشرة', 'الرابعة عشرة', 'الخامسة عشرة', 'السادسة عشرة', 'السابعة عشرة', 'الثامنة عشرة'];
const NUM = new Intl.NumberFormat('ar-IQ-u-nu-arab', { maximumFractionDigits: 0 });
const ar = n => NUM.format(Math.round(n));
const arDigits = s => String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// digits inside a Kufi heading are set in the text face, whose numerals read plainly
const head = s => esc(s).replace(/[٠-٩0-9]+/g, d => `<span class="n">${d}</span>`);

const speedV = mbps => Math.max(0, Math.min(1, (Math.log(Math.max(mbps, 1)) - LN4) / SPAN));
function rampRGB(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < RAMP.length - 1; i++) {
    const [a, ca] = RAMP[i], [b, cb] = RAMP[i + 1];
    if (t <= b) { const k = (t - a) / (b - a); return ca.map((c, j) => Math.round(c + (cb[j] - c) * k)); }
  }
  return RAMP[RAMP.length - 1][1];
}
// numbers on the page take the colour of their own speed, lifted a little so slow ones stay readable on the dark ground
const speedColour = mbps => `rgb(${rampRGB(0.18 + 0.82 * speedV(mbps)).join(',')})`;

// Arabic counted nouns: 1, 2, 3 to 10, 11 to 99, and hundreds follow the last two digits
function counted(n, [one, two, few, many]) {
  const r = n >= 100 ? n % 100 : n;
  if (n === 1) return one;
  if (n === 2) return two;
  if (n >= 100 && r === 0) return one;
  if (r >= 3 && r <= 10) return few;
  if (r >= 11) return many;
  return one;
}
const TESTS = ['اختبار', 'اختباران', 'اختبارات', 'اختبارا'];
const DAYS_N = ['يوم', 'يومان', 'أيام', 'يوما'];
const nTests = n => `${ar(n)} ${counted(n, TESTS)}`;

function norm(s) {
  return String(s).replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, ' ').trim();
}
const bare = s => norm(s).split(' ').map(w => w.replace(/^ال/, '')).join(' ');

// ---------- state ----------

const S = { mode: 'f', places: [], govs: [], byId: new Map(), country: null, exams: [], areas: {}, focus: null, pick: null };
const PERIOD = { f: 'تموز إلى أيلول ٢٠٢٦', m: 'تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦' };
const KIND = { f: 'إنترنت البيت', m: 'إنترنت الموبايل' };
const MIN_TESTS = 10;
const isWide = () => matchMedia('(min-width: 900px)').matches;
const IRAQ = [[38.8, 29.05], [48.6, 37.4]];

// ---------- map style ----------

const lnP = P => ['ln', ['max', ['get', P], 1]];
const colourExpr = P => ['interpolate', ['linear'], lnP(P),
  LN4, 'rgb(110,28,8)', LN4 + 0.35 * SPAN, 'rgb(226,104,28)', LN4 + 0.65 * SPAN, 'rgb(255,184,86)', LN200, 'rgb(255,244,222)'];
const coreExpr = P => ['interpolate', ['linear'], lnP(P),
  LN4, 'rgb(150,44,12)', LN4 + 0.3 * SPAN, 'rgb(240,128,44)', LN4 + 0.55 * SPAN, 'rgb(255,206,128)', LN4 + 0.8 * SPAN, 'rgb(255,238,206)', LN200, 'rgb(255,250,240)'];
const lumExpr = P => ['interpolate', ['linear'], lnP(P), LN4, 0.14, LN4 + 0.5 * SPAN, 0.5, LN200, 1];
const confExpr = C => ['+', 0.45, ['*', 0.055, ['min', ['get', C], 10]]];
const has = P => ['>=', ['get', P], 0];
const rank = (a, b, c, d, e) => ['match', ['get', 'r'], 1, a, 2, b, 3, c, 4, d, e];

function roadWidth(k) {
  return ['interpolate', ['exponential', 1.6], ['zoom'],
    5, rank(0.9 * k, 0.6 * k, 0.4 * k, 0.3 * k, 0.2 * k),
    10, rank(2.0 * k, 1.6 * k, 1.2 * k, 0.9 * k, 0.6 * k),
    13, rank(3.6 * k, 3.0 * k, 2.4 * k, 1.9 * k, 1.3 * k),
    16, rank(8 * k, 6.5 * k, 5 * k, 4 * k, 3 * k)];
}

function paint(P, C) {
  const L = lumExpr(P), K = confExpr(C);
  return {
    'rd-wide': { 'line-color': colourExpr(P), 'line-opacity': ['*', 0.10, L, K] },
    'rd-glow': { 'line-color': colourExpr(P), 'line-opacity': ['*', 0.34, L, K] },
    'rd-core': { 'line-color': ['case', has(P), coreExpr(P), 'rgb(44,49,58)'], 'line-opacity': ['case', has(P), ['*', L, K], 0.32] },
    // the squares carry the light at country scale; from city scale the streets take over
    'sq-glow': { 'circle-color': colourExpr(P), 'circle-opacity': ['interpolate', ['linear'], ['zoom'], 4, ['*', 0.11, L, K], 8, ['*', 0.10, L, K], 10, ['*', 0.05, L, K], 12, ['*', 0.015, L, K]] },
    'sq-core': { 'circle-color': coreExpr(P), 'circle-opacity': ['interpolate', ['linear'], ['zoom'], 4, ['*', 1, L, K], 7.5, ['*', 0.8, L, K], 8.6, ['*', 0.3, L, K], 9.4, ['*', 0.1, L, K], 11, ['*', 0.04, L, K]] },
  };
}

function style(base) {
  const P = S.mode, C = P === 'f' ? 'a' : 'b', p = paint(P, C);
  return {
    version: 8,
    sources: {
      ground: { type: 'image', url: base + 'tiles/ground.jpg', coordinates: [[37.5, 38.5], [50.0, 38.5], [50.0, 28.0], [37.5, 28.0]] },
      iq: { type: 'vector', tiles: ['iq://t/{z}/{x}/{y}'], minzoom: 4, maxzoom: 13, bounds: [38.6, 28.9, 48.9, 37.5] },
      focus: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
      pick: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#060609' } },   // the ground plate's own outer tone (tiles/ground.json)
      { id: 'ground', type: 'raster', source: 'ground', paint: { 'raster-fade-duration': 0, 'raster-resampling': 'linear' } },
      { id: 'water', type: 'fill', source: 'iq', 'source-layer': 'wt', paint: { 'fill-color': '#03060b', 'fill-opacity': 0.92, 'fill-antialias': true } },
      { id: 'rivers', type: 'line', source: 'iq', 'source-layer': 'rv', maxzoom: 12,
        paint: { 'line-color': '#03060b', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 0.6, 11, 2.4] } },
      { id: 'rd-wide', type: 'line', source: 'iq', 'source-layer': 'rd', minzoom: 8, filter: has(P), layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { ...p['rd-wide'], 'line-width': roadWidth(9), 'line-blur': roadWidth(9) } },
      { id: 'rd-glow', type: 'line', source: 'iq', 'source-layer': 'rd', filter: has(P), layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { ...p['rd-glow'], 'line-width': roadWidth(3.2), 'line-blur': roadWidth(2.6) } },
      { id: 'sq-glow', type: 'circle', source: 'iq', 'source-layer': 'sq', filter: has(P),
        paint: { ...p['sq-glow'], 'circle-radius': ['interpolate', ['exponential', 1.5], ['zoom'], 4, 2.4, 8, 6, 11, 12, 13, 20], 'circle-blur': 1 } },
      { id: 'rd-core', type: 'line', source: 'iq', 'source-layer': 'rd', layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { ...p['rd-core'], 'line-width': roadWidth(1) } },
      { id: 'sq-core', type: 'circle', source: 'iq', 'source-layer': 'sq', filter: has(P),
        paint: { ...p['sq-core'], 'circle-radius': ['interpolate', ['exponential', 1.5], ['zoom'], 4, 0.55, 6, 0.9, 8, 1.4, 10, 2.4, 12, 3.4], 'circle-blur': 0.6 } },
      { id: 'sq-hit', type: 'circle', source: 'iq', 'source-layer': 'sq', minzoom: 9, filter: has(P),
        paint: { 'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 9, 1.2, 16, 154], 'circle-opacity': 0 } },
      { id: 'focus-mask', type: 'fill', source: 'focus', filter: ['==', ['get', 'role'], 'mask'], paint: { 'fill-color': '#07090d', 'fill-opacity': 0.62 } },
      { id: 'focus-line', type: 'line', source: 'focus', filter: ['==', ['get', 'role'], 'edge'],
        paint: { 'line-color': 'rgba(255,184,86,0.6)', 'line-width': 1.2 } },
      { id: 'pick', type: 'line', source: 'pick', paint: { 'line-color': 'rgba(255,244,222,0.9)', 'line-width': 1.4 } },
    ],
  };
}

// ---------- map tiles: three files by zoom, read in pieces where the host allows range requests, whole where not ----------

class TileFile {
  constructor(url) { this.url = url; this.whole = null; }
  getKey() { return this.url; }
  async getBytes(offset, length, signal) {
    if (!this.whole) {
      if (this.url.endsWith('.txt')) {
        this.whole = fetch(this.url).then(r => { if (!r.ok) throw new Error(`${this.url}: ${r.status}`); return r.text(); }).then(unbase64);
      } else {
        const r = await fetch(this.url, { headers: { Range: `bytes=${offset}-${offset + length - 1}` }, signal });
        if (r.status === 206) return { data: await r.arrayBuffer() };
        if (!r.ok) throw new Error(`${this.url}: ${r.status}`);
        if (!this.whole) this.whole = r.arrayBuffer();
      }
      this.whole.catch(() => { this.whole = null; });   // a cancelled or failed download is tried again next time
    }
    const b = await this.whole;
    return { data: b.slice(offset, offset + length) };
  }
}
// hosts that serve no binary files get the same tiles as base64 text (a .txt part), decoded once here
function unbase64(s) {
  const bin = atob(s.trim()), out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}
// [lowest zoom, highest zoom, first tile column, last tile column, file]
const PARTS = window.TILE_PARTS || [[4, 11, 0, 1e9, 'tiles/iraq-a.pmtiles'], [12, 12, 0, 1e9, 'tiles/iraq-b.pmtiles'], [13, 13, 0, 1e9, 'tiles/iraq-c.pmtiles']];
function tileProtocol(base) {
  const files = PARTS.map(([a, b, x0, x1, u]) => ({ a, b, x0, x1, pm: new pmtiles.PMTiles(new TileFile(base + u)) }));
  return async (params, abort) => {
    const [z, x, y] = params.url.split('/').slice(-3).map(Number);
    const f = files.find(f => z >= f.a && z <= f.b && x >= f.x0 && x <= f.x1);
    const t = f && await f.pm.getZxy(z, x, y, abort && abort.signal);
    return { data: t ? new Uint8Array(t.data) : new Uint8Array(0) };
  };
}

// ---------- the map: inside the page on phones, beside it on wide screens ----------

const wrap = document.getElementById('mapwrap');
let map, mapReady;
function placeMap() {
  const slot = document.querySelector('#page .mapslot');
  if (isWide()) { if (wrap.parentNode !== document.body) document.body.appendChild(wrap); wrap.style.display = ''; }
  else if (slot) { if (wrap.parentNode !== slot) slot.appendChild(wrap); wrap.style.display = ''; }
  else { wrap.classList.remove('full'); wrap.style.display = 'none'; }
  if (map) map.resize();
  return wrap.style.display !== 'none' && !(isWide() && document.body.classList.contains('nomap'));
}

// the map libraries load after the first page is on screen
const LIBS = window.MAP_LIBS || ['vendor/maplibre-gl.js', 'vendor/pmtiles.js'];
const loadLibs = () => LIBS.reduce((p, src) => p.then(() => new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s);
})), Promise.resolve());

function ensureMap() {
  if (!mapReady) mapReady = loadLibs().then(makeMap);
  return mapReady;
}
function makeMap() {
  const base = new URL('.', location.href).href;
  maplibregl.addProtocol('iq', tileProtocol(base));
  map = new maplibregl.Map({
    container: 'map', style: style(base), bounds: IRAQ, fitBoundsOptions: { padding: framePadding() },
    minZoom: 4.2, maxZoom: 16.5, maxBounds: [[30, 20], [58, 47]], attributionControl: false,
    dragRotate: false, pitchWithRotate: false, renderWorldCopies: false, fadeDuration: 0,
    cooperativeGestures: !isWide(),
    locale: {
      'CooperativeGesturesHandler.MobileHelpText': 'حرك الخريطة بإصبعين',
      'CooperativeGesturesHandler.WindowsHelpText': 'اضغط Ctrl مع التمرير لتكبير الخريطة',
      'CooperativeGesturesHandler.MacHelpText': 'اضغط ⌘ مع التمرير لتكبير الخريطة',
    },
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  map.on('move', () => { placeLabels(); placeReadout(); });
  map.on('moveend', () => { chooseLabels(); placeLabels(); placeReadout(); });
  map.on('click', onMapClick);
  return new Promise(res => map.once('load', () => { chooseLabels(); placeLabels(); res(); }));
}

function frame(bounds, opts = {}) {
  const cam = map.cameraForBounds(bounds, { padding: framePadding(), maxZoom: opts.maxZoom || 20 });
  if (!cam) return;
  if (opts.duration === 0 || matchMedia('(prefers-reduced-motion: reduce)').matches) map.jumpTo(cam);
  else map.flyTo({ ...cam, duration: opts.duration || 1200 });
}
function framePadding() {
  return isWide() ? { top: 60, bottom: 130, left: 60, right: 60 } : { top: 56, bottom: 104, left: 16, right: 16 };
}

wrap.querySelector('.mapctl').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !map) return;
  const act = b.dataset.act;
  if (act === 'in') map.zoomIn();
  else if (act === 'out') map.zoomOut();
  else if (act === 'all') { frame(S.focus ? S.focusBounds : IRAQ); }
  else if (act === 'full') {
    const on = !wrap.classList.contains('full');
    wrap.classList.toggle('full', on);
    document.documentElement.style.overflow = on ? 'hidden' : '';
    b.textContent = on ? 'إغلاق' : 'ملء الشاشة';
    map.resize();
    if (map.cooperativeGestures) on ? map.cooperativeGestures.disable() : map.cooperativeGestures.enable();
  }
});

// the colour key, drawn from the same scale as the map
(function legend() {
  const ticks = [5, 10, 25, 50, 100, 200];
  const stops = [];
  for (let i = 0; i <= 10; i++) stops.push(`rgb(${rampRGB(i / 10).join(',')}) ${i * 10}%`);
  wrap.querySelector('.ramp').style.background = `linear-gradient(to left, ${stops.join(', ')})`;
  wrap.querySelector('.lv').innerHTML = ticks.map(t => `<span style="left:${(1 - speedV(t)) * 100}%">${ar(t)}</span>`).join('');
})();

function setMode(m) {
  if (S.mode === m) return;
  S.mode = m;
  if (map) {
    const P = m, C = m === 'f' ? 'a' : 'b', p = paint(P, C);
    for (const [id, props] of Object.entries(p)) for (const [k, v] of Object.entries(props)) map.setPaintProperty(id, k, v);
    for (const id of ['rd-wide', 'rd-glow', 'sq-glow', 'sq-core', 'sq-hit']) map.setFilter(id, has(P));
  }
  hideReadout();
  render(false);
}

// ---------- labels: Arabic set in the page's own fonts, chosen by zoom, never overlapping ----------

const labelBox = document.getElementById('labels');
let shown = [];
const LABEL_RULE = { city: [4.5, 1], town: [8.6, 2], suburb: [11.4, 3], quarter: [11.6, 3], area: [11.8, 3], neighbourhood: [12.6, 4], village: [11.2, 5], hamlet: [12.4, 6] };

function chooseLabels() {
  if (!map || !S.places.length || wrap.style.display === 'none') return;
  const z = map.getZoom(), W = map.getContainer().clientWidth, H = map.getContainer().clientHeight;
  const cands = [];
  for (const p of S.places) {
    const rule = LABEL_RULE[p.k]; if (!rule || z < rule[0]) continue;
    if (z < 6.5 && !(p.k === 'city' && p.f && p.f.t > 15000)) continue;
    cands.push({ p, pri: rule[1], cls: p.k === 'city' && (p.f && p.f.t > 15000) ? 'big' : '' });
  }
  cands.sort((a, b) => a.pri - b.pri || ((b.p.f || { t: 0 }).t - (a.p.f || { t: 0 }).t));
  // keep clear of the controls and the colour key
  const taken = [{ x0: 0, x1: 250, y0: 0, y1: 52 }, { x0: W - 240, x1: W, y0: H - 100, y1: H }];
  const out = [];
  for (const c of cands) {
    if (S.focus && c.p.id === S.focus.id) continue;
    const pt = map.project([c.p.x, c.p.y]);
    const fs = c.cls === 'big' ? 15 : 13, off = c.cls === 'big' ? 18 : 9;
    const w = c.p.n.length * fs * 0.52 + 10, h = fs + 8;
    const side = z < 10 ? 1 : 0;                       // 1: set to the left of the light, 0: centred on it
    const cx = side ? pt.x - off - w / 2 : pt.x;
    const r = { x0: cx - w / 2, x1: cx + w / 2, y0: pt.y - h / 2, y1: pt.y + h / 2 };
    if (r.x0 < 4 || r.x1 > W - 4 || r.y0 < 4 || r.y1 > H - 4) continue;   // a label cut at the edge reads as another name
    if (taken.some(t => r.x0 < t.x1 && r.x1 > t.x0 && r.y0 < t.y1 && r.y1 > t.y0)) continue;
    taken.push(r); c.side = side; c.off = off; out.push(c);
    if (out.length >= 60) break;
  }
  labelBox.textContent = '';
  shown = out.map(c => {
    const el = document.createElement('div');
    el.className = 'lbl' + (c.cls ? ' ' + c.cls : '');
    el.textContent = c.p.n;
    labelBox.appendChild(el);
    return { el, p: c.p, side: c.side, off: c.off };
  });
}

function placeLabels() {
  for (const s of shown) {
    const pt = map.project([s.p.x, s.p.y]);
    s.el.style.transform = s.side ? `translate(${pt.x - s.off}px, ${pt.y}px) translate(-100%, -50%)` : `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
  }
}

// ---------- tapping a square ----------

const readout = document.getElementById('readout');
function quadBounds(q) {
  let x = 0, y = 0;
  for (const ch of q) { const d = +ch; x = x * 2 + (d & 1); y = y * 2 + (d >> 1); }
  const n = 2 ** q.length, lon = t => t / n * 360 - 180;
  const lat = t => 180 / Math.PI * Math.atan(Math.sinh(Math.PI * (1 - 2 * t / n)));
  return [lon(x), lat(y + 1), lon(x + 1), lat(y)];
}

function onMapClick(e) {
  const P = S.mode, C = P === 'f' ? 'a' : 'b';
  if (map.getZoom() < 9) { map.easeTo({ center: e.lngLat, zoom: Math.max(10.5, map.getZoom() + 3), duration: 700 }); return; }
  const r = 6, feats = map.queryRenderedFeatures([[e.point.x - r, e.point.y - r], [e.point.x + r, e.point.y + r]], { layers: ['sq-hit'] });
  let best = null, bd = 1e9;
  for (const f of feats) {
    if (!f.properties.k) continue;
    const [x0, y0, x1, y1] = quadBounds(f.properties.k);
    const inside = e.lngLat.lng >= x0 && e.lngLat.lng <= x1 && e.lngLat.lat >= y0 && e.lngLat.lat <= y1;
    const d = inside ? 0 : Math.hypot(e.lngLat.lng - (x0 + x1) / 2, e.lngLat.lat - (y0 + y1) / 2);
    if (d < bd) { bd = d; best = f; }
  }
  if (!best) { S.pick = { lngLat: e.lngLat, empty: true }; showPick(null); return; }
  const k = best.properties.k, [x0, y0, x1, y1] = quadBounds(k);
  S.pick = { lngLat: { lng: (x0 + x1) / 2, lat: y1 }, v: best.properties[P], n: best.properties[C] };
  showPick([x0, y0, x1, y1]);
}

function showPick(b) {
  map.getSource('pick').setData({ type: 'FeatureCollection', features: b ? [{ type: 'Feature', properties: {},
    geometry: { type: 'LineString', coordinates: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]], [b[0], b[1]]] } }] : [] });
  const p = S.pick;
  readout.innerHTML = p.empty ? 'لا توجد اختبارات في هذا المربع'
    : p.n < MIN_TESTS ? `اختبارات هذا المربع قليلة (${ar(p.n)})<br><span class="small">لا تكفي لرقم يعتمد عليه</span>`
    : `هذا المربع <b style="color:${speedColour(p.v)}">${ar(p.v)}</b> ميغابت<br><span class="small">من ${nTests(p.n)}</span>`;
  readout.hidden = false;
  placeReadout();
}
function placeReadout() {
  if (!S.pick || readout.hidden) return;
  const pt = map.project(S.pick.lngLat);
  readout.style.left = pt.x + 'px'; readout.style.top = pt.y + 'px';
}
function hideReadout() {
  S.pick = null; readout.hidden = true;
  if (map && map.getSource('pick')) map.getSource('pick').setData({ type: 'FeatureCollection', features: [] });
}

// ---------- focus on an area: the rest of the map held down ----------

async function areaOf(p) {
  if (!S.areas[p.g]) S.areas[p.g] = await fetch(`data/areas/${p.g}.json`).then(r => r.json());
  return S.areas[p.g][p.id];
}
function setFocus(p, geom) {
  S.focus = p; S.focusBounds = boundsOf(geom);
  const world = [[-180, -85], [180, -85], [180, 85], [-180, 85], [-180, -85]];
  const rings = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  const mask = { type: 'Feature', properties: { role: 'mask' }, geometry: { type: 'Polygon', coordinates: [world, ...rings.map(r => r[0])] } };
  const edge = { type: 'Feature', properties: { role: 'edge' }, geometry: geom };
  map.getSource('focus').setData({ type: 'FeatureCollection', features: [mask, edge] });
}
function clearFocus() {
  S.focus = null;
  if (map && map.getSource('focus')) map.getSource('focus').setData({ type: 'FeatureCollection', features: [] });
}
function boundsOf(geom) {
  let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
  const walk = c => { if (typeof c[0] === 'number') { x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]); y0 = Math.min(y0, c[1]); y1 = Math.max(y1, c[1]); } else c.forEach(walk); };
  walk(geom.coordinates);
  return [[x0, y0], [x1, y1]];
}

// ---------- search ----------

function match(key, k, words) {
  if (key === k) return 100;
  if (key.startsWith(k)) return 60;
  if (words.every(w => key.split(' ').some(x => x.startsWith(w)))) return 40;
  return key.includes(k) ? 20 : 0;
}
function search(q) {
  const k = bare(q).toLowerCase();
  if (!k) return [];
  const words = k.split(' ');
  const scored = [];
  for (const p of S.govs.concat(S.places)) {
    const keys = p._k || (p._k = [p.n, ...(p.a || [])].map(n => bare(n).toLowerCase()));
    let s = Math.max(...keys.map(key => match(key, k, words)));
    if (!s) continue;
    if (p.k === 'gov') s += 30; else if (p.k === 'city') s += 20; else if (p.k === 'town') s += 8;
    s += Math.log10(1 + ((p.f || {}).t || 0));
    scored.push([s, p]);
  }
  // a name that only contains the letters inside another word (حله inside محله) shows only when nothing better does
  const good = scored.some(x => x[0] >= 40);
  return scored.filter(x => !good || x[0] >= 40).sort((a, b) => b[0] - a[0]).slice(0, 8).map(x => x[1]);
}

let redrawHits = () => {};
function wireSearch() {
  const input = document.getElementById('q'), list = document.querySelector('#page .hits');
  if (!input) return;
  let sel = -1, results = [];
  const draw = () => {
    if (!input.value.trim()) { list.classList.remove('open'); list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); return; }
    if (!S.places.length) { list.classList.add('open'); list.innerHTML = '<div class="none">أحمل أسماء المناطق، لحظة...</div>'; return; }
    results = search(input.value);
    list.classList.add('open');
    input.setAttribute('aria-expanded', results.length ? 'true' : 'false');
    list.innerHTML = results.length ? results.map((p, i) => {
      const st = stat(p);
      return `<a href="${href(p)}" role="option" id="hit${i}" aria-selected="${i === sel}" class="${i === sel ? 'sel' : ''}"><b>${esc(p.n)}</b><i>${esc(kindLine(p))}</i>` +
        `<em style="color:${st ? speedColour(st.d) : 'var(--faint)'}">${st ? ar(st.d) : '–'}<small>ميغابت</small></em></a>`;
    }).join('') : '<div class="none">لم أجد هذا الاسم. جرب اسم المدينة أو المحافظة، أو اكتبه بطريقة أخرى.</div>';
    if (sel >= 0) input.setAttribute('aria-activedescendant', 'hit' + sel); else input.removeAttribute('aria-activedescendant');
  };
  redrawHits = draw;
  input.addEventListener('input', () => { sel = -1; draw(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = Math.min(results.length - 1, sel + 1); draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(-1, sel - 1); draw(); e.preventDefault(); }
    else if (e.key === 'Enter' && results.length) { input.blur(); navigate(href(results[Math.max(0, sel)])); }
  });
}

// ---------- words about a place ----------

const govById = id => S.govs.find(g => g.id === id);
const href = p => p.k === 'gov' ? `#/g/${p.id}` : `#/p/${encodeURIComponent(p.id)}`;
function stat(p, mode = S.mode) {
  const s = p && p[mode];
  return s && s.t >= MIN_TESTS ? s : null;
}
function kindLine(p) {
  if (p.k === 'gov') return 'محافظة';
  const g = govById(p.g), gn = g ? g.n : '';
  switch (p.k) {
    case 'city': return `مدينة في محافظة ${gn}`;
    case 'town': return `بلدة في محافظة ${gn}`;
    case 'village': case 'hamlet': return p.c ? `قرية قرب ${p.c}، محافظة ${gn}` : `قرية في محافظة ${gn}`;
    default: return p.c && p.c !== gn ? `حي في ${p.c}، محافظة ${gn}` : `حي في ${gn}`;
  }
}
const nameIn = p => p.k === 'gov' ? `محافظة ${p.n}` : p.n;

// how a number compares: faster, slower, or about the same (within 5%)
function versus(v, ref) {
  const r = (v - ref) / ref;
  return Math.abs(r) < 0.05 ? 'قريبة من' : r > 0 ? 'أسرع من' : 'أبطأ من';
}
function percentile(v) {
  const all = S.places.map(p => stat(p)).filter(Boolean).map(s => s.d);
  return Math.round(all.filter(d => d < v).length / all.length * 100);
}

// ---------- pages ----------

const page = document.getElementById('page');
const foot = `<p class="foot">السرعات من Speedtest by Ookla، والشوارع والأحياء من مساهمي OpenStreetMap، والانقطاعات من IODA.
  <a href="#/about">من أين جاءت الأرقام</a><br>فكرة وتصميم <bdi dir="ltr">@allawi.psd</bdi></p>`;
const modesHTML = () => `<div class="modes" role="group" aria-label="نوع الاتصال">
  <button type="button" data-mode="f" class="${S.mode === 'f' ? 'on' : ''}">إنترنت البيت</button>
  <button type="button" data-mode="m" class="${S.mode === 'm' ? 'on' : ''}">إنترنت الموبايل</button></div>
  <p class="modes-hint">${S.mode === 'f' ? 'خطوط الإنترنت الثابتة في البيوت والمحلات، تموز إلى أيلول ٢٠٢٦.' : 'شبكات الموبايل، تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦. اختباراتها أقل، فتظهر الخريطة متقطعة.'}</p>`;
const tryLinks = () => {
  const ps = ['الكرادة', 'المنصور', 'زيونة', 'البصرة', 'أربيل', 'الموصل'].map(n => S.places.find(p => p.n === n && p.k !== 'village')).filter(Boolean);
  return ps.length ? 'جرب ' + ps.map(p => `<a href="${href(p)}">${esc(p.n)}</a>`).join('') : '';
};

function rankRows(list, opts = {}) {
  const max = Math.max(...list.map(p => stat(p).d), 1);
  let pos = 0, prev = null;
  return `<div class="rank"><div class="hd"><span></span><span>${opts.head || 'المنطقة'}</span><span></span><span>ميغابت</span></div>` +
    list.map((p, i) => {
      const st = stat(p), col = speedColour(st.d), v = Math.round(st.d);
      if (v !== prev) { pos = i + 1; prev = v; }        // equal numbers on screen share a place
      const sub = [opts.kind && kindShort(p), nTests(st.t)].filter(Boolean).join('، ');
      return `<a href="${href(p)}"><span class="pos">${opts.pos === false ? '' : ar(pos)}</span>` +
        `<span class="nm"><b>${esc(p.n)}</b><small>${esc(sub)}</small></span>` +
        `<i class="tr" style="width:${Math.max(3, st.d / max * 100)}%;background:${col}"></i>` +
        `<span class="v" style="color:${col}">${ar(st.d)}</span></a>`;
    }).join('') + '</div>';
}
const kindShort = p => ({ city: 'مدينة', town: 'بلدة', village: 'قرية', hamlet: 'قرية' })[p.k] || '';

function examYears() {
  return ['2025', '2026'].map(y => {
    const rows = S.exams.filter(e => e.d.startsWith(y));
    const mins = rows.filter(r => r.cut).reduce((s, r) => s + r.cut[1] - r.cut[0], 0);
    // the usual windows, in the order they first appear
    const wins = [];
    for (const r of rows) {
      if (!r.cut) continue;
      const k = r.cut.join('-'), w = wins.find(w => w.k === k);
      if (w) { w.n++; w.last = r.d; } else wins.push({ k, cut: r.cut, n: 1, first: r.d, last: r.d });
    }
    const main = wins.filter(w => w.n >= Math.max(3, rows.length * 0.15));
    return { y, rows, hours: mins / 60, main };
  });
}
function clock(minAfter4) {
  const m = 240 + minAfter4, h = Math.floor(m / 60), mm = m % 60;
  return `${arDigits(h)}:${arDigits(String(mm).padStart(2, '0'))}`;
}
const dayName = d => { const t = new Date(d + 'T12:00:00'); return `${DAYS[t.getDay()]} ${arDigits(t.getDate())} ${MONTHS[t.getMonth()]}`; };
const shortDate = d => { const t = new Date(d + 'T12:00:00'); return `${arDigits(t.getDate())} ${MONTHS[t.getMonth()]}`; };
const winText = main => main.map((w, i) => `من ${clock(w.cut[0])} إلى ${clock(w.cut[1])}${i < main.length - 1 ? ` حتى ${shortDate(w.last)}` : ''}`).join('،<br>ثم ');

function homeHTML() {
  const c = S.country, st = c[S.mode], h = S.mode === 'f' ? c.h : c.mh;
  const govs = S.govs.filter(g => stat(g)).sort((a, b) => stat(b).d - stat(a).d);
  const ex = examYears();
  return `
  <h1 class="h1">اعرف سرعة الإنترنت في منطقتك</h1>
  <div class="search">
    <label for="q">اسم الحي أو المدينة أو المحافظة</label>
    <input id="q" type="search" placeholder="مثلا الكرادة" autocomplete="off" enterkeyhint="search"
      role="combobox" aria-controls="hits" aria-autocomplete="list" aria-expanded="false">
    <div class="hits" id="hits" role="listbox" aria-label="نتائج البحث"></div>
  </div>
  <p class="tries">${tryLinks()}</p>
  ${modesHTML()}
  <div class="mapslot"></div>
  <p class="maphint">كل نقطة ضوء مربع عرضه نصف كيلومتر، وفي المدن يمشي الضوء على الشوارع. قرب الخريطة واضغط على أي نقطة لترى سرعتها.</p>

  <section>
    <h2 class="h2">العراق كله</h2>
    <p class="answer">معدل سرعة تنزيل ${KIND[S.mode]} في العراق<span class="big" style="color:${speedColour(st.d)}">${ar(st.d)}<small>ميغابت في الثانية</small></span></p>
    <dl class="facts">
      <div><dt>معدل سرعة الرفع<small>ميغابت في الثانية</small></dt><dd>${ar(st.u)}</dd></div>
      <div><dt>البنغ، أي زمن الاستجابة<small>ملي ثانية</small></dt><dd>${ar(st.l)}</dd></div>
      <div><dt>سرعة التنزيل في صيف ٢٠١٩<small>ميغابت في الثانية</small></dt><dd>${ar(h[0][0])}</dd></div>
      <div><dt>عدد الاختبارات</dt><dd>${ar(st.t)}</dd></div>
    </dl>
    <p class="note">الاختبارات أجراها الناس بأنفسهم على تطبيق Speedtest، والمعدل موزون بعدد الاختبارات في كل مربع.</p>
  </section>

  <section>
    <h2 class="h2">المحافظات من الأسرع إلى الأبطأ</h2>
    <p class="small">معدل سرعة التنزيل في ${KIND[S.mode]}. اضغط على محافظة لترى مدنها وأحياءها.</p>
    ${rankRows(govs, { head: 'المحافظة' })}
  </section>

  <section>
    <h2 class="h2">انقطاع الإنترنت في أيام الامتحانات</h2>
    <p class="small">ينقطع الإنترنت عن أغلب العراق في صباح كل امتحان وزاري.</p>
    <table class="tbl exsum">
      <tr><th>السنة</th><th>الأيام</th><th>الوقت المعتاد</th></tr>
      ${ex.map(e => `<tr><td>${arDigits(e.y)}</td><td>${ar(e.rows.length)}</td><td class="win">${winText(e.main)}</td></tr>`).join('')}
    </table>
    <a class="more-link" href="#/exams">كل الأيام بالتاريخ والساعة</a>
  </section>
  ${foot}`;
}

function scaleHTML(marks) {
  const max = Math.ceil(Math.max(...marks.map(m => m.v)) * 1.2 / 25) * 25;
  const cs = getComputedStyle(page), W = Math.max(280, page.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
  // each label takes the first row, and there the first side of its mark, where it stays on the page and touches no other
  const rows = [[], [], []];
  for (const m of marks) m.x = m.v / max * W;                  // x counts from the right, where the scale starts
  for (const m of [...marks].sort((a, b) => (b.main ? 1 : 0) - (a.main ? 1 : 0) || a.v - b.v)) {
    m.text = `${m.label} (${ar(m.v)})`;
    const w = m.text.length * 7.4 + 6, x = m.x;
    const spans = { c: [x - w / 2, x + w / 2], r: [x, x + w], l: [x - w, x] };
    // the first row below the line also keeps clear of the marks still to come, whose long ticks may pass through it
    const fits = (r, a) => spans[a][0] >= 0 && spans[a][1] <= W && rows[r].every(o => spans[a][1] + 10 < o[0] || spans[a][0] > o[1] + 10) &&
      (r !== 1 || marks.every(o => o === m || o.row !== undefined || o.x < spans[a][0] - 6 || o.x > spans[a][1] + 6));
    let pick = null;
    for (let r = 0; r < 3 && !pick; r++) for (const a of ['c', 'r', 'l']) if (fits(r, a)) { pick = [r, a]; break; }
    [m.row, m.anchor] = pick || [2, x < w / 2 ? 'r' : x > W - w / 2 ? 'l' : 'c'];
    rows[m.row].push(spans[m.anchor]);
  }
  const used = Math.max(...marks.map(m => m.row));
  const stops = [];
  for (let i = 0; i <= 10; i++) stops.push(`rgb(${rampRGB(speedV(i / 10 * max)).join(',')}) ${i * 10}%`);
  return `<div class="scale rows${used}" role="img" aria-label="${esc(marks.map(m => m.text).join('، '))}"><i class="track" style="background:linear-gradient(to left, ${stops.join(', ')})"></i>` +
    marks.map(m => {
      const col = m.main ? speedColour(m.v) : 'var(--muted)';
      return `<div class="mk r${m.row} a${m.anchor}" style="right:${m.v / max * 100}%"><b style="color:${col}">${esc(m.text)}</b><i style="background:${col}"></i></div>`;
    }).join('') +
    `<div class="ends"><span>٠</span><span>${ar(max)} ميغابت</span></div></div>`;
}

function placeHTML(p) {
  const isGov = p.k === 'gov', g = isGov ? null : govById(p.g);
  const st = stat(p), gs = g && stat(g), cs = stat(S.country);
  const where = nameIn(p);
  let answer, comp = '', scale = '';
  if (st) {
    answer = `معدل سرعة تنزيل ${KIND[S.mode]} في ${esc(where)}<span class="big" style="color:${speedColour(st.d)}">${ar(st.d)}<small>ميغابت في الثانية</small></span>`;
    const parts = [];
    if (gs) parts.push(`${versus(st.d, gs.d)} معدل محافظة ${esc(g.n)}`);
    parts.push(`${versus(st.d, cs.d)} معدل العراق`);
    if (isGov) {
      const ranked = S.govs.filter(x => stat(x)).sort((a, b) => stat(b).d - stat(a).d), order = ranked.indexOf(p);
      // a place in the order means little when a neighbour is within 5%
      const close = [ranked[order - 1], ranked[order + 1]].filter(x => x && Math.abs(stat(x).d - st.d) / st.d < 0.05);
      comp = `${parts.join('، و')}، وتأتي ${ORDINAL[order]} بين ${ar(S.govs.length)} محافظة` +
        (close.length ? ` بفارق صغير عن ${close.map(x => x.n).join(' و')}.` : '.');
    } else {
      comp = `${parts.join('، و')}، وأسرع من ${ar(percentile(st.d))}٪ من المناطق المقاسة في العراق.`;
    }
    const marks = [{ label: p.n, v: st.d, main: true }];
    if (gs) marks.push({ label: g.n === p.n ? `محافظة ${g.n}` : g.n, v: gs.d });
    marks.push({ label: 'العراق', v: cs.d });
    scale = scaleHTML(marks);
  } else {
    const ref = gs || cs;
    answer = `لا توجد اختبارات كافية لـ${KIND[S.mode]} في ${esc(where)} لرقم يعتمد عليه.`;
    comp = `معدل ${gs ? 'محافظة ' + esc(g.n) : 'العراق'} ${ar(ref.d)} ميغابت في الثانية.${S.mode === 'm' ? ' جرب إنترنت البيت.' : ''}`;
  }

  const fsF = stat(p, 'f'), fsM = stat(p, 'm');
  const cell = (s, k) => s ? ar(s[k]) : '<small>لا تكفي</small>';
  const table = `<table class="tbl">
      <tr><th></th><th>إنترنت البيت</th><th>إنترنت الموبايل</th></tr>
      <tr><td>سرعة التنزيل<small>ميغابت في الثانية</small></td><td style="color:${fsF ? speedColour(fsF.d) : ''}">${cell(fsF, 'd')}</td><td style="color:${fsM ? speedColour(fsM.d) : ''}">${cell(fsM, 'd')}</td></tr>
      <tr><td>سرعة الرفع<small>ميغابت في الثانية</small></td><td>${cell(fsF, 'u')}</td><td>${cell(fsM, 'u')}</td></tr>
      <tr><td>البنغ<small>ملي ثانية</small></td><td>${cell(fsF, 'l')}</td><td>${cell(fsM, 'l')}</td></tr>
      <tr><td>عدد الاختبارات</td><td>${cell(fsF, 't')}</td><td>${cell(fsM, 't')}</td></tr>
    </table>
    <p class="note">إنترنت البيت من تموز إلى أيلول ٢٠٢٦، والموبايل من تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦. لا أعرض رقما من أقل من ${ar(MIN_TESTS)} اختبارات.</p>`;

  const hist = p.h || [];
  const hmax = Math.max(...hist.filter(Boolean).map(h => h[0]), 1);
  const years = hist.map((h, i) => {
    const y = arDigits(2019 + i);
    if (!h) return `<div><b style="color:var(--faint)">–</b><i style="height:2px;background:var(--line)"></i><span>${y}</span></div>`;
    const col = speedColour(h[0]);
    return `<div><b style="color:${col}">${ar(h[0])}</b><i style="height:${Math.max(3, h[0] / hmax * 100)}px;background:${col}"></i><span>${y}</span></div>`;
  }).join('');

  let list = '';
  if (isGov) {
    const inGov = S.places.filter(x => x.g === p.id && stat(x)).sort((a, b) => stat(b, S.mode).t - stat(a, S.mode).t).slice(0, 20)
      .sort((a, b) => stat(b).d - stat(a).d);
    if (inGov.length) list = `<section><h2 class="h2">مدن وأحياء في المحافظة</h2><p class="small">أكثر عشرين منطقة فيها اختبارات، من الأسرع إلى الأبطأ.</p>${rankRows(inGov, { kind: true })}</section>`;
  } else {
    const near = S.places.filter(x => x !== p && x.g === p.g && stat(x))
      .map(x => [Math.hypot((x.x - p.x) * 0.84, x.y - p.y), x]).sort((a, b) => a[0] - b[0]).slice(0, 8).map(a => a[1])
      .sort((a, b) => stat(b).d - stat(a).d);
    if (near.length) list = `<section><h2 class="h2">مناطق قريبة</h2>${rankRows(near, { kind: true, pos: false })}</section>`;
  }
  const how = isGov ? 'حسبت المعدل من كل المربعات التي يقع مركزها داخل حدود المحافظة.'
    : p.r ? `حسبت المعدل من المربعات التي تقع ضمن ${arDigits(String(p.r).replace('.', '٫'))} كم من مركز ${p.k === 'city' ? 'المدينة' : p.k === 'town' ? 'البلدة' : p.k === 'village' || p.k === 'hamlet' ? 'القرية' : 'الحي'}، لأن OpenStreetMap لا يرسم حدودها.`
    : 'حسبت المعدل من المربعات التي يقع مركزها داخل حدودها كما يرسمها OpenStreetMap.';

  return `
  <p class="crumbs"><a href="#/">العراق</a>${g ? `<span>‹</span><a href="${href(g)}">${esc(g.n)}</a>` : ''}</p>
  <h1 class="h1 place">${head(p.n)}</h1>
  <p class="kind">${esc(kindLine(p))}</p>
  ${modesHTML()}
  <p class="answer">${answer}</p>
  <p class="comp">${comp}</p>
  ${scale}
  <div class="mapslot"></div>
  <p class="maphint">${isGov ? 'المحافظة مضاءة بحدودها.' : 'المنطقة مضاءة بحدودها وما حولها معتم.'} قرب الخريطة واضغط على أي شارع لترى سرعة مربعه.</p>
  <section><h2 class="h2">البيت والموبايل</h2>${table}</section>
  <section><h2 class="h2">إنترنت البيت منذ <span class="n">٢٠١٩</span></h2><p class="small">معدل سرعة التنزيل في صيف كل سنة، من تموز إلى أيلول، بالميغابت.</p><div class="years">${years}</div></section>
  ${list}
  <section><h2 class="h2">كيف حسبت هذا الرقم</h2><p class="note">${how} الاختبارات أجراها أشخاص بأنفسهم على تطبيق Speedtest، فهي لا تقيس كل بيت.</p></section>
  ${foot}`;
}

const hourAxis = () => `<div class="ex-axis" aria-hidden="true"><span></span><div class="ax">${[4, 5, 6, 7, 8, 9, 10].map(h =>
  `<span style="right:${(h - 4) / 6 * 100}%">${arDigits(h)}</span>`).join('')}</div></div>`;

// the month is written on the first exam of each month, the other rows carry the day alone
function rowDate(d, prev) {
  const t = new Date(d + 'T12:00:00');
  return prev && prev.d.slice(0, 7) === d.slice(0, 7) ? arDigits(t.getDate()) : shortDate(d);
}

function examsHTML() {
  const ex = examYears();
  return `
  <p class="crumbs"><a href="#/">العراق</a></p>
  <h1 class="h1">انقطاع الإنترنت في أيام الامتحانات</h1>
  <p class="lede">ينقطع الإنترنت عن أغلب العراق في صباح كل امتحان وزاري. هذه الأيام كما سجلها مرصد IODA في معهد جورجيا للتقنية، الذي يقيس كل عشر دقائق كم شبكة عراقية ترد على الإنترنت.</p>
  <table class="tbl exsum">
    <tr><th>السنة</th><th>الأيام</th><th>الوقت المعتاد</th><th>المجموع</th></tr>
    ${ex.map(e => `<tr><td>${arDigits(e.y)}</td><td>${ar(e.rows.length)}</td><td class="win">${winText(e.main)}</td><td>${ar(e.hours)} <small>ساعة</small></td></tr>`).join('')}
  </table>
  <div class="ex-key"><span><i style="background:${speedColour(80)}"></i>الإنترنت يعمل</span><span><i style="background:#3a1a0e"></i>منقطع، ترد أقل من ٦٠٪ من الشبكات</span></div>
  ${ex.map(e => `
    <section class="ex-year" data-year="${e.y}">
      <h2 class="h2">${head(arDigits(e.y))}</h2>
      <p class="small">انقطع في ${ar(e.rows.length)} ${counted(e.rows.length, DAYS_N)}. اضغط على أي يوم لترى وقت الانقطاع.</p>
      <p class="ex-cap">الساعة صباحا بتوقيت بغداد</p>
      ${hourAxis()}
      ${e.rows.map((r, i) => `<button type="button" class="ex-row" data-i="${i}" aria-pressed="false" aria-label="${dayName(r.d)}"><span class="d" aria-hidden="true">${rowDate(r.d, e.rows[i - 1])}</span><canvas aria-hidden="true"></canvas></button>`).join('')}
      ${hourAxis()}
      <p class="ex-day" aria-live="polite" hidden></p>
    </section>`).join('')}
  ${foot}`;
}

function aboutHTML() {
  return `
  <p class="crumbs"><a href="#/">العراق</a></p>
  <article class="prose">
    <h1 class="h1">عن هذه الخريطة</h1>
    <p>جمعت هذه الخريطة من بيانات مفتوحة يستطيع أي شخص أن يتحقق منها، لأعرف سرعة الإنترنت الحقيقية في كل منطقة من العراق بدل الأرقام العامة.</p>
    <h2 class="h2">من أين جاءت السرعات</h2>
    <p>من بيانات Ookla المفتوحة، الشركة التي تملك تطبيق Speedtest. تقسم Ookla الأرض إلى مربعات عرض كل منها نحو نصف كيلومتر، وتنشر لكل مربع معدل سرعة التنزيل والرفع والبنغ وعدد الاختبارات. في العراق ${ar(S.country.f.q)} مربعا فيها اختبارات على الإنترنت الثابت بين تموز وأيلول ٢٠٢٦، وأكثر من مليون اختبار.</p>
    <p>رقم كل حي أو مدينة هو معدل مربعاته، موزونا بعدد الاختبارات في كل مربع. أرقام الموبايل تجمع سنة كاملة، من تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦، لأن اختباراتها أقل بكثير. لا أعرض رقما لأي منطقة فيها أقل من ${ar(MIN_TESTS)} اختبارات.</p>
    <h2 class="h2">حدود هذه الأرقام</h2>
    <p>الاختبارات أجراها أشخاص اختاروا أن يقيسوا سرعتهم، فهي لا تقيس كل بيت ولا كل شارع، واختبارات البيوت تشمل الهواتف المتصلة بشبكة البيت. عدد الاختبارات زاد نحو مرتين ونصف بين صيف ٢٠٢٥ وصيف ٢٠٢٦، وهذا يغير من تقيسهم الأرقام.</p>
    <p>لا أقارن بين شركات الإنترنت. البيانات المفتوحة لا تذكر الشركة، والمصدر الآخر الذي يذكرها (M-Lab) يقيس العراق إلى خوادم خارج العراق يتأخر الرد منها ١١٠ إلى ١٦٠ ملي ثانية، فتخرج أرقامه أقل بكثير من الواقع.</p>
    <h2 class="h2">انقطاع الامتحانات</h2>
    <p>من مرصد IODA في معهد جورجيا للتقنية، الذي يرسل قياسات إلى عناوين الشبكات العراقية كل عشر دقائق. أعرض ما ردت به هذه الشبكات من الرابعة إلى العاشرة صباحا في كل يوم امتحان، مقارنة بما كان قبل السادسة، من دون أي تعليق.</p>
    <h2 class="h2">الخرائط</h2>
    <p>الشوارع والأنهار والأحياء من OpenStreetMap، والأرض من صور ناسا للتضاريس وأضواء المدن، وحدود العراق من Natural Earth، وحدود المحافظات من مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية (OCHA)، وفيها حلبجة ما تزال ضمن محافظة السليمانية.</p>
    <h2 class="h2">من صنعها</h2>
    <p>الفكرة والتصميم لعلي، انستغرام <bdi dir="ltr">@allawi.psd</bdi></p>
    <h2 class="h2">المصادر والرخص</h2>
    <p class="src">Speedtest<span class="reg">®</span> by Ookla<span class="reg">®</span> Global Fixed and Mobile Network Performance Maps. Based on analysis by Ookla of Speedtest Intelligence<span class="reg">®</span> data for Q4 2025 to Q3 2026, and Q3 of each year from 2019. Provided by Ookla and accessed 23 October 2026. Licensed CC BY-NC-SA 4.0; Ookla trademarks used under license.</p>
    <p class="src">Map data © OpenStreetMap contributors, ODbL, through the Humanitarian OpenStreetMap Team exports. Internet outage data: IODA, Georgia Institute of Technology. NASA GIBS: ASTER GDEM shaded relief, VIIRS Black Marble. Natural Earth. Governorates: OCHA, Iraq Subnational Administrative Boundaries (COD-AB), CC BY-IGO. Map rendering: MapLibre GL JS and PMTiles (BSD-3-Clause).</p>
  </article>
  ${foot}`;
}

// ---------- exam rows ----------

function drawRow(canvas, r, selected) {
  const dpr = Math.min(2, devicePixelRatio || 1), W = canvas.clientWidth, H = canvas.clientHeight;
  if (!W) return;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const ctx = canvas.getContext('2d'), n = r.v.length, cw = canvas.width, mid = canvas.height / 2, th = (selected ? 10 : 7) * dpr;
  for (let x = 0; x < cw; x++) {
    // time runs right to left: 04:00 at the right edge, 10:00 at the left
    const t = (1 - x / (cw - 1)) * (n - 1), a = Math.floor(t), f = t - a;
    const va = r.v[a] == null ? 1 : r.v[a], vb = r.v[Math.min(n - 1, a + 1)] == null ? va : r.v[Math.min(n - 1, a + 1)];
    const v = va + (vb - va) * f;
    const on = v >= 0.6;
    const c = on ? rampRGB(0.5 + 0.35 * Math.min(1, v)) : [58, 26, 14];
    ctx.fillStyle = `rgba(${c.join(',')},${on ? (selected ? 1 : 0.85) : 1})`;
    ctx.fillRect(x, mid - th / 2, 1, th);
  }
}

function wireExams() {
  for (const box of page.querySelectorAll('.ex-year')) {
    const rows = S.exams.filter(e => e.d.startsWith(box.dataset.year));
    const els = [...box.querySelectorAll('.ex-row')], day = box.querySelector('.ex-day');
    let sel = -1;
    const draw = () => els.forEach((el, i) => drawRow(el.querySelector('canvas'), rows[i], i === sel));
    draw();
    box.addEventListener('click', e => {
      const el = e.target.closest('.ex-row'); if (!el) return;
      sel = +el.dataset.i; els.forEach((x, i) => { x.classList.toggle('sel', i === sel); x.setAttribute('aria-pressed', i === sel); }); draw();
      const r = rows[sel];
      el.after(day); day.hidden = false;           // the times sit right under the day that was tapped
      day.textContent = r.cut ? `${dayName(r.d)} ${arDigits(box.dataset.year)}، انقطع من ${clock(r.cut[0])} إلى ${clock(r.cut[1])}، وبقيت ${ar(r.low * 100)}٪ من الشبكات العراقية ترد.`
        : `${dayName(r.d)}، لم يظهر انقطاع واضح.`;
    });
  }
}

// ---------- routing: kept in the page, mirrored into the address where the browser allows it ----------

let route = location.hash.startsWith('#/') ? location.hash : '#/';
const current = () => decodeURIComponent(route.replace(/^#/, '')) || '/';
function navigate(h) {
  if (h === route) return;
  route = h;
  try { history.pushState(null, '', h); } catch (e) { /* some frames refuse; the page keeps its own route */ }
  render(true);
}
document.addEventListener('click', e => {
  const a = e.target.closest && e.target.closest('a[href^="#/"]');
  if (a && !e.defaultPrevented && !e.metaKey && !e.ctrlKey) { e.preventDefault(); navigate(a.getAttribute('href')); return; }
  const m = e.target.closest && e.target.closest('.modes button');
  if (m) setMode(m.dataset.mode);
});
function fromAddress() {
  const h = location.hash.startsWith('#/') ? location.hash : '#/';
  if (h !== route) { route = h; render(true); }
}
addEventListener('popstate', fromAddress);
addEventListener('hashchange', fromAddress);

let lastRoute = '';
async function render(move = true) {
  const h = current();
  const view = h.startsWith('/p/') || h.startsWith('/g/') ? 'place' : h.startsWith('/exams') ? 'exams' : h.startsWith('/about') ? 'about' : 'home';
  document.querySelectorAll('.bar nav a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + h));
  document.body.classList.toggle('nomap', view === 'exams' || view === 'about');
  const keepScroll = !move || lastRoute === h;
  const y = page.scrollTop || scrollY;
  let p = null;
  if (view === 'place') await placesReady;
  if (view === 'place') {
    const id = h.slice(3);
    p = h.startsWith('/g/') ? govById(id) : S.byId.get(id);
    if (!p) { route = '#/'; return render(true); }
    page.innerHTML = placeHTML(p);
    document.title = `${p.n}، سرعة الإنترنت`;
  } else if (view === 'exams') { page.innerHTML = examsHTML(); document.title = 'انقطاع الإنترنت في أيام الامتحانات'; }
  else if (view === 'about') { page.innerHTML = aboutHTML(); document.title = 'عن خريطة سرعة الإنترنت في العراق'; }
  else { page.innerHTML = homeHTML(); document.title = 'خريطة سرعة الإنترنت في العراق'; wireSearch(); }
  if (keepScroll) { page.scrollTop = y; scrollTo(0, y); } else { page.scrollTop = 0; scrollTo(0, 0); }
  if (view === 'exams') requestAnimationFrame(wireExams);

  const visible = placeMap();
  if (!visible) { if (map) clearFocus(); lastRoute = h; return; }
  await ensureMap();
  placeMap();
  if (move && lastRoute !== h) {
    hideReadout();
    if (p) {
      const geom = await areaOf(p);
      if (geom) { setFocus(p, geom); frame(S.focusBounds, { maxZoom: p.k === 'gov' ? 9.5 : 15, duration: lastRoute ? 1200 : 0 }); }
      else { clearFocus(); map.flyTo({ center: [p.x, p.y], zoom: p.z }); }
    } else { clearFocus(); frame(IRAQ, { duration: lastRoute ? 1200 : 0 }); }
  }
  // the frame button goes back to what this page is about
  wrap.querySelector('[data-act="all"]').textContent = !S.focus ? 'العراق كله' : S.focus.k === 'gov' ? 'المحافظة كلها' : 'المنطقة كلها';
  lastRoute = h;
  chooseLabels(); placeLabels();
}

// ---------- start ----------

let rs;
addEventListener('resize', () => {
  clearTimeout(rs);
  rs = setTimeout(() => { placeMap(); if (current().startsWith('/exams')) wireExams(); if (map) { chooseLabels(); placeLabels(); } }, 200);
});

const getJSON = u => fetch(u).then(r => { if (!r.ok) throw new Error(`${u}: ${r.status}`); return r.json(); });
const placesReady = getJSON('data/places.json').then(pl => {
  S.places = pl.places;
  for (const p of S.places) S.byId.set(p.id, p);
  const tries = page.querySelector('.tries');
  if (tries) tries.innerHTML = tryLinks();
  redrawHits();
  if (map) { chooseLabels(); placeLabels(); }
});
Promise.all(['data/govs.json', 'data/country.json', 'data/exams.json'].map(getJSON)).then(([gv, country, exams]) => {
  S.govs = gv.govs; S.country = country; S.exams = exams;
  const shown = render(true);
  document.body.dataset.text = '1';
  return Promise.all([shown, placesReady]);
}).then(() => { document.body.dataset.ready = '1'; });
})();
