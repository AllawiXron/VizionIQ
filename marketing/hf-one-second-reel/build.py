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
# Peaks (s into the file): flick 0.2, mainwhoosh 0.8, fastwhoosh 0.7, hifast 0.45, smooth 0.65, deep 0.2, riser 1.6,
# shutter 0.1, stretch 0.35. A whoosh on a cut starts at (cut - peak).
C = []  # (time, sound, volume)
# S1 hook: the scroll ratchet and the first flick; «ثانية وحدة» lands; «يعبر؟»
C += [(0.0, 'gear', 0.18), (0.0, 'flick', 0.3), (0.42, 'click', 0.45), (2.05, 'mpop', 0.25)]
C += [(2.6, 'mainwhoosh', 0.35)]                                       # cut 3.4 (flash 16)
# S2: four flicks, then the long one that stops dead on his post
C += [(t - 0.05, 'flick', 0.28) for t in (4.2, 4.9, 5.6, 6.3)] + [(6.9, 'fastwhoosh', 0.35)]
# S3: time stops, the double-tap heart, «ليش؟»
C += [(7.6, 'timestop-cut', 0.3), (7.95, 'pop', 0.5), (8.7, 'click', 0.3)]
C += [(9.35, 'hifast', 0.35)]                                          # cut 9.8 (flash 19)
# the three rules: badge pop, the card flies in, the marker circle
for t in (9.8, 13.0, 16.2):
    C += [(t + 0.05, 'mpop', 0.35), (t + 0.1, 'flick', 0.2), (t + 1.0, 'stretch', 0.3)]
C += [(12.35, 'smooth', 0.3), (15.55, 'smooth', 0.3)]                 # cuts 13.0, 16.2 (vip overlay)
C += [(19.2, 'deep', 0.4)]                                             # cut 19.4 (flash 4)
# S5: seven cards land, the riser into the price, the cash sound on «٤٠ ألف»
C += [(round(19.7 + i * 0.16, 2), 'shutter', 0.28) for i in range(7)]
C += [(20.5, 'riser', 0.3), (22.05, 'money', 0.5)]
C += [(23.75, 'hifast', 0.35)]                                         # cut 24.2 (flash 6)
# S6: «بوست» lands, typed, sent; his reply; the handle
C += [(24.62, 'click', 0.35)] + [(t, 'key', 0.45) for t in (25.5, 25.62, 25.74, 25.86)]
C += [(26.2, 'send', 0.4), (26.9, 'ding', 0.3), (28.1, 'correct', 0.3)]
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
