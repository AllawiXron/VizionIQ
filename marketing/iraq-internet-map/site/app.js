(() => {
'use strict';

// ---------- numbers, words, colour ----------

const ORDINAL = ['الأولى', 'الثانية', 'الثالثة', 'الرابعة', 'الخامسة', 'السادسة', 'السابعة', 'الثامنة', 'التاسعة', 'العاشرة', 'الحادية عشرة',
  'الثانية عشرة', 'الثالثة عشرة', 'الرابعة عشرة', 'الخامسة عشرة', 'السادسة عشرة', 'السابعة عشرة', 'الثامنة عشرة'];
const NUM = new Intl.NumberFormat('ar-IQ-u-nu-arab', { maximumFractionDigits: 0 });
const ar = n => NUM.format(Math.round(n));
const arDigits = s => String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// five speed bands: the colour and the word change at the same speeds (10, 25, 50 and 100 Mbps).
// The words say what a speed is enough for, on Netflix's figures: 5 Mbps per screen for HD, 15 for 4K.
const BANDS = [
  { max: 10, word: 'بطيء', range: 'أقل من ١٠', fill: '#d2483f', text: '#b3362e', home: 'يكفي للتصفح وفيديو بدقة عادية على جهاز واحد' },
  { max: 25, word: 'مقبول', range: '١٠ إلى ٢٥', fill: '#ea8a2e', text: '#a8561a', home: 'يكفي لفيديو HD على جهاز أو جهازين' },
  { max: 50, word: 'متوسط', range: '٢٥ إلى ٥٠', fill: '#e3b021', text: '#866608', home: 'يكفي لفيديو 4K على جهاز أو جهازين' },
  { max: 100, word: 'جيد', range: '٥٠ إلى ١٠٠', fill: '#5aa85e', text: '#2f7d45', home: 'يكفي لفيديو 4K على أكثر من جهاز' },
  { max: Infinity, word: 'سريع جدا', range: 'فوق ١٠٠', fill: '#12795a', text: '#10664c', home: 'يكفي لبيت كامل يشاهد 4K ويحمل ملفات كبيرة' },
];
const bandOf = v => BANDS.find(b => v < b.max);
const speedColour = v => bandOf(v).fill;
const phoneLine = v => v < 5 ? 'لا يكفي لفيديو HD على الهاتف' : v < 15 ? 'يكفي لفيديو HD على الهاتف' : 'يكفي لفيديو 4K على الهاتف';
const verdictHTML = v => {
  const b = bandOf(v);
  return `<p class="verdict"><strong style="color:${b.text}">${b.word}</strong>، ${S.mode === 'm' ? phoneLine(v) : b.home}</p>`;
};
// the five bands in a row with their speeds, and a mark at this place's speed: the key and the reading in one
function bandsHTML(v) {
  let mark = '';
  if (v != null) {
    const i = BANDS.indexOf(bandOf(v)), lo = i ? BANDS[i - 1].max : 0, hi = Number.isFinite(BANDS[i].max) ? BANDS[i].max : 250;
    mark = `<em style="right:${(i + Math.min(1, (v - lo) / (hi - lo))) / BANDS.length * 100}%"></em>`;
  }
  return `<div class="bands" aria-hidden="true">${BANDS.map(b => `<div><i style="background:${b.fill}"></i><b>${b.word}</b><span>${b.range}</span></div>`).join('')}${mark}</div>`;
}
const noDataHTML = () => `<p class="nodata" aria-hidden="true"><i></i>شارع بلا اختبارات</p>`;

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
const nTests = n => `${ar(n)} ${counted(n, TESTS)}`;

function norm(s) {
  return String(s).replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, ' ').trim();
}
const bare = s => norm(s).split(' ').map(w => w.replace(/^ال/, '')).join(' ');

// ---------- state ----------

const S = { mode: 'f', places: [], govs: [], byId: new Map(), country: null, govmap: null, areas: {}, focus: null, focusBounds: null, pick: null };
const PERIOD = { f: 'تموز إلى أيلول ٢٠٢٦', m: 'تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦' };
const KIND = { f: 'إنترنت البيت', m: 'إنترنت الموبايل' };
const MIN_TESTS = 10, FEW_TESTS = 30;     // under 10 tests no number is shown; under 30 it is marked as rough
const IRAQ = [[38.8, 29.05], [48.6, 37.4]];
const EMPTY = { type: 'FeatureCollection', features: [] };
const page = document.getElementById('page');

// ---------- the light street map ----------

const colourExpr = P => ['step', ['get', P], BANDS[0].fill, 10, BANDS[1].fill, 25, BANDS[2].fill, 50, BANDS[3].fill, 100, BANDS[4].fill];
// a street or square with few tests is drawn fainter
const sureExpr = C => ['interpolate', ['linear'], ['get', C], 1, 0.35, 10, 1];
const has = P => ['>=', ['get', P], 0];
const rank = (a, b, c, d, e) => ['match', ['get', 'r'], 1, a, 2, b, 3, c, 4, d, e];
const roadWidth = () => ['interpolate', ['exponential', 1.6], ['zoom'],
  5, rank(0.8, 0.5, 0.4, 0.3, 0.2), 10, rank(2, 1.6, 1.2, 0.9, 0.6), 13, rank(4, 3.4, 2.6, 2, 1.4), 16, rank(9, 7, 5.5, 4.4, 3.2)];
const ROUND = { 'line-cap': 'round', 'line-join': 'round' };
const dotOpacity = C => ['interpolate', ['linear'], ['zoom'], 4, ['*', 0.85, sureExpr(C)], 8, ['*', 0.45, sureExpr(C)], 10, ['*', 0.24, sureExpr(C)], 11, ['*', 0.2, sureExpr(C)]];

function style() {
  const P = S.mode, C = P === 'f' ? 'a' : 'b';
  return {
    version: 8,
    sources: {
      iq: { type: 'vector', tiles: ['iq://t/{z}/{x}/{y}'], minzoom: 4, maxzoom: 13, bounds: [38.6, 28.9, 48.9, 37.5] },
      focus: { type: 'geojson', data: EMPTY },
      pick: { type: 'geojson', data: EMPTY },
    },
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': '#f1f3f4' } },
      { id: 'water', type: 'fill', source: 'iq', 'source-layer': 'wt', paint: { 'fill-color': '#cddfe9' } },
      { id: 'rivers', type: 'line', source: 'iq', 'source-layer': 'rv', maxzoom: 12,
        paint: { 'line-color': '#cddfe9', 'line-width': ['interpolate', ['linear'], ['zoom'], 5, 1, 11, 3] } },
      { id: 'roads', type: 'line', source: 'iq', 'source-layer': 'rd', layout: ROUND, paint: { 'line-color': '#d6dadf', 'line-width': roadWidth() } },
      // each tested square: a dot at country scale, a soft patch about its own size once streets show
      { id: 'dots', type: 'circle', source: 'iq', 'source-layer': 'sq', filter: has(P),
        paint: { 'circle-color': colourExpr(P), 'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 4, 1.2, 8, 1.6, 10, 2, 11, 4, 13, 16, 16, 128],
                 'circle-opacity': dotOpacity(C) } },
      { id: 'speed', type: 'line', source: 'iq', 'source-layer': 'rd', filter: has(P), layout: ROUND,
        paint: { 'line-color': colourExpr(P), 'line-opacity': sureExpr(C), 'line-width': roadWidth() } },
      { id: 'sq-hit', type: 'circle', source: 'iq', 'source-layer': 'sq', minzoom: 9, filter: has(P),
        paint: { 'circle-radius': ['interpolate', ['exponential', 2], ['zoom'], 9, 1.2, 16, 154], 'circle-opacity': 0 } },
      { id: 'focus-mask', type: 'fill', source: 'focus', filter: ['==', ['get', 'role'], 'mask'], paint: { 'fill-color': '#ffffff', 'fill-opacity': 0.62 } },
      { id: 'focus-line', type: 'line', source: 'focus', filter: ['==', ['get', 'role'], 'edge'], paint: { 'line-color': '#14202b', 'line-width': 2 } },
      { id: 'pick', type: 'line', source: 'pick', paint: { 'line-color': '#14202b', 'line-width': 2 } },
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

// ---------- the map: a picture inside area pages, the whole screen when tapped ----------

const wrap = document.getElementById('mapwrap');
let map, mapReady, full = false;
const LIBS = window.MAP_LIBS || ['vendor/maplibre-gl.js', 'vendor/pmtiles.js'];
const loadLibs = () => LIBS.reduce((p, src) => p.then(() => new Promise((res, rej) => {
  const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = () => rej(new Error(src)); document.head.appendChild(s);
})), Promise.resolve());

function placeMap() {
  const slot = page.querySelector('.plate');
  if (full) return !!slot;
  if (slot) { if (wrap.parentNode !== slot) slot.appendChild(wrap); }
  else if (wrap.parentNode !== document.body) document.body.appendChild(wrap);
  if (map) map.resize();
  return !!slot;
}
function ensureMap() {
  if (!mapReady) mapReady = loadLibs().then(makeMap);
  return mapReady;
}
const HANDLERS = ['dragPan', 'scrollZoom', 'touchZoomRotate', 'doubleClickZoom', 'keyboard', 'boxZoom'];
function setHandlers(on) {
  for (const h of HANDLERS) map[h][on ? 'enable' : 'disable']();
  if (on) { map.touchZoomRotate.disableRotation(); map.keyboard.disableRotation(); }
}
function makeMap() {
  maplibregl.addProtocol('iq', tileProtocol(new URL('.', location.href).href));
  map = new maplibregl.Map({
    container: 'map', style: style(), bounds: IRAQ, minZoom: 4.2, maxZoom: 16.5, maxBounds: [[30, 20], [58, 47]],
    attributionControl: false, dragRotate: false, pitchWithRotate: false, renderWorldCopies: false, fadeDuration: 0,
  });
  setHandlers(false);       // in the page it is a picture: the page scrolls over it, a tap opens the whole map
  map.on('move', () => { placeLabels(); placeReadout(); });
  map.on('moveend', () => { chooseLabels(); placeLabels(); placeReadout(); });
  map.on('click', onMapClick);
  return new Promise(res => map.once('load', res));
}

function frame(bounds, animate) {
  const cam = map.cameraForBounds(bounds, { padding: full ? { top: 70, bottom: 90, left: 20, right: 20 } : 14,
    maxZoom: !S.focus ? 15 : S.focus.k === 'gov' ? 9.5 : S.focus.r ? 13 : 15 });
  if (!cam) return;
  if (animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) map.easeTo({ ...cam, duration: 600 });
  else map.jumpTo(cam);
}
let pushedFull = false;
function openFull() {
  if (full || !map) return;
  full = true;
  document.body.appendChild(wrap);       // out of the page, so nothing on it can sit above the map
  wrap.classList.add('full');
  try { history.pushState({ full: 1 }, '', route); pushedFull = true; } catch (e) { pushedFull = false; }
  document.documentElement.style.overflow = 'hidden';
  setHandlers(true);
  map.resize();
  frame(S.focusBounds || IRAQ);
  wrap.querySelector('[data-act="close"]').focus();
}
function closeFull() {
  if (!full) return;
  full = false;
  wrap.classList.remove('full');
  document.documentElement.style.overflow = '';
  setHandlers(false);
  hideReadout();
  placeMap();
  frame(S.focusBounds || IRAQ);
  chooseLabels(); placeLabels();
  const b = document.getElementById('fullbtn'); if (b) b.focus();
}
// closing goes back one step when opening added one, so the phone's back button and إغلاق do the same thing
const leaveFull = () => { if (pushedFull) history.back(); else closeFull(); };

wrap.querySelector('.mapctl').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || !map) return;
  const act = b.dataset.act;
  if (act === 'close') leaveFull();
  else if (act === 'in') map.zoomIn();
  else if (act === 'out') map.zoomOut();
  else if (act === 'all') frame(S.focusBounds || IRAQ, true);
});
wrap.querySelector('.legend').innerHTML = bandsHTML(null) + noDataHTML();
addEventListener('keydown', e => { if (e.key === 'Escape' && full) leaveFull(); });

function setMode(m) {
  if (S.mode === m) return;
  S.mode = m;
  if (map && map.isStyleLoaded()) {
    const C = m === 'f' ? 'a' : 'b';
    map.setPaintProperty('speed', 'line-color', colourExpr(m));
    map.setPaintProperty('speed', 'line-opacity', sureExpr(C));
    map.setPaintProperty('dots', 'circle-color', colourExpr(m));
    map.setPaintProperty('dots', 'circle-opacity', dotOpacity(C));
    for (const id of ['speed', 'dots', 'sq-hit']) map.setFilter(id, has(m));
  }
  hideReadout();
  render(false);
}

// ---------- names on the map, chosen by zoom, never overlapping ----------

const labelBox = document.getElementById('labels');
let shown = [];
const LABEL_RULE = { city: [4.5, 1], town: [8.6, 2], suburb: [11.4, 3], quarter: [11.6, 3], area: [11.8, 3], neighbourhood: [12.6, 4], village: [11.2, 5], hamlet: [12.4, 6] };

function chooseLabels() {
  if (!map || !S.places.length || !wrap.offsetWidth) return;
  const z = map.getZoom(), W = map.getContainer().clientWidth, H = map.getContainer().clientHeight;
  const cands = [];
  for (const p of S.places) {
    const rule = LABEL_RULE[p.k]; if (!rule || z < rule[0]) continue;
    if (z < 6.5 && !(p.k === 'city' && p.f && p.f.t > 15000)) continue;
    cands.push({ p, pri: rule[1], big: p.k === 'city' && p.f && p.f.t > 15000 });
  }
  cands.sort((a, b) => a.pri - b.pri || ((b.p.f || { t: 0 }).t - (a.p.f || { t: 0 }).t));
  // keep clear of the buttons and the key on the whole-screen map
  const taken = full ? [{ x0: 0, x1: W, y0: 0, y1: 64 }, { x0: W - 450, x1: W, y0: H - 100, y1: H }] : [];
  const out = [];
  for (const c of cands) {
    if (S.focus && c.p.id === S.focus.id) continue;
    const pt = map.project([c.p.x, c.p.y]);
    const fs = c.big ? 14 : 12, w = c.p.n.length * fs * 0.55 + 10, h = fs + 8;
    const r = { x0: pt.x - w / 2, x1: pt.x + w / 2, y0: pt.y - h / 2, y1: pt.y + h / 2 };
    if (r.x0 < 4 || r.x1 > W - 4 || r.y0 < 4 || r.y1 > H - 4) continue;   // a name cut at the edge reads as another name
    if (taken.some(t => r.x0 < t.x1 && r.x1 > t.x0 && r.y0 < t.y1 && r.y1 > t.y0)) continue;
    taken.push(r); out.push(c);
    if (out.length >= (full ? 50 : 10)) break;
  }
  labelBox.textContent = '';
  shown = out.map(c => {
    const el = document.createElement('div');
    el.className = 'lbl' + (c.big ? ' big' : '');
    el.textContent = c.p.n;
    labelBox.appendChild(el);
    return { el, p: c.p };
  });
}
function placeLabels() {
  for (const s of shown) {
    const pt = map.project([s.p.x, s.p.y]);
    s.el.style.transform = `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
  }
}

// ---------- tapping the whole-screen map: the speed of one 500 m square ----------

const readout = document.getElementById('readout');
function quadBounds(q) {
  let x = 0, y = 0;
  for (const ch of q) { const d = +ch; x = x * 2 + (d & 1); y = y * 2 + (d >> 1); }
  const n = 2 ** q.length, lon = t => t / n * 360 - 180;
  const lat = t => 180 / Math.PI * Math.atan(Math.sinh(Math.PI * (1 - 2 * t / n)));
  return [lon(x), lat(y + 1), lon(x + 1), lat(y)];
}
function onMapClick(e) {
  if (!full) { openFull(); return; }
  const P = S.mode, C = P === 'f' ? 'a' : 'b';
  if (map.getZoom() < 9) { map.easeTo({ center: e.lngLat, zoom: Math.max(10.5, map.getZoom() + 3), duration: 600 }); return; }
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
  const [x0, y0, x1, y1] = quadBounds(best.properties.k);
  S.pick = { lngLat: { lng: (x0 + x1) / 2, lat: y1 }, v: best.properties[P], n: best.properties[C] };
  showPick([x0, y0, x1, y1]);
}
function showPick(b) {
  map.getSource('pick').setData({ type: 'FeatureCollection', features: b ? [{ type: 'Feature', properties: {},
    geometry: { type: 'LineString', coordinates: [[b[0], b[1]], [b[2], b[1]], [b[2], b[3]], [b[0], b[3]], [b[0], b[1]]] } }] : [] });
  const p = S.pick;
  readout.innerHTML = p.empty ? 'لا توجد اختبارات هنا'
    : p.n < MIN_TESTS ? `اختبارات هذا المربع قليلة<small>لا تكفي لرقم يعتمد عليه</small>`
    : `<b>${ar(p.v)}</b> ميغابت<small>في هذا المربع، من ${nTests(p.n)}</small>`;
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
  if (map && map.getSource('pick')) map.getSource('pick').setData(EMPTY);
}

// ---------- the area itself: lit, the rest washed out ----------

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
  S.focus = null; S.focusBounds = null;
  if (map && map.getSource('focus')) map.getSource('focus').setData(EMPTY);
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
  // only the article typed so far (ال): the biggest places whose names start with it, not a no-match message
  const pre = !k && norm(q).toLowerCase();
  if (!k && !pre) return [];
  const words = k.split(' ');
  const scored = [];
  for (const p of S.govs.concat(S.places)) {
    let s;
    if (pre) s = norm(p.n).toLowerCase().startsWith(pre) ? 1 : 0;
    else {
      const keys = p._k || (p._k = [p.n, ...(p.a || [])].map(n => bare(n).toLowerCase()));
      s = Math.max(...keys.map(key => match(key, k, words)));
    }
    if (!s) continue;
    if (p.k === 'gov') s += 30; else if (p.k === 'city') s += 15; else if (p.k === 'town') s += 3;
    s += 2 * Math.log10(1 + ((p.f || {}).t || 0));
    scored.push([s, p]);
  }
  // a name that only contains the letters inside another word (حله inside محله) shows only when nothing better does
  const good = !pre && scored.some(x => x[0] >= 40);
  return scored.filter(x => !good || x[0] >= 40).sort((a, b) => b[0] - a[0]).slice(0, 8).map(x => x[1]);
}

let redrawHits = () => {};
function wireSearch() {
  const form = page.querySelector('.search'), input = document.getElementById('q'), list = document.getElementById('hits');
  if (!form) return;
  let sel = -1, results = [];
  const close = () => { list.classList.remove('open'); list.innerHTML = ''; input.setAttribute('aria-expanded', 'false'); };
  const draw = () => {
    if (!input.value.trim()) { close(); return; }
    if (!S.places.length) { list.classList.add('open'); list.innerHTML = '<div class="none">أحمل أسماء المناطق، لحظة...</div>'; return; }
    results = search(input.value);
    list.classList.add('open');
    input.setAttribute('aria-expanded', results.length ? 'true' : 'false');
    list.innerHTML = results.length ? results.map((p, i) => {
      const st = stat(p);
      return `<a href="${href(p)}" role="option" id="hit${i}" aria-selected="${i === sel}" class="${i === sel ? 'sel' : ''}"><b>${esc(p.n)}</b><i>${esc(kindLine(p))}</i>` +
        `<em>${st ? ar(st.d) : '–'}<small>ميغابت</small></em></a>`;
    }).join('') : '<div class="none">لم أجد هذا الاسم. جرب اسم المدينة أو المحافظة، أو اكتبه بطريقة أخرى.</div>';
    if (sel >= 0) input.setAttribute('aria-activedescendant', 'hit' + sel); else input.removeAttribute('aria-activedescendant');
  };
  redrawHits = draw;
  input.addEventListener('input', () => { sel = -1; draw(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = Math.min(results.length - 1, sel + 1); draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(-1, sel - 1); draw(); e.preventDefault(); }
    else if (e.key === 'Escape') close();
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    draw();
    if (results.length) { input.blur(); navigate(href(results[Math.max(0, sel)])); }
    else input.focus();
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
const kindShort = p => ({ city: 'مدينة', town: 'بلدة', village: 'قرية', hamlet: 'قرية' })[p.k] || '';
const nameIn = p => p.k === 'gov' ? `محافظة ${p.n}` : p.n;
function standing(v) {
  const all = S.places.map(p => stat(p)).filter(s => s && s.t >= FEW_TESTS).map(s => s.d);
  const below = Math.round(all.filter(d => d < v).length / all.length * 100);
  if (below >= 99) return 'من أسرع ١٪ من مناطق العراق المقاسة.';
  if (below <= 1) return 'من أبطأ ١٪ من مناطق العراق المقاسة.';
  return below >= 50 ? `أسرع من ${ar(below)}٪ من مناطق العراق المقاسة.` : `أبطأ من ${ar(100 - below)}٪ من مناطق العراق المقاسة.`;
}
// a point inside an outline (the outer rings of a polygon or multipolygon)
function inside(geom, x, y) {
  const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.coordinates;
  return polys.some(([ring]) => {
    let hit = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  });
}
const km = (a, b) => Math.hypot((a.x - b.x) * 111.32 * Math.cos(b.y * Math.PI / 180), (a.y - b.y) * 111.32);
const kmText = d => `${arDigits(d.toFixed(1)).replace('.', '٫')} كم`;


// ---------- your line against your area: a speed test in the browser to Cloudflare's nearest server ----------

const CF = 'https://speed.cloudflare.com';
S.me = null;            // { p, src: 'net' | 'gps' | 'pick' }: the area your line is compared with
S.test = null;          // { phase, ping, down, up, live, done }
let testRun = null;
const nearest = (x, y, ok) => {
  let best = null, bd = Infinity;
  for (const p of S.places.concat(S.govs)) { if (!ok(p)) continue; const d = km(p, { x, y }); if (d < bd) { bd = d; best = p; } }
  return best;
};
const areaFor = p => {
  // an area without enough tests is compared with its governorate, then with Iraq
  if (p && stat(p)) return p;
  const g = p && p.k !== 'gov' ? govById(p.g) : null;
  return g && stat(g) ? g : S.country;
};
const areaName = a => a === S.country ? 'العراق' : a.k === 'gov' ? `محافظة ${a.n}` : a.n;
const bi = a => a === S.country ? 'بالعراق' : a.k === 'gov' ? `بمحافظة ${a.n}` : `ب${a.n}`;
// where the line is, roughly, from the network: Cloudflare says the city of the address it sees
let netGuess = null;
function guessFromNetwork() {
  if (netGuess) return netGuess;
  netGuess = fetch(`${CF}/__down?bytes=0`, { cache: 'no-store' }).then(r => {
    const lat = parseFloat(r.headers.get('cf-meta-latitude')), lon = parseFloat(r.headers.get('cf-meta-longitude'));
    if (r.headers.get('cf-meta-country') !== 'IQ' || !isFinite(lat) || !isFinite(lon)) return null;
    return placesReady.then(() => nearest(lon, lat, p => (p.k === 'city' || p.k === 'gov') && stat(p, 'f')));
  }).catch(() => null);
  return netGuess;
}
function locateMe() {
  const btn = page.querySelector('[data-act="locate"]');
  if (!navigator.geolocation) return;
  if (btn) btn.textContent = 'أحدد موقعك...';
  navigator.geolocation.getCurrentPosition(pos => placesReady.then(() => {
    const p = nearest(pos.coords.longitude, pos.coords.latitude, q => q.k !== 'village' && q.k !== 'hamlet' && stat(q, 'f'));
    if (p) { S.me = { p, src: 'gps' }; redrawMe(); }
  }), () => { if (btn) btn.textContent = 'ما قدرت أحدد موقعك. اختار منطقتك من البحث'; }, { enableHighAccuracy: false, timeout: 12000, maximumAge: 600000 });
}

const median = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(b.length / 2)]; };
async function measure(t, signal) {
  const tick = () => { if (route === '#/test') drawTest(); };
  // ping: small requests, minus the time the server says it spent
  const pings = [];
  for (let i = 0; i < 9 && !signal.aborted; i++) {
    const t0 = performance.now();
    const r = await fetch(`${CF}/__down?bytes=0&n=${Math.random()}`, { cache: 'no-store', signal });
    await r.arrayBuffer();
    const srv = /dur=([\d.]+)/.exec(r.headers.get('server-timing') || '');
    if (i) pings.push(Math.max(1, performance.now() - t0 - (srv ? +srv[1] : 0)));
  }
  t.ping = median(pings); t.phase = 'down'; tick();
  // download: three streams for up to 9 seconds or 60 MB; the first second is left out of the result
  let got = 0, base = 0, tBase = 0;
  const start = performance.now(), ctl = new AbortController(), stop = () => ctl.abort();
  signal.addEventListener('abort', stop);
  const stream = async () => {
    while (!ctl.signal.aborted) {
      const r = await fetch(`${CF}/__down?bytes=25000000&n=${Math.random()}`, { cache: 'no-store', signal: ctl.signal });
      const rd = r.body.getReader();
      for (;;) { const { done, value } = await rd.read(); if (done) break; got += value.length; }
    }
  };
  const live = setInterval(() => {
    const now = performance.now(), el = (now - start) / 1000;
    if (el > 1 && !tBase) { base = got; tBase = now; }
    if (tBase && now > tBase + 200) t.live = (got - base) * 8 / ((now - tBase) / 1000) / 1e6;
    else if (el > 0.2) t.live = got * 8 / el / 1e6;
    tick();
    if (el > 9 || got > 60e6) stop();
  }, 200);
  await Promise.all([stream(), stream(), stream()].map(p => p.catch(() => {})));
  clearInterval(live);
  if (signal.aborted) return;
  const now = performance.now();
  t.down = tBase && now - tBase > 500 ? (got - base) * 8 / ((now - tBase) / 1000) / 1e6 : got * 8 / ((now - start) / 1000) / 1e6;
  t.live = null; t.phase = 'up'; tick();
  // upload: growing chunks for up to 7 seconds or 25 MB, counted as they leave
  let sent = 0, size = 250e3;
  const ustart = performance.now();
  while (!signal.aborted && performance.now() - ustart < 7000 && sent < 25e6) {
    const before = sent, c0 = performance.now();
    await new Promise(res => {
      const x = new XMLHttpRequest();
      x.open('POST', `${CF}/__up`);
      x.upload.onprogress = e => { sent = before + e.loaded; t.live = sent * 8 / ((performance.now() - ustart) / 1000) / 1e6; tick(); };
      x.onloadend = res; x.timeout = 8000; x.ontimeout = res;
      signal.addEventListener('abort', () => x.abort());
      x.send(new Blob([new Uint8Array(size)], { type: 'text/plain' }));
    });
    if (performance.now() - c0 < 1000) size = Math.min(size * 2, 8e6);
  }
  if (signal.aborted) return;
  t.up = sent * 8 / ((performance.now() - ustart) / 1000) / 1e6;
  t.live = null; t.phase = 'done';
}
function startTest() {
  if (testRun) testRun.abort();
  testRun = new AbortController();
  const t = S.test = { phase: 'ping', ping: null, down: null, up: null, live: null };
  drawTest();
  measure(t, testRun.signal).then(() => { if (S.test === t) drawTest(); }).catch(() => {
    if (S.test === t && !testRun.signal.aborted) { t.phase = 'failed'; drawTest(); }
  });
}


// ---------- ping for games: the area's ping, your own ping idle and while the line is busy, and who has the lowest ----------

const PING = [
  { max: 15, word: 'ممتاز للألعاب', fill: '#12795a', text: '#10664c', line: 'ما راح تحس بتأخير باللعب' },
  { max: 30, word: 'جيد للألعاب', fill: '#5aa85e', text: '#2f7d45', line: 'مناسب لأغلب الألعاب أونلاين' },
  { max: 50, word: 'مقبول', fill: '#e3b021', text: '#866608', line: 'تلعب عادي، بس بالألعاب السريعة ممكن تحس بتأخير بسيط' },
  { max: 80, word: 'عالي', fill: '#ea8a2e', text: '#a8561a', line: 'تحس بتأخير باللعب، خصوصا بألعاب التصويب' },
  { max: Infinity, word: 'عالي جدا', fill: '#d2483f', text: '#b3362e', line: 'اللعب أونلاين راح يكون صعب ويتقطع' },
];
const pingOf = v => PING.find(b => v < b.max);
S.ping = null;          // { phase, idle, jitter, busy, live }
let pingRun = null;
async function pingSeries(n, gap, signal, each) {
  const out = [];
  for (let i = 0; i < n && !signal.aborted; i++) {
    const t0 = performance.now();
    try {
      const r = await fetch(`${CF}/__down?bytes=0&n=${Math.random()}`, { cache: 'no-store', signal });
      await r.arrayBuffer();
      const srv = /dur=([\d.]+)/.exec(r.headers.get('server-timing') || '');
      const v = Math.max(1, performance.now() - t0 - (srv ? +srv[1] : 0));
      if (i) { out.push(v); each && each(v, out); }
    } catch (e) { if (signal.aborted) break; }
    if (gap) await new Promise(r => setTimeout(r, gap));
  }
  return out;
}
async function measurePing(t, signal) {
  const tick = () => { if (route === '#/ping') drawPing(); };
  // idle: 25 pings; jitter is how much one differs from the next
  const idle = await pingSeries(26, 60, signal, (v, all) => { t.live = v; t.idle = median(all); tick(); });
  if (signal.aborted || idle.length < 5) throw new Error('ping');
  t.idle = median(idle);
  t.jitter = idle.slice(1).reduce((a, v, i) => a + Math.abs(v - idle[i]), 0) / (idle.length - 1);
  t.phase = 'busy'; t.live = null; tick();
  // busy: the same pings while three downloads fill the line for six seconds
  const ctl = new AbortController(), stop = () => ctl.abort();
  signal.addEventListener('abort', stop);
  const load = async () => { while (!ctl.signal.aborted) { const r = await fetch(`${CF}/__down?bytes=25000000&n=${Math.random()}`, { cache: 'no-store', signal: ctl.signal }); const rd = r.body.getReader(); for (;;) { const { done } = await rd.read(); if (done) break; } } };
  const loads = [load(), load(), load()].map(p => p.catch(() => {}));
  setTimeout(stop, 6500);
  await new Promise(r => setTimeout(r, 800));
  const busy = await pingSeries(18, 150, ctl.signal, (v, all) => { t.live = v; t.busy = median(all); tick(); });
  stop(); await Promise.all(loads);
  if (signal.aborted) return;
  t.busy = busy.length ? median(busy) : null;
  t.live = null; t.phase = 'done';
}
function startPing() {
  if (pingRun) pingRun.abort();
  pingRun = new AbortController();
  const t = S.ping = { phase: 'idle', idle: null, jitter: null, busy: null, live: null };
  drawPing();
  measurePing(t, pingRun.signal).then(() => { if (S.ping === t) drawPing(); }).catch(() => {
    if (S.ping === t && !pingRun.signal.aborted) { t.phase = 'failed'; drawPing(); }
  });
}
const ms = v => `${ar(v)} ملي ثانية`;
function pingAdvice(t) {
  const jump = t.busy != null ? t.busy - t.idle : 0;
  if (t.busy != null && jump > 60) return `والخط فارغ البنك عندك ${ar(t.idle)} بس. يعني إذا أحد بالبيت يشاهد أو يحمل وانت تلعب، راح تحس باللاگ. راوتر يدعم QoS أو SQM يخلي اللعب أول، أو العب بكيبل وخلي التحميل لوقت ثاني.`;
  if (t.jitter > 15) return `البنك عندك يتذبذب بحدود ${ar(t.jitter)} ملي ثانية بين فحص وفحص، وهذا يحسسك بتقطيع حتى لو الرقم واطي. الكيبل بدل الواي فاي يخففه كثير.`;
  if (t.idle >= 50) return 'البنك عالي حتى والخط فارغ، فالمشكلة غالبا من الشبكة نفسها مو من البيت. قارن بنك منطقتك بالجدول تحت، وإذا هي أحسن منك كلم شركتك.';
  return 'البنك عندك ثابت وما يقفز كثير لما الخط مشغول، وهذا أهم شي للعب.';
}
function placeRows(list, mode) {
  return `<ol class="plist">${list.map((p, i) => { const v = p[mode].l, b = pingOf(v);
    return `<li><span class="pos">${ar(i + 1)}</span><a href="${href(p)}">${esc(p.n)}${p.k !== 'gov' ? `<small>${esc((govById(p.g) || {}).n || '')}</small>` : ''}</a><b style="color:${b.text}">${ar(v)}</b></li>`; }).join('')}</ol>`;
}
function pingHTML() {
  const m = S.mode, a = areaFor(S.me && S.me.p), st = stat(a), aName = areaName(a), t = S.ping;
  const g = S.me && S.me.p ? (S.me.p.k === 'gov' ? S.me.p : govById(S.me.p.g)) : null;
  const pb = pingOf(st.l);
  const ok = p => { const x = stat(p, m); return x && x.t >= FEW_TESTS && x.l != null; };
  const byPing = (x, y) => x[m].l - y[m].l || y[m].t - x[m].t;
  // names people know: no numbered محلة, no names in another script, neighbourhoods in the governorate and towns for Iraq
  const known = p => !/[0-9٠-٩&ەێۆڕڵ]/.test(p.n);
  const inGov = g ? S.places.filter(p => p.g === g.id && ok(p) && known(p) && ['quarter', 'suburb', 'neighbourhood', 'town', 'city'].includes(p.k)).sort(byPing).slice(0, 10) : [];
  const iraqBest = S.places.filter(p => ok(p) && known(p) && (p.k === 'city' || p.k === 'town')).sort(byPing).slice(0, 10);
  const govsRank = S.govs.filter(ok).sort(byPing);
  let test;
  if (!t) test = `<button type="button" class="go" data-act="ping"><span>افحص البنك مالتك</span><em>١٥ ثانية</em></button>`;
  else if (t.phase === 'failed') test = `<p class="intro">ما كمل الفحص، يمكن انقطع الاتصال. جرب مرة ثانية.</p><button type="button" class="go" data-act="ping"><span>افحص مرة ثانية</span></button>`;
  else {
    const cell = (k, label, v) => `<div class="${t.phase === k ? 'now' : v == null ? 'wait' : ''}"><span>${label}</span><b>${v != null ? ms(v) : t.phase === k ? 'يقيس' : 'بعده'}</b></div>`;
    // when the ping jumps under load, that jump is the result that matters, so it stays the big number
    const bloat = t.phase === 'done' && t.busy != null && t.busy - t.idle > 60;
    const big = t.phase === 'done' ? (bloat ? t.busy : t.idle) : t.live != null ? t.live : null;
    test = `<p class="label test-now">${t.phase === 'idle' ? 'البنك مالتك هسه، والخط فارغ' : t.phase === 'busy' || bloat ? 'البنك مالتك وقت التحميل' : 'البنك مالتك'}</p>
      <p class="num" ${big != null ? `style="color:${pingOf(t.phase === 'busy' && t.live != null ? t.live : big).text}"` : ''}>${big != null ? ar(big) : '٠'}<small>ملي ثانية</small></p>
      <div class="three">${cell('idle', 'والخط فارغ', t.idle)}<div class="${t.jitter == null ? 'wait' : ''}"><span>التذبذب</span><b>${t.jitter != null ? ms(t.jitter) : 'بعده'}</b></div>${cell('busy', 'وقت التحميل', t.busy)}</div>
      ${t.phase === 'done' ? `<p class="test-verdict" style="color:${pingOf(big).text}">${bloat ? `البنك يقفز من ${ar(t.idle)} إلى ${ar(t.busy)} لما الخط مشغول (سبب اللاگ)` : `${pingOf(t.idle).word}، ${pingOf(t.idle).line}`}</p>
      <p class="intro">${pingAdvice(t)}</p>
      <div class="two"><button type="button" class="dark" data-act="shareping">شارك النتيجة</button><button type="button" class="light" data-act="ping">افحص مرة ثانية</button></div>`
      : '<p class="small">خلي الصفحة مفتوحة. بالخطوة الثانية نحمل شوية حتى نشوف البنك لما الخط مشغول.</p>'}`;
  }
  return `<div class="cols"><section class="ping">
    <p class="hook">بنك ${KIND[m]} ${bi(a)}</p>
    <p class="num big-area" style="color:${pb.text}">${ar(st.l)}<small>ملي ثانية</small></p>
    <p class="ask" style="color:${pb.text}">${pb.word}</p>
    <p class="intro">${pb.line}. الرقم معدل ${nTests(st.t)} ${bi(a)}، إلى أقرب خادم فحص.</p>
    ${modesHTML()}
    <section class="ptest">${test}</section>
    ${g && inGov.length ? `<section><h2>أقل بنك بمحافظة ${esc(g.n)}</h2><p class="small">المناطق اللي بيها ${ar(FEW_TESTS)} اختبار أو أكثر، بالملي ثانية.</p>${placeRows(inGov, m)}</section>` : ''}
    <section><h2>أقل بنك بمدن العراق</h2>${placeRows(iraqBest, m)}</section>
    <section><h2>المحافظات من الأقل بنك</h2>${placeRows(govsRank, m)}</section>
    <p class="note">البنك هنا إلى أقرب خادم فحص، وغالبا يكون داخل العراق، مو إلى سيرفر اللعبة. سيرفرات الألعاب أبعد فيطلع البنك باللعبة أعلى، بس المنطقة اللي بنكها أقل هنا عادة تكون أحسن باللعب. فحصك يقيس إلى أقرب خادم لشركة Cloudflare.</p>
  </section></div>${foot()}`;
}
function drawPing() { if (route !== '#/ping') return; const y = scrollY, b = page.querySelector('.ptest'); if (!b) return; const tmp = document.createElement('div'); tmp.innerHTML = pingHTML(); const nb = tmp.querySelector('.ptest'); b.replaceWith(nb); scrollTo(0, y); }


// ---------- home line or mobile: both averages of an area side by side, and where mobile is the faster one ----------

const both = p => p && p.f && p.m && p.f.t >= MIN_TESTS && p.m.t >= MIN_TESTS;
const knownName = p => !/[0-9٠-٩&ەێۆڕڵ]/.test(p.n);
function hvmHTML(p) {
  if (!both(p)) return '';
  const f = p.f, m = p.m, r = m.d / f.d, name = bi(p);
  let head, why;
  if (r >= 1.2) { head = `${name} الموبايل أسرع من إنترنت البيت${r >= 1.95 ? ` ${times(r)}` : ''}`; why = 'إذا تستخدم النت لوحدك، باقة موبايل ممكن تكفيك. إذا البيت كله يستخدمه، قارن سعر الباقتين قبل لا تقرر.'; }
  else if (r > 0.8) { head = `${name} البيت والموبايل متقاربين`; why = 'اختار الأرخص لك.'; }
  else { head = `${name} إنترنت البيت أسرع من الموبايل${1 / r >= 1.95 ? ` ${times(1 / r)}` : ''}`; why = 'إذا معتمد على باقة موبايل بالبيت، خط بيت راح يفرق وياك.'; }
  if (f.l < m.l - 5) why += ` والبنك بخط البيت أقل، ${ar(f.l)} مقابل ${ar(m.l)} ملي ثانية، فإذا تلعب أونلاين البيت أحسن.`;
  else if (m.l < f.l - 5) why += ` والبنك بالموبايل أقل، ${ar(m.l)} مقابل ${ar(f.l)} ملي ثانية.`;
  const rough = f.t < FEW_TESTS || m.t < FEW_TESTS ? ' الأرقام تقريبية لأن الاختبارات قليلة.' : '';
  return `<section class="hvm"><h2>البيت لو الموبايل</h2><p class="hvm-head">${head}</p>
    ${barsHTML([{ n: 'إنترنت البيت', v: f.d, me: S.mode === 'f' }, { n: 'إنترنت الموبايل', v: m.d, me: S.mode === 'm' }])}
    <p>${why}${rough}</p>
    <p class="note">معدل التنزيل بالميغابت. البيت من ${PERIOD.f} والموبايل من ${PERIOD.m}، لكل الشركات سوا.</p></section>`;
}
function pairRows(list) {
  return `<div class="pairs"><div class="pairs-hd"><span></span><span>البيت</span><span>الموبايل</span></div>${list.map(p =>
    `<a href="${href(p)}"><span>${esc(p.n)}${p.k !== 'gov' ? `<small>${esc((govById(p.g) || {}).n || '')}</small>` : ''}</span><b style="color:${bandOf(p.f.d).text}">${dec(p.f.d)}</b><b style="color:${bandOf(p.m.d).text}">${dec(p.m.d)}</b></a>`).join('')}</div>`;
}
function mobileHTML() {
  const ok = p => both(p) && p.f.t >= FEW_TESTS && p.m.t >= FEW_TESTS;
  const all = S.places.filter(ok), faster = all.filter(p => p.m.d / p.f.d >= 1.2);
  const ratio = (a, b) => b.m.d / b.f.d - a.m.d / a.f.d;
  const govs = S.govs.filter(both).sort(ratio);
  const top = faster.filter(p => knownName(p) && p.k !== 'hamlet').sort(ratio).slice(0, 15);
  return `<div class="cols"><section class="mob">
    <h1 class="h1">وين الموبايل أسرع من خطوط البيت</h1>
    <p class="intro">في ${ar(faster.length)} منطقة من ${ar(all.length)} فيها اختبارات كافية، معدل الموبايل أسرع من معدل إنترنت البيت بأكثر من ٢٠٪. بهالمناطق، اللي يستخدم النت لوحده ممكن باقة موبايل تكفيه.</p>
    <section><h2>المحافظات، من اللي الموبايل بيها أسرع</h2>${pairRows(govs)}</section>
    <section><h2>مناطق الموبايل بيها أسرع بكثير</h2><p class="small">مناطق بيها ${ar(FEW_TESTS)} اختبار أو أكثر للبيت وللموبايل، ومعدل التنزيل بالميغابت.</p>${pairRows(top)}</section>
    <a class="more" href="#/">ابحث عن منطقتك وشوف البيت لو الموبايل</a>
    <p class="note">البيت من ${PERIOD.f} والموبايل من ${PERIOD.m}، ومعدل الموبايل لكل الشركات سوا، فشركتك ممكن تكون أسرع أو أبطأ منه.</p>
  </section></div>${foot()}`;
}


// ---------- before you rent: two areas side by side ----------

const pid = p => p.k === 'gov' ? 'g:' + p.id : p.id;
const byPid = id => id && (id.startsWith('g:') ? govById(id.slice(2)) : S.byId.get(id));
function cmpPair() { const [, , a, b] = current().split('/'); return [byPid(a && decodeURIComponent(a)), byPid(b && decodeURIComponent(b))]; }
const ROWS = [
  ['f', 'd', 'إنترنت البيت، التنزيل', 'ميغابت', 1], ['f', 'u', 'إنترنت البيت، الرفع', 'ميغابت', 1], ['f', 'l', 'إنترنت البيت، البنك', 'ملي ثانية', -1],
  ['m', 'd', 'الموبايل، التنزيل', 'ميغابت', 1], ['m', 'l', 'الموبايل، البنك', 'ملي ثانية', -1],
];
const sv = (p, m, k) => { const x = p && p[m]; return x && x.t >= MIN_TESTS ? x[k] : null; };
// which of the two is better on one number: 0 for close (within 15%), 1 or 2 otherwise
function better(a, b, dir) {
  if (a == null || b == null) return 0;
  const hi = Math.max(a, b), lo = Math.min(a, b);
  if (hi - lo <= Math.max(2, hi * 0.15)) return 0;
  return (a > b) === (dir > 0) ? 1 : 2;
}
function pickerHTML(i, p) {
  return `<div class="pick" data-i="${i}"><label class="label" for="cq${i}">${i ? 'المنطقة الثانية' : 'المنطقة الأولى'}</label>
    <div class="box"><input id="cq${i}" type="search" autocomplete="off" placeholder="اكتب اسم الحي أو المدينة" value="${p ? esc(p.n) : ''}"></div>
    <div class="hits cmp-hits"></div>${p ? `<p class="small">${esc(kindLine(p))}</p>` : ''}</div>`;
}
function compareHTML() {
  const [A, B] = cmpPair();
  let body = '';
  if (A && B) {
    const n = [A.n, B.n], win = i => `<b class="win">${esc(n[i - 1])}</b>`;
    const rows = ROWS.map(([m, k, label, unit, dir]) => {
      const va = sv(A, m, k), vb = sv(B, m, k), w = better(va, vb, dir);
      const cell = (v, me) => `<span class="${w === me ? 'best' : ''}">${v == null ? '–' : k === 'l' ? ar(v) : dec(v)}</span>`;
      return `<div class="crow"><span class="clab">${label}<small>${unit}</small></span>${cell(va, 1)}${cell(vb, 2)}</div>`;
    }).join('');
    // one sentence on the home line, then a verdict per use
    const fa = sv(A, 'f', 'd'), fb = sv(B, 'f', 'd');
    let lead;
    if (fa != null && fb != null) {
      const w = better(fa, fb, 1), r = Math.max(fa, fb) / Math.min(fa, fb);
      lead = w ? `إنترنت البيت ${bi(w === 1 ? A : B)} أسرع من ${n[2 - w]} ${r >= 1.95 ? times(r) : 'بفرق واضح'}.` : `${n[0]} و${n[1]} متقاربين بإنترنت البيت.`;
    } else lead = 'وحدة من المنطقتين ما بيها اختبارات كافية لإنترنت البيت، فالمقارنة على الموبايل والأرقام اللي موجودة.';
    const use = (label, w) => `<div><span>${label}</span>${w ? win(w) : '<b>متقاربين</b>'}</div>`;
    const work = better(sv(A, 'f', 'u'), sv(B, 'f', 'u'), 1) || better(sv(A, 'f', 'l'), sv(B, 'f', 'l'), -1);
    const rough = [A, B].some(p => (p.f && p.f.t < FEW_TESTS) || !stat(p, 'f')) ? '<p class="note">بعض الأرقام من اختبارات قليلة، فهي تقريبية.</p>' : '';
    body = `<p class="cmp-lead">${lead}</p>
      <div class="ctable"><div class="crow head"><span></span><span>${esc(n[0])}</span><span>${esc(n[1])}</span></div>${rows}</div>${rough}
      <h2>حسب الاستخدام</h2>
      <div class="uses">${use('للمشاهدة والتحميل', better(fa, fb, 1))}${use('للشغل من البيت والاجتماعات', work)}${use('للعب أونلاين', better(sv(A, 'f', 'l'), sv(B, 'f', 'l'), -1))}${use('إذا تعتمد على الموبايل', better(sv(A, 'm', 'd'), sv(B, 'm', 'd'), 1))}</div>
      <p class="note">هذا معدل المنطقة كلها، والشارع أو العمارة نفسها ممكن تختلف. قبل لا توقع، افحص الخط بالبيت أو المحل نفسه من <a href="#/test">صفحة الفحص</a>، واسأل الجيران شنو شركتهم.</p>
      <div class="two"><button type="button" class="dark" data-act="sharecmp">انسخ رابط المقارنة</button><a class="light" href="#/compare">قارن منطقتين ثانيات</a></div>`;
  } else body = `<p class="note">اختار المنطقتين، وتطلع المقارنة هنا.</p>`;
  return `<div class="cols"><section class="cmp">
    <h1 class="h1">قبل لا تأجر بيت أو محل، قارن الإنترنت بين منطقتين</h1>
    <p class="intro">إنترنت البيت والموبايل والبنك بالمنطقتين جنب بعض، من أكثر من مليون اختبار سرعة.</p>
    <div class="picks">${pickerHTML(0, A)}${pickerHTML(1, B)}</div>
    ${body}
  </section></div>${foot()}`;
}
function wireCompare() {
  page.querySelectorAll('.pick').forEach(el => {
    const i = +el.dataset.i, input = el.querySelector('input'), list = el.querySelector('.cmp-hits');
    let res = [];
    input.addEventListener('input', () => {
      res = input.value.trim() ? search(input.value).slice(0, 6) : [];
      list.classList.toggle('open', res.length > 0);
      list.innerHTML = res.map((p, k) => `<a href="#" data-k="${k}"><b>${esc(p.n)}</b><i>${esc(kindLine(p))}</i></a>`).join('');
    });
    list.addEventListener('click', e => {
      const a = e.target.closest('a[data-k]'); if (!a) return;
      e.preventDefault(); e.stopPropagation();
      const pair = cmpPair(); pair[i] = res[+a.dataset.k];
      navigate('#/compare/' + pair.map(p => p ? encodeURIComponent(pid(p)) : '').join('/'));
    });
  });
}


// ---------- where the home lines need work first: for the ministry, in plain numbers and with the table to download ----------

const SLOW = 25;
function workRows(list, cols) {
  return `<div class="wtable"><div class="wrow head"><span>المنطقة</span>${cols.map(c => `<span>${c[0]}</span>`).join('')}</div>${list.map(p =>
    `<a class="wrow" href="${href(p)}"><span>${esc(p.n)}<small>${esc(p.k === 'gov' ? 'محافظة' : (govById(p.g) || {}).n || '')}</small></span>${cols.map(c => `<b${c[2] ? ` style="color:${c[2](p)}"` : ''}>${c[1](p)}</b>`).join('')}</a>`).join('')}</div>`;
}
function workHTML() {
  const ok = p => p.f && p.f.t >= FEW_TESTS && knownName(p) && p.k !== 'hamlet';
  const all = S.places.filter(p => p.f && p.f.t >= FEW_TESTS), slow = all.filter(p => p.f.d < SLOW);
  const tests = slow.reduce((a, p) => a + p.f.t, 0);
  const first = S.places.filter(p => ok(p) && p.f.d < SLOW).sort((a, b) => b.f.t - a.f.t).slice(0, 20);
  const carried = S.places.filter(p => ok(p) && p.f.d < 15 && p.m && p.m.t >= FEW_TESTS && p.m.d >= 2 * p.f.d).sort((a, b) => b.f.t - a.f.t).slice(0, 10);
  const govShare = S.govs.map(g => { const a = all.filter(p => p.g === g.id), sl = a.filter(p => p.f.d < SLOW); return { g, n: a.length, sl: sl.length, share: a.length ? sl.length / a.length : 0 }; })
    .filter(x => x.n >= 5).sort((a, b) => b.share - a.share);
  const c = S.country, h = c.h || [];
  const pct = v => `${ar(Math.round(v * 100))}٪`;
  const sp = p => `color:${bandOf(p.f.d).text}`;
  return `<div class="cols"><section class="work">
    <h1 class="h1">أين يحتاج إنترنت البيت إلى عمل أولا</h1>
    <p class="intro">تجمع هذه الصفحة المناطق التي يحتاج فيها إنترنت البيت إلى تحسين أكثر من غيرها، من اختبارات أجراها الناس بأنفسهم بين تموز وأيلول ٢٠٢٦. الغاية أن تساعد على ترتيب الأولويات، لا أن تقيم أحدا.</p>
    <div class="facts">
      <div><b>${ar(slow.length)}</b><span>منطقة معدل إنترنت البيت فيها أقل من ${ar(SLOW)} ميغابت، من ${ar(all.length)} منطقة فيها ${ar(FEW_TESTS)} اختبارا أو أكثر</span></div>
      <div><b>${ar(tests)}</b><span>اختبار أجري في هذه المناطق، أي أن عدد الناس المتأثرين فيها كبير</span></div>
      <div><b>${ar(h[0] ? h[0][0] : 0)} إلى ${ar(c.f.d)}</b><span>ميغابت، معدل العراق في صيف ٢٠١٩ ثم في صيف ٢٠٢٦</span></div>
    </div>
    <section><h2>المناطق البطيئة التي فيها أكثر اختبارات</h2>
      <p class="small">أقل من ${ar(SLOW)} ميغابت، مرتبة بعدد الاختبارات، لأن كثرة الاختبارات تعني ناسا أكثر. اضغط على أي منطقة لترى شوارعها على الخريطة.</p>
      ${workRows(first, [['البيت', p => dec(p.f.d), p => bandOf(p.f.d).text], ['الاختبارات', p => ar(p.f.t)]])}</section>
    <section><h2>حيث يحمل الموبايل الحمل</h2>
      <p class="small">مناطق خطوط البيت فيها أقل من ١٥ ميغابت والموبايل فيها أسرع بمرتين أو أكثر. قد يدل هذا على ضعف الشبكة الثابتة هناك أو غيابها. <a href="#/mobile">كل المناطق التي يسبق فيها الموبايل</a></p>
      ${workRows(carried, [['البيت', p => dec(p.f.d), p => bandOf(p.f.d).text], ['الموبايل', p => dec(p.m.d), p => bandOf(p.m.d).text]])}</section>
    <section><h2>نسبة المناطق البطيئة في كل محافظة</h2>
      <p class="small">من المناطق التي فيها ${ar(FEW_TESTS)} اختبارا أو أكثر في كل محافظة.</p>
      <div class="wtable">${govShare.map(x => `<a class="wrow share" href="${href(x.g)}"><span>${esc(x.g.n)}<small>${ar(x.sl)} من ${ar(x.n)} منطقة</small></span><i><em style="width:${Math.max(2, x.share * 100)}%"></em></i><b>${pct(x.share)}</b></a>`).join('')}</div></section>
    <section><h2>إنترنت البيت في العراق منذ ٢٠١٩</h2>
      <p class="small">معدل سرعة التنزيل في صيف كل سنة، بالميغابت. التحسن واضح، والمناطق أعلاه هي التي لم يصلها بعد.</p>${yearsHTML(h)}</section>
    <section><h2>الجدول كاملا</h2>
      <p class="small">كل المناطق التي فيها اختبارات لإنترنت البيت أو الموبايل، مع المحافظة والسرعات والبنك وعدد الاختبارات، في ملف يفتح في Excel.</p>
      <button type="button" class="go" data-act="csv"><span>نزل الجدول</span><em>CSV</em></button></section>
    <p class="note">الأرقام من بيانات Ookla المفتوحة، معدل مربعات كل منطقة موزونا بعدد الاختبارات. الاختبارات أجراها أشخاص اختاروا أن يقيسوا سرعتهم، فهي لا تغطي كل بيت، ولا تقول أي المناطق وصلها الفايبر. <a href="#/about">الطريقة كاملة</a></p>
  </section></div>${foot()}`;
}
function downloadCSV() {
  const q = v => /[",\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v);
  const num = (x, k) => x && x.t >= MIN_TESTS ? x[k] : '';
  const rows = [['المنطقة', 'النوع', 'المحافظة', 'البيت تنزيل', 'البيت رفع', 'البيت بنك', 'البيت اختبارات', 'الموبايل تنزيل', 'الموبايل رفع', 'الموبايل بنك', 'الموبايل اختبارات']];
  for (const p of S.places) {
    if (!stat(p, 'f') && !stat(p, 'm')) continue;
    rows.push([p.n, kindShort(p) || p.k, (govById(p.g) || {}).n || '', num(p.f, 'd'), num(p.f, 'u'), num(p.f, 'l'), num(p.f, 't'), num(p.m, 'd'), num(p.m, 'u'), num(p.m, 'l'), num(p.m, 't')]);
  }
  const blob = new Blob(['﻿' + rows.map(r => r.map(q).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = 'iraq-internet-areas.csv'; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(u), 5000);
}

const dec = v => v < 10 ? arDigits(v.toFixed(1)).replace('.', '٫') : ar(v);
function times(k) {
  const n = Math.round(k);
  return n === 2 ? 'بمرتين' : `${ar(n)} ${n <= 10 ? 'مرات' : 'مرة'}`;
}
function folds(k) {
  const n = Math.round(k);
  return n === 2 ? 'بضعفين' : `بـ ${ar(n)} ${n <= 10 ? 'أضعاف' : 'ضعفا'}`;
}
function verdictOf(d, a, aName) {
  const r = d / a;
  if (r < 0.6) return { cls: 'slow', head: a / d >= 1.95 ? `خطك أبطأ من معدل منطقتك ${folds(a / d)}!` : 'خطك أبطأ بوضوح من معدل منطقتك',
    why: `الناس ${aName} يوصلون لـ ${ar(a)} ميغابت بالمعدل وانت وصلت لـ ${dec(d)}، فالمنطقة مو هي السبب. البطء غالبا من الخط أو الراوتر أو الباقة.`,
    todo: 'افحص مرة ثانية وانت قريب من الراوتر، أو بكيبل إذا عندك حاسبة. إذا بقت النتيجة نفسها، اتصل بشركتك وكلهم الرقم، أو اسألهم عن باقة أسرع.' };
  if (r <= 1.4) return a < 25
    ? { cls: 'slow', head: 'خطك مثل منطقتك، والمنطقة كلها بطيئة', why: `معدل ${aName.replace(/^ب/, '')} ${ar(a)} ميغابت فقط، فتبديل الراوتر ما راح يفرق كثير.`,
        todo: 'إذا تحتاج سرعة أكثر، اسأل شركتك عن الفايبر بمنطقتك، أو قارن معدل الموبايل بنفس المنطقة.' }
    : { cls: 'ok', head: 'خطك طبيعي لمنطقتك', why: `الناس ${aName} يوصلون لـ ${ar(a)} ميغابت بالمعدل وانت وصلت لـ ${dec(d)}.`,
        todo: 'إذا يبطأ عندك بأوقات معينة، افحص مرة ثانية بالليل وقارن النتيجتين.' };
  return { cls: 'fast', head: 'خطك أسرع من معدل منطقتك', why: `الناس ${aName} يوصلون لـ ${ar(a)} ميغابت بالمعدل وانت وصلت لـ ${dec(d)}.`,
    todo: 'يعني الخطوط الأسرع ممكنة بمنطقتك. شارك النتيجة حتى يعرف جيرانك.' };
}
const pinAt = v => { const i = BANDS.indexOf(bandOf(v)), lo = i ? BANDS[i - 1].max : 0, hi = Number.isFinite(BANDS[i].max) ? BANDS[i].max : 250;
  return (i + Math.min(1, (v - lo) / (hi - lo))) / BANDS.length * 100; };
function scaleHTML(d, a, aShort) {
  const pd = Math.min(92, Math.max(8, pinAt(d))), pa = Math.min(92, Math.max(8, pinAt(a))), close = Math.abs(pd - pa) < 18;
  return `<div class="scale" aria-hidden="true">
    <div class="pin${close ? ' up' : ''}" style="right:${pd}%"><b>خطك ${dec(d)}</b><i></i></div>
    <div class="pin" style="right:${pa}%"><b>${esc(aShort)} ${ar(a)}</b><i></i></div>
    <div class="strip">${BANDS.map(b => `<i style="background:${b.fill}"></i>`).join('')}</div>
    <div class="words">${BANDS.map(b => `<span>${b.word}</span>`).join('')}</div></div>`;
}
function meBlock() {
  const a = areaFor(S.me && S.me.p), st = stat(a);
  const src = !S.me ? '' : S.me.src === 'gps' ? 'من موقعك' : S.me.src === 'net' ? 'تقريبا، من شبكتك' : 'اخترتها';
  return `<p class="hook">معدل ${KIND[S.mode]} ${bi(a)}</p>
    <p class="num big-area" style="color:${bandOf(st.d).text}">${ar(st.d)}<small>ميغابت في الثانية</small></p>
    <p class="ask">وخطك شكد يوصل؟</p>
    <p class="intro">افحصه بعشرين ثانية. إذا طلع أبطأ من منطقتك فالبطء غالبا من الخط أو الراوتر أو الباقة، وإذا المنطقة كلها بطيئة فتبديل الراوتر ما يفيد.</p>
    <a class="go" href="#/test" data-go="1"><span>ابدأ الفحص</span><em>٢٠ ثانية</em></a>
    <div class="me-place"><span>منطقتك${src ? '، ' + src : ''}</span><b>${esc(areaName(a))}</b></div>
    <p class="small me-change"><button type="button" class="linkish" data-act="locate">حدد منطقتي من موقعي</button> أو ابحث عن منطقتك تحت واضغط افحص خطك هنا.</p>
    <a class="more gamers" href="#/ping">البنك بمنطقتك وأقل بنك بالعراق، للي يلعب أونلاين</a>
    <a class="more gamers" href="#/mobile">وين الموبايل أسرع من خطوط البيت بالعراق</a>
    <a class="more gamers" href="#/compare">قارن الإنترنت بين منطقتين قبل لا تأجر بيت أو محل</a>
    <a class="more gamers" href="#/work">أين يحتاج إنترنت البيت إلى عمل أولا</a>`;
}
function redrawMe() { const b = page.querySelector('#me'); if (b) b.innerHTML = meBlock(); if (route === '#/test') drawTest(); if (route === '#/ping') render(false); }

function testHTML() {
  const t = S.test, a = areaFor(S.me && S.me.p), st = stat(a), aName = bi(a), aShort = a === S.country ? 'العراق' : a.n;
  const top = `<p class="small test-area">نقارن خطك بمعدل ${KIND[S.mode]} ${aName}. ${S.me && S.me.src === 'net' ? 'عرفنا منطقتك تقريبا من شبكتك. ' : ''}<button type="button" class="linkish" data-act="locate">حدد منطقتي من موقعي</button></p>`;
  if (!t) return `<h1 class="h1">افحص سرعة خطك وقارنها بمعدل منطقتك</h1>${top}
    <a class="go" href="#/test" data-go="1"><span>ابدأ الفحص</span><em>٢٠ ثانية</em></a>${testNote()}`;
  if (t.phase === 'failed') return `<h1 class="h1">ما كمل الفحص</h1><p class="intro">يمكن انقطع الاتصال أو الشبكة تمنع خادم الفحص. جرب مرة ثانية.</p>
    <a class="go" href="#/test" data-go="1"><span>افحص مرة ثانية</span></a>${testNote()}`;
  const cell = (k, label, v, unit) => `<div class="${t.phase === k ? 'now' : v == null ? 'wait' : ''}"><span>${label}</span><b>${v != null ? `${dec(v)} ${unit}` : t.phase === k ? 'يقيس' : 'بعده'}</b></div>`;
  const cells = `<div class="three">${cell('ping', 'البنك', t.ping, 'ملي ثانية')}${cell('down', 'التنزيل', t.down, 'ميغابت')}${cell('up', 'الرفع', t.up, 'ميغابت')}</div>`;
  if (t.phase !== 'done') {
    const v = t.live || 0, max = Math.max(st.d * 1.15, v * 1.1, 10);
    const goal = t.phase === 'down' ? `<div class="goal" style="right:${st.d / max * 100}%"><span>معدل ${esc(aShort)} ${ar(st.d)}</span></div>` : '';
    return `<p class="label test-now">${t.phase === 'ping' ? 'نقيس البنك' : t.phase === 'down' ? 'خطك هسه، التنزيل' : 'خطك هسه، الرفع'}</p>
      <p class="num">${t.live != null ? dec(v) : '٠'}<small>ميغابت في الثانية</small></p>
      <div class="track"><div class="rail"></div><div class="me" style="width:${Math.min(100, v / max * 100)}%;background:${bandOf(Math.max(v, 0.1)).fill}"></div>${goal}</div>
      ${cells}<p class="small">خلي الصفحة مفتوحة، ووقف أي تحميل على نفس الشبكة حتى تطلع النتيجة صحيحة.</p>`;
  }
  const v = verdictOf(t.down, st.d, aName), b = bandOf(t.down);
  return `<p class="label test-now">نتيجة خطك، التنزيل</p>
    <p class="num">${dec(t.down)}<small>ميغابت في الثانية</small></p>
    <p class="test-verdict ${v.cls}">${v.head}</p>
    <p class="intro">${v.why}</p>
    ${scaleHTML(t.down, st.d, aShort)}
    <p class="enough"><span>${dec(t.down)} ميغابت </span>${S.mode === 'm' ? phoneLine(t.down) : b.home}.</p>
    <p class="note">الرفع عندك ${dec(t.up)} ميغابت${st.u ? ` ومعدل ${esc(aShort)} ${ar(st.u)}` : ''}، والبنك ${dec(t.ping)} ملي ثانية.</p>
    ${S.mode === 'f' && both(a) && a.m.d / a.f.d >= 1.2 ? `<p class="note">ومعدل الموبايل ${aName} ${ar(a.m.d)}، أسرع من خطوط البيت هناك. <a href="${a === S.country ? '#/mobile' : href(a)}">البيت لو الموبايل</a></p>` : ''}
    <h2 class="todo">شنو تسوي</h2><p class="intro">${v.todo}</p>
    <div class="two"><button type="button" class="dark" data-act="share">شارك النتيجة</button><a class="light" href="#/test" data-go="1">افحص مرة ثانية</a></div>
    <a class="more gamers" href="#/ping">افحص البنك وقت التحميل إذا تلعب أونلاين</a>
    ${modesHTML()}${top}${testNote()}`;
}
const testNote = () => `<p class="note">الفحص يقيس من جهازك إلى أقرب خادم لشركة Cloudflare، وأرقام المناطق من اختبارات Speedtest، فممكن يكون بينهم فرق بسيط. على خط سريع يستهلك الفحص حوالي ١٠٠ ميغابايت.</p>`;
function drawTest() { const b = page.querySelector('#test'); if (b) b.innerHTML = testHTML(); }

// the result as a picture for a story or a chat, in the colour of its band
async function shareResult(kind) {
  const a = areaFor(S.me && S.me.p), st = stat(a), aShort = a === S.country ? 'العراق' : a.n;
  if (kind === 'ping') {
    const t = S.ping; if (!t || t.phase !== 'done') return;
    const pb = pingOf(t.idle), them = a === S.country ? 'معدل العراق' : 'معدل منطقتي';
    return shareCard({ fill: pb.fill, head: a === S.country ? 'البنك عندي بالعراق' : `البنك عندي ${bi(a)}`, big: ar(t.idle), unit: 'ملي ثانية',
      say: `${them} ${ar(st.l)}${t.busy != null ? `، ووقت التحميل يصير عندي ${ar(t.busy)}` : ''}.`, cta: 'افحص البنك مالتك', light: pb.word === 'مقبول' });
  }
  const t = S.test; if (!t || t.phase !== 'done') return;
  const b = bandOf(t.down), r = t.down / st.d, them = a === S.country ? 'معدل العراق' : 'جيراني';
  const say = r < 0.6 ? `ومعدل ${aShort} ${ar(st.d)}. يعني خطي أبطأ من ${them} ${times(st.d / t.down)}.` : r <= 1.4 ? `ومعدل ${aShort} ${ar(st.d)}. خطي مثل ${them}.` : `ومعدل ${aShort} ${ar(st.d)}. خطي أسرع من ${them}.`;
  return shareCard({ fill: b.fill, head: a === S.country ? 'خطي بالعراق' : `خطي ${bi(a)}`, big: dec(t.down), unit: 'ميغابت في الثانية', say, cta: 'افحص خطك',
    light: b.word === 'متوسط' || b.word === 'مقبول' });
}
async function shareCard(o) {
  await Promise.all(['500', '700', '800'].map(w => document.fonts.load(`${w} 80px Rubik`, 'خطي ١٢')));
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const g = c.getContext('2d'), fg = o.light ? '#14202b' : '#ffffff';
  g.fillStyle = o.fill; g.fillRect(0, 0, 1080, 1920);
  g.direction = 'rtl'; g.textAlign = 'right'; g.fillStyle = fg;
  const line = (txt, y, size, w = 500, alpha = 1) => { g.globalAlpha = alpha; g.font = `${w} ${size}px Rubik`; g.fillText(txt, 980, y); g.globalAlpha = 1; };
  line(o.head, 470, 56, 500, 0.9);
  line(o.big, 900, 400, 800);
  line(o.unit, 1010, 56, 500);
  g.globalAlpha = 0.55; g.fillRect(100, 1090, 880, 6); g.globalAlpha = 1;
  g.font = '700 64px Rubik';
  const words = o.say.split(' '); let ln = '', y = 1210;
  for (const w of words) { const tt = ln ? ln + ' ' + w : w; if (g.measureText(tt).width > 880) { g.fillText(ln, 980, y); ln = w; y += 88; } else ln = tt; }
  if (ln) g.fillText(ln, 980, y);
  line('سرعة الإنترنت في العراق', 1780, 50, 700);
  g.textAlign = 'left'; g.font = '500 46px Rubik'; g.fillText(o.cta, 100, 1780);
  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  const file = new File([blob], 'internet-speed.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  const u = URL.createObjectURL(blob), el = document.createElement('a'); el.href = u; el.download = 'internet-speed.png'; document.body.appendChild(el); el.click(); el.remove();
  setTimeout(() => URL.revokeObjectURL(u), 5000);
}

// ---------- pages ----------

const foot = (about = true) => `<p class="foot">السرعات من Speedtest by Ookla، والشوارع والأحياء من مساهمي OpenStreetMap.${about ? '<br><a href="#/about">من أين جاءت الأرقام</a>' : ''}<br>
  فكرة وتصميم <bdi dir="ltr">@allawi.psd</bdi></p>`;
const modesHTML = () => `<div class="modes" role="group" aria-label="نوع الاتصال">
  <button type="button" data-mode="f" aria-pressed="${S.mode === 'f'}" class="${S.mode === 'f' ? 'on' : ''}">إنترنت البيت</button>
  <button type="button" data-mode="m" aria-pressed="${S.mode === 'm'}" class="${S.mode === 'm' ? 'on' : ''}">إنترنت الموبايل</button></div>`;
const searchHTML = (hint, label) => `<form class="search${label ? ' again' : ''}" role="search" autocomplete="off">
    ${label ? `<h2>${label}</h2>` : ''}<label for="q" class="vh">اسم الحي أو المدينة أو المحافظة</label>
    <div class="box"><input id="q" type="search" placeholder="${hint}" enterkeyhint="search"
      role="combobox" aria-controls="hits" aria-autocomplete="list" aria-expanded="false"><button type="submit">ابحث</button></div>
    <div class="hits" id="hits" role="listbox" aria-label="نتائج البحث"></div>
  </form>`;
const tryLinks = () => {
  const ps = ['الكرادة', 'المنصور', 'البصرة', 'أربيل', 'الموصل'].map(n => S.places.find(p => p.n === n && p.k !== 'village')).filter(Boolean);
  return ps.length ? 'جرب' + ps.map(p => `<a href="${href(p)}">${esc(p.n)}</a>`).join('') : '';
};

function barsHTML(rows) {
  const max = Math.max(...rows.map(r => r.v));
  return `<div class="bars">${rows.map(r => `<span class="${r.me ? 'me' : ''}">${esc(r.n)}</span>` +
    `<i style="width:${Math.max(3, r.v / max * 100)}%;background:${speedColour(r.v)}"></i><b>${ar(r.v)}</b>`).join('')}</div>`;
}
function rankRows(list, opts = {}) {
  const max = Math.max(...list.map(p => stat(p).d), 1), pos0 = opts.pos !== false;
  let pos = 0, prev = null;
  return `<div class="rank${pos0 ? '' : ' nopos'}"><p class="rank-hd"><span>${opts.head || ''}</span><span>ميغابت في الثانية</span></p>` + list.map((p, i) => {
    const st = stat(p), v = Math.round(st.d);
    if (v !== prev) { pos = i + 1; prev = v; }        // equal numbers on screen share a place
    const sub = [opts.kind && kindShort(p), opts.from && kmText(km(p, opts.from)), nTests(st.t)].filter(Boolean).join('، ');
    return `<a href="${href(p)}">${pos0 ? `<span class="pos">${ar(pos)}</span>` : ''}` +
      `<span class="nm"><b>${esc(p.n)}</b><small>${esc(sub)}</small></span>` +
      `<i class="tr" style="width:${Math.max(3, st.d / max * 100)}%;background:${speedColour(st.d)}"></i>` +
      `<span class="v">${ar(st.d)}</span></a>`;
  }).join('') + '</div>';
}
function yearsHTML(hist) {
  const hmax = Math.max(...hist.filter(Boolean).map(h => h[0]), 1);
  return `<div class="years">${hist.map((h, i) => {
    const y = arDigits(2019 + i);
    if (!h) return `<div><b style="color:var(--soft)">–</b><i style="height:2px;background:var(--line)"></i><span>${y}</span></div>`;
    return `<div><b>${ar(h[0])}</b><i style="height:${Math.max(3, h[0] / hmax * 96)}px;background:${speedColour(h[0])}"></i><span>${y}</span></div>`;
  }).join('')}</div>`;
}

function govMapHTML() {
  const gm = S.govmap; if (!gm) return '';
  const paths = gm.shapes.map(s => {
    const g = govById(s.id), st = stat(g);
    return `<a href="#/g/${s.id}" aria-label="${esc(g.n)}${st ? '، ' + ar(st.d) + ' ميغابت' : ''}"><path d="${s.d}" fill="${st ? speedColour(st.d) : '#d6dadf'}"/></a>`;
  }).join('');
  // the fastest, the two slowest, Baghdad and Basra are named; the others carry their number only
  const ranked = S.govs.filter(g => stat(g)).sort((a, b) => stat(b).d - stat(a).d);
  const named = [ranked[0], govById('baghdad'), govById('albasrah'), ranked[ranked.length - 2], ranked[ranked.length - 1]]
    .filter((g, i, a) => g && stat(g) && a.indexOf(g) === i);
  const tags = gm.shapes.map(s => {
    const g = govById(s.id), st = stat(g); if (!st) return '';
    const name = named.includes(g), x = name ? Math.min(Math.max(s.x, 44), gm.w - 44) : s.x;
    return `<span class="tag${name ? '' : ' n'}" style="left:${x / gm.w * 100}%;top:${s.y / gm.h * 100}%">${name ? esc(g.n) + ' ' : ''}${ar(st.d)}</span>`;
  }).join('');
  return `<svg viewBox="0 0 ${gm.w} ${gm.h}" role="group" aria-label="محافظات العراق ملونة بمعدل السرعة">${paths}</svg>${tags}`;
}

function homeHTML() {
  const c = S.country, st = c[S.mode], hist = (S.mode === 'f' ? c.h : c.mh) || [];
  const trend = !hist[0] ? '' : S.mode === 'f' ? `كان المعدل ${ar(hist[0][0])} ميغابت في صيف ٢٠١٩`
    : `كان معدل الموبايل ${ar(hist[0][0])} ميغابت في صيف ٢٠١٩، و${ar(hist[hist.length - 1][0])} في صيف ٢٠٢٦`;
  return `<div class="cols">
  <section class="me" id="me">${meBlock()}</section>
  <h2 class="or">أو شوف سرعة أي منطقة</h2>
  <p class="small">من أكثر من مليون اختبار سرعة أجراها الناس بأنفسهم في كل محافظات العراق.</p>
  ${searchHTML('اكتب اسم الحي أو المدينة')}
  <p class="tries">${tryLinks()}</p>

  <section class="iraq">
    ${modesHTML()}
    <div class="answer">
      <p class="label">معدل سرعة التنزيل في العراق، ${PERIOD[S.mode]}</p>
      <p class="num">${ar(st.d)}<small>ميغابت في الثانية</small></p>
      ${verdictHTML(st.d)}
      ${bandsHTML(st.d)}
      ${trend ? `<p class="trend">${trend}</p>` : ''}
    </div>
  </section>

  <section class="side">
    <h2>المحافظات على الخريطة</h2>
    <p class="small">اضغط على محافظة لترى مدنها وأحياءها.</p>
    <div class="govmap">${govMapHTML()}</div>
    <a class="more" href="#/govs">كل المحافظات من الأسرع إلى الأبطأ</a>
  </section>

  <section>
    <h2>${KIND[S.mode]} في العراق منذ ٢٠١٩</h2>
    <p class="small">معدل سرعة التنزيل في صيف كل سنة، من تموز إلى أيلول، بالميغابت.</p>
    ${yearsHTML(hist)}
  </section>
  </div>
  ${foot()}`;
}

function govsHTML() {
  const govs = S.govs.filter(g => stat(g)).sort((a, b) => stat(b).d - stat(a).d);
  return `<div class="cols">
  <h1 class="h1">المحافظات من الأسرع إلى الأبطأ</h1>
  <p class="intro">معدل سرعة تنزيل ${KIND[S.mode]} في كل محافظة، ${PERIOD[S.mode]}، وتحت كل اسم عدد الاختبارات. اضغط على محافظة لترى مدنها وأحياءها.</p>
  ${modesHTML()}
  ${rankRows(govs, { head: 'المحافظة' })}
  <a class="more" href="#/mobile">وين الموبايل أسرع من خطوط البيت</a>
  <a class="more" href="#/work">أين يحتاج إنترنت البيت إلى عمل أولا</a>
  <p class="note">حدود المحافظات من مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية، وفيها حلبجة ما تزال ضمن السليمانية.</p>
  <section class="side">
    <div class="govmap">${govMapHTML()}</div>
  </section>
  </div>
  ${foot()}`;
}

function placeHTML(p, geom) {
  const isGov = p.k === 'gov', g = isGov ? null : govById(p.g);
  const st = stat(p), gs = g && stat(g), cs = stat(S.country);
  let head;
  if (st) {
    const few = st.t < FEW_TESTS;
    const rows = [{ n: p.n, v: st.d, me: true }];
    if (gs) rows.push({ n: g.n === p.n ? `محافظة ${g.n}` : g.n, v: gs.d });
    rows.push({ n: 'العراق', v: cs.d });
    let line = '';
    if (isGov) {
      const ranked = S.govs.filter(x => stat(x)).sort((a, b) => stat(b).d - stat(a).d), r = x => Math.round(stat(x).d);
      const pos = ranked.findIndex(x => r(x) === r(p)), order = ranked.indexOf(p), N = ar(S.govs.length);
      const ties = ranked.filter(x => x !== p && r(x) === r(p));
      if (ties.length) line = `تتساوى مع ${ties.map(x => x.n).join(' و')} في المرتبة ${ORDINAL[pos]} بين ${N} محافظة.`;
      else {
        // a place in the order means little when a neighbour is within 5%, so the page names it
        const near = x => x && Math.abs(stat(x).d - st.d) / st.d < 0.05;
        const bits = [];
        if (near(ranked[order - 1])) bits.push(`قبلها ${ranked[order - 1].n} (${ar(stat(ranked[order - 1]).d)})`);
        if (near(ranked[order + 1])) bits.push(`${bits.length ? 'و' : ''}بعدها ${ranked[order + 1].n} (${ar(stat(ranked[order + 1]).d)})`);
        line = `تأتي ${ORDINAL[order]} بين ${N} محافظة` + (bits.length ? `، ${bits.join(' ')} بفارق صغير.` : '.');
      }
    } else if (!few) line = standing(st.d);
    head = `
    <div class="answer">
      <p class="label">معدل سرعة التنزيل، ${PERIOD[S.mode]}</p>
      <p class="num${few ? ' rough' : ''}">${ar(st.d)}<small>ميغابت في الثانية</small></p>
      <p class="tests">${few ? `من ${nTests(st.t)} فقط، فالرقم تقريبي` : `من ${nTests(st.t)}`}</p>
      ${verdictHTML(st.d)}
      ${bandsHTML(st.d)}
    </div>
    <a class="go testlink" href="#/test" data-go="1" data-me="${isGov ? 'g:' : ''}${esc(p.id)}"><span>افحص خطك وقارنه ب${esc(isGov ? 'المحافظة' : p.n)}</span><em>٢٠ ثانية</em></a>
    <a class="more gamers" href="#/ping" data-me="${isGov ? 'g:' : ''}${esc(p.id)}">البنك للألعاب ${esc(isGov ? 'بالمحافظة' : 'ب' + p.n)} ${ar(st.l)} ملي ثانية، ${pingOf(st.l).word}</a>
    <section class="compare"><p class="label">مقارنة بالمعدل</p>${barsHTML(rows)}${line ? `<p>${line}</p>` : ''}</section>
    ${hvmHTML(p)}
    <a class="more" href="#/compare/${encodeURIComponent(pid(p))}/">قارن ${esc(isGov ? 'المحافظة' : p.n)} بمنطقة ثانية</a>`;
  } else {
    const ref = gs || cs;
    head = `
    <p class="none-yet answer">لا توجد اختبارات كافية ل${KIND[S.mode]} في ${esc(nameIn(p))} لرقم يعتمد عليه.</p>
    <p class="note">معدل ${gs ? 'محافظة ' + esc(g.n) : 'العراق'} ${ar(ref.d)} ميغابت في الثانية.${S.mode === 'm' ? ' جرب إنترنت البيت.' : ''}</p>`;
  }

  const fsF = stat(p, 'f'), fsM = stat(p, 'm');
  const cell = (s, k) => s ? ar(s[k]) : '<small>لا تكفي</small>';
  const table = `<table class="tbl">
      <tr><th></th><th>البيت</th><th>الموبايل</th></tr>
      <tr><td>سرعة التنزيل<small>ميغابت في الثانية</small></td><td>${cell(fsF, 'd')}</td><td>${cell(fsM, 'd')}</td></tr>
      <tr><td>سرعة الرفع<small>ميغابت في الثانية</small></td><td>${cell(fsF, 'u')}</td><td>${cell(fsM, 'u')}</td></tr>
      <tr><td>البنغ<small>ملي ثانية، والأقل أفضل</small></td><td>${cell(fsF, 'l')}</td><td>${cell(fsM, 'l')}</td></tr>
      <tr><td>عدد الاختبارات</td><td>${cell(fsF, 't')}</td><td>${cell(fsM, 't')}</td></tr>
    </table>`;

  // the areas inside this one, then the ones around it, with how far each is
  let lists = '';
  if (isGov) {
    const inGov = S.places.filter(x => x.g === p.id && stat(x)).sort((a, b) => stat(b).t - stat(a).t).slice(0, 20)
      .sort((a, b) => stat(b).d - stat(a).d);
    if (inGov.length) lists = `<section><h2>مدن وأحياء في المحافظة</h2><p class="small">أكثر عشرين منطقة فيها اختبارات، من الأسرع إلى الأبطأ.</p>${rankRows(inGov, { kind: true, head: 'المنطقة' })}</section>`;
  } else {
    const others = S.places.filter(x => x !== p && x.g === p.g && stat(x));
    const within = geom ? others.filter(x => inside(geom, x.x, x.y)) : [];
    const inner = within.sort((a, b) => stat(b).t - stat(a).t).slice(0, 12).sort((a, b) => stat(b).d - stat(a).d);
    const around = others.filter(x => !within.includes(x)).map(x => [km(x, p), x]).sort((a, b) => a[0] - b[0]).slice(0, 8).map(a => a[1])
      .sort((a, b) => stat(b).d - stat(a).d);
    if (inner.length) lists += `<section><h2>أحياء داخل ${esc(p.n)}</h2>${rankRows(inner, { kind: true, pos: false, head: 'الحي' })}</section>`;
    if (around.length) lists += `<section><h2>مناطق قريبة</h2>${rankRows(around, { kind: true, pos: false, from: p, head: 'المنطقة' })}</section>`;
  }
  const kindWord = p.k === 'city' ? 'المدينة' : p.k === 'town' ? 'البلدة' : p.k === 'village' || p.k === 'hamlet' ? 'القرية' : 'الحي';
  const how = isGov ? 'حسبت المعدل من كل المربعات التي يقع مركزها داخل حدود المحافظة.'
    : p.r ? `حسبت المعدل من المربعات التي تقع ضمن ${kmText(p.r)} من مركز ${kindWord}، لأن OpenStreetMap لا يرسم حدودها.`
    : 'حسبت المعدل من المربعات التي يقع مركزها داخل حدودها كما يرسمها OpenStreetMap.';
  const cap = isGov ? 'كل نقطة مربع عرضه نحو نصف كيلومتر بلون سرعة الإنترنت فيه، والباهتة فيها اختبارات قليلة، والمحافظة داخل الخط الأسود.'
    : `كل شارع بلون سرعة الإنترنت في المربع الذي يمر فيه، والباهت فيه اختبارات قليلة، ${p.r ? `والدائرة السوداء على بعد ${kmText(p.r)} من مركز ${kindWord}.` : `و${esc(p.n)} داخل الخط الأسود.`}`;

  const mapSec = `<section class="side">
    <h2>${esc(p.n)} على الخريطة</h2>
    <div class="plate"></div>
    ${bandsHTML(null)}${noDataHTML()}
    <p class="cap">${cap}</p>
    <button type="button" class="more" id="fullbtn">افتح الخريطة كاملة</button>
  </section>`;
  const rest = `<section><h2>البيت والموبايل</h2>${table}</section>
  <section><h2>إنترنت البيت منذ ٢٠١٩</h2><p class="small">معدل سرعة التنزيل في صيف كل سنة، من تموز إلى أيلول، بالميغابت.</p>${yearsHTML(p.h || [])}</section>`;
  return `<div class="cols">
  <p class="crumb"><a href="#/">العراق</a>${g ? `<span>‹</span><a href="${href(g)}">${esc(g.n)}</a>` : ''}</p>
  <h1 class="h1 area">${esc(p.n)}</h1>
  <p class="kind">${esc(kindLine(p))}</p>
  ${modesHTML()}
  ${head}
  ${isGov ? lists + mapSec + rest : mapSec + rest + lists}
  <section><h2>كيف حسبت هذا الرقم</h2><p class="note">${how} الاختبارات أجراها أشخاص بأنفسهم على تطبيق Speedtest، فهي لا تقيس كل بيت. أرقام البيت من تموز إلى أيلول ٢٠٢٦، وأرقام الموبايل من تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦ لأن اختباراتها أقل بكثير. لا أعرض رقما من أقل من ${ar(MIN_TESTS)} اختبارات، وأقول عن الرقم إنه تقريبي حين تكون اختباراته أقل من ${ar(FEW_TESTS)}.</p></section>
  ${searchHTML('اكتب اسم الحي أو المدينة', 'ابحث عن منطقة أخرى')}
  </div>
  ${foot()}`;
}

function aboutHTML() {
  return `
  <article class="prose">
    <h1 class="h1">عن هذا الموقع</h1>
    <p>صنعت هذا الموقع ليعرف أي شخص في العراق سرعة الإنترنت الحقيقية في منطقته، من بيانات مفتوحة يمكن التحقق منها. تكتب اسم منطقتك فيظهر معدل سرعتها ومقارنتها بمحافظتها وبالعراق، وكيف تغيرت منذ صيف ٢٠١٩.</p>
    <h2>من أين جاءت السرعات</h2>
    <p>من بيانات Ookla المفتوحة، الشركة التي تملك تطبيق Speedtest. تقسم Ookla الأرض إلى مربعات عرض كل منها نحو نصف كيلومتر، وتنشر لكل مربع معدل سرعة التنزيل والرفع والبنغ وعدد الاختبارات. في العراق ${ar(S.country.f.q)} مربعا فيها اختبارات على الإنترنت الثابت بين تموز وأيلول ٢٠٢٦، وأكثر من مليون اختبار.</p>
    <p>رقم كل حي أو مدينة هو معدل مربعاته، موزونا بعدد الاختبارات في كل مربع. أرقام الموبايل تجمع سنة كاملة، من تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦، لأن اختباراتها أقل بكثير. لا أعرض رقما لأي منطقة فيها أقل من ${ar(MIN_TESTS)} اختبارات.</p>
    <h2>ماذا تعني الكلمة تحت الرقم</h2>
    <p>أصف كل سرعة بما تكفي له في البيت، على أساس ما توصي به Netflix، وهو ٥ ميغابت لكل شاشة تعرض فيديو HD و١٥ ميغابت لكل شاشة تعرض 4K. أقل من ١٠ ميغابت بطيء، ومن ١٠ إلى ٢٥ مقبول، ومن ٢٥ إلى ٥٠ متوسط، ومن ٥٠ إلى ١٠٠ جيد، وما فوق ١٠٠ سريع جدا. وعلى الموبايل أقول ما تكفي له السرعة على شاشة هاتف واحد. ولكل كلمة لون واحد في الموقع كله وعلى الخرائط.</p>
    ${bandsHTML(null)}
    <h2>حدود هذه الأرقام</h2>
    <p>الاختبارات أجراها أشخاص اختاروا أن يقيسوا سرعتهم، فهي لا تقيس كل بيت ولا كل شارع، واختبارات البيوت تشمل الهواتف المتصلة بشبكة البيت. عدد الاختبارات زاد نحو مرتين ونصف بين صيف ٢٠٢٥ وصيف ٢٠٢٦، وهذا يغير من تقيسهم الأرقام.</p>
    <p>لا أقارن بين شركات الإنترنت. البيانات المفتوحة لا تذكر الشركة، والمصدر الآخر الذي يذكرها (M-Lab) يقيس العراق إلى خوادم خارج العراق يتأخر الرد منها ١١٠ إلى ١٦٠ ملي ثانية، فتخرج أرقامه أقل بكثير من الواقع.</p>
    <h2>الخرائط</h2>
    <p>الشوارع والأنهار والأحياء من OpenStreetMap، وحدود المحافظات من مكتب الأمم المتحدة لتنسيق الشؤون الإنسانية (OCHA)، وفيها حلبجة ما تزال ضمن محافظة السليمانية.</p>
    <h2>من صنعه</h2>
    <p>الفكرة والتصميم لعلي، إنستغرام <bdi dir="ltr">@allawi.psd</bdi></p>
    <h2>المصادر والرخص</h2>
    <p class="src">Speedtest<span class="reg">®</span> by Ookla<span class="reg">®</span> Global Fixed and Mobile Network Performance Maps. Based on analysis by Ookla of Speedtest Intelligence<span class="reg">®</span> data for Q4 2025 to Q3 2026, and Q3 of each year from 2019. Provided by Ookla and accessed 23 October 2026. Licensed CC BY-NC-SA 4.0; Ookla trademarks used under license.</p>
    <p class="src">Map data © OpenStreetMap contributors, ODbL, through the Humanitarian OpenStreetMap Team exports. Rivers: Natural Earth. Governorates: OCHA, Iraq Subnational Administrative Boundaries (COD-AB), CC BY-IGO. Type: Rubik (SIL OFL). Map rendering: MapLibre GL JS and PMTiles (BSD-3-Clause).</p>
  </article>
  ${foot(false)}`;
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
  if (e.target.closest && e.target.closest('.cmp-hits')) return;
  const a = e.target.closest && e.target.closest('a[href^="#/"]');
  if (a && !e.defaultPrevented && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    if (a.dataset.me) { const id = a.dataset.me; const p = id.startsWith('g:') ? govById(id.slice(2)) : S.byId.get(id); if (p) S.me = { p, src: 'pick' }; }
    if (a.dataset.go) { if (route === '#/test') { startTest(); return; } S.goTest = true; }
    navigate(a.getAttribute('href')); return;
  }
  if (e.target.closest && e.target.closest('[data-act="csv"]')) { downloadCSV(); return; }
  const cp = e.target.closest && e.target.closest('[data-act="sharecmp"]');
  if (cp) { const u = location.href; (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(() => { cp.textContent = 'انتسخ الرابط'; }, () => {}); if (navigator.share) navigator.share({ url: u }).catch(() => {}); return; }
  const act = e.target.closest && e.target.closest('[data-act="locate"], [data-act="share"], [data-act="ping"], [data-act="shareping"]');
  if (act) { const k = act.dataset.act; if (k === 'locate') locateMe(); else if (k === 'ping') startPing(); else shareResult(k === 'shareping' ? 'ping' : 'line'); return; }
  const m = e.target.closest && e.target.closest('.modes button');
  if (m) { setMode(m.dataset.mode); return; }
  if (e.target.closest && e.target.closest('#fullbtn')) ensureMap().then(openFull);
});
function fromAddress() {
  const h = location.hash.startsWith('#/') ? location.hash : '#/';
  if (h !== route) { route = h; render(true); }
}
addEventListener('popstate', () => { if (full) { pushedFull = false; closeFull(); return; } fromAddress(); });
addEventListener('hashchange', fromAddress);

let lastRoute = '';
async function render(move = true) {
  const h = current();
  const view = h.startsWith('/p/') || h.startsWith('/g/') ? 'place' : h === '/govs' ? 'govs' : h === '/about' ? 'about' : h === '/test' ? 'test' : h === '/ping' ? 'ping' : h === '/mobile' ? 'mobile' : h.startsWith('/compare') ? 'compare' : h === '/work' ? 'work' : 'home';
  if (view !== 'test' && testRun) { testRun.abort(); testRun = null; if (S.test && S.test.phase !== 'done') S.test = null; }
  if (view !== 'ping' && pingRun) { pingRun.abort(); pingRun = null; if (S.ping && S.ping.phase !== 'done') S.ping = null; }
  const tab = view === 'govs' || view === 'work' || h.startsWith('/g/') ? '#/govs' : view === 'about' ? '#/about' : '#/';
  document.querySelectorAll('.tabs a, .topnav a').forEach(a => {
    const on = a.getAttribute('href') === tab;
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  if (full) closeFull();
  const keepScroll = !move || lastRoute === h, y = scrollY;
  let p = null, geom = null;
  if (view === 'place') {
    await placesReady;                    // an area needs its neighbours, a governorate its areas
    const id = h.slice(3);
    p = h.startsWith('/g/') ? govById(id) : S.byId.get(id);
    if (!p) { route = '#/'; return render(true); }
    geom = await areaOf(p).catch(() => null);
    page.innerHTML = placeHTML(p, geom);
    wireSearch();
    document.title = `${p.n}، سرعة الإنترنت`;
  } else if (view === 'govs') { page.innerHTML = govsHTML(); document.title = 'المحافظات، سرعة الإنترنت في العراق'; }
  else if (view === 'about') { page.innerHTML = aboutHTML(); document.title = 'عن موقع سرعة الإنترنت في العراق'; }
  else if (view === 'work') { await placesReady; page.innerHTML = workHTML(); document.title = 'أين يحتاج إنترنت البيت إلى عمل، سرعة الإنترنت في العراق'; }
  else if (view === 'compare') { await placesReady; page.innerHTML = compareHTML(); wireCompare(); document.title = 'قارن منطقتين، سرعة الإنترنت في العراق'; }
  else if (view === 'mobile') { await placesReady; page.innerHTML = mobileHTML(); document.title = 'وين الموبايل أسرع من البيت، سرعة الإنترنت في العراق'; }
  else if (view === 'ping') { await placesReady; page.innerHTML = pingHTML(); document.title = 'البنك للألعاب، سرعة الإنترنت في العراق'; }
  else if (view === 'test') {
    page.innerHTML = `<div class="cols"><section class="test" id="test"></section></div>${foot()}`;
    document.title = 'افحص خطك، سرعة الإنترنت في العراق';
    if (S.goTest) { S.goTest = false; startTest(); } else drawTest();
  }
  else { page.innerHTML = homeHTML(); document.title = 'سرعة الإنترنت في العراق'; wireSearch(); }
  scrollTo(0, keepScroll ? y : 0);

  if (!placeMap()) { lastRoute = h; return; }
  await ensureMap();
  placeMap();
  wrap.querySelector('[data-act="all"]').textContent = p.k === 'gov' ? 'المحافظة كلها' : 'المنطقة كلها';
  if (lastRoute !== h || !S.focus) {
    hideReadout();
    if (geom) setFocus(p, geom);
    else { clearFocus(); S.focusBounds = [[p.x - 0.02, p.y - 0.02], [p.x + 0.02, p.y + 0.02]]; }
  }
  frame(S.focusBounds);
  lastRoute = h;
  chooseLabels(); placeLabels();
}

// ---------- start: the first page needs three small files; the 4,300 areas and the map come after ----------

let rs;
addEventListener('resize', () => {
  clearTimeout(rs);
  rs = setTimeout(() => { placeMap(); if (map) { chooseLabels(); placeLabels(); } }, 200);
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
Promise.all(['data/govs.json', 'data/country.json', 'data/govmap.json'].map(getJSON)).then(([gv, country, govmap]) => {
  S.govs = gv.govs; S.country = country; S.govmap = govmap;
  const shown = render(true);
  guessFromNetwork().then(p => { if (p && !S.me) { S.me = { p, src: 'net' }; redrawMe(); } });
  document.body.dataset.text = '1';
  return Promise.all([shown, placesReady]);
}).then(() => { document.body.dataset.ready = '1'; });
})();
