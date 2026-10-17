"""Three pieces of masking tape for the wall prints, made from noise (no stock photos): translucent crepe paper with
creases and torn ends. (The torn paper of the strips is drawn in the page itself, by tear() in src/timeline.js.)
  python3 -I tape.py OUTDIR"""
import sys, os
import numpy as np
from PIL import Image, ImageFilter

OUT = sys.argv[1]
rng = np.random.default_rng(7)
SS = 3  # supersampling


def pnoise(n, period, octaves, seed, amp=1.0):
    """Periodic 1-D fractal noise over n samples (period = n), sum of random sinusoids per octave."""
    r = np.random.default_rng(seed)
    x = np.arange(n) / n
    out = np.zeros(n)
    a = amp
    for o in range(octaves):
        k0 = 2 ** o
        for k in range(k0, 2 * k0):
            out += a / np.sqrt(k0) * np.sin(2 * np.pi * (k * x + r.random())) * r.random()
        a *= 0.62
    return out


def field(h, w, scale, seed):
    """Smooth 2-D noise (blurred white noise), normalised to -1..1."""
    r = np.random.default_rng(seed)
    im = Image.fromarray((r.random((h, w)) * 255).astype(np.uint8))
    im = im.filter(ImageFilter.GaussianBlur(scale))
    a = np.asarray(im).astype(np.float32)
    a = (a - a.mean()) / (a.std() + 1e-6)
    return np.clip(a / 3, -1, 1)


def tape(name, W=320, H=104, seed=3):
    """Masking tape: translucent cream crepe paper, straight long sides with a slight wobble, torn zig-zag ends."""
    w, h = W * SS, H * SS
    r = np.random.default_rng(seed)
    Y, X = np.mgrid[0:h, 0:w].astype(np.float32)
    top = 10 * SS + pnoise(w, w, 5, seed, 1.0) * 1.2 * SS
    bot = h - 10 * SS + pnoise(w, w, 5, seed + 1, 1.0) * 1.2 * SS
    # torn ends: little teeth
    def end(seed, base):
        n = h
        ph = np.cumsum(r.uniform(0.5, 1.6, n)) / n * r.uniform(9, 13)   # uneven teeth
        t = np.abs((ph % 1) - 0.5) * 2
        return base + (t * 4 + pnoise(n, n, 7, seed, 1.0) * 4.5) * SS
    lft = end(seed + 2, 12 * SS)
    rgt = end(seed + 3, 12 * SS)
    d = np.minimum.reduce([Y - top[None, :], bot[None, :] - Y, X - lft[:, None], (w - 1 - X) - rgt[:, None]])
    a = np.clip(d / SS + 0.5, 0, 1)
    # crepe texture: fine horizontal streaks plus a few creases
    streak = field(h // 6 + 1, w, 0.6 * SS, seed + 4)
    streak = np.asarray(Image.fromarray(((streak + 1) * 127).astype(np.uint8)).resize((w, h), Image.BILINEAR)).astype(np.float32) / 127 - 1
    grain = field(h, w, 0.7 * SS, seed + 5)
    crease = np.zeros((h, w), np.float32)
    for _ in range(3):
        x0 = r.uniform(0.15, 0.85) * w
        k = r.uniform(-0.5, 0.5)
        dist = np.abs((X - x0) - k * (Y - h / 2))
        crease += np.exp(-(dist / (2.5 * SS)) ** 2) * r.uniform(0.4, 1.0)
    base = np.array((238, 226, 198), np.float32)
    shade = 1 + streak * 0.035 + grain * 0.03 - crease * 0.06
    rgb = base[None, None, :] * shade[..., None]
    alpha = a * (0.80 + grain * 0.04 - crease * 0.05)
    img = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 1) * 255]).astype(np.uint8)
    Image.fromarray(img, 'RGBA').resize((W, H), Image.LANCZOS).save(os.path.join(OUT, name + '.png'))


os.makedirs(OUT, exist_ok=True)
for i, (W, s) in enumerate(((320, 3), (290, 17), (340, 29))):
    tape(f'tape{i + 1}', W=W, seed=s)
print('ok')
