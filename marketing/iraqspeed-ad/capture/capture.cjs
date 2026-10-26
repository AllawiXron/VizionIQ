// The live site, captured for the ad: the phone at 3x (home, typing الكرادة, Karrada's page and its map, the
// governorates) and a desktop window at 2x. NODE_PATH=/opt/node-tools/node_modules node capture/capture.cjs
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, 'shots'), URL = 'https://iraqspeed.vercel.app/';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ready = p => p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 90000 });
  // phone
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await p.route('**/api/stats', r => r.abort());          // no live numbers in the ad: they would be out of date tomorrow
  await p.goto(URL + '#/'); await ready(p); await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, 'm-home.png') });
  await p.screenshot({ path: path.join(OUT, 'm-home-full.png'), fullPage: true });
  const boxes = {};
  boxes.search = await p.evaluate(() => { const r = document.querySelector('.search .box').getBoundingClientRect(); return [r.left, r.top + scrollY, r.width, r.height]; });
  await p.evaluate(() => document.querySelector('.search').scrollIntoView({ block: 'start' }));
  await p.waitForTimeout(400);
  const word = 'الكرادة';
  for (let i = 1; i <= word.length; i++) { await p.fill('#q', word.slice(0, i)); await p.waitForTimeout(300); }
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(OUT, 'm-search.png') });
  boxes.searchView = await p.evaluate(() => { const r = document.querySelector('.search .box').getBoundingClientRect(); const h = document.querySelector('#hits a').getBoundingClientRect(); return { box: [r.left, r.top, r.width, r.height], hit: [h.left, h.top, h.width, h.height] }; });
  await p.press('#q', 'Enter');
  await p.waitForTimeout(6000);
  await p.screenshot({ path: path.join(OUT, 'm-karrada.png') });
  await p.screenshot({ path: path.join(OUT, 'm-karrada-full.png'), fullPage: true });
  boxes.karrada = await p.evaluate(() => {
    const y = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left, r.top + scrollY, r.width, r.height]; };
    return { answer: y('.answer'), plate: y('.plate'), compare: y('.compare'), height: document.documentElement.scrollHeight };
  });
  await p.goto(URL + '#/govs'); await p.waitForTimeout(2500);
  await p.screenshot({ path: path.join(OUT, 'm-govs.png') });
  await p.close();
  // desktop
  const d = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await d.route('**/api/stats', r => r.abort());
  await d.goto(URL + '#/'); await ready(d); await d.waitForTimeout(1500);
  await d.screenshot({ path: path.join(OUT, 'd-home.png') });
  await d.goto(URL + '#/p/r2964648'); await d.waitForTimeout(7000);
  await d.screenshot({ path: path.join(OUT, 'd-karrada.png') });
  await d.close();
  fs.writeFileSync(path.join(OUT, 'boxes.json'), JSON.stringify(boxes, null, 1));
  console.log(JSON.stringify(boxes));
  await b.close();
})();
