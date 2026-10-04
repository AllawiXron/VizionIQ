// node render.cjs           -> out/<name>.png at 1.5x (1620×2025 posts, 1620×2880 story)
// node render.cjs --layers  -> also layers/<name>/*.png at 1x (transparent) for build_psd.py
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const url = 'file://' + path.join(__dirname, 'posts.html');
const DESIGNS = [['p1', 'alshifa-offer', 1350], ['p2', 'alshifa-vitamin-d', 1350], ['st', 'alshifa-offer-story', 1920]];
const LAYERS = [['bg', 'Teal + grid'], ['photo', 'Hand (photo)'], ['card', 'Card'], ['txt', 'Headline & footer'], ['logo', 'Logo'], ['grain', 'Grain']];

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const page = await browser.newPage({ viewport: { width: 1200, height: 1400 }, deviceScaleFactor: 1.5 });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  for (const [id, name] of DESIGNS) await page.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', name + '.png') });

  if (process.argv.includes('--layers')) {
    const lp = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    await lp.goto(url);
    await lp.evaluate(() => document.fonts.ready);
    await lp.waitForTimeout(500);
    for (const [id, name, h] of DESIGNS) {
      const dir = path.join(__dirname, 'layers', name);
      fs.mkdirSync(dir, { recursive: true });
      for (const [key] of LAYERS) {
        // show one design at the top of the page, one layer at a time
        await lp.evaluate(([id, key]) => {
          document.body.className = 'export m-' + key;
          document.querySelectorAll('.ad').forEach((el) => { el.style.display = el.id === id ? '' : 'none'; });
        }, [id, key]);
        await lp.screenshot({ path: path.join(dir, `${key}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: h } });
      }
      fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(LAYERS));
    }
  }
  await browser.close();
})();
