"""Tighten the voice take: every pause longer than 0.35 s is cut down (to 0.26 s, or 0.45 s before the two open loops),
nothing else is touched (no denoise, EQ or compression; one fixed gain so the peaks sit at -1.5 dB, 30 ms fades at the
cuts). Writes assets/voice.wav and src/words.json (each word's start and end on the new clock).
  python3 voice_fit.py assets/voice-take.mp3 words-raw.json"""
import json, subprocess, sys, wave, os
import numpy as np

here = os.path.dirname(os.path.abspath(__file__))
SR = 48000
src, words_src = sys.argv[1], sys.argv[2]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ar', str(SR), '-ac', '1', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
hop = SR // 100
rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same'))[::hop]
quiet = rms < 10 ** (-40 / 20)

# pauses: runs of quiet frames longer than 0.35 s
pauses, i = [], 0
while i < len(quiet):
    if quiet[i]:
        j = i
        while j < len(quiet) and quiet[j]:
            j += 1
        if (j - i) / 100 > 0.35:
            pauses.append((i / 100, j / 100))
        i = j
    else:
        i += 1
LONG = (29.3, 43.4)   # the open loops: «بس هذا مو أغرب شي», «والأغرب من هذا كله»
keep = lambda a, b: 0.45 if any(abs(b - t) < 0.4 for t in LONG) else 0.26

# build the new take: speech pieces with each pause cut to its new length (the cut sits in the middle of the pause)
pieces, cuts, t0 = [], [], 0.0
for a, b in pauses:
    k = keep(a, b)
    m0, m1 = a + k / 2, b - k / 2
    pieces.append((t0, m0)); cuts.append((m0, m1)); t0 = m1
pieces.append((t0, len(x) / SR))
fade = int(0.03 * SR)
out = []
for a, b in pieces:
    seg = x[int(a * SR):int(b * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    out.append(seg)
y = np.concatenate(out)
y *= 10 ** (-1.5 / 20) / max(1e-6, np.abs(y).max())
with wave.open(os.path.join(here, 'assets', 'voice.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())


def remap(t):
    """old time -> new time: subtract every cut that ends before t (a time inside a cut lands on the cut point)"""
    s = 0.0
    for m0, m1 in cuts:
        if t >= m1:
            s += m1 - m0
        elif t > m0:
            return round(m0 - s, 2)
    return round(t - s, 2)


W = [[remap(a), remap(b), w] for a, b, w in json.load(open(words_src))]
json.dump(W, open(os.path.join(here, 'src', 'words.json'), 'w'), ensure_ascii=False)
print(f'{len(pauses)} pauses cut, {len(x) / SR:.2f} s -> {len(y) / SR:.2f} s')
