"""Cuts the four grilled saj wraps out of Saj Al-Reef's menu photo -> ../img/saj.png.
rembg (isnet-general-use) separates the food; the wooden board comes out half-transparent, so the mask is hardened,
only the wraps component is kept, holes in the fillings are filled, and colour is taken from the original photo.
Usage: python cutout.py source-menu-photo.jpg ../img/saj.png   (pip install rembg[cpu] scipy pillow numpy)"""
import sys

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage as ndi

src = Image.open(sys.argv[1]).convert("RGB")
cut = np.asarray(remove(src, session=new_session("isnet-general-use"))).astype(np.float32)
alpha = cut[..., 3] / 255
lab, n = ndi.label(alpha > 0.75)
sizes = ndi.sum(alpha > 0.75, lab, range(1, n + 1))
# the wraps are the component that reaches furthest right and down (fries basket and sauce cups are separate)
ys = [np.nonzero(lab == k + 1)[0].max() for k in range(n)]
wraps = max((k for k in range(n) if sizes[k] > 0.05 * sizes.max()), key=lambda k: ys[k]) + 1
keep = ndi.binary_dilation(lab == wraps, iterations=4)
alpha = np.clip((alpha - 0.45) / 0.35, 0, 1) * keep
solid = ndi.binary_erosion(ndi.binary_fill_holes(ndi.binary_closing(alpha > 0.5, iterations=6)), iterations=2)
alpha = ndi.gaussian_filter(np.maximum(alpha, solid.astype(np.float32)), 0.8)
out = Image.fromarray(np.dstack([np.asarray(src).astype(np.float32), alpha * 255]).astype(np.uint8), "RGBA")
out.crop(out.getchannel("A").getbbox()).save(sys.argv[2])
