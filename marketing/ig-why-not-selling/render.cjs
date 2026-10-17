// node render.cjs -> out/why-1..6.png (1080x1350), one per .slide in slides.html
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'slides.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await p.waitForTimeout(300);
  const ids = await p.$$eval('.slide', (s) => s.map((e) => e.id));
  for (const [k, id] of ids.entries()) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `why-${k + 1}.png`) });
    console.log(`why-${k + 1}`);
  }
  await b.close();
})();
