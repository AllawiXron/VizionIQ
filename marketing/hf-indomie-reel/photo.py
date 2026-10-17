"""Indomie reel: the end-of-month dinner plate. photo/source-indomie-egg.jpg is the CC0 photo "INDOMIE AND EGG"
(Myelnafaty10, Wikimedia Commons): Indomie with boiled eggs on a blue plastic plate, tea in a mug, on the floor,
shot on a phone with the flash. Builds assets/img/plate.jpg (1080x1920):
  - the shot scaled to the full width and placed at y = TOP, with the floor carried on above and below it
    (mirrored strips, softened) so there is room for words at the top and the logo at the bottom;
  - the flash tamed (highlights rolled off), warmed, a little more colour, and the floor pulled down around the plate.
python photo.py   (Pillow, numpy, scipy)"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

here = os.path.dirname(os.path.abspath(__file__))
W, H, TOP = 1080, 1920, 330

src = Image.open(os.path.join(here, 'photo', 'source-indomie-egg.jpg')).convert('RGB')
ph = src.resize((W, round(src.height * W / src.width)), Image.LANCZOS)          # 1080 x 1440
p = np.asarray(ph).astype(np.float32) / 255
h = p.shape[0]

# above and below the shot: the floor falls off into darkness (the words and the logo sit there). The shot fades into
# a dark floor tone with a matching fine grain, rather than a copied strip (mirroring would copy the plate's rim)
rng = np.random.default_rng(3)
tone = p[1100:1400, :400].reshape(-1, 3).mean(0) * 0.32
canvas = np.empty((H, W, 3), np.float32)
canvas[:] = tone
canvas += gaussian_filter(rng.standard_normal((H, W, 1)).astype(np.float32), (0.8, 0.8, 0)) * 0.012
def fade(n):                                                  # smoothstep 0 -> 1 over n rows
    t = np.linspace(0, 1, n)[:, None, None]
    return t * t * (3 - 2 * t)
F1, F2 = 200, 160
shot = p.copy()
shot[:F1] = canvas[TOP:TOP + F1] * (1 - fade(F1)) + p[:F1] * fade(F1)
shot[h - F2:] = p[h - F2:] * fade(F2)[::-1] + canvas[TOP + h - F2:TOP + h] * (1 - fade(F2)[::-1])
canvas[TOP:TOP + h] = shot

# grade: tame the flash, warm, a touch more colour
L = canvas @ np.array([0.2126, 0.7152, 0.0722])
roll = 1 / (1 + np.maximum(L - 0.78, 0) * 0.9)                # roll the hottest flash highlights off a little
img = canvas * roll[..., None]
img = np.clip(img * np.array([1.07, 1.0, 0.88]), 0, 1)
g = img @ np.array([0.2126, 0.7152, 0.0722])
img = np.clip(g[..., None] + (img - g[..., None]) * 1.05, 0, 1)

# light falls off away from the plate and the mug: the floor at the top and bottom goes dark for the words
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - 470) / 760) ** 2 + ((yy - 1040) / 700) ** 2)
img = img * np.clip(1.06 - 0.5 * d ** 1.8, 0.34, 1)[..., None]
Image.fromarray((np.clip(img, 0, 1) * 255).round().astype(np.uint8)).save(os.path.join(here, 'assets', 'img', 'plate.jpg'), quality=92)
print('photo at y', TOP, 'to', TOP + h)
