// node render.mjs [id …]   -> out/<id>.mp4 (1080x1920, H.264) and out/<id>-cover.jpg for every episode (or the ones
// named), plus out/avatar.png (the profile picture) when no ids are given or "avatar" is one of them.
import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia, renderStill } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';

const local = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(local) ? local : null; // elsewhere Remotion downloads its own browser
const root = path.dirname(new URL(import.meta.url).pathname);
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const comps = await getCompositions(serveUrl, { browserExecutable });
const ids = process.argv.slice(2);
const pick = (c) => !ids.length || ids.includes(c.id);
fs.mkdirSync(path.join(root, 'out'), { recursive: true });

for (const composition of comps.filter((c) => c.durationInFrames > 1 && pick(c))) {
  const t0 = Date.now();
  await renderMedia({
    composition, serveUrl, browserExecutable, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', audioCodec: 'aac',
    outputLocation: path.join(root, 'out', composition.id + '.mp4'), concurrency: 4,
    onProgress: ({ progress }) => process.stdout.write(`\r${composition.id} ${Math.round(progress * 100)}%   `),
  });
  // cover: the frame with the whole verse on screen
  await renderStill({ composition, serveUrl, browserExecutable, frame: 400, imageFormat: 'jpeg', jpegQuality: 92, output: path.join(root, 'out', composition.id + '-cover.jpg') });
  console.log(`\r${composition.id} done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
for (const composition of comps.filter((c) => c.durationInFrames === 1 && pick(c))) {
  await renderStill({ composition, serveUrl, browserExecutable, output: path.join(root, 'out', composition.id + '.png') });
  console.log(composition.id, 'done');
}
