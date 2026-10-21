// node anim/render.cjs [--preview] -> anim/out/logo-animation.mp4 (1920x1080, 60 fps, H.264, with sound) and
// anim/out/frames-*.png stills; --preview renders 4 stills only.
// The sounds come from the user's pack (marketing/sfx-pack, run ./fetch.sh there first).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { spawn, execFileSync } = require('child_process');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const SFX = path.join(__dirname, '..', '..', 'sfx-pack', 'files');
const FPS = 60;
// [file, start s, gain dB]
const SOUNDS = [
  ['Soft Riser 2.wav', 0.25, -1],                                  // under the rise
  ['Whooshes/Cinematic Low Whoosh.wav', 1.62, 2],                 // the arches draw
  ['Synth Sparkle Tone High Pitch Tone Burst Ding 17.wav', 2.6, -6], // the signal pulse
  ['Whooshes/Slow And Smooth Whoosh .wav', 3.3, -4],              // the move into the lockup
];
(async () => {
  const preview = process.argv.includes('--preview');
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
  await p.goto('file://' + path.join(__dirname, 'logo.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const dur = await p.evaluate(() => window.DURATION);
  const still = async (t, name) => { await p.evaluate((t) => window.seek(t), t); await p.screenshot({ path: path.join(OUT, name) }); };
  for (const t of [1.1, 2.3, 3.0, 5.5]) await still(t, `frames-${t.toFixed(1)}.png`);
  if (preview) { await b.close(); return; }
  const silent = path.join(OUT, 'video.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264',
    '-preset', 'slow', '-b:v', '10M', '-maxrate', '12M', '-bufsize', '20M', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', silent]);
  for (let i = 0; i < Math.round(dur * FPS); i++) {
    await p.evaluate((t) => window.seek(t), i / FPS);
    if (!ff.stdin.write(await p.screenshot({ type: 'png' }))) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end(); await new Promise((r) => ff.on('close', r)); await b.close();
  // the sound: each effect delayed to its moment at its own gain, mixed without normalising
  const args = ['-y', '-loglevel', 'error', '-i', silent];
  SOUNDS.forEach(([f]) => args.push('-i', path.join(SFX, f)));
  const chains = SOUNDS.map(([, at, db], i) => `[${i + 1}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${db}dB,adelay=${Math.round(at * 1000)}|${Math.round(at * 1000)}[a${i}]`);
  const mix = `${chains.join(';')};${SOUNDS.map((_, i) => `[a${i}]`).join('')}amix=inputs=${SOUNDS.length}:normalize=0,atrim=0:${dur},afade=t=out:st=${dur - 0.8}:d=0.8[aout]`;
  args.push('-filter_complex', mix, '-map', '0:v', '-map', '[aout]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', path.join(OUT, 'logo-animation.mp4'));
  execFileSync('ffmpeg', args);
  fs.unlinkSync(silent);
  console.log('anim/out/logo-animation.mp4');
})();
