// Renders each .slide of identity.html to out/slide-N.png (1920x1080).
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'identity.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const slides = await p.$$('.slide');
  for (let i = 0; i < slides.length; i++) await slides[i].screenshot({ path: path.join(__dirname, 'out', `slide-${i + 1}.png`) });
  console.log(slides.length, 'slides'); await b.close();
})();
