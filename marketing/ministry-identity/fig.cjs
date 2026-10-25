// node fig.cjs -> out/fig/app-1..4.jpg and web-1..2.jpg: the mockup slides as clean figures for the document
// (slide tag and number hidden, rendered at 2x for print).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const dir = path.join(__dirname, 'out', 'fig'); fs.mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  for (const [page, name] of [['applications.html', 'app'], ['website.html', 'web']]) {
    await p.goto('file://' + path.join(__dirname, page)); await p.evaluate(() => document.fonts.ready);
    await p.addStyleTag({ content: '.tag, .num { display: none !important; } .slide { margin: 0 !important; }' }); await p.waitForTimeout(300);
    const slides = await p.$$('.slide');
    // the slides' own captions are hidden (the document captions every figure)
    await p.evaluate(() => document.querySelectorAll('.slide *').forEach((e) => {
      if (!e.children.length && /^\s*(منشورات وقصص|واجهة المبنى ولوحة)/.test(e.textContent)) e.style.visibility = 'hidden'; }));
    for (let i = 0; i < slides.length; i++) {
      const out = { path: path.join(dir, `${name}-${i + 1}.jpg`), type: 'jpeg', quality: 90 };
      if (name === 'web' && i === 1) {                 // the mobile flow: only the two phones, not the slide's text
        const bx = await slides[i].boundingBox();
        await p.screenshot({ ...out, fullPage: true, clip: { x: bx.x + 1000, y: bx.y + 230, width: 860, height: 810 } });
      } else await slides[i].screenshot(out);
    }
  }
  await b.close();
})();
