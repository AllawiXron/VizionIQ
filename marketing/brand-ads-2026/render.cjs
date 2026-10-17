// node render.cjs [name ...]  -> out/<name>.png (1620x2025) for each <name>.html (default: every page in this folder).
// Each page is a 1080x1350 #ad that sets document.body.dataset.ready = '1' once its fonts and images are in.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const names = process.argv.slice(2).length ? process.argv.slice(2) : fs.readdirSync(__dirname).filter((f) => f.endsWith('.html')).map((f) => f.slice(0, -5));
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1180, height: 1450 }, deviceScaleFactor: 1.5 });
  for (const n of names) {
    await page.goto('file://' + path.join(__dirname, n + '.html'));
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
    await page.waitForTimeout(250);
    await page.locator('#ad').screenshot({ path: path.join(__dirname, 'out', n + '.png') });
    console.log(n);
  }
  await browser.close();
})();
