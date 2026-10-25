// node render.cjs [page] -> out/<id>.png (1080x1350) for every .f in the page (slides.html by default)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const page = process.argv[2] || 'v2/slides.html';
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 3600, height: 1500 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, page));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await p.waitForTimeout(300);
  for (const id of await p.$$eval('.f', (s) => s.map((e) => e.id))) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `${id}.png`) });
    console.log(id);
  }
  await b.close();
})();
