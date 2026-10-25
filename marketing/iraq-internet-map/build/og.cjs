// The share image (site/og.jpg, 1200 x 630): the home page at desktop width, without the parts that only work live.
// NODE_PATH=/opt/node-tools/node_modules node build/og.cjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), net = require('net');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });

(async () => {
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(__dirname, 'serve.cjs'), String(port)], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto(`http://localhost:${port}/#/`);
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  await p.addStyleTag({ content: `.tries, .period, .more, .foot, .side > .small { display: none !important; }
    .h1 { margin-top: 34px !important; } .cols > .side { margin-top: 24px !important; }` });
  await p.waitForTimeout(600);
  await p.screenshot({ path: path.join(__dirname, 'og.png') });
  await b.close();
  server.kill();
})();
