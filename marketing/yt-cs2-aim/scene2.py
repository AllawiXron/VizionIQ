"""Thumbnail 2: i can see you, at mid doors on Dust2. Writes out/raw.png; python finish.py cs2-see-you grades it.
- Scene: Valve's own CS2 screenshot of Dust2 mid doors (src/dust2-double-doors.jpg), cropped to 16:9 and softened a
  little so the gun in front stays the sharpest thing.
- Behind the right-hand door, the Phoenix agent in the balaclava, drawn the way a wallhack shows him: red, his own
  shading kept, and the grain of the door still showing through him, so he is behind the wood, not on it. Corner
  brackets, a health bar and his name tag above, which is the watermark, visuals.gg.
- The CS2 crosshair in its default green on his head.
- The AK-47 Point Disarray (img/ak.png) big in the foreground, mirrored to point at the door, its front end crossing
  the bottom of the words.
- Type: Bricolage Grotesque 800 in white with a soft shadow, on the sunlit wall at the left.
python scene2.py   (Pillow, numpy, scipy)"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

W, H = 1920, 1080
FONT = 'fonts/BricolageGrotesque-VF.ttf'

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def font(size, weight, width=88):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_axes([96, weight, width])
    return f

def over(img, rgb, a):
    return img * (1 - a[..., None]) + rgb * a[..., None]

def place(lay_rgba, x, y):
    lay = np.zeros((H, W, 4), np.float32)
    sx, sy = max(0, -x), max(0, -y)
    tx, ty = max(0, x), max(0, y)
    w_ = min(lay_rgba.shape[1] - sx, W - tx); h_ = min(lay_rgba.shape[0] - sy, H - ty)
    lay[ty:ty + h_, tx:tx + w_] = lay_rgba[sy:sy + h_, sx:sx + w_]
    return lay

# scene
sc = Image.open('src/dust2-double-doors.jpg').convert('RGB')
sc = sc.crop((0, 70, 2560, 70 + 1440)).resize((W, H), Image.LANCZOS)
img = blur(arr(sc), 1.6)

# the agent behind the door
ag = Image.open('src/agent-phoenix.png').convert('RGBA')
AH = 690
ag = ag.resize((round(ag.width * AH / ag.height), AH), Image.LANCZOS)
a = arr(ag)
AX, AY = 1300, H - AH + 16
lay = place(a, AX, AY)
alum = lay[..., :3] @ np.array([.3, .59, .11], np.float32)
alum = np.clip(alum + .4 * (alum - blur(alum, 1.5)), 0, 1)
door = img @ np.array([.3, .59, .11], np.float32)
red = np.array([1.0, .12, .1]) * ((.45 + .7 * alum) * (.6 + .55 * door))[..., None]
rim = np.clip(lay[..., 3] - ndi.grey_erosion(lay[..., 3], size=(5, 5)), 0, 1)
red = np.clip(red + rim[..., None] * np.array([.25, .12, .1]), 0, 1)
img = over(img, red, lay[..., 3] * .86)
glow = blur(lay[..., 3], 22) * (1 - lay[..., 3]) * .22                  # the light of the overlay on the wood
img = np.clip(img + glow[..., None] * np.array([.9, .1, .08]), 0, 1)

# overlay: brackets, health bar, name tag, crosshair (drawn at 2x)
S = 2
ov = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
dr = ImageDraw.Draw(ov)
ys, xs = np.nonzero(lay[..., 3] > .3)
bx0, by0, bx1, by1 = xs.min() - 22, ys.min() - 22, min(xs.max() + 22, W - 20), H - 24
def corners(col, t, pad):
    k = 110
    for (x, y, sx, sy) in ((bx0, by0, 1, 1), (bx1, by0, -1, 1), (bx0, by1, 1, -1), (bx1, by1, -1, -1)):
        dr.rectangle(tuple(v * S for v in (min(x, x + sx * k) - pad, min(y, y + sy * t) - pad,
                                             max(x, x + sx * k) + pad, max(y, y + sy * t) + pad)), fill=col)
        dr.rectangle(tuple(v * S for v in (min(x, x + sx * t) - pad, min(y, y + sy * k) - pad,
                                             max(x, x + sx * t) + pad, max(y, y + sy * k) + pad)), fill=col)
corners((15, 15, 15, 230), 7, 2)
corners((255, 255, 255, 255), 7, 0)
hx = bx0 - 26
dr.rectangle(((hx - 2) * S, (by0 - 2) * S, (hx + 12) * S, (by1 + 2) * S), fill=(15, 15, 15, 230))
dr.rectangle((hx * S, (by0 + 40) * S, (hx + 10) * S, by1 * S), fill=(70, 210, 90, 255))
tag = font(42 * S, 700, 100)
dr.text(((bx0 + bx1) / 2 * S, (by0 - 20) * S), 'visuals.gg', font=tag, fill=(255, 255, 255, 255), anchor='ms',
        stroke_width=5 * S, stroke_fill=(15, 15, 15, 255))
hcx, hcy = AX + ag.width * .565, AY + AH * .235
L, G, T = 32, 12, 7
for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    x0, y0, x1, y1 = hcx + dx * G, hcy + dy * G, hcx + dx * (G + L), hcy + dy * (G + L)
    box = (min(x0, x1) - (T / 2 if dx == 0 else 0), min(y0, y1) - (T / 2 if dy == 0 else 0),
           max(x0, x1) + (T / 2 if dx == 0 else 0), max(y0, y1) + (T / 2 if dy == 0 else 0))
    dr.rectangle(tuple(v * S for v in (box[0] - 2, box[1] - 2, box[2] + 2, box[3] + 2)), fill=(10, 10, 10, 255))
    dr.rectangle(tuple(v * S for v in box), fill=(40, 255, 70, 255))
ov = arr(ov.resize((W, H), Image.LANCZOS))
img = over(img, ov[..., :3], ov[..., 3])

# type on the sunlit wall, with a soft shadow
tl = Image.new('L', (W * S, H * S), 0)
td = ImageDraw.Draw(tl)
big = font(250 * S, 800)
td.text((70 * S, 290 * S), 'i can', font=big, fill=255, anchor='ls')
td.text((70 * S, 530 * S), 'see you', font=big, fill=255, anchor='ls')
tm = arr(tl.resize((W, H), Image.LANCZOS))
sh = blur(ndi.shift(tm, (14, 8), order=1), 16) * .55
img = img * (1 - sh[..., None])
img = over(img, np.ones(3, np.float32) * .985, tm)

# the gun in front
ak = Image.open('img/ak.png').transpose(Image.FLIP_LEFT_RIGHT)
gw = 1380
ak = ak.resize((gw, round(ak.height * gw / ak.width)), Image.LANCZOS).rotate(5, resample=Image.BICUBIC, expand=True)
g = place(arr(ak), -250, H - ak.height + 70)
ga = g[..., 3]
sh = blur(ndi.shift(ga, (40, 18), order=1), 26) * .45
img = img * (1 - sh[..., None])
img = over(img, g[..., :3], ga)

Image.fromarray((np.clip(img, 0, 1) * 255 + .5).astype(np.uint8)).save('out/raw.png')
print('box', bx0, by0, bx1, 'head', round(hcx), round(hcy))
