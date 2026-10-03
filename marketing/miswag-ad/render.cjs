// node render.cjs           -> out/miswag-ad.png (1620×2025)
// node render.cjs --layers  -> also layers/*.png (1080×1350, transparent) for build_psd.py
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const url = 'file://' + path.join(__dirname, 'ad.html');
const LAYERS = [['bg', 'Photo (1932, graded) + shade'], ['card', 'Order card'], ['txt', 'Headline & footer'], ['logo', 'Logo']];

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1440 }, deviceScaleFactor: 1.5 });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  await page.locator('#ad').screenshot({ path: path.join(__dirname, 'out', 'miswag-ad.png') });

  if (process.argv.includes('--layers')) {
    const dir = path.join(__dirname, 'layers');
    fs.mkdirSync(dir, { recursive: true });
    const lp = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
    await lp.goto(url);
    await lp.evaluate(() => document.fonts.ready);
    await lp.waitForTimeout(400);
    for (const [key] of LAYERS) {
      await lp.evaluate((key) => { document.body.className = 'export m-' + key; }, key);
      await lp.screenshot({ path: path.join(dir, `${key}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(LAYERS));
  }
  await browser.close();
})();
