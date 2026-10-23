# Ad D photo plate: builds plate.png (1080x1920) from the cut-outs and the tape render, layer by layer.
#   python3 compose.py            -> plate.png, the Story
#   python3 compose.py 228        -> plate-228.png, the same scene with the frame 228 px wider on each side
#                                    (1536x1920 = 4:5, for the feed post; tape renders from tape.py ... 228)
# Needs cut/ (cut.py, tape.py), ../adB/tex (prep.py and fetch-textures.sh).
import sys
import numpy as np, cv2
from PIL import Image

OFF = int(sys.argv[1]) if len(sys.argv) > 1 else 0
SUF = f'-{OFF}' if OFF else ''
W, H = 1080 + 2 * OFF, 1920
TEX = '../adB/tex/'
rng = np.random.default_rng(7)


def rgba(path):
    return np.asarray(Image.open(path).convert('RGBA')).astype(np.float32) / 255


def over(dst, src, a, x=0, y=0):
    """paste src (h,w,3) with alpha a (h,w) onto dst at x, y"""
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


# Blender writes its own notes into the PNGs it renders: keep only the pixels
for f in (f'cut/tape-shadow{SUF}.png', f'cut/tape-back{SUF}.png', f'cut/tape-front{SUF}.png'):
    im = Image.open(f).convert('RGBA')
    Image.frombytes('RGBA', im.size, im.tobytes()).save(f, optimize=True)

import json
CAM = json.load(open('cut/camera.json'))      # written by tape.py: where its camera puts the table and the stand-in
(TBX, TBY), (TTX, TTY) = CAM['base'], CAM['top']
K = (TBY - TTY) / 900                          # the layout below was drawn for a 900 px pouch based at (700, 1560)


def T(x, y):
    return TBX + K * (x - 700), TBY + K * (y - 1560)


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
xx -= OFF                                        # x in the Story's frame, so every position below stays as it was

# the wall meets the table along the line the tape render's camera gives
(_bx0, _by0), (_bx1, _by1) = CAM['table'][3], CAM['table'][2]


def wall_line(x):
    return _by0 + (x - _bx0) * (_by1 - _by0) / (_bx1 - _bx0)

wall_mask = (yy < wall_line(xx)).astype(np.float32)

# ---------- wall: plaster in the brand green, relief lit from the left ----------
nor = np.asarray(Image.open(TEX + 'plastered_wall_02_nor_gl.jpg').convert('RGB')).astype(np.float32) / 127.5 - 1
nor = cv2.resize(nor, (900, 900), interpolation=cv2.INTER_AREA)
nor = np.tile(nor, (3, 3, 1))[:H, :W]
relief = 1 + 0.55 * (nor[..., 0] * -0.55 + nor[..., 1] * 0.25)
green = np.array([1, 77, 64], np.float32) / 255
wall = green[None, None] * relief[..., None]
# a warm patch of window light on the wall behind the pouch, off centre to the right; falling away to the top
_gx, _gy = T(760, 1020)
glow = np.exp(-(((xx - _gx) / 470) ** 2 + ((yy - _gy) / 560) ** 2))
wall = wall * (0.55 + 0.75 * glow[..., None]) + np.array([0.20, 0.13, 0.05]) * (glow ** 2)[..., None] * 0.55
wall *= (0.78 + 0.22 * np.clip(yy / 1100, 0, 1))[..., None]

# ---------- table: smoked walnut in the render's perspective ----------
wood = np.asarray(Image.open(TEX + 'smoked_walnut_veneer_diff.jpg').convert('RGB')).astype(np.float32) / 255
tile = 1024                                         # 0.75 m of veneer
wood = cv2.resize(wood, (tile, tile), interpolation=cv2.INTER_AREA)
mos = np.tile(wood, (2, 3, 1))
mw, mh = int(2.2 / 0.75 * tile), int(1.07 / 0.75 * tile)
mos = mos[:mh, :mw]
src = np.float32([[0, mh], [mw, mh], [mw, 0], [0, 0]])
dst = np.float32(CAM['table'])
Hm = cv2.getPerspectiveTransform(src, dst)
Hm = np.float32([[1, 0, OFF], [0, 1, 0], [0, 0, 1]]) @ Hm
table = cv2.warpPerspective(mos, Hm, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
table = np.clip(np.nan_to_num(table), 0, 1)   # the rows near the horizon fall outside the warp
table = table ** 1.35 * np.array([0.66, 0.50, 0.38]) * 1.15     # oiled, darker, warmer
# window light from the left across the table, strongest round the pouch, the front edge falling into shade
_lx, _ly = T(620, 1560)
tl = np.exp(-(((xx - _lx) / 620) ** 2 + ((yy - _ly) / 300) ** 2))
table *= (0.42 + 0.85 * tl[..., None])
table *= (1 - 0.35 * np.clip((yy - 1650) / 270, 0, 1))[..., None]
# the shadow where the table meets the wall
seam = np.exp(-(((yy - wall_line(xx)) / 10) ** 2)) * (yy > wall_line(xx) - 2)
img = wall * wall_mask[..., None] + table * (1 - wall_mask[..., None])
darken(img, seam * 0.55)
wall_ao = np.clip(1 - (wall_line(xx) - yy) / 90, 0, 1) * wall_mask
darken(img, wall_ao * 0.35)

# the palm and window shadow, far out of focus, over wall and table
gobo = np.asarray(Image.open(TEX + 'gobo.png').convert('L')).astype(np.float32) / 255
gobo = cv2.resize(np.ascontiguousarray(np.rot90(gobo, -1)), (W, H))
gobo = cv2.GaussianBlur(gobo, (0, 0), 16)
darken(img, (1 - gobo) * 0.22)

# ---------- ambient occlusion under the whole group ----------
_ax, _ay = T(690, 1590)
ao = np.exp(-(((xx - _ax) / (380 * K)) ** 2 + ((yy - _ay) / (95 * K)) ** 2))
darken(img, cv2.GaussianBlur(ao, (0, 0), 30) * 0.42)

# ---------- cast shadows of pouch and tape, from the render (tape+shadow minus tape) ----------
ts = rgba(f'cut/tape-shadow{SUF}.png'); tb = rgba(f'cut/tape-back{SUF}.png'); tfr = rgba(f'cut/tape-front{SUF}.png')
sh = np.clip(ts[..., 3] - np.maximum(tb[..., 3], tfr[..., 3]), 0, 1)
sh = cv2.GaussianBlur(sh, (0, 0), 2.5)
darken(img, sh * 0.62 * (1 - wall_mask))

# ---------- pouch ----------
# the brand's doypack mockup, its front panel straightened square to the camera (cut.py). Its foot, (0, 1052) to
# (592, 1052) in the cut-out, goes on the stand-in's front base corners in the tape render
po = Image.open('cut/pouch-straight.png')
(flx, fly), (frx, fry) = CAM['front_left'], CAM['front_right']
S_ = np.hypot(frx - flx, fry - fly) / 592
ph, pw = round(po.height * S_), round(po.width * S_)
po = np.asarray(po.resize((pw, ph), Image.LANCZOS)).astype(np.float32) / 255
px, py = OFF + round(flx), round((fly + fry) / 2 - 1052 * S_)
prgb, pa = po[..., :3], po[..., 3]
prgb = np.clip(prgb * np.array([1.04, 1.0, 0.93]), 0, 1)
# key light from the left warms the lit side; the right edge picks up the warm wall light as a rim
gx = np.linspace(0, 1, pw)[None, :]
prgb = prgb * (1 + 0.10 * (1 - gx)[..., None] * np.array([1.0, 0.9, 0.7]))
edge = np.clip(pa - cv2.erode(pa, np.ones((9, 9), np.uint8)), 0, 1)
# the shadow-side edge still carries a sliver of the cream ground: take it down into the room's green shade
spill = cv2.GaussianBlur(edge, (0, 0), 2) * np.clip((0.6 - gx) / 0.6, 0, 1)
# and near the base the whole outline (both sides) is cream: take it into the table's shade
lowrows = np.clip((np.linspace(0, 1, ph)[:, None] - 0.80) / 0.08, 0, 1)
lowrows = np.maximum(lowrows, 0.75 * ((gx < 0.12) | (gx > 0.9)))   # the side edges carry it all the way up
spill = np.maximum(spill, cv2.GaussianBlur(np.clip(pa - cv2.erode(pa, np.ones((15, 15), np.uint8)), 0, 1), (0, 0), 3) * lowrows)
prgb = prgb * (1 - spill[..., None] * 0.7) + np.array([0.04, 0.07, 0.06]) * spill[..., None] * 0.7
# any pale left right on the outline is the cream ground, not the foil: fill it from the foil just inside
ehsv = cv2.cvtColor((np.clip(prgb, 0, 1) * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
rim_zone = np.clip(pa - cv2.erode(pa, np.ones((11, 11), np.uint8)), 0, 1) > 0.02
pale = ((ehsv[..., 2] > 135) & (ehsv[..., 1] < 70) & rim_zone).astype(np.uint8)
pale = cv2.dilate(pale, np.ones((3, 3), np.uint8))
filled = cv2.inpaint((np.clip(prgb, 0, 1) * 255).astype(np.uint8), pale, 7, cv2.INPAINT_TELEA).astype(np.float32) / 255
# the right edge near the base catches the cream more: a wider, softer pass there
rz = (np.clip(pa - cv2.erode(pa, np.ones((17, 17), np.uint8)), 0, 1) > 0.02) & (gx > 0.88) & (np.linspace(0, 1, ph)[:, None] > 0.6)
pale = np.maximum(pale, cv2.dilate(((ehsv[..., 2] > 100) & (ehsv[..., 1] < 90) & rz).astype(np.uint8), np.ones((3, 3), np.uint8)))
filled = cv2.inpaint((np.clip(prgb, 0, 1) * 255).astype(np.uint8), pale, 9, cv2.INPAINT_TELEA).astype(np.float32) / 255
pm = cv2.GaussianBlur(pale.astype(np.float32), (0, 0), 1.0)[..., None]
prgb = prgb * (1 - pm) + filled * pm
edge = cv2.GaussianBlur(edge, (0, 0), 3) * np.clip((gx - 0.55) / 0.45, 0, 1) * (np.linspace(0.5, 1, ph)[:, None]) * np.clip((0.95 - np.linspace(0, 1, ph)[:, None]) / 0.12, 0, 1)
prgb = np.clip(prgb + edge[..., None] * np.array([0.55, 0.40, 0.22]) * 0.15, 0, 1)
# contact shadow: tight and dark right under the base
contact = np.zeros((H, W), np.float32)
base_rows = np.zeros_like(pa); base_rows[int(ph * 0.93):] = 1
over_c = np.zeros((H, W), np.float32)
ys, xs = slice(py + 4, py + 4 + ph), slice(px, px + pw)
over_c[ys, xs] = pa * base_rows
contact = cv2.GaussianBlur(over_c, (0, 0), 3)
# the back half of the fallen tape goes under the pouch, so the photo's own outline hides it
over(img, np.clip(tb[..., :3] * np.array([1.08, 1.02, 0.9]), 0, 1), tb[..., 3])
darken(img, contact * 0.85)
over(img, prgb, pa, px, py)
pouch_canvas = np.zeros((H, W, 3), np.float32)
over(pouch_canvas, np.ones((ph, pw, 3), np.float32), pa, px, py)
pouch_canvas = pouch_canvas[..., 0]

# ---------- tape: the front half of the loop, over the pouch's foot ----------
over(img, np.clip(tfr[..., :3] * np.array([1.08, 1.02, 0.9]), 0, 1), tfr[..., 3])

# ---------- loose tea and rose petals spilled over the base and the tape ----------
hb = Image.open('cut/herbs.png')
hw = round(400 * K)
hh = round(hb.height * hw / hb.width)
hb = np.asarray(hb.resize((hw, hh), Image.LANCZOS)).astype(np.float32) / 255
hx, hy = (round(v) for v in T(735, 1688))
hx += OFF
hrgb = np.clip(hb[..., :3] * np.array([1.04, 0.98, 0.86]) * 0.92, 0, 1)
ha = hb[..., 3].copy()
hhsv = cv2.cvtColor((hb[..., :3] * 255).astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
sliver = (hhsv[..., 2] < 80) & ((hhsv[..., 0] > 75) & (hhsv[..., 0] < 125))      # dark blue-teal: the pouch, not leaves
ha *= 1 - cv2.GaussianBlur(sliver.astype(np.float32), (0, 0), 1.5)
edge_noise = cv2.GaussianBlur(rng.normal(0, 1, (1, hw)).astype(np.float32), (0, 0), 9)[0]
edge_noise = edge_noise / (np.abs(edge_noise).max() + 1e-6)
top = np.linspace(0, 1, hh)[:, None] * 3.2 - 0.6 + 0.55 * edge_noise[None, :]           # an uneven top edge
ha *= np.clip(top, 0, 1) ** 1.3
hsh = np.zeros((H, W, 3), np.float32)
over(hsh, np.ones((hh, hw, 3), np.float32), ha, hx + 4, hy + 5)
hsh = hsh[..., 0]
darken(img, cv2.GaussianBlur(hsh, (0, 0), 3) * 0.6)
over(img, hrgb, ha, hx, hy)

# a smaller spill on the left, lying over the end of the tape
sm = hb[:, :int(hw * 0.42)]
sm = cv2.resize(sm, (int(sm.shape[1] * 0.85), int(sm.shape[0] * 0.85)), interpolation=cv2.INTER_AREA).copy()
sm[..., 3] *= np.clip(np.linspace(1.6, -0.2, sm.shape[1]), 0, 1)[None, :]   # thin out toward the cut edge
sx, sy = (round(v) for v in T(455, 1690))
sx += OFF
ssh = np.zeros((H, W, 3), np.float32)
over(ssh, np.ones(sm.shape[:2] + (3,), np.float32), sm[..., 3], sx + 4, sy + 5)
darken(img, cv2.GaussianBlur(ssh[..., 0], (0, 0), 3) * 0.6)
over(img, np.clip(sm[..., :3] * np.array([1.04, 0.98, 0.86]) * 0.9, 0, 1), sm[..., 3], sx, sy)

# ---------- subtle vignette ----------
r = np.sqrt(((xx - 600) / 820) ** 2 + ((yy - 1150) / 1250) ** 2)   # the frame's own vignette, not the scene's
darken(img, np.clip((r - 0.62) / 0.6, 0, 1) ** 1.6 * 0.38)

Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(f'plate{SUF}.png', optimize=True)
print('ok')
