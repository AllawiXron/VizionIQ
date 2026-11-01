// Writes the Orange Coin as an EffectCraft package in out/ec: reel.json (comps, layers, keys), footage/ (cut-outs,
// paper, phone reels, the two drawings as PNGs, the voice and the 47 sound cues) and the cue list. build_reel.jsx
// then makes the project from it. Needs `node render.cjs sound` first (for out/ae) and NODE_PATH with playwright-core.
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path"), { execFileSync } = require("child_process");
const ROOT = path.join(__dirname, ".."), OUT = path.join(ROOT, "out", "ec"), FOOT = path.join(OUT, "footage");
const BROWSER = fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")).map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(path.join(FOOT, "sfx"), { recursive: true });
  const browser = await chromium.launch({ executablePath: BROWSER, args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on("pageerror", (e) => console.error("page:", e.message));
  await page.goto("file://" + path.join(ROOT, "reel.html") + "?t=0");
  await page.evaluate(() => window.ready);
  await page.addScriptTag({ path: path.join(__dirname, "describe.js") });
  const reel = await page.evaluate(() => window.describeReel());

  // the drawings (the underline, the bulb's glow) as PNGs at their size on the page
  const drawings = [];
  for (let id = 0; await page.evaluate((id) => !!window.__raster[id], id); id++) {
    const r = await page.evaluate((id) => window.isolate(id), id);
    const file = `drawing-${id + 1}.png`;
    await page.screenshot({ path: path.join(FOOT, file), clip: { x: r.x, y: r.y, width: Math.max(1, r.w), height: Math.max(1, r.h) }, omitBackground: true });
    await page.evaluate((id) => window.unisolate(id), id);
    drawings.push(file);
  }
  await browser.close();

  // every file a layer uses, copied once under a plain name
  const used = new Map();
  const local = (src) => {
    const p = decodeURIComponent(new URL(src).pathname);
    if (!used.has(p)) {
      const name = path.basename(p);
      // the phone reels are copied without their container and encoder tags
      if (/\.webm$/.test(name)) execFileSync("ffmpeg", ["-v", "error", "-y", "-i", p, "-map", "0", "-c", "copy", "-map_metadata", "-1", "-map_metadata:s", "-1", "-fflags", "+bitexact", path.join(FOOT, name)]);
      else fs.copyFileSync(p, path.join(FOOT, name));
      used.set(p, name);
    }
    return used.get(p);
  };
  for (const c of reel.comps) for (const l of c.layers) {
    if (l.src) { l.file = local(l.src); delete l.src; }
    if (l.raster !== undefined) { l.file = drawings[l.raster]; l.name = ["underline", "bulb glow"][l.raster] || l.name; delete l.raster; }
  }
  // layer bars only where something shows, on whole frames
  const frame = (t) => Math.round(t * reel.fps) / reel.fps;
  for (const c of reel.comps) for (const l of c.layers) {
    if (l.seen) { l.in = Math.max(l.in, l.seen[0]); l.out = Math.min(l.out, l.seen[1]); }
    delete l.seen;
    l.in = frame(l.in);
    l.out = frame(l.out);
  }
  // the voice, line by line, as markers on the main comp: words that follow each other within 0.45 s are one line
  const { SOUND } = require("../../ae-core-reel/reel/sound.js");
  const words = [];
  for (const c of reel.comps) for (const l of c.layers) if (l.type === "text") words.push(l);
  const lines = [];
  for (const [t] of SOUND.WORDS) {
    const w = words.filter((l) => Math.abs(l.in - t) < 0.06).sort((a, b) => a.in - b.in)[0];
    if (!w) continue;
    const last = lines[lines.length - 1];
    if (last && t - last.end < 0.45) { last.text += " " + w.text; last.end = t; } else lines.push({ t, end: t, text: w.text });
  }
  reel.markers = lines.map((l) => ({ t: frame(l.t), text: l.text }));
  // where each scene of reel.html begins: the wallet, the orange, the page, the 3, the lens, the panel, the chess, the dark
  // stage, the page again, the crowd, the last orange
  reel.scenes = [0, 2.8, 7.6, 12.6, 14.4, 16.26, 19.0, 23.3, 26.45, 28.3, 35.25];
  // and every word as a marker on the voice layer, which the camera's push reads
  reel.words = SOUND.WORDS.map(([t]) => {
    const w = words.find((l) => Math.abs(l.in - t) < 0.06);
    return { t, text: w ? w.text : "" };
  });
  // each scene comp starts at its own zero and lasts as long as it is on screen, the way scenes are cut by hand
  const shift = (track, d) => track && track.t && (track.t = track.t.map((t) => frame(t - d)));
  function retime(c, d) {
    for (const l of c.layers) {
      l.in = frame(l.in - d);
      l.out = frame(l.out - d);
      if (l.start !== undefined) l.start = frame(l.start - d);
      for (const p of ["px", "py", "scale", "rot", "opacity", "rx", "ry", "blur", "mask"]) shift(l[p], d);
      if (l.type === "comp") {
        const sub = reel.comps[l.comp];
        sub.duration = frame(l.out - l.in);
        l.start = l.in;
        // its layers are still on the reel's own clock: shift them by where this comp starts on that clock
        retime(sub, d + l.in);
      }
    }
  }
  reel.comps[reel.main].duration = reel.duration;
  retime(reel.comps[reel.main], 0);
  // sound: the voice and the cues as After Effects gets them
  const AE = path.join(ROOT, "out", "ae");
  fs.copyFileSync(path.join(AE, "voice.wav"), path.join(FOOT, "voice.wav"));
  const jsx = fs.readFileSync(path.join(AE, "sfx_timeline.jsx"), "utf8");
  const cues = JSON.parse(jsx.match(/var CUES = (\[[\s\S]*?\]);/)[1]);
  for (const q of cues) fs.copyFileSync(path.join(AE, "sfx", q.file), path.join(FOOT, "sfx", q.file));
  reel.audio = { voice: "voice.wav", cues };
  fs.writeFileSync(path.join(OUT, "reel.json"), JSON.stringify(reel));
  // PNG drawings: pixels only
  for (const f of drawings) execFileSync("python3", ["-c", "import sys;from PIL import Image;im=Image.open(sys.argv[1]);im.load();im.save(sys.argv[1])", path.join(FOOT, f)]);
  const n = reel.comps.reduce((a, c) => a + c.layers.length, 0);
  const k = reel.comps.reduce((a, c) => a + c.layers.reduce((b, l) => b + ["px", "py", "scale", "rot", "opacity", "rx", "ry", "blur", "mask"].reduce((s, p) => s + (l[p] && l[p].t ? l[p].t.length : 0), 0), 0), 0);
  console.log(`${reel.comps.length} comps, ${n} layers, ${k} keys, ${used.size} footage files, ${drawings.length} drawings, ${cues.length} cues`);
})().catch((e) => { console.error(e); process.exit(1); });
