"""Cuts the Nimrud relief (The Met 17.190.2077, CC0) out of its grey photo backdrop -> relief_tex.png for scene.py.

The stone is warm and the backdrop neutral grey, so the slab is segmented by warmth (R - B), cleaned up and
hole-filled. Source: https://images.metmuseum.org/CRDImages/an/original/DP355702.jpg
"""
import sys

import numpy as np
from PIL import Image
from scipy import ndimage as ndi

Image.MAX_IMAGE_PIXELS = None
im = Image.open(sys.argv[1]).convert("RGB")
a = np.asarray(im).astype(np.float32)
m = ndi.gaussian_filter(a[..., 0] - a[..., 2], 3) > 9
m = ndi.binary_opening(m, iterations=3)
lab, n = ndi.label(m)
m = lab == (np.argmax(ndi.sum(m, lab, range(1, n + 1))) + 1)
m = ndi.binary_fill_holes(ndi.binary_closing(ndi.binary_fill_holes(m), iterations=6))
im.putalpha(Image.fromarray((ndi.gaussian_filter(m.astype(np.float32), 1.5) * 255).astype(np.uint8)))
im.resize((im.width * 2600 // im.height, 2600), Image.LANCZOS).save("relief_tex.png")
