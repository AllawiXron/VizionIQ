"""Assemble index.html from src/template.html, src/timeline.js and the sound cues below.
  ./sfx.sh && python3 build.py
Sound times follow the T table in src/timeline.js. Every sound is from the user's own pack (sfx.sh copies them in);
there is no music; the voice-over is assets/voice.wav (not committed)."""
import json, os, re, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


js = open(P('src', 'timeline.js')).read()
D = float(re.search(r'const D = ([\d.]+);', js).group(1))
body = js[js.index('const T = {') + len('const T = '):]
body = body[:body.index('};') + 1]
T = json.loads(re.sub(r',\s*([}\]])', r'\1', re.sub(r'([A-Za-z_]\w*)\s*:', r'"\1":', body)))

sx = lambda n: f'assets/sfx/{n}.wav'
C = []
# a pop on every word: his «Normal Pop» five in turn, his «Premium And Smooth Pop» on the coloured key words
NPOP = [('npop1', 0.26), ('npop2', 0.18), ('npop3', 0.22), ('npop4', 0.2), ('npop5', 0.26)]
PPOP = [('ppop1', 0.2), ('ppop2', 0.14), ('ppop3', 0.18), ('ppop4', 0.14)]
KEY = {('a2', 1), ('b', 3), ('c', 3), ('d2', 2)}
ni = pi = 0
for k in ('a1', 'a2', 'b', 'c', 'd1', 'd2'):
    for i, t in enumerate(T[k]):
        if (k, i) in KEY:
            n, v = PPOP[pi % 4]; pi += 1
        else:
            n, v = NPOP[ni % 5]; ni += 1
        C.append((t + 0.02, n, v))
# the logos spring in; the whips; the corner burst; the cut and the drop
C += [(T['logos'][0], 'mpop', 0.32), (T['logos'][1], 'softpop', 0.3), (T['logos'][2], 'softpop', 0.26)]
C += [(T['whipAB'] - 0.2 + 0.12, 'flick', 0.32)]
C += [(t - 0.24, 'flick', 0.26) for t in T['swaps']]
C += [(t, 'softpop', 0.2) for t in T['burst']]
C += [(T['cut'], 'cinclick', 0.4), (T['drop'] - 0.1, 'fastwhoosh', 0.2), (T['drop'] + 0.5, 'mpop', 0.36), (T['drop'] + 0.5, 'cinclick', 0.25)]
C.sort()

lines = [f'      <audio id="a{i}-{n}" src="{sx(n)}" data-start="{t:.2f}" data-duration="{dur(sx(n))}" data-track-index="{10 + i}" data-volume="{v}"></audio>'
         for i, (t, n, v) in enumerate(C)]
if os.path.exists(P('assets', 'voice.wav')):
    lines.insert(0, f'      <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="{dur("assets/voice.wav")}" data-track-index="9" data-volume="1"></audio>')
out = open(P('src', 'template.html')).read().replace('__D__', f'{D:g}').replace('<!--AUDIO-->', '\n'.join(lines)).replace('/*TIMELINE*/', js.rstrip('\n'))
open(P('index.html'), 'w').write(out)
print(len(C), 'sound cues, D =', D)
