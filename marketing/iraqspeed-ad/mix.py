# The ad's sound, from Ali's own two packs only (marketing/sfx-pack), kept quiet and close like a phone launch film:
# an airy swish when a new room opens, soft pops as cards arrive, the keyboard click on each press, a soft riser into
# the dark hero shot and one short chime on the address.
# python3 mix.py wide|tall -> sound-wide.wav or sound-tall.wav (the two cuts differ by a few cards' timing)
import subprocess, wave, os, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.join(HERE, '..', 'sfx-pack', 'files')
SR, DUR = 48000, 21.0
CUT = sys.argv[1] if len(sys.argv) > 1 else 'wide'
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
    # lines the loudest moment of the sound up with `at`
    a, pk = load(name, af)
    start = int(at * SR) - pk
    a = a * (10 ** (db / 20))
    s0, s1 = max(0, start), min(len(out), start + len(a))
    if s1 > s0:
        out[s0:s1] += a[s0 - start:s1 - start]

CLICK = 'apple keypord click.mp3'
TAP = 'Pop/Smooth Pop.wav'
CARD = 'Pop/Sweet UI Open.wav'
SOFTPOP = 'Pop/Slow And Smooth Pop.wav'
SWISH = 'Wind Swoosh.wav'
GLIDE = 'whoosh clean.wav'
STRETCH = 'Ui Sound Effects/Ui stretch.wav'
RISE = 'Soft Riser 2.wav'
CHIME = 'Correct.mp3'
wide = CUT == 'wide'

# shot 1 and 2: the question, the dark opening, the map drawing itself
place(SOFTPOP, 0.45, -22)
place(GLIDE, 2.95, -19, AIRY)
place(STRETCH, 3.6, -24)
place(SOFTPOP, 4.5, -23)

# shot 3: the light room opens from the map, the cards and the phone arrive, the search
place(SWISH, 5.75, -14, AIRY)
place(CARD, 6.0, -17)
place(GLIDE, 6.7, -24, AIRY)
place(SOFTPOP, 7.3 if wide else 7.95, -19)
place(CARD, 8.45, -17)
for at in [8.9, 9.75]:
    place(CLICK, at, -7)
    place(TAP, at + 0.05, -21)
place(SOFTPOP, 9.2, -21)

# shot 4: Karrada's result, its streets, the comparison
place(SWISH, 10.25, -15, AIRY)
place(CARD, 10.45, -15)
place(SOFTPOP, 11.3, -18)
place(CARD, 13.3 if wide else 12.9, -16)

# shot 5 and 6: into the dark, the outline, the end card
place(RISE, 15.0, -17)
place(SWISH, 15.3, -15, AIRY)
place(STRETCH, 16.2, -25)
place(GLIDE, 18.7, -19, AIRY)
place(CHIME, 18.95, -19)

fade = int(0.5 * SR)
out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2
out *= 10 ** (-1.5 / 20) / max(1e-9, np.abs(out).max())
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open(os.path.join(HERE, f'sound-{CUT}.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print(f'sound-{CUT}.wav', DUR, 's')
