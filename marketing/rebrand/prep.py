"""python3 prep.py: the chameleon photo as a 1080x1350 plate graded into the orange world (img/plate-chameleon.png),
plus the animal alone (img/fg-chameleon.png) so the headline can sit behind its crest."""
import numpy as np
from PIL import Image, ImageFilter

W, H = 1080, 1350
src = Image.open('img/chameleon-src.jpg').convert('RGB')
x0, x1 = 420, 2340                                   # the branch, the head and the curled tail
k = W / (x1 - x0)
ph = round(src.height * k)
photo = src.crop((x0, 0, x1, src.height)).resize((W, ph), Image.LANCZOS)
top = H - ph                                         # the photo sits at the bottom; the backdrop carries on above it

a = np.zeros((H, W, 3), np.float32)
a[top:] = np.asarray(photo, np.float32)
edge = a[top:top + 30].mean(0)                       # the backdrop colour along the photo's top edge, column by column
edge = np.asarray(Image.fromarray(edge.clip(0, 255).astype(np.uint8)[None]).resize((W, 1)).filter(ImageFilter.GaussianBlur(20)), np.float32)[0]
for y in range(top):
    f = 1 - 0.18 * (1 - y / top)                     # a little darker towards the top
    a[y] = edge * f
seam = 40                                            # blend the extension into the photo
for i in range(seam):
    t = i / seam
    a[top + i] = a[top + i] * t + edge * (1 - t)
rng = np.random.default_rng(4)
a[:top + seam] += rng.normal(0, 1.2, (top + seam, W, 1))

# the grade: shadows lifted into burnt orange, warmer mids, the green half a touch quieter so the orange leads
n = a / 255
l = n.mean(2, keepdims=True)
n = n + (1 - l) ** 3 * np.array([0.13, 0.035, 0.0]) * (1 - l)
green = np.clip((n[..., 1:2] - n[..., 0:1]) * 6, 0, 1)
n = n * (1 - 0.18 * green) + l * 0.18 * green
n = np.clip(n, 0, 1)
n = 0.5 + (n - 0.5) * 1.06
n = np.clip(n * np.array([1.04, 0.99, 0.94]), 0, 1)
plate = (n * 255).astype(np.uint8)
Image.fromarray(plate).save('img/plate-chameleon.png')

# the animal (and branch) against the dark backdrop: bright or saturated pixels, softened by a pixel
mx = n.max(2); sat = mx - n.min(2)
m = np.clip((mx - 0.2) / 0.08, 0, 1) * np.clip((sat - 0.12) / 0.08 + (mx - 0.32) / 0.1, 0, 1)
mask = Image.fromarray((m * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(5)).filter(ImageFilter.GaussianBlur(0.8))
fg = Image.fromarray(plate).convert('RGBA'); fg.putalpha(mask)
fg.save('img/fg-chameleon.png')
print('photo top at', top)
