"""The smashed title: UNLOCK ALL in concrete, with Sledge's hammer blowing a hole through the C of LOCK.
Writes img/title.png and img/chunks.png (full frame, transparent) and prints where Sledge goes so the hammer face
lands on the C.
- Letters: Big Shoulders Display at weight 900. Face from the intact top of a broken-sidewalk photo, a 9 px bevel lit
  from the top right (where the light on Sledge comes from), a 30 px dark side going down left, a dark outline.
- Hole and pieces: the broken bottom of the same photo is laid over the C, scaled to 0.5, so its real crack network
  decides where the letter breaks. Its cells nearest the hammer are gone (the hole), the next ring flies off as chunks,
  the rest stay with their cracks showing.
- Long cracks: one real crack from an asphalt photo, copied at four angles out from the hole and fading.
python title.py   (Pillow, numpy, scipy, OpenCV)"""
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

W, H = 1920, 1080
S, HF = .9, (420, 670)            # Sledge's scale, and the centre of the hammer face in the poster art
SIZE, X0 = 310, 40

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def text_mask(txt, x, y):
    f = ImageFont.truetype('fonts/BigShouldersDisplay-VF.ttf', SIZE * 2)
    f.set_variation_by_axes([900])
    bb = f.getbbox(txt)
    im = Image.new('L', (W * 2, H * 2), 0)
    ImageDraw.Draw(im).text((x * 2 - bb[0], y * 2 - bb[1]), txt, font=f, fill=255)
    return arr(im.resize((W, H), Image.LANCZOS)), (bb[3] - bb[1]) / 2

# layout: Sledge fills the height (his waist on the frame edge), so the hammer face's height is fixed; the UNLOCK line
# is centred on it and ALL sits under it
oy = H - 1125 * S
cy = oy + HF[1] * S
_, cap = text_mask('UNLOCK', X0, 0)
y1 = round(cy - cap / 2)
unlock, _ = text_mask('UNLOCK', X0, y1)
unlo, _ = text_mask('UNLO', X0, y1)
unloc, _ = text_mask('UNLOC', X0, y1)
un, _ = text_mask('UN', X0, y1)
allm, _ = text_mask('ALL', X0, y1 + cap + 28)
cmask = np.clip(unloc - unlo, 0, 1)
ys, xs = np.nonzero(cmask > .5)
cx = float(xs.mean()) - 8                        # on the C's back stroke, where there is most concrete to break
ox = cx - HF[0] * S
print(f'sledge: left {ox:.0f}px top {oy:.0f}px width {2000 * S:.0f}px; hole at ({cx:.0f}, {cy:.0f})')
lock = np.clip(unlock - un, 0, 1)
letters = np.maximum(unlock, allm)
yy, xx = np.mgrid[:H, :W].astype(np.float32)
r = np.hypot(xx - cx, yy - cy)

# concrete face texture: the intact top of the sidewalk photo, neutral light grey
con = arr(Image.open('src/concrete-broken.jpg').convert('RGB'))
intact = cv2.resize(con[0:420, 0:1340], (W, round(420 * W / 1340)), interpolation=cv2.INTER_AREA)
tex = np.zeros((H, W, 3), np.float32)
top = 470
tex[top:top + intact.shape[0]] = intact[:H - top]
tex[:top] = intact[:top][::-1]
lum = tex.mean(2, keepdims=True)
tex = np.clip(blur((lum - lum[top:].mean()) * .55, .8) + np.array([.84, .82, .78]), 0, 1)

# the broken part of the photo, centred on the hole: its gaps are the cracks, its cells the pieces
K = .5
brk = con[900:1900, 100:1300]
bl = brk.mean(2)
gap = (bl < blur(bl, 14) - .06) | (bl < .36) | ((brk[..., 1] > brk[..., 0] + .02) & (bl < .5))
gap = ndi.binary_opening(gap, iterations=1)
cells, n = ndi.label(~ndi.binary_dilation(gap, iterations=1))
# the gaps are wide where moss grew in them; keep only their middle line as the crack
skel = np.zeros_like(gap); g = gap.copy()
while g.any():
    e = ndi.binary_erosion(g)
    skel |= g & ~ndi.binary_dilation(e)
    g = e
gap = ndi.binary_dilation(skel)
M = np.float32([[K, 0, cx - 580 * K], [0, K, cy - 300 * K]])
warp = lambda a, interp: cv2.warpAffine(a, M, (W, H), flags=interp, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
gapc = warp(gap.astype(np.float32), cv2.INTER_LINEAR)
cellc = warp(cells.astype(np.float32), cv2.INTER_NEAREST).astype(np.int32)
brkc = warp(brk, cv2.INTER_LINEAR)
idx = np.arange(1, n + 1)
cyx = ndi.center_of_mass(np.ones_like(cellc), cellc, idx)
area = ndi.sum(lock > .5, cellc, idx)
hole_ids, chunk_ids = [], []
for i, (py, px) in zip(idx, cyx):
    if np.isnan(px) or area[i - 1] < 30:
        continue
    d = np.hypot(px - cx, py - cy)
    if d < 118:
        hole_ids.append(i)
    elif d < 215 and 200 < area[i - 1] < 2600 and len(chunk_ids) < 8:
        chunk_ids.append(i)
# the bigger pieces knocked out of the hole fly off with the loose ring
blown = sorted([i for i in hole_ids if 150 < area[i - 1] < 2600], key=lambda i: -area[i - 1])[:4]
chunk_ids += blown
hole = np.isin(cellc, hole_ids)
hole = ndi.binary_closing(ndi.binary_dilation(hole, iterations=2), iterations=4)
loose = np.isin(cellc, chunk_ids) & ~hole

# long cracks: the one crack in the asphalt photo, at four angles out from the hole
# traced row by row along the darkest pixel (the asphalt around it is too dark and speckled to threshold), with
# the crack's own width at each row
asp = blur(arr(Image.open('src/asphalt-crack.jpg').convert('L')), 1)
x = 560 + int(np.argmin(asp[0, 560:760]))
cr = np.zeros(asp.shape, np.uint8)
for y in range(asp.shape[0]):
    lo = max(x - 3, 0)
    x = lo + int(np.argmin(asp[y, lo:x + 4]))
    w = int(np.clip((asp[y, x - 6:x + 7] < asp[y, x] + .06).sum(), 2, 6))
    cv2.circle(cr, (x, y), w // 2, 1, -1)
cr = cr.astype(bool)
start = (float(np.nonzero(cr[0])[0].mean()), 0.)
crack = np.zeros((H, W), np.float32)
for ang, sc in ((160, .95), (205, .8), (125, .7), (250, .6)):
    a = np.deg2rad(ang - 90)                     # the crack runs down the photo; turn "down" to `ang`
    c, s_ = np.cos(a) * sc, np.sin(a) * sc
    R = np.float32([[c, -s_, 0], [s_, c, 0]])
    R[:, 2] = np.float32([cx, cy]) - R[:, :2] @ np.float32(start)
    crack = np.maximum(crack, cv2.warpAffine(cr.astype(np.float32), R, (W, H), flags=cv2.INTER_LINEAR))
crack *= np.clip(1.15 - r / 620, 0, 1) ** .8
crack = np.maximum(crack, gapc * np.clip(1.4 - r / 230, 0, 1))
crack *= lock

# the letters, with the hole and the loose pieces taken out
alpha = letters * (1 - hole) * (1 - loose)
# no slivers or pinholes left by the cut: they would smear when the side is extruded
keep = alpha > .5
lab, m = ndi.label(keep)
keep = np.isin(lab, 1 + np.nonzero(ndi.sum(keep, lab, range(1, m + 1)) >= 600)[0])
lab, m = ndi.label(~keep)
small = np.isin(lab, 1 + np.nonzero(ndi.sum(~keep, lab, range(1, m + 1)) < 200)[0])
alpha = np.where(small, letters, alpha) * blur(keep | small, .6)

def shade_face(a, texture):
    d = ndi.distance_transform_edt(a > .5)
    h = np.clip(d / 9, 0, 1)
    h = blur(h * h * (3 - 2 * h), 1)
    gy, gx = np.gradient(h)
    nx, ny, nz = -gx * 9, -gy * 9, np.ones_like(h)
    nl = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    L = np.array([.55, -.6, .58]); L /= np.linalg.norm(L)
    sh = (nx * L[0] + ny * L[1] + nz * L[2]) / nl
    face = texture * (.42 + .62 * sh[..., None])
    return np.clip(face + .18 * np.clip(sh - .9, 0, 1)[..., None] * 4, 0, 1)

face = shade_face(alpha, tex)
# near the hole the face is the broken photo itself, cracks and all
wb = np.clip(1 - (r - 110) / 120, 0, 1)[..., None] * lock[..., None]
bgrey = brkc.mean(2, keepdims=True)
bface = np.clip(blur((np.maximum(bgrey, .38) - .55) * .6, .8) + np.array([.82, .80, .76]), 0, 1)
face = face * (1 - wb) + shade_face(alpha, bface) * wb
face = face * (1 - .78 * crack[..., None])
hl = ndi.shift(crack, (1, -1), order=1) * (1 - crack)
face = np.clip(face + .22 * hl[..., None] * lock[..., None], 0, 1)

def extrude(a, depth=30, dx=-.42, dy=1.0):
    rgb = np.zeros((H, W, 3), np.float32); al = np.zeros((H, W), np.float32)
    for i in range(depth, 0, -1):
        s = ndi.shift(a, (i * dy, i * dx), order=1)
        t = .5 * (1 - i / depth)
        col = tex * .16 + np.array([.05, .045, .035]) + t * .12
        rgb = rgb * (1 - s[..., None]) + col * s[..., None]
        al = np.maximum(al, s)
    return rgb, al

side, sa = extrude(alpha)
outline = np.clip(ndi.grey_dilation(alpha, size=(7, 7)) - alpha, 0, 1)
sh_a = np.clip(blur(ndi.shift(np.maximum(alpha, sa), (26, -14), order=1), 18) * .5, 0, 1)
sh_col = np.array([.24, .17, .02])

out_rgb = sh_col * np.ones((H, W, 3), np.float32)
out_a = sh_a.copy()
def over(rgb, a):
    global out_rgb, out_a
    a = a[..., None]
    na = a[..., 0] + out_a * (1 - a[..., 0])
    out_rgb = (rgb * a + out_rgb * out_a[..., None] * (1 - a)) / np.maximum(na[..., None], 1e-5)
    out_a = na
over(side, sa)
over(np.full((H, W, 3), .06, np.float32), np.maximum(outline, 0) * (1 - sa) * .9)
over(face, alpha)
Image.fromarray((np.dstack([np.clip(out_rgb, 0, 1), np.clip(out_a, 0, 1)]) * 255 + .5).astype(np.uint8)).save('img/title.png')

# chunks: each loose cell keeps its face, gains a short side, and flies out from the hole toward the camera
rng = np.random.default_rng(11)
ch_rgb = np.zeros((H, W, 3), np.float32); ch_a = np.zeros((H, W), np.float32)
piece_face = shade_face(letters * np.isin(cellc, chunk_ids), face * 0 + tex) * (1 - wb) + face * wb
for k, i in enumerate(chunk_ids):
    m = (cellc == i).astype(np.float32) * letters
    if m.sum() < 150:
        continue
    py, px = ndi.center_of_mass(m)
    v = np.array([px - cx, py - cy]); v /= np.linalg.norm(v) + 1e-6
    dist = rng.uniform(90, 200); grow = rng.uniform(1.05, 1.25); rot = rng.uniform(-35, 35)
    T = cv2.getRotationMatrix2D((px, py), rot, grow)
    T[:, 2] += v * dist
    fm = cv2.warpAffine(m, T, (W, H), flags=cv2.INTER_LINEAR)
    fr = cv2.warpAffine(piece_face, T, (W, H), flags=cv2.INTER_LINEAR)
    srgb, sal = extrude(fm, depth=9)
    ang = np.degrees(np.arctan2(v[1], v[0]))
    kern = np.zeros((5, 5), np.float32); kern[2, :] = 1 / 5
    kern = cv2.warpAffine(kern, cv2.getRotationMatrix2D((2, 2), -ang, 1), (5, 5))
    kern /= kern.sum()
    pa = np.maximum(fm, sal)
    prgb = srgb * (sal * (1 - fm))[..., None] + fr * fm[..., None]
    prgb = prgb / np.maximum(pa[..., None], 1e-5)
    pa = cv2.filter2D(pa, -1, kern); prgb = cv2.filter2D(prgb * pa[..., None], -1, kern) / np.maximum(pa[..., None], 1e-5)
    shadow = blur(ndi.shift(pa, (22, -12), order=1), 10) * .4
    for rgb, a in ((np.zeros((H, W, 3)) + sh_col, shadow), (prgb, pa)):
        na = a + ch_a * (1 - a)
        ch_rgb = (rgb * a[..., None] + ch_rgb * (ch_a * (1 - a))[..., None]) / np.maximum(na[..., None], 1e-5)
        ch_a = na
Image.fromarray((np.dstack([np.clip(ch_rgb, 0, 1), np.clip(ch_a, 0, 1)]) * 255 + .5).astype(np.uint8)).save('img/chunks.png')
print('chunks', len(chunk_ids), 'hole cells', len(hole_ids))
