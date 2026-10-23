"""The wall Sledge breaks: the operators screen from the brief, locked, smashed open where his hammer lands so the same
operators show unlocked behind it. Writes img/wall.jpg (the whole frame) and img/shards.png (the pieces in front).
- Unlocked: the attackers grid exactly as in the screenshot, a touch more colour.
- Locked: the same grid with every card turned grey and dark, its operator emblem covered by a padlock badge traced
  from a photo of a real closed padlock.
- The break: the broken bottom of a sidewalk photo laid over the hole decides where it breaks (its real cells and
  crack lines); a real crack traced from an asphalt photo runs out from the hole at six angles. The broken edge shows
  the wall's thickness, and the unlocked side throws a little gold light onto it.
python wall.py   (Pillow, numpy, scipy, OpenCV)"""
import cv2
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

W, H = 1920, 1080
HOLE, R = (705, 560), 345          # centre and radius of the hole; Sledge's hammer face is at (798, 671)

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def save(a, p, **kw):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p, **kw)

shot = arr(Image.open('src/operators-unlocked.jpg').convert('RGB'))

# cards in the screenshot: 11 columns, rows of 183 px; the fourth row has two cards and Deimos, selected
cols = [43 + 119.8 * i for i in range(11)]
rows = [303, 497, 691, 885]
cards = [(x, y, 110, 183) for y in rows[:3] for x in cols] + [(cols[0], rows[3], 110, 183), (cols[1], rows[3], 110, 183),
                                                             (267, 857, 141, 238)]

# padlock badge: the real lock's outline, straightened, white
pm = Image.open('src/padlock-closed-mask.png').convert('L').rotate(11.3, resample=Image.BICUBIC, expand=True)
pm = pm.crop(pm.getbbox())

locked = shot.copy()
for x, y, w, h in cards:
    x, y = int(round(x)), int(round(y))
    c = locked[y:y + h, x:x + w]
    g = c @ np.array([.3, .59, .11], np.float32)
    g = (g - .5) * .7 + .5
    c[:] = np.clip(g[..., None] * .5 * np.array([.86, .9, 1.05]) + np.array([.03, .04, .07]), 0, 1)
    # the emblem goes dark; the padlock sits on it
    ex, ey = x + w // 2, y + int(h * .75)
    lh = int(h * .34)
    lw = int(lh * pm.width / pm.height)
    badge = arr(pm.resize((lw, lh), Image.LANCZOS))
    plate = blur(np.pad(np.ones((lh, lw), np.float32), 14), 6)
    py0, px0 = ey - lh // 2 - 14, ex - lw // 2 - 14
    region = locked[py0:py0 + plate.shape[0], px0:px0 + plate.shape[1]]
    region *= (1 - .55 * plate[..., None])
    b = locked[ey - lh // 2:ey - lh // 2 + lh, ex - lw // 2:ex - lw // 2 + lw]
    b[:] = b * (1 - badge[..., None] * .92) + np.array([.93, .93, .95]) * badge[..., None] * .92

# frame the grid to the thumbnail
x0, y0, x1, y1 = 30, 292, 1362, 1100
s = max(W / (x1 - x0), H / (y1 - y0))
def framed(a):
    a = cv2.resize(a[y0:y1, x0:x1], (round((x1 - x0) * s), round((y1 - y0) * s)), interpolation=cv2.INTER_CUBIC)
    oy = (a.shape[0] - H) // 2 + 20
    return a[oy:oy + H, :W]
U = framed(shot)
g = U.mean(2, keepdims=True)
U = np.clip(g + (U - g) * 1.15, 0, 1) * 1.04
L = framed(locked)

yy, xx = np.mgrid[:H, :W].astype(np.float32)
r = np.hypot(xx - HOLE[0], yy - HOLE[1])

# the break, from the broken sidewalk photo
K = .4
con = arr(Image.open('src/concrete-broken.jpg').convert('RGB'))
brk = np.pad(con[700:2048, 0:1536], ((900, 900), (900, 900), (0, 0)), mode='reflect')   # mirrored out so it covers the whole hole
bl = brk.mean(2)
gap = (bl < blur(bl, 14) - .06) | (bl < .36) | ((brk[..., 1] > brk[..., 0] + .02) & (bl < .5))
gap = ndi.binary_opening(gap, iterations=1)
cells, n = ndi.label(~ndi.binary_dilation(gap, iterations=1))
M = np.float32([[K, 0, HOLE[0] - 1580 * K], [0, K, HOLE[1] - 1400 * K]])
warp = lambda a, f: cv2.warpAffine(a, M, (W, H), flags=f, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
cellc = warp(cells.astype(np.float32), cv2.INTER_NEAREST).astype(np.int32)
idx = np.arange(1, n + 1)
cen = ndi.center_of_mass(np.ones_like(cellc), cellc, idx)
area = ndi.sum(np.ones_like(cellc), cellc, idx)
far = ndi.maximum(r, cellc, idx)                       # each cell's farthest point from the hole centre
hole_ids, ring_ids = [], []
for i, (py, px) in zip(idx, cen):
    if np.isnan(px) or area[i - 1] < 60:
        continue
    d = np.hypot(px - HOLE[0], py - HOLE[1])
    if d < R * 1.05:
        hole_ids.append(i)
    elif R * 1.05 <= d < R * 1.32 and far[i - 1] < R * 1.5 and 700 < area[i - 1] < 9000 and len(ring_ids) < 9:
        ring_ids.append(i)
# cracks: one real crack, traced row by row along its darkest pixel, sent out from the hole at six angles
asp = blur(arr(Image.open('src/asphalt-crack.jpg').convert('L')), 1)
x = 560 + int(np.argmin(asp[0, 560:760]))
cr = np.zeros(asp.shape, np.uint8)
path = []
for y in range(asp.shape[0]):
    lo = max(x - 3, 0)
    x = lo + int(np.argmin(asp[y, lo:x + 4]))
    w = int(np.clip((asp[y, x - 6:x + 7] < asp[y, x] + .06).sum(), 2, 6))
    cv2.circle(cr, (x, y), w // 2, 1, -1)
    path.append(x)
# the crack's sideways wobble, detrended, wraps round the hole so its edge is never a clean arc
p = np.array(path, np.float32)
p = p - np.polyval(np.polyfit(np.arange(len(p)), p, 1), np.arange(len(p)))
p = p / np.abs(p).max()
ang = (np.arctan2(yy - HOLE[1], xx - HOLE[0]) + np.pi) / (2 * np.pi)
jag = 1 + .1 * np.interp(ang * (len(p) - 1), np.arange(len(p)), p)
# a solid core, and an edge made of the photo's cells (cut off where a long cell runs past 1.2 R)
hole = (r < R * .82 * jag) | (np.isin(cellc, hole_ids) & (r < R * 1.2 * jag))
hole = ndi.binary_fill_holes(ndi.binary_closing(ndi.binary_dilation(hole, iterations=2), iterations=6))
loose = np.isin(cellc, ring_ids) & ~hole
lab, m = ndi.label(~(hole | loose))                      # keep the wall in one piece, no islands inside the hole
keep = lab == np.argmax(ndi.sum(~(hole | loose), lab, range(1, m + 1))) + 1
alpha = blur(keep.astype(np.float32), .6)

start = (float(np.nonzero(cr[0])[0].mean()), 0.)
# the cracks run out from the hole at six angles
crack = np.zeros((H, W), np.float32)
for ang, sc in ((150, 1.0), (195, .85), (235, .7), (110, .75), (60, .8), (15, .6)):
    a = np.deg2rad(ang - 90)
    c_, s_ = np.cos(a) * sc, np.sin(a) * sc
    T = np.float32([[c_, -s_, 0], [s_, c_, 0]])
    T[:, 2] = np.float32(HOLE) - T[:, :2] @ np.float32(start)
    crack = np.maximum(crack, cv2.warpAffine(cr.astype(np.float32), T, (W, H), flags=cv2.INTER_LINEAR))
crack *= np.clip((r - R * .8) / 40, 0, 1) * np.clip(1.25 - (r - R) / 520, 0, 1)
crack = ndi.grey_dilation(crack, size=(2, 2))

face = L * (1 - .8 * crack[..., None])
hl = np.clip(ndi.shift(crack, (-2, 2), order=1) - crack, 0, 1)
face = np.clip(face + .5 * hl[..., None], 0, 1)
gold = np.array([1.0, .78, .32])
spill = blur((~keep).astype(np.float32), 30) * keep
face = 1 - (1 - face) * (1 - (spill * .45)[..., None] * gold)

def extrude(a, depth=22, dx=-.42, dy=1.0, base=np.array([.07, .08, .1])):
    rgb = np.zeros((H, W, 3), np.float32); al = np.zeros((H, W), np.float32)
    for i in range(depth, 0, -1):
        sh = ndi.shift(a, (i * dy, i * dx), order=1)
        col = base + .1 * (1 - i / depth)
        rgb = rgb * (1 - sh[..., None]) + col * sh[..., None]
        al = np.maximum(al, sh)
    return rgb, al

side, sa = extrude(alpha)
out = U * (1 - sa[..., None]) + side * sa[..., None]
inner_shadow = blur(alpha, 14) * (1 - alpha)
out = out * (1 - .5 * inner_shadow[..., None])
out = out * (1 - alpha[..., None]) + face * alpha[..., None]
save(out, 'img/wall.jpg', quality=94)

# shards: the padlocks that were inside the hole, each on a piece of the wall broken along the photo's cells, flying out
# from the hole toward the camera on the side Sledge doesn't cover
oy_f = (round((y1 - y0) * s) - H) // 2 + 20
badges = [((x + w / 2 - x0) * s, (y + h * .75 - y0) * s - oy_f) for x, y, w, h in cards]
rng = np.random.default_rng(5)
ch_rgb = np.zeros((H, W, 3), np.float32); ch_a = np.zeros((H, W), np.float32)
picked = 0
for bx, by in sorted(badges, key=lambda b: np.hypot(b[0] - HOLE[0], b[1] - HOLE[1])):
    d = np.hypot(bx - HOLE[0], by - HOLE[1])
    if not (R * .35 < d < R * 1.05) or bx > HOLE[0] + 40 or picked >= 4:
        continue
    near = [i for i, (py, px) in zip(idx, cen) if not np.isnan(px) and np.hypot(px - bx, py - by) < 70]
    mk = ndi.binary_fill_holes(ndi.binary_closing(np.isin(cellc, near), iterations=4)).astype(np.float32)
    if mk.sum() < 2000:
        continue
    picked += 1
    v = np.array([bx - HOLE[0], by - HOLE[1]]); v /= np.linalg.norm(v) + 1e-6
    T = cv2.getRotationMatrix2D((bx, by), rng.uniform(-30, 30), rng.uniform(1.1, 1.3))
    T[:, 2] += v * rng.uniform(150, 260)
    fm = cv2.warpAffine(blur(mk, .6), T, (W, H), flags=cv2.INTER_LINEAR)
    fr = cv2.warpAffine(L, T, (W, H), flags=cv2.INTER_LINEAR)
    srgb, sal = extrude(fm, depth=12)
    pa = np.maximum(fm, sal)
    prgb = (srgb * (sal * (1 - fm))[..., None] + fr * fm[..., None]) / np.maximum(pa[..., None], 1e-5)
    shadow = blur(ndi.shift(pa, (26, -16), order=1), 12) * .5
    for rgb, a in ((np.zeros((H, W, 3), np.float32) + np.array([.02, .02, .03]), shadow), (prgb, pa)):
        na = a + ch_a * (1 - a)
        ch_rgb = (rgb * a[..., None] + ch_rgb * (ch_a * (1 - a))[..., None]) / np.maximum(na[..., None], 1e-5)
        ch_a = na
blown = list(range(picked))
save(np.dstack([ch_rgb, ch_a]), 'img/shards.png')
print('hole cells', len(hole_ids), 'ring', len(ring_ids), 'blown', len(blown), 'hole area', int((1 - alpha).sum()), 'disc', int(np.pi * R * R))
