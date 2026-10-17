// node textures.cjs [name...] -> tex/<name>.png (white on transparent masks for the Blender materials)
// a label's optional 5th value shrinks its art about the centre (the jar is short, so its label is smaller)
const { chromium } = require('playwright');
const path = require('path');
const T = [['wrap-logo'], ['wrap-label', 'label-pump', 'غسول ماء الورد', 'ROSE WATER CLEANSER'], ['wrap-label', 'label-jar', 'كريم الورد المرطب', 'ROSE MOISTURE CREAM', 0.72],
  ['wrap-label', 'label-tube', 'كريم اليدين بالورد', 'ROSE HAND CREAM'], ['rose-only'], ['pattern']];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2100, height: 2100 } });
  await p.goto('file://' + path.join(__dirname, 'textures.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  const only = process.argv.slice(2);
  for (const [id, name = id, ar, en, scale = 1] of T) {
    if (only.length && !only.includes(name)) continue;
    if (ar) await p.evaluate(([id, ar, en, scale]) => {
      document.querySelector(`#${id} [data-text]`).textContent = ar; document.querySelector(`#${id} [data-en]`).textContent = en;
      document.querySelector(`#${id} [data-inner]`).style.transform = `scale(${scale})`;
    }, [id, ar, en, scale]);
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'tex', name + '.png'), omitBackground: true });
    console.log(name);
  }
  await b.close();
})();
