// node shoot.cjs -> coin_height.png (the coin face height map, from coin_face.html)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
  await p.goto('file://' + path.join(__dirname, 'coin_face.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(300);
  await p.locator('#face').screenshot({ path: path.join(__dirname, 'coin_height.png') });
  await b.close();
})();
