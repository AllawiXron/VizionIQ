// node render.cjs: out/Ali-Ahmed-Shihab-CV.pdf (A4) and out/Ali-Ahmed-Shihab-CV.png (for Instagram DMs)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const out = path.join(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, 'cv.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(out, 'Ali-Ahmed-Shihab-CV.png') });
  await p.pdf({ path: path.join(out, 'Ali-Ahmed-Shihab-CV.pdf'), preferCSSPageSize: true, printBackground: true });
  await b.close();
})();
