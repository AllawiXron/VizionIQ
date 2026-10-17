"""Real-photo pieces for «الأسعار انگصّت» (flat lay, seen from above), into ../img/:

- tag-photo.png: the blank white price tag (Pexels 7966577, white on black), cut out by brightness. ads.html prints
  «السعر» and the Miswag mark on it and splits it in two along the cut.
- scissors-photo.png: the open scissors (Pexels 5994301, on orange-red paper), cut out by colour (the paper is the
  only saturated red), with the teal handles turned glossy white to match the campaign.

Usage: python prep_pricetag.py   (needs pillow, numpy, scipy)
"""
import colorsys  # noqa: F401  (kept for readers who want to tweak hues by hand)
import os

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "img")


def largest(mask):
    lab, n = ndimage.label(mask)
    sizes = ndimage.sum(np.ones_like(mask), lab, range(1, n + 1))
    return lab == (np.argmax(sizes) + 1)


# ---------- tag ----------
im = Image.open(os.path.join(HERE, "source-tag.jpg")).convert("RGB")
a = np.asarray(im).astype(np.float32)
m = largest(ndimage.binary_opening(a.mean(-1) > 110, iterations=3))
m = ndimage.binary_fill_holes(m) & ~(ndimage.binary_fill_holes(m) & (a.mean(-1) < 90))  # keep the punched hole open
m = ndimage.binary_erosion(m, iterations=10)  # drop the grey fringe the black set leaves on the card's edge
alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.0))
tag = im.copy()
tag.putalpha(alpha)
tag = tag.crop(alpha.getbbox())
# the studio light on the black set left the card a little grey; lift it to clean white paper
t = np.asarray(tag).astype(np.float32)
t[..., :3] = np.clip(t[..., :3] * 1.06 + 6, 0, 255)
tag = Image.fromarray(t.astype(np.uint8), "RGBA")
tag.thumbnail((2000, 2000), Image.LANCZOS)
tag.save(os.path.join(OUT, "tag-photo.png"), optimize=True)
print("tag-photo.png", tag.size)

# ---------- scissors ----------
im = Image.open(os.path.join(HERE, "source-scissors.jpg")).convert("RGB")
a = np.asarray(im).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
paper = (r > g + 70) & (r > b + 70)
m = largest(ndimage.binary_opening(~paper, iterations=2))
m = ndimage.binary_fill_holes(m) & ~paper  # finger holes show the paper; keep them open
alpha = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
# the paper's red bounces onto the steel; pull the blades back to neutral silver
lum = a @ np.array([0.299, 0.587, 0.114])
teal = (b > r + 25) | (g > r + 25)
teal = ndimage.binary_dilation(teal, iterations=2) & m
steel = m & ~teal
out = a.copy()
out[steel] = (a[steel] * 0.35 + lum[steel][:, None] * 0.65)
# handles: teal plastic → glossy white plastic, keeping the shading
hl = lum[teal]
out[teal] = np.clip(168 + (hl - np.percentile(hl, 5)) / max(np.percentile(hl, 95) - np.percentile(hl, 5), 1) * 86, 0, 255)[:, None] * np.array([1.0, 0.99, 0.98])
sc = Image.fromarray(out.astype(np.uint8))
sc.putalpha(alpha)
sc = sc.crop(alpha.getbbox())
sc.save(os.path.join(OUT, "scissors-photo.png"), optimize=True)
print("scissors-photo.png", sc.size)
