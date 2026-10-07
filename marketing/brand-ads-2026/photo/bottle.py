"""Pepsi: the glass bottle (right) from source-pepsi-bottles.jpg ("Top-down View of a Burger Meal with Two Pepsi
Bottles" by Iwaqarhashmi, CC BY-SA 4.0), cut out with rembg. Its right side touches the photo edge, so the ad bleeds it
off the right of the canvas.  python bottle.py ../img/pepsi-bottle.png"""
import sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

src = Image.open('source-pepsi-bottles.jpg').convert('RGB').crop((1240, 160, 2252, 3740))
cut = remove(src, session=new_session('isnet-general-use'))
a = np.asarray(cut).astype(np.float32) / 255
rgb, al = a[..., :3], a[..., 3]
rgb = np.clip((rgb - 0.5) * 1.12 + 0.5 + 0.01, 0, 1)        # a bit more snap
al = np.where(al < 0.05, 0, al)
# the clear neck shows the restaurant's warm bokeh through the glass: re-tint it toward the ad's blue, keep highlights
h = rgb.shape[0]
y = np.arange(h)[:, None]
glass = np.clip((860 - y) / 120, 0, 1)                      # above the cola line (~y 860 in this crop)
L = rgb @ np.array([0.2126, 0.7152, 0.0722])
blue = np.array([0.10, 0.26, 0.95])
tint = blue * (0.35 + 0.9 * L[..., None]) + np.clip(L[..., None] - 0.72, 0, 1) * 2.2   # glass takes the background, hot spots stay white
rgb = rgb * (1 - glass[..., None] * 0.78) + np.clip(tint, 0, 1) * glass[..., None] * 0.78
Image.fromarray((np.dstack([rgb, al]) * 255).round().astype(np.uint8), 'RGBA').save(sys.argv[1])
