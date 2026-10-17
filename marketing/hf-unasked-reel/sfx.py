"""Sounds this reel needs that the dollar reel's set doesn't have, synthesized (numpy) so they're ours to use:
  assets/sfx/rip.wav   a sticky note torn off a board: a burst of crackle (dense random clicks through a band-pass)
                       that speeds up and thins out, over a soft paper body
  python sfx.py"""
import os, wave, numpy as np
here = os.path.dirname(os.path.abspath(__file__)); sr = 48000
def save(name, x):
    x = np.clip(x / (np.abs(x).max() + 1e-9) * 0.7, -1, 1)
    with wave.open(os.path.join(here, 'assets', 'sfx', name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x * 32767).astype(np.int16).tobytes())
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / sr); y = np.zeros_like(x); s = 0.0
    for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
    return y
rng = np.random.default_rng(15)
n = int(0.42 * sr); t = np.arange(n) / sr
env = np.clip(t / 0.015, 0, 1) * np.exp(-t * 7.5)
clicks = np.zeros(n)
pos = 0.0
while pos < 0.36:
    i = int(pos * sr); clicks[i:i + 24] += rng.uniform(0.4, 1.0) * np.exp(-np.arange(min(24, n - i)) / 5.0) * rng.choice([-1, 1])
    pos += rng.uniform(0.0012, 0.006) * (1 + pos * 4)
noise = rng.standard_normal(n)
crackle = lp(clicks, 7000) - lp(clicks, 900)
body = (lp(noise, 3500) - lp(noise, 600)) * 0.35
save('rip.wav', (crackle + body) * env)
print('rip.wav')
