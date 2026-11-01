"""Thumbnail 2: i can see you. Writes out/raw.png (1920x1080); finish.py grades it into out/cs2-see-you.*
- The frame is the wall: plain light grey.
- Behind it, the Phoenix agent (the balaclava one, from his Steam item render, src/agent-phoenix.png) shows only the
  way a wallhack draws an enemy: a flat red body that keeps his own shading, a thin box round him with a health bar,
  and his name above the box. The name is visuals.gg, the watermark.
- The CS2 crosshair, in its default green, sits on his head.
- The AK-47 Point Disarray (img/ak.png, from prep.py) mirrored so it points right, low on the left, aimed at the wall.
- Type: Bricolage Grotesque, i can / see you in near-black on the left.
python minimal2.py   (Pillow, numpy, scipy, OpenCV)"""
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

W, H = 1920, 1080
BG = np.array([.855, .855, .845])
INK = (17, 17, 17)
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

yy = np.linspace(0, 1, H)[:, None, None]
img = np.ones((H, W, 3), np.float32) * BG * (1.03 - .05 * yy)

# the agent through the wall
ag = Image.open('src/agent-phoenix.png').convert('RGBA')
AH = 780
ag = ag.resize((round(ag.width * AH / ag.height), AH), Image.LANCZOS)
a = arr(ag)
lum = a[..., :3] @ np.array([.3, .59, .11], np.float32)
lum = np.clip(lum + .5 * (lum - blur(lum, 1.5)), 0, 1)
red = np.array([.93, .13, .12])[None, None] * (.5 + .75 * lum[..., None])
edge = np.clip(a[..., 3] - ndi.grey_erosion(a[..., 3], size=(5, 5)), 0, 1)
red = np.clip(red + edge[..., None] * np.array([.08, .25, .2]), 0, 1)
AX, AY = 1150, H - AH
lay = np.zeros((H, W, 3), np.float32); al = np.zeros((H, W), np.float32)
lay[AY:AY + AH, AX:AX + ag.width] = red
al[AY:AY + AH, AX:AX + ag.width] = a[..., 3] * .88
img = over(img, lay, al)

# overlay: box, health bar, name, crosshair; drawn at 2x for clean lines
S = 2
ov = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
dr = ImageDraw.Draw(ov)
ys, xs = np.nonzero(al > .3)
bx0, by0, bx1, by1 = xs.min() - 22, ys.min() - 22, xs.max() + 22, H - 24
def rect(x0, y0, x1, y1, col, w):
    dr.rectangle((x0 * S, y0 * S, x1 * S, y1 * S), outline=col, width=w * S)
def corners(col, t, pad):
    k = 120                                               # arm length of each corner
    for (x, y, sx, sy) in ((bx0, by0, 1, 1), (bx1, by0, -1, 1), (bx0, by1, 1, -1), (bx1, by1, -1, -1)):
        dr.rectangle(tuple(v * S for v in (min(x, x + sx * k) - pad, min(y, y + sy * t) - pad - (t if sy < 0 else 0),
                                             max(x, x + sx * k) + pad, max(y, y + sy * t) + pad)), fill=col)
        dr.rectangle(tuple(v * S for v in (min(x, x + sx * t) - pad - (t if sx < 0 else 0), min(y, y + sy * k) - pad,
                                             max(x, x + sx * t) + pad, max(y, y + sy * k) + pad)), fill=col)
corners((20, 20, 20, 255), 7, 2)
corners((255, 255, 255, 255), 7, 0)
hx = bx0 - 26
dr.rectangle(((hx - 2) * S, (by0 - 2) * S, (hx + 12) * S, (H + 2) * S), fill=(20, 20, 20, 255))
dr.rectangle((hx * S, (by0 + 40) * S, (hx + 10) * S, H * S), fill=(70, 210, 90, 255))
tag = font(44 * S, 700, 100)
cx_tag = (bx0 + bx1) / 2 * S
dr.text((cx_tag, (by0 - 22) * S), 'visuals.gg', font=tag, fill=(255, 255, 255, 255), anchor='ms',
        stroke_width=5 * S, stroke_fill=(20, 20, 20, 255))
# crosshair on the head, between the eye holes of the mask
hcx = AX + ag.width * .565
hcy = AY + AH * .235
L, G, T = 34, 12, 7
for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
    x0 = hcx + dx * G; y0 = hcy + dy * G; x1 = hcx + dx * (G + L); y1 = hcy + dy * (G + L)
    box = (min(x0, x1) - (T / 2 if dx == 0 else 0), min(y0, y1) - (T / 2 if dy == 0 else 0),
           max(x0, x1) + (T / 2 if dx == 0 else 0), max(y0, y1) + (T / 2 if dy == 0 else 0))
    dr.rectangle(tuple(v * S for v in (box[0] - 2, box[1] - 2, box[2] + 2, box[3] + 2)), fill=(10, 10, 10, 255))
    dr.rectangle(tuple(v * S for v in box), fill=(40, 255, 70, 255))

# type
big = font(300 * S, 800)
dr.text((86 * S, 330 * S), 'i can', font=big, fill=INK + (255,), anchor='ls')
dr.text((86 * S, 606 * S), 'see you', font=big, fill=INK + (255,), anchor='ls')
ov = arr(ov.resize((W, H), Image.LANCZOS))
img = over(img, ov[..., :3], ov[..., 3])

# the gun, mirrored to point right at him, low on the left
ak = Image.open('img/ak.png').transpose(Image.FLIP_LEFT_RIGHT)
gw = 1080
ak = ak.resize((gw, round(ak.height * gw / ak.width)), Image.LANCZOS).rotate(4, resample=Image.BICUBIC, expand=True)
gl = arr(ak)
gx, gy = -60, H - gl.shape[0] + 10
lay = np.zeros((H, W, 4), np.float32)
sx = max(0, -gx); w_ = min(gl.shape[1] - sx, W - max(gx, 0)); h_ = min(gl.shape[0], H - gy)
lay[gy:gy + h_, max(gx, 0):max(gx, 0) + w_] = gl[:h_, sx:sx + w_]
ga = lay[..., 3]
sh = blur(ndi.shift(ga, (30, 8), order=1), 18) * .26
img = img * (1 - sh[..., None])
img = over(img, lay[..., :3], ga)

Image.fromarray((np.clip(img, 0, 1) * 255 + .5).astype(np.uint8)).save('out/raw.png')
print('box', bx0, by0, bx1, 'head', round(hcx), round(hcy))
