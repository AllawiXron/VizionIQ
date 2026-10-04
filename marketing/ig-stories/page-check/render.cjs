// node render.cjs            -> out/01-call.png, out/03-wrap.png and out/02-review-<name>.png for every reviews/<name>.json
// node render.cjs --layers   -> also layers/<story>/*.png at 1x for build_psd.py
// Stories are 1080×1920, rendered at 1.5x. The demo screenshot (shots/demo-cafe.png) is drawn from mock-profile.html.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const here = (...p) => path.join(__dirname, ...p);
const LAYERS = [['bg', 'Paper + ring'], ['photo', 'Photo / screenshot'], ['ui', 'Marks & layer UI'], ['txt', 'Text'], ['grain', 'Grain']];

(async () => {
  const browser = await chromium.launch();
  for (const d of ['out', 'shots']) fs.mkdirSync(here(d), { recursive: true });

  // the made-up page used in the examples
  const mp = await browser.newPage({ viewport: { width: 1080, height: 2340 } });
  await mp.goto('file://' + here('mock-profile.html'));
  await mp.evaluate(() => document.fonts.ready);
  await mp.waitForTimeout(300);
  await mp.locator('#shot').screenshot({ path: here('shots', 'demo-cafe.png') });

  const jobs = [['s1', '01-call', null], ['s3', '03-wrap', null]];
  for (const f of fs.readdirSync(here('reviews')).filter((f) => f.endsWith('.json')).sort())
    jobs.push(['s2', '02-review-' + f.replace(/\.json$/, ''), JSON.parse(fs.readFileSync(here('reviews', f), 'utf8'))]);

  const layers = process.argv.includes('--layers');
  for (const [scale, kind] of [[1.5, 'out'], ...(layers ? [[1, 'layers']] : [])]) {
    const page = await browser.newPage({ viewport: { width: 1200, height: 2000 }, deviceScaleFactor: scale });
    await page.goto('file://' + here('stories.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    for (const [id, name, data] of jobs) {
      if (data) await page.evaluate((d) => window.renderReview(d), data);
      await page.waitForTimeout(150);
      if (kind === 'out') { await page.locator('#' + id).screenshot({ path: here('out', name + '.png') }); continue; }
      const dir = here('layers', name);
      fs.mkdirSync(dir, { recursive: true });
      for (const [key] of LAYERS) {
        await page.evaluate(([id, key]) => {
          document.body.className = 'export m-' + key;
          document.querySelectorAll('.story').forEach((el) => { el.style.display = el.id === id ? '' : 'none'; });
        }, [id, key]);
        await page.screenshot({ path: path.join(dir, key + '.png'), omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
      }
      await page.evaluate(() => { document.body.className = ''; document.querySelectorAll('.story').forEach((el) => { el.style.display = ''; }); });
      fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(LAYERS));
    }
  }
  await browser.close();
})();
