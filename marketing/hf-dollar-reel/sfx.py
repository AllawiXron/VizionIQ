"""Synthesized sound effects for the dollar reel -> assets/sfx/*.wav (48 kHz mono, 16-bit). No music: the user adds
the voiceover and a track in CapCut, so these stay small and physical.
  hiss.wav      film hiss + a soft projector flutter, a bed under the whole reel (40 s)
  paper.wav     a sheet of paper handled (rustle)
  slap.wav      paper pinned/slapped onto a surface
  marker.wav    a marker stroke (squeak)
  scribble.wav  a marker circling (longer)
  flutter.wav   a banknote flying past
  thud.wav      a rubber stamp
  printer.wav   a receipt printer
  sent.wav / got.wav   message sent / received (two soft tones, not any phone's own sounds)
  tick.wav      a number flipping
  shrink.wav    a falling squeeze (the salary getting smaller)
  boom.wav      a low soft hit for the ending
python sfx.py   (numpy + scipy)"""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(7)
out = os.path.join(os.path.dirname(__file__), 'assets', 'sfx')
os.makedirs(out, exist_ok=True)
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=4): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=4): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=4): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def save(name, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(os.path.join(out, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())
N = lambda n: rng.standard_normal(n)

# film hiss bed with a projector's soft 24 Hz flutter and the odd crackle
t = t_(40.0)
hiss = hp(N(len(t)), 2500) * .5 + bp(N(len(t)), 300, 1500) * .25
flut = 1 + .25 * np.sin(2 * np.pi * 24 * t) * (0.5 + .5 * np.sin(2 * np.pi * .13 * t))
crk = np.zeros(len(t))
for s in rng.uniform(0, 39.9, 70):
    i = int(s * SR); n = int(.004 * SR); crk[i:i + n] += N(n) * rng.uniform(.5, 2)
save('hiss.wav', (hiss * flut + hp(crk, 1500)) * env(len(t), .2, .2), .5)

# paper rustle: noise bursts, crinkly
t = t_(.55)
g = np.zeros(len(t))
for s in np.sort(rng.uniform(0, .45, 18)):
    i = int(s * SR); n = int(rng.uniform(.01, .05) * SR); g[i:i + n] += np.hanning(n) * rng.uniform(.4, 1)
save('paper.wav', bp(N(len(t)), 1200, 9000) * g * env(len(t), .01, .1), .7)

# paper slap
t = t_(.3)
save('slap.wav', bp(N(len(t)), 400, 6000) * np.exp(-t * 40) + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 35) * .6, .8)

# marker squeak: a short rising squeal with felt noise
t = t_(.18)
f = 1800 + 900 * t / .18
sq = np.sin(2 * np.pi * np.cumsum(f) / SR) * .35 + bp(N(len(t)), 2000, 7000) * .8
save('marker.wav', sq * env(len(t), .01, .05) * (1 + .4 * np.sin(2 * np.pi * 60 * t)), .55)

# scribble: a marker going round (0.6 s)
t = t_(.6)
am = .55 + .45 * np.sin(2 * np.pi * 6.5 * t) ** 2
save('scribble.wav', bp(N(len(t)), 1800, 7500) * am * env(len(t), .02, .08), .55)

# banknote flutter: paper flapping (amplitude-modulated noise) over a whoosh
t = t_(.9)
flap = (np.sin(2 * np.pi * 28 * t) > .2).astype(float)
wh = lp(N(len(t)), 900) * np.sin(np.pi * t / .9) ** 2
save('flutter.wav', (bp(N(len(t)), 900, 6000) * flap * .6 + wh * 1.5) * env(len(t), .03, .2), .7)

# rubber stamp: thud + a small slap
t = t_(.4)
save('thud.wav', np.sin(2 * np.pi * 70 * t) * np.exp(-t * 18) + bp(N(len(t)), 300, 3000) * np.exp(-t * 60) * .6, .9)

# receipt printer: stepped buzz with a paper tear at the end
t = t_(1.2)
step = (np.sin(2 * np.pi * 42 * t) > 0).astype(float)
pr = (np.sign(np.sin(2 * np.pi * 820 * t)) * .3 + bp(N(len(t)), 1500, 6000) * .5) * (.55 + .45 * step)
pr *= (t < 1.0)
tear = bp(N(len(t)), 2000, 9000) * ((t > 1.02) & (t < 1.14)) * 1.2
save('printer.wav', pr * env(len(t), .02, .05) + tear, .6)

# message sent / received: soft sine pairs
def tones(fs, gap=.08, d=.22):
    t = t_(gap * len(fs) + d); x = np.zeros(len(t))
    for k, f in enumerate(fs):
        i = int(k * gap * SR); tt = t[:len(t) - i]
        x[i:] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 14)
    return x
save('sent.wav', tones([880, 1320]), .5)
save('got.wav', tones([1175, 784]), .5)

# number flip tick
t = t_(.05)
save('tick.wav', bp(N(len(t)), 1500, 6000) * np.exp(-t * 200) + np.sin(2 * np.pi * 1100 * t) * np.exp(-t * 150) * .5, .55)

# shrink: a falling squeeze
t = t_(.6)
f = 600 * np.exp(-t * 3.2) + 90
sh = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(t), .01, .2)
save('shrink.wav', lp(sh + .15 * bp(N(len(t)), 400, 3000) * np.exp(-t * 6), 3000), .6)

# low soft hit for the ending
t = t_(2.2)
save('boom.wav', lp(np.sin(2 * np.pi * 48 * t) * np.exp(-t * 2.2) + .25 * N(len(t)) * np.exp(-t * 7), 600), .8)
print('ok', sorted(os.listdir(out)))
