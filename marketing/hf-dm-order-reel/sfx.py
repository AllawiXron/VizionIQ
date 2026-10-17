"""Sounds this reel needs that the dollar reel's set doesn't have, synthesized (numpy) so they're ours to use:
  assets/sfx/key1-3.wav  phone keyboard taps (a short filtered noise click with a tiny body), three variants
  assets/sfx/ping.wav    a soft two-partial ping for the pulsing send button
  python sfx.py"""
import os, wave, numpy as np
here = os.path.dirname(os.path.abspath(__file__)); sr = 48000
def save(name, x):
    x = np.clip(x / (np.abs(x).max() + 1e-9) * 0.7, -1, 1)
    with wave.open(os.path.join(here, 'assets', 'sfx', name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes((x * 32767).astype(np.int16).tobytes())
rng = np.random.default_rng(9)
for k, (f0, dec) in enumerate([(1800, 900), (2300, 1100), (1500, 800)], 1):
    n = int(0.05 * sr); t = np.arange(n) / sr
    noise = rng.standard_normal(n)
    # a crude band-pass: difference of two one-pole lowpasses around f0
    def lp(x, fc):
        a = np.exp(-2 * np.pi * fc / sr); y = np.zeros_like(x); s = 0.0
        for i, v in enumerate(x): s = (1 - a) * v + a * s; y[i] = s
        return y
    click = (lp(noise, f0 * 1.6) - lp(noise, f0 * 0.6)) * np.exp(-t * dec)
    body = np.sin(2 * np.pi * (f0 / 6) * t) * np.exp(-t * 260) * 0.35
    save(f'key{k}.wav', click + body)
n = int(0.7 * sr); t = np.arange(n) / sr
ping = (np.sin(2 * np.pi * 1318.5 * t) + 0.35 * np.sin(2 * np.pi * 2637 * t)) * np.exp(-t * 7) * (1 - np.exp(-t * 900))
save('ping.wav', ping)
print('ok')
