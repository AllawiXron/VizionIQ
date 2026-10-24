// Renders reel.html: `beats` writes one frame per word of the voice as a contact sheet to check first, `stills 2.5 7`
// writes single frames, and with no argument it renders the reel at 60 fps with 3 subframes per frame blended for
// motion blur (ffmpeg tmix), then mixes the voice with the sound design from sfx.js and muxes them in. `sound` only
// rebuilds the sound, puts it on the rendered video, and writes the After Effects track (out/ae, ae/sfx_timeline.jsx).
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
// a plain 16-bit WAV: the fmt and data chunks and nothing else
function wav(file, pcm, sr = 48000, ch = 2) {
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(ch, 22); h.writeUInt32LE(sr, 24);
  h.writeUInt32LE(sr * ch * 2, 28); h.writeUInt16LE(ch * 2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, pcm]));
}
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const clock = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(2).padStart(5, "0")}`;

// the sound design is baked in the page (sfx.js), each cue to its own file for After Effects and all of them to one
// bus; the bus goes under the voice at its own gain
async function mix(page, file) {
  const got = await page.evaluate(async (D) => {
    const made = await StudioSoundEngine.bake(SFX.CUES);
    const pcm = (l, r) => {
      const b = new Int16Array(l.length * 2);
      for (let i = 0; i < l.length; i++) { b[2 * i] = Math.max(-1, Math.min(1, l[i])) * 32767; b[2 * i + 1] = Math.max(-1, Math.min(1, r[i])) * 32767; }
      const u = new Uint8Array(b.buffer);
      let s = "";
      for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      return btoa(s);
    };
    const bus = StudioSoundEngine.mix(made, D);
    return { bus: pcm(bus.l, bus.r), cues: made.map((m) => ({ id: m.id, t: m.t, start: m.start, dur: m.dur, track: m.track, kind: m.kind, pcm: pcm(m.l, m.r) })) };
  }, D);
  const ae = path.join(OUT, "ae"), dir = path.join(ae, "sfx");
  fs.rmSync(ae, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  wav(path.join(OUT, "sfx.wav"), Buffer.from(got.bus, "base64"));
  const cues = got.cues.map((c) => {
    const f = `${String(c.id).padStart(2, "0")}_${slug(c.track)}_${c.kind}.wav`;
    wav(path.join(dir, f), Buffer.from(c.pcm, "base64"));
    return { t: +c.start.toFixed(4), dur: +c.dur.toFixed(4), name: c.track, kind: c.kind, file: f, at: clock(c.t) };
  });
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", path.join(AUDIO, "voice.wav"), "-i", path.join(OUT, "sfx.wav"), "-filter_complex",
    `[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0[v];[v][1:a]amix=inputs=2:normalize=0:duration=longest,apad=whole_dur=${D},atrim=0:${D}[out]`,
    "-map", "[out]", "-c:a", "pcm_s16le", "-map_metadata", "-1", "-fflags", "+bitexact", file]);
  fs.copyFileSync(path.join(AUDIO, "voice.wav"), path.join(ae, "voice.wav"));
  const jsx = aeScript(cues);
  fs.writeFileSync(path.join(ae, "sfx_timeline.jsx"), jsx);
  fs.mkdirSync(path.join(ROOT, "ae"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "ae", "sfx_timeline.jsx"), jsx);
  const zip = path.join(OUT, "allawi_sfx_AE.zip");
  fs.rmSync(zip, { force: true });
  execFileSync("zip", ["-q", "-r", "-X", zip, "sfx_timeline.jsx", "voice.wav", "sfx"], { cwd: ae });
  console.log(cues.length, "cues");
}

// After Effects: the SFX_TIMELINE track with a green marker per cue, and every cue as its own green audio layer
function aeScript(cues) {
  return `// Orange Coin: the sound design as an After Effects track.
// Run it with the comp open (File > Scripts > Run Script File...). It needs the sfx folder beside it, and uses
// voice.wav and allawi-orange-coin.mp4 too if they are there. Without an open comp it makes allawi_orange_coin
// (1080x1920, 60 fps, ${D} s). Each cue lands as a green audio layer named after its track, and the null SFX_TIMELINE
// carries a green marker per cue, as long as the sound.
(function () {
  var D = ${D}, FPS = 60, GREEN = 9, YELLOW = 2;
  var CUES = ${JSON.stringify(cues, null, 0).replace(/},{/g, "},\n    {")};
  var here = File($.fileName).parent, notes = [];
  function imp(f) {
    if (!f.exists) return null;
    try { return app.project.importFile(new ImportOptions(f)); } catch (e) { notes.push(f.name + ": " + e.toString()); return null; }
  }
  app.beginUndoGroup("SFX_TIMELINE");
  var comp = app.project.activeItem, fresh = false;
  if (!(comp instanceof CompItem)) {
    comp = null;
    for (var i = 1; i <= app.project.numItems; i++) if (app.project.item(i) instanceof CompItem && app.project.item(i).name == "allawi_orange_coin") comp = app.project.item(i);
    if (!comp) { comp = app.project.items.addComp("allawi_orange_coin", 1080, 1920, 1, D, FPS); fresh = true; }
  }
  var folder = app.project.items.addFolder("SFX");
  if (fresh) {
    var reel = imp(File(here.fsName + "/allawi-orange-coin.mp4"));
    if (reel) { reel.parentFolder = folder; var rl = comp.layers.add(reel); rl.name = "reel"; rl.audioEnabled = false; }
  }
  var voice = imp(File(here.fsName + "/voice.wav"));
  if (voice) { voice.parentFolder = folder; var vl = comp.layers.add(voice); vl.name = "VOICE"; vl.startTime = 0; vl.label = YELLOW; }
  var made = 0;
  for (var c = 0; c < CUES.length; c++) {
    var q = CUES[c], item = imp(File(here.fsName + "/sfx/" + q.file));
    if (!item) { notes.push("missing sfx/" + q.file); continue; }
    item.parentFolder = folder;
    var L = comp.layers.add(item);
    L.name = q.name;
    L.startTime = q.t;
    L.label = GREEN;
    L.comment = q.at + " " + q.kind;
    made++;
  }
  var track = comp.layers.addNull(D);
  track.name = "SFX_TIMELINE";
  track.label = GREEN;
  track.startTime = 0;
  var marks = track.property("ADBE Marker");
  for (var m = 0; m < CUES.length; m++) {
    var mv = new MarkerValue(CUES[m].name);
    mv.duration = CUES[m].dur;
    try { mv.label = GREEN; } catch (e) {}
    marks.setValueAtTime(CUES[m].t, mv);
  }
  app.endUndoGroup();
  alert("SFX_TIMELINE: " + made + " cues placed in " + comp.name + "." + (notes.length ? "\\n" + notes.join("\\n") : ""));
})();
`;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const [mode, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: BROWSER, args: ["--allow-file-access-from-files"] });
  if (mode === "stills") {
    const p = await open(browser);
    for (const t of rest.map(Number)) await shot(p, t, path.join(OUT, `still-${t.toFixed(2)}.png`));
  } else if (mode === "sound") {
    const p = await open(browser), mp4 = path.join(OUT, "allawi-orange-coin.mp4"), tmp = path.join(OUT, "remux.mp4");
    await mix(p, path.join(OUT, "sound.wav"));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mp4, "-i", path.join(OUT, "sound.wav"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
      "-map_metadata", "-1", "-fflags", "+bitexact", "-movflags", "+faststart", "-t", String(D), tmp]);
    fs.renameSync(tmp, mp4);
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
    await mix(pages[0], path.join(OUT, "sound.wav"));
    // each output frame is the average of its three subframes
    execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS * SUB), "-i", path.join(dir, "%05d.jpg"), "-i", path.join(OUT, "sound.wav"),
      "-vf", `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`, "-r", String(FPS),
      "-c:v", "libx264", "-preset", "slow", "-b:v", "16M", "-maxrate", "20M", "-bufsize", "32M", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k",
      "-map_metadata", "-1", "-fflags", "+bitexact", "-movflags", "+faststart", "-t", String(D), path.join(OUT, "allawi-orange-coin.mp4")]);
    console.log("done", ((Date.now() - t0) / 1000).toFixed(0), "s");
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
