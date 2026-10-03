// Renders posts.html (6 brand posts × 2 slides).
//   node render.cjs            -> out/<brand>-1.png, out/<brand>-2.png (1620×2025)
//   node render.cjs --layers   -> also renders every slide layer by layer (1080×1350, transparent) into layers/,
//                                which build_psd.py turns into psd/<brand>-N.psd
// Needs Playwright (`npm i -D playwright`) and its Chromium.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const here = __dirname;
const url = 'file://' + path.join(here, 'posts.html');

async function open(browser, scale, width = 1200, height = 1400) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  return page;
}

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(here, 'out'), { recursive: true });

  const page = await open(browser, 1.5);
  const ids = await page.$$eval('.slide', (els) => els.map((e) => e.id));
  for (const id of ids) await page.locator('#' + id).screenshot({ path: path.join(here, 'out', `${id}.png`) });

  if (process.argv.includes('--layers')) {
    const dir = path.join(here, 'layers');
    fs.mkdirSync(dir, { recursive: true });
    const lp = await open(browser, 1, 1080, 1350);
    const manifest = [];
    for (const id of ids) {
      const works = await lp.$$eval(`#${id} .slot`, (els) => els.map((e) => e.dataset.work));
      const layers = [['bg', 'Background']];
      works.forEach((_, k) => layers.push([`slot-${k + 1}`, `PHOTO ${k + 1}`]));
      layers.push(['ui', 'Frames & UI'], ['txt', 'Text']);
      for (const [key] of layers) {
        await lp.evaluate(({ id, key }) => {
          const mode = key.startsWith('slot') ? 'slot' : key;
          document.body.className = 'export m-' + mode;
          document.querySelectorAll('.slide').forEach((s) => s.classList.toggle('on', s.id === id));
          document.querySelectorAll('.slot').forEach((s) => s.classList.remove('on'));
          if (mode === 'slot') document.querySelector(`#${id} .slot[data-i="${key.split('-')[1]}"]`).classList.add('on');
        }, { id, key });
        await lp.screenshot({ path: path.join(dir, `${id}-${key}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1350 } });
      }
      manifest.push({ id, layers, works });
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }
  await browser.close();
})();
