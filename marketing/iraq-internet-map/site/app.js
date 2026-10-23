(() => {
'use strict';

// ---------- numbers, words, colour ----------

const LN4 = Math.log(4), LN200 = Math.log(200), SPAN = LN200 - LN4;
const RAMP = [[0, [110, 28, 8]], [0.35, [226, 104, 28]], [0.65, [255, 184, 86]], [1, [255, 244, 222]]];
const MONTHS = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
const DAYS = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const NUM = new Intl.NumberFormat('ar-IQ-u-nu-arab', { maximumFractionDigits: 0 });
const ar = n => NUM.format(Math.round(n));
const arDigits = s => String(s).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const speedV = mbps => Math.max(0, Math.min(1, (Math.log(Math.max(mbps, 1)) - LN4) / SPAN));
function rampRGB(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 0; i < RAMP.length - 1; i++) {
    const [a, ca] = RAMP[i], [b, cb] = RAMP[i + 1];
    if (t <= b) { const k = (t - a) / (b - a); return ca.map((c, j) => Math.round(c + (cb[j] - c) * k)); }
  }
  return RAMP[RAMP.length - 1][1];
}
const speedColour = mbps => `rgb(${rampRGB(speedV(mbps)).join(',')})`;

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
const SQUARES = ['مربع', 'مربعان', 'مربعات', 'مربعا'];
const MORNINGS = ['صباح', 'صباحان', 'صباحات', 'صباحا'];
const nTests = n => `${ar(n)} ${counted(n, TESTS)}`;
const nSquares = n => `${ar(n)} ${counted(n, SQUARES)}`;

function norm(s) {
  return String(s).replace(/[\u064B-\u0652\u0640]/g, '')
    .replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\s+/g, ' ').trim();
}
const bare = s => norm(s).split(' ').map(w => w.replace(/^ال/, '')).join(' ');

// ---------- state ----------

const S = { mode: 'f', places: [], govs: [], byId: new Map(), country: null, exams: [], areas: {}, focus: null, pick: null };
const PERIOD = { f: 'تموز إلى أيلول ٢٠٢٦', m: 'تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦' };
const MIN_TESTS = 10;
const isWide = () => matchMedia('(min-width: 900px)').matches;
const IRAQ = [[38.8, 29.05], [48.6, 37.4]];

// ---------- map ----------

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
  const P = 'f', C = 'a', p = paint(P, C);
  return {
    version: 8,
    sources: {
      ground: { type: 'image', url: base + 'tiles/ground.jpg', coordinates: [[37.5, 38.5], [50.0, 38.5], [50.0, 28.0], [37.5, 28.0]] },
      iq: { type: 'vector', url: 'pmtiles://' + base + 'tiles/iraq.pmtiles' },
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
        paint: { 'line-color': 'rgba(255,184,86,0.5)', 'line-width': 1, 'line-dasharray': [1, 0] } },
      { id: 'pick', type: 'line', source: 'pick', paint: { 'line-color': 'rgba(255,244,222,0.85)', 'line-width': 1.2 } },
    ],
  };
}

let map;
function initMap() {
  const protocol = new pmtiles.Protocol();
  maplibregl.addProtocol('pmtiles', protocol.tilev4 || protocol.tile);
  const base = new URL('.', location.href).href;
  map = new maplibregl.Map({
    container: 'map', style: style(base), bounds: homeBounds(), fitBoundsOptions: { padding: framePadding('home') },
    minZoom: 4.2, maxZoom: 16.5, maxBounds: [[30, 20], [58, 47]], attributionControl: false,
    dragRotate: false, pitchWithRotate: false, renderWorldCopies: false, fadeDuration: 0,
  });
  map.touchZoomRotate.disableRotation();
  map.keyboard.disableRotation();
  map.on('move', placeLabels);
  map.on('moveend', () => { chooseLabels(); placeLabels(); placeReadout(); });
  map.on('move', placeReadout);
  map.on('click', onMapClick);
  map.on('load', () => { chooseLabels(); placeLabels(); });
}

function frame(bounds, padding, opts = {}) {
  const cam = map.cameraForBounds(bounds, { padding, maxZoom: opts.maxZoom || 20 });
  if (!cam) return;
  if (opts.duration === 0) map.jumpTo(cam); else map.flyTo({ ...cam, duration: opts.duration || 1400, essential: true });
}
const homeBounds = () => isWide() ? IRAQ : [[43.1, 30.45], [47.85, 37.15]];
function framePadding(kind) {
  const w = innerWidth, h = innerHeight;
  if (isWide()) return { top: 70, bottom: 60, left: 60, right: 520 };
  if (kind === 'home') return { top: h * 0.40, bottom: h * 0.16, left: w * 0.30, right: w * 0.12 };
  return { top: Math.min(230, h * 0.28), bottom: Math.min(250, h * 0.3), left: 24, right: 24 };
}

function setMode(m) {
  if (S.mode === m) return;
  S.mode = m;
  document.querySelectorAll('.modes button').forEach(b => b.classList.toggle('on', b.dataset.mode === m));
  const P = m, C = m === 'f' ? 'a' : 'b', p = paint(P, C);
  for (const [id, props] of Object.entries(p)) for (const [k, v] of Object.entries(props)) map.setPaintProperty(id, k, v);
  for (const id of ['rd-wide', 'rd-glow', 'sq-glow', 'sq-core', 'sq-hit']) map.setFilter(id, has(P));
  hideReadout();
  render(false);
}

// ---------- labels: Arabic set in the page's own fonts, chosen by zoom, never overlapping ----------

const labelBox = document.getElementById('labels');
let shown = [];
const LABEL_RULE = { city: [4.5, 1], town: [8.6, 2], suburb: [11.4, 3], quarter: [11.6, 3], area: [11.8, 3], neighbourhood: [12.6, 4], village: [11.2, 5], hamlet: [12.4, 6] };

function chooseLabels() {
  if (!map || !S.places.length) return;
  const z = map.getZoom(), W = innerWidth, H = innerHeight;
  const cands = [];
  for (const p of S.places) {
    const rule = LABEL_RULE[p.k]; if (!rule || z < rule[0]) continue;
    if (z < 6.5 && !(p.k === 'city' && p.f && p.f.t > 15000)) continue;
    cands.push({ p, pri: rule[1], cls: p.k === 'city' && (p.f && p.f.t > 15000) ? 'big' : '' });
  }
  cands.sort((a, b) => a.pri - b.pri || ((b.p.f || { t: 0 }).t - (a.p.f || { t: 0 }).t));
  // keep labels out from under the page's own text
  const taken = [...sheet.querySelectorAll('.hit, .more')].map(el => el.getBoundingClientRect())
    .filter(r => r.width && r.bottom > 0 && r.top < H).map(r => ({ x0: r.left - 6, x1: r.right + 6, y0: r.top - 6, y1: r.bottom + 6 }));
  const out = [];
  for (const c of cands) {
    if (S.focus && c.p.id === S.focus.id) continue;
    const pt = map.project([c.p.x, c.p.y]);
    if (pt.x < -40 || pt.x > W + 40 || pt.y < 60 || pt.y > H + 20) continue;
    const fs = c.cls === 'big' ? 14 : 12.5;
    const w = c.p.n.length * fs * 0.52 + 10, h = fs + 8;
    const side = z < 10 ? 1 : 0;                       // 1: set to the left of the light, 0: centred on it
    const cx = side ? pt.x - 9 - w / 2 : pt.x;
    const r = { x0: cx - w / 2, x1: cx + w / 2, y0: pt.y - h / 2, y1: pt.y + h / 2 };
    if (taken.some(t => r.x0 < t.x1 && r.x1 > t.x0 && r.y0 < t.y1 && r.y1 > t.y0)) continue;
    taken.push(r); c.side = side; out.push(c);
    if (out.length >= 70) break;
  }
  labelBox.textContent = '';
  shown = out.map(c => {
    const el = document.createElement('div');
    el.className = 'lbl' + (c.cls ? ' ' + c.cls : '');
    el.textContent = c.p.n;
    labelBox.appendChild(el);
    return { el, p: c.p, side: c.side };
  });
}

function placeLabels() {
  for (const s of shown) {
    const pt = map.project([s.p.x, s.p.y]);
    s.el.style.transform = s.side ? `translate(${pt.x - 9}px, ${pt.y}px) translate(-100%, -50%)` : `translate(${pt.x}px, ${pt.y}px) translate(-50%, -50%)`;
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
  if (location.hash.startsWith('#/exams') || location.hash.startsWith('#/about')) return;
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
  readout.innerHTML = p.empty ? `<span>لا توجد ${S.mode === 'f' ? 'اختبارات' : 'اختبارات موبايل'} في هذا المربع</span>`
    : `<b style="color:${speedColour(p.v)}">${ar(p.v)}</b><span>ميغابت، من ${nTests(p.n)}</span>`;
  readout.hidden = false;
  placeReadout();
}
function placeReadout() {
  if (!S.pick || readout.hidden) return;
  const pt = map.project(S.pick.lngLat);
  readout.style.left = pt.x + 'px'; readout.style.top = (pt.y - 6) + 'px';
}
function hideReadout() {
  S.pick = null; readout.hidden = true;
  if (map && map.getSource('pick')) map.getSource('pick').setData({ type: 'FeatureCollection', features: [] });
}

// ---------- focus on an area: the rest of the map held down, as in a darkroom ----------

async function areaOf(p) {
  if (!S.areas[p.g]) S.areas[p.g] = await fetch(`data/areas/${p.g}.json`).then(r => r.json());
  return S.areas[p.g][p.id];
}
function setFocus(p, geom) {
  S.focus = p;
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

function search(q) {
  const k = bare(q);
  if (!k) return [];
  const words = k.split(' ');
  const scored = [];
  for (const p of S.govs.concat(S.places)) {
    const key = p._k || (p._k = bare(p.n));
    let s = 0;
    if (key === k) s = 100;
    else if (key.startsWith(k)) s = 60;
    else if (words.every(w => key.split(' ').some(x => x.startsWith(w)))) s = 40;
    else if (key.includes(k)) s = 20;
    if (!s) continue;
    if (p.k === 'gov') s += 30; else if (p.k === 'city') s += 20; else if (p.k === 'town') s += 8;
    s += Math.log10(1 + ((p.f || {}).t || 0));
    scored.push([s, p]);
  }
  return scored.sort((a, b) => b[0] - a[0]).slice(0, 8).map(x => x[1]);
}

function wireSearch(root) {
  const input = root.querySelector('input'), list = root.querySelector('.hits');
  if (!input) return;
  let sel = -1, results = [];
  const draw = () => {
    if (!input.value.trim()) { list.classList.remove('open'); list.innerHTML = ''; return; }
    results = search(input.value);
    list.classList.add('open');
    list.innerHTML = results.length ? results.map((p, i) => {
      const st = stat(p), v = st ? st.d : null;
      return `<a href="${href(p)}" class="${i === sel ? 'sel' : ''}"><b>${esc(p.n)}</b><i>${esc(kindLine(p, true))}</i>` +
        `<em style="color:${v != null ? speedColour(v) : 'var(--faint)'}">${v != null ? ar(v) : ''}</em></a>`;
    }).join('') : '<div class="none">لم أجد هذا الاسم. جرب اسم المدينة أو المحافظة.</div>';
  };
  input.addEventListener('input', () => { sel = -1; draw(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { sel = Math.min(results.length - 1, sel + 1); draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(-1, sel - 1); draw(); e.preventDefault(); }
    else if (e.key === 'Enter' && results.length) { location.hash = href(results[Math.max(0, sel)]).slice(1); input.blur(); }
  });
}

// ---------- words about a place ----------

const govById = id => S.govs.find(g => g.id === id);
const href = p => p.k === 'gov' ? `#/g/${p.id}` : `#/p/${encodeURIComponent(p.id)}`;
function stat(p, mode = S.mode) {
  const s = p && p[mode];
  return s && s.t >= MIN_TESTS ? s : null;
}
function kindLine(p, short) {
  if (p.k === 'gov') return 'محافظة';
  const g = govById(p.g), gn = g ? g.n : '';
  const inGov = gn ? `محافظة ${gn}` : '';
  switch (p.k) {
    case 'city': return short ? `مدينة، ${inGov}` : `مدينة في ${inGov}`;
    case 'town': return short ? `بلدة، ${inGov}` : `بلدة في ${inGov}`;
    case 'village': case 'hamlet': return p.c ? `قرية قرب ${p.c}، ${gn}` : `قرية في ${inGov}`;
    default: return p.c ? (p.c === gn ? `حي في ${gn}` : `حي في ${p.c}، ${gn}`) : `حي في ${inGov}`;
  }
}

// ---------- the sheet ----------

const sheet = document.getElementById('sheet');
const modeWord = () => S.mode === 'f' ? 'إنترنت البيوت' : 'إنترنت الموبايل';

function homeHTML() {
  const c = S.country, st = c[S.mode], h = S.mode === 'f' ? c.h : c.mh;
  const lede = S.mode === 'f'
    ? 'أكثر من مليون اختبار سرعة على الإنترنت الثابت بين تموز وأيلول ٢٠٢٦. كل ضوء مربع عرضه نصف كيلومتر، والأسرع أقوى ضوءا.'
    : 'أكثر من مئتي ألف اختبار سرعة على شبكات الموبايل خلال سنة، من تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦. اختبارات الموبايل أقل، لذلك تظهر المدن متقطعة.';
  const govs = S.govs.filter(g => stat(g)).sort((a, b) => stat(b).d - stat(a).d);
  const max = Math.max(...govs.map(g => stat(g).d));
  return `
  <section class="first">
    <div class="top hit">
      <h1 class="h1">كل ضوء هنا<br>سرعة إنترنت</h1>
      <p class="lede">${lede}</p>
      <div class="search"><input type="search" placeholder="اكتب اسم منطقتك" aria-label="ابحث عن منطقة" autocomplete="off" enterkeyhint="search"><div class="hits"></div></div>
      <p class="credit">السرعات من Ookla، والطرق والأحياء من OpenStreetMap</p>
    </div>
    <div class="bottom">
      <div class="figure left hit">
        <div class="num" style="color:${speedColour(st.d)}">${ar(st.d)}</div>
        <p class="unit">ميغابت في الثانية، معدل العراق<br>كان ${ar(h[0][0])} في صيف ٢٠١٩</p>
        <a class="cue" href="#/" data-scroll>المحافظات من الأسرع إلى الأبطأ</a>
      </div>
    </div>
  </section>
  <div class="more" id="more">
    <section>
      <h2>المحافظات</h2>
      <p class="sub">معدل التنزيل في ${modeWord()}، ${PERIOD[S.mode]}. اضغط على محافظة لترى مدنها وأحياءها.</p>
      <div class="rank">${govs.map(g => rankRow(g, max)).join('')}</div>
      <p class="note">حدود المحافظات من geoBoundaries، وفيها حلبجة ما تزال ضمن السليمانية.</p>
    </section>
    <section>
      <a class="teaser" href="#/exams"><h2>صباحات الامتحانات</h2><canvas id="teaser"></canvas>
      <p>${ar(S.exams.filter(e => e.d.startsWith('2025')).length)} صباحا في ٢٠٢٥ و${ar(S.exams.filter(e => e.d.startsWith('2026')).length)} صباحا في ٢٠٢٦ انقطع فيها الإنترنت عن أغلب العراق.</p></a>
    </section>
    <section class="links">
      <a href="#/about">عن هذه الخريطة ومن أين جاءت الأرقام</a>
    </section>
    <p class="foot">فكرة وتصميم @allawi.psd<br>السرعات من Speedtest by Ookla، والطرق والأحياء من مساهمي OpenStreetMap، والانقطاعات من IODA.</p>
  </div>`;
}

function rankRow(p, max) {
  const st = stat(p), col = speedColour(st.d);
  return `<a href="${href(p)}"><span class="nm">${esc(p.n)}</span>` +
    `<span class="v" style="color:${col}">${ar(st.d)}</span>` +
    `<i class="tr" style="width:${Math.max(4, st.d / max * 100)}%;background:${col};box-shadow:0 0 8px ${col}"></i></a>`;
}

function placeHTML(p) {
  const st = stat(p), g = p.k === 'gov' ? null : govById(p.g), gs = g && stat(g), cs = stat(S.country);
  const name = esc(p.n), len = p.n.length;
  const cls = len > 16 ? 'pname vlong' : len > 10 ? 'pname long' : 'pname';
  const fallback = !st && S.mode === 'm' ? (gs || cs) : null;
  const big = st ? `<div class="num xl" style="color:${speedColour(st.d)}">${ar(st.d)}</div><p class="unit">ميغابت في الثانية</p>
      <p class="basis">معدل التنزيل في ${modeWord()} من ${nTests(st.t)} في ${nSquares(st.q)}، ${PERIOD[S.mode]}</p>`
    : `<p class="thin">لا تكفي اختبارات ${S.mode === 'm' ? 'الموبايل' : 'إنترنت البيوت'} هنا لرقم أثق به.${fallback ? ` معدل ${g ? 'المحافظة' : 'العراق'} ${ar(fallback.d)} ميغابت.` : ''}</p>`;
  const compare = `<div class="compare">${g && gs ? `<a href="${href(g)}"><b style="color:${speedColour(gs.d)}">${ar(gs.d)}</b><span>${esc(g.n)}</span></a>` : ''}` +
    `<a href="#/"><b style="color:${speedColour(cs.d)}">${ar(cs.d)}</b><span>العراق</span></a></div>`;

  const fs = stat(p, 'f');
  const hist = p.h || [];
  const hmax = Math.max(...hist.filter(Boolean).map(h => h[0]), 1);
  const years = hist.map((h, i) => {
    const y = 2019 + i;
    if (!h) return `<div><b style="color:var(--faint)">–</b><i style="height:3px;background:var(--line)"></i><span>${arDigits(y)}</span></div>`;
    const col = speedColour(h[0]);
    return `<div><b style="color:${col}">${ar(h[0])}</b><i style="height:${Math.max(3, h[0] / hmax * 46)}px;margin-top:${46 - Math.max(3, h[0] / hmax * 46)}px;background:${col};box-shadow:0 0 10px ${col}"></i><span>${arDigits(y)}</span></div>`;
  }).join('');

  const facts = st ? `<div class="facts"><div><b>${ar(st.u)}</b><span>ميغابت رفع</span></div><div><b>${ar(st.l)}</b><span>ملي ثانية تأخير</span></div>` +
    `<div><b>${ar(st.t)}</b><span>${counted(st.t, TESTS)}</span></div></div>` : '';

  let list = '';
  if (p.k === 'gov') {
    const inGov = S.places.filter(x => x.g === p.id && stat(x)).sort((a, b) => b[S.mode].t - a[S.mode].t).slice(0, 16);
    const max = Math.max(...inGov.map(x => stat(x).d), 1);
    if (inGov.length) list = `<section><h2>أكثر مناطقها اختبارا</h2><div class="rank">${inGov.map(x => rankRow(x, max)).join('')}</div></section>`;
  } else {
    const near = S.places.filter(x => x !== p && x.g === p.g && stat(x))
      .map(x => [Math.hypot((x.x - p.x) * 0.84, x.y - p.y), x]).sort((a, b) => a[0] - b[0]).slice(0, 8).map(a => a[1]);
    const max = Math.max(...near.map(x => stat(x).d), 1);
    if (near.length) list = `<section><h2>قريب منها</h2><div class="rank">${near.map(x => rankRow(x, max)).join('')}</div></section>`;
  }
  const how = p.k === 'gov' ? 'حسبت المعدل من كل المربعات التي يقع مركزها داخل حدود المحافظة.'
    : p.r ? `حسبت المعدل من المربعات التي تقع ضمن ${arDigits(String(p.r).replace('.', '٫'))} كم من مركز ${p.k === 'city' ? 'المدينة' : p.k === 'town' ? 'البلدة' : p.k === 'village' || p.k === 'hamlet' ? 'القرية' : 'الحي'}، لأن OpenStreetMap لا يرسم حدودها.`
    : 'حسبت المعدل من المربعات التي يقع مركزها داخل حدودها كما يرسمها OpenStreetMap.';

  return `
  <section class="first firstp">
    <div class="top hit">
      <a class="back" href="#/">العراق</a>
      <h1 class="${cls}">${name}</h1>
      <p class="kind">${esc(kindLine(p))}</p>
    </div>
    <div class="bottom">
      <div class="figure left hit">${big}</div>
      <div class="hit">${compare}</div>
    </div>
  </section>
  <div class="more">
    <section>
      <h2>${S.mode === 'f' ? 'تفاصيل' : 'تفاصيل الموبايل'}</h2>
      ${facts || '<p class="sub">لا أرقام كافية هنا.</p>'}
    </section>
    <section>
      <h2>إنترنت البيوت منذ ٢٠١٩</h2>
      <p class="sub">معدل التنزيل في صيف كل سنة، من تموز إلى أيلول.${fs ? '' : ' الاختبارات هنا قليلة.'}</p>
      <div class="years">${years}</div>
    </section>
    ${list}
    <section>
      <p class="note">${how} الاختبارات أجراها أشخاص بأنفسهم على تطبيق Speedtest، فهي لا تقيس كل بيت، وكل مربع عرضه نصف كيلومتر.</p>
      <p class="note"><a href="#/about" style="border-bottom:1px solid var(--line)">من أين جاءت الأرقام</a></p>
    </section>
  </div>`;
}

function examsHTML() {
  const ys = ['2025', '2026'].map(y => S.exams.filter(e => e.d.startsWith(y)));
  const cap = { 2025: 'من السادسة إلى الثامنة كل مرة', 2026: 'ساعة ونصف حتى تموز، ثم أربعون دقيقة من ٢٦ آب' };
  return `
  <section class="exams">
    <div class="pad">
      <a class="back" href="#/">العراق</a>
      <h1 style="margin-top:6px">صباحات الامتحانات</h1>
      <p class="intro">كل خط صباح امتحان من الرابعة فجرا إلى العاشرة، ويخفت حين تختفي شبكات العراق من الإنترنت. اضغط على خط لترى يومه.</p>
    </div>
    ${ys.map((rows, i) => {
      const y = 2025 + i;
      const d0 = new Date(rows[0].d), d1 = new Date(rows[rows.length - 1].d);
      return `<div class="yr" data-year="${y}">
        <div class="yh"><b>${arDigits(y)}</b></div>
        <p class="cap" style="padding-top:6px">${ar(rows.length)} ${counted(rows.length, MORNINGS)}، ${cap[y]}</p>
        <div class="ticks"></div>
        <canvas></canvas>
        <p class="ends">الأيام من الأعلى إلى الأسفل، من ${arDigits(d0.getDate())} ${MONTHS[d0.getMonth()]} إلى ${arDigits(d1.getDate())} ${MONTHS[d1.getMonth()]}</p>
        <p class="day"></p>
      </div>`;
    }).join('')}
    <p class="src">المصدر IODA في معهد جورجيا للتقنية. ضوء كل خط نسبة الشبكات العراقية التي ردت على القياس، مقارنة بما كان قبل السادسة في الصباح نفسه. الخط من اليمين إلى اليسار، من الرابعة إلى العاشرة بتوقيت بغداد.</p>
  </section>`;
}

function aboutHTML() {
  return `
  <article class="about">
    <a class="back" href="#/">العراق</a>
    <h1 style="margin-top:6px">عن هذه الخريطة</h1>
    <p>جمعت هذه الخريطة من بيانات مفتوحة يستطيع أي شخص أن يتحقق منها، لأعرف سرعة الإنترنت الحقيقية في كل منطقة من العراق بدل الأرقام العامة. كل ضوء فيها مربع عرضه نصف كيلومتر، وكل شارع يأخذ سرعة المربع الذي يمر فيه.</p>
    <h2>السرعات</h2>
    <p>أرقام إنترنت البيوت من بيانات Ookla المفتوحة للفترة من تموز إلى أيلول ٢٠٢٦: أكثر من مليون اختبار سرعة على الإنترنت الثابت في ${ar(S.country.f.q)} مربعا داخل العراق. الأرقام معدلات موزونة بعدد الاختبارات في كل مربع.</p>
    <p>أرقام الموبايل من الفترة نفسها مضافا إليها الأشهر التسعة التي قبلها، من تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦، لأن اختبارات الموبايل أقل بكثير. لا أعرض رقما لأي منطقة فيها أقل من ${ar(MIN_TESTS)} اختبارات.</p>
    <h2>حدود هذه الأرقام</h2>
    <p>الاختبارات أجراها أشخاص اختاروا أن يقيسوا سرعتهم على تطبيق Speedtest، فهي لا تقيس كل بيت ولا كل شارع، واختبارات البيوت تشمل الهواتف المتصلة بشبكة البيت. عدد الاختبارات تضاعف بين ٢٠٢٥ و٢٠٢٦، وهذا يغير من تقيسهم الأرقام.</p>
    <p>لا أقارن بين شركات الإنترنت. البيانات المفتوحة لا تذكر الشركة، والمصدر الآخر الذي يذكرها (M-Lab) يقيس العراق إلى خوادم بعيدة في الدوحة وتل أبيب وأثينا، فتخرج أرقامه أقل بكثير من الواقع.</p>
    <h2>صباحات الامتحانات</h2>
    <p>من مرصد IODA في معهد جورجيا للتقنية، الذي يرسل قياسات إلى عناوين الشبكات العراقية كل عشر دقائق. أرسم ما ردت به هذه الشبكات من الرابعة إلى العاشرة صباحا في كل يوم امتحان، مقارنة بما كان قبل السادسة. لم أضف تعليقا على هذه الأيام، الأرقام وحدها.</p>
    <h2>الخرائط</h2>
    <p>الشوارع والأنهار والأحياء من OpenStreetMap، والأرض من صور ناسا للتضاريس وأضواء المدن، وحدود العراق من Natural Earth، وحدود المحافظات من geoBoundaries، وفيها حلبجة ما تزال ضمن محافظة السليمانية.</p>
    <h2>من صنعها</h2>
    <p>الفكرة والتصميم لعلي، انستغرام @allawi.psd</p>
    <h2>المصادر والرخص</h2>
    <p class="small">Speedtest® by Ookla® Global Fixed and Mobile Network Performance Maps. Based on analysis by Ookla of Speedtest Intelligence® data for Q4 2025 to Q3 2026, and Q3 of each year from 2019. Provided by Ookla and accessed 23 October 2026. Licensed CC BY-NC-SA 4.0; Ookla trademarks used under license.</p>
    <p class="small">Map data © OpenStreetMap contributors, ODbL, through the Humanitarian OpenStreetMap Team exports. Internet outage data: IODA, Georgia Institute of Technology. NASA GIBS: ASTER GDEM shaded relief, VIIRS Black Marble. Natural Earth. geoBoundaries (CC BY 4.0). Map rendering: MapLibre GL JS and PMTiles (BSD-3-Clause).</p>
  </article>`;
}

// ---------- exam lines ----------

function drawMornings(canvas, rows, rowH, selected, thick = 1.6, gain = 1, glow = true) {
  const dpr = Math.min(2, devicePixelRatio || 1), W = canvas.clientWidth, H = rows.length * rowH + 8;
  canvas.style.height = H + 'px';
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  const off = document.createElement('canvas'); off.width = canvas.width; off.height = canvas.height;
  const o = off.getContext('2d');
  const img = o.createImageData(off.width, off.height), px = img.data;
  const lineH = Math.max(1, Math.round(thick * dpr));
  rows.forEach((r, i) => {
    const y0 = Math.round((4 + i * rowH) * dpr);
    const n = r.v.length;
    for (let x = 0; x < off.width; x++) {
      const t = (1 - x / (off.width - 1)) * (n - 1), a = Math.floor(t), f = t - a;
      const va = r.v[a] == null ? 1 : r.v[a], vb = r.v[Math.min(n - 1, a + 1)] == null ? va : r.v[Math.min(n - 1, a + 1)];
      const v = Math.max(0, Math.min(1.05, va + (vb - va) * f));
      const lum = (0.08 + 0.92 * Math.pow(v, 2.2)) * (selected === i ? 1.35 : 1) * gain;
      const c = rampRGB(0.12 + 0.58 * Math.pow(v, 1.6));
      for (let k = 0; k < lineH; k++) {
        const j = ((y0 + k) * off.width + x) * 4;
        px[j] = Math.min(255, c[0] * lum); px[j + 1] = Math.min(255, c[1] * lum); px[j + 2] = Math.min(255, c[2] * lum); px[j + 3] = 255;
      }
    }
  });
  o.putImageData(img, 0, 0);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'lighter';
  if (glow && 'filter' in ctx) { ctx.filter = `blur(${3 * dpr}px)`; ctx.globalAlpha = 0.9; ctx.drawImage(off, 0, 0); ctx.filter = 'none'; ctx.globalAlpha = 1; }
  ctx.drawImage(off, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

function clock(minAfter4) {
  const m = 240 + minAfter4, h = Math.floor(m / 60), mm = m % 60;
  return `${arDigits(h)}:${arDigits(String(mm).padStart(2, '0'))}`;
}

function wireExams() {
  for (const box of sheet.querySelectorAll('.yr')) {
    const y = box.dataset.year, rows = S.exams.filter(e => e.d.startsWith(y));
    const canvas = box.querySelector('canvas'), day = box.querySelector('.day'), ticks = box.querySelector('.ticks');
    const rowH = isWide() ? 7 : 6;
    let sel = null;
    const W = () => canvas.clientWidth;
    ticks.innerHTML = [[6, '٦ صباحا'], [8, '٨'], [10, '١٠']].map(([h, t]) =>
      `<span style="left:${Math.max(14, Math.min(W() - 14, W() - (h - 4) / 6 * W()))}px">${t}</span>`).join('');
    const draw = () => drawMornings(canvas, rows, rowH, sel);
    draw();
    const pickRow = e => {
      const r = canvas.getBoundingClientRect(), i = Math.max(0, Math.min(rows.length - 1, Math.floor((e.clientY - r.top - 4) / rowH)));
      sel = i; draw();
      const row = rows[i], d = new Date(row.d + 'T12:00:00');
      day.textContent = `${DAYS[d.getDay()]} ${arDigits(d.getDate())} ${MONTHS[d.getMonth()]}: ` + (row.cut
        ? `انقطع من ${clock(row.cut[0])} إلى ${clock(row.cut[1])}، وبقيت ${ar(row.low * 100)}٪ من الشبكات`
        : 'لم يظهر انقطاع واضح');
    };
    canvas.addEventListener('click', pickRow);
    canvas.addEventListener('pointermove', e => { if (e.pointerType === 'mouse') pickRow(e); });
  }
}

function drawTeaser() {
  const c = document.getElementById('teaser'); if (!c) return;
  const rows = S.exams;
  drawMornings(c, rows, 2, null, 0.8, 0.8, false);
}

// ---------- routing ----------

let lastRoute = '';
async function render(move = true) {
  const h = decodeURIComponent(location.hash.replace(/^#/, '')) || '/';
  document.body.dataset.view = h.startsWith('/p/') || h.startsWith('/g/') ? 'place' : h.startsWith('/exams') ? 'exams' : h.startsWith('/about') ? 'about' : 'home';
  const dim = document.body.dataset.view === 'exams' || document.body.dataset.view === 'about';
  labelBox.style.opacity = dim ? 0 : 1;
  if (map && map.isStyleLoaded()) map.setPaintProperty('focus-mask', 'fill-opacity', 0.62);
  document.getElementById('map').style.opacity = dim ? 0.35 : 1;
  if (h.startsWith('/p/') || h.startsWith('/g/')) {
    const id = h.slice(3), p = h.startsWith('/g/') ? govById(id) : S.byId.get(id);
    if (!p) { location.hash = '#/'; return; }
    sheet.innerHTML = placeHTML(p);
    if (move || lastRoute !== h) {
      sheet.scrollTop = 0;
      hideReadout();
      const geom = await areaOf(p);
      if (geom) {
        setFocus(p, geom);
        frame(boundsOf(geom), framePadding('place'), { maxZoom: p.k === 'gov' ? 9.5 : 15, duration: lastRoute ? 1400 : 0 });
      } else map.flyTo({ center: [p.x, p.y], zoom: p.z, duration: 1400 });
    }
  } else if (h.startsWith('/exams')) {
    sheet.innerHTML = examsHTML(); sheet.scrollTop = 0; clearFocus(); hideReadout();
    requestAnimationFrame(wireExams);
  } else if (h.startsWith('/about')) {
    sheet.innerHTML = aboutHTML(); sheet.scrollTop = 0; clearFocus(); hideReadout();
  } else {
    sheet.innerHTML = homeHTML();
    wireSearch(sheet);
    requestAnimationFrame(drawTeaser);
    const cue = sheet.querySelector('[data-scroll]');
    if (cue) cue.addEventListener('click', e => { e.preventDefault(); document.getElementById('more').scrollIntoView({ behavior: 'smooth' }); });
    if (move && lastRoute !== h) {
      sheet.scrollTop = 0; clearFocus();
      frame(homeBounds(), framePadding('home'), { duration: lastRoute ? 1400 : 0 });
    }
  }
  lastRoute = h;
  if (map) { chooseLabels(); placeLabels(); }
}

// ---------- start ----------

document.querySelectorAll('.modes button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
addEventListener('hashchange', () => render(true));
let sc;
sheet.addEventListener('scroll', () => { clearTimeout(sc); sc = setTimeout(() => { chooseLabels(); placeLabels(); }, 120); }, { passive: true });
let rs;
addEventListener('resize', () => { clearTimeout(rs); rs = setTimeout(() => { if (document.body.dataset.view === 'exams') wireExams(); }, 200); });

initMap();
Promise.all(['data/places.json', 'data/country.json', 'data/exams.json'].map(u => fetch(u).then(r => r.json()))).then(([pl, country, exams]) => {
  S.govs = pl.govs; S.places = pl.places; S.country = country; S.exams = exams;
  for (const p of S.places) S.byId.set(p.id, p);
  const go = () => render(true).then(() => { document.body.dataset.ready = '1'; });
  if (map.loaded()) go(); else map.once('load', go);
});
})();
