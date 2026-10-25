// The reel's cover (out/cover.jpg): the first frame («إعلانك ما يبيع؟», tag on the right), with the viZion name moved
// down so it also shows whole in the profile grid, which crops covers to 4:5 (1080x1350, from y=285).
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.goto('file://' + path.join(__dirname, 'reel.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.evaluate(() => { document.getElementById('brand').style.top = '345px'; window.setTime(0); });
  await p.screenshot({ path: path.join(__dirname, 'out', 'cover.png') }); await b.close();
})();
