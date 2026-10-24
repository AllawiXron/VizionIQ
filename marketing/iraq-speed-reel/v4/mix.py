# The soundtrack for the 37 s reel from the user's own sound pack only (marketing/sfx-pack), to sit under the music
# Ali lays over it: a soft pop as words and cards land, a whoosh at the fastest moment of each camera move, the taps on
# the phone, the counters, the jump of the ping, the share card flying out, a riser and a hit into the green, a ring
# on ٦٢. Each sound is placed by its own peak. python3 mix.py -> sound.wav
import subprocess, wave, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.join(HERE, '..', '..', 'sfx-pack', 'files')
SR, DUR = 48000, 37.0
# whooshes, hits and risers are noise underneath: they go through a low-pass at 550 Hz with soft fades, so every
# move sounds like warm air and never like static
SOFT_AIR = ('hoosh', 'Riser', 'Swoosh')
cache = {}
def load(name):
    if name not in cache:
        af = ['-af', 'lowpass=f=550,lowpass=f=550,afade=t=in:d=0.06,areverse,afade=t=in:d=0.3,areverse'] if any(k in name for k in SOFT_AIR) else []
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PACK, name), *af, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                             capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
        env = np.sqrt(np.convolve((a ** 2).mean(1), np.ones(480) / 480, 'same'))
        cache[name] = (a / (np.abs(a).max() + 1e-9), int(np.argmax(env)))
    return cache[name]
out = np.zeros((int(SR * DUR), 2), np.float32)
def place(name, at, db, align='peak'):
    a, pk = load(name)
    if any(k in name for k in SOFT_AIR): db = min(db, -18)     # about 0.1 of the loudest sound
    start = int(at * SR) - (pk if align == 'peak' else 0)
    a = a * (10 ** (db / 20))
    s0, s1 = max(0, start), min(len(out), start + len(a))
    if s1 > s0:
        out[s0:s1] += a[s0 - start:s1 - start]

POP, POP2, CLICK = 'Pop/Smooth Pop.wav', 'Pop/Slow And Smooth Pop.wav', 'Clicks/High Click.wav'
def words(t0, step, n, db=-18):
    for i in range(n):
        place(POP, t0 + i * step + 0.07, db)

for stop in [2.85, 10.85, 16.85, 21.85, 25.85]:                  # the camera moves down the page
    place('Whooshes/Smooth Like A Butter Whoosh.wav', stop + 0.32, -10)
words(0.08, 0.075, 10, -16)                                      # النت يمك ضعيف؟ ...
place('Data Collect/Data Collect.wav', 0.9, -17, 'start')       # the red bar runs
place('UI Beep 4.wav', 1.9, -19, 'start')                       # and stops short of the line
for t0 in [3.25, 8.0, 11.1, 17.05, 22.05, 26.05, 29.95]:
    place(POP2, t0 + 0.1, -14)                                   # each caption
place('Ui Sound Effects/Ui Enter.wav', 3.95, -11)               # the tap on ابدأ الفحص
place('Data Collect/Data Collect.wav', 4.2, -18, 'start')       # the test counting
place(POP2, 5.82, -11)                                           # the red verdict
place('Whooshes/Smooth Like A Butter Whoosh.wav', 8.95, -18)       # the card comes out
place('Ui Sound Effects/Ui Enter.wav', 11.65, -11)              # the tap on the ping test
for k in range(6):
    place('Clicks/Click 2.wav', 11.95 + 0.17 * k, -20)          # pings while the line is free
place('Whooshes/Whoosh Deep Light 2.wav', 13.0, -18)              # the jump to 160 while it is busy
place(POP, 14.72, -12); place(POP, 14.97, -12)                   # the two cards
place('Whooshes/Whoosh Deep Short.wav', 14.45, -20)               # the phone slides away
place('Data Collect/Data Collect.wav', 17.25, -18, 'start')     # 824 counts up
place(POP, 17.62, -13)                                           # الصقلاوية
place('Whooshes/Simple Whoosh.wav', 18.4, -14)                   # the mobile bar runs
place('Slice Ring.wav', 19.0, -9)                                # أسرع بـ ١٤ مرة
place('Whooshes/Whoosh Deep Short.wav', 22.5, -14)               # the two cards slide in
for i in range(4):
    place(CLICK, 23.1 + 0.32 * i, -15)                          # the better numbers light up
place('Gear/Soft Gear 1.wav', 26.2, -16, 'start')                # the map is drawn
place('Data Collect/Data Collect.wav', 26.45, -18, 'start')     # and lights up
place(POP2, 27.85, -11)                                          # Diyala's card
place('Risers/Smooth Riser.wav', 29.8, -18)                      # the zoom into the green
place('Whooshes/Slow And Smooth Whoosh .wav', 29.6, -18)
place(POP2, 29.95, -10)
for at in [30.35, 30.6, 30.72, 30.84, 30.96, 31.08, 31.2]:
    place(CLICK, at, -16)                                        # the summers
place('Slice Ring.wav', 31.4, -7)                                # ٦٢
place('Trail Swoosh.mp3', 31.4, -16, 'start')                    # the path climbs
place('Whooshes/Smooth Like A Butter Whoosh.wav', 32.95, -18)    # the field folds into the line
place(POP, 33.08, -12); place(POP, 33.16, -14)                   # the name
place('Whooshes/Whoosh Deep Light 2.wav', 33.75, -16)            # the phone rises
for k in range(3):
    place(POP, 34.3 + 1.1 * k + 0.2, -17)                        # the start button pulses

fade = int(0.6 * SR)
out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
out *= 10 ** (-1.5 / 20) / max(1e-9, np.abs(out).max())         # one fixed gain, peaks at -1.5 dB
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open(os.path.join(HERE, 'sound.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sound.wav', DUR, 's')
