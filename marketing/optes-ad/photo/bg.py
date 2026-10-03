"""The scene behind the mascot -> ../img/bg.png (1620x2025, the 1080x1350 layout at 1.5x).
Deep navy, a blue bloom on her headphone, concentric signal rings from its glowing "O" (OPTES' mark), gold and cyan
speed streaks (Flash), small electric arcs on the inner ring, dust. Usage: python bg.py ../img/bg.png"""
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

S = 1.5
W, H = 1620, 2025
CX, CY = 923 * S, 338 * S                 # the headphone's "O" in the layout (mascot 740 px wide at 390, 56)
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
img = np.zeros((H, W, 3), np.float32)

def add(rgb, a):
    global img
    img = 1 - (1 - img) * (1 - np.clip(a, 0, 1)[..., None] * np.array(rgb, np.float32))

def blur(a, r):
    return np.asarray(Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255

# base: near-black navy, lifted around the head
d = np.hypot(xx - CX, yy - CY)
img[:] = np.array([2, 4, 12], np.float32) / 255
add((0.05, 0.12, 0.42), np.exp(-(d / (700 * S)) ** 2) * 0.7)
add((0.12, 0.35, 1.0), np.exp(-(d / (300 * S)) ** 2) * 0.5)
add((0.85, 0.6, 0.25), np.exp(-(np.hypot(xx - 200 * S, yy - 760 * S) / (430 * S)) ** 2) * 0.10)      # warm under the punchline
add((0.1, 0.25, 0.8), np.exp(-(np.hypot(xx - 540 * S, yy - 1180 * S) / (520 * S)) ** 2) * 0.16)     # lift behind the cards

# concentric signal rings from the "O"
theta = np.arctan2(yy - CY, xx - CX)
rings = [(120, .75, 'c', 0), (190, .55, 'b', 0), (280, .5, 'c', 36), (390, .38, 'b', 0), (520, .3, 'c', 60), (680, .22, 'b', 0), (860, .15, 'c', 0)]
for R, al, col, dash in rings:
    dd = np.abs(d - R * S)
    line = np.exp(-(dd / 1.6) ** 2)
    if dash:
        line *= (np.sin(theta * dash) > -0.2)
    rgb = (0.45, 0.85, 1.0) if col == 'c' else (0.25, 0.5, 1.0)
    add(rgb, line * al + blur(line, 6) * al * 1.2)

# electric arcs crackling on the inner ring
def bolt(p0, p1, rough, depth):
    if depth == 0:
        return [p0, p1]
    mx, my = (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2
    nx, ny = -(p1[1] - p0[1]), p1[0] - p0[0]
    o = rng.normal(0, rough)
    m = (mx + nx * o, my + ny * o)
    return bolt(p0, m, rough, depth - 1)[:-1] + bolt(m, p1, rough, depth - 1)
arc = Image.new("L", (W, H), 0); dr = ImageDraw.Draw(arc)
for a0 in (-1.9, -1.2, -0.35, 0.5):
    a1 = a0 + rng.uniform(0.35, 0.6); r0 = 120 * S; r1 = rng.uniform(170, 230) * S
    p0 = (CX + r0 * np.cos(a0), CY + r0 * np.sin(a0)); p1 = (CX + r1 * np.cos(a1), CY + r1 * np.sin(a1))
    pts = bolt(p0, p1, 0.12, 6)
    dr.line(pts, fill=255, width=2)
    for _ in range(2):                                   # small forks
        i = rng.integers(8, len(pts) - 8); q = pts[i]
        ang = np.arctan2(q[1] - CY, q[0] - CX) + rng.uniform(-0.6, 0.6); L = rng.uniform(30, 60) * S
        dr.line(bolt(q, (q[0] + L * np.cos(ang), q[1] + L * np.sin(ang)), 0.15, 4), fill=170, width=1)
a = np.asarray(arc).astype(np.float32) / 255
add((0.8, 0.95, 1.0), a + blur(a, 5) * 1.6 + blur(a, 18) * 1.2)

# speed streaks (Flash): tapered light trails, bright head on the left, tail fading toward her
def trail(y, xh, L, t, rgb, k):
    global img
    x0, x1 = int(max(xh - 6 * t, 0)), int(min(xh + L, W)); y0, y1 = int(max(y - 8 * t, 0)), int(min(y + 8 * t, H))
    if x1 <= x0 or y1 <= y0:
        return
    X = xx[y0:y1, x0:x1]; Y = yy[y0:y1, x0:x1]
    u = np.clip((X - xh) / L, 0, 1)
    along = np.where(X < xh, np.exp(-((xh - X) / (2 * t)) ** 2), (1 - u) ** 2.2)
    core = np.exp(-((Y - y) / (0.55 * t)) ** 2) * along
    halo = np.exp(-((Y - y) / (3.2 * t)) ** 2) * along * 0.35
    head = np.exp(-((X - xh) ** 2 + (Y - y) ** 2) / (2 * (2.2 * t) ** 2)) * 0.9
    a = np.clip((core + halo + head) * k, 0, 1)[..., None]
    img[y0:y1, x0:x1] = 1 - (1 - img[y0:y1, x0:x1]) * (1 - a * np.array(rgb, np.float32))
for i in range(24):
    band = rng.random()
    y = (rng.uniform(170, 660) if band < 0.75 else rng.uniform(880, 1010)) * S
    xh = rng.uniform(-80, 760) * S; L = rng.uniform(260, 820) * S; t = rng.uniform(0.9, 2.4) * S
    gold = rng.random() < 0.55
    trail(y, xh, L, t, (1.0, 0.8, 0.42) if gold else (0.42, 0.82, 1.0), rng.uniform(0.45, 1.0))

# dust
pl = Image.new("RGB", (W, H)); dp = ImageDraw.Draw(pl)
for i in range(240):
    x, y = rng.uniform(0, W), rng.uniform(0, H * 0.8)
    r = rng.choice([0.7, 1.0, 1.4, 2.0]) * S
    c = [(255, 214, 140), (120, 210, 255), (255, 255, 255)][rng.integers(0, 3)]
    k = rng.uniform(0.2, 0.9) * np.exp(-((np.hypot(x - CX, y - CY) / (900 * S)) ** 2)) ** 0.3
    dp.ellipse([x - r, y - r, x + r, y + r], fill=tuple(int(v * k) for v in c))
p = np.asarray(pl.filter(ImageFilter.GaussianBlur(1.0))).astype(np.float32) / 255
img = 1 - (1 - img) * (1 - p)
# soft vignette keeps it premium and dark at the edges
v = np.clip(1 - (np.hypot((xx - W * 0.6) / W, (yy - H * 0.38) / H) - 0.25) * 0.9, 0.35, 1)
img *= v[..., None]

Image.fromarray((np.clip(img, 0, 1) * 255).round().astype(np.uint8)).save(sys.argv[1])
print("saved", sys.argv[1])
