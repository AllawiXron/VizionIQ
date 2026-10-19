"""Assemble index.html from src/template.html: the embedded font faces, the timeline script, the transition clips'
start times and the sound cues.
  ./sfx.sh && python3 build.py            (DUR=6 python3 build.py for a short test cut)
Edit src/template.html (layout, copy), src/timeline.js (motion; every cue is in its T table) and the cue list below,
never index.html by hand. Sound times follow T. Every sound is from the user's own pack (sfx.sh copies them in); no
music, no voice-over yet. Then render at 120 fps and run ./post.sh, which blends it down to the reference's look."""
import json, os, re, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'
js = open(P('src', 'timeline.js')).read()


def read_obj(name):
    body = js[js.index(f'const {name} = {{') + len(f'const {name} = '):]
    body = body[:body.index('};') + 1]
    body = re.sub(r'([A-Za-z_]\w*)\s*:', r'"\1":', body)
    return json.loads(re.sub(r',\s*([}\]])', r'\1', body))


T = read_obj('T')
D = float(re.search(r'const D = ([\d.]+);', js).group(1))
D = float(os.environ.get('DUR', D))
# Peaks (s into the file): flick 0.2, fastwhoosh 0.7, mainwhoosh 0.8, cinfast 0.25, simple 0.6, smooth 0.65, airy 0.4.
C = []  # (time, sound, volume)
NPOP = [('npop1', 0.3), ('npop2', 0.2), ('npop3', 0.24), ('npop4', 0.22), ('npop5', 0.3)]
PPOP = [('ppop1', 0.22), ('ppop2', 0.15), ('ppop3', 0.2), ('ppop4', 0.15)]
ni = pi = 0


def pop(t, key=False):
    global ni, pi
    if key:
        n, v = PPOP[pi % 4]; pi += 1
    else:
        n, v = NPOP[ni % 5]; ni += 1
    C.append((t + 0.02, n, v))


def slam(t):        # a big word lands: the fast whoosh into it, a hit on it
    C.extend([(t - 0.15, 'flick', 0.34), (t + 0.02, 'mpop', 0.42)])


def whoosh(t, n='cinfast', v=0.3):   # peaking at t
    peak = {'cinfast': 0.25, 'simple': 0.6, 'smooth': 0.65, 'fastwhoosh': 0.7, 'mainwhoosh': 0.8, 'airy': 0.4}[n]
    C.append((max(0, t - peak), n, v))


# A · the hook
pop(T['hook'][2], True)
for t in T['bubs']:
    whoosh(t + 0.15, 'simple', 0.16); C.append((t + 0.2, 'ding', 0.2))
whoosh(T['outA'] + 0.15)
# B
pop(T['mahad']); slam(T['buy']); whoosh(T['outB'] + 0.15)
# C
whoosh(T['tag'] + 0.2, 'smooth', 0.22)
for t in T['cw']:
    pop(t)
slam(T['price']); C.append((T['strike'], 'select', 0.32)); whoosh(T['outC'] + 0.15)
# D
whoosh(T['mega'] + 0.2, 'fastwhoosh', 0.26)
for i, t in enumerate(T['dw']):
    pop(t, i > 0)
slam(T['ads']); C.append((T['bar'], 'select', 0.25))
# the first flash, E
whoosh(T['cut1'], 'mainwhoosh', 0.36)
C += [(T['logo'], 'sweet', 0.32)]
for i, t in enumerate(T['ew']):
    pop(t, i in (1, 4, 5, 6))
C += [(T['parcel'] + 0.2, 'mpop', 0.32)]
whoosh(T['outE'] + 0.15)
# F · the four
for i, t in enumerate(T['beats']):
    whoosh(t + 0.2, 'simple', 0.24); pop(t + 0.05, True); C.append((t + 0.38, 'mpop', 0.26))
whoosh(T['outF'] + 0.12, 'cinfast', 0.26)
# G
for t in T['gw']:
    pop(t)
slam(T['sales']); C.append((T['coins'] + 0.2, 'sweet', 0.28))
# the second flash, H
whoosh(T['cut2'], 'fastwhoosh', 0.32)
for t in T['hw']:
    pop(t)
pop(T['forc'], True); slam(T['ask'])
whoosh(T['cb'] + 0.25, 'simple', 0.2); C.append((T['cb'] + 0.4, 'softpop', 0.35))
C += [(t, 'key', 0.45) for t in T['keys']]
for i, t in enumerate(T['hb']):
    pop(t, i == 2)
C += [(T['logo2'] + 0.3, 'softpop', 0.38), (T['logo2'] - 0.1, 'airy', 0.22)]
C = sorted(c for c in C if c[0] < D - 0.05)

lines = []
for i, (t, n, v) in enumerate(C):
    f = sx(n)
    lines.append(f'      <audio id="a{i}-{n}" src="{f}" data-start="{t:.3f}" data-duration="{min(dur(f), round(D - t, 3))}" data-track-index="{10 + i}" data-volume="{v}"></audio>')

tpl = open(P('src', 'template.html')).read()
fonts = open(P('assets', 'fonts', 'fonts.css')).read().rstrip('\n')
out = (tpl.replace('/*FONTFACES*/', fonts).replace('<!--AUDIO-->', '\n'.join(lines)).replace('/*TIMELINE*/', js.rstrip('\n'))
       .replace('data-duration="DUR"', f'data-duration="{D:g}"'))
for k, t in zip(('TR1', 'TR2'), T['tr']):
    out = out.replace(f'data-start="{k}"', f'data-start="{t}"') if t < D else re.sub(rf'\s*<video[^>]*data-start="{k}"[^>]*></video>', '', out)
open(P('index.html'), 'w').write(out)
print(len(C), 'sound cues,', D, 's')
