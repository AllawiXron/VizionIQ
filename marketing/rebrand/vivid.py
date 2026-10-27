"""python3 vivid.py <name>: img/plate-<name>.png with its dark studio backdrop regraded into a vivid lit orange-red
(img/vivid-<name>.png): bright behind the subject, deep red at the edges. Only pixels that match a smooth model of the
backdrop are recoloured, softly, so the animal and the branch keep their own colours."""
import sys

import numpy as np
from PIL import Image, ImageFilter

name = sys.argv[1]
cx, cy = float(sys.argv[2]), float(sys.argv[3])          # where the light falls, as fractions of width and height
a = np.asarray(Image.open(f'img/plate-{name}.png').convert('RGB'), np.float32) / 255
H, W, _ = a.shape
yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]
B = np.stack([np.ones_like(xx), xx, yy, xx * xx, xx * yy, yy * yy, xx ** 3, yy ** 3, xx * xx * yy, xx * yy * yy], -1).reshape(-1, 10)
lum = a.mean(2)
tex = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
bg = (lum < np.percentile(lum, 55)) & (tex < 0.02)
for _ in range(3):
    sel = bg.reshape(-1)
    coef = np.linalg.lstsq(B[sel][::7], a.reshape(-1, 3)[sel][::7], rcond=None)[0]
    model = (B @ coef).reshape(H, W, 3)
    d = np.sqrt(((a - model) ** 2).sum(2))
    bg = (d < 0.035) & (tex < 0.03)
# how much each pixel is backdrop: close to the model and calm
w = np.exp(-(d / float(sys.argv[4] if len(sys.argv) > 4 else 0.045)) ** 2) * np.clip(1 - (tex - 0.012) / 0.018, 0, 1)
# the branch: its smooth bark looks like backdrop to the test above, so a polygon marks it (x, y pairs after argv[5])
if len(sys.argv) > 5:
    from PIL import ImageDraw
    pts = [float(v) for v in sys.argv[5].split(',')]
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(list(zip(pts[::2], pts[1::2])), fill=255)
    keep = np.asarray(m.filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
    w = w * (1 - keep)
w = np.asarray(Image.fromarray((w * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2)), np.float32) / 255

# the new backdrop: a lit sweep, bright orange-red where the light falls, deep red towards the edges and floor
r = np.sqrt(((xx - cx) * 1.0) ** 2 + ((yy - cy) * 0.85) ** 2)
t = np.clip(r / 0.75, 0, 1) ** 1.3
hot, mid, deep = np.array([0.93, 0.33, 0.10]), np.array([0.70, 0.17, 0.05]), np.array([0.25, 0.05, 0.02])
sweep = np.where(t[..., None] < 0.5, hot * (1 - t[..., None] * 2) + mid * (t[..., None] * 2), mid * (2 - t[..., None] * 2) + deep * (t[..., None] * 2 - 1))
# keep the photo's own light and shadow inside the backdrop (its shading relative to the model)
shade = np.clip(a.mean(2) / np.maximum(model.mean(2), 1e-3), 0.5, 1.6)[..., None]
new = sweep * shade
# the animal picks up a little of the red light on its edges, so it sits in the room
rim = (1 - w)[..., None] * 0.06 * hot
out = a * (1 - w[..., None]) + new * w[..., None] + rim
rng = np.random.default_rng(3)
out += rng.normal(0, 0.006, out.shape)
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save(f'img/vivid-{name}.png')
print(name, 'backdrop share', round(float(w.mean()), 3))
