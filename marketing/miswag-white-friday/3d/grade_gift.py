"""Pushes the ribbon in the gift render to Miswag red (#de1c24): AgX keeps highlights soft, which reads coral.
Usage: python grade_gift.py in.png out.png"""
import sys

import numpy as np
from PIL import Image

im = Image.open(sys.argv[1]).convert("RGBA")
a = np.asarray(im).astype(np.float32) / 255
rgb, al = a[..., :3], a[..., 3:]
mx, mn = rgb.max(-1), rgb.min(-1)
sat = (mx - mn) / np.maximum(mx, 1e-4)
red = np.clip((sat - 0.25) / 0.25, 0, 1) * (rgb[..., 0] >= mx - 1e-4)  # the ribbon, not the white box
target = np.array([0.871, 0.110, 0.141])  # #de1c24
lum = rgb @ np.array([0.299, 0.587, 0.114])
shaded = target[None, None, :] * np.clip(lum / 0.5, 0, 1.25)[..., None]  # keep the satin's light and shade
shaded = np.clip(shaded + np.clip(lum - 0.62, 0, 1)[..., None] * 0.9, 0, 1)  # soft white sheen on the brightest folds
out = rgb * (1 - red[..., None] * 0.8) + shaded * red[..., None] * 0.8
Image.fromarray((np.dstack([out, al]) * 255).round().astype(np.uint8), "RGBA").save(sys.argv[2])
print("graded", sys.argv[2])
