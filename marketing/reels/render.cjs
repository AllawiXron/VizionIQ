// Renders reel.html to an Instagram/TikTok Reel (1080x1920, 30 fps).
//   node render.cjs [ad]                 -> frames/<ad>/f_0000.png …, then make.sh encodes out/<ad>-reel.mp4
//   node render.cjs [ad] --preview 0,3,8 -> out/<ad>-preview-<t>.png only
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const ad = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'sala';
const pi = process.argv.indexOf('--preview');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.join(__dirname, 'reel.html') + '?ad=' + ad);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map((i) => i.decode().catch(() => {}))));
  await page.waitForTimeout(300);
  const tl = await page.evaluate(() => window.TIMELINE);
  fs.writeFileSync(path.join(__dirname, 'out', `${ad}-timeline.json`), JSON.stringify(tl, null, 1));
  if (pi > 0) {
    for (const t of process.argv[pi + 1].split(',').map(Number)) {
      await page.evaluate((t) => window.setTime(t), t);
      await page.screenshot({ path: path.join(__dirname, 'out', `${ad}-preview-${t}.png`) });
    }
  } else {
    const dir = path.join(__dirname, 'frames', ad);
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
