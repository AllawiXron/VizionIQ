// node textures.cjs -> tex/<name>.png (white on transparent masks for the Blender materials)
const { chromium } = require('playwright');
const path = require('path');
const T = [['wrap-logo'], ['wrap-label', 'label-pump', 'غسول ماء الورد', 'ROSE WATER CLEANSER'], ['wrap-label', 'label-jar', 'كريم الورد المرطب', 'ROSE MOISTURE CREAM'],
  ['wrap-label', 'label-tube', 'كريم اليدين بالورد', 'ROSE HAND CREAM'], ['rose-only'], ['pattern']];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2100, height: 2100 } });
  await p.goto('file://' + path.join(__dirname, 'textures.html'));
  await p.waitForFunction(() => document.body.dataset.ready === '1');
  for (const [id, name = id, ar, en] of T) {
    if (ar) await p.evaluate(([id, ar, en]) => { document.querySelector(`#${id} [data-text]`).textContent = ar; document.querySelector(`#${id} [data-en]`).textContent = en; }, [id, ar, en]);
    await p.locator('#' + id).screenshot({ path: path.join(__dirname, 'tex', name + '.png'), omitBackground: true });
    console.log(name);
  }
  await b.close();
})();
