"""Assemble index.html from src/template.html: the embedded font faces, the timeline script and the sound cues.
  ./sfx.sh && python3 build.py
Edit src/template.html (layout, copy), src/timeline.js (motion; every cue is in its T table) and the cue list below,
never index.html by hand. Sound times follow the T table in src/timeline.js; keep the two in step. Every sound is from
the user's own pack (sfx.sh copies them in); there is no music and no voice here: the user records the voice."""
import json, os, re, wave

here = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(here, *a)
D = 38


def dur(f):
    with wave.open(P(f)) as w:
        return round(w.getnframes() / w.getframerate(), 3)


sx = lambda n: f'assets/sfx/{n}.wav'


def read_T():
    """The cue table T from src/timeline.js (a plain JS object of numbers and arrays), so the word pops follow it."""
    js = open(P('src', 'timeline.js')).read()
    body = js[js.index('const T = {') + len('const T = '):]
    body = body[:body.index('};') + 1]
    body = re.sub(r'([A-Za-z_]\w*)\s*:', r'"\1":', body)
    return json.loads(re.sub(r',\s*([}\]])', r'\1', body))


T = read_T()
# Peaks (s into the file): flick 0.2, fastwhoosh 0.7, mainwhoosh 0.8, cinfast 0.25, simple 0.6, smooth 0.65, airy 0.4,
# riser 1.6, mpop/softpop/click2/clickb 0.1, the word pops ~0.02. A whoosh on a cut starts at (cut - peak).
C = []  # (time, sound, volume)

# ── a pop on every word that pops up: his «Normal Pop» five (rotating) for words, his «Premium And Smooth Pop» four for
# the key words (the coloured ones, «ليش؟»); levels evened out between the takes, all low under the voice
NPOP = [('npop1', 0.3), ('npop2', 0.2), ('npop3', 0.24), ('npop4', 0.22), ('npop5', 0.3)]
PPOP = [('ppop1', 0.22), ('ppop2', 0.15), ('ppop3', 0.2), ('ppop4', 0.15)]
KEY = {('s1w', 2), ('s1w', 3), ('s1w', 8), ('t3aw', 2), ('t3bw', 4), ('t4w', 1), ('why', 0), ('t7w', 4), ('t9w', 1)}
ni = pi = 0


def pops(name, times, first=0, quiet=()):
    """A pop on each word of a T entry (a time or a list of times); `first` skips words that are on from frame one."""
    global ni, pi
    times = times if isinstance(times, list) else [times]
    for i in range(first, len(times)):
        if (name, i) in KEY:
            n, v = PPOP[pi % len(PPOP)]; pi += 1
        else:
            n, v = NPOP[ni % len(NPOP)]; ni += 1
        C.append((times[i] + 0.02, n, round(v * (0.6 if i in quiet else 1), 3)))


pops('s1w', T['s1w'], first=2)                      # the hook (its first two words are on from frame one)
for k in ('t3aw', 't3bw', 't4w', 'why', 'bih'):
    pops(k, T[k])
for i, l in enumerate(T['l']):                      # the three handwritten lines
    pops(f'l{i}', l)
pops('t7w', T['t7w'], quiet=(5,))                   # the wide shot (the small note line quieter)
pops('sv', T['sv'])                                 # the four service labels
pops('t9w', T['t9w']); pops('s9b', T['s9b']); pops('s9c', T['s9c'])

# ── the rest: paper landing, moves, the stop, the list, the slams, the button (times follow T and MOVES)
C += [(2.7, 'data', 0.4)]                                               # the one-second bar fills
C += [(5.3 - 0.65, 'smooth', 0.28)]                                     # down to the phone
C += [(t, 'cinclick', 0.22) for t in (T['t3a'], T['t3b'], T['t7'], T['t9'])]   # torn strips land
C += [(T['stop'], 'cinclick', 0.45), (T['heart'], 'mpop', 0.35)]       # the scroll stops; the heart
C += [(11.8 - 0.8, 'mainwhoosh', 0.3), (T['ico'], 'softpop', 0.45)]    # across to «ليش؟»; the disc
C += [(T['three'], 'mpop', 0.4)]                                        # «٣ شغلات» lands
C += [(15.3 - 0.6, 'simple', 0.28), (18.85 - 0.6, 'simple', 0.26), (22.35 - 0.6, 'simple', 0.26)]   # the three prints
C += [(t, 'click2', 0.38) for t in T['tags']]                          # tags swing in
C += [(t, 'cinclick', 0.28) for t in T['ticks']]                       # ticks
C += [(t, 'select', 0.33) for t in T['hls']]                           # highlighter swipes
C += [(25.75 - 0.4, 'airy', 0.32)]                                      # the pull-back over the wall
C += [(29.55 - 0.25, 'cinfast', 0.3)]                                   # the dive to the services sheet
C += [(t + 0.32, 'cinclick', 0.18) for t in T['sv']]                   # each label's pin goes in
C += [(T['slam8'] - 0.15, 'flick', 0.3), (T['slam8'] + 0.32, 'ppop3', 0.2)]   # «وهوية كاملة.» slams in
C += [(33.1 - 0.7, 'fastwhoosh', 0.28)]                                 # down to the ask
C += [(T['slam9'] - 0.15, 'flick', 0.35), (T['slam9'] + 0.32, 'ppop2', 0.16), (T['plane'] - 0.15, 'airy', 0.22)]   # «راسلني»; the plane
C += [(T['btn'], 'mpop', 0.35), (T['click'], 'clickb', 0.6), (T['open'], 'sweet', 0.35)]   # the button, the click, it opens
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
