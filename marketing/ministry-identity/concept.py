"""Builds concept.html (A4, the identity's style) from concept-ar.txt, the concept write-up for the form (rule 3).
The .txt is the source: edit it, then run `python3 concept.py && node concept-pdf.cjs`."""
import html
import re

lines = open('concept-ar.txt', encoding='utf-8').read().strip().split('\n')
title, sub, org = lines[0], lines[1], lines[2]
body, lst = [], None
HEAD = re.compile(r'^(أولاً|ثانياً|ثالثاً|رابعاً|خامساً|سادساً|سابعاً|ثامناً|الخلاصة)')
for raw in lines[3:]:
    s = raw.strip()
    if not s:
        continue
    if HEAD.match(s):
        if lst: body.append(f'</{lst}>'); lst = None
        body.append(f'<h2>{html.escape(s)}</h2>')
    elif re.match(r'^\d+\.\s', s) or s.startswith('- '):
        kind = 'ol' if s[0].isdigit() else 'ul'
        if lst != kind:
            if lst: body.append(f'</{lst}>')
            body.append(f'<{kind}>'); lst = kind
        item = html.escape(re.sub(r'^(\d+\.|-)\s*', '', s))
        item = re.sub(r'^([^:]{2,40}):', r'<b>\1:</b>', item)          # bold the term before the colon
        item = re.sub(r'(#[0-9A-Fa-f]{6})', r'<bdi dir="ltr">\1</bdi>', item)   # colour codes read left to right
        body.append(f'<li>{item}</li>')
    else:
        if lst: body.append(f'</{lst}>'); lst = None
        body.append(f'<p>{html.escape(s)}</p>')
if lst: body.append(f'</{lst}>')

page = f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>Concept</title>
<link rel="stylesheet" href="fonts/fonts.css">
<style>
  @page {{ size: A4; margin: 0; }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: "IBM Plex Sans Arabic", sans-serif; color: #0c1b40; font-size: 9.6pt; line-height: 1.66; }}
  .band {{ height: 14px; }}
  header {{ background: #0c1b40; color: #fbf8f2; padding: 20px 44px 18px; display: flex; align-items: center; gap: 26px; }}
  header .t {{ font: 700 24pt/1.25 "Markazi Text"; }} header .s {{ font-size: 11pt; opacity: .85; margin-top: 2px; }}
  header .o {{ font-size: 9pt; opacity: .65; margin-top: 6px; }}
  main {{ padding: 12px 44px 0; }}
  h2 {{ font: 700 13pt "Markazi Text"; color: #17357d; margin: 11px 0 4px; padding-right: 14px; position: relative; break-after: avoid; }}
  h2::before {{ content: ""; position: absolute; right: 0; top: 9px; width: 8px; height: 8px; background: #c99a2e; }}
  p {{ margin-bottom: 6px; text-align: justify; }}
  ul, ol {{ padding-right: 22px; margin-bottom: 6px; }} li {{ margin-bottom: 2px; }} li::marker {{ color: #c99a2e; }}
  b {{ font-weight: 600; }}
</style></head><body>
<script src="marks.js"></script>
<script>
  const def = crenelBand('#17357d', 14);
  document.write(`<svg class="band" width="100%" height="14" style="display:block"><defs>${{def}}</defs><rect width="100%" height="14" fill="url(#cren-17357d)"/></svg>`);
</script>
<header><script>document.write(markSVG('gate', {{ ink: '#ece2d0', accent: '#c99a2e', bg: '#0c1b40' }}, 84))</script>
  <div><div class="t">{html.escape(title)}</div><div class="s">{html.escape(sub)}</div><div class="o">{html.escape(org)}</div></div></header>
<main>{"".join(body)}</main>
</body></html>'''
open('concept.html', 'w', encoding='utf-8').write(page)
print('concept.html')
