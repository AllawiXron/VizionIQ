"""Assemble index.html from src/template.html: the embedded font faces, the timeline script and the sound cues.
  ./sfx.sh && python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion; every cue is in its T table) and the cue list below,
never index.html by hand. Sound times follow the T table in src/timeline.js; keep the two in step. Every sound is from
the user's own pack (sfx.sh copies them in); there is no music and no voice here: the user records the voice."""
import os, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)
D = 38


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'
# Peaks (s into the file): flick 0.2, fastwhoosh 0.7, mainwhoosh 0.8, cinfast 0.25, simple 0.6, airy 0.4, wclick 0.3,
# riser 1.6, mpop/softpop/click2/clickb 0.1. A whoosh on a cut starts at (cut - peak). Times follow T in src/timeline.js.
C = []  # (time, sound, volume)
C += [(t, 'uiclick', 0.6) for t in (0.0, 0.45, 0.9, 1.35)]             # hook: a tick on every word / colour flip
C += [(2.85, 'data', 0.45)]                                             # the one-second bar fills
C += [(4.9 - 0.7, 'fastwhoosh', 0.4), (5.0, 'airy', 0.28)]              # whip-pan; the phone rises
C += [(round(t - 0.15, 2), 'flick', 0.14) for t in (5.3, 6.35, 7.4, 8.45, 9.2)]   # thumb flicks
C += [(t, 'cinclick', 0.35) for t in (5.25, 7.45, 24.95, 32.15)]         # torn strips land
C += [(10.0, 'cinclick', 0.45), (10.2, 'softpop', 0.3), (10.45, 'mpop', 0.35)]   # the stop; its strip; the heart
C += [(11.95 - 0.05, 'cinfast', 0.38)]                                  # zoom-through
C += [(12.3, 'softpop', 0.45), (14.0, 'wclick', 0.3)]                   # «؟» disc; it opens into the list
C += [(t, 'mpop', 0.3) for t in (14.5, 17.9, 21.3)] + [(round(t + 0.5, 2), 'click2', 0.4) for t in (14.5, 17.9, 21.3)]   # prints; tags
C += [(round(t - 0.2, 2), 'cinclick', 0.3) for t in (14.95, 18.35, 21.75)]   # ticks
C += [(t, 'select', 0.35) for t in (16.2, 19.6, 23.0)]                   # highlighter swipes
C += [(17.8 - 0.6, 'simple', 0.28), (21.2 - 0.6, 'simple', 0.28)]       # print swaps
C += [(24.6 - 0.8, 'mainwhoosh', 0.4), (24.8, 'softpop', 0.3)]          # whip-pan; the quzi print
C += [(t, 'flick', 0.12) for t in (25.2, 25.52, 25.84)]                  # the collage flies in
C += [(29.7 - 1.6, 'riser', 0.3), (28.25, 'cinfast', 0.35)]             # into the price; zoom-through
C += [(29.55, 'flick', 0.3), (29.7, 'money', 0.45)]                     # «بـ ٤٠ ألف»
C += [(31.6, 'wclick', 0.3), (32.8, 'flick', 0.35), (33.85, 'airy', 0.25)]   # circle opens; «راسلني»; paper plane
C += [(35.2, 'mpop', 0.35), (36.15, 'clickb', 0.6), (36.25, 'sweet', 0.35)]   # the button, the click, it opens
C.sort()

lines = []
for i, (t, n, v) in enumerate(C):
    f = sx(n)
    lines.append(f'      <audio id="a{i}-{n}" src="{f}" data-start="{t:.2f}" data-duration="{dur(f)}" data-track-index="{10 + i}" data-volume="{v}"></audio>')

tpl = open(P('src', 'template.html')).read()
fonts = open(P('assets', 'fonts', 'fonts.css')).read().rstrip('\n')
js = open(P('src', 'timeline.js')).read().rstrip('\n')
out = tpl.replace('/*FONTFACES*/', fonts).replace('<!--AUDIO-->', '\n'.join(lines)).replace('/*TIMELINE*/', js)
open(P('index.html'), 'w').write(out)
print(len(C), 'sound cues')
