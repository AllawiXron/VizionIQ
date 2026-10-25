# The soundtrack from the user's own sound pack only (marketing/sfx-pack): a soft pop as each word lands, a whoosh at
# the fastest moment of each camera move, Karrada's racing counter and Saqlawiya's slow one with its warning, the real
# typing and tap on the phone, a pop for each number card, a riser and a hit into the green, a ring on ٦٢. Times are on the reel's 32 s scene clock and moved past the reading holds, so they match
# reel.html. Each sound is placed by its own peak. python3 mix.py -> sound.wav
import subprocess, wave, os
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
PACK = os.path.join(HERE, '..', '..', 'sfx-pack', 'files')
HOLDS = [[2.5, 0.4], [6.1, 1.2], [9.0, 0.8], [13.4, 0.6], [21.0, 0.6]]   # as in reel.html
SR, DUR = 48000, 32 + sum(d for _, d in HOLDS)
real = lambda s: s + sum(d for at, d in HOLDS if at < s)

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
def place(name, at, db, align='peak', clock='scene'):
    a, pk = load(name)
    start = int((real(at) if clock == 'scene' else at) * SR) - (pk if align == 'peak' else 0)
    a = a * (10 ** (db / 20))
    s0, s1 = max(0, start), min(len(out), start + len(a))
    if s1 > s0:
        out[s0:s1] += a[s0 - start:s1 - start]

POP, POP2, CLICK = 'Pop/Smooth Pop.wav', 'Pop/Slow And Smooth Pop.wav', 'Clicks/High Click.wav'
def words(t0, step, n, db=-17):
    for i in range(n):
        place(POP, t0 + i * step + 0.07, db)

for stop in [2.95, 6.35, 9.75, 17.1]:                            # the camera moves down the page
    place('Whooshes/Smooth Like A Butter Whoosh.wav', stop + 0.4, -10)

words(0.2, 0.17, 6, -14)                                         # سرعة الإنترنت تختلف من منطقة لمنطقة
place(POP2, 3.3, -16)                                            # the label
for t0 in [3.45, 4.15]:                                          # the two places
    place(POP, t0 + 0.07, -12)
place('Data Collect/Data Collect.wav', 3.6, -15, 'start')        # Karrada's counter races to 87
for at in [4.48, 4.77, 5.11, 5.61]:
    place('Clicks/Click 2.wav', at, -16)                         # Saqlawiya's crawls to 4
for k in range(3):
    place('UI Beep 4.wav', real(5.85) + 0.7 * k, -21, 'start', 'real')   # and warns
words(4.95, 0.12, 7)                                             # نفس البلد، والفرق أكثر من عشرين مرة
words(6.7, 0.11, 9)                                              # سويت موقع ...
place('whoosh click.wav', 8.3, -15)                              # the rule
place(POP2, 8.55, -9)                                            # the site's name

place(POP, 10.02, -13)                                           # تكتب اسم منطقتك
place('Whooshes/Whoosh Deep Light 2.wav', 10.5, -14)            # the phone comes closer
for at in [10.8, 10.95, 11.1, 11.25, 11.4, 11.55, 11.7]:
    place('apple keypord click.mp3', at, -13)                    # typing الكرادة
place('Pop/Sweet UI Open.wav', 10.9, -17)                        # the results drop down
place('Ui Sound Effects/Ui Enter.wav', 12.1, -11)                # the tap
place('whoosh click.wav', 12.5, -15)                             # Karrada's page, the camera steps back
place(POP, 12.62, -13)                                           # يطلعلك معدل السرعة
place('Whooshes/Simple Whoosh.wav', 14.75, -15)                  # down to the bars
place(POP, 14.52, -13)                                           # وتقارنها بمحافظتك
place('Whooshes/Whoosh Deep Short.wav', 16.7, -16)               # the phone steps back

words(17.4, 0.09, 10)                                            # الأرقام من أكثر من مليون ...
place('Gear/Soft Gear 1.wav', 18.0, -16, 'start')                # the governorates are outlined
place('Data Collect/Data Collect.wav', 18.5, -17, 'start')       # and take their colours
for i in range(5):
    place(POP, 19.32 + 0.12 * i, -15)                            # the five number cards
place(POP, 19.97, -14)                                           # كل محافظة بلون معدل سرعتها

place('Risers/Smooth Riser.wav', 22.0, -7)                       # the zoom into Sulaymaniyah's green
place('Whooshes/Cinematic Fast Whoosh.wav', 21.98, -10)
place('Whoosh hit.wav', 22.08, -5)
place(POP, 22.42, -13)                                           # معدل سرعة الإنترنت بالعراق
for i in range(8):
    place('Clicks/Click 2.wav', 22.62 + 0.06 * i, -20)           # the years rise
for at in [23.0, 24.0, 24.2, 24.4, 24.6, 24.8, 25.0]:
    place(CLICK, at, -15)                                        # the counter runs through the summers
place('Slice Ring.wav', 25.3, -6)                                # ٦٢
place('Trail Swoosh.mp3', 25.3, -15, 'start')                    # the path climbs over the bars
place(POP, 25.92, -16)                                           # the note

place('Whooshes/Cinematic Fast Normal Whoosh.wav', 27.95, -9)    # the field folds into the line
place(POP, 28.08, -12)                                           # the name rises out of the line
place(POP, 28.16, -14)
place(POP2, 28.38, -15)                                          # اعرف سرعة منطقتك، الرابط بالبايو
place(POP, 28.78, -19)                                           # فكرة وتصميم
place('Whooshes/Whoosh Deep Light 2.wav', 28.75, -16)            # the phone rises behind
place('Pop/Sweet UI Open.wav', 29.12, -12)                       # the search box comes out of it

fade = int(0.6 * SR)
out[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 2             # the last tails die out by the end
out *= 10 ** (-1.5 / 20) / max(1e-9, np.abs(out).max())         # one fixed gain, peaks at -1.5 dB
pcm = (np.clip(out, -1, 1) * 32767).astype('<i2')
with wave.open(os.path.join(HERE, 'sound.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('sound.wav', DUR, 's')
