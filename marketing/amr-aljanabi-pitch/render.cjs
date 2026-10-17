// node render.cjs [page.html] -> out/<page>-<n>-<id>.jpg (1620×2025, 4:5) for every .post on the page.
// Served over a tiny local http server so fonts and images load from a real origin.
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' };
(async () => {
  const page = process.argv[2] || 'collage.html';
  const prefix = page.replace(/\.html$/, '');
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const srv = http.createServer((req, res) => {
    const f = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(__dirname) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1160, height: 1430 }, deviceScaleFactor: 1.5 });
  await p.goto(`http://127.0.0.1:${srv.address().port}/${page}`);
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  const ids = await p.$$eval('.post', (a) => a.map((e) => e.id));
  for (const [i, id] of ids.entries()) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'out', `${prefix}-${i + 1}-${id}.jpg`), type: 'jpeg', quality: 94 });
    console.log(`${prefix}-${i + 1}-${id}`);
  }
  await b.close(); srv.close();
})();
