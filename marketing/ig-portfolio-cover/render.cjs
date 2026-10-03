// Renders carousel.html.
//   node render.cjs            -> out/slide-01.png … slide-06.png (1620×2025, placeholders or your works/ photos)
//   node render.cjs --layers   -> also renders every slide layer by layer (1080×1350, transparent) into layers/,
//                                which build_psd.py turns into psd/slide-0N.psd
// Needs Playwright (`npm i -D playwright`) and its Chromium.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const here = __dirname;
const url = 'file://' + path.join(here, 'carousel.html');
const pad = (n) => String(n).padStart(2, '0');

async function open(browser, scale, width = 1200, height = 1400) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: scale });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);
  return page;
}

(async () => {
  const browser = await chromium.launch();
  fs.mkdirSync(path.join(here, 'out'), { recursive: true });

  const page = await open(browser, 1.5);
  const count = await page.locator('.slide').count();
  for (let i = 1; i <= count; i++) {
    await page.locator('#s' + i).screenshot({ path: path.join(here, 'out', `slide-${pad(i)}.png`) });
  }

  if (process.argv.includes('--layers')) {
    const dir = path.join(here, 'layers');
    fs.mkdirSync(dir, { recursive: true });
    // viewport = one slide, so each layer render lines up with the canvas exactly
    const lp = await open(browser, 1, 1080, 1350);
    const manifest = [];
    for (let i = 1; i <= count; i++) {
      const slots = await lp.locator(`#s${i} .slot`).count();
      const layers = [['bg', 'Background']];
      for (let k = 1; k <= slots; k++) layers.push([`slot-${k}`, `PHOTO ${k}`]);
      layers.push(['ui', 'Frames & UI'], ['txt', 'Text']);
      for (const [key] of layers) {
        await lp.evaluate(({ i, key }) => {
          const mode = key.startsWith('slot') ? 'slot' : key;
          document.body.className = 'export m-' + mode;
          document.querySelectorAll('.slide').forEach((s) => s.classList.toggle('on', s.id === 's' + i));
          document.querySelectorAll('.slot').forEach((s) => s.classList.remove('on'));
          if (mode === 'slot') document.querySelector(`#s${i} .slot[data-i="${key.split('-')[1]}"]`).classList.add('on');
        }, { i, key });
        await lp.screenshot({
          path: path.join(dir, `s${pad(i)}-${key}.png`),
          omitBackground: true,
          clip: { x: 0, y: 0, width: 1080, height: 1350 },
        });
      }
      manifest.push({ slide: i, layers });
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  await browser.close();
})();
