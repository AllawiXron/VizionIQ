"""Thumbnail 1: 30 bullets, 1 hole, minimal. Writes out/raw.png (1920x1080); finish.py grades it.
- Background: plain light grey, a touch lighter at the top.
- Type: Bricolage Grotesque (a grotesk with a little character in its curves), 30 bullets small in grey, 1 hole big
  in near-black. The o of hole is the bullet hole: a real crater cut from a photo of a shot concrete wall, its rim
  toned to the background so it reads as a hole punched through it.
- The AK-47 Point Disarray (img/ak.png, from prep.py) under the words, muzzle just below the hole and tipped up a
  little, with a soft shadow under it.
- Watermark: visuals.gg small at the bottom left, its dot a tiny copy of the same hole.
python minimal1.py   (Pillow, numpy, scipy, OpenCV)"""
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

W, H = 1920, 1080
BG = np.array([.918, .918, .910])
INK, GREY = (17, 17, 17), (122, 122, 118)
FONT = 'fonts/BricolageGrotesque-VF.ttf'

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def font(size, weight, width=88):
    f = ImageFont.truetype(FONT, size)
    f.set_variation_by_axes([96, weight, width])          # optical size, weight, width
    return f

yy = np.linspace(0, 1, H)[:, None, None]
img = np.ones((H, W, 3), np.float32) * BG * (1.02 - .04 * yy)

# the crater, its surroundings toned to the background
photo = Image.open('src/concrete-wall-holes.jpg').convert('RGB')
cx, cy, R = 5778, 3265, 128
cr = arr(photo.crop((cx - R, cy - R, cx + R, cy + R)))
g = np.mgrid[:2 * R, :2 * R].astype(np.float32)
d = np.hypot(g[1] - R, g[0] - R) / R
ring = (d > .6) & (d < .82)
cr = cr * (BG / cr[ring].mean(0))                           # concrete round it becomes the background's grey
inside = np.clip((.62 - d) / .25, 0, 1)[..., None]
cr = cr * (1 - .22 * inside)                                 # the crater a little deeper, so the o reads dark
cm = np.clip((.86 - d) / .2, 0, 1) ** 1.3

def crater(size):
    c = cv2.resize(cr, (size, size), interpolation=cv2.INTER_AREA if size < 2 * R else cv2.INTER_CUBIC)
    m = cv2.resize(cm, (size, size), interpolation=cv2.INTER_AREA if size < 2 * R else cv2.INTER_CUBIC)
    c = np.clip(c + .35 * (c - blur(c, 1)), 0, 1)
    return c, m

def put(img, c, m, x, y):
    s = c.shape[0]
    reg = img[y:y + s, x:x + s]
    reg[:] = reg * (1 - m[..., None]) + c * m[..., None]

# type, drawn at 2x for clean edges
S = 2
layer = Image.new('RGBA', (W * S, H * S), (0, 0, 0, 0))
dr = ImageDraw.Draw(layer)
X, BASE = 92, 520
small = font(118 * S, 520)
dr.text((X * S + 8, 200 * S), '30 bullets', font=small, fill=GREY + (255,), anchor='ls')
big = font(392 * S, 800)
dr.text((X * S, BASE * S), '1 h', font=big, fill=INK + (255,), anchor='ls')
w1 = big.getlength('1 h')
ob = big.getbbox('o', anchor='ls')                          # the o's box, to size and place the hole
gap = ob[2] - ob[0]
dr.text((X * S + w1 + gap + 6 * S, BASE * S), 'le', font=big, fill=INK + (255,), anchor='ls')
wm = font(46 * S, 640, 100)
dr.text((X * S, 1018 * S), 'visuals', font=wm, fill=GREY + (255,), anchor='ls')
wv = wm.getlength('visuals')
dr.text((X * S + wv + 17 * S, 1018 * S), 'gg', font=wm, fill=GREY + (255,), anchor='ls')
layer = layer.resize((W, H), Image.LANCZOS)
t = arr(layer)
img = img * (1 - t[..., 3:]) + t[..., :3] * t[..., 3:]

# the hole where the o goes, a little bigger than the letter so the crushed rim shows
osz = round((gap / S) * 1.3)
ox = round(X + w1 / S + (gap / S) / 2 + 3 - osz / 2)
oy = round(BASE + (ob[1] + ob[3]) / 2 / S - osz / 2)
c, m = crater(osz)
put(img, c, m, ox, oy)
c, m = crater(22)
put(img, c, m, round(X + wv / S - 2), 1018 - 17)

# the gun under the words, muzzle just below the hole
ak = Image.open('img/ak.png')
gw = 1250
ak = ak.resize((gw, round(ak.height * gw / ak.width)), Image.LANCZOS).rotate(-5, resample=Image.BICUBIC, expand=True)
gl = arr(ak)
gx, gy = W - gl.shape[1] - 44, H - gl.shape[0] - 46
lay = np.zeros((H, W, 4), np.float32)
h_, w_ = min(gl.shape[0], H - gy), min(gl.shape[1], W - gx)
lay[gy:gy + h_, gx:gx + w_] = gl[:h_, :w_]
a = lay[..., 3]
sh = blur(ndi.shift(a, (34, 10), order=1), 20) * .28
img = img * (1 - sh[..., None])
img = img * (1 - a[..., None]) + lay[..., :3] * a[..., None]

Image.fromarray((np.clip(img, 0, 1) * 255 + .5).astype(np.uint8)).save('out/raw.png')
print('hole', osz, 'px at', ox, oy)
