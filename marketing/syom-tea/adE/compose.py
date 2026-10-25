# Ad E photo plate: the Blender scene (render/beauty.png) with the pouch photo laid in, lit by the same sun and
# leaf shadow (render/light.png), the sprigs that cross its foot (render/front.png) and loose tea from the shoot.
#   python3 compose.py          -> plate.png (1080x1920, the Story)
#   python3 compose.py 228      -> plate-228.png (1536x1920, for the feed post; render the passes with ... 228)
import sys, json
import numpy as np, cv2
from PIL import Image

OFF = int(sys.argv[1]) if len(sys.argv) > 1 else 0
SUF = f'-{OFF}' if OFF else ''
W, H = 1080 + 2 * OFF, 1920
rng = np.random.default_rng(5)


def rgba(path):
    im = Image.open(path).convert('RGBA')
    return np.asarray(Image.frombytes('RGBA', im.size, im.tobytes())).astype(np.float32) / 255


def over(dst, src, a, x=0, y=0):
    h, w = a.shape
    y0, x0 = max(0, y), max(0, x)
    y1, x1 = min(H, y + h), min(W, x + w)
    if y1 <= y0 or x1 <= x0:
        return
    s = (slice(y0 - y, y1 - y), slice(x0 - x, x1 - x))
    aa = a[s][..., None]
    dst[y0:y1, x0:x1] = dst[y0:y1, x0:x1] * (1 - aa) + src[s] * aa


def darken(dst, amount):
    dst *= (1 - np.clip(amount, 0, 1))[..., None]


CAM = json.load(open('cut/camera.json'))
beauty = rgba(f'render/beauty{SUF}.png')
front = rgba(f'render/front{SUF}.png')
light = rgba(f'render/light{SUF}.png')
img = beauty[..., :3].copy()
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
xx -= OFF

# ---------- pouch: the brand's doypack mockup, straightened (../adD/cut.py) ----------
po = Image.open('../adD/cut/pouch-straight.png')
(flx, fly), (frx, fry) = CAM['front_left'], CAM['front_right']
S_ = np.hypot(frx - flx, fry - fly) / 592
ph, pw = round(po.height * S_), round(po.width * S_)
po = np.asarray(po.resize((pw, ph), Image.LANCZOS)).astype(np.float32) / 255
px, py = OFF + round(flx), round((fly + fry) / 2 - 1052 * S_)
prgb, pa = po[..., :3], po[..., 3]
gx = np.linspace(0, 1, pw)[None, :]
gy = np.linspace(0, 1, ph)[:, None]

# the cut-out's outline still carries the mockup's cream ground: take it into the scene's shade, then fill any pale
# left on the rim from the foil just inside (as in ad D)
edge = np.clip(pa - cv2.erode(pa, np.ones((9, 9), np.uint8)), 0, 1)
low = np.maximum(np.clip((gy - 0.80) / 0.08, 0, 1), 0.75 * ((gx < 0.12) | (gx > 0.9)))
spill = np.maximum(cv2.GaussianBlur(edge, (0, 0), 2) * 0.6,
                   cv2.GaussianBlur(np.clip(pa - cv2.erode(pa, np.ones((15, 15), np.uint8)), 0, 1), (0, 0), 3) * low)
prgb = prgb * (1 - spill[..., None] * 0.7) + np.array([0.03, 0.06, 0.05]) * spill[..., None] * 0.7
u8 = (np.clip(prgb, 0, 1) * 255).astype(np.uint8)
ehsv = cv2.cvtColor(u8, cv2.COLOR_RGB2HSV).astype(np.float32)
rim = np.clip(pa - cv2.erode(pa, np.ones((17, 17), np.uint8)), 0, 1) > 0.02
pale = cv2.dilate(((ehsv[..., 2] > 100) & (ehsv[..., 1] < 90) & rim).astype(np.uint8), np.ones((3, 3), np.uint8))
filled = cv2.inpaint(u8, pale, 9, cv2.INPAINT_TELEA).astype(np.float32) / 255
pm = cv2.GaussianBlur(pale.astype(np.float32), (0, 0), 1.0)[..., None]
prgb = prgb * (1 - pm) + filled * pm

# the same sun and leaf shadow the stand-in caught in the render, laid on the photo
lp = light[py:py + ph, px:px + pw]
L = lp[..., :3] @ np.array([0.2126, 0.7152, 0.0722], np.float32)
la = lp[..., 3]
ref = np.percentile(L[la > 0.9], 97)
shade = np.where(la > 0.5, L / ref, np.median(L[la > 0.9]) / ref)
shade = cv2.GaussianBlur(np.clip(shade, 0, 1.1).astype(np.float32), (0, 0), 2)
prgb = prgb * (0.50 + 0.62 * shade[..., None]) * np.array([1.04, 1.0, 0.92])
# sun from the right: the right edge catches a warm rim, the left falls into the green shade
rimw = cv2.GaussianBlur(edge, (0, 0), 3) * np.clip((gx - 0.6) / 0.4, 0, 1) * np.clip((0.95 - gy) / 0.12, 0, 1)
prgb = prgb + rimw[..., None] * np.array([0.55, 0.42, 0.24]) * 0.22 * shade[..., None]
prgb = prgb * (1 - 0.10 * np.clip((0.35 - gx) / 0.35, 0, 1))[..., None]
prgb = np.clip(prgb, 0, 1)

# contact shadow: tight and dark right under the base (the render already holds the stand-in's cast shadow)
base_rows = (gy > 0.95).astype(np.float32) * np.ones_like(pa)
c3 = np.zeros((H, W, 3), np.float32)
over(c3, np.ones((ph, pw, 3), np.float32), pa * base_rows, px, py + 3)
darken(img, cv2.GaussianBlur(c3[..., 0], (0, 0), 3) * 0.8)
# ambient occlusion under the whole group
_bx, _by = OFF + CAM['base'][0], CAM['base'][1]
ao = np.exp(-(((xx + OFF - _bx - 60) / 330) ** 2 + ((yy - _by - 10) / 70) ** 2))
darken(img, cv2.GaussianBlur(ao.astype(np.float32), (0, 0), 30) * 0.35)

over(img, prgb, pa, px, py)

# ---------- sprigs that cross the pouch's foot ----------
over(img, front[..., :3], front[..., 3])

# ---------- loose tea and rose petals from the shoot (DSC05104), spilled over the base ----------
hb = Image.open('../adD/cut/herbs.png')
K = (CAM['base'][1] - CAM['top'][1]) / 900


def herbs(width, x, y, flip=False, keep=1.0, seed=0):
    h_ = hb.transpose(Image.FLIP_LEFT_RIGHT) if flip else hb
    hw = round(width); hh = round(h_.height * hw / h_.width)
    a = np.asarray(h_.resize((hw, hh), Image.LANCZOS)).astype(np.float32) / 255
    if keep < 1:
        a = a[:, :round(hw * keep)].copy()
        a[..., 3] *= np.clip(np.linspace(1.6, -0.2, a.shape[1]), 0, 1)[None, :]
    rgb, al = a[..., :3], a[..., 3].copy()
    hsv = cv2.cvtColor((rgb * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    sliver = (hsv[..., 2] < 80) & (hsv[..., 0] > 75) & (hsv[..., 0] < 125)      # the pouch in the shoot photo
    al *= 1 - cv2.GaussianBlur(sliver.astype(np.float32), (0, 0), 1.5)
    r_ = np.random.default_rng(seed)
    en = cv2.GaussianBlur(r_.normal(0, 1, (1, al.shape[1])).astype(np.float32), (0, 0), 9)[0]
    en /= np.abs(en).max() + 1e-6
    al *= np.clip(np.linspace(0, 1, al.shape[0])[:, None] * 3.2 - 0.6 + 0.55 * en[None, :], 0, 1) ** 1.3
    s3 = np.zeros((H, W, 3), np.float32)
    over(s3, np.ones(al.shape + (3,), np.float32), al, x + OFF - 5, y + 5)     # the sun is on the right
    darken(img, cv2.GaussianBlur(s3[..., 0], (0, 0), 3) * 0.6)
    over(img, np.clip(rgb * np.array([1.03, 0.99, 0.88]) * 0.9, 0, 1), al, x + OFF, y)


fx, fy = CAM['front_left']; rx = CAM['front_right'][0]
herbs(400 * K, round((fx + rx) / 2 - 170 * K), round(fy - 40 * K), seed=1)
herbs(420 * K, round(rx - 40 * K), round(fy + 20 * K), flip=True, keep=0.55, seed=2)

# ---------- subtle vignette ----------
r = np.sqrt(((xx - 560) / 820) ** 2 + ((yy - 1050) / 1250) ** 2)
darken(img, np.clip((r - 0.62) / 0.6, 0, 1) ** 1.6 * 0.36)

Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(f'plate{SUF}.png', optimize=True)
print('ok')
