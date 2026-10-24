// node render.cjs [--preview] -> out/slide-1..10.png (1620x2025): the carousel slides from carousel.html.
// Image metadata is stripped afterwards (strip.py), so the files are only pixels.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + path.join(__dirname, 'carousel.html') + (process.argv.includes('--preview') ? '?preview' : ''));
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(500);
  const slides = await p.$$('.s');
  for (let i = 0; i < slides.length; i++) await slides[i].screenshot({ path: path.join(OUT, `slide-${i + 1}.png`) });
  await b.close();
  execFileSync('python3', [path.join(__dirname, 'strip.py'), OUT]);
  console.log(slides.length, 'slides');
})();
