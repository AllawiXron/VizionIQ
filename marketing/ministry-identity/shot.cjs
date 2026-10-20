// node shot.cjs page.html out.png [width height]
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const [, , page, out, w = 1920, h = 1080] = process.argv;
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: +h } });
  await p.goto('file://' + path.resolve(page)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: true }); await b.close();
})();
