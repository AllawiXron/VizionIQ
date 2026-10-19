// NODE_PATH=/opt/node-tools/node_modules node stills/render.cjs -> stills/still-1..3.png (three moments of index.html);
// then tile them into stills/stills.jpg with ffmpeg (see README)
const { chromium } = require('playwright');
const path = require('path');
const TIMES = [1.8, 12.0, 21.0];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, '..', 'index.html'), { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  for (const [i, t] of TIMES.entries()) {
    await p.evaluate((t) => window.__timelines.main.seek(t, false), t);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(__dirname, `still-${i + 1}.png`) });
  }
  await b.close();
})();
