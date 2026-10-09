// node tex/render-tex.cjs -> tex/<id>.png for each texture element in labels.html (transparent where the page is)
const { chromium } = require('playwright');
const http = require('http'), path = require('path'), fs = require('fs');
const ROOT = path.join(__dirname, '..');
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg' };
(async () => {
  const srv = http.createServer((req, res) => {
    const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
    if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
  }).listen(0, '127.0.0.1');
  await new Promise((r) => srv.on('listening', r));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1800, height: 1800 } });
  await p.goto(`http://127.0.0.1:${srv.address().port}/tex/labels.html`);
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.evaluate(() => { document.body.style.background = 'transparent'; });
  for (const id of ['mancera', 'slz', 'tag']) {
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, id + '.png'), omitBackground: true });
    console.log(id);
  }
  await b.close(); srv.close();
})();
