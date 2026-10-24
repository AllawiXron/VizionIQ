# The soundtrack for the 37 s reel from the user's own sound pack only (marketing/sfx-pack), kept to two kinds of sound
# so it sits under Ali's music: soft air whooshes on the moves (low-passed at 550 Hz) and deep thuds on the big
# moments (a hit low-passed at 140 Hz). No pops, clicks or beeps. python3 mix.py -> sound.wav, and silence.wav for a
# copy with no sound at all.
import subprocess, wave, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.join(HERE, '..', '..', 'sfx-pack', 'files')
SR, DUR = 48000, 37.0
AIR = 'lowpass=f=550,lowpass=f=550,afade=t=in:d=0.08,areverse,afade=t=in:d=0.35,areverse'
THUD = 'lowpass=f=140,lowpass=f=140,afade=t=in:d=0.005,areverse,afade=t=in:d=0.25,areverse'
cache = {}
def load(name, af):
    if (name, af) not in cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PACK, name), '-af', af, '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                             capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
        env = np.sqrt(np.convolve((a ** 2).mean(1), np.ones(480) / 480, 'same'))
        cache[(name, af)] = (a / (np.abs(a).max() + 1e-9), int(np.argmax(env)))
    return cache[(name, af)]
out = np.zeros((int(SR * DUR), 2), np.float32)
def place(name, af, at, db):
    a, pk = load(name, af)
    start = int(at * SR) - pk
    a = a * (10 ** (db / 20))
    s0, s1 = max(0, start), min(len(out), start + len(a))
    if s1 > s0:
        out[s0:s1] += a[s0 - start:s1 - start]
whoosh = lambda at, name='Whooshes/Smooth Like A Butter Whoosh.wav': place(name, AIR, at, -16)
thud = lambda at, db=-6: place('Whoosh hit.wav', THUD, at, db)

for stop in [2.85, 10.85, 16.85, 21.85, 25.85]:
    whoosh(stop + 0.33)                                          # the camera moves down the page
whoosh(8.95, 'Whooshes/Slow And Smooth Whoosh .wav')             # the share card comes out
whoosh(14.45, 'Whooshes/Whoosh Deep Short.wav')                  # the phone slides away
whoosh(29.55, 'Whooshes/Slow And Smooth Whoosh .wav')            # the zoom into the green
whoosh(32.95)                                                    # the field folds into the line
for at, db in [(1.95, -7), (5.8, -6), (9.1, -8), (14.75, -8), (15.0, -9), (19.0, -6), (22.55, -8),
               (27.85, -7), (29.95, -5), (31.4, -7), (33.1, -6), (34.15, -9)]:
    thud(at, db)                                                 # the big moments

fade = int(0.6 * SR)
out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
out *= 10 ** (-1.5 / 20) / max(1e-9, np.abs(out).max())
for name, data in [('sound.wav', out), ('silence.wav', np.zeros_like(out))]:
    pcm = (np.clip(data, -1, 1) * 32767).astype('<i2')
    with wave.open(os.path.join(HERE, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sound.wav and silence.wav', DUR, 's')
