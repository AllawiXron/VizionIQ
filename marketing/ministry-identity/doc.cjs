// node doc.cjs          -> out/ministry-identity-proposal.pdf (vector, A4 landscape) and out/doc-N.png previews,
//                          with placeholders for the designer's name and contact (this is the committed copy).
// node doc.cjs --final  -> the same in out/final/, with the name and contact from who.json (both git-ignored).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const final = process.argv.includes('--final');
const dir = path.join(__dirname, 'out', final ? 'final' : ''); fs.mkdirSync(dir, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  if (final) await p.addInitScript(`window.WHO = ${fs.readFileSync(path.join(__dirname, 'who.json'), 'utf8')};`);
  await p.goto('file://' + path.join(__dirname, 'proposal.html')); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const pages = await p.$$('.page');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(dir, `doc-${i + 1}.png`) });
  await p.pdf({ path: path.join(dir, 'ministry-identity-proposal.pdf'), width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  console.log(pages.length, 'pages ->', dir); await b.close();
})();
