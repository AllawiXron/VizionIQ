"""Cleans the cut-out egg basket (img/basket.png): autumn leaves seen through the wire mesh are pushed down to basket
shadow, and the photo's faded film look gets its blacks and contrast back.
Per pixel, not by mask: a pixel is darkened only if it is both textured (leaf/wire) and darker than an egg, so egg
outlines stay intact.   python basket_fix.py basket_cutout.png ../img/basket.png"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi


def smooth(x, e0, e1):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


im = np.asarray(Image.open(sys.argv[1]).convert("RGBA")).astype(np.float32) / 255
rgb, a = im[..., :3], im[..., 3]
L = rgb @ np.array([0.2126, 0.7152, 0.0722])
mu = ndi.uniform_filter(L, 7)
sd = np.sqrt(np.clip(ndi.uniform_filter(L * L, 7) - mu * mu, 0, None))
w = smooth(sd, 0.035, 0.08) * (1 - smooth(L, 0.38, 0.56))       # textured AND dark -> leaf / ground
w = np.maximum(w, 1 - smooth(mu, 0.18, 0.32))                     # deep shadow pockets
w = ndi.gaussian_filter(w, 1.0)
dark = rgb * np.array([0.30, 0.27, 0.25])
rgb = rgb * (1 - w[..., None]) + dark * w[..., None]
rgb = np.clip((rgb - 0.06) / 0.94, 0, 1)                          # restore the black point
mid = rgb.mean(-1, keepdims=True)
rgb = np.clip(mid + (rgb - mid) * 1.12, 0, 1)
Image.fromarray((np.dstack([rgb, a]) * 255).round().astype(np.uint8), "RGBA").save(sys.argv[2])
