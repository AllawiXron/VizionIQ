// node render.cjs -> out/menu-print-bleed.png (13.6 cm, 300 dpi), out/menu-print.png (13 cm), out/menu-post.png (1080),
// out/menu-story.png (1080x1920); finish.py adds the JPGs and PDFs
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
(async () => {
  const out = path.join(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1800, height: 1800 } });
  await p.goto('file://' + path.join(__dirname, 'menu.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  const shots = { print: 'menu-print-bleed', trim: 'menu-print', story: 'menu-story' };
  for (const [id, name] of Object.entries(shots)) {
    await p.locator('#' + id).screenshot({ path: path.join(out, name + '.png') });
  }
  await b.close();
  execFileSync('python3', ['-I', path.join(__dirname, 'finish.py'), out], { stdio: 'inherit' });
})();
