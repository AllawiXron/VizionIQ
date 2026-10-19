// node render.cjs -> out/diy-haircut.png (1080x1350) and out/diy-haircut.jpg
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'post.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await p.waitForTimeout(300);
  await p.locator('#post').screenshot({ path: path.join(__dirname, 'out', 'diy-haircut.png') });
  await b.close();
})();
