// The real site on a phone, for the reel: the home page while الكرادة is typed, Karrada's page as one tall picture,
// and the fixed header and tab bar on their own, so the page can scroll under them inside the phone.
// NODE_PATH=/opt/node-tools/node_modules node capture.cjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'site');
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, [path.join(__dirname, '..', '..', 'iraq-internet-map', 'build', 'serve.cjs'), '8782'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await p.goto('http://localhost:8782/#/');
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(OUT, 'home-0.png') });
  const word = 'الكرادة';
  for (let i = 1; i <= word.length; i++) {
    await p.fill('#q', word.slice(0, i));
    await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(OUT, `home-${i}.png`) });
  }
  await p.press('#q', 'Enter');
  await p.waitForTimeout(5000);
  await (await p.$('.bar')).screenshot({ path: path.join(OUT, 'bar.png') });
  await (await p.$('.tabs')).screenshot({ path: path.join(OUT, 'tabs.png') });
  await p.addStyleTag({ content: '.bar, .tabs { visibility: hidden !important; }' });
  await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(OUT, 'karrada.png'), fullPage: true });
  const marks = await p.evaluate(() => {
    const y = sel => { const e = document.querySelector(sel); return e ? Math.round(e.getBoundingClientRect().top + scrollY) : null; };
    return { answer: y('.answer'), compare: y('.compare'), side: y('.side'), height: document.documentElement.scrollHeight };
  });
  fs.writeFileSync(path.join(OUT, 'marks.json'), JSON.stringify(marks));
  console.log(marks);
  await b.close(); server.kill();
})();
