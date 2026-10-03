"""Their mascot, from their own OPTES 1.0 Flash post: 4x Real-ESRGAN upscale (source-mascot.png -> mascot_x4.png),
rembg isnet-anime cut-out (mascot_cut.png), then this script: removes the leftovers of their old layout with a
hand-drawn keep-polygon, firms up the alpha, and adds a cyan rim light from the headphone side -> ../img/mascot.png.
Usage: python mascot.py mascot_cut.png ../img/mascot.png"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage as ndi

im = Image.open(sys.argv[1]).convert("RGBA")
W, H = im.size                                   # 1820 x 2088
k = W / 910                                      # polygon drawn on the half-size preview
keep = [(300, 30), (420, 20), (560, 40), (640, 90), (700, 150), (745, 225), (775, 300), (805, 360), (835, 430), (850, 500),
        (845, 570), (830, 620), (910, 660), (910, 1044), (100, 1044), (100, 800), (130, 770), (112, 750), (86, 700), (62, 650),
        (46, 600), (36, 550), (26, 500), (18, 450), (16, 400), (20, 350), (30, 300), (55, 250), (95, 200), (125, 150), (200, 70)]
m = Image.new("L", (W, H), 0)
ImageDraw.Draw(m).polygon([(x * k, y * k) for x, y in keep], fill=255)
# the gold haze band under her hair on the left (their old background), cut away
ImageDraw.Draw(m).polygon([(x * k, y * k) for x, y in [(55, 752), (345, 752), (335, 802), (55, 808)]], fill=0)
m = np.asarray(m.filter(ImageFilter.GaussianBlur(6))).astype(np.float32) / 255
# dissolve the lower-left (shoulder, hair tips) into the dark along a diagonal, key-art style
yy, xx = np.mgrid[0:H, 0:W] / k
line = 620 + (xx - 40) * (380 / 400)            # (40, 620) -> (440, 1000)
t = np.clip((yy - line + 60) / 120, 0, 1)
m *= 1 - t * t * (3 - 2 * t)

# her hair touches the left border of the source crop: dissolve it instead of a straight cut
fx = np.clip(xx * k / 90, 0, 1)
m *= fx * fx * (3 - 2 * fx)
rgba = np.asarray(im).astype(np.float32) / 255
a = rgba[..., 3] * m
a = np.clip((a - 0.12) / 0.76, 0, 1)             # drop the faint background haze rembg kept
# keep only the main body (largest connected blob)
lab, n = ndi.label(a > 0.05)
if n > 1:
    sizes = ndi.sum(np.ones_like(a), lab, range(1, n + 1))
    a *= (lab == (np.argmax(sizes) + 1))
rgb = rgba[..., :3]

# rim light: cyan on the edges that face the headphone (right), a touch of gold on the left
inner = ndi.gaussian_filter(a, 10)
edge = np.clip(a - inner, 0, 1) * 2.2
xs = np.linspace(0, 1, W)[None, :]
cyan = np.array([0.35, 0.8, 1.0]); gold = np.array([1.0, 0.78, 0.38])
rim = edge[..., None] * (cyan * np.clip((xs - 0.45) / 0.4, 0, 1)[..., None] + gold * np.clip((0.5 - xs) / 0.4, 0, 1)[..., None] * 0.6)
rgb = 1 - (1 - rgb) * (1 - np.clip(rim, 0, 1))
# deepen the blacks toward the scene's navy
L = rgb.mean(-1, keepdims=True)
rgb = rgb * (0.9 + 0.1 * L) + np.array([0.0, 0.01, 0.04]) * (1 - L) * 0.6

out = np.dstack([np.clip(rgb, 0, 1), a])
img = Image.fromarray((out * 255).round().astype(np.uint8), "RGBA").resize((1300, round(1300 * H / W)), Image.LANCZOS)
img.save(sys.argv[2])
print("saved", sys.argv[2], img.size)
