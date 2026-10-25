# The soundtrack for the 55 s reel (v7), from Ali's own two sound packs only (marketing/sfx-pack), chosen and set to
# sound like a phone launch film: a soft keyboard click on each press, small soft pops when a card arrives, an airy
# swish on each whip pan, faint ticks while a number counts, a clean riser into the ping jump and into the green,
# and one short chime when the mobile line wins. Everything quiet and close, nothing low and booming.
# python3 mix.py -> sound.wav, and silence.wav for a copy with no sound at all.
import subprocess, wave, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.join(HERE, '..', '..', 'sfx-pack', 'files')
SR, DUR = 48000, 55.0
CLEAN = 'highpass=f=120,afade=t=in:d=0.004,areverse,afade=t=in:d=0.08,areverse'
AIRY = 'highpass=f=300,lowpass=f=9000,afade=t=in:d=0.05,areverse,afade=t=in:d=0.25,areverse'
cache = {}
def load(name, af):
    if (name, af) not in cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PACK, name), '-af', af, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                             capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
        env = np.sqrt(np.convolve((a ** 2).mean(1), np.ones(240) / 240, 'same'))
        cache[(name, af)] = (a / (np.abs(a).max() + 1e-9), int(np.argmax(env)))
    return cache[(name, af)]
out = np.zeros((int(SR * DUR), 2), np.float32)
def place(name, at, db, af=CLEAN):
    a, pk = load(name, af)
    start = int(at * SR) - pk
    a = a * (10 ** (db / 20))
    s0, s1 = max(0, start), min(len(out), start + len(a))
    if s1 > s0:
        out[s0:s1] += a[s0 - start:s1 - start]

CLICK = 'apple keypord click.mp3'                  # the press
TAP = 'Pop/Smooth Pop.wav'                         # the button turning blue under it
CARD = 'Pop/Sweet UI Open.wav'                     # a card arriving
SOFTPOP = 'Pop/Slow And Smooth Pop.wav'            # a quieter arrival
TICK = 'Clicks/High Click.wav'                     # counting
SWISH = 'Wind Swoosh.wav'                          # a whip pan
GLIDE = 'whoosh clean.wav'                         # a slower move
RISE = 'Soft Riser 2.wav'                          # into the ping jump
CLEANRISE = 'Clean Riser.mp3'                      # into the green
THUMP = 'Clicks/Click  (1).wav'                    # the ping landing on ١٦٢
CHIME = 'Correct.mp3'                              # the mobile line wins
STRETCH = 'Ui Sound Effects/Ui stretch.wav'        # the chart's line drawing itself

def bezier(x1, y1, x2, y2):
    cx = 3 * x1; bx = 3 * (x2 - x1) - cx; ax = 1 - cx - bx; cy = 3 * y1; by = 3 * (y2 - y1) - cy; ay = 1 - cy - by
    def f(x):
        u = x
        for _ in range(12):
            X = ((ax * u + bx) * u + cx) * u - x; d = (3 * ax * u + 2 * bx) * u + cx
            if abs(d) < 1e-6: break
            u = min(1, max(0, u - X / d))
        return ((ay * u + by) * u + cy) * u
    return f
soft = bezier(0.22, 1, 0.36, 1)
def count_ticks(t0, d, total, step, db):
    # a faint tick each time the counter passes another step, so the ticks slow down as the number settles
    last = 0
    for i in range(int(d * 240)):
        t = t0 + i / 240; v = total * soft(min(1, (t - t0) / d))
        if v - last >= step:
            last += step; place(TICK, t, db)

# the whip pans, and the camera's slower moves
for at in [5.8, 14.2, 21.8, 30.3, 37.8, 47.2]:
    place(SWISH, at, -13, AIRY)
place(GLIDE, 7.45, -22, AIRY)                      # in close on the button
place(GLIDE, 12.2, -24, AIRY)                      # back out to the verdict

# the presses: a click, and a softer tap as the button turns blue
for at in [7.9, 50.0]:
    place(CLICK, at, -6)
    place(TAP, at + 0.05, -20)

# the test counting on the phone (a new screen every 0.13 s), at the start and at the end
for k in range(14):
    place(TICK, 8.4 + k * 0.13, -27)
    place(TICK, 50.3 + k * 0.13, -29)

# cards and results arriving
for at, db in [(10.25, -16), (12.5, -12), (16.35, -14), (24.75, -16), (31.25, -13), (31.45, -15), (39.95, -13), (47.55, -14)]:
    place(CARD, at, db)
for i in range(4):
    place(SOFTPOP, 32.4 + i * 0.45, -18)           # each better number turning green

# the ping: a riser into the jump, the number landing on ١٦٢
place(RISE, 18.2, -15)
place(THUMP, 18.2, -9)

# ٨٢٤ areas counting up, then the mobile line winning
count_ticks(22.15, 1.3, 824, 60, -26)
place(CHIME, 26.8, -15)

# into the green and Iraq since 2019
place(CLEANRISE, 42.95, -16)
place(STRETCH, 44.5, -20)

fade = int(0.6 * SR)
out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
out *= 10 ** (-1.5 / 20) / max(1e-9, np.abs(out).max())
for name, data in [('sound.wav', out), ('silence.wav', np.zeros_like(out))]:
    pcm = (np.clip(data, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(HERE, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sound.wav and silence.wav', DUR, 's')
