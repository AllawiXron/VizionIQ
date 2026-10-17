"""Synthesizes every sound in the videos into ../public/sfx/ (48 kHz stereo WAV). Nothing is sampled or licensed:
each sound is built here from sine waves and filtered noise, so the videos are free of copyright claims.
No instruments or music, only clicks, drops, air and weather.

  pop-1..8    a soft bubble pop for each word, pitched a little higher each time (satisfying, not a melody)
  drop-1..4   a deeper water drop, for the words of the verse
  whoosh      air moving past, for camera moves
  step        a soft footstep
  riser       swelling air that pulls into the verse
  boom        the verse impact: low thump, air burst and a long shimmer tail
  sparkle     a light airy sweep, for the shooting star
  rain        a 16 s rain bed (hiss + random droplets)
  wind        the 16 s wind bed

Usage: python make_sfx.py   (needs numpy, scipy)
"""
import os

import numpy as np
from scipy import signal
from scipy.io import wavfile

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "public", "sfx")
os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(1)


def t(sec):
    return np.arange(int(SR * sec)) / SR


def env(n, attack, decay):
    """fast attack, exponential decay (seconds)"""
    x = np.arange(n) / SR
    return np.minimum(x / max(attack, 1e-4), 1) * np.exp(-np.maximum(x - attack, 0) / decay)


def bp(x, lo, hi, order=2):
    return signal.sosfilt(signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)


def lp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "lowpass", fs=SR, output="sos"), x)


def hp(x, f, order=2):
    return signal.sosfilt(signal.butter(order, f, "highpass", fs=SR, output="sos"), x)


def sweep(f0, f1, sec, curve=3.0):
    """sine whose pitch glides from f0 to f1 (fast at first)"""
    x = t(sec)
    f = f1 + (f0 - f1) * np.exp(-x * curve / sec * 4)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def room(x, sec=0.6, level=0.18, tone=3500):
    """a small, soft room: convolve with decaying filtered noise"""
    ir = lp(rng.normal(0, 1, int(SR * sec)), tone) * np.exp(-t(sec) / (sec / 5))
    ir[0] = 0
    wet = signal.fftconvolve(x, ir)[: len(x) + len(ir) - 1]
    dry = np.concatenate([x, np.zeros(len(ir) - 1)])
    return dry + wet / (np.abs(ir).sum() ** 0.5) * level * 8


def stereo(x, width=0.0, pan=0.0):
    """mono -> stereo; width decorrelates a little, pan -1..1"""
    d = int(SR * 0.0007 * width)
    l, r = x.copy(), np.concatenate([np.zeros(d), x[: len(x) - d]]) if d else x.copy()
    return np.stack([l * (1 - max(pan, 0)), r * (1 + min(pan, 0))], 1)


def save(name, x, peak=0.8):
    if x.ndim == 1:
        x = stereo(x)
    fade = min(len(x) // 4, int(SR * 0.01))
    x[-fade:] *= np.linspace(1, 0, fade)[:, None]
    x = x / np.abs(x).max() * peak
    wavfile.write(os.path.join(OUT, name + ".wav"), SR, (x * 32767).astype(np.int16))
    print(f"{name:10s} {len(x) / SR:5.2f}s")


# word pops: a quick upward pitch flick with a tiny click on top, a touch of room
for i in range(8):
    base = 430 * 2 ** (i / 12 * 1.6)  # rises by small, irregular steps (not a scale)
    n = int(SR * 0.16)
    body = sweep(base * 0.75, base * 1.9, 0.16, curve=2.4) * env(n, 0.002, 0.038)
    click = hp(rng.normal(0, 1, n), 2500) * env(n, 0.0005, 0.003) * 0.35
    save(f"pop-{i + 1}", room(body + click, 0.35, 0.10), 0.7)

# verse drops: lower, rounder, longer
for i in range(4):
    base = 240 * 2 ** (i / 12 * 2)
    n = int(SR * 0.4)
    body = sweep(base * 0.7, base * 2.3, 0.4, curve=1.6) * env(n, 0.003, 0.09)
    sub = np.sin(2 * np.pi * base * 0.5 * t(0.4)) * env(n, 0.004, 0.06) * 0.4
    save(f"drop-{i + 1}", room(body + sub, 0.9, 0.22, 2500), 0.75)

# whoosh: noise through a band that sweeps up then down, panned across
n = int(SR * 0.9)
x = t(0.9)
shape = np.sin(np.pi * np.clip(x / 0.9, 0, 1)) ** 2.2
noise = rng.normal(0, 1, n)
centre = 400 + 2400 * np.sin(np.pi * x / 0.9) ** 2
out = np.zeros(n)
for k in range(0, n, 1200):  # piecewise band-pass following the sweep
    seg = slice(k, min(k + 1200, n))
    c = centre[k]
    out[seg] = bp(noise[max(k - 4000, 0): seg.stop], c * 0.6, min(c * 1.6, 20000))[-(seg.stop - seg.start):]
w = out * shape
pan = np.linspace(-0.7, 0.7, n)
save("whoosh", np.stack([w * (1 - np.clip(pan, 0, 1)), w * (1 + np.clip(pan, -1, 0))], 1), 0.7)

# footstep: soft heel thump + a little grit
n = int(SR * 0.18)
thump = np.sin(2 * np.pi * 95 * t(0.18)) * env(n, 0.003, 0.03)
grit = bp(rng.normal(0, 1, n), 900, 4000) * env(n, 0.001, 0.02) * 0.25
save("step", lp(thump + grit, 5000), 0.6)

# riser: air that thickens and climbs, ending at full level (the boom takes over)
sec = 2.4
n = int(SR * sec)
x = t(sec)
air = rng.normal(0, 1, n)
r = np.zeros(n)
for k in range(0, n, 1200):
    seg = slice(k, min(k + 1200, n))
    c = 300 + 3200 * (x[k] / sec) ** 2
    r[seg] = bp(air[max(k - 4000, 0): seg.stop], c * 0.7, min(c * 1.5, 20000))[-(seg.stop - seg.start):]
tone = np.sin(2 * np.pi * np.cumsum(120 + 240 * (x / sec) ** 2) / SR) * 0.25
r = (r + tone) * (x / sec) ** 2.4
save("riser", stereo(r, 1.0), 0.6)

# boom: sub thump with a pitch drop, an air burst, and a long airy shimmer
sec = 4.0
n = int(SR * sec)
x = t(sec)
sub = np.sin(2 * np.pi * np.cumsum(38 + 40 * np.exp(-x * 9)) / SR) * env(n, 0.004, 0.55)
burst = lp(rng.normal(0, 1, n), 1800) * env(n, 0.001, 0.12) * 0.5
shimmer = bp(rng.normal(0, 1, n), 5000, 11000) * env(n, 0.05, 1.1) * 0.12
shimmer *= 1 + 0.4 * np.sin(2 * np.pi * 5.5 * x)
save("boom", stereo(room(sub + burst, 1.6, 0.25, 1800)[:n] + shimmer, 1.0), 0.85)

# sparkle: a quick airy sweep across, for the shooting star
sec = 1.2
n = int(SR * sec)
x = t(sec)
s = bp(rng.normal(0, 1, n), 4000, 12000) * np.sin(np.pi * np.clip(x / 1.0, 0, 1)) ** 2
s *= 1 + 0.5 * np.sin(2 * np.pi * 14 * x)
pan = np.linspace(0.8, -0.8, n)
save("sparkle", np.stack([s * (1 - np.clip(pan, 0, 1)), s * (1 + np.clip(pan, -1, 0))], 1), 0.5)

# rain bed: soft hiss plus scattered droplets
sec = 16
n = int(SR * sec)
hiss = bp(rng.normal(0, 1, n), 1200, 9000) * 0.25
drops = np.zeros(n)
for _ in range(2600):
    p = rng.integers(0, n - 2000)
    f = rng.uniform(1800, 5200)
    d = np.sin(2 * np.pi * f * t(0.03)) * env(int(SR * 0.03), 0.0005, 0.006) * rng.uniform(0.1, 0.6)
    drops[p: p + len(d)] += d
rain = hiss + drops
save("rain", np.stack([rain, np.roll(rain, 7919)], 1), 0.5)

# wind bed: low air, slowly breathing
sec = 16
n = int(SR * sec)
x = t(sec)
wind = lp(np.cumsum(rng.normal(0, 1, n)) * 0.02, 420)
wind = hp(wind, 35) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.11 * x + 1))
gust = bp(rng.normal(0, 1, n), 500, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * x)) * 0.05
save("wind", stereo(wind + gust, 1.0), 0.5)
