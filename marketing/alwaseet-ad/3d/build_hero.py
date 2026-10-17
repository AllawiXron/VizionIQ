"""Composites the two Cycles passes into img/hero.png.

Pass A has the parcel and strap, pass B has neither. Inside the genie's fist (polygon projected by scene.py) B is
laid over A, so the carved fingers sit in front of the strap and he actually grips it. Then the blues are graded
toward Al-Waseet's royal blue (hue ~232°, as in their own posts); stone and the white parcel are left alone.

Usage: python build_hero.py <render_prefix>   (reads <prefix>_A.png, <prefix>_B.png, <prefix>.json)
"""
import json
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

prefix = sys.argv[1]
a = Image.open(prefix + "_A.png").convert("RGB")
b = Image.open(prefix + "_B.png").convert("RGB")
info = json.load(open(prefix + ".json"))

mask = Image.new("L", a.size, 0)
ImageDraw.Draw(mask).polygon([tuple(p) for p in info["fist"]], fill=255)
mask = mask.filter(ImageFilter.GaussianBlur(1.6))
hero = Image.composite(b, a, mask)


def smooth(x, e0, e1):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)


hsv = np.asarray(hero.convert("HSV")).astype(np.float32) / 255
h, s, v = hsv[..., 0] * 360, hsv[..., 1], hsv[..., 2]
w = smooth(s, 0.30, 0.55) * smooth(h, 185, 200) * (1 - smooth(h, 250, 265))
h = (h + 14 * w) % 360
s = s * (1 - 0.12 * w)
v = v * (1 - 0.15 * w)
hero = Image.fromarray((np.dstack([h / 360, s, v]) * 255).round().astype(np.uint8), "HSV").convert("RGB")
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "img", "hero.png")
hero.save(out, optimize=True)
print(out, hero.size)
