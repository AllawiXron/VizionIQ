"""Assemble index.html from src/template.html: the embedded font faces, the timeline script and the sound cues.
  ./sfx.sh && python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion; every cue is in its T table) and the cue list below,
never index.html by hand."""
import os

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)
lines = []
tpl = open(P('src', 'template.html')).read()
fonts = open(P('assets', 'fonts', 'fonts.css')).read().rstrip('\n')
js = open(P('src', 'timeline.js')).read().rstrip('\n')
vz = open(P('src', 'vz-symbol.svg')).read().rstrip('\n')
open(P('index.html'), 'w').write(tpl.replace('<!--VZSYMBOL-->', vz).replace('/*FONTFACES*/', fonts).replace('<!--AUDIO-->', '\n'.join(lines)).replace('/*TIMELINE*/', js))
