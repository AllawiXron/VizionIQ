// node shot.cjs -> tex/headline.png: the headline on a transparent background, for the wall in the 3D scene
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2600, height: 1400 } });
  await p.goto('file://' + path.join(__dirname, 'headline.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.locator('#headline').screenshot({ path: path.join(__dirname, 'tex/headline.png'), omitBackground: true });
  await b.close();
})();
