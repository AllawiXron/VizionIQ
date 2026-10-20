// Renders each .slide of a page to out/<prefix>-N.png (1920x1080), numbered from the page's first slide number.
//   node render.cjs                       -> identity.html     -> out/slide-1..6.png
//   node render.cjs applications.html 7   -> applications.html -> out/slide-7..
const { chromium } = require('playwright'); const path = require('path');
const page = process.argv[2] || 'identity.html', first = +(process.argv[3] || 1);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, page)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const slides = await p.$$('.slide');
  for (let i = 0; i < slides.length; i++) await slides[i].screenshot({ path: path.join(__dirname, 'out', `slide-${first + i}.png`) });
  console.log(slides.length, 'slides from', page); await b.close();
})();
