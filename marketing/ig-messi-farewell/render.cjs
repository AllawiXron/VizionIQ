// node render.cjs -> out/messi-post.png (1080x1350) and out/messi-story.png (1080x1920)
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2300, height: 2100 } });
  await p.goto('file://' + path.join(__dirname, 'poster.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  for (const id of ['post', 'story']) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `messi-${id}.png`) });
    console.log(id);
  }
  await b.close();
})();
