// node print/art-hi.cjs -> print/tex/<id>-4x.png: the business card front and its foil mask at 60 px per mm, for close-ups
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 1200 }, deviceScaleFactor: 60 / 3.7795 });
  await p.goto('file://' + path.join(__dirname, 'art.html')); await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({ content: 'body { background: transparent !important; }' }); await p.waitForTimeout(300);
  for (const id of ['card-front', 'card-front-foil']) await (await p.$('#' + id)).screenshot({ path: path.join(__dirname, 'tex', id + '-4x.png'), omitBackground: true });
  await b.close();
})();
