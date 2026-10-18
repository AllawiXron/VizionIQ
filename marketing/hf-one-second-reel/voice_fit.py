"""Fit the recorded voice (V5, 18 Oct) to the reel: cut it into its lines at the pauses, and place each line
where its caption appears (the list and the ending are re-timed to her words instead; the new T cues are printed).
  python3 voice_fit.py <recording>  ->  assets/voice.wav (41 s, 48 kHz mono)"""
import subprocess, sys, wave, os
import numpy as np

here = os.path.dirname(os.path.abspath(__file__))
SR = 48000
src = sys.argv[1]
# her take as it is: no denoise, EQ or compression (they made it sound processed, 18 Oct); one fixed gain below
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ar', str(SR), '-ac', '1', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768

# speech end inside [a, b]: the last 10 ms frame above the speech threshold
hop = SR // 100
rms = np.sqrt(np.convolve(x ** 2, np.ones(hop) / hop, 'same'))[::hop]
thr = 10 ** (-42 / 20)
def speech_end(a, b):
    i, j = int(a * 100), int(b * 100)
    on = np.nonzero(rms[i:j] > thr)[0]
    return min(b - 0.03, (i + on[-1] + 1) / 100 + 0.15) if len(on) else b

# lines: (start in the take, start of the next line, where it goes; None = right after the previous one + gap)
# word starts are from faster-whisper (medium, Arabic)
L = [
    (0.21, 3.19, 0.0), (3.19, 4.81, 2.3), (4.81, 5.99, 3.6), (5.99, 8.25, 5.6), (8.25, 9.99, 7.95),
    (9.99, 11.83, 10.2), (11.83, 12.87, 12.1), (12.87, 14.19, 13.45 - 0.18), (14.19, 17.05, 15.0),
    (17.05, 19.23, 18.2), (19.23, 22.29, 20.75), (22.29, 25.25, 24.1),
    # بوستات، ستوريات، منيو، لوگو، وهوية كاملة: one after another; the labels follow
    (25.25, 26.29, 27.35), (26.29, 27.37, ('gap', 0.12)), (27.37, 28.25, ('gap', 0.12)), (28.25, 29.19, ('gap', 0.12)),
    (29.19, 31.03, ('gap', 0.2)),
    # عجبك الشغل؟ / راسلنا بالدايركت / ونبدي بمشروعك
    (31.03, 32.47, 34.1), (32.47, 34.11, 35.6), (34.11, 35.55, 37.3),
]
out = np.zeros(41 * SR, np.float32)
fade = int(0.03 * SR)
placed, end = [], 0.0
for a, b, at in L:
    a0, a1 = max(0, a - 0.04), speech_end(a, b)
    t = end + at[1] if isinstance(at, tuple) else max(at - (a - a0), end + 0.05)
    seg = x[int(a0 * SR):int(a1 * SR)].copy()
    seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
    i = int(t * SR)
    out[i:i + len(seg)] += seg[:len(out) - i]
    w0 = t + (a - a0)
    placed.append(round(w0, 2)); end = t + len(seg) / SR
    print(f'{a:6.2f}-{a1:6.2f} -> {w0:6.2f}-{end:6.2f}')
out *= 10 ** (-1.5 / 20) / max(1e-6, np.abs(out).max())   # one gain: peaks at -1.5 dB
with wave.open(os.path.join(here, 'assets', 'voice.wav'), 'wb') as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes())
print('list words', placed[12:17], 'ask', placed[17:20], 'end', round(end, 2))
