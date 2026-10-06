// node render.cjs --page showcase.html     -> out/showcase-<id>.png (the allawi.psd showcase)
// node render.cjs                          -> out/<id>.png for every .art on kit.html (template photo slots empty)
// node render.cjs --overlay <dir>              -> <dir>/key-tpl-*.png with #00ff00 photo slots; overlay.py keys them to transparent
// node render.cjs --demo <dir> <new> <story> [newpos] -> <dir>/demo-tpl-new.png + <dir>/demo-tpl-story.png with photos in the slots
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
(async () => {
  const demo = process.argv[2] === '--demo';
  const overlay = process.argv[2] === '--overlay';
  const page = process.argv[2] === '--page' ? process.argv[3] : 'kit.html';
  const outDir = demo || overlay ? process.argv[3] : path.join(__dirname, 'out');
  fs.mkdirSync(outDir, { recursive: true });
  let url = 'file://' + path.join(__dirname, page);
  if (demo) url += `?new=${encodeURIComponent('file://' + path.resolve(process.argv[4]))}&story=${encodeURIComponent('file://' + path.resolve(process.argv[5]))}` + (process.argv[6] ? `&newpos=${encodeURIComponent(process.argv[6])}` : '');
  if (overlay) url += '?overlay=1';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 4700, height: 2000 } });
  await p.goto(url);
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  const ids = demo || overlay ? ['tpl-new', 'tpl-story'] : await p.$$eval('.art', (a) => a.map((e) => e.id));
  for (const id of ids) {
    await p.locator('#' + id).screenshot({ path: path.join(outDir, (demo ? 'demo-' : overlay ? 'key-' : page !== 'kit.html' ? path.basename(page, '.html') + '-' : '') + `${id}.png`) });
    console.log(id);
  }
  await b.close();
})();
