"""Builds img/ak.png: the AK-47 Point Disarray cut from its workshop render (mask kept in src/), sharpened, cropped to
the gun.
python prep.py   (Pillow, numpy, scipy, OpenCV)"""
import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def save(a, p):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p)

src = arr(Image.open('src/ak47-point-disarray.jpg').convert('RGB'))
A = arr(Image.open('src/ak47-mask.png').convert('L'))
ys, xs = np.nonzero(A > .05)
y0, y1, x0, x1 = ys.min() - 4, ys.max() + 5, xs.min() - 4, xs.max() + 5
im, a = src[y0:y1, x0:x1], A[y0:y1, x0:x1]
im = np.clip(im + .5 * (im - blur(im, 1.2)), 0, 1)
save(np.dstack([im, a]), 'img/ak.png')

print('gun', im.shape[1], 'x', im.shape[0])
