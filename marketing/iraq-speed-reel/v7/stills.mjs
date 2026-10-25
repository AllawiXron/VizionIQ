// Single frames for checking, from one bundle: node stills.mjs <out dir> "t1,t2,..."  (times in seconds)
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition, openBrowser } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const out = path.resolve(process.argv[2] || 'out/stills');
fs.mkdirSync(out, { recursive: true });
const times = (process.argv[3] || '1').split(',').map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve('src/index.ts') });
const browser = await openBrowser('chrome');
const composition = await selectComposition({ serveUrl, id: 'Reel', puppeteerInstance: browser });
for (const t of times) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  await renderStill({ composition, serveUrl, frame, output: path.join(out, `s-${String(frame).padStart(4, '0')}.png`), puppeteerInstance: browser });
}
await browser.close({ silent: true });
console.log('done', times.length);
