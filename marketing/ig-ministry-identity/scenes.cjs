// node scenes.cjs -> plates/gate-front.png (1620x2025): the idea slide's photo with the gate traced, from scenes.html,
// with only pixels left in each file.
const { chromium } = require('playwright'); const path = require('path'); const { execFileSync } = require('child_process');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + path.join(__dirname, 'scenes.html'));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(800);
  for (const f of await p.$$('.f')) await f.screenshot({ path: path.join(__dirname, 'plates', (await f.getAttribute('data-name')) + '.png') });
  await b.close();
  execFileSync('python3', [path.join(__dirname, 'strip.py'), path.join(__dirname, 'plates')]);
})();
