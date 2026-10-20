// node print/art.cjs -> print/tex/<id>.png: each .art element of art.html at 15 px per mm (about 380 dpi)
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const out = path.join(__dirname, 'tex'); fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 15 / 3.7795 });
  await p.goto('file://' + path.join(__dirname, 'art.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  for (const el of await p.$$('.art')) { const id = await el.getAttribute('id'); await el.screenshot({ path: path.join(out, id + '.png') }); console.log(id); }
  await b.close();
})();
