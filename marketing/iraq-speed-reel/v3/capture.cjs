// The real site on a phone, for the reel, at 4x so the close-ups stay sharp: the home page while الكرادة is typed
// (with where the caret and the first result are), the home and Karrada's pages as tall pictures, and the fixed
// header and tab bar on their own, so the pages can scroll under them inside the phone.
// NODE_PATH=/opt/node-tools/node_modules node capture.cjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'site');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, [path.join(__dirname, '..', '..', 'iraq-internet-map', 'build', 'serve.cjs'), '8783'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 4, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:8783/#/');
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(OUT, 'home-0.png') });
  // the caret sits at the left end of the typed text (the field is right to left)
  const caret = () => p.evaluate(() => {
    const q = document.getElementById('q'), cs = getComputedStyle(q), r = q.getBoundingClientRect();
    const g = document.createElement('canvas').getContext('2d'); g.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    return Math.round((r.right - parseFloat(cs.paddingRight) - g.measureText(q.value).width) * 10) / 10;
  });
  const marks = { caret: [await caret()] };
  const word = 'الكرادة';
  for (let i = 1; i <= word.length; i++) {
    await p.fill('#q', word.slice(0, i));
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(OUT, `home-${i}.png`) });
    marks.caret.push(await caret());
  }
  Object.assign(marks, await p.evaluate(() => {
    const box = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]; };
    return { input: box(document.querySelector('.search .box')), hit: box(document.querySelector('#hits a')) };
  }));
  await p.press('#q', 'Enter');
  await p.waitForTimeout(5000);
  await (await p.$('.bar')).screenshot({ path: path.join(OUT, 'bar.png') });
  await (await p.$('.tabs')).screenshot({ path: path.join(OUT, 'tabs.png') });
  await p.addStyleTag({ content: '.bar, .tabs { visibility: hidden !important; }' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, 'karrada.png'), fullPage: true });
  Object.assign(marks, await p.evaluate(() => {
    const y = sel => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; };
    const h = sel => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().height) : null; };
    return { answer: y('.answer'), compare: y('.compare'), plate: y('.plate'), plateH: h('.plate'), height: document.documentElement.scrollHeight };
  }));
  await p.goto('http://localhost:8783/#/');
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  await p.addStyleTag({ content: '.bar, .tabs { visibility: hidden !important; }' });
  await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, 'home-full.png'), fullPage: true });
  marks.homeH = await p.evaluate(() => document.documentElement.scrollHeight);
  fs.writeFileSync(path.join(OUT, 'marks.json'), JSON.stringify(marks));
  console.log(marks);
  await b.close(); server.kill();
})();
