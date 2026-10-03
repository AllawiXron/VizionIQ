"""Crops the 1932 Shorja photo (LOC Matson Collection, public domain) to 4:5 and grades it -> hero.png.
Rich black-and-white with a faint warm tone, so the Miswag red on top is the only colour.
Usage: python grade.py shorja.jpg ../img/hero.png   (3840x2923 Commons rendition)"""
import sys

import numpy as np
from PIL import Image, ImageFilter

X0, Y0, X1, Y1 = 750, 423, 2750, 2923   # 2000x2500 = 4:5, centred on the man in the white robe
W, H = 1620, 2025
g = Image.open(sys.argv[1]).convert("L").crop((X0, Y0, X1, Y1)).resize((W, H), Image.LANCZOS)
a = np.asarray(g).astype(np.float32) / 255
# contrast: gentle S-curve, deeper blacks, keep the light beams
a = np.clip((a - 0.04) / 0.94, 0, 1)
a = a * a * (3 - 2 * a) * 0.55 + a * 0.45
# local clarity (unsharp) for the period grain
blur = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))).astype(np.float32) / 255
a = np.clip(a + (a - blur) * 0.6, 0, 1)
# faint warm tone: shadows neutral-cool, highlights warm paper
tone_lo, tone_hi = np.array([0.04, 0.04, 0.05]), np.array([1.0, 0.97, 0.91])
rgb = tone_lo + (tone_hi - tone_lo) * a[..., None]
Image.fromarray((np.clip(rgb, 0, 1) * 255).round().astype(np.uint8)).save(sys.argv[2])
