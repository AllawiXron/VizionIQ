// node tex/render.cjs -> tex/sleeve.png, the cup sleeve artwork for the Blender scene
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2260, height: 500 } });
  await p.goto('file://' + path.join(__dirname, 'sleeve.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.locator('#s').screenshot({ path: path.join(__dirname, 'sleeve.png') });
  await b.close();
})();
