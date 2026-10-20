// node doc.cjs [page.html] [out.pdf] -> out/ministry-identity-proposal.pdf (vector, A4 landscape) and out/doc-N.png previews.
const { chromium } = require('playwright'); const path = require('path');
const page = process.argv[2] || 'proposal.html', pdf = process.argv[3] || path.join(__dirname, 'out', 'ministry-identity-proposal.pdf');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  await p.goto('file://' + path.join(__dirname, page)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const pages = await p.$$('.page');
  for (let i = 0; i < pages.length; i++) await pages[i].screenshot({ path: path.join(__dirname, 'out', `doc-${i + 1}.png`) });
  await p.pdf({ path: pdf, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  console.log(pages.length, 'pages'); await b.close();
})();
