// node slides.cjs -> out/mistakes-<n>.png (1080x1350, the Instagram portrait size)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
  await p.goto('file://' + path.join(__dirname, 'slides.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  for (let i = 1; i <= 6; i++) {
    await p.locator('#s' + i).screenshot({ path: path.join(__dirname, 'out', `mistakes-${i}.png`) });
    console.log('mistakes-' + i);
  }
  await b.close();
})();
