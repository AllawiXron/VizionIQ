"""Prepares the two studio shots made with ChatGPT (chatgpt-piggy.png, chatgpt-gift.png, 1122×1402) as full-frame
backgrounds for ads.html, at 1620×2025.

- Piggy: the generated coin is a US quarter, so it is painted out (the red sweep is filled back in from either side,
  with matching grain); ads.html puts the 1932 Iraqi riyal in its place.
- Gift: the photo is moved up so the box clears the CTA row; the floor is extended below it.

Usage: python prep_sets.py [--x4 DIR]   (DIR holds piggy_x4.png / gift_x4.png from Real-ESRGAN; else Lanczos)
"""
import os
import sys

import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "img")
X4 = sys.argv[sys.argv.index("--x4") + 1] if "--x4" in sys.argv else None
W, H = 1620, 2025


def load(name, x4name):
    if X4 and os.path.exists(os.path.join(X4, x4name)):
        im = Image.open(os.path.join(X4, x4name)).convert("RGB")
    else:
        im = Image.open(os.path.join(HERE, name)).convert("RGB")
    return im.resize((W, round(im.height * W / im.width)), Image.LANCZOS)


def fill(a, mask):
    """Fill masked pixels row by row, linearly between the nearest clean pixels left and right, then add grain."""
    out = a.copy()
    for y in np.nonzero(mask.any(1))[0]:
        xs = np.nonzero(mask[y])[0]
        x0, x1 = xs.min() - 1, xs.max() + 1
        left, right = a[y, max(x0 - 6, 0):x0].mean(0), a[y, x1:x1 + 6].mean(0)
        t = (np.arange(x0 + 1, x1) - x0) / (x1 - x0)
        out[y, x0 + 1:x1] = left[None] * (1 - t[:, None]) + right[None] * t[:, None]
    smooth = ndimage.gaussian_filter(out, (6, 6, 0))
    noise = a - ndimage.gaussian_filter(a, (2, 2, 0))
    rng = np.random.default_rng(3)
    grain = noise[rng.integers(0, a.shape[0], mask.sum()), rng.integers(0, a.shape[1], mask.sum())]
    soft = ndimage.gaussian_filter(mask.astype(float), 3)[..., None]
    result = a * (1 - soft) + smooth * soft
    result[mask] += grain * 0.8
    return result


# ---------- piggy: paint out the quarter ----------
im = load("chatgpt-piggy.png", "piggy_x4.png")
a = np.asarray(im).astype(np.float32)
s = W / 1122
y0, y1, x0, x1 = int(590 * s), int(724 * s), int(525 * s), int(618 * s)
sub = a[y0:y1, x0:x1]
mx, mn = sub.max(-1), sub.min(-1)
coin = (mx - mn) / np.maximum(mx, 1) < 0.5  # the coin is grey; the sweep is saturated red
mask = np.zeros(a.shape[:2], bool)
mask[y0:y1, x0:x1] = ndimage.binary_dilation(coin, iterations=16)
a = fill(a, mask)
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).crop((0, 0, W, H)).save(os.path.join(OUT, "piggy-set.png"), optimize=True)
print("piggy-set.png", (W, H), "coin was at", (x0, y0, x1, y1))

# ---------- gift: move up, extend the floor ----------
im = load("chatgpt-gift.png", "gift_x4.png")
SHIFT = 96
a = np.asarray(im).astype(np.float32)
a = a[SHIFT:]
floor = a[-60:]  # repeat the last band of floor, mirrored, to make up the height
need = H - a.shape[0]
ext = np.concatenate([floor[::-1], floor] * (need // 120 + 1))[:need]
a = np.concatenate([a, ext])
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(OUT, "gift-set.png"), optimize=True)
print("gift-set.png", a.shape[1::-1])
