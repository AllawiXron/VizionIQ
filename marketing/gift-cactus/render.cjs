// node render.cjs -> out/<id>.png for every .art on kit.html, plus out/sheet.jpg (all boards scaled down)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 4700, height: 2000 } });
  await p.goto('file://' + path.join(__dirname, 'kit.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  for (const id of await p.$$eval('.art', (a) => a.map((e) => e.id))) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `${id}.png`) });
    console.log(id);
  }
  await b.close();
})();
