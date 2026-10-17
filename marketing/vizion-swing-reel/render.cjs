// Renders reel.html (1080x1920, 30 fps).
//   node render.cjs                    -> frames/f_0000.png …  and out/timeline.json
//   node render.cjs --preview 0,0.65,1 -> out/preview-<t>.png only
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const pi = process.argv.indexOf('--preview');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'reel.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  const tl = await page.evaluate(() => window.TIMELINE);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'out', 'timeline.json'), JSON.stringify(tl, null, 1));
  if (pi > 0) {
    for (const t of process.argv[pi + 1].split(',').map(Number)) {
      await page.evaluate((t) => window.setTime(t), t);
      await page.screenshot({ path: path.join(__dirname, 'out', `preview-${t}.png`) });
    }
  } else {
    const dir = path.join(__dirname, 'frames');
    fs.mkdirSync(dir, { recursive: true });
    const n = Math.round(tl.duration * tl.fps);
    for (let f = 0; f < n; f++) {
      await page.evaluate((t) => window.setTime(t), f / tl.fps);
      await page.screenshot({ path: path.join(dir, `f_${String(f).padStart(4, '0')}.png`) });
    }
    console.log('frames', n, 'duration', tl.duration.toFixed(2));
  }
  await browser.close();
})();
