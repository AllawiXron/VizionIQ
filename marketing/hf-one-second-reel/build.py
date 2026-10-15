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
# one take: a soft whoosh on each camera move, peaking at its middle (moves are MOVES in src/timeline.js)
C += [(t, 'uiclick', 0.4) for t in (0.0, 0.6, 0.95)]                    # the hook words
C += [(2.7, 'data', 0.4)]                                               # the one-second bar fills
C += [(5.3 - 0.65, 'smooth', 0.28)]                                     # down to the phone
C += [(t, 'cinclick', 0.32) for t in (5.55, 7.95, 26.1, 33.2)]           # torn strips land
C += [(10.1, 'cinclick', 0.45), (10.15, 'softpop', 0.3), (10.45, 'mpop', 0.35)]   # the stop; its strip; the heart
C += [(11.8 - 0.8, 'mainwhoosh', 0.3), (11.95, 'softpop', 0.45), (13.7, 'mpop', 0.4)]   # across to «ليش؟»; the disc; «٣ شغلات»
C += [(15.3 - 0.6, 'simple', 0.28), (18.85 - 0.6, 'simple', 0.26), (22.35 - 0.6, 'simple', 0.26)]   # the three prints
C += [(t, 'click2', 0.38) for t in (15.6, 19.1, 22.6)]                   # tags swing in
C += [(t, 'cinclick', 0.28) for t in (15.75, 19.2, 22.7)]                # ticks
C += [(t, 'select', 0.33) for t in (17.25, 20.6, 24.2)]                   # highlighter swipes
C += [(25.75 - 0.4, 'airy', 0.32)]                                      # the pull-back over the wall
C += [(30.45 - 1.6, 'riser', 0.26), (29.55 - 0.25, 'cinfast', 0.3)]      # the dive into the price
C += [(30.3, 'flick', 0.3), (30.45, 'money', 0.45)]                     # «بـ ٤٠ ألف»
C += [(33.1 - 0.7, 'fastwhoosh', 0.28)]                                 # down to the ask
C += [(33.8, 'flick', 0.35), (34.7, 'airy', 0.22)]                      # «راسلني»; the paper plane
C += [(35.8, 'mpop', 0.35), (36.6, 'clickb', 0.6), (36.7, 'sweet', 0.35)]   # the button, the click, it opens
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
