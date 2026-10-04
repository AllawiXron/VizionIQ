// node render.cjs           -> out/miswag-white-friday-1.png, -2.png (1620×2025)
// node render.cjs --layers  -> also layers/<name>/*.png at 1x for build_psd.py
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const url = 'file://' + path.join(__dirname, 'ads.html');
const DESIGNS = [['c1', 'miswag-white-friday-1'], ['c2', 'miswag-white-friday-2']];
const LAYERS = [['bg', 'Background'], ['photo', '3D render'], ['card', 'Order card'], ['txt', 'Headline & footer'], ['logo', 'Logo'], ['grain', 'Grain']];

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1440 }, deviceScaleFactor: 1.5 });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  for (const [id, name] of DESIGNS) await page.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', name + '.png') });
  if (process.argv.includes('--layers')) {
    const lp = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
    await lp.goto(url);
    await lp.evaluate(() => document.fonts.ready);
    await lp.waitForTimeout(400);
    for (const [id, name] of DESIGNS) {
      const dir = path.join(__dirname, 'layers', name);
      fs.mkdirSync(dir, { recursive: true });
      for (const [key] of LAYERS) {
        await lp.evaluate(([id, key]) => {
          document.body.className = 'export m-' + key;
          document.querySelectorAll('.ad').forEach((el) => { el.style.display = el.id === id ? '' : 'none'; });
        }, [id, key]);
        await lp.screenshot({ path: path.join(dir, key + '.png'), omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
      }
      fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(LAYERS));
    }
  }
  await browser.close();
})();
