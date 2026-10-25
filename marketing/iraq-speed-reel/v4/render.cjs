// Renders reel.html (WebGL through SwiftShader for the phone) at 60 fps, one sharp still per frame, four pages at a
// time, and muxes the sound.
// NODE_PATH=/opt/node-tools/node_modules node render.cjs <frames dir> <out.mp4>   (python3 mix.py first)
const { chromium } = require('playwright');
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), net = require('net');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, () => { const p = s.address().port; s.close(() => r(p)); }); });
const SUB = 60, WORKERS = 4;

(async () => {
  const dir = path.resolve(process.argv[2]), out = path.resolve(process.argv[3]);
  fs.mkdirSync(dir, { recursive: true });
  const port = await freePort();
  const server = spawn(process.execPath, [path.join(__dirname, '..', '..', 'iraq-internet-map', 'build', 'serve.cjs'), String(port), '--root', path.join(__dirname, '..', '..')], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const url = `http://localhost:${port}/iraq-speed-reel/v4/reel.html`;
  const first = await browser.newPage(); await first.goto(url); await first.waitForFunction(() => !!window.DUR); const DUR = await first.evaluate(() => window.DUR); await first.close();
  const total = Math.round(DUR * SUB), t0 = Date.now();
  await Promise.all(Array.from({ length: WORKERS }, async (_, w) => {
    const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    await p.goto(url);
    await p.waitForFunction(() => !!window.ready, null, { timeout: 120000 });
    await p.evaluate(() => window.ready);
    for (let i = w; i < total; i += WORKERS) {
      const f = path.join(dir, `f${String(i).padStart(5, '0')}.png`);
      if (fs.existsSync(f)) continue;
      await p.evaluate(t => window.seek(t), i / SUB);
      await p.screenshot({ path: f });
      if (w === 0 && i % 300 === 0) console.log(`${i}/${total} ${Math.round((Date.now() - t0) / 1000)} s`);
    }
  }));
  await browser.close(); server.kill();
  // one still per frame, straight into the video
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(SUB), '-i', path.join(dir, 'f%05d.png'), '-i', path.join(__dirname, 'sound.wav'),
    '-filter_complex', `[0:v]format=yuv420p[v]`,
    '-map', '[v]', '-map', '1:a', '-r', '60', '-c:v', 'libx264', '-preset', 'slow', '-b:v', '10M', '-maxrate', '12M', '-bufsize', '20M',
    '-profile:v', 'high', '-c:a', 'aac', '-b:a', '192k', '-t', String(DUR), '-movflags', '+faststart', '-map_metadata', '-1', '-fflags', '+bitexact',
    '-metadata', 'title=', out], { stdio: 'inherit' });
  console.log(out, Math.round((Date.now() - t0) / 1000), 's');
})();
