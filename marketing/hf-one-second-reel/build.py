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
# one take: a whoosh on every camera move, peaking at its middle (move times are MOVES in src/timeline.js)
C += [(round(m - 0.2, 2), 'flick', 0.22) for m in (0.36, 0.81, 1.26)]   # the hook's quick pans
C += [(t, 'uiclick', 0.45) for t in (0.05, 0.4, 0.85, 1.3)]             # each hook word lands
C += [(2.05 - 0.65, 'smooth', 0.3)]                                     # down to «يوقف على بوستك»
C += [(2.9, 'data', 0.45)]                                              # the one-second bar fills
C += [(4.9 - 0.7, 'fastwhoosh', 0.35), (5.05, 'airy', 0.25)]            # down to the phone; it slides in
C += [(round(t - 0.15, 2), 'flick', 0.12) for t in (5.4, 6.4, 7.4, 8.45, 9.2)]   # thumb flicks
C += [(t, 'cinclick', 0.35) for t in (5.35, 7.45, 10.15, 25.25, 32.4)]   # torn strips land
C += [(10.0, 'cinclick', 0.45), (10.45, 'mpop', 0.35)]                  # the stop; the heart
C += [(12.25 - 0.8, 'mainwhoosh', 0.35)]                                # across to «ليش؟»
C += [(12.55, 'softpop', 0.45)]                                         # the «؟» disc
C += [(14.52 - 0.6, 'simple', 0.3), (17.85 - 0.6, 'simple', 0.28), (21.25 - 0.6, 'simple', 0.28)]   # down the three prints
C += [(t, 'click2', 0.4) for t in (14.8, 18.1, 21.5)]                    # tags swing in
C += [(round(t - 0.2, 2), 'cinclick', 0.3) for t in (15.2, 18.5, 21.9)]  # ticks
C += [(t, 'select', 0.35) for t in (16.5, 19.9, 23.3)]                   # highlighter swipes
C += [(24.75 - 0.4, 'airy', 0.35)] + [(round(24.55 + i * 0.16, 2), 'softpop', 0.22) for i in range(4)]   # the pull-back; prints land
C += [(29.75 - 1.6, 'riser', 0.28), (28.57 - 0.25, 'cinfast', 0.35)]    # into the price
C += [(29.6, 'flick', 0.3), (29.75, 'money', 0.45)]                     # «بـ ٤٠ ألف»
C += [(32.02 - 0.7, 'fastwhoosh', 0.3)]                                 # down to the ask
C += [(33.0, 'flick', 0.35), (34.05, 'airy', 0.25)]                     # «راسلني»; the paper plane
C += [(35.4, 'mpop', 0.35), (36.35, 'clickb', 0.6), (36.45, 'sweet', 0.35)]   # the button, the click, it opens
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
