// node render.cjs -> out/shaghaf-menu-1.png, out/shaghaf-menu-2.png (1080x1920 stories, PNG and JPG, no metadata)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');
(async () => {
  const out = path.join(__dirname, 'out');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 2000 } });
  await p.goto('file://' + path.join(__dirname, 'menu.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  for (const n of [1, 2]) await p.locator('#story-' + n).screenshot({ path: path.join(out, `shaghaf-menu-${n}.png`) });
  await b.close();
  execFileSync('python3', ['-I', '-c', `
import sys
from PIL import Image
for n in (1, 2):
    f = sys.argv[1] + '/shaghaf-menu-%d' % n
    im = Image.open(f + '.png').convert('RGB')
    im.save(f + '.png', optimize=True)
    im.save(f + '.jpg', quality=95, subsampling=0)
`, out], { stdio: 'inherit' });
})();
