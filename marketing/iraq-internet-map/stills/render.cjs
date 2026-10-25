// node stills/render.cjs -> out/still-1-country.png, out/still-2-karrada.png, out/still-3-exams.png (1170 x 2532 each)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const out = path.join(__dirname, '..', 'out');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const p = await b.newPage({ viewport: { width: 1400, height: 940 }, deviceScaleFactor: 3 });
  await p.goto('file://' + path.join(__dirname, 'screens.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  const names = { hero: 'still-1-country', bgd: 'still-2-karrada', exam: 'still-3-exams' };
  for (const [id, name] of Object.entries(names)) {
    await p.locator('#' + id).screenshot({ path: path.join(out, name + '.png') });
  }
  await b.close();
})();
