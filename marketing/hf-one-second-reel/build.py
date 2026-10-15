"""Assemble index.html from src/template.html: the embedded font faces, the timeline script and the sound cues.
  ./sfx.sh && python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion; every cue is in its T table) and the cue list below,
never index.html by hand. Sound times follow the T table in src/timeline.js; keep the two in step. Every sound is from
the user's own pack (sfx.sh copies them in); there is no music and no voice here: the user records the voice."""
import os, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)
D = 45


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'
# Peaks (s into the file): flick 0.2, fastwhoosh 0.7, mainwhoosh 0.8, cinfast 0.25, simple 0.6, airy 0.4, wclick 0.3,
# riser 1.6, mpop/softpop/click2/clickb 0.1. A whoosh on a cut starts at (cut - peak). Times follow T in src/timeline.js.
C = []  # (time, sound, volume)
C += [(t, 'uiclick', 0.6) for t in (0.0, 0.45, 0.9, 1.35)]             # hook: a tick on every word / colour flip
C += [(3.0, 'data', 0.45)]                                              # the one-second bar fills
C += [(5.3 - 0.7, 'fastwhoosh', 0.4), (5.3, 'airy', 0.28)]              # whip-pan; the phone rises
C += [(round(t - 0.15, 2), 'flick', 0.14) for t in (5.7, 6.85, 8.0, 9.15, 10.3)]   # thumb flicks
C += [(11.2, 'cinclick', 0.5), (11.7, 'mpop', 0.35)]                    # the stop; the double-tap heart
C += [(13.35 - 0.05, 'cinfast', 0.38)]                                  # zoom-through
C += [(13.75, 'softpop', 0.45), (15.8, 'wclick', 0.3)]                  # «؟» icon; it opens into the list
C += [(16.3, 'mpop', 0.25)] + [(round(t - 0.1, 2), 'click2', 0.5) for t in (16.75, 20.95, 25.15)]   # first card; list dots
C += [(t, 'select', 0.35) for t in (18.3, 22.3, 26.7)]                   # the selections
C += [(20.45 - 0.6, 'simple', 0.28), (24.65 - 0.6, 'simple', 0.28)]     # card swaps
C += [(28.8 - 0.8, 'mainwhoosh', 0.4), (29.0, 'softpop', 0.3)]          # whip-pan; the quzi post
C += [(t, 'flick', 0.12) for t in (29.4, 29.72, 30.04)]                  # the collage flies in
C += [(34.35 - 1.6, 'riser', 0.3), (32.85, 'cinfast', 0.35)]            # into the price; zoom-through
C += [(34.2, 'flick', 0.3), (34.35, 'money', 0.45)]                     # «بـ ٤٠ ألف»
C += [(36.75, 'wclick', 0.3)]                                           # the circle opens
C += [(37.9, 'flick', 0.35)]                                            # «بوست»
C += [(42.1, 'mpop', 0.35), (43.05, 'clickb', 0.6), (43.15, 'sweet', 0.35)]   # the button, the click, it opens
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
