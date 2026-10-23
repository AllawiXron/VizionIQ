# The soundtrack from the user's own sound pack only (marketing/sfx-pack): a click on every beat at 120 BPM, a pop
# as words land, whooshes timed to each move's fastest moment, a riser into the last full bar, hits on the big moments.
# Each sound is placed by its own peak, so what you hear lands on the frame. python3 mix.py -> sound.wav
import subprocess, wave, os
import numpy as np

PACK = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'sfx-pack', 'files')
SR, DUR = 48000, 15.0
cache = {}
def load(name):
    if name not in cache:
        raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(PACK, name), '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-'],
                             capture_output=True, check=True).stdout
        a = np.frombuffer(raw, np.float32).reshape(-1, 2).copy()
        env = np.sqrt(np.convolve((a ** 2).mean(1), np.ones(480) / 480, 'same'))
        cache[name] = (a / (np.abs(a).max() + 1e-9), int(np.argmax(env)))
    return cache[name]

out = np.zeros((int(SR * DUR), 2), np.float32)
def place(name, at, db, align='peak'):
    a, pk = load(name)
    start = int(at * SR) - (pk if align == 'peak' else 0)
    a = a * (10 ** (db / 20))
    s0, s1 = max(0, start), min(len(out), start + len(a))
    if s1 > s0:
        out[s0:s1] += a[s0 - start:s1 - start]

CLICK, POP, POP2 = 'Clicks/High Click.wav', 'Pop/Smooth Pop.wav', 'Pop/Slow And Smooth Pop.wav'
for b in range(30):                                   # the pulse
    place(CLICK, b * 0.5, -15 if b % 4 == 0 else -19)
for at in [0.56, 1.06, 1.56, 2.56, 3.06, 5.56, 7.06, 7.56, 8.06, 10.06, 12.18, 14.1, 14.22]:
    place(POP, at, -11)                               # words landing
for at in [8.98, 9.18]:
    place(POP2, at, -12)                              # the fastest and the slowest light up
place('Whooshes/epic-fast-whoosh-345469.mp3', 2.1, -9)          # the words fly out
place('Whooshes/Cinematic Fast Normal Whoosh.wav', 3.62, -6)    # ٨٧ fills the screen
place('Whooshes/Simple Whoosh.wav', 4.55, -8)                   # the strands fly
place('Whooshes/Cinematic Low Whoosh.wav', 6.22, -6)            # pull back to Iraq
place('whoosh click.wav', 6.72, -12)                            # the tilt
place('Gear/Smooth And Premium Gear.wav', 6.98, -12, 'start')   # the governorates rise
place('Whooshes/epic-fast-whoosh-345469.mp3', 8.12, -10)        # down into the ranking
place('Data Collect/Data Collect.wav', 8.5, -12, 'start')       # the numbers count
place('Whooshes/Smooth And Fast Whoosh.wav', 9.72, -9)          # the bars become the search box
for at in [10.5, 10.58, 10.66, 10.74, 10.9, 10.98, 11.06]:
    place('apple keypord click.mp3', at, -12)                   # typing الكرادة
place('Pop/Sweet UI Open.wav', 11.13, -12)                      # the results
place('Ui Sound Effects/Ui Enter.wav', 11.33, -10)              # the tap
place('Risers/Smooth Riser.wav', 12.0, -4)                      # into the last full bar
place('Whoosh hit.wav', 12.02, -3)                              # the green field
for k in range(8):
    place(CLICK, 13.0 + k * 0.065, -16)                         # the counter runs through the years
place('Slice Ring.wav', 13.5, -5)                               # ٦٢
place('Whooshes/Cinematic Fast Normal Whoosh.wav', 14.14, -8)   # the field folds into the line
place('whoosh click.wav', 14.7, -12)                            # the title closes into the line

out *= 10 ** (-1.5 / 20) / max(1e-9, np.abs(out).max())         # one fixed gain, peaks at -1.5 dB
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sound.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sound.wav', DUR, 's')
