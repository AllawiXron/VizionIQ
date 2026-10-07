"""Synthesized sound for the Indomie reel -> assets/sfx/*.wav (48 kHz mono, 16-bit).
  chaching.wav   salary in: a cash-register bell (two bright partials) over a coin jingle
  tick.wav       one tick of the balance counter running down
  scratch.wav    the record scratch when the money runs out (the music stops on it)
  trombone.wav   the sad trombone: wah, wah, wah, waaah (Bb3 A3 Ab3, then G3 with vibrato)
  ding.wav       a phone notification (salary deposited)
  tickroll.wav   six ticks of the counter running down, speeding up
python sfx.py   (numpy + scipy)"""
import numpy as np, wave, os
from scipy.signal import butter, sosfilt

SR = 48000
rng = np.random.default_rng(11)
out = os.path.join(os.path.dirname(__file__), 'assets', 'sfx')
os.makedirs(out, exist_ok=True)
def t_(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=4): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def bp(x, a, b, o=4): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def save(name, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(os.path.join(out, name), 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())

# cha-ching: a drawer clunk, a coin jingle, then the bell
t = t_(1.1)
clunk = np.sin(2 * np.pi * 120 * t) * np.exp(-t * 40) * .6
jing = np.zeros(len(t))
for k in range(14):                                          # coins: short metallic pings scattered over 0.25 s
    s0 = int((0.02 + 0.018 * k + 0.006 * rng.random()) * SR); f = 3500 + 2500 * rng.random()
    n = int(.09 * SR); tt = np.arange(n) / SR
    jing[s0:s0 + n] += np.sin(2 * np.pi * f * tt) * np.exp(-tt * 55) * (0.4 + .4 * rng.random())
bell = np.zeros(len(t)); b0 = int(.24 * SR); tb = t[:len(t) - b0]
bell[b0:] = (np.sin(2 * np.pi * 2093 * tb) + .6 * np.sin(2 * np.pi * 2637 * tb) + .3 * np.sin(2 * np.pi * 4186 * tb)) * np.exp(-tb * 4.5)
save('chaching.wav', clunk + jing * .7 + bell * .8, .85)

# counter tick
t = t_(.05)
save('tick.wav', bp(rng.standard_normal(len(t)), 1800, 5000) * np.exp(-t * 220) + .5 * np.sin(2 * np.pi * 1300 * t) * np.exp(-t * 160), .6)

# the counter running down: six ticks over 0.3 s, speeding up
t = t_(.36)
tr = np.zeros(len(t))
for k, at in enumerate([0, .07, .13, .18, .225, .265]):
    i = int(at * SR); n = int(.05 * SR); tt = np.arange(n) / SR
    tr[i:i + n] += (bp(rng.standard_normal(n), 1800, 5000) * np.exp(-tt * 220) + .5 * np.sin(2 * np.pi * (1300 + 60 * k) * tt) * np.exp(-tt * 160))
save('tickroll.wav', tr, .6)

# record scratch: a burst of noise whose pitch whips down and up, then cuts
t = t_(.42)
f = 900 + 700 * np.sin(2 * np.pi * 7 * t) * np.exp(-t * 2)
ph = 2 * np.pi * np.cumsum(f) / SR
grit = bp(rng.standard_normal(len(t)), 300, 4000)
sc = (np.sign(np.sin(ph)) * .5 + grit * .8) * (1 + np.sin(ph * .5)) * .5
save('scratch.wav', lp(sc, 3500) * np.clip(1 - t / .42, 0, 1) ** .5, .85)

# sad trombone: a brassy saw through a "wah" low-pass that opens on each note
def note(f, d, vib=0.0):
    tt = np.arange(int(d * SR)) / SR
    fm = f * (1 + vib * np.sin(2 * np.pi * 5.5 * tt) * np.clip(tt / .3, 0, 1))
    ph = 2 * np.pi * np.cumsum(fm) / SR
    saw = sum(np.sin(k * ph) / k for k in range(1, 12))
    env = np.clip(tt / .03, 0, 1) * np.clip((d - tt) / .08, 0, 1)
    cut = 500 + 1600 * np.clip(tt / .12, 0, 1) * np.exp(-tt * (1.2 if vib else 4))
    out_ = np.zeros_like(saw)
    for i in range(0, len(saw), 480):                       # time-varying low-pass, block by block
        sos = butter(2, min(cut[i], 20000), 'low', fs=SR, output='sos')
        out_[i:i + 480] = sosfilt(sos, saw[i:i + 480])
    return out_ * env
gap = np.zeros(int(.04 * SR))
tb = np.concatenate([note(233.08, .3), gap, note(220.0, .3), gap, note(207.65, .3), gap, note(196.0, .85, .018)])
save('trombone.wav', tb, .8)

# notification ding: two soft sine notes (E6 then B6)
t = t_(.6)
d1 = np.sin(2 * np.pi * 1318.5 * t) * np.exp(-t * 7)
d2 = np.zeros(len(t)); o = int(.11 * SR); d2[o:] = np.sin(2 * np.pi * 1975.5 * t[:len(t) - o]) * np.exp(-t[:len(t) - o] * 6)
save('ding.wav', d1 + d2 * .9, .7)
print('ok', sorted(os.listdir(out)))
