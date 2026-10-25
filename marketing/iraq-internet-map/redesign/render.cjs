// Renders the redesign stills: the Karrada street plate from the real tiles, then the two phone screens.
// NODE_PATH=/opt/node-tools/node_modules node redesign/render.cjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), net = require('net');

const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'out');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });

(async () => {
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(ROOT, 'build', 'serve.cjs'), String(port), '--root', ROOT], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const base = `http://localhost:${port}/redesign/`;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  const map = await browser.newPage({ viewport: { width: 358, height: 230 }, deviceScaleFactor: 3 });
  await map.goto(base + 'mapshot.html?gov=baghdad&id=r2964648');
  await map.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  await map.waitForTimeout(800);
  await (await map.$('#map')).screenshot({ path: path.join(__dirname, 'karrada-map.png') });

  const page = await browser.newPage({ viewport: { width: 900, height: 2000 }, deviceScaleFactor: 3 });
  await page.goto(base + 'stills.html');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);
  await (await page.$('#s1')).screenshot({ path: path.join(OUT, 'redesign-1-home.png') });
  await (await page.$('#s2')).screenshot({ path: path.join(OUT, 'redesign-2-area.png') });
  await browser.close();
  server.kill();
  console.log('out/redesign-1-home.png, out/redesign-2-area.png');
})();
