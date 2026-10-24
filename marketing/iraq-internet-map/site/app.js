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

const dec = v => v < 10 ? arDigits(v.toFixed(1)).replace('.', '٫') : ar(v);
function times(k) {
  const n = Math.round(k);
  return n === 2 ? 'بمرتين' : `${ar(n)} ${n <= 10 ? 'مرات' : 'مرة'}`;
}
function verdictOf(d, a, aName) {
  const r = d / a;
  if (r < 0.6) return { cls: 'slow', head: a / d >= 1.95 ? `خطك أبطأ من منطقتك ${times(a / d)}` : 'خطك أبطأ بوضوح من منطقتك',
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
    <p class="small me-change"><button type="button" class="linkish" data-act="locate">حدد منطقتي من موقعي</button> أو ابحث عن منطقتك تحت واضغط افحص خطك هنا.</p>`;
}
function redrawMe() { const b = page.querySelector('#me'); if (b) b.innerHTML = meBlock(); if (route === '#/test') drawTest(); }

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
    <h2 class="todo">شنو تسوي</h2><p class="intro">${v.todo}</p>
    <div class="two"><button type="button" class="dark" data-act="share">شارك النتيجة</button><a class="light" href="#/test" data-go="1">افحص مرة ثانية</a></div>
    ${modesHTML()}${top}${testNote()}`;
}
const testNote = () => `<p class="note">الفحص يقيس من جهازك إلى أقرب خادم لشركة Cloudflare، وأرقام المناطق من اختبارات Speedtest، فممكن يكون بينهم فرق بسيط. على خط سريع يستهلك الفحص حوالي ١٠٠ ميغابايت.</p>`;
function drawTest() { const b = page.querySelector('#test'); if (b) b.innerHTML = testHTML(); }

// the result as a picture for a story or a chat, in the colour of its band
async function shareResult() {
  const t = S.test; if (!t || t.phase !== 'done') return;
  const a = areaFor(S.me && S.me.p), st = stat(a), aShort = a === S.country ? 'العراق' : a.n, b = bandOf(t.down);
  await Promise.all(['500', '700', '800'].map(w => document.fonts.load(`${w} 80px Rubik`, 'خطي ١٢')));
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
  const g = c.getContext('2d'), light = b.word === 'متوسط' || b.word === 'مقبول', fg = light ? '#14202b' : '#ffffff';
  g.fillStyle = b.fill; g.fillRect(0, 0, 1080, 1920);
  g.direction = 'rtl'; g.textAlign = 'right'; g.fillStyle = fg;
  const line = (txt, y, size, w = 500, alpha = 1) => { g.globalAlpha = alpha; g.font = `${w} ${size}px Rubik`; g.fillText(txt, 980, y); g.globalAlpha = 1; };
  line(a === S.country ? 'خطي بالعراق' : `خطي ${bi(a)}`, 470, 56, 500, 0.9);
  line(dec(t.down), 900, 400, 800);
  line('ميغابت في الثانية', 1010, 56, 500);
  g.globalAlpha = 0.55; g.fillRect(100, 1090, 880, 6); g.globalAlpha = 1;
  const r = t.down / st.d;
  const them = a === S.country ? 'معدل العراق' : 'جيراني';
  const say = r < 0.6 ? `ومعدل ${aShort} ${ar(st.d)}. يعني خطي أبطأ من ${them} ${times(st.d / t.down)}.` : r <= 1.4 ? `ومعدل ${aShort} ${ar(st.d)}. خطي مثل ${them}.` : `ومعدل ${aShort} ${ar(st.d)}. خطي أسرع من ${them}.`;
  g.font = '700 64px Rubik';
  const words = say.split(' '); let ln = '', y = 1210;
  for (const w of words) { const tt = ln ? ln + ' ' + w : w; if (g.measureText(tt).width > 880) { g.fillText(ln, 980, y); ln = w; y += 88; } else ln = tt; }
  if (ln) g.fillText(ln, 980, y);
  line('سرعة الإنترنت في العراق', 1780, 50, 700);
  g.textAlign = 'left'; g.font = '500 46px Rubik'; g.fillText('افحص خطك', 100, 1780);
  const blob = await new Promise(res => c.toBlob(res, 'image/png'));
  const file = new File([blob], 'internet-speed.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file] }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  const u = URL.createObjectURL(blob), el = document.createElement('a'); el.href = u; el.download = 'internet-speed.png'; document.body.appendChild(el); el.click(); el.remove();
  setTimeout(() => URL.revokeObjectURL(u), 5000);
}

// ---------- pages ----------

const foot = (about = true) => `<p class="foot">السرعات من Speedtest by Ookla، والشوارع والأحياء من مساهمي OpenStreetMap.${about ? ' <a href="#/about">من أين جاءت الأرقام</a>' : ''}<br>
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
    <section class="compare"><p class="label">مقارنة بالمعدل</p>${barsHTML(rows)}${line ? `<p>${line}</p>` : ''}</section>`;
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
  const a = e.target.closest && e.target.closest('a[href^="#/"]');
  if (a && !e.defaultPrevented && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    if (a.dataset.me) { const id = a.dataset.me; const p = id.startsWith('g:') ? govById(id.slice(2)) : S.byId.get(id); if (p) S.me = { p, src: 'pick' }; }
    if (a.dataset.go) { if (route === '#/test') { startTest(); return; } S.goTest = true; }
    navigate(a.getAttribute('href')); return;
  }
  const act = e.target.closest && e.target.closest('[data-act="locate"], [data-act="share"]');
  if (act) { if (act.dataset.act === 'locate') locateMe(); else shareResult(); return; }
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
  const view = h.startsWith('/p/') || h.startsWith('/g/') ? 'place' : h === '/govs' ? 'govs' : h === '/about' ? 'about' : h === '/test' ? 'test' : 'home';
  if (view !== 'test' && testRun) { testRun.abort(); testRun = null; if (S.test && S.test.phase !== 'done') S.test = null; }
  const tab = view === 'govs' || h.startsWith('/g/') ? '#/govs' : view === 'about' ? '#/about' : '#/';
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
