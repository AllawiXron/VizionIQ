// Design measurements for a review: screenshots of every page at phone, tablet and desktop sizes, plus what a designer
// would measure by hand (type styles in use, vertical gaps between blocks, text measure, lone last words, text edges,
// colours). NODE_PATH=/opt/node-tools/node_modules node build/design-audit.cjs [--out dir] [--base url]
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), net = require('net');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(require('os').tmpdir(), 'iraq-map-design')));
const VIEWS = [
  { name: 'phone', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'tablet', width: 820, height: 1180, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];
const PAGES = [['home', '#/'], ['area', null], ['governorate', '#/g/baghdad'], ['village', null], ['governorates-list', '#/govs'], ['about', '#/about']];
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const SCROLLER = "(() => { const p = document.getElementById('page'); return getComputedStyle(p).overflowY === 'auto' ? p : document.scrollingElement; })()";
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });

function measure() {
  const root = document.getElementById('page');
  const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const ownText = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const label = el => el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '');
  const sc = getComputedStyle(root).overflowY === 'auto' ? root : document.scrollingElement;
  const pageTop = root.getBoundingClientRect().top + sc.scrollTop;
  const abs = r => ({ top: Math.round(r.top + sc.scrollTop - pageTop), right: Math.round(r.right), left: Math.round(r.left), h: Math.round(r.height), w: Math.round(r.width) });

  // every text style in use: family, size, weight, line height, colour
  const styles = {};
  for (const el of root.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const t = ownText(el); if (!t) continue;
    const s = getComputedStyle(el);
    const k = `${s.fontFamily.split(',')[0].replace(/['"]/g, '')} ${parseFloat(s.fontSize)}px/${s.lineHeight === 'normal' ? 'normal' : Math.round(parseFloat(s.lineHeight) / parseFloat(s.fontSize) * 100) / 100} w${s.fontWeight} ${s.color}`;
    (styles[k] = styles[k] || { n: 0, eg: [] }).n++;
    if (styles[k].eg.length < 3) styles[k].eg.push(`${label(el)}: ${t.slice(0, 40)}`);
  }

  // vertical rhythm: the gap from each block to the next, down the page
  const blocks = [];
  const walk = (el, depth) => {
    for (const c of el.children) {
      if (!vis(c)) continue;
      const s = getComputedStyle(c);
      if (c.tagName === 'SECTION' || c.tagName === 'ARTICLE') { walk(c, depth + 1); continue; }
      if (s.position === 'absolute' || s.position === 'fixed') continue;
      blocks.push({ el: label(c), text: (c.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 36), ...abs(c.getBoundingClientRect()) });
    }
  };
  walk(root, 0);
  const gaps = blocks.slice(1).map((b, i) => ({ from: blocks[i].el, to: b.el, gap: b.top - (blocks[i].top + blocks[i].h), at: b.top, text: b.text }));

  // text measure (characters per line) and a last word left alone on its line
  const measureRows = [], lone = [];
  for (const el of root.querySelectorAll('p, h1, h2, dd, dt, li, td, .answer')) {
    if (!vis(el)) continue;
    const text = el.innerText.replace(/\s+/g, ' ').trim(); if (text.length < 12) continue;
    const s = getComputedStyle(el), lh = parseFloat(s.lineHeight) || parseFloat(s.fontSize) * 1.5;
    const lines = Math.max(1, Math.round(el.getBoundingClientRect().height / lh));
    if (lines > 1) measureRows.push({ el: label(el), lines, cpl: Math.round(text.length / lines), size: parseFloat(s.fontSize), text: text.slice(0, 40) });
    // the last word alone on the last line
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let last = null, n;
    while ((n = walker.nextNode())) if (n.textContent.trim()) last = n;
    if (!last || lines < 2) continue;
    const words = [...last.textContent.matchAll(/\S+/g)]; if (words.length < 2) continue;
    const rect = m => { const r = document.createRange(); r.setStart(last, m.index); r.setEnd(last, m.index + m[0].length); return r.getBoundingClientRect(); };
    const a = rect(words[words.length - 2]), b = rect(words[words.length - 1]);
    if (Math.abs(a.top - b.top) > 4) lone.push({ el: label(el), word: words[words.length - 1][0], text: text.slice(0, 50) });
  }

  // where text starts on the right (RTL) and ends on the left: many different edges read as untidy
  const edges = {};
  for (const el of root.querySelectorAll('h1, h2, p, label, input, dl, table, .rank, .modes, .scale, .years, .crumbs, .tries, .hits, .facts')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect(); const k = Math.round(r.right);
    (edges[k] = edges[k] || []).push(label(el));
  }
  const colours = {};
  for (const el of root.querySelectorAll('*')) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el);
    if (ownText(el)) colours['text ' + s.color] = (colours['text ' + s.color] || 0) + 1;
    if (s.backgroundColor !== 'rgba(0, 0, 0, 0)') colours['fill ' + s.backgroundColor] = (colours['fill ' + s.backgroundColor] || 0) + 1;
    if (s.borderTopWidth !== '0px' && s.borderTopStyle !== 'none') colours[`border ${s.borderTopWidth} ${s.borderTopColor}`] = (colours[`border ${s.borderTopWidth} ${s.borderTopColor}`] || 0) + 1;
  }
  return { width: innerWidth, pageHeight: sc.scrollHeight, styles, gaps, measure: measureRows, lone, rightEdges: edges, colours };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let base = arg('--base'), server;
  if (!base) {
    const port = await freePort();
    server = spawn(process.execPath, [path.join(__dirname, 'serve.cjs'), String(port)], { stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 600));
    base = `http://localhost:${port}/`;
  }
  const places = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'site', 'data', 'places.json'), 'utf8')).places;
  const karrada = places.find(p => p.n === 'الكرادة' && p.k !== 'village');
  const village = places.filter(p => p.k === 'village' && p.f && p.f.t >= 10).sort((a, b) => b.f.t - a.f.t)[0];
  PAGES.find(p => p[0] === 'area')[1] = '#/p/' + encodeURIComponent(karrada.id);
  PAGES.find(p => p[0] === 'village')[1] = '#/p/' + encodeURIComponent(village.id);

  const browser = await chromium.launch({ args: GL });
  const report = { base, when: new Date().toISOString(), pages: {} };
  for (const v of VIEWS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.deviceScaleFactor, isMobile: !!v.isMobile, hasTouch: !!v.hasTouch, locale: 'ar-IQ' });
    const page = await ctx.newPage();
    await page.goto(base + '#/');
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
    for (const [name, hash] of PAGES) {
      await page.evaluate(h => { location.hash = h; }, hash);
      await page.waitForTimeout(3200);
      const m = await page.evaluate(measure);
      const shots = [];
      for (let y = 0, i = 0; y < m.pageHeight && i < 8; y += v.height * 0.85, i++) {
        await page.evaluate(`${SCROLLER}.scrollTop = ${y}`);
        await page.waitForTimeout(450);
        const f = path.join(OUT, `${v.name}-${name}-${i + 1}.png`);
        await page.screenshot({ path: f });
        shots.push(path.basename(f));
      }
      await page.evaluate(`${SCROLLER}.scrollTop = 0`);
      report.pages[`${v.name}/${name}`] = { hash, shots, ...m };
    }
    await ctx.close();
  }
  await browser.close();
  if (server) server.kill();
  fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify(report, null, 2));

  for (const [k, r] of Object.entries(report.pages)) {
    const gapSet = [...new Set(r.gaps.map(g => g.gap))].sort((a, b) => a - b);
    const longLines = r.measure.filter(m => m.cpl > 75 || m.cpl < 22).length;
    const faces = new Set(Object.keys(r.styles).map(s => s.split(' rgb')[0]));
    console.log(`${k}: ${faces.size} type styles (${Object.keys(r.styles).length} with colour), gaps ${gapSet.join(' ')} px, ${Object.keys(r.rightEdges).length} right edges, ` +
      `${r.lone.length} lone last words, ${longLines} lines outside 22-75 characters, ${r.shots.length} shots`);
  }
  console.log(`\naudit.json and screenshots: ${OUT}`);
})();
