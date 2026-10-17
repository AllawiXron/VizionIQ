"""Sound for a reel, synced to out/<ad>-timeline.json -> out/<ad>-sfx.wav (48 kHz stereo).
A rising pluck per layer (C D E G A), a whoosh as the layers fly apart, a rising whoosh into the snap-back, an impact
and a shimmer on the reveal. Usage: python sfx.py sala"""
import json
import sys
import wave

import numpy as np

ad = sys.argv[1] if len(sys.argv) > 1 else "sala"
tl = json.load(open(f"out/{ad}-timeline.json"))
SR = 48000
n = int(tl["duration"] * SR) + SR // 2
mix = np.zeros(n, np.float64)
rng = np.random.default_rng(3)

def place(sig, t, gain=1.0):
    i = int(t * SR); j = min(n, i + len(sig))
    if i < n: mix[i:j] += sig[: j - i] * gain

def env(length, attack, decay):
    t = np.arange(int(length * SR)) / SR
    return np.minimum(t / max(attack, 1e-4), 1) * np.exp(-t / decay)

def tone(f, length, decay, attack=0.004, harm=(1, 0.35, 0.12)):
    t = np.arange(int(length * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * f * (k + 1) * t) for k, a in enumerate(harm))
    return s * env(length, attack, decay)

def noise(length):
    return rng.standard_normal(int(length * SR))

def bandsweep(length, f0, f1, q=6):
    # noise through a moving resonant band (simple 2-pole filter), for whooshes
    x = noise(length); y = np.zeros_like(x); y1 = y2 = 0.0
    fs = np.geomspace(f0, f1, len(x))
    for i in range(len(x)):
        w = 2 * np.pi * fs[i] / SR; r = 1 - w / (2 * q)
        y0 = x[i] * (1 - r) + 2 * r * np.cos(w) * y1 - r * r * y2
        y[i] = y0; y2, y1 = y1, y0
    return y / (np.abs(y).max() + 1e-9)

def click(length=0.012):
    return noise(length) * env(length, 0.0005, 0.002)

notes = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5]
for i, t in enumerate(tl["layers"]):
    place(click(), t - 0.06, 0.25)                                   # cursor click on the eye
    place(tone(notes[i % len(notes)], 0.6, 0.16), t + 0.04, 0.38)    # the layer lands
    place(noise(0.03) * env(0.03, 0.001, 0.008), t + 0.04, 0.08)

e0, e1, h1, imp = tl["exp0"], tl["exp1"], tl["hold1"], tl["impact"]
w = bandsweep(e1 - e0 + 0.3, 250, 2600); w *= np.sin(np.linspace(0, np.pi, len(w))) ** 1.5
place(w, e0, 0.32)
w2 = bandsweep(imp - h1 + 0.02, 400, 5000); w2 *= np.linspace(0, 1, len(w2)) ** 2
place(w2, h1, 0.4)
boom = tone(55, 0.9, 0.28, harm=(1, 0.5, 0.2)) + noise(0.9) * env(0.9, 0.001, 0.025) * 0.5
place(boom, imp, 0.75)
for k, f in enumerate([1046.5, 1318.5, 1568.0, 2093.0]):
    place(tone(f, 1.6, 0.5, attack=0.01, harm=(1, 0.2)), imp + 0.05 + k * 0.05, 0.12)

mix *= 10 ** (-3 / 20) / (np.abs(mix).max() + 1e-9)                  # peak -3 dBFS
fade = int(0.4 * SR); mix[-fade:] *= np.linspace(1, 0, fade)
st = np.stack([mix, mix], 1)
with wave.open(f"out/{ad}-sfx.wav", "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
    wf.writeframes((st * 32767).astype(np.int16).tobytes())
print("saved", f"out/{ad}-sfx.wav", round(len(mix) / SR, 2), "s")
