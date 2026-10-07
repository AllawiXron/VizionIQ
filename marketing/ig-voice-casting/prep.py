"""The casting post's one photo: the vintage microphone as a black-and-white print with a white border, in the same
analog collage look as the dollar reel (textures and paper pieces are reused from ../hf-dollar-reel/assets/img).
python prep.py   (Pillow, numpy, scipy) -> img/p-mic.png"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import zoom

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
