// node motion-layers.cjs -> ../reels/remotion/public/img/alshifa/*.png
// The offer story (#st, 1080x1920) split into fine layers for the Remotion reel: every element keeps its place
// on a transparent 1080x1920 canvas (rendered at 1.5x), so the reel can animate each one on its own.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = path.join(__dirname, '../reels/remotion/public/img/alshifa');
// [name, body classes, selectors to show, selectors to keep hidden]
const L = [
  ['bg', 'export m-bg', [], []],
  ['grain', 'export m-grain', [], []],
  ['hand', 'export', ['#st img.photo'], []],
  ['tlabel', 'export', ['#st .tlabel'], []],
  ['card', 'export', ['#st .pin .card', '#st .pin .tail'], ['#st .pin li', '#st .pin .pr']],
  ...[1, 2, 3, 4, 5, 6, 7].map((i) => [`li${i}`, 'export', [`#st .pin li:nth-child(${i})`], []]),
  ['price', 'export', ['#st .pin .pr'], []],
  ['sticker', 'export', ['#st .pin .sticker'], []],
  ['pill', 'export', ['#st .q small'], []],
  ['qline', 'export', ['#st .q'], ['#st .q small']],
  ['a1', 'export', ['#st .a'], ['#st .a .u']],
  ['a2', 'export', ['#st .a .u'], []],
  ['cta', 'export', ['#st .foot .cta'], []],
  ['brand', 'export', ['#st .foot .brand', '#st .foot .brand .logo'], []],
];
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + path.join(__dirname, 'posts.html'));
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(500);
  for (const [name, cls, show, hide] of L) {
    await p.evaluate(([cls, show, hide]) => {
      document.querySelectorAll('[data-mv]').forEach((e) => { e.style.visibility = ''; e.removeAttribute('data-mv'); });
      document.body.className = cls;
      document.querySelectorAll('.ad').forEach((el) => { el.style.display = el.id === 'st' ? '' : 'none'; });
      show.forEach((s) => document.querySelectorAll(s).forEach((e) => { e.style.visibility = 'visible'; e.setAttribute('data-mv', 1); }));
      hide.forEach((s) => document.querySelectorAll(s).forEach((e) => { e.style.visibility = 'hidden'; e.setAttribute('data-mv', 1); }));
    }, [cls, show, hide]);
    await p.screenshot({ path: path.join(OUT, name + '.png'), omitBackground: true, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
    console.log(name);
  }
  await b.close();
})();
