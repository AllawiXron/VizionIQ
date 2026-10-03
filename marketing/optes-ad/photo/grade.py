"""Crops the CC0 lightning photo to 4:5 and grades it into Optes' black and electric blue -> hero.png.
Usage: python grade.py source-lightning.jpg ../img/hero.png   (1920x2898 Commons rendition)"""
import sys

import numpy as np
from PIL import Image, ImageFilter

Y0 = 300                      # 4:5 crop (1920x2400): dark cloud on top for the headline, the strike and the ground below
W, H = 1620, 2025
src = Image.open(sys.argv[1]).convert("RGB").crop((0, Y0, 1920, Y0 + 2400)).resize((W, H), Image.LANCZOS)
a = np.asarray(src).astype(np.float32) / 255

# gradient map: night sky to near-black navy, the bolt to electric blue and white
L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
stops = [(0.00, (1, 3, 10)), (0.14, (3, 10, 34)), (0.32, (10, 36, 120)), (0.55, (40, 105, 255)), (0.78, (165, 200, 255)), (1.0, (255, 255, 255))]
xs = [s[0] for s in stops]
gm = np.dstack([np.interp(L, xs, [s[1][c] / 255 for s in stops]) for c in range(3)])
out = gm * 0.8 + a * 0.2
# deepen the sky a touch so the type sits on near-black
out = out * (0.82 + 0.18 * np.clip((L - 0.25) / 0.4, 0, 1))[..., None]

# glow around the bolt
hi = np.clip((L - 0.62) / 0.38, 0, 1)
glow = np.asarray(Image.fromarray((hi * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(36))).astype(np.float32)[..., None] / 255
out = 1 - (1 - out) * (1 - glow * np.array([0.35, 0.55, 1.0]) * 0.6)

Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8)).save(sys.argv[2])
print("saved", sys.argv[2], W, H)
