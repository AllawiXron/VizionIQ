"""Builds Sledge (img/sledge.png) from the poster art in src/.
The cut-out mask (src/sledge-mask.png) is kept, so this runs on Pillow, numpy, scipy and OpenCV.
python prep.py"""
import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def save(a, p, **kw):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p, **kw)

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def screen(base, light):
    return 1 - (1 - base) * (1 - light)

art = arr(Image.open('src/sledge-poster.jpg').convert('RGB'))
A = arr(Image.open('src/sledge-mask.png').convert('L'))
H, W = A.shape

# Sledge: a thin yellow edge, the poster's own yellow, so the navy figure stays apart from the dark menu behind him.
# Strongest on top and on the side facing the swing (his left, our left).
def edge(dy, dx, w):
    e = np.clip(A - ndi.shift(A, (dy, dx), order=1), 0, 1)
    return blur(e, w) * A ** 3

rim = np.maximum.reduce([edge(6, 0, 1.2), edge(0, 6, 1.2) * .8, edge(0, -6, 1.2) * .55])
im = screen(art, rim[..., None] * np.array([.96, .84, .36]) * .9)
im = np.clip(im + .35 * (im - blur(im, 1.2)), 0, 1)
save(np.dstack([im, A]), 'img/sledge.png')

print('ok')
