// node render-cafe.cjs -> out/messi-cafe-post.png (1080x1350), out/messi-cafe-story.png (1080x1920)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2300, height: 2050 } });
  await p.goto('file://' + path.join(__dirname, 'cafe.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(400);
  for (const id of ['post', 'story']) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `messi-cafe-${id}.png`) });
    console.log(id);
  }
  await b.close();
})();
