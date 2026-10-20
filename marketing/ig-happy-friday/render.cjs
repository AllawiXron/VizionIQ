// node render.cjs [page.html] [name] -> out/<name>.jpg (1080x1350); default post.html -> happy-friday
// Served from marketing/ over a tiny local http server, because the page uses ../brand-fonts and ../ig-highlights.
const { chromium } = require('playwright');
const http = require('http');
const path = require('path');
const fs = require('fs');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
(async () => {
  fs.mkdirSync(path.join(__dirname, 'out'), { recursive: true });
  const srv = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 1450 } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/ig-happy-friday/${process.argv[2] || 'post.html'}`);
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.waitForTimeout(300);
  await p.locator('#post').screenshot({ path: path.join(__dirname, 'out', (process.argv[3] || 'happy-friday') + '.jpg'), type: 'jpeg', quality: 92 });
  console.log(process.argv[3] || 'happy-friday');
  await b.close(); srv.close();
})();
