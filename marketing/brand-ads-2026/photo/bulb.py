"""Asiacell: the bulb from source-bulb.jpg, cut out (rembg isnet-general-use) and graded to look switched off:
filaments and glass pulled down to a dull cold grey, plus a faint red spill on the side that faces the neon sign.
python bulb.py ../img/bulb-off.png"""
import sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

src = Image.open('source-bulb.jpg').convert('RGB').crop((560, 820, 1040, 1400))
cut = remove(src, session=new_session('isnet-general-use'))
a = np.asarray(cut).astype(np.float32) / 255
rgb, al = a[..., :3], a[..., 3]
L = rgb @ np.array([0.2126, 0.7152, 0.0722])
grey = np.repeat(L[..., None], 3, -1)
rgb = grey * 0.92 + rgb * 0.08                          # nearly no colour left
Lc = 0.04 + 0.46 * np.power(np.clip(L, 0, 1), 2.3)     # crush: dead filament reads as a dull grey strip
rgb = rgb * (Lc / np.maximum(L, 1e-4))[..., None]
rgb = rgb * np.array([0.93, 0.97, 1.04])               # cold
h, w = L.shape
X = np.linspace(0, 1, w)[None, :]
Y = np.linspace(0, 1, h)[:, None]
spill = np.clip(1 - X * 1.6, 0, 1) * np.clip(Y * 1.4 - 0.1, 0, 1) * 0.55   # red light from the left, lower half
rgb = rgb * (1 - spill[..., None]) + (rgb + np.array([0.42, 0.03, 0.04]) * 0.55) * spill[..., None]
al = al * np.clip(0.45 + 0.75 * L, 0, 1)                 # thin glass: the dark room shows through, scratches and rims stay
Image.fromarray((np.dstack([np.clip(rgb, 0, 1), al]) * 255).round().astype(np.uint8), 'RGBA').save(sys.argv[1])
