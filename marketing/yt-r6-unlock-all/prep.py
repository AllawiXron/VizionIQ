"""Builds the layers in img/ from the photos in src/.
Masks (src/*-mask.png) come from rembg (birefnet-general) and are kept so this runs without the model:
  rembg i -m birefnet-general -om src/sledge-key-art.jpg src/sledge-mask.png
python prep.py   (Pillow, numpy, scipy)"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

def load(p, mode='RGB'):
    return np.asarray(Image.open(p).convert(mode)).astype(np.float32) / 255

def save(a, p, **kw):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p, **kw)

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def screen(base, light):
    return 1 - (1 - base) * (1 - light)

def feather(h, w, ramp):
    # 0 at the border, 1 once `ramp` px in; screened layers then have no visible edge
    y = np.minimum(np.arange(h), np.arange(h)[::-1])[:, None]
    x = np.minimum(np.arange(w), np.arange(w)[::-1])[None, :]
    f = np.clip(np.minimum(y, x) / ramp, 0, 1)
    return (f * f * (3 - 2 * f))[..., None]

# Sledge: sharpen, a little clarity, then rim light. The floodlights behind him give a cold rim on the top edges and
# a softer one on the sides; the warm map below bounces orange onto the undersides of the arms and the gear.
im = load('src/sledge-key-art.jpg')
A = load('src/sledge-mask.png', 'L')
im = im + .7 * (im - blur(im, 1.4))
im = im + .22 * (im - blur(im, 18))
im = np.clip(im, 0, 1)

def edge(dy, dx, w):
    e = np.clip(A - ndi.shift(A, (dy, dx), order=1), 0, 1)
    return blur(e, w) * A

top = edge(9, 0, 1.6)
sides = np.maximum(edge(0, 7, 1.4), edge(0, -7, 1.4))
under = edge(-10, 0, 2.2)
rim = (top[..., None] * np.array([.80, .90, 1.0]) * 1.0
       + sides[..., None] * np.array([.70, .80, .95]) * .55
       + under[..., None] * np.array([1.0, .52, .20]) * .85)
im = screen(im, np.clip(rim, 0, 1))
save(np.dstack([im, A]), 'img/sledge.png')

# Stadium lights: the key art itself, screened over the map in the same place as Sledge. The scoreboard (bottom left)
# is wiped with a heavy blur of its own area so only the glow stays.
st = load('src/sledge-key-art.jpg')
H, W = st.shape[:2]
yy, xx = np.mgrid[:H, :W]
m = np.clip(1 - np.maximum((np.abs(xx - 270) - 190) / 60, (np.abs(yy - 990) - 120) / 60), 0, 1)
st = st * (1 - m[..., None]) + blur(st, 40) * m[..., None]
st = np.clip((st - .13) / .87, 0, 1) * feather(H, W, 160)     # sky to black, so only the lamps and their haze add
save(st, 'img/stadium.jpg', quality=92)

# House map: the painting is 766 px wide, so it is scaled to the frame height first and softened there.
mp = Image.open('src/house-map.jpg').convert('RGB')
mp = mp.resize((round(mp.width * 1080 / mp.height), 1080), Image.LANCZOS)
save(blur(np.asarray(mp).astype(np.float32) / 255, 3.5), 'img/map.jpg', quality=92)

# Padlock: the brass lock from the photo with its shackle sheared where it crossed the CD. The CD and the key go.
pl = load('src/padlock-photo.jpg')
pm = load('src/padlock-mask.png', 'L')
M = pm > .5
r = 26
disk = (np.add.outer(np.arange(-r, r + 1) ** 2, np.arange(-r, r + 1) ** 2) <= r * r)
O = ndi.binary_opening(M, disk)
lab, _ = ndi.label(O)
cd = ndi.binary_dilation(lab == lab[200, 200], iterations=3)
H, W = M.shape
yy, xx = np.mgrid[:H, :W]
# key side: the body's lower right edge runs from (970, 446) to (771, 682); keep the side the body centre is on
(x1, y1), (x2, y2) = (970, 446), (771, 682)
side = (x2 - x1) * (yy - y1) - (y2 - y1) * (xx - x1)
cx, cy = 800, 470
keep_sign = np.sign((x2 - x1) * (cy - y1) - (y2 - y1) * (cx - x1))
half = side * keep_sign > -4 * np.hypot(x2 - x1, y2 - y1)
lab2, n = ndi.label(M & ~cd & half)
body = lab2 == lab2[cy, cx]
near = ndi.binary_dilation(body, iterations=45)
keep = body.copy()
for i in range(1, n + 1):                                   # the free end of the shackle stands just off the body
    c = lab2 == i
    if c.sum() > 400 and (c & near).any():
        keep |= c
region = blur(keep.astype(np.float32), .8)
a = pm * region
ys, xs = np.nonzero(a > .02)
b = (xs.min() - 4, ys.min() - 4, xs.max() + 5, ys.max() + 5)
save(np.dstack([pl, a])[b[1]:b[3], b[0]:b[2]], 'img/padlock.png')

# Brushed brass from the lock body, turned so the brush lines run across; it fills the title.
br = Image.open('src/padlock-photo.jpg').convert('RGB').rotate(-40, center=(cx, cy), resample=Image.BICUBIC)
br = br.crop((cx - 95, cy - 70, cx + 95, cy + 70)).resize((1900, 700), Image.BICUBIC)
br.save('img/brass.jpg', quality=92)

# Sparks: crushed to black so they can be screened. Welding burst (origin bottom right of the crop) and saw sparks.
sw = load('src/sparks-welding.jpg')[0:470, 0:560]
sw = np.clip((sw - .24) / .64, 0, 1) ** 1.3
yy, xx = np.mgrid[:470, :560]
hand = np.clip(np.minimum((xx - 400) / 40, (yy - 235) / 40), 0, 1)       # the welder's glove and torch
save(sw * (1 - hand[..., None]) * feather(470, 560, 60), 'img/sparks-burst.jpg', quality=92)
ss = load('src/sparks-saw.jpg')[:, 0:830]
save(np.clip((ss - .26) / .64, 0, 1) ** 1.3 * feather(640, 830, 120), 'img/sparks-fall.jpg', quality=92)
print('ok')
