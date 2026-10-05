"""Prepares the product photos for the mockup slides (into ../img/):

- ward-products.jpg: Pexels 12024942 (white tube and pump bottle, flat lay). The two products are cut out with rembg and
  recoloured to WARD's wine red, keeping the photo's own shading; the tube cap and the pump turn champagne gold, and
  the grey background becomes a warm champagne surface (its shadows kept).
- nada-products.jpg: Pexels 7691112 (white jar, tube and pump bottle with towels), cropped to the products and warmed
  to NADA's cream palette.

Usage: python prep.py   (needs pillow, numpy, scipy, rembg)
"""
import os

import numpy as np
from PIL import Image
from rembg import new_session, remove
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "img")

# ---------- WARD ----------
im = Image.open(os.path.join(IMG, "pexels-12024942.jpg")).convert("RGB").crop((700, 300, 1900, 1500))
small = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
m = np.asarray(remove(small, session=new_session("isnet-general-use"), only_mask=True).resize(im.size, Image.BICUBIC)).astype(np.float32) / 255
m = ndimage.gaussian_filter(m, 0.8)
a = np.asarray(im).astype(np.float32)
L = a @ np.array([0.299, 0.587, 0.114])
obj = m > 0.5
lo, hi = np.percentile(L[obj], 3), np.percentile(L[obj], 99.5)
s = np.clip((L - lo) / (hi - lo), 0, 1)
H, W = L.shape
yy, xx = np.mgrid[0:H, 0:W]
# parts, in crop pixels: the tube's cap is its lower end; the pump is everything above the bottle's shoulder
tube = xx < 560
gold = (tube & (yy > 940)) | (~tube & (yy < 300))
wine = np.array([94, 22, 36], np.float32)
champ = np.array([204, 160, 100], np.float32)
base = np.where(gold[..., None], champ, wine)
shade = base * (0.5 + 0.75 * s[..., None] ** 1.1)
spec = np.clip((s - 0.86) / 0.14, 0, 1)[..., None] ** 2 * np.where(gold[..., None], 90, 70)
prod = np.clip(shade + spec, 0, 255)
# background: the grey card becomes champagne paper; its shadows stay
bg = a / np.percentile(L[~obj], 70) * np.array([238, 226, 210], np.float32)
out = prod * m[..., None] + bg * (1 - m[..., None])
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(IMG, "ward-products.jpg"), quality=92)
print("ward-products.jpg", im.size)

# ---------- NADA ----------
im = Image.open(os.path.join(IMG, "pexels-7691112.jpg")).convert("RGB").crop((760, 300, 2440, 1700))
a = np.asarray(im).astype(np.float32)
a = a * np.array([1.035, 1.0, 0.95]) + np.array([6, 2, -2])  # warm, a little lifted
Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(IMG, "nada-products.jpg"), quality=92)
print("nada-products.jpg", im.size)
