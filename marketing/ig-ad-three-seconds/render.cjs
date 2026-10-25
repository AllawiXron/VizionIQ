// node render.cjs [ids...] -> out/three-seconds-<n>.jpg (1080x1350) for every .art on slides.html, or only the ids given.
// Served over a small local http server so the fonts and textures load from a real origin.
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.svg': 'image/svg+xml' };
(async () => {
  const only = process.argv.slice(2);
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const srv = http.createServer((req, res) => {
    const f = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(__dirname) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1500 } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/slides.html`);
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  for (const id of await p.$$eval('.art', (a) => a.map((e) => e.id))) {
    if (only.length && !only.includes(id)) continue;
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `three-seconds-${id.slice(1)}.jpg`), type: 'jpeg', quality: 95 });
    console.log('three-seconds-' + id.slice(1));
  }
  await b.close(); srv.close();
})();
