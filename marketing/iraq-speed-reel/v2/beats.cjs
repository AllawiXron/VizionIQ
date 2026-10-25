// One frame per beat (and the last frame), on one contact sheet, to check the reel before the full render.
// NODE_PATH=/opt/node-tools/node_modules node beats.cjs <out dir>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), net = require('net');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
(async () => {
  const out = path.resolve(process.argv[2] || 'beats');
  require('fs').mkdirSync(out, { recursive: true });
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(__dirname, '..', '..', 'iraq-internet-map', 'build', 'serve.cjs'), String(port), '--root', path.join(__dirname, '..', '..')], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(`http://localhost:${port}/iraq-speed-reel/v2/reel.html`);
  await p.evaluate(() => window.ready);
  const times = (process.argv[3] ? process.argv[3].split(',').map(Number) : Array.from({ length: 32 }, (_, i) => i + 0.6));
  for (const t of times) {
    await p.evaluate(t => window.seek(t), t);
    await p.screenshot({ path: path.join(out, `b-${t.toFixed(2)}.png`) });
  }
  console.log('errors', errs);
  await b.close(); server.kill();
})();
