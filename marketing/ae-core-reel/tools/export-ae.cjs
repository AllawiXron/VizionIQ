// Writes ae/build_reel_in_AE.jsx: runs the page, takes the layers the exporter compiles from the master timeline and
// puts them into the builder script. Every character outside ASCII is written as \u escape, so ExtendScript reads the
// Arabic the same on any system. Run with NODE_PATH pointing at a folder that has playwright-core.
const { chromium } = require("playwright-core");
const fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, "..");
const BROWSER = process.env.CHROME || fs.readdirSync("/opt/pw-browsers").filter((d) => d.startsWith("chromium_headless_shell")).map((d) => `/opt/pw-browsers/${d}/chrome-linux/headless_shell`)[0];

(async () => {
  const browser = await chromium.launch({ executablePath: BROWSER, args: ["--allow-file-access-from-files"] });
  const p = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on("pageerror", (e) => console.error("page:", e.message));
  await p.goto("file://" + path.join(ROOT, "index.html") + "?render");
  await p.waitForFunction(() => window.Core && Core.ready, null, { timeout: 60000 });
  const doc = await p.evaluate(() => Core.Exporter.build());
  await browser.close();
  for (const w of doc.warnings) console.warn("overlap:", w);
  delete doc.warnings;
  const json = JSON.stringify(doc).replace(/[\u007f-￿]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0"));
  const tpl = fs.readFileSync(path.join(ROOT, "engine/ae-builder.jsx"), "utf8");
  if (!tpl.includes("/*DOC*/null")) throw new Error("no data slot in the builder");
  fs.mkdirSync(path.join(ROOT, "ae"), { recursive: true });
  fs.writeFileSync(path.join(ROOT, "ae/build_reel_in_AE.jsx"), tpl.replace("/*DOC*/null", json).replace(/[\u007f-￿]/g, (c) => "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")));
  const kinds = {};
  for (const l of doc.layers) kinds[l.type] = (kinds[l.type] || 0) + 1;
  console.log(doc.layers.length, "layers", JSON.stringify(kinds));
})().catch((e) => { console.error(e); process.exit(1); });
