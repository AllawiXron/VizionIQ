// node preview.mjs <id> <frame> [frame …]   -> out/preview/<id>-<frame>.jpg, for checking a layout without a full render
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';
import fs from 'fs';
import path from 'path';

const local = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell';
const browserExecutable = fs.existsSync(local) ? local : null;
const root = path.dirname(new URL(import.meta.url).pathname);
const [id, ...frames] = process.argv.slice(2);
const serveUrl = await bundle({ entryPoint: path.join(root, 'src/index.ts') });
const composition = await selectComposition({ serveUrl, id, browserExecutable });
fs.mkdirSync(path.join(root, 'out/preview'), { recursive: true });
for (const f of frames) {
  await renderStill({ composition, serveUrl, browserExecutable, frame: Number(f), imageFormat: 'jpeg', jpegQuality: 85, output: path.join(root, 'out/preview', `${id}-${f}.jpg`) });
  console.log(id, f);
}
