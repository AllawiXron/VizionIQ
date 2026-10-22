"""Assemble index.html from src/template.html, src/timeline.js and src/reel.json (scenes, captions with their word
times, sound cues).
  ./sfx.sh && python3 voice_fit.py assets/voice-take.mp3 src/words-raw.json && python3 build.py
Every sound is from the user's own pack (sfx.sh copies them in); there is no music; the voice-over is assets/voice.wav
(not committed)."""
import json, os, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


R = json.load(open(P('src', 'reel.json')))
sx = lambda n: f'assets/sfx/{n}.wav'
C = []
# a pop on every word: his «Normal Pop» five in turn, his «Premium And Smooth Pop» on the coloured key words
NPOP = [('npop1', 0.24), ('npop2', 0.17), ('npop3', 0.2), ('npop4', 0.18), ('npop5', 0.24)]
PPOP = [('ppop1', 0.19), ('ppop2', 0.13), ('ppop3', 0.17), ('ppop4', 0.13)]
ni = pi = 0
for sc, top, size, text, times, *rest in R['lines']:
    for w, t in zip(text.split(' '), times):
        if w.startswith('*'):
            n, v = PPOP[pi % 4]; pi += 1
        else:
            n, v = NPOP[ni % 5]; ni += 1
        C.append((t + 0.02, n, v))
C += [tuple(c) for c in R['fx']]
C.sort()

lines = [f'      <audio id="a{i}-{n}" src="{sx(n)}" data-start="{t:.2f}" data-duration="{dur(sx(n))}" data-track-index="{10 + i}" data-volume="{v}"></audio>'
         for i, (t, n, v) in enumerate(C)]
if os.path.exists(P('assets', 'voice.wav')):
    lines.insert(0, f'      <audio id="voice" src="assets/voice.wav" data-start="0" data-duration="{dur("assets/voice.wav")}" data-track-index="9" data-volume="1"></audio>')
js = open(P('src', 'timeline.js')).read().rstrip('\n')
out = (open(P('src', 'template.html')).read().replace('__D__', f"{R['D']:g}").replace('<!--AUDIO-->', '\n'.join(lines))
       .replace('/*REEL*/', json.dumps(R, ensure_ascii=False)).replace('/*TIMELINE*/', js))
open(P('index.html'), 'w').write(out)
print(len(C), 'sound cues, D =', R['D'])
