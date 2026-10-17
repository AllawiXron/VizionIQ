// node layers.cjs -> layers/<name>/<key>.png (1080x1350, transparent): each ad split into the layers a designer would
// have in the PSD, bottom to top. ../ig-brand-posts uses them for its «Layer by layer» slide.
// A layer is a list of selectors inside #ad; 'bg' also keeps #ad's own background and its ::before/::after (grade, grain).
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const LAYERS = {
  asiacell: [
    ['bg', 'Dark room + red glow', []],
    ['sign', 'Neon sign (vector)', ['svg.scene']],
    ['bulb', 'Bulb (photo, graded)', ['.socket', '.bulb', '.tag']],
    ['txt', 'Headline & footer', ['.txt', '.rule', '.foot .cta']],
    ['logo', 'Logo', ['.foot img']],
  ],
  talabat: [
    ['bg', 'Orange + grain', []],
    ['map', 'Baghdad map (vector)', ['svg.map']],
    ['card', 'Tracking card', ['.card']],
    ['txt', 'Verse, headline & footer', ['.head', '.foot .cta']],
    ['logo', 'Logo', ['.foot img']],
  ],
  qi: [
    ['bg', 'Yellow + Q wallpaper', ['.wall']],
    ['lock', 'Lock screen', ['.status', '.lock', '.date', '.clock', '.home']],
    ['notes', 'Notifications', ['.stack']],
    ['txt', 'Headline & footer', ['.txt', '.foot .cta', '.foot .brand span']],
    ['logo', 'Logo', ['.foot .brand img']],
  ],
  iraqiairways: [
    ['bg', 'Window + Baghdad (photo composite)', []],
    ['pass', 'Boarding pass', ['.pass']],
    ['txt', 'Headline & footer', ['.head', '.foot .cta']],
    ['logo', 'Logo', ['.foot .brand']],
  ],
  pepsi: [
    ['bg', 'Blue, spotlight & floor', ['.bokeh', '.cone', '.floor', '.pool', '.contact']],
    ['can', 'Can (photo, relit)', ['.can']],
    ['txt', 'Headline & footer', ['.txt', '.foot']],
  ],
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  for (const [name, layers] of Object.entries(LAYERS)) {
    await page.goto('file://' + path.join(__dirname, name + '.html'));
    await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 30000 });
    await page.addStyleTag({ content: `
      body { padding:0 !important; background:transparent !important; display:block !important }
      body.lay #ad * { visibility:hidden !important }
      body.lay #ad .show, body.lay #ad .show * { visibility:visible !important }
      body.lay:not(.with-bg) #ad { background:none !important }
      body.lay:not(.with-bg) #ad::before, body.lay:not(.with-bg) #ad::after { display:none !important }` });
    await page.waitForTimeout(300);
    const dir = path.join(__dirname, 'layers', name);
    fs.mkdirSync(dir, { recursive: true });
    for (const [key, , sels] of layers) {
      await page.evaluate(({ key, sels }) => {
        document.body.classList.add('lay');
        document.body.classList.toggle('with-bg', key === 'bg');
        document.querySelectorAll('.show').forEach((e) => e.classList.remove('show'));
        for (const s of sels) document.querySelectorAll('#ad ' + s).forEach((e) => e.classList.add('show'));
      }, { key, sels });
      await page.waitForTimeout(150);
      await page.locator('#ad').screenshot({ path: path.join(dir, key + '.png'), omitBackground: true });
    }
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(layers.map(([k, n]) => [k, n]), null, 1));
    console.log(name, layers.length);
  }
  await browser.close();
})();
