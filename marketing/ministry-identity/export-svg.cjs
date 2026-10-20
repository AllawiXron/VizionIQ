// node export-svg.cjs -> out/svg/: the gate as SVG to open in Illustrator (one compound path per colour, no overlaps).
const fs = require('fs'), path = require('path');
eval(fs.readFileSync(path.join(__dirname, 'marks.js'), 'utf8') + ';global.markSVG = markSVG; global.VIEW = VIEW;');
const out = (name, svg) => fs.writeFileSync(path.join(__dirname, 'out', 'svg', name), svg + '\n');
out('gate-blue.svg', markSVG('gate', { ink: '#17357D', accent: '#C99A2E' }, 600));
out('gate-black.svg', markSVG('gate', { ink: '#000000', accent: 'none' }, 600));   // one colour: the gold bands are open
out('gate-clay-on-night.svg', markSVG('gate', { ink: '#ECE2D0', accent: '#C99A2E' }, 600));   // for dark grounds (transparent)
