// node render.cjs -> out/gift.jpg (1620×2025, 4:5) for the DM
const { chromium } = require('playwright');
const http = require('http'), path = require('path'), fs = require('fs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const srv = http.createServer((req, res) => {
    const f = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(__dirname) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1160, height: 1430 }, deviceScaleFactor: 1.5 });
  await p.goto(`http://127.0.0.1:${srv.address().port}/gift.html`);
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  for (const id of await p.$$eval('.art', (a) => a.map((e) => e.id))) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `${id}.jpg`), type: 'jpeg', quality: 93 });
    console.log(id);
  }
  await b.close(); srv.close();
})();
