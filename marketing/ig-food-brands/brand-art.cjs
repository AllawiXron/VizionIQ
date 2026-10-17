// node brand-art.cjs -> art/<brand>.png (white on transparent)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1700, height: 1200 } });
  await p.goto('file://' + path.join(__dirname, 'brand-art.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  for (const id of ['samoon', 'istikan', 'amba', 'dolma']) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'art', id + '.png'), omitBackground: true });
    console.log(id);
  }
  await b.close();
})();
