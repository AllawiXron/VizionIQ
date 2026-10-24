// The new pages of the site on a phone, for the reel, at 3x: the home page with Karrada as your area, the line test
// while it runs and its result, the share picture, the ping page idle and busy, and the home page as one tall
// picture for the end. The line is held at about 12 Mbps down and 4 up, and the ping requests are answered in
// 12 ms, or 160 ms while the line is busy, so both are a sample test, as the badge in the reel says.
// NODE_PATH=/opt/node-tools/node_modules node capture.cjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'site');
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const server = spawn(process.execPath, [path.join(__dirname, '..', '..', 'iraq-internet-map', 'build', 'serve.cjs'), '8784'], { stdio: 'ignore' });
  await wait(600);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, acceptDownloads: true });
  const p = await ctx.newPage();
  let busy = 0, n = 0;
  await p.route(/speed\.cloudflare\.com\/__down\?bytes=0/, async r => {
    n++; await wait(busy > 0 ? 146 + (n * 37 % 19) : 6 + (n % 3 === 0 ? 1 : 0));
    r.fulfill({ status: 200, body: '', headers: { 'access-control-allow-origin': '*', 'access-control-expose-headers': 'server-timing', 'server-timing': 'cfRequestDuration;dur=0.4' } });
  });
  const shot = name => p.screenshot({ path: path.join(OUT, name + '.png') });
  const marks = {};
  await p.goto('http://localhost:8784/#/p/r2964648');
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  await wait(800);
  await p.click('a.gamers[data-me]');               // Karrada becomes your area without starting anything
  await wait(800);
  await p.click('.tabs a[href="#/"]');
  await wait(1200);
  await shot('home');
  marks.go = await p.$eval('#me a.go', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  await p.addStyleTag({ content: '.bar, .tabs { visibility: hidden !important; }' });
  await wait(200);
  await p.screenshot({ path: path.join(OUT, 'home-full.png'), fullPage: true });
  await (await p.$('.bar')).screenshot({ path: path.join(OUT, 'bar.png') }).catch(() => {});
  await p.addStyleTag({ content: '.bar, .tabs { visibility: visible !important; }' });
  await (await p.$('.bar')).screenshot({ path: path.join(OUT, 'bar.png') });
  await (await p.$('.tabs')).screenshot({ path: path.join(OUT, 'tabs.png') });
  // the line test on a line held at about 12 Mbps
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: 12.3e6 / 8, uploadThroughput: 4e6 / 8 });
  await p.click('#me a.go');
  const t0 = Date.now(); let k = 0;
  while (Date.now() - t0 < 60000) {
    const txt = await p.$eval('#test', e => e.textContent);
    if (/نتيجة خطك/.test(txt)) break;
    if (/التنزيل/.test(txt) && /خطك هسه/.test(txt) && k < 14) { await shot('test-' + String(k).padStart(2, '0')); k++; await wait(350); } else await wait(150);
  }
  await wait(300);
  await shot('result');
  marks.verdict = await p.$eval('.test-verdict', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  marks.result = await p.$eval('#test', e => e.textContent.slice(0, 200));
  const [dl] = await Promise.all([p.waitForEvent('download'), p.click('[data-act="share"]')]);
  await dl.saveAs(path.join(OUT, 'share.png'));
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  // ping: idle, then busy while three downloads run (they are held open so the line counts as busy)
  await p.route(/speed\.cloudflare\.com\/__down\?bytes=25000000/, async r => { busy++; await wait(1200); busy--; r.fulfill({ status: 200, body: Buffer.alloc(300000), headers: { 'access-control-allow-origin': '*' } }).catch(() => {}); });
  await p.click('.tabs a[href="#/"]'); await wait(600);
  await p.click('a.gamers[href="#/ping"]'); await wait(1200);
  await shot('ping-0');
  marks.pingGo = await p.$eval('.ptest .go', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  await p.click('.ptest .go');
  const t1 = Date.now(); k = 1;
  while (Date.now() - t1 < 60000) {
    const txt = await p.$eval('.ptest', e => e.textContent);
    if (/شارك النتيجة/.test(txt)) break;
    if (k < 12) { await shot('ping-' + String(k).padStart(2, '0')); k++; }
    await wait(700);
  }
  await wait(300);
  await shot('ping-done');
  marks.pingResult = await p.$eval('.ptest', e => e.textContent.slice(0, 160));
  fs.writeFileSync(path.join(OUT, 'marks.json'), JSON.stringify(marks));
  console.log(marks);
  await b.close(); server.kill();
})();
