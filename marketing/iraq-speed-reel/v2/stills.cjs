const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', '..', 'iraq-internet-map', 'build', 'serve.cjs'), '8781', '--root', path.join(__dirname, '..', '..')], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 3500, height: 2100 } });
  await p.goto('http://localhost:8781/iraq-speed-reel/v2/stills.html'); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(600);
  for (const id of ['a', 'b', 'c']) await (await p.$('#' + id)).screenshot({ path: path.join(process.argv[2], `still-${id}.png`) });
  await b.close(); server.kill();
})();
