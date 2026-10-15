"""Assemble index.html from src/template.html: the embedded font faces, the timeline script and the sound cues.
  ./sfx.sh && python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion; every cue is in its T table) and the cue list below,
never index.html by hand. Sound times follow the T table in src/timeline.js; keep the two in step. Every sound is from
the user's own pack (sfx.sh copies them in); there is no music and no voice here: the user records the voice."""
import os, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)
D = 30


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'
# Peaks (s into the file): flick 0.2, fastwhoosh 0.7, mainwhoosh 0.8, cinfast 0.25, simple 0.6, airy 0.4, wclick 0.3,
# riser 1.6, mpop/softpop/click2/clickb 0.1. A whoosh on a cut starts at (cut - peak). Times follow T in src/timeline.js.
C = []  # (time, sound, volume)
C += [(t, 'uiclick', 0.6) for t in (0.0, 0.4, 0.8, 1.15)]              # hook: a tick on every word / colour flip
C += [(1.85, 'data', 0.45)]                                             # the one-second bar fills
C += [(3.4 - 0.7, 'fastwhoosh', 0.4), (3.25, 'airy', 0.3)]              # whip-pan; the phone rises
C += [(round(t - 0.15, 2), 'flick', 0.16) for t in (3.6, 4.4, 5.2, 6.0, 6.78)]   # thumb flicks
C += [(7.6, 'cinclick', 0.5), (7.85, 'mpop', 0.35)]                     # the stop; the double-tap heart
C += [(8.55 - 0.05, 'cinfast', 0.4)]                                    # zoom-through
C += [(8.8, 'softpop', 0.45), (9.62, 'wclick', 0.3)]                    # «؟» icon; it opens into the list
C += [(10.0, 'mpop', 0.25)] + [(round(t - 0.05, 2), 'click2', 0.5) for t in (10.1, 13.15, 16.35)]   # first card; list dots
C += [(t, 'select', 0.35) for t in (11.55, 14.45, 17.65)]                # the selections
C += [(12.95 - 0.5, 'simple', 0.3), (16.15 - 0.5, 'simple', 0.3)]       # card swaps
C += [(19.42 - 0.8, 'mainwhoosh', 0.4), (19.55, 'softpop', 0.3)]        # whip-pan; the quzi post
C += [(t, 'flick', 0.14) for t in (19.75, 19.93, 20.11)]                 # the collage flies in
C += [(22.75 - 1.6, 'riser', 0.3), (21.7, 'cinfast', 0.35)]             # into the price; zoom-through
C += [(22.6, 'flick', 0.3), (22.75, 'money', 0.45)]                     # «بـ ٤٠ ألف»
C += [(24.15, 'wclick', 0.3)]                                           # the circle opens
C += [(24.85, 'flick', 0.35)]                                           # «بوست»
C += [(28.1, 'mpop', 0.35), (28.8, 'clickb', 0.6), (28.9, 'sweet', 0.35)]   # the button, the click, it opens
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
