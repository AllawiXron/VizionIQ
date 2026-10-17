"""The casting post's photo and textures, in the dollar reel's analog collage look but in the allawi.psd brand colours
(orange #e2541b, paper #ece3d4, ink #1f1510, cream #fbf3e6). Paper pieces and grain are reused from
../hf-dollar-reel/assets/img.
python prep.py   (Pillow, numpy, scipy) -> img/p-mic.png (the vintage microphone as a black-and-white print with a white
border), img/orange.jpg (orange cloth, in place of the reel's red), img/paper.jpg (brand paper)"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import zoom, gaussian_filter

here = os.path.dirname(os.path.abspath(__file__))
rng = np.random.default_rng(712)


def noise(h, w, scale, octaves=3):
    acc = np.zeros((h, w)); amp = 1.0; tot = 0
    for o in range(octaves):
        s = max(2, int(scale / (2 ** o)))
        g = rng.random((h // s + 2, w // s + 2))
        acc += zoom(g, (s, s), order=3)[:h, :w] * amp
        tot += amp; amp *= 0.5
    acc /= tot
    return (acc - acc.min()) / (acc.max() - acc.min() + 1e-9)


im = Image.open(os.path.join(here, 'photo', 'src-mic.jpg')).convert('RGB')
w0, h0 = im.size
im = im.crop((int(0.08 * w0), int(0.1 * h0), int(0.92 * w0), int(0.97 * h0)))
a = np.asarray(im).astype(np.float32) / 255
L = a @ np.array([0.3, 0.59, 0.11])
L = np.clip((L - 0.5) * 1.3 + 0.5, 0, 1)                       # a contrasty silver print
a = np.repeat(L[..., None], 3, -1) * np.array([1.0, 0.985, 0.95])
h, w = a.shape[:2]
b = 26
out = np.ones((h + 2 * b, w + 2 * b, 3)) * np.array([0.95, 0.93, 0.88])
out[b:b + h, b:b + w] = a
out *= (0.95 + 0.07 * noise(h + 2 * b, w + 2 * b, 80))[..., None]
yy, xx = np.mgrid[0:h + 2 * b, 0:w + 2 * b]
out *= (1.06 - 0.16 * ((xx / (w + 2 * b) + yy / (h + 2 * b)) / 2))[..., None]   # light from the top left
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(os.path.join(here, 'img', 'p-mic.png'))
print('ok', out.shape)


# textures, 1080x1920 (a 1080x1350 post crops the middle)
W, H = 1080, 1920
yy, xx = np.mgrid[0:H, 0:W]
vig = lambda k, p: 1 - k * np.clip(np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2) / 1.42, 0, 1) ** p
save = lambda a, n: Image.fromarray((np.clip(a, 0, 1) * 255).round().astype(np.uint8)).save(os.path.join(here, 'img', n), quality=90)

# orange cloth: the brand orange, mottled, fibres, a lighter middle and burnt edges
m = noise(H, W, 420) * 0.6 + noise(H, W, 60) * 0.25 + noise(H, W, 8, 2) * 0.15
fib = gaussian_filter(rng.standard_normal((H, W)), (0.6, 3.5)) * 0.05
base = np.array([0xe2, 0x54, 0x1b]) / 255
save(base[None, None, :] * (0.72 + 0.42 * m[..., None] + fib[..., None]) * vig(0.62, 1.6)[..., None], 'orange.jpg')

# brand paper: #ece3d4, fibres and faint stains, darker edges
m = noise(H, W, 300) * 0.5 + noise(H, W, 40) * 0.3 + noise(H, W, 6, 2) * 0.2
fib = gaussian_filter(rng.standard_normal((H, W)), (4, 0.7)) * 0.02 + gaussian_filter(rng.standard_normal((H, W)), (0.7, 4)) * 0.016
paper = np.array([0xec, 0xe3, 0xd4]) / 255
save(paper[None, None, :] * (0.93 + 0.1 * m[..., None] + fib[..., None]) * vig(0.32, 2.0)[..., None], 'paper.jpg')
print('ok textures')
