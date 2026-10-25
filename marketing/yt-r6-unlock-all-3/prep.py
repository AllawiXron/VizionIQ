"""Builds the layers in img/ from the images in src/.
The cut-out mask (src/thatcher-mask.png) is kept, so this runs on Pillow, numpy and scipy alone.
python prep.py"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

S, X0 = 1.75, 100      # the key art at 1.75x, moved 100 px right so Thatcher stands right of centre

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def save(a, p, **kw):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p, **kw)

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def screen(base, light):
    return 1 - (1 - base) * (1 - light)

src = Image.open('src/thatcher.jpg').convert('RGB')
msk = Image.open('src/thatcher-mask.png').convert('L')
size = (round(src.width * S), round(src.height * S))
art = arr(src.resize(size, Image.LANCZOS))
A = arr(msk.resize(size, Image.LANCZOS))

# Background: his own orange smoke. The 100 px the move leaves on the left are the next 100 px mirrored.
bg = np.zeros((1080, 1920, 3), np.float32)
bg[:, X0:] = art[:1080, :1920 - X0]
bg[:, :X0] = art[:1080, 1:X0 + 1][:, ::-1]
save(blur(bg, 2), 'img/bg.jpg', quality=93)

# Thatcher: edge pixels refilled from just inside the outline, sharpened at the new size, then lit. The menu in
# front of him at the bottom left is a screen, so it throws a cool white edge on everything facing it; his lenses
# are the brightest thing on him and get a little more of their own orange.
im = art.copy()
inner = (A > .92).astype(np.float32)
fill = blur(im * inner[..., None], 3) / (blur(inner, 3)[..., None] + 1e-4)
im = np.where(((A < .92) & (blur(inner, 3) > .02))[..., None], fill, im)
im = im + .9 * (im - blur(im, 1.3))
im = im + .2 * (im - blur(im, 16))
im = np.clip(im, 0, 1)

def edge(dy, dx, w):
    e = np.clip(A - ndi.shift(A, (dy, dx), order=1), 0, 1)
    return blur(e, w) * A ** 3

H, W = A.shape
yy, xx = np.mgrid[:H, :W].astype(np.float32)
toward = np.clip(1.15 - xx / (W * .55), 0, 1) * np.clip(.35 + yy / H, 0, 1)    # bottom left, where the menu is
front = edge(0, 7, 1.2) * toward
spill = blur(A, 30) * A * toward * .12
im = screen(im, np.clip((front * .9 + spill)[..., None] * np.array([.86, .93, 1.0]), 0, 1))

lens = np.zeros((H, W), np.float32)
for cx, cy in ((566, 112), (633, 110)):
    d = np.hypot(xx - cx * S, yy - cy * S) / (30 * S)
    lens = np.maximum(lens, np.clip(1.3 - d, 0, 1))
lens = blur(lens, 4)[..., None]
g = im.mean(2, keepdims=True)
im = np.clip(im + lens * ((im - g) * .35 + im * .22), 0, 1)

save(np.dstack([im, A])[:1080, :1920 - X0], 'img/thatcher.png')

# Title texture: the brushed brass from the first thumbnail turned to brushed steel.
br = arr(Image.open('img/brass.jpg').convert('L'))
save(np.clip((br - br.mean()) * 1.6 + .5, 0, 1), 'img/steel.jpg', quality=92)
print('ok')
