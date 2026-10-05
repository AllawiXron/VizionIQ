// node render-theme.cjs -> out/messi-a.png, out/messi-b.png (1080x1350)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2300, height: 1450 } });
  await p.goto('file://' + path.join(__dirname, 'theme.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  for (const id of ['a', 'b']) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `messi-${id}.png`) });
    console.log(id);
  }
  await b.close();
})();
