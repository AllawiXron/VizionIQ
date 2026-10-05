// node slides.cjs -> out/ward-<n>.png (1080x1350 slides at 1.5x)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + path.join(__dirname, 'slides.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(500);
  for (let i = 1; i <= 10; i++) { await p.locator('#ward-' + i).screenshot({ path: path.join(__dirname, 'out', `ward-${i}.png`) }); console.log('ward-' + i); }
  await b.close();
})();
