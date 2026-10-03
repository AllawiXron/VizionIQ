"""Builds img/hero.png (1620x2025) from Saj Al-Reef's own «قوزي مكس» photo.
1. The 800x744 source is upscaled 4x with Real-ESRGAN (upscale.py) and blended 45/55 with a Lanczos upscale so the
   texture stays natural.
2. The 4:5 canvas extends the photo's dark slate upward (room for the headline) and downward (footer), with a matching
   noise texture and soft blends.
3. Grade: the source is very saturated, so saturation is pulled back slightly; a touch warmer, deeper blacks, vignette.
Usage: python plate.py source-quzi-mix.jpg quzi_x4.png ../img/hero.png"""
import sys

import numpy as np
from PIL import Image, ImageFilter

W, H = 1620, 2025
TOP = int(sys.argv[4]) if len(sys.argv) > 4 else 470    # photo top edge on the canvas
src = Image.open(sys.argv[1]).convert("RGB")
pw, ph = W, round(W * src.height / src.width)
esr = Image.open(sys.argv[2]).convert("RGB").resize((pw, ph), Image.LANCZOS)
lan = src.resize((pw, ph), Image.LANCZOS)
photo = np.asarray(esr).astype(np.float32) * 0.45 + np.asarray(lan).astype(np.float32) * 0.55

rng = np.random.default_rng(4)
base = np.full((H, W, 3), 28.0, np.float32)
noise = np.asarray(Image.fromarray((rng.normal(128, 30, (H // 2, W // 2))).clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)).resize((W, H))).astype(np.float32)
base += (noise[..., None] - 128) * 0.12
canvas = base.copy()
y0, y1 = TOP, min(TOP + ph, H)
m = np.ones((y1 - y0, 1, 1), np.float32)
fade = 160
m[:fade] = np.linspace(0, 1, fade)[:, None, None]
if y1 - y0 == ph:
    m[-fade:] = np.minimum(m[-fade:], np.linspace(1, 0, fade)[:, None, None])
canvas[y0:y1] = photo[: y1 - y0] * m + base[y0:y1] * (1 - m)

# grade
a = canvas / 255
lum = a @ np.array([0.2126, 0.7152, 0.0722])
sat = np.clip((a.max(-1) - a.min(-1)) * 3, 0, 1)[..., None]                 # only coloured pixels (food, wood)
a = a - sat * (a - lum[..., None]) * 0.12                                    # the source is already very saturated: pull it back
a = a * (1 + sat * np.array([0.02, 0.01, -0.02]))                            # a touch warmer
a = np.clip((a - 0.02) / 0.98, 0, 1) ** 1.06                                 # deeper blacks
yy, xx = np.mgrid[0:H, 0:W]
v = 1 - 0.35 * np.clip(((xx - W * 0.55) / (W * 0.75)) ** 2 + ((yy - H * 0.62) / (H * 0.7)) ** 2, 0, 1)
a = a * v[..., None]
Image.fromarray((np.clip(a, 0, 1) * 255).round().astype(np.uint8)).save(sys.argv[3])
print("plate", W, H, "photo", pw, ph, "top", TOP)
