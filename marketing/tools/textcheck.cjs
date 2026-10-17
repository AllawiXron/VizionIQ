// Text-collision check on the rendered glyphs, not on layout boxes (Arabic display fonts draw hamzas, dots and tall
// letters well outside their line boxes, so box checks miss real collisions).
//
//   node textcheck.cjs <page.html> <root selector> [more pages/selectors as pairs...]
//   e.g. node textcheck.cjs ../ig-offer/fixed-prices.html '#story' ../brand-ads-2026/qi.html '#ad'
//
// For every root matching the selector (each .art, #ad, .slide ...), every element that holds its own text is rendered
// alone (everything else hidden; shadows and glows off), so its mask is the ink of its letters plus its own background
// when it is a chip (pill, badge, tag). The masks are compared pairwise. Reports:
//   COLLISION  two text elements whose ink touches or comes within GAP px (ancestor/descendant pairs are skipped)
//   EDGE       text ink touching the root's edge (clipped)
// Exit code 1 when anything is found.
const { chromium } = require('playwright');
const path = require('path');

const GAP = 3;          // px of clear space required between two pieces of text
const MIN_HIT = 6;      // overlapping pixels (at half resolution) before a collision is reported

const CSS = `
  html, body { background:transparent !important }
  .tc-root { background:none !important }
  .tc-root::before, .tc-root::after { display:none !important }
  .tc-root * { visibility:hidden !important; transition:none !important; animation:none !important }
  .tc-root .tc-on, .tc-root .tc-on * { visibility:visible !important; text-shadow:none !important; filter:none !important }
  .tc-root .tc-on { box-shadow:none !important; outline:none !important }`;   /* a chip's own background/border counts as part of it */

async function checkPage(browser, file, sel) {
  const page = await browser.newPage({ viewport: { width: 4800, height: 2400 }, deviceScaleFactor: 1 });
  await page.goto('file://' + path.resolve(file));
  await page.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 8000 }).catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  await page.addStyleTag({ content: CSS });
  const roots = await page.$$eval(sel, (els) => els.map((e, i) => { if (!e.id) e.id = 'tc-root-' + i; return e.id; }));
  const lab = await browser.newPage();
  await lab.setContent('<canvas id=c></canvas>');
  const issues = [];
  for (const id of roots) {
    // text holders inside this root
    const items = await page.evaluate((id) => {
      const root = document.getElementById(id);
      const out = [];
      root.querySelectorAll('*').forEach((el) => {
        if (el.closest('template,script,style')) return;
        const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
        if (!own) return;
        const r = el.getBoundingClientRect();
        if (!r.width || !r.height || getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).display === 'none') return;
        el.dataset.tc = out.length;
        out.push({ i: out.length, text: el.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) });
      });
      // ancestor relations, so parent/child pairs are not compared
      const els = out.map((o) => root.querySelector(`[data-tc="${o.i}"]`));
      out.forEach((o, a) => { o.anc = els.map((e, b) => b !== a && (e.contains(els[a]) || els[a].contains(e))).map((v, b) => (v ? b : -1)).filter((b) => b >= 0); });
      return out;
    }, id);
    if (!items.length) continue;
    const loc = page.locator('#' + id);
    await page.evaluate((id) => document.getElementById(id).classList.add('tc-root'), id);
    await lab.evaluate(() => { window.M = []; });
    for (const it of items) {
      await page.evaluate(({ id, i }) => {
        document.querySelectorAll('.tc-on').forEach((e) => e.classList.remove('tc-on'));
        document.querySelector(`#${id} [data-tc="${i}"]`).classList.add('tc-on');
      }, { id, i: it.i });
      const b64 = (await loc.screenshot({ omitBackground: true })).toString('base64');
      await lab.evaluate(async ({ b64, gap }) => {
        const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
        const w = Math.ceil(img.width / 2), h = Math.ceil(img.height / 2), c = document.getElementById('c');
        c.width = w; c.height = h; const g = c.getContext('2d'); g.clearRect(0, 0, w, h); g.drawImage(img, 0, 0, w, h);
        const a = g.getImageData(0, 0, w, h).data, m = new Uint8Array(w * h);
        for (let k = 0; k < w * h; k++) m[k] = a[k * 4 + 3] > 60 ? 1 : 0;
        const r = Math.max(1, Math.round(gap / 4)), d = new Uint8Array(w * h);   // dilate by half the gap on each mask
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x])
          for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && yy < h && xx >= 0 && xx < w) d[yy * w + xx] = 1; }
        let x0 = w, y0 = h, x1 = -1, y1 = -1, edge = 0;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (m[y * w + x]) {
          if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y;
          if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge++;
        }
        window.M.push({ d, w, h, box: [x0, y0, x1, y1], edge, empty: x1 < 0 });
      }, { b64, gap: GAP });
    }
    await page.evaluate(() => document.querySelectorAll('.tc-root,.tc-on').forEach((e) => e.classList.remove('tc-root', 'tc-on')));
    const found = await lab.evaluate(({ items, min }) => {
      const res = [];
      M.forEach((A, a) => { if (!A.empty && A.edge > 2) res.push({ kind: 'EDGE', a, box: A.box }); });
      for (let a = 0; a < M.length; a++) for (let b = a + 1; b < M.length; b++) {
        const A = M[a], B = M[b];
        if (A.empty || B.empty || items[a].anc.includes(b)) continue;
        const x0 = Math.max(A.box[0], B.box[0]) - 2, y0 = Math.max(A.box[1], B.box[1]) - 2, x1 = Math.min(A.box[2], B.box[2]) + 2, y1 = Math.min(A.box[3], B.box[3]) + 2;
        if (x0 > x1 || y0 > y1) continue;
        let n = 0, bx = [1e9, 1e9, -1, -1];
        for (let y = Math.max(0, y0); y <= Math.min(A.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(A.w - 1, x1); x++) {
          const k = y * A.w + x;
          if (A.d[k] && B.d[k]) { n++; bx = [Math.min(bx[0], x), Math.min(bx[1], y), Math.max(bx[2], x), Math.max(bx[3], y)]; }
        }
        if (n >= min) res.push({ kind: 'COLLISION', a, b, n, box: bx });
      }
      return res;
    }, { items, min: MIN_HIT });
    for (const f of found) {
      const box = f.box.map((v) => v * 2);
      issues.push(f.kind === 'EDGE'
        ? `${file} #${id}  EDGE       "${items[f.a].text}" touches the frame edge`
        : `${file} #${id}  COLLISION  "${items[f.a].text}"  x  "${items[f.b].text}"  around x ${box[0]}-${box[2]}, y ${box[1]}-${box[3]}`);
    }
    console.log(`${file} #${id}: ${items.length} text elements, ${found.length} issue(s)`);
  }
  await lab.close(); await page.close();
  return issues;
}

(async () => {
  const args = process.argv.slice(2);
  if (args.length < 2 || args.length % 2) { console.error('usage: node textcheck.cjs <page.html> <root selector> [...]'); process.exit(2); }
  const browser = await chromium.launch();
  let all = [];
  for (let k = 0; k < args.length; k += 2) all = all.concat(await checkPage(browser, args[k], args[k + 1]));
  await browser.close();
  console.log(all.length ? '\n' + all.join('\n') : '\nclean: no text collisions');
  process.exit(all.length ? 1 : 0);
})();
