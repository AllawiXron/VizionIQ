// node render.cjs [page.html] -> out/<id>.png for every .art on the page
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const page = process.argv[2] || 'offer.html';
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 6000, height: 2100 } });
  await p.goto('file://' + path.join(__dirname, page));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  const prefix = path.basename(page, '.html');
  for (const id of await p.$$eval('.art', (a) => a.map((e) => e.id))) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `${prefix}-${id}.png`) });
    console.log(`${prefix}-${id}`);
  }
  await b.close();
})();
