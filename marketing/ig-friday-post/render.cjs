// NODE_PATH=/opt/node-tools/node_modules node render.cjs -> out/friday.png and out/friday.jpg (1080×1350)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  await p.goto('file://' + path.join(__dirname, 'post.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await p.waitForTimeout(300);
  await p.locator('#post').screenshot({ path: path.join(__dirname, 'out', 'friday.png') });
  await b.close();
})();
