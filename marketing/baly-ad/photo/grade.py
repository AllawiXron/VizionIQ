"""Crops the Arrasat night photo to 4:5 and grades it into Baly's blue/yellow -> hero.png.
Usage: python grade.py arrasat.jpg hero.png"""
import sys

import numpy as np
from PIL import Image, ImageFilter

X0, X1 = 1700, 3748          # 4:5 crop of the 3840x2560 rendition (full height)
W, H = 1620, 2025
src = Image.open(sys.argv[1]).convert("RGB").crop((X0, 0, X1, 2560)).resize((W, H), Image.LANCZOS)

# shallow depth of field: background soft, the car (bottom) sharp
blur = src.filter(ImageFilter.GaussianBlur(7))
y = np.linspace(0, 1, H)[:, None, None]
m = np.clip((y - 0.70) / 0.12, 0, 1)            # 0 = blurred above ~70%, 1 = sharp below ~82%
a = np.asarray(src).astype(np.float32) / 255 * m + np.asarray(blur).astype(np.float32) / 255 * (1 - m)

L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
stops = [(0.00, (0, 6, 30)), (0.18, (2, 22, 110)), (0.42, (0, 52, 220)), (0.62, (20, 90, 255)), (0.82, (150, 180, 255)), (1.0, (255, 255, 255))]
xs = [s[0] for s in stops]
gm = np.dstack([np.interp(L, xs, [s[1][c] / 255 for s in stops]) for c in range(3)])
out = gm * 0.74 + np.dstack([L] * 3) * 0.26

# warm lights (sodium street lamps, headlights) -> Baly yellow
warm = np.clip((a[..., 0] - a[..., 2]) * 3.0, 0, 1) * np.clip((L - 0.78) / 0.15, 0, 1)
yellow = np.array([1.0, 0.882, 0.369])
out = out * (1 - warm[..., None] * 0.9) + yellow * warm[..., None] * 0.9
# bloom on the brightest lights
hi = np.clip((L - 0.7) / 0.3, 0, 1)
bloom = np.asarray(Image.fromarray((np.dstack([hi] * 3) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(28))).astype(np.float32) / 255
out = 1 - (1 - out) * (1 - bloom * np.array([1.0, 0.9, 0.55]) * 0.55)

Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8)).save(sys.argv[2])
