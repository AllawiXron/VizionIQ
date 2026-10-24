// node render.cjs -> out/tips-1..10.png (1080x1350), one per .slide in slides.html. Needs renders/ from studio.py.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2400, height: 1500 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'slides.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await p.waitForTimeout(400);
  const ids = await p.$$eval('.slide', (s) => s.map((e) => e.id));
  for (const [k, id] of ids.entries()) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `tips-${k + 1}.png`) });
    console.log(`tips-${k + 1}`);
  }
  await b.close();
})();
