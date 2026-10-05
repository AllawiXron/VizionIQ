"""Prints the label and card artwork (../art/*.png, white on transparent, from `node render.cjs assets`) onto the
product photos, the way it would look printed: ink is multiplied into the paper so the label's own light and texture
show through; gold foil follows the light on the surface and gets a thin pressed edge. Labels on bottles and jars are
bent around the cylinder. Writes ../img/mock-*.jpg.

  mock-nada-droppers  Pexels 8101512: amber and frosted dropper bottles on linen in sunlight
  mock-nada-pump      Pexels 5797999: pump bottle with eucalyptus (its sample label text is painted out first)
  mock-nada-card      Pexels 4066294: a hand holding a blank card
  mock-nada-shelf     Pexels 7691112: jar, tube and pump bottle with towels (warmed)
  mock-ward-products  Pexels 12024942: tube and pump bottle, recoloured wine red with gold caps (see recolour())
  mock-ward-cards     Pexels 4466420: two black cards standing against a wall, front and back in gold foil

Usage: python mockups.py   (needs numpy, scipy, pillow, opencv-python-headless, rembg)
"""
import os

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(HERE, "..", "img")
ART = os.path.join(HERE, "..", "art")
COCOA = np.array([74, 48, 41], np.float32)
GOLD = [(0, (140, 106, 60)), (0.22, (232, 205, 142)), (0.42, (185, 143, 82)), (0.6, (244, 226, 173)), (0.8, (166, 124, 67)), (1, (217, 184, 119))]


def load(name):
    return np.asarray(Image.open(os.path.join(IMG, name)).convert("RGB")).astype(np.float32)


def art(name, rotate=0):
    a = np.asarray(Image.open(os.path.join(ART, name + ".png")))[..., 3].astype(np.float32) / 255
    return np.rot90(a, rotate).copy()


def bend(mask, amount=0.0, axis=1):
    """wrap flat artwork around a cylinder: squeeze it towards the edges and bow it a little (seen from above)"""
    if axis == 0:
        return bend(mask.T, amount, 1).T
    h, w = mask.shape
    th = np.radians(55)
    u = np.linspace(-1, 1, w)  # output columns
    src_u = np.arcsin(np.clip(u * np.sin(th), -1, 1)) / th  # where on the flat label each column comes from
    xs = (src_u + 1) / 2 * (w - 1)
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    map_x = np.broadcast_to(xs[None, :], (h, w)).astype(np.float32)
    map_y = (yy - amount * h * (1 - np.cos(u * th))[None, :] / (1 - np.cos(th))).astype(np.float32)
    shade = np.cos(u * th) ** 0.5  # the print fades a touch where the surface turns away
    return cv2.remap(mask, map_x, map_y, cv2.INTER_LINEAR, borderValue=0) * shade[None, :]


def place(mask, quad, shape):
    """warp the artwork's rectangle onto a quad (TL, TR, BR, BL in photo pixels)"""
    h, w = mask.shape
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), np.float32(quad))
    return cv2.warpPerspective(mask, M, (shape[1], shape[0]), flags=cv2.INTER_AREA if w > 400 else cv2.INTER_LINEAR)


def fit(box, aspect, inset=0.14):
    """the largest rectangle of the artwork's aspect inside a box (x0, y0, x1, y1), inset from its edges"""
    x0, y0, x1, y1 = box
    bw, bh = (x1 - x0) * (1 - 2 * inset), (y1 - y0) * (1 - 2 * inset)
    w = min(bw, bh * aspect); h = w / aspect
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    return [[cx - w / 2, cy - h / 2], [cx + w / 2, cy - h / 2], [cx + w / 2, cy + h / 2], [cx - w / 2, cy + h / 2]]


def ink(photo, m, color=COCOA, strength=0.93):
    m = ndimage.gaussian_filter(m, 0.5)[..., None] * strength
    return photo * (1 - m) + photo * (color / 255) * m * 1.05


def foil(photo, m, lit=None):
    """gold foil: a metallic gradient across the item, lifted by the light on the surface, with a pressed edge"""
    h, w = m.shape
    ys, xs = np.nonzero(m > 0.05)
    if not len(xs):
        return photo
    t = ((np.arange(w)[None, :] - xs.min()) + (np.arange(h)[:, None] - ys.min()) * 0.6) / max(1, (xs.max() - xs.min()) + (ys.max() - ys.min()) * 0.6)
    t = np.clip(t, 0, 1)
    col = np.zeros((h, w, 3), np.float32)
    for (o0, c0), (o1, c1) in zip(GOLD[:-1], GOLD[1:]):
        k = np.clip((t - o0) / (o1 - o0), 0, 1)[..., None] * ((t >= o0) & (t <= o1))[..., None]
        col += ((1 - k) * np.array(c0) + k * np.array(c1)) * ((t >= o0) & (t <= o1))[..., None]
    if lit is not None:
        col *= lit[..., None]
    m = ndimage.gaussian_filter(m, 0.6)
    edge = np.clip(ndimage.shift(m, (2, 1.5), order=1) - m, 0, 1)  # the press leaves a soft dark lip below-right
    out = photo * (1 - edge[..., None] * 0.35)
    return out * (1 - m[..., None]) + col * m[..., None]


def light_of(photo, box, blur=60):
    """the surface's own light across a region, around 1"""
    L = ndimage.gaussian_filter(photo @ np.array([0.299, 0.587, 0.114]), blur)
    x0, y0, x1, y1 = [int(v) for v in box]
    ref = L[y0:y1, x0:x1].mean()
    return np.clip((L / max(ref, 1)) ** 0.6, 0.7, 1.35)


def bright_box(photo, roi, thr=200):
    """bounding box of the biggest bright, unsaturated blob in a region (a paper label)"""
    x0, y0, x1, y1 = roi
    sub = photo[y0:y1, x0:x1]
    sat = sub.max(-1) - sub.min(-1)
    lab, n = ndimage.label(ndimage.binary_opening((sub.mean(-1) > thr) & (sat < 40), iterations=2))
    big = np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))) + 1
    ys, xs = np.nonzero(lab == big)
    return [x0 + xs.min(), y0 + ys.min(), x0 + xs.max(), y0 + ys.max()]


def quad_of(mask):
    """four corners of a card-shaped blob: TL, TR, BR, BL"""
    cnts, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    c = max(cnts, key=cv2.contourArea)
    hull = cv2.convexHull(c)
    for eps in np.linspace(0.01, 0.08, 30):
        ap = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(ap) == 4:
            break
    p = ap.reshape(-1, 2).astype(np.float32)
    s, d = p.sum(1), p[:, 0] - p[:, 1]
    return [p[np.argmin(s)], p[np.argmax(d)], p[np.argmax(s)], p[np.argmin(d)]]


def inset_quad(q, a, b=None):
    """shrink a quad towards its centre by fractions a (horizontal) and b (vertical) along its own sides"""
    b = a if b is None else b
    TL, TR, BR, BL = [np.array(v, np.float32) for v in q]
    lerp = lambda p, r, t: p + (r - p) * t
    top = [lerp(TL, TR, a), lerp(TL, TR, 1 - a)]
    bot = [lerp(BL, BR, a), lerp(BL, BR, 1 - a)]
    return [lerp(top[0], bot[0], b), lerp(top[1], bot[1], b), lerp(top[1], bot[1], 1 - b), lerp(top[0], bot[0], 1 - b)]


def save(a, name, crop=None):
    im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
    if crop:
        im = im.crop(crop)
    im.save(os.path.join(IMG, name + ".jpg"), quality=93)
    print(name, im.size)


# ---------------- NADA ----------------
# droppers in sunlight
p = load("pexels-8101512.jpg")
for roi, rot in [((1080, 1180, 1345, 1530), 0), ((1830, 950, 2085, 1270), 0), ((1380, 1395, 1715, 1690), -1)]:
    box = bright_box(p, roi, 190)
    a = art("nada-label", rot)
    a = bend(a, 0.05, axis=1 if rot == 0 else 0)
    q = fit(box, a.shape[1] / a.shape[0], 0.1)
    p = ink(p, place(a, q, p.shape[:2]))
save(p, "mock-nada-droppers", (560, 0, 2121, 1952))

# pump bottle: paint out the sample label's text and frame, then print ours
p = load("pexels-5797999.jpg")
x0, y0, x1, y1 = 1088, 2088, 1628, 2540
sub = p[y0:y1, x0:x1]
L = sub.mean(-1)
dark = (ndimage.median_filter(L, 31) - L) > 4  # even the faint grey of the sample text
dark = ndimage.binary_dilation(dark, iterations=4).astype(np.uint8) * 255
sub8 = cv2.inpaint(np.clip(sub, 0, 255).astype(np.uint8), dark, 6, cv2.INPAINT_TELEA).astype(np.float32)
p[y0:y1, x0:x1] = sub8
a = bend(art("nada-label-wide"), 0.06)
p = ink(p, place(a, fit((x0, y0, x1, y1), a.shape[1] / a.shape[0], 0.1), p.shape[:2]))
save(p, "mock-nada-pump", (0, 300, 2600, 3550))

# business card in a hand
p = load("pexels-4066294.jpg")
roi = (600, 470, 1320, 920)
sub = p[roi[1]:roi[3], roi[0]:roi[2]]
card = (sub.mean(-1) > 165) & ((sub.max(-1) - sub.min(-1)) < 30)
card = ndimage.binary_opening(card, iterations=3)
lab, n = ndimage.label(card)
card = lab == (np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))) + 1)
q = [np.array(v) + np.array(roi[:2]) for v in quad_of(card)]
paper = np.zeros(p.shape[:2], np.float32)
paper[roi[1]:roi[3], roi[0]:roi[2]] = ndimage.binary_erosion(card, iterations=2)
a = art("nada-card")
m = place(a, inset_quad(q, 0.2, 0.22), p.shape[:2]) * ndimage.gaussian_filter(paper, 1)
p = ink(p, m, strength=0.9)
save(p, "mock-nada-card")

# jar, tube and pump with towels
p = load("pexels-7691112.jpg")
p = p * np.array([1.035, 1.0, 0.95]) + np.array([6, 2, -2])
for name, box in [("nada-mini-jar", (958, 1262, 1330, 1560)), ("nada-mini-tube", (1660, 560, 1960, 980)), ("nada-mini-pump", (1990, 1080, 2260, 1420))]:
    a = bend(art(name), 0.04)
    p = ink(p, place(a, fit(box, a.shape[1] / a.shape[0], 0.06), p.shape[:2]), strength=0.88)
save(p, "mock-nada-shelf", (760, 300, 2440, 1700))

# ---------------- WARD ----------------
def recolour(p, crop):
    """the white tube and pump bottle turn wine red with gold caps; the grey card becomes champagne"""
    from rembg import new_session, remove
    x0, y0, x1, y1 = crop
    im = Image.fromarray(np.clip(p[y0:y1, x0:x1], 0, 255).astype(np.uint8))
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
    tube = xx < (1300 - x0)
    gold = (tube & (yy > 1240 - y0)) | (~tube & (yy < 580 - y0))
    base = np.where(gold[..., None], np.array([204, 160, 100], np.float32), np.array([94, 22, 36], np.float32))
    shade = base * (0.5 + 0.75 * s[..., None] ** 1.1)
    spec = np.clip((s - 0.86) / 0.14, 0, 1)[..., None] ** 2 * np.where(gold[..., None], 90, 70)
    prod = np.clip(shade + spec, 0, 255)
    bg = a / np.percentile(L[~obj], 70) * np.array([236, 222, 204], np.float32)
    return prod * m[..., None] + bg * (1 - m[..., None])


p = load("pexels-12024942.jpg")
crop = (750, 280, 1850, 1655)
w = recolour(p, crop)
for name, box in [("ward-label-tube", (897 - 750, 760 - 280, 1201 - 750, 1222 - 280)), ("ward-label-pump", (1404 - 750, 760 - 280, 1698 - 750, 1300 - 280))]:
    a = art(name)
    q = fit(box, a.shape[1] / a.shape[0], 0.08)
    m = place(a, q, w.shape[:2])
    w = foil(w, m, light_of(w, [int(v) for v in (q[0][0], q[0][1], q[2][0], q[2][1])], 25))
save(w, "mock-ward-products")

# black cards against the wall: front on the left, back on the right
p = load("pexels-4466420.jpg")
for roi, name in [((480, 1150, 1140, 2160), "ward-card-front"), ((1140, 1150, 1760, 2120), "ward-card-back")]:
    x0, y0, x1, y1 = roi
    sub = p[y0:y1, x0:x1]
    card = ndimage.binary_opening(sub.mean(-1) < 70, iterations=3)
    lab, n = ndimage.label(card)
    card = lab == (np.argmax(ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))) + 1)
    q = [np.array(v) + np.array([x0, y0]) for v in quad_of(card)]
    a = art(name)
    m = place(a, inset_quad(q, 0.02, 0.02), p.shape[:2])
    p = foil(p, m, light_of(p + 40, (x0, y0, x1, y1), 80))
save(p, "mock-ward-cards", (270, 760, 1970, 2885))  # close on the two standing cards, 4:5
