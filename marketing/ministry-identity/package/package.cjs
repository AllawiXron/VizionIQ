// node package/package.cjs -> out/final/Ministry-Identity-Proposal-Ali-Ahmed-Shihab.zip, the competition submission.
// Run node doc.cjs --final and deck.cjs --final first (the presentation with the designer's contact), and
// anim/render.cjs for the animation. Everything lands in out/final/ (git-ignored).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs'); const { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'out', 'final');
const NAME = 'Ministry-Identity-Proposal-Ali-Ahmed-Shihab';
const PKG = path.join(OUT, NAME);
const cp = (from, to) => { fs.mkdirSync(path.dirname(path.join(PKG, to)), { recursive: true }); fs.copyFileSync(path.join(ROOT, from), path.join(PKG, to)); };

(async () => {
  fs.rmSync(PKG, { recursive: true, force: true });
  // 1 the presentation, 2 the concept
  cp('out/final/ministry-identity-proposal.pdf', '01-Presentation/Ministry-Identity-Proposal.pdf');
  cp('out/final/ministry-identity-proposal.pptx', '01-Presentation/Ministry-Identity-Proposal.pptx');
  cp('out/concept-ar.pdf', '02-Concept/Concept.pdf');
  cp('concept-ar.txt', '02-Concept/Concept.txt');
  // 3 the logo: SVG from export-svg.cjs, and every version as vector PDF and transparent PNG
  execFileSync('node', [path.join(ROOT, 'export-svg.cjs')]);
  cp('out/svg/gate-blue.svg', '03-Logo/SVG/mark-color.svg');
  cp('out/svg/gate-clay-on-night.svg', '03-Logo/SVG/mark-color-on-dark.svg');
  cp('out/svg/gate-black.svg', '03-Logo/SVG/mark-black.svg');
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2400, height: 1600 }, deviceScaleFactor: 4 });
  const names = await (async () => { await p.goto('file://' + path.join(__dirname, 'logos.html')); return p.evaluate(() => Object.keys(window.VARIANTS)); })();
  for (const v of names) {
    await p.goto('file://' + path.join(__dirname, 'logos.html') + '?v=' + v); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    const el = await p.$('#art'); const r = await el.boundingBox();
    fs.mkdirSync(path.join(PKG, '03-Logo/PNG'), { recursive: true }); fs.mkdirSync(path.join(PKG, '03-Logo/PDF'), { recursive: true });
    await el.screenshot({ path: path.join(PKG, '03-Logo/PNG', v + '.png'), omitBackground: true });
    await p.pdf({ path: path.join(PKG, '03-Logo/PDF', v + '.pdf'), width: Math.ceil(r.width) + 'px', height: Math.ceil(r.height) + 'px', printBackground: false, pageRanges: '1' });
  }
  await b.close();
  // 4 the animation, 5 the mockups
  cp('anim/out/logo-animation.mp4', '04-Animation/Logo-Animation.mp4');
  for (const m of ['stationery', 'devices', 'sign']) cp(`print/renders/${m}.png`, `05-Mockups/${m}.png`);
  // the guide to the files, and the fonts
  cp('package/README.txt', 'README.txt');
  fs.rmSync(path.join(OUT, NAME + '.zip'), { force: true });
  execFileSync('zip', ['-r', '-q', '-X', NAME + '.zip', NAME], { cwd: OUT });
  console.log(path.join(OUT, NAME + '.zip'));
})();
