// The two side cards for the share scene, drawn with the site's own share picture (shareCard in app.js) for two
// sample tests: the ping test the reel shows (١٢ ms with the line empty, ١٦٢ while it is busy) and a line at
// Karrada's average. NODE_PATH=/opt/node-tools/node_modules node cards.cjs
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path'), fs = require('fs');
(async () => {
  const server = spawn(process.execPath, [path.join(__dirname, '..', '..', 'iraq-internet-map', 'build', 'serve.cjs'), '8791'], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 600));
  const b = await chromium.launch(), p = await b.newPage();
  await p.goto('http://localhost:8791/#/about');
  await p.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 60000 });
  const cards = await p.evaluate(async () => {
    async function shareCard(o) {
      await Promise.all(['500', '700', '800'].map(w => document.fonts.load(`${w} 80px Rubik`, 'خطي ١٢')));
      const c = document.createElement('canvas'); c.width = 1080; c.height = 1920;
      const g = c.getContext('2d'), fg = o.light ? '#14202b' : '#ffffff';
      g.fillStyle = o.fill; g.fillRect(0, 0, 1080, 1920);
      g.direction = 'rtl'; g.textAlign = 'right'; g.fillStyle = fg;
      const line = (txt, y, size, w = 500, alpha = 1) => { g.globalAlpha = alpha; g.font = `${w} ${size}px Rubik`; g.fillText(txt, 980, y); g.globalAlpha = 1; };
      line(o.head, 470, 56, 500, 0.9); line(o.big, 900, 400, 800); line(o.unit, 1010, 56, 500);
      g.globalAlpha = 0.55; g.fillRect(100, 1090, 880, 6); g.globalAlpha = 1;
      g.font = '700 64px Rubik';
      const words = o.say.split(' '); let ln = '', y = 1210;
      for (const w of words) { const tt = ln ? ln + ' ' + w : w; if (g.measureText(tt).width > 880) { g.fillText(ln, 980, y); ln = w; y += 88; } else ln = tt; }
      if (ln) g.fillText(ln, 980, y);
      line('سرعة الإنترنت في العراق', 1780, 50, 700);
      g.textAlign = 'left'; g.font = '500 46px Rubik'; g.fillText(o.cta, 100, 1780);
      return c.toDataURL('image/png');
    }
    return {
      ping: await shareCard({ fill: '#12795a', head: 'البنك عندي بالكرادة', big: '١٢', unit: 'ملي ثانية', say: 'معدل منطقتي ٥، ووقت التحميل يصير عندي ١٦٢.', cta: 'افحص البنك مالتك' }),
      fast: await shareCard({ fill: '#5aa85e', head: 'خطي بالكرادة', big: '٨٧', unit: 'ميغابت في الثانية', say: 'ومعدل الكرادة ٨٧. خطي مثل جيراني.', cta: 'افحص خطك' }),
    };
  });
  for (const [k, v] of Object.entries(cards)) fs.writeFileSync(path.join(__dirname, 'public', 'site', `share-${k}.png`), Buffer.from(v.split(',')[1], 'base64'));
  await b.close(); server.kill();
})();
