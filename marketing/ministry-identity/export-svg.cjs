// node export-svg.cjs -> out/svg/: the mark as SVG to open in Illustrator. One compound path per colour, no overlaps,
// grouped and named: Mark > Gate (the towers, wall and inner bands) and Arches (the two gold bands).
const fs = require('fs'), path = require('path');
eval(fs.readFileSync(path.join(__dirname, 'marks.js'), 'utf8') + ';global.gate = gate; global.VIEW = VIEW;');
const svg = (title, c) => {
  const [x, y, w, h] = VIEW.gate;
  const [ink, gold] = gate(c).match(/<path[^>]*\/>/g).concat(['']);
  const named = (p, id) => p.replace('<path ', `<path id="${id}" `);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w * 2}" height="${h * 2}">
  <title>${title}</title>
  <g id="Mark">
    ${named(ink, 'Gate')}${gold ? '\n    ' + named(gold, 'Arches') : ''}
  </g>
</svg>
`;
};
const out = (name, s) => fs.writeFileSync(path.join(__dirname, 'out', 'svg', name), s);
out('gate-blue.svg', svg('Ministry of Digital Economy and Governance - mark, colour', { ink: '#17357D', accent: '#C99A2E' }));
out('gate-clay-on-night.svg', svg('Ministry of Digital Economy and Governance - mark, colour for dark backgrounds', { ink: '#ECE2D0', accent: '#C99A2E' }));
out('gate-black.svg', svg('Ministry of Digital Economy and Governance - mark, one colour', { ink: '#000000', accent: 'none' }));
