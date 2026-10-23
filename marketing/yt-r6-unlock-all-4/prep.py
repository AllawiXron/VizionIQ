"""Builds the layers in img/ from the poster art in src/.
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

# Mirrored, so the swing goes to the right and the hammer leaves the menu through its right edge, away from the
# labels on the menu's left.
art = arr(Image.open('src/sledge-poster.jpg').convert('RGB'))[:, ::-1]
A = arr(Image.open('src/sledge-mask.png').convert('L'))[:, ::-1]
H, W = A.shape

# Background: the poster's yellow with Sledge painted out. The hole is filled from the clean yellow around it only
# (no dark streaks pulled in), then grain at the strength measured on the poster itself.
hole = ndi.binary_dilation(A > .05, iterations=80)          # wide enough to take the poster's light halo with him
lum = art.mean(2)
valid = (~hole) & (lum > .42)
# diffuse the known yellow into the hole at 1/8 size, then bring it back up
f = 8
sv = cv2.resize(valid.astype(np.float32), (W // f, H // f), interpolation=cv2.INTER_AREA) > .99
sc = cv2.resize(art, (W // f, H // f), interpolation=cv2.INTER_AREA)
fl = np.where(sv[..., None], sc, sc[sv].mean(0))
for _ in range(400):
    fl = np.where(sv[..., None], sc, blur(fl, 2))
fill = blur(cv2.resize(fl, (W, H), interpolation=cv2.INTER_CUBIC), 4)
patch = art[40:440, 40:440]                                   # clean yellow, top left of the mirrored poster
amp = float((patch - blur(patch, 2)).std())
rng = np.random.default_rng(3)
grain = blur(rng.normal(0, 1, (H, W)).astype(np.float32), .6)
fill = np.clip(fill + grain[..., None] * amp * 1.6, 0, 1)
m = blur(hole.astype(np.float32), 24)[..., None]
bg = art * (1 - m) + fill * m
bg = cv2.resize(bg, (1920, 1080), interpolation=cv2.INTER_AREA)
save(bg, 'img/bg.jpg', quality=93)

# Sledge: a thin yellow edge, the poster's own yellow, so the navy figure stays apart from the dark menu behind him.
# Strongest on top and on the side facing the swing.
def edge(dy, dx, w):
    e = np.clip(A - ndi.shift(A, (dy, dx), order=1), 0, 1)
    return blur(e, w) * A ** 3

rim = np.maximum.reduce([edge(6, 0, 1.2), edge(0, -6, 1.2) * .8, edge(0, 6, 1.2) * .55])
im = screen(art, rim[..., None] * np.array([.96, .84, .36]) * .9)
im = np.clip(im + .35 * (im - blur(im, 1.2)), 0, 1)
save(np.dstack([im, A]), 'img/sledge.png')

print('ok')
