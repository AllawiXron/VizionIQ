// node textures.cjs [id...] -> tex/<id>.png (white on transparent; the renders use the alpha as foil or ink)
const { chromium } = require('playwright');
const path = require('path');
const IDS = ['samoon-lid', 'amba-label', 'amba-box', 'istikan-tin', 'dolma-lid'];
(async () => {
  const only = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2500, height: 2000 } });
  await p.goto('file://' + path.join(__dirname, 'textures.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  for (const id of IDS) {
    if (only.length && !only.includes(id)) continue;
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'tex', id + '.png'), omitBackground: true });
    console.log(id);
  }
  await b.close();
})();
