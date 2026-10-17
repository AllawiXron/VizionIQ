// The voice-actor test copy of the reel: the render without any voice (effects only), with the two spoken lines that
// have no subtitle in the reel (the hook and «وگال: الدولار صاعد عيوني» over the chat) added as cue captions in the
// reel's own subtitle style, so an applicant can read along from start to end.
//   NODE_PATH=/opt/node-tools/node_modules node voicetest.cjs
// in:  renders/dollar-reel-master.mp4 (the HyperFrames render: picture + effects, no voice)
// out: renders/dollar-reel-voice-test.mp4 (720x1280, small enough to send in a DM)
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CUES = [
  // [text, from, to, dark]  (seconds; the same places the recorded voice takes these lines; dark text over the light chat)
  ['الميّة دولار.. صارت ميّة وثمانين ألف.', 0.0, 3.0, false],
  ['وگال: الدولار صاعد عيوني.', 15.0, 17.0, true],
];

(async () => {
  const dir = path.join(__dirname, 'renders');
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'cues-'));
  const font = (f) => 'file://' + path.join(__dirname, 'assets/fonts', f);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [k, [text, , , dark]] of CUES.entries()) {
    await p.setContent(`<html><head><style>
      @font-face { font-family:'Plex'; font-weight:500; src:url(${font('32d758561b.woff2')}) format('woff2'); unicode-range:U+0600-06FF, U+FB50-FDFF, U+FE70-FEFC; }
      @font-face { font-family:'Plex'; font-weight:500; src:url(${font('0b17f11da9.woff2')}) format('woff2'); unicode-range:U+0000-00FF, U+2000-206F; }
      html, body { margin:0; background:transparent }
      .cue { position:absolute; left:80px; right:80px; top:1410px; text-align:center; direction:rtl; font:500 50px/1.6 'Plex'; color:#efe5d3;
        text-shadow:0 2px 14px rgba(0,0,0,.75), 0 0 4px rgba(0,0,0,.6) }
      .cue.dark { color:#1f1510; text-shadow:0 0 10px rgba(255,255,255,.8) }
    </style></head><body><div class="cue${dark ? ' dark' : ''}">${text}</div></body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(200);
    await p.screenshot({ path: path.join(tmp, `cue${k}.png`), omitBackground: true });
  }
  await b.close();

  const inputs = ['-i', path.join(dir, 'dollar-reel-master.mp4')];
  let graph = '[0:v]null[v0]';
  CUES.forEach(([, a, z], k) => {
    inputs.push('-i', path.join(tmp, `cue${k}.png`));
    graph += `;[v${k}][${k + 1}:v]overlay=0:0:enable='between(t,${a},${z})'[v${k + 1}]`;
  });
  graph += `;[v${CUES.length}]scale=720:1280:flags=lanczos,format=yuv420p[out]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', graph, '-map', '[out]', '-map', '0:a',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '27', '-tune', 'grain', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart',
    path.join(dir, 'dollar-reel-voice-test.mp4')], { stdio: 'inherit' });
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('ok renders/dollar-reel-voice-test.mp4');
})();
