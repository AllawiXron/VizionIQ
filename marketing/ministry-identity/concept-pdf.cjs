// concept.html -> out/concept-ar.pdf (A4) and a preview PNG of each page in out/.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.join(__dirname, 'concept.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.pdf({ path: path.join(__dirname, 'out', 'concept-ar.pdf'), format: 'A4', printBackground: true });
  await b.close();
})();
