// NODE_PATH=/opt/node-tools/node_modules node stills/render.cjs -> stills/still-1..3.png and stills/stills.jpg (side by side)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, '..', 'index.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  for (const [i, pose] of [[1, 'S1'], [2, 'S2'], [3, 'S3']]) {
    await p.evaluate((n) => window.__still(n), pose);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(__dirname, `still-${i}.png`) });
  }
  await b.close();
})();
