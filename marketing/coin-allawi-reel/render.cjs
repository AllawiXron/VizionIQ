// Renders reel.html: `beats` writes one frame per word of the voice as a contact sheet to check first, `stills 2.5 7`
// writes single frames, and with no argument it renders the reel at 60 fps with 3 subframes per frame blended for
// motion blur (ffmpeg tmix), then mixes the voice and the cues and muxes them in.
// Run with NODE_PATH pointing at a folder that has playwright-core.
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = __dirname, OUT = path.join(ROOT, "out"), D = 41.2, FPS = 60, SUB = 3;
const BROWSER = fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")).map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];
const { SOUND } = require("../ae-core-reel/reel/sound.js");
const AUDIO = path.join(ROOT, "../ae-core-reel/media/audio");

async function open(browser) {
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on("pageerror", (e) => console.error("page:", e.message));
  await p.goto("file://" + path.join(ROOT, "reel.html") + "?t=0");
  await p.evaluate(() => window.ready);
  return p;
}
const shot = async (p, t, file) => {
  await p.evaluate((t) => window.seek(t), t);
  await p.screenshot({ path: file, type: file.endsWith(".png") ? "png" : "jpeg", quality: file.endsWith(".png") ? undefined : 92 });
};
function mix(file) {
  const cues = SOUND.all(), args = ["-v", "error", "-y"];
  for (const c of cues) args.push("-i", path.join(AUDIO, c.file + ".wav"));
  const f = cues.map((c, i) => `[${i}:a]aresample=48000,aformat=channel_layouts=stereo,volume=${c.gain},adelay=${Math.round(c.t * 1000)}:all=1[a${i}]`);
  f.push(`${cues.map((_, i) => `[a${i}]`).join("")}amix=inputs=${cues.length}:normalize=0:duration=longest,apad=whole_dur=${D},atrim=0:${D}[out]`);
  args.push("-filter_complex", f.join(";"), "-map", "[out]", "-c:a", "pcm_s16le", file);
  execFileSync("ffmpeg", args);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const [mode, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: BROWSER, args: ["--allow-file-access-from-files"] });
  if (mode === "stills") {
    const p = await open(browser);
    for (const t of rest.map(Number)) await shot(p, t, path.join(OUT, `still-${t.toFixed(2)}.png`));
  } else if (mode === "beats") {
    const p = await open(browser), dir = path.join(OUT, "beats");
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir);
    const times = SOUND.WORDS.map((w) => w[0] + 0.25).concat([39.9, 40.6, 41.18]);
    for (const [i, t] of times.entries()) await shot(p, t, path.join(dir, `${String(i).padStart(3, "0")}.jpg`));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(dir, "%03d.jpg"), "-vf", "scale=180:320,tile=11x8", "-frames:v", "1", path.join(OUT, "beats.jpg")]);
    console.log(times.length, "beats");
  } else {
    const dir = path.join(OUT, "sub"), N = Math.round(D * FPS) * SUB;
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir);
    const pages = await Promise.all(Array.from({ length: 4 }, () => open(browser)));
    let next = 0;
    const t0 = Date.now();
    await Promise.all(pages.map(async (p) => {
      while (next < N) {
        const i = next++;
        await shot(p, i / (FPS * SUB), path.join(dir, `${String(i).padStart(5, "0")}.jpg`));
        if (i % 600 === 0) console.log(`${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
    }));
    mix(path.join(OUT, "sound.wav"));
    // each output frame is the average of its three subframes
    execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS * SUB), "-i", path.join(dir, "%05d.jpg"), "-i", path.join(OUT, "sound.wav"),
      "-vf", `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`, "-r", String(FPS),
      "-c:v", "libx264", "-preset", "slow", "-b:v", "16M", "-maxrate", "20M", "-bufsize", "32M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
      "-map_metadata", "-1", "-fflags", "+bitexact", "-movflags", "+faststart", "-t", String(D), path.join(OUT, "allawi-orange-coin.mp4")]);
    console.log("done", ((Date.now() - t0) / 1000).toFixed(0), "s");
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
