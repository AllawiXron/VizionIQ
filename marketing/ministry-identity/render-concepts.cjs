// Renders each .board of concepts.html to out/concept-a.png, -b, -c.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'concepts.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const boards = await p.$$('.board');
  for (let i = 0; i < boards.length; i++) await boards[i].screenshot({ path: path.join(__dirname, 'out', `concept-gate.png`) });
  await b.close();
})();
