"""Synthesized sound for the Asiacell reel -> assets/sfx/*.wav (48 kHz mono, 16-bit).
  hum.wav     room tone: 50 Hz mains hum (Iraq's grid frequency) + a fan's filtered noise; constant level, so the reel loops clean
  flicker.wav a short electric crackle for the bulb's flicker
  cut.wav     the national grid drops: relay clunk, the hum and the fan winding down
  neon.wav    the signal sign: two glass ticks, then a 100 Hz neon buzz that stutters and settles, then a low tail
  on.wav      the power comes back: relay click, the hum spinning up
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
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def mains(t, f0):
    """50 Hz hum with its odd/even harmonics; f0 may be an array (glide)."""
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(f0, t.shape)) / SR
    return (np.sin(ph) + .55 * np.sin(2 * ph) + .32 * np.sin(3 * ph) + .18 * np.sin(4 * ph) + .08 * np.sin(6 * ph))

# room tone: 4 s, constant. A fan = low-passed noise with a slow blade wobble at 7 Hz.
t = t_(4.0)
fan = lp(rng.standard_normal(len(t)), 900) * (1 + .12 * np.sin(2 * np.pi * 7 * t))
hum = mains(t, 50.0) * .5 + fan * 2.2
save('hum.wav', hum, .55)

# flicker crackle: three tiny noise bursts gated by a 100 Hz buzz
t = t_(0.16)
cr = hp(rng.standard_normal(len(t)), 1800) * (np.abs(np.sin(2 * np.pi * 100 * t)) > .7)
gate = np.zeros(len(t))
for s, d in [(0, .018), (.04, .012), (.075, .03)]:
    gate[int(s * SR):int((s + d) * SR)] = 1
save('flicker.wav', cr * gate * env(len(t), .001, .03) + .3 * mains(t, 50.0) * gate, .7)

# power cut: clunk + the hum and fan winding down over 0.9 s
t = t_(1.1)
clunk = np.sin(2 * np.pi * 58 * t) * np.exp(-t * 18) * 1.4 + hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 160) * .8
f = 50 * np.exp(-t * 1.6)                                  # 50 Hz sliding down
wind = mains(t, f) * .5 * np.exp(-t * 3.2)
fan = lp(rng.standard_normal(len(t)), 900) * 2.2 * np.exp(-t * 4.5)
save('cut.wav', (clunk + wind + fan) * env(len(t), 0, .05), .9)

# neon: ticks at 0 and 0.09, buzz stutters on from 0.12, settles, then decays to a quiet tail
t = t_(2.0)
tick = np.zeros(len(t))
for s in (0.0, 0.09):
    i = int(s * SR); n = int(.03 * SR)
    tick[i:i + n] += bp(rng.standard_normal(n), 3000, 9000) * np.exp(-np.arange(n) / SR * 140)
ph = 2 * np.pi * 100 * t
buzz = np.sign(np.sin(ph)) * .35 + np.sin(2 * ph) * .3 + np.sin(3 * ph) * .2
buzz = bp(buzz + .15 * rng.standard_normal(len(t)), 90, 2400)
gate = np.zeros(len(t))
for s, d, v in [(.12, .03, 1), (.17, .02, .6), (.21, .05, 1), (.29, 1.71, 1)]:
    gate[int(s * SR):int((s + d) * SR)] = v
gate = lp(gate, 200, 2)
level = np.where(t < .5, 1.0, .35 + .65 * np.exp(-(t - .5) * 3.5))
save('neon.wav', tick * 1.6 + buzz * gate * level * env(len(t), 0, .4), .8)

# power back: relay click, then the hum and fan spinning up to full over 0.5 s, held to 1.2 s
t = t_(1.2)
click = hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 200) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 30) * .5
ramp = np.clip(t / .5, 0, 1)
f = 22 + 28 * (1 - (1 - ramp) ** 2)
up = mains(t, f) * .5 * ramp ** 1.5 + lp(rng.standard_normal(len(t)), 900) * 2.2 * ramp ** 2 * (1 + .12 * np.sin(2 * np.pi * 7 * t))
save('on.wav', click * 1.2 + up, .8)
print('ok', sorted(os.listdir(out)))

# ---- v2 additions
# the street generator (المولدة) kicking in, far off: a diesel's 12.5 Hz chug and its harmonics, low-passed, with a slow wobble
t = t_(4.6)
ph = 2 * np.pi * 12.5 * t
chug = (np.maximum(np.sin(ph), 0) ** 3) * 1.0 + .5 * np.sin(2 * np.pi * 50 * t) * (0.6 + .4 * np.sin(ph)) + .25 * np.sin(2 * np.pi * 100 * t)
gen = lp(chug + .35 * lp(rng.standard_normal(len(t)), 400), 320) * (1 + .08 * np.sin(2 * np.pi * .7 * t))
start = np.clip(t / 1.2, 0, 1) ** 2                       # cranks up over ~1 s
save('generator.wav', gen * start * env(len(t), 0, .5), .6)

# a dark drone under the neon: A1 + E2, detuned saws, low-passed, breathing
t = t_(5.0)
def saw(f): return 2 * ((t * f) % 1) - 1
dr = sum(saw(f) for f in (55, 55.4, 82.4, 82.0, 110.2)) / 5
dr = lp(dr, 420) * (0.85 + .15 * np.sin(2 * np.pi * .35 * t))
save('drone.wav', dr * env(len(t), 1.0, .7), .5)

# a glass tick for each signal bar lighting
t = t_(.12)
tk = bp(rng.standard_normal(len(t)), 4000, 9000) * np.exp(-t * 160) + .6 * np.sin(2 * np.pi * 2300 * t) * np.exp(-t * 45)
save('tick.wav', tk, .7)
print('ok v2', sorted(os.listdir(out)))
