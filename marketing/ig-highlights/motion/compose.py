"""python3 compose.py <video> <out.mp4>: the motion video in the outlined slot of frame.png, with a bar visualizer
driven by the video's own sound between the slot and the text."""
import subprocess
import sys

import numpy as np
from PIL import Image, ImageDraw

src, out = sys.argv[1], sys.argv[2]
FPS, W, H = 30, 1080, 1920
VX, VY, VW, VH = 270, 250, 540, 960          # the video slot (inside the outline in frame.html)
BAR_Y, BAR_H = 1281, 34                      # visualizer centre line and its half height
BARS, BAR_W, GAP = 45, 7, 5                  # 45 x 12 px = 540, the slot's width
INK = np.array([240, 122, 46], np.uint8)

bg = np.asarray(Image.open('frame.png').convert('RGB')).copy()

# a rounded mask for the video, drawn large and scaled down so the corners are smooth
m = Image.new('L', (VW * 4, VH * 4), 0)
ImageDraw.Draw(m).rounded_rectangle((0, 0, VW * 4 - 1, VH * 4 - 1), radius=20 * 4, fill=255)
mask = (np.asarray(m.resize((VW, VH), Image.LANCZOS), np.float32) / 255)[..., None]

dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', src]))
n = int(round(dur * FPS))

SR = 44100
pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
audio = np.frombuffer(pcm, np.float32)

# loudness per band per frame: a 2048-sample window, log-spaced bands from 60 Hz to 10 kHz
N = 2048
edges = np.geomspace(60, 10000, BARS + 1)
freqs = np.fft.rfftfreq(N, 1 / SR)
win = np.hanning(N)
levels = np.zeros((n, BARS), np.float32)
for i in range(n):
    c = int(i / FPS * SR)
    seg = audio[max(0, c - N // 2): c + N // 2]
    seg = np.pad(seg, (0, N - len(seg)))
    spec = np.abs(np.fft.rfft(seg * win))
    for b in range(BARS):
        sel = (freqs >= edges[b]) & (freqs < edges[b + 1])
        levels[i, b] = spec[sel].mean() if sel.any() else spec[np.argmin(abs(freqs - edges[b]))]
db = 20 * np.log10(levels + 1e-6)
lo, hi = np.percentile(db, 25, axis=0), np.percentile(db, 99.5, axis=0)   # each band between its quiet and loud moments
lv = np.clip((db - lo) / (hi - lo), 0, 1) ** 1.6
for i in range(1, n):                                        # quick rise, slower fall
    lv[i] = np.where(lv[i] > lv[i - 1], lv[i - 1] + (lv[i] - lv[i - 1]) * .7, lv[i - 1] * .82 + lv[i] * .18)

dec = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', src, '-vf', f'crop=iw-8:ih:4:0,fps={FPS},scale={VW}:{VH}:flags=lanczos',
                        '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-i', src, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
                        '-b:v', '10M', '-maxrate', '12M', '-bufsize', '20M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
                        '-shortest', '-map_metadata', '-1', '-map_chapters', '-1', '-fflags', '+bitexact',
                        '-flags:v', '+bitexact', '-flags:a', '+bitexact', '-movflags', '+faststart', out], stdin=subprocess.PIPE)
slot = bg[VY:VY + VH, VX:VX + VW].astype(np.float32)
for i in range(n):
    raw = dec.stdout.read(VW * VH * 3)
    if len(raw) < VW * VH * 3:
        break
    f = bg.copy()
    v = np.frombuffer(raw, np.uint8).reshape(VH, VW, 3).astype(np.float32)
    f[VY:VY + VH, VX:VX + VW] = (v * mask + slot * (1 - mask)).astype(np.uint8)
    for b in range(BARS):
        h = max(2, int(lv[i, b] * BAR_H))
        x = VX + b * (BAR_W + GAP) + GAP // 2
        f[BAR_Y - h:BAR_Y + h, x:x + BAR_W] = INK
    enc.stdin.write(f.tobytes())
enc.stdin.close()
enc.wait()
dec.wait()
print('wrote', out, i + 1, 'frames')
