"""Assemble index.html from src/template.html: the embedded font faces, the timeline script and the sound cues.
  python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion, the T cue table) and the cue list below, never
index.html by hand. Sound times follow the T table in src/timeline.js; keep the two in step."""
import os, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)
D = 25


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'
kit = lambda n: f'assets/sfx-kit/{n}.wav'
dr = lambda n: f'assets/sfx-drive/{n}.wav'   # the user's own pack (drive-sfx.sh)
C = []  # (time, file, volume)
# S1: five prints slam down, the tag, the fan, five stamps on the drop
C += [(t, sx('slap'), v) for t, v in ((0.02, 0.5), (1.0, 0.55), (2.0, 0.55), (2.75, 0.5), (3.0, 0.55))]
C += [(0.0, dr('shutter'), 0.5), (0.35, sx('tick'), 0.4), (3.25, sx('flutter'), 0.4), (3.3, kit('u_swish_soft'), 0.2)]
C += [(2.0, dr('riser'), 0.5)]   # builds into the drop; cut at its peak, on the first stamp
C += [(t, sx('thunk'), v) for t, v in zip((4.0, 4.15, 4.3, 4.45, 4.6), (0.85, 0.7, 0.7, 0.7, 0.75))]
C += [(4.0, sx('boom'), 0.35)]
# S2: the cut, «ليش؟» written, the tilt, the layers lift apart, four labels, back together, out
C += [(4.7, dr('whoosh'), 0.45), (5.1, sx('marker'), 0.4), (5.45, sx('paper'), 0.35), (6.0, kit('u_swish_soft'), 0.3)]
C += [(round(t, 2), dr('pop'), 0.45) for t in (6.3, 6.55, 6.8, 7.05)]
C += [(8.0, kit('u_swish_soft'), 0.25), (8.3, sx('paper'), 0.3), (9.35, dr('whoosh-fly'), 0.5)]   # peaks as the ad leaves, over the cut
# S3: three prints, tape, two tags, «محلك؟» written, the arrow
C += [(t, sx('slap'), 0.5) for t in (10.0, 11.0, 12.0)] + [(t, sx('tick'), 0.35) for t in (10.2, 11.2, 12.2)]
C += [(10.35, dr('pop'), 0.4), (11.35, dr('pop'), 0.4), (12.3, sx('scribble'), 0.35), (12.75, sx('marker'), 0.4)]
# S4: the sticky note, crossed out, ripped off; the price list pinned and written
C += [(13.7, dr('whoosh'), 0.4), (14.0, sx('slap'), 0.5), (14.17, sx('tick'), 0.4), (15.0, sx('marker'), 0.45), (15.14, sx('marker'), 0.45), (15.75, sx('rip'), 0.6)]
C += [(16.0, sx('slap'), 0.55), (16.17, sx('tick'), 0.4)] + [(t, sx('scribble'), 0.2) for t in (16.15, 16.4, 16.62, 16.85, 17.05, 17.25)]
C += [(17.5, sx('marker'), 0.45), (17.6, dr('money'), 0.35), (18.1, sx('thunk'), 0.7)]   # the cash sound on «٣ بوستات · ٤٠ ألف»; «الأوفر» stamped
# S5: the note, the writing, the handle cut out of magazines, the paper plane
C += [(19.7, dr('whoosh'), 0.4), (20.0, sx('slap'), 0.55), (21.2, sx('scribble'), 0.35)] + [(round(22.0 + i * 0.07, 2), dr('click'), 0.45) for i in range(11)]
C += [(22.9, sx('marker'), 0.4)]
C.sort()

lines = [f'      <audio id="a-music" src="assets/music/bed.wav" data-start="0" data-duration="{D}" data-track-index="10" data-volume="0.5"></audio>',
         f'      <audio id="a-hiss" src="assets/sfx/hiss.wav" data-start="0" data-duration="{D}" data-track-index="11" data-volume="0.12"></audio>']
for i, (t, f, v) in enumerate(C):
    name = os.path.splitext(os.path.basename(f))[0].replace('u_', '')
    lines.append(f'      <audio id="a{i}-{name}" src="{f}" data-start="{t:.2f}" data-duration="{dur(f)}" data-track-index="{12 + i}" data-volume="{v}"></audio>')

tpl = open(P('src', 'template.html')).read()
fonts = open(P('assets', 'fonts', 'fonts.css')).read().rstrip('\n')
js = open(P('src', 'timeline.js')).read().rstrip('\n')
out = tpl.replace('/*FONTFACES*/', fonts).replace('<!--AUDIO-->', '\n'.join(lines)).replace('/*TIMELINE*/', js)
open(P('index.html'), 'w').write(out)
print(len(C), 'sound cues')
