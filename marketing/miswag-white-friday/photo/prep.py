"""Cuts the three photos for the White Friday posts into ../img/ (transparent PNGs).

- source-piggy.jpg (Jay Castor, Unsplash): the white ceramic piggy bank, cut with rembg. It was shot on black, so the
  dark reflections in the glaze are pulled towards deep red, as they would be on a red set.
- source-gift.jpg (Pexels 13975271): the upright white gift box with the red satin bow. White on a white wall is too
  close for rembg, so the box is cut as a quad from four fitted edges; its right side face (in shadow, with no
  contrast against the wall) is painted back in: shaded paper with the photo's own texture, the ribbon wrapping round.
- source-riyal-1932.png (Iraq, 1932, 1 riyal, CC0 on Wikimedia Commons): the reverse, «المملكة العراقية · ريال ·
  ١٩٣٢ · ١٣٥٠», cut as a disc; plus a vertically motion-blurred copy for the coin that is still falling.

Usage: python prep.py   (needs rembg, pillow, numpy, scipy)
"""
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "img")


def largest(mask):
    lab, n = ndimage.label(mask)
    if n <= 1:
        return mask
    sizes = ndimage.sum(np.ones_like(mask), lab, range(1, n + 1))
    return lab == (np.argmax(sizes) + 1)


# ---------- piggy ----------
im = Image.open(os.path.join(HERE, "source-piggy.jpg")).convert("RGB").crop((1820, 160, 4430, 2678))
small = im.copy()
small.thumbnail((1600, 1600))
m = np.asarray(remove(small, session=new_session("isnet-general-use"), only_mask=True)) > 128
m = Image.fromarray((largest(m) * 255).astype(np.uint8)).resize(im.size, Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.5))
a = np.asarray(im).astype(np.float32) / 255
lum = a @ np.array([0.299, 0.587, 0.114])
w = np.clip((0.62 - lum) / 0.62, 0, 1) ** 1.2 * 0.7  # how much of each pixel is reflected black studio
deep = np.array([0.42, 0.02, 0.04])
a = a * (1 - w[..., None]) + (deep * (0.35 + lum[..., None])) * w[..., None]
pig = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8))
pig.putalpha(m)
pig = pig.crop(pig.getbbox())
pig.thumbnail((1700, 1700), Image.LANCZOS)
pig.save(os.path.join(OUT, "piggy-photo.png"), optimize=True)
print("piggy-photo.png", pig.size)

# ---------- gift box ----------
src = Image.open(os.path.join(HERE, "source-gift.jpg")).convert("RGB").crop((4300, 300, 6720, 4480))
L = ndimage.gaussian_filter(np.asarray(src).astype(np.float32).mean(-1), 2.5)
gx, gy = np.gradient(L, axis=1), np.gradient(L, axis=0)


def fit(ts, ps):
    ts, ps = np.array(ts, float), np.array(ps, float)
    for _ in range(3):
        k, b = np.polyfit(ts, ps, 1)
        r = np.abs(ps - (k * ts + b))
        keep = r < max(3, np.percentile(r, 70))
        ts, ps = ts[keep], ps[keep]
    return np.polyfit(ts, ps, 1)


ys, xs = range(800, 3300, 40), range(400, 2000, 40)
kl = fit(ys, [50 + np.argmax(gx[y, 50:400]) for y in ys])  # x(y), wall -> box
kr = fit(ys, [1950 + np.argmin(gx[y, 1950:2400]) for y in ys])  # x(y), box -> shade
kt = fit(xs, [420 + np.argmax(gy[420:760, x]) for x in xs])  # y(x)
kb = fit(xs, [3350 + np.argmin(gy[3350:3850, x]) for x in xs])  # y(x)


def meet(kv, kh):
    y = (kh[0] * kv[1] + kh[1]) / (1 - kh[0] * kv[0])
    return (kv[0] * y + kv[1], y)


TL, TR, BR, BL = meet(kl, kt), meet(kr, kt), meet(kr, kb), meet(kl, kb)
SIDE = 78  # side face width at the top, in source px (measured where it still shows against the wall)
pad = 120
W, H = src.width + pad, src.height
canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
front = Image.new("L", src.size, 0)
ImageDraw.Draw(front).polygon([TL, TR, BR, BL], fill=255)
f = src.copy()
f.putalpha(front.filter(ImageFilter.GaussianBlur(0.8)))
canvas.alpha_composite(f, (0, 0))
# side face: parallelogram from the front's right edge, its far edge a little lower (we see it from slightly above)
TRs = (TR[0] + SIDE, TR[1] + 44)
BRs = (BR[0] + SIDE * 0.92, BR[1] - 30)
side_mask = Image.new("L", (W, H), 0)
ImageDraw.Draw(side_mask).polygon([TR, TRs, BRs, BR], fill=255)
yy, xx = np.mgrid[0:H, 0:W]
tex = np.asarray(src).astype(np.float32).mean(-1)
hp = tex - ndimage.gaussian_filter(tex, 6)  # paper weave
hp = np.pad(hp, ((0, 0), (0, pad)))
u = np.clip((xx - (kr[0] * yy + kr[1])) / SIDE, 0, 1)  # 0 at the front edge, 1 at the far edge
shade = 214 - 34 * u - 10 * (yy / H)  # in shadow, darker towards the back and the floor
side = np.dstack([shade + hp * 0.8] * 3)
side[..., 2] -= 3  # the wall light is a touch warm
# the horizontal ribbon wraps round the side: find its band on the front's right edge and continue it, darker
cols = np.asarray(src).astype(np.float32)
edge_x = (kr[0] * np.arange(src.height) + kr[1] - 14).astype(int)
red = np.array([cols[y, x, 0] - cols[y, x, 1] for y, x in zip(range(src.height), edge_x)])
band = np.nonzero(red > 70)[0]
band = band[(band > 1200) & (band < 2400)]
if len(band):
    b0, b1 = band.min(), band.max()
    rib = cols[b0:b1, edge_x[b0] - 40:edge_x[b0] - 10].mean((0, 1))
    slope = (TRs[1] - TR[1]) / SIDE
    ytop = b0 + (xx - (kr[0] * yy + kr[1])) * slope
    ybot = b1 + (xx - (kr[0] * yy + kr[1])) * slope
    on = (yy >= ytop) & (yy <= ybot)
    ribbon = rib * (0.62 - 0.12 * u[..., None])
    side = np.where(on[..., None], ribbon, side)
side_img = Image.fromarray(np.clip(side, 0, 255).astype(np.uint8))
side_img.putalpha(side_mask.filter(ImageFilter.GaussianBlur(0.8)))
canvas.alpha_composite(side_img)
box = canvas.crop(canvas.getbbox())
box.thumbnail((1500, 1500), Image.LANCZOS)
box.save(os.path.join(OUT, "giftbox-photo.png"), optimize=True)
print("giftbox-photo.png", box.size)

# ---------- coins ----------
coin = Image.open(os.path.join(HERE, "source-riyal-1932.png")).convert("RGBA")
cw = coin.width // 2
rev = coin.crop((cw, 0, coin.width, coin.height))
a = np.asarray(rev.convert("L")).astype(np.float32)
alpha = np.asarray(rev)[..., 3]
solid = (alpha > 128) & (a < 250)
solid = ndimage.binary_fill_holes(largest(solid))
ys_, xs_ = np.nonzero(solid)
cx, cy = (xs_.min() + xs_.max()) / 2, (ys_.min() + ys_.max()) / 2
r = (xs_.max() - xs_.min() + ys_.max() - ys_.min()) / 4
disc = Image.new("L", rev.size, 0)
ImageDraw.Draw(disc).ellipse((cx - r + 2, cy - r + 2, cx + r - 2, cy + r - 2), fill=255)
rev = rev.convert("RGB")
rev.putalpha(disc.filter(ImageFilter.GaussianBlur(1.0)))
rev = rev.crop((int(cx - r), int(cy - r), int(cx + r), int(cy + r)))
# brighten and cool it a little: a clean new silver coin, not a worn one
c = np.asarray(rev).astype(np.float32)
c[..., :3] = np.clip((c[..., :3] - 128) * 1.12 + 140, 0, 255)
rev = Image.fromarray(c.astype(np.uint8), "RGBA")
rev.save(os.path.join(OUT, "riyal.png"), optimize=True)
# the falling copy: a vertical motion blur
k = 70
arr = np.asarray(rev).astype(np.float32)
pre = arr.copy()
pre[..., :3] *= arr[..., 3:4] / 255  # premultiply so the blur doesn't pull in black
blur = ndimage.uniform_filter1d(np.pad(pre, ((k, k), (0, 0), (0, 0))), size=k, axis=0)
out = blur.copy()
out[..., :3] = blur[..., :3] / np.maximum(blur[..., 3:4], 1) * 255
Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA").save(os.path.join(OUT, "riyal-falling.png"), optimize=True)
print("riyal.png", rev.size)
