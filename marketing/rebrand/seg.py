"""python3 seg.py <name>: cut the subject out of img/plate-<name>.png (img/mask-<name>.png). The backdrop is a smooth
studio sweep, so a low-order surface fitted to its pixels predicts it everywhere; whatever differs from that surface in
colour or has texture of its own is the subject."""
import sys

import numpy as np
from PIL import Image, ImageFilter

name = sys.argv[1]
T = float(sys.argv[2]) if len(sys.argv) > 2 else 0.03     # how far from the backdrop counts as subject
a = np.asarray(Image.open(f'img/plate-{name}.png').convert('RGB'), np.float32) / 255
H, W, _ = a.shape
yy, xx = np.mgrid[0:H, 0:W] / np.array([H, W])[:, None, None]

def basis(x, y):
    return np.stack([np.ones_like(x), x, y, x * x, x * y, y * y, x ** 3, y ** 3, x * x * y, x * y * y], -1)

# start from pixels that are clearly backdrop (dark and calm), fit, then refit on what still agrees with the fit
lum = a.mean(2)
tex = np.asarray(Image.fromarray((lum * 255).astype(np.uint8)).filter(ImageFilter.FIND_EDGES).filter(ImageFilter.GaussianBlur(3)), np.float32) / 255
bg = (lum < np.percentile(lum, 55)) & (tex < 0.02)
B = basis(xx, yy).reshape(-1, 10)
for _ in range(3):
    sel = bg.reshape(-1)
    coef = np.linalg.lstsq(B[sel][::7], a.reshape(-1, 3)[sel][::7], rcond=None)[0]
    model = (B @ coef).reshape(H, W, 3)
    d = np.sqrt(((a - model) ** 2).sum(2))
    bg = (d < 0.035) & (tex < 0.03)

score = np.clip((d - T) / 0.05, 0, 1)
score = np.maximum(score, np.clip((tex - 0.03) / 0.04, 0, 1) * (d > 0.02))
m = Image.fromarray((score * 255).astype(np.uint8))
m = m.filter(ImageFilter.MaxFilter(5)).filter(ImageFilter.MinFilter(5))       # close small gaps in the body
m = m.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))       # drop specks in the backdrop
m = np.asarray(m, np.float32) / 255 > 0.5

# keep the big pieces only (the animal, its branch, the plane), fill holes
from collections import deque
lab = np.zeros((H, W), np.int32); sizes = [0]
for y in range(0, H, 2):
    for x in range(0, W, 2):
        if m[y, x] and not lab[y, x]:
            n = len(sizes); q = deque([(y, x)]); lab[y, x] = n; c = 0
            while q:
                cy, cx = q.popleft(); c += 1
                for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                    if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not lab[ny, nx]:
                        lab[ny, nx] = n; q.append((ny, nx))
            sizes.append(c)
keep = np.isin(lab, [i for i, s in enumerate(sizes) if s > 1500])
inv = ~keep; hole = np.zeros_like(keep); q = deque()
for x in range(W):
    for y in (0, H - 1):
        if inv[y, x] and not hole[y, x]: hole[y, x] = True; q.append((y, x))
for y in range(H):
    for x in (0, W - 1):
        if inv[y, x] and not hole[y, x]: hole[y, x] = True; q.append((y, x))
while q:
    cy, cx = q.popleft()
    for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
        if 0 <= ny < H and 0 <= nx < W and inv[ny, nx] and not hole[ny, nx]:
            hole[ny, nx] = True; q.append((ny, nx))
# backdrop pockets fully enclosed by the subject stay backdrop unless they are tiny
lab2 = np.zeros((H, W), np.int32); pockets = ~keep & ~hole
for y in range(H):
    for x in range(W):
        if pockets[y, x] and not lab2[y, x]:
            lab2[y, x] = 1; q = deque([(y, x)]); pts = [(y, x)]
            while q:
                cy, cx = q.popleft()
                for ny, nx in ((cy + 1, cx), (cy - 1, cx), (cy, cx + 1), (cy, cx - 1)):
                    if 0 <= ny < H and 0 <= nx < W and pockets[ny, nx] and not lab2[ny, nx]:
                        lab2[ny, nx] = 1; q.append((ny, nx)); pts.append((ny, nx))
            if len(pts) > 1200:
                ys, xs = zip(*pts); hole[list(ys), list(xs)] = True
mask = ~hole
out = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.1))
out.save(f'img/mask-{name}.png')
print(name, 'subject share', round(mask.mean(), 3))
