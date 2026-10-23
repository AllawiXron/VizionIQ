// Renders the reel from the page: every 15 fps step once (four pages at a time), each written twice into the 30 fps
// video, then the sound mixed from the same cue list. `node tools/render.cjs stills 2.5 7.1` writes single frames,
// `encode` only remakes the video from the steps already rendered.
// Run with NODE_PATH pointing at a folder that has playwright-core.
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.resolve(__dirname, ".."), OUT = path.join(ROOT, "out");
const BROWSER = process.env.CHROME || fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")).map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];
const { SOUND } = require("../reel/sound.js");

async function page(browser) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on("pageerror", (e) => console.error("page:", e.message));
  p.on("console", (m) => m.type() === "error" || m.type() === "warning" ? console.error("console:", m.text()) : null);
  await p.goto("file://" + path.join(ROOT, "index.html") + "?render");
  await p.waitForFunction(() => window.Core && Core.ready, null, { timeout: 60000 });
  return p;
}
const shot = async (p, t, file) => {
  await p.evaluate((t) => Core.reel.M.renderAt(t), t);
  await p.screenshot({ path: file, type: file.endsWith(".png") ? "png" : "jpeg", quality: file.endsWith(".png") ? undefined : 93, clip: { x: 0, y: 0, width: 1080, height: 1920 } });
};

function mix(file) {
  const cues = SOUND.all(), args = ["-v", "error", "-y"];
  for (const c of cues) args.push("-i", path.join(ROOT, "media/audio", c.file + ".wav"));
  const f = cues.map((c, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${c.gain},adelay=${Math.round(c.t * 1000)}:all=1[a${i}]`);
  f.push(`${cues.map((_, i) => `[a${i}]`).join("")}amix=inputs=${cues.length}:normalize=0:duration=longest,apad=whole_dur=41.2,atrim=0:41.2[out]`);
  args.push("-filter_complex", f.join(";"), "-map", "[out]", "-c:a", "pcm_s16le", file);
  execFileSync("ffmpeg", args);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  if (process.argv[2] === "encode") return encode(path.join(OUT, "steps"));
  const browser = await chromium.launch({ executablePath: BROWSER, args: ["--allow-file-access-from-files", "--autoplay-policy=no-user-gesture-required"] });
  const [mode, ...rest] = process.argv.slice(2);
  if (mode === "stills") {
    const p = await page(browser);
    for (const t of rest.map(Number)) await shot(p, t, path.join(OUT, `still-${t.toFixed(2)}.png`));
  } else {
    const steps = Math.round(41.2 * 15), dir = path.join(OUT, "steps"), N = 4;
    fs.mkdirSync(dir, { recursive: true });
    const pages = await Promise.all(Array.from({ length: N }, () => page(browser)));
    let next = 0;
    const t0 = Date.now();
    await Promise.all(pages.map(async (p) => {
      while (next < steps) {
        const i = next++;
        await shot(p, i / 15, path.join(dir, `${String(i).padStart(4, "0")}.jpg`));
        if (i % 60 === 0) console.log(`step ${i}/${steps}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
    }));
    await encode(dir);
    console.log("done", ((Date.now() - t0) / 1000).toFixed(0), "s");
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

// the steps into a 30 fps video, with the sound
async function encode(dir) {
    mix(path.join(OUT, "sound.wav"));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", "15", "-i", path.join(dir, "%04d.jpg"), "-i", path.join(OUT, "sound.wav"),
      "-r", "30", "-c:v", "libx264", "-b:v", "10M", "-maxrate", "12M", "-bufsize", "20M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
      "-map_metadata", "-1", "-fflags", "+bitexact", "-movflags", "+faststart", "-t", "41.2", path.join(OUT, "allawi-ad-reel.mp4")]);
}
