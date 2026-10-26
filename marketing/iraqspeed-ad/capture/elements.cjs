// Single parts of the live site at 3x, each on its own, to float as cards in the ad.
// NODE_PATH=/opt/node-tools/node_modules node capture/elements.cjs
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, 'shots'), URL = 'https://iraqspeed.vercel.app/';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await p.route('**/api/stats', r => r.abort());
  const shot = async (sel, name, pad = 0) => {
    const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(700);
    const bb = await el.boundingBox();
    await p.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: Math.max(0, bb.x - pad), y: bb.y - pad, width: Math.min(390, bb.width + 2 * pad), height: bb.height + 2 * pad } });
    console.log(name, Math.round(bb.width), Math.round(bb.height));
  };
  await p.goto(URL + '#/'); await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 90000 }); await p.waitForTimeout(1500);
  await shot('.govmap', 'e-govmap', 6);
  await shot('.iraq .answer', 'e-iraq', 6);
  await shot('.search .box', 'e-search-empty', 4);
  await p.locator('.search').scrollIntoViewIfNeeded();
  await p.fill('#q', 'الكرادة'); await p.waitForTimeout(900);
  const box = await p.locator('.search .box').boundingBox(), hits = await p.locator('#hits').boundingBox();
  await p.screenshot({ path: path.join(OUT, 'e-search-hits.png'), clip: { x: 14, y: box.y - 4, width: 362, height: hits.y + hits.height - box.y + 10 } });
  console.log('search-hits', hits.height);
  await p.goto(URL + '#/p/r2964648'); await p.waitForTimeout(3000);
  await shot('.answer', 'e-karrada', 6);
  await shot('.plate', 'e-karrada-map', 0);
  await p.waitForTimeout(5000);
  await shot('.plate', 'e-karrada-map', 0);
  await shot('.compare', 'e-compare', 6);
  await b.close();
})();
