"""Assemble index.html from src/template.html: the embedded font faces, the viZion mark, the timeline script, the
transition clips' start times and the sound cues.
  ./sfx.sh && python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion; every cue is in its T table) and the cue list below,
never index.html by hand. Sound times follow the T table in src/timeline.js. Every sound is from the user's own pack
(sfx.sh copies them in); there is no music and no voice-over yet."""
import json, os, re, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'


def read_T():
    """The cue table T from src/timeline.js (a plain JS object of numbers and arrays)."""
    js = open(P('src', 'timeline.js')).read()
    body = js[js.index('const T = {') + len('const T = '):]
    body = body[:body.index('};') + 1]
    body = re.sub(r'([A-Za-z_]\w*)\s*:', r'"\1":', body)
    return json.loads(re.sub(r',\s*([}\]])', r'\1', body))


T = read_T()
# Peaks (s into the file): flick 0.2, fastwhoosh 0.7, mainwhoosh 0.8, cinfast 0.25, airy 0.4, the pops ~0.02.
C = []  # (time, sound, volume)

# ── a pop on every word: his «Normal Pop» five in turn, his «Premium And Smooth Pop» four on the cyan key words
NPOP = [('npop1', 0.3), ('npop2', 0.2), ('npop3', 0.24), ('npop4', 0.22), ('npop5', 0.3)]
PPOP = [('ppop1', 0.22), ('ppop2', 0.15), ('ppop3', 0.2), ('ppop4', 0.15)]
KEY = {('s1w', 9), ('s1w', 10), ('s1w', 11), ('h2w', 1), ('h2w', 6), ('s3w', 2), ('s3b', 2)}
ni = pi = 0


def pops(name, times, first=0):
    global ni, pi
    for i in range(first, len(times)):
        if (name, i) in KEY:
            n, v = PPOP[pi % len(PPOP)]; pi += 1
        else:
            n, v = NPOP[ni % len(NPOP)]; ni += 1
        C.append((times[i] + 0.02, n, v))


pops('s1w', [t for i, t in enumerate(T['s1w']) if i not in (3, 4)], first=3)   # the hook (first line on from frame one)
pops('h2w', T['h2w']); pops('s3w', T['s3w']); pops('s3b', T['s3b'])

# ── the hook: a ding per message, «ومحد يشتري؟» hits, the selection box and the click
C += [(t, 'ding', 0.22) for t in T['bubs']]
C += [(T['s1w'][3], 'mpop', 0.35), (T['s1w'][4] - 0.15, 'flick', 0.3), (T['s1w'][4] + 0.02, 'ppop3', 0.22)]
C += [(T['sel'], 'select', 0.3), (T['click1'], 'clickb', 0.5)]
# ── the two moves, each with his flash clip on it, and a whoosh peaking on the flash
C += [(6.75 - 0.8, 'mainwhoosh', 0.34), (14.15 - 0.7, 'fastwhoosh', 0.3)]
# ── the course: the card opens, the four cards land, the two lines slam in
C += [(T['head2'], 'sweet', 0.3)]
C += [(t + 0.05, 'mpop', 0.3) for t in T['cards']]
for t in T['slam2']:
    C += [(t - 0.15, 'flick', 0.3), (t + 0.32, 'ppop2', 0.16)]
# ── the ask: «علّق بـ» hits, the comment box, a key per letter, send
C += [(T['slam3'] - 0.15, 'flick', 0.38), (T['slam3'] + 0.3, 'mpop', 0.4)]
C += [(T['cbox'], 'softpop', 0.35)]
C += [(t, 'key', 0.45) for t in T['keys']]
C += [(T['click3'], 'clickb', 0.55), (T['click3'] + 0.03, 'enter', 0.3)]
C += [(T['endmark'] - 0.3, 'airy', 0.25), (T['endmark'], 'softpop', 0.4)]
C.sort()

lines = []
for i, (t, n, v) in enumerate(C):
    f = sx(n)
    lines.append(f'      <audio id="a{i}-{n}" src="{f}" data-start="{t:.2f}" data-duration="{dur(f)}" data-track-index="{10 + i}" data-volume="{v}"></audio>')

tpl = open(P('src', 'template.html')).read()
fonts = open(P('assets', 'fonts', 'fonts.css')).read().rstrip('\n')
vz = open(P('src', 'vz-symbol.svg')).read().rstrip('\n')
js = open(P('src', 'timeline.js')).read().rstrip('\n')
out = (tpl.replace('<!--VZSYMBOL-->', vz).replace('/*FONTFACES*/', fonts).replace('<!--AUDIO-->', '\n'.join(lines))
       .replace('/*TIMELINE*/', js).replace('data-start="TR1"', f'data-start="{T["tr"][0]}"').replace('data-start="TR2"', f'data-start="{T["tr"][1]}"'))
open(P('index.html'), 'w').write(out)
print(len(C), 'sound cues')
