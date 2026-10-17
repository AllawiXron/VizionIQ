// node render.cjs -> out/casting-1.png, casting-2.png (1080x1350, the carousel) and casting-story.png (1080x1920)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'post.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
  await p.waitForTimeout(300);
  for (const [id, name] of [['s1', 'casting-1'], ['s2', 'casting-2'], ['story', 'casting-story']]) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `${name}.png`) });
    console.log(name);
  }
  await b.close();
})();
