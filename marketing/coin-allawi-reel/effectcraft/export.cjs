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
