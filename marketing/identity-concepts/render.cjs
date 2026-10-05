// node render.cjs assets  -> art/<name>.png  (white-on-transparent label and card artwork, 2x, for photo/mockups.py)
// node render.cjs slides  -> out/<name>.png  (the 1080x1350 presentation slides, 1.5x)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const here = (...p) => path.join(__dirname, ...p);

const ASSETS = [
  ['nada-label'], ['nada-label-wide'], ['nada-card'],
  ['nada-mini', 'nada-mini-jar', 'كريم الترطيب'], ['nada-mini', 'nada-mini-tube', 'غسول لطيف للوجه'], ['nada-mini', 'nada-mini-pump', 'سيروم الندى'],
  ['ward-label', 'ward-label-tube', 'كريم اليدين بالورد'], ['ward-label', 'ward-label-pump', 'غسول ماء الورد'],
  ['ward-card-front'], ['ward-card-back'],
];
const SLIDES = ['nada-1', 'nada-2', 'nada-3', 'nada-4', 'nada-5', 'ward-1', 'ward-2', 'ward-3', 'ward-4', 'ward-5'];

(async () => {
  const mode = process.argv[2] || 'slides';
  const b = await chromium.launch();
  if (mode === 'assets') {
    fs.mkdirSync(here('art'), { recursive: true });
    const p = await b.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 2 });
    await p.goto('file://' + here('assets.html'));
    await p.waitForFunction(() => document.body.dataset.ready === '1');
    for (const [id, name = id, text] of ASSETS) {
      if (text) await p.evaluate(([id, text]) => { document.querySelector(`#${id} [data-text]`).textContent = text; }, [id, text]);
      await p.locator('#' + id).screenshot({ path: here('art', name + '.png'), omitBackground: true });
      console.log('art/' + name + '.png');
    }
  } else {
    const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1.5 });
    await p.goto('file://' + here('identity.html'));
    await p.waitForFunction(() => document.body.dataset.ready === '1');
    await p.waitForTimeout(300);
    for (const id of SLIDES) {
      if (!(await p.locator('#' + id).count())) continue;
      await p.locator('#' + id).screenshot({ path: here('out', id + '.png') });
      console.log('out/' + id + '.png');
    }
  }
  await b.close();
})();
