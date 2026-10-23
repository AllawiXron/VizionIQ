// End-to-end check of the site in a real browser: every page and interaction on phone, tablet and desktop,
// with screenshots, console errors, failed requests, layout and Arabic text checks, and load time on slow 4G.
// NODE_PATH=/opt/node-tools/node_modules node build/check.cjs [--out dir] [--base url] [--no-range]
// Without --base it starts build/serve.cjs on a free port (with --no-range it behaves like a host without range requests).
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path'), net = require('net');

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(require('os').tmpdir(), 'iraq-map-check')));
const VIEWS = [
  { name: 'phone', width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'tablet', width: 820, height: 1180, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];
const GL = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];

const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });

// checks that run inside the page and return plain findings
function pageChecks() {
  const out = [];
  const W = innerWidth;
  if (document.documentElement.scrollWidth > W + 1) out.push({ kind: 'horizontal-scroll', detail: `page is ${document.documentElement.scrollWidth}px wide in a ${W}px window` });
  const vis = el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const textOf = el => [...el.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
  for (const el of document.querySelectorAll('#page *, .bar *')) {
    if (!vis(el)) continue;
    const s = getComputedStyle(el), r = el.getBoundingClientRect(), t = textOf(el);
    if (t && parseFloat(s.fontSize) < 12) out.push({ kind: 'tiny-text', detail: `${parseFloat(s.fontSize)}px: ${t.slice(0, 60)}` });
    if (t && (s.overflow === 'hidden' || s.textOverflow === 'ellipsis') && el.scrollWidth > el.clientWidth + 1)
      out.push({ kind: 'clipped-text', detail: t.slice(0, 80) });
    if (r.right > W + 1 || r.left < -1) out.push({ kind: 'off-screen', detail: `${el.tagName.toLowerCase()}.${el.className}: ${(t || el.textContent).trim().slice(0, 60)}` });
  }
  if (matchMedia('(pointer: coarse)').matches) {
    for (const el of document.querySelectorAll('a, button, input')) {
      if (!vis(el)) continue;
      const r = el.getBoundingClientRect();
      if (r.height < 28 && r.width < 200) out.push({ kind: 'small-tap-target', detail: `${Math.round(r.width)}x${Math.round(r.height)}: ${el.textContent.trim().slice(0, 40) || el.getAttribute('aria-label') || el.tagName}` });
    }
  }
  for (const el of document.querySelectorAll('input')) if (!el.labels.length && !el.getAttribute('aria-label')) out.push({ kind: 'unlabelled-input', detail: el.id || el.name });
  const text = document.getElementById('page').innerText;
  const dia = text.match(/[ً-ْ]/g); if (dia) out.push({ kind: 'diacritics', detail: `${dia.length} marks` });
  if (/[«»]/.test(text)) out.push({ kind: 'guillemets', detail: 'quotation marks the user does not want' });
  // two separate numbers side by side read as one in Arabic (bidi joins digits across a space or comma)
  for (const m of text.matchAll(/[٠-٩]+[ ،,]+[٠-٩]+/g)) {
    const s = m[0];
    if (/^[٠-٩]+٬[٠-٩]+$/.test(s)) continue;
    out.push({ kind: 'numbers-touching', detail: text.slice(Math.max(0, m.index - 25), m.index + s.length + 25).replace(/\s+/g, ' ') });
  }
  for (const m of text.matchAll(/[A-Za-z][A-Za-z .®-]{2,}/g)) out.push({ kind: 'latin-text', detail: m[0].trim() });
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  let base = arg('--base'), server;
  if (!base) {
    const port = await freePort();
    server = spawn(process.execPath, [path.join(__dirname, 'serve.cjs'), String(port), ...(process.argv.includes('--no-range') ? ['--no-range'] : [])], { stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 600));
    base = `http://localhost:${port}/`;
  }
  const places = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'site', 'data', 'places.json'), 'utf8'));
  const karrada = places.places.find(p => p.n === 'الكرادة' && p.k !== 'village');
  const browser = await chromium.launch({ args: GL });
  const report = { base, when: new Date().toISOString(), views: {} };

  for (const v of VIEWS) {
    const ctx = await browser.newContext({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.deviceScaleFactor, isMobile: !!v.isMobile, hasTouch: !!v.hasTouch, locale: 'ar-IQ' });
    const page = await ctx.newPage();
    const R = report.views[v.name] = { errors: [], failed: [], steps: [], findings: {}, shots: [], bytes: {} };
    page.on('pageerror', e => R.errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') R.errors.push(m.text().slice(0, 300)); });
    page.on('requestfailed', r => R.failed.push(`${r.url().replace(base, '')} ${r.failure() && r.failure().errorText}`));
    page.on('response', async r => {
      const u = r.url().replace(base, '');
      if (!/tiles\/|data\//.test(u)) return;
      const len = +(r.headers()['content-length'] || 0);
      R.bytes[u] = (R.bytes[u] || 0) + len;
    });
    let n = 0;
    const shot = async (label, opts = {}) => {
      const f = path.join(OUT, `${v.name}-${String(++n).padStart(2, '0')}-${label}.png`);
      await page.screenshot({ path: f, ...opts });
      R.shots.push(f);
    };
    const step = async (label, fn) => {
      const t0 = Date.now();
      try { const note = await fn(); R.steps.push({ step: label, ok: true, ms: Date.now() - t0, ...(note ? { note } : {}) }); }
      catch (e) { R.steps.push({ step: label, ok: false, ms: Date.now() - t0, error: String(e.message || e).split('\n')[0] }); await shot('failed-' + label.replace(/\W+/g, '-')).catch(() => {}); }
    };
    const checks = async label => { R.findings[label] = await page.evaluate(pageChecks); };
    const scrollShots = async label => {
      // viewport-sized pictures down the page; a full-page capture would stretch the map, whose height follows the window
      const h = await page.evaluate(() => (innerWidth >= 900 ? document.getElementById('page').scrollHeight : document.documentElement.scrollHeight));
      for (let y = 0, i = 0; y < h && i < 6; y += v.height * 0.9, i++) {
        await page.evaluate(y => { innerWidth >= 900 ? (document.getElementById('page').scrollTop = y) : scrollTo(0, y); }, y);
        await page.waitForTimeout(500);
        await shot(`${label}-${i + 1}`);
      }
      await page.evaluate(() => { innerWidth >= 900 ? (document.getElementById('page').scrollTop = 0) : scrollTo(0, 0); });
    };
    const go = async (hash, wait = 3000) => { await page.evaluate(h => { location.hash = h; }, hash); await page.waitForTimeout(wait); };

    await step('home loads', async () => {
      const t0 = Date.now();
      await page.goto(base + '#/');
      await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
      const ready = Date.now() - t0;
      await page.waitForTimeout(3500);
      return `ready in ${ready} ms`;
    });
    await checks('home');
    await scrollShots('home');

    await step('search finds الكرادة and Enter opens it', async () => {
      await page.fill('#q', 'كرادة');
      await page.waitForTimeout(400);
      const hits = await page.$$eval('.hits a', as => as.map(a => a.innerText.replace(/\s+/g, ' ').trim()));
      if (!hits.length) throw new Error('no results');
      await shot('search');
      await page.press('#q', 'Enter');
      await page.waitForTimeout(3500);
      const h1 = await page.$eval('.h1', e => e.innerText);
      if (!/كرادة/.test(h1)) throw new Error('opened ' + h1);
      return hits.slice(0, 4).join(' | ');
    });
    await step('place page says its number and the data agrees', async () => {
      const answer = await page.$eval('.answer', e => e.innerText);
      const want = new Intl.NumberFormat('ar-IQ-u-nu-arab').format(Math.round(karrada.f.d));
      if (!answer.includes(want)) throw new Error(`answer "${answer}" does not show ${want}`);
      return answer;
    });
    await checks('place');
    await scrollShots('place');

    await step('mode switch changes the numbers', async () => {
      const before = await page.$eval('.answer', e => e.innerText);
      await page.click('.modes button[data-mode="m"]');
      await page.waitForTimeout(2500);
      const after = await page.$eval('.answer', e => e.innerText);
      await shot('place-mobile');
      await page.click('.modes button[data-mode="f"]');
      await page.waitForTimeout(800);
      if (before === after) throw new Error('answer did not change');
      return after;
    });
    await step('tap a street shows its square', async () => {
      const box = await page.evaluate(() => { const m = document.getElementById('map').getBoundingClientRect(); return { x: m.left + m.width / 2, y: m.top + m.height / 2, top: m.top }; });
      if (box.top > v.height * 0.7) { await page.evaluate(() => document.querySelector('#page .mapslot, #map').scrollIntoView({ block: 'center' })); await page.waitForTimeout(600); }
      const b2 = await page.evaluate(() => { const m = document.getElementById('map').getBoundingClientRect(); return { x: m.left + m.width / 2, y: m.top + m.height / 2 }; });
      await page.mouse.click(b2.x, b2.y);
      await page.waitForTimeout(900);
      const t = await page.$eval('#readout', e => e.hidden ? '' : e.innerText);
      await shot('tap');
      if (!t) throw new Error('no readout after a tap');
      return t.replace(/\s+/g, ' ');
    });
    await step('full screen map opens and closes', async () => {
      await page.click('#fullbtn');
      await page.waitForTimeout(800);
      const full = await page.evaluate(() => { const r = document.getElementById('mapwrap').getBoundingClientRect(); return [r.width, r.height]; });
      await shot('fullscreen');
      await page.click('#fullbtn');
      await page.waitForTimeout(500);
      if (full[0] < v.width - 2 || full[1] < v.height - 2) throw new Error('map is ' + full.join('x'));
    });
    await step('governorate page', async () => {
      await go('#/g/baghdad', 3500);
      const a = await page.$eval('.answer', e => e.innerText);
      return a;
    });
    await checks('governorate');
    await scrollShots('governorate');
    await step('browser back returns to the area', async () => {
      await page.goBack();
      await page.waitForTimeout(2500);
      const h1 = await page.$eval('.h1', e => e.innerText);
      return h1;
    });
    await step('exams page and tapping a day', async () => {
      await go('#/exams', 1500);
      await page.click('.ex-year .ex-row[data-i="4"]');
      await page.waitForTimeout(300);
      const t = await page.$eval('.ex-year .ex-day', e => e.innerText);
      if (!/[٠-٩]:[٠-٩]/.test(t)) throw new Error('no times after tapping: ' + t);
      return t;
    });
    await checks('exams');
    await scrollShots('exams');
    await step('about page', async () => { await go('#/about', 1200); });
    await checks('about');
    await scrollShots('about');
    await step('search with no match explains itself', async () => {
      await go('#/', 2500);
      await page.fill('#q', 'زززز');
      await page.waitForTimeout(400);
      return await page.$eval('.hits', e => e.innerText.trim());
    });
    await ctx.close();
  }

  // slow 4G on a phone: how long until the country map has its first lights
  if (!process.argv.includes('--fast')) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8 });
    let bytes = 0;
    page.on('response', async r => { bytes += +(r.headers()['content-length'] || 0); });
    const t0 = Date.now();
    await page.goto(base + '#/');
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 120000 }).catch(() => {});
    const ready = Date.now() - t0;
    await page.waitForTimeout(8000);
    const f = path.join(OUT, 'slow4g-home.png');
    await page.screenshot({ path: f });
    report.slow4g = { readyMs: ready, bytesAfter8s: bytes, shot: f };
    await ctx.close();
  }

  await browser.close();
  if (server) server.kill();
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(report, null, 2));
  for (const [name, R] of Object.entries(report.views)) {
    console.log(`\n== ${name}`);
    for (const s of R.steps) console.log(`${s.ok ? 'ok  ' : 'FAIL'} ${s.step} (${s.ms} ms)${s.note ? ': ' + s.note : ''}${s.error ? ': ' + s.error : ''}`);
    for (const [where, fs2] of Object.entries(R.findings)) {
      const counts = {};
      for (const f of fs2) counts[f.kind] = (counts[f.kind] || 0) + 1;
      if (fs2.length) console.log(`  ${where}: ${Object.entries(counts).map(([k, c]) => `${k} x${c}`).join(', ')}`);
    }
    if (R.errors.length) console.log('  console errors:', R.errors.slice(0, 5).join(' | '));
    if (R.failed.length) console.log('  failed requests:', R.failed.slice(0, 5).join(' | '));
  }
  if (report.slow4g) console.log(`\n== slow 4G phone: ready in ${report.slow4g.readyMs} ms, ${(report.slow4g.bytesAfter8s / 1e6).toFixed(1)} MB in the first 8 s after ready`);
  console.log(`\nreport and screenshots: ${OUT}`);
})();
