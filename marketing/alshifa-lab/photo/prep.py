"""Cuts the two hands out and writes ../img/hand-tube.png and ../img/hand-blood.png.

Usage: python prep.py [--x4 DIR]
  Sources are source-*.jpg here (1024 px, CC0, Rawpixel). With --x4, 4x Real-ESRGAN upscales of the same photos
  (DIR/labtube_x4.png, DIR/bloodtube_x4.png) are used for the pixels; the masks always come from rembg on the
  originals. Needs rembg, pillow, numpy, scipy.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "img")
X4 = sys.argv[sys.argv.index("--x4") + 1] if "--x4" in sys.argv else None
session = new_session("isnet-general-use")


def largest(mask):
    lab, n = ndimage.label(mask > 0.5)
    if n <= 1:
        return mask
    sizes = ndimage.sum(np.ones_like(mask), lab, range(1, n + 1))
    return mask * (lab == (np.argmax(sizes) + 1))


def load(src, x4name):
    im = Image.open(os.path.join(HERE, src)).convert("RGB")
    a = np.asarray(remove(im, session=session, only_mask=True), np.float32) / 255
    a = largest(a)
    big = Image.open(os.path.join(X4, x4name)).convert("RGB") if X4 else im.resize((im.width * 4, im.height * 4), Image.LANCZOS)
    return im, np.asarray(big, np.float32), a


def finish(rgb, alpha, crop, width, name):
    """rgb: 4x pixels, alpha: 1x mask; crop in 1x coords; writes width px wide."""
    s = 4
    A = Image.fromarray((alpha * 255).astype(np.uint8)).resize((rgb.shape[1], rgb.shape[0]), Image.BICUBIC)
    A = np.asarray(A.filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
    A = np.clip((A - 0.5) * 1.6 + 0.5, 0, 1)  # tighten the soft upscaled edge
    out = np.dstack([np.clip(rgb, 0, 255), A * 255]).astype(np.uint8)
    x0, y0, x1, y1 = crop
    im = Image.fromarray(out, "RGBA").crop((x0 * s, y0 * s, x1 * s, y1 * s))
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, name), optimize=True)
    print(name, im.size)


def lum(rgb):
    return rgb[..., 0] * 0.299 + rgb[..., 1] * 0.587 + rgb[..., 2] * 0.114


# --- 1. blue glove holding an EDTA tube (purple cap) --------------------------------------------------------------
im, rgb, a = load("source-lab-tube.jpg", "labtube_x4.png")
s = 4
# the manufacturer's print on the label: lift the text off and keep the paper, its shading and the purple stripe
H, W = rgb.shape[:2]
yy, xx = np.mgrid[0:H, 0:W] / s
lean = (yy - 250) * 0.063  # the tube leans a little to the left going down
label = (yy > 236) & (yy < 446) & (xx > 560 - lean) & (xx < 614 - lean)
paper = label & (lum(rgb) > 138)
ink = ndimage.binary_dilation(label & ~paper, iterations=10) & label
# fill the ink from the paper around it (normalised blur), so the label keeps its cylinder shading
sig = 7 * s
num = np.dstack([ndimage.gaussian_filter(rgb[..., c] * paper, sig) for c in range(3)])
den = ndimage.gaussian_filter(paper.astype(np.float32), sig)[..., None]
clean = num / np.maximum(den, 1e-3)
w = ndimage.gaussian_filter(ink.astype(np.float32), 2)[..., None]
rgb = rgb * (1 - w) + clean * w
# the clear glass below the label: let the background through, keep the highlights
gx0, gy0, gx1, gy1 = 536, 446, 600, 578
glass = np.zeros_like(a)
glass[gy0:gy1, gx0:gx1] = 1
glass = ndimage.gaussian_filter(glass, 2)
g1 = lum(np.asarray(im, np.float32))
keep = np.clip((g1 - 150) / 70, 0, 1)  # bright reflections stay solid
a = a * (1 - glass * (1 - (0.5 + 0.5 * keep)))
finish(rgb, a, (180, 58, 702, 652), 1400, "hand-tube.png")

# --- 2. purple glove holding a tube of blood -----------------------------------------------------------------------
im, rgb, a = load("source-blood-tube.jpg", "bloodtube_x4.png")
s = 4
src = np.asarray(im, np.float32)
# rembg frays the frosted glass, so the tube gets a geometric outline: a capsule along the tube's axis, its edges
# measured from the mask (slightly wider at the bottom, nearer the camera), round at the bottom
C, D = np.array([208.86, 789.42]), np.array([-0.54072, 0.84120])
N = np.array([-D[1], D[0]])
H, W = rgb.shape[:2]
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32) / s
t = (xx - C[0]) * D[0] + (yy - C[1]) * D[1]
w = (xx - C[0]) * N[0] + (yy - C[1]) * N[1]
lo, hi = -60.8 - 0.0304 * t, 64.9 - 0.0085 * t
tc, r = 142.5, 64.5  # bottom cap
wc = -0.9
side = np.maximum(lo - w, w - hi)
cap = np.hypot(t - tc, w - wc) - r
dist = np.where(t < tc, side, cap)
dist = np.where(t < -610, np.maximum(dist, -610 - t), dist)
capsule = np.clip(0.5 - dist * s, 0, 1)
A = Image.fromarray((a * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
A = np.asarray(A.filter(ImageFilter.GaussianBlur(1.2)), np.float32) / 255
A = np.clip((A - 0.5) * 1.6 + 0.5, 0, 1)
hand = A * (t < -380)  # the glove, as rembg sees it
L = lum(rgb)
mx, mn = rgb.max(-1), rgb.min(-1)
sat = (mx - mn) / np.maximum(mx, 1)
glove = np.clip((rgb[..., 2] - rgb[..., 1] - 8) / 10, 0, 1)  # lavender: blue well above green
glass = capsule * (sat < 0.22) * (L > 95) * (1 - glove)  # what is not blood or glove inside the tube
# glass: neutral (no pink cast from the blood), see-through, with its reflections and rims kept
grey = L[..., None].repeat(3, -1)
rgb = rgb * (1 - glass[..., None] * 0.8) + grey * glass[..., None] * 0.8
hiL = np.clip((L - 228) / 22, 0, 1)
rim = np.clip(1 - np.abs(dist) * s / 14, 0, 1) * 0.5
ga = np.clip(0.34 + 0.66 * hiL + rim, 0, 1)
tube_a = capsule * (1 - glass) + capsule * glass * ga
alpha = np.maximum(hand * (1 - capsule), tube_a)
alpha = np.maximum(alpha, hand * np.maximum(sat > 0.22, glove))  # fingers in front of the tube stay solid
out = np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8)
x0, y0, x1, y1 = 60, 196, 683, 1000
img = Image.fromarray(out, "RGBA").crop((x0 * s, y0 * s, x1 * s, y1 * s))
img = img.resize((1300, round(img.height * 1300 / img.width)), Image.LANCZOS)
img.save(os.path.join(OUT, "hand-blood.png"), optimize=True)
print("hand-blood.png", img.size)
