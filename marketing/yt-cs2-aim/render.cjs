// NODE_PATH=/opt/node-tools/node_modules node render.cjs -> out/raw.png (1920x1080), then python finish.py
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'thumb.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await p.waitForTimeout(300);
  await p.locator('#thumb').screenshot({ path: path.join(__dirname, 'out', 'raw.png') });
  await b.close();
})();
