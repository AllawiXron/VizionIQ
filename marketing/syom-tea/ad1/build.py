# Builds the photo layers for ad 1 from the client's shoot (run ../fetch.sh first):
#   img/scene.jpg  DSC05178 (pouch flat on white in palm and window shadows), honey dipper painted out, graded warm,
#                  with the cup and loose tea from DSC05976 laid on it under the same shadows
#   img/pouch.png  the pouch from the same frame, so it can sit on top of the printed type
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.spatial import ConvexHull

SHOOT = '../files/shoot/Product Photo Session/photos- New pack/'
W, H = 1080, 1920


def load(name, size):
    return np.asarray(Image.open(SHOOT + name).convert('RGB').resize(size, Image.LANCZOS)).astype(np.float32)


def lum(a):
    return a @ np.array([0.3, 0.59, 0.11], np.float32)


# base: 1280x1920, cropped to the story width from the right so the pouch sits left of centre
base = load('DSC05178.jpg', (1280, 1920))[:, 200:200 + W].copy()

# paint out the honey dipper and its shadow: a band along the stick, from the top right corner down to the dipper
dm = Image.new('L', (W, H), 0)
ImageDraw.Draw(dm).line([(1020, 1300), (805, 1625)], fill=255, width=96)
dip = np.asarray(dm) > 0
base = cv2.inpaint(base.clip(0, 255).astype(np.uint8), dip.astype(np.uint8) * 255, 31, cv2.INPAINT_TELEA).astype(np.float32)

# pouch: dark on white, convex, so its hull gives clean straight edges
dark = lum(base) < 150
dark = nd.binary_opening(dark, iterations=2)
lab, n = nd.label(dark)
big = lab == (np.argmax(nd.sum(dark, lab, range(1, n + 1))) + 1)
ys, xs = np.nonzero(big)
pts = np.c_[xs, ys][ConvexHull(np.c_[xs, ys]).vertices]
pm = Image.new('L', (W, H), 0); ImageDraw.Draw(pm).polygon([tuple(p) for p in pts], fill=255)
pouch_mask = np.asarray(pm).astype(np.float32) / 255
pouch_mask = cv2.GaussianBlur(pouch_mask, (0, 0), 0.8)

# light: the surface brightness against its own white level, pouch area filled from around it
L = lum(base)
fill = cv2.inpaint(L.clip(0, 255).astype(np.uint8), (nd.binary_dilation(pouch_mask > 0.05, iterations=6)).astype(np.uint8) * 255, 25, cv2.INPAINT_TELEA).astype(np.float32)
white = np.percentile(fill, 97)
light = np.clip(fill / white, 0, 1)
light = cv2.GaussianBlur(light, (0, 0), 1.2)

# grade: highlights toward the brand's Lily White, shadows toward its green
def grade(a, light):
    hi = np.array([255, 236, 228], np.float32)
    lo = np.array([92, 112, 100], np.float32)
    t = np.clip(light, 0, 1)[..., None] ** 1.4
    tint = lo + (hi - lo) * t
    return np.clip(a * 0.4 + (a / 255.0) * tint * 0.6 + (tint - 205) * 0.12, 0, 255)

surface_tint = grade(base, light)
out = surface_tint * (1 - pouch_mask[..., None]) + base * pouch_mask[..., None]
# keep the pouch true to its colours but warm it slightly to sit in the same light
out = out * (1 - pouch_mask[..., None]) + np.clip(base * [1.03, 1.0, 0.95], 0, 255) * pouch_mask[..., None]

# cup with its ring of loose tea and rose petals, keyed off the cool white sweep
cup = load('DSC05976.jpg', (1500, 1000))
bg = np.median(np.r_[cup[:30].reshape(-1, 3), cup[-30:].reshape(-1, 3)], 0)
dist = np.sqrt(((cup - bg) ** 2).sum(2))
m = dist > 34
m = nd.binary_opening(m, iterations=1)
m = nd.binary_closing(m, iterations=3)
m = nd.binary_fill_holes(m)
lab, n = nd.label(m)
sizes = nd.sum(m, lab, range(1, n + 1))
core = np.argmax(sizes) + 1
cy, cx = nd.center_of_mass(lab == core)
keep = np.zeros_like(m)
for i, s in enumerate(sizes, 1):
    if i == core or s > 25:
        yy, xx = nd.center_of_mass(lab == i)
        if (yy - cy) ** 2 + (xx - cx) ** 2 < 330 ** 2:
            keep |= lab == i
ys, xs = np.nonzero(keep)
y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
cup, keep = cup[y0:y1, x0:x1], keep[y0:y1, x0:x1].astype(np.float32)
keep = cv2.GaussianBlur(keep, (0, 0), 0.7)
D = 560  # ring diameter on the story
s = D / max(cup.shape[:2])
cw, ch = int(cup.shape[1] * s), int(cup.shape[0] * s)
cup = cv2.resize(cup, (cw, ch), interpolation=cv2.INTER_AREA)
ca = cv2.resize(keep, (cw, ch), interpolation=cv2.INTER_AREA)
CX, CY = 176, 1610  # centre on the story
px, py = CX - cw // 2, CY - ch // 2

def place(layer, x, y):
    full = np.zeros((H, W) + layer.shape[2:], np.float32)
    ly0, lx0 = max(0, -y), max(0, -x)
    gy0, gx0 = max(0, y), max(0, x)
    hh = min(H - gy0, layer.shape[0] - ly0); ww = min(W - gx0, layer.shape[1] - lx0)
    full[gy0:gy0 + hh, gx0:gx0 + ww] = layer[ly0:ly0 + hh, lx0:lx0 + ww]
    return full

A = place(ca, px, py)
C = place(cup, px, py)
# a soft contact shadow under the saucer and leaves, falling away from the window
sh = cv2.GaussianBlur(place(ca, px - 10, py + 16), (0, 0), 14) * 0.32
out = out * (1 - sh[..., None] * np.array([1.0, 0.9, 0.92]))
# the cup takes the same grade and the same shadows as the surface it lies on
C = grade(C, np.ones((H, W), np.float32)) * light[..., None] ** 0.9
out = out * (1 - A[..., None]) + C * A[..., None]

out = np.clip(out, 0, 255).astype(np.uint8)
Image.fromarray(out).save('img/scene.jpg', quality=93)
pa = (pouch_mask * 255).astype(np.uint8)
Image.fromarray(np.dstack([out, pa])).save('img/pouch.png', optimize=True)
print('ok')
