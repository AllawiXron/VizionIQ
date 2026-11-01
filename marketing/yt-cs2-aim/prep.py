"""Builds the layers for thumbnail 1 (inhuman aim) in img/.
- ak.png: the AK-47 Point Disarray cut from the workshop render (mask kept in src/), sharpened, cropped to the gun.
- smear.png: the same gun dragged sideways in three colour channels, as if it just snapped onto a target: each copy
  is the gun's own colours pushed toward red, cyan or green, motion-blurred along the barrel and faded out away from
  the gun, like the reference.
- arrow.png: one red marker stroke with an open head, drawn as a brush would lay it: the width swells and thins along
  the stroke, the edge wobbles a little, and the ink is slightly uneven.
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

# smear: a canvas wider than the gun so the streaks can run past its ends
H, W = a.shape
P = 260
canvas = lambda: np.zeros((H, W + 2 * P), np.float32)
out = np.zeros((H, W + 2 * P, 3), np.float32); oa = canvas()
tints = [(-70, np.array([1.0, .18, .16]), 60), (55, np.array([.10, .85, 1.0]), 50), (-150, np.array([.35, 1.0, .25]), 90)]
for dx, tint, length in tints:
    m = canvas(); m[:, P + dx:P + dx + W] = a
    col = np.zeros((H, W + 2 * P, 3), np.float32)
    col[:, P + dx:P + dx + W] = im * .35 + tint * .65
    k = np.zeros((1, length), np.float32); k[0] = np.linspace(1, .15, length) if dx < 0 else np.linspace(.15, 1, length)
    k /= k.sum()
    m = cv2.filter2D(m, -1, k)
    col = cv2.filter2D(col * m[..., None], -1, k) / np.maximum(m[..., None], 1e-4)
    m = m * .55
    na = m + oa * (1 - m)
    out = (col * m[..., None] + out * (oa * (1 - m))[..., None]) / np.maximum(na[..., None], 1e-5)
    oa = na
save(np.dstack([out, oa]), 'img/smear.png')

# arrow: from the right of the word down and left onto the receiver, a quick hooked stroke and a two-line head
rng = np.random.default_rng(4)
S = 4                                                     # drawn at 4x, then scaled down for a clean edge
w, h = 300, 330
t = np.linspace(0, 1, 400)
p0, p1, p2 = np.array([210, 20]), np.array([215, 230]), np.array([60, 290])
pts = ((1 - t) ** 2)[:, None] * p0 + (2 * (1 - t) * t)[:, None] * p1 + (t ** 2)[:, None] * p2
pts += np.cumsum(rng.normal(0, .25, pts.shape), 0) * .4
width = 13 * (.55 + .6 * np.sin(np.pi * np.clip(t * 1.1, 0, 1))) * (1 - .25 * t)
c = np.zeros((h * S, w * S), np.float32)
for (x, y), r in zip(pts, width):
    cv2.circle(c, (int(x * S), int(y * S)), max(1, int(r * S / 2)), 1.0, -1, lineType=cv2.LINE_AA)
tip = pts[-1]
for ang, ln in ((-38, 95), (52, 88)):
    d = np.array([np.cos(np.deg2rad(ang)), -np.sin(np.deg2rad(ang))])
    for k, s in enumerate(np.linspace(0, 1, 120)):
        q = tip + d * ln * s + rng.normal(0, .3, 2)
        r = 12.5 * (1 - .55 * s)
        cv2.circle(c, (int(q[0] * S), int(q[1] * S)), max(1, int(r * S / 2)), 1.0, -1, lineType=cv2.LINE_AA)
c = cv2.resize(c, (w, h), interpolation=cv2.INTER_AREA)
ink = np.clip(.9 + .1 * blur(rng.normal(0, 1, (h, w)).astype(np.float32), 2), 0, 1)
red = np.array([.92, .05, .04]) * ink[..., None]
save(np.dstack([red, c]), 'img/arrow.png')
print('gun', W, 'x', H)
