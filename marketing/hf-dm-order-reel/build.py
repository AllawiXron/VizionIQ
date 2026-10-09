"""Assemble index.html from src/template.html: the embedded font faces, the timeline script and the sound cues.
  python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion, the T cue table) and the cue list below, never
index.html by hand. Sound times follow the T table in src/timeline.js; keep the two in step."""
import os, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'
kit = lambda n: f'assets/sfx-kit/{n}.wav'
C = []  # (time, file, volume)
# b01 hook: three slams, the notification, the push into it
C += [(t, sx('slap'), v) for t, v in ((0.07, 0.5), (0.3, 0.45), (0.52, 0.55))]
C += [(0.05, sx('flutter'), 0.25), (0.86, sx('got'), 0.55), (1.36, kit('u_swish_soft'), 0.18), (2.5, kit('u_whoosh_short'), 0.32)]
# b02 typing, send, typing dots, the reply
typed = [3.55 + i * (6.15 - 3.55) / 14 for i in range(14)]
C += [(round(t, 3), sx(f'key{1 + i % 3}'), 0.32) for i, t in enumerate(typed)]
C += [(6.25, sx('tick'), 0.45), (6.4, sx('sent'), 0.5), (7.6, sx('got'), 0.5)]
# b03 three samples, a soft swish with each push-in
for t in (8.35, 9.85, 11.35):
    C += [(t, sx('pop'), 0.45), (t + 0.2, kit('u_swish_soft'), 0.16)]
# b04 the question, the album, the grid opening and gathering
C += [(13.75, sx('sent'), 0.45), (14.3, sx('got'), 0.45), (14.75, kit('u_whoosh_short'), 0.22)]
C += [(round(14.83 + i * 0.07, 2), sx('tick'), 0.3) for i in range(6)]
C += [(15.3, sx('pop'), 0.3), (15.9, sx('pop'), 0.3), (17.95, kit('u_swish_soft'), 0.2)]
# b05 the receipt
C += [(18.7, sx('sent'), 0.45), (19.35, sx('pop'), 0.4), (19.55, sx('printer'), 0.55), (21.0, sx('marker'), 0.45)]
C += [(round(21.4 + i * 0.1, 2), sx('tick'), 0.22) for i in range(8)]
C += [(22.78, sx('thunk'), 0.75), (22.8, sx('slap'), 0.35), (23.85, sx('swipe'), 0.45), (24.35, sx('got'), 0.45)]
# b06 your turn
C += [(24.7, kit('u_whoosh_short'), 0.25)] + [(round(25.2 + k * 0.15, 2), sx('pop'), 0.35) for k in range(3)]
C += [(25.55, sx('scribble'), 0.3), (26.6, sx('tick'), 0.5), (26.62, sx('pop'), 0.4), (26.85, sx('key2'), 0.35)]
C += [(round(27.4 + dt, 2), sx('ping'), 0.32) for dt in (0, 0.8, 1.6)]
C.sort()

lines = ['      <audio id="a-music" src="assets/music/bed.wav" data-start="0" data-duration="31" data-track-index="10" data-volume="0.42"></audio>']
for i, (t, f, v) in enumerate(C):
    name = os.path.splitext(os.path.basename(f))[0].replace('u_', '')
    lines.append(f'      <audio id="a{i}-{name}" src="{f}" data-start="{t:.2f}" data-duration="{dur(f)}" data-track-index="{11 + i}" data-volume="{v}"></audio>')

tpl = open(P('src', 'template.html')).read()
fonts = open(P('assets', 'fonts', 'fonts.css')).read().rstrip('\n')
js = open(P('src', 'timeline.js')).read().rstrip('\n')
out = tpl.replace('/*FONTFACES*/', fonts).replace('<!--AUDIO-->', '\n'.join(lines)).replace('/*TIMELINE*/', js)
open(P('index.html'), 'w').write(out)
print(len(C), 'sound cues')
