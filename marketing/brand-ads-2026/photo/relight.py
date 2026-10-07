"""Pepsi: relights the cut-out retro can (img/pepsi-retro-can.png) so it sits in the ad's light instead of the warm,
flat room light it was shot in.
- White balance: the white body is pulled from warm beige to clean white.
- Cylinder shading: each row's left and right edges give a horizontal coordinate u in [-1, 1], so the can is shaded as
  a cylinder lit from the front-left.
- Specular: two crisp vertical streaks on the left and a soft one on the right, like studio strip lights on aluminium.
- Environment: the edges pick up the ad's electric blue, with a thin bright rim on the right.
python relight.py ../img/pepsi-retro-can.png ../img/pepsi-retro-can-lit.png"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

im = np.asarray(Image.open(sys.argv[1])).astype(np.float32) / 255
H, W = im.shape[:2]

# 0. straighten: the photo was shot from above at close range, so the can narrows toward the bottom. Fit the body's
#    side edges with straight lines, then stretch every row below the shoulders so the sides become parallel
#    (a keystone correction; the base keeps its own curve because the stretch follows the fitted lines).
A = im[..., 3] > 0.5
ys = np.arange(H)
le = np.array([np.nonzero(r)[0].min() if r.any() else np.nan for r in A], np.float64)
re_ = np.array([np.nonzero(r)[0].max() if r.any() else np.nan for r in A], np.float64)
y0, y1 = int(H * 0.20), int(H * 0.85)                      # straight body, between the shoulders and the base taper
fl = np.polyfit(ys[y0:y1], le[y0:y1], 1); fr = np.polyfit(ys[y0:y1], re_[y0:y1], 1)
lf, rf = np.polyval(fl, ys), np.polyval(fr, ys)
yref = y0
wref, cref = rf[yref] - lf[yref], (rf[yref] + lf[yref]) / 2
scale = np.where(ys >= yref, wref / (rf - lf), 1.0)
cen = np.where(ys >= yref, (rf + lf) / 2, cref)
blend = np.clip((ys - (yref - 150)) / 150.0, 0, 1)          # ease into the correction above yref
scale = 1 + (scale - 1) * blend; cen = cref + (cen - cref) * blend
Wn = int(np.ceil(W + 40))
xo = np.arange(Wn)[None, :] - 20
srcx = cen[:, None] + (xo - cref) / scale[:, None]
from scipy.ndimage import map_coordinates
coords = [np.repeat(ys[:, None], Wn, 1).astype(np.float32), srcx.astype(np.float32)]
im = np.dstack([map_coordinates(im[..., k], coords, order=1, mode='constant', cval=0) for k in range(4)])
print('straighten: width at top of body', round(wref), 'bottom was', round(rf[y1] - lf[y1]))
rgb, a = im[..., :3].copy(), im[..., 3]
H, W = a.shape

# 0b. base: a real can runs straight down, then a short bevel and the elliptical bottom rim (seen from slightly above).
#     From 80% of the height down, the outline is that shape; label pixels it adds are inpainted (OpenCV Telea).
A = a > 0.5
rowsA = np.nonzero(A.any(1))[0]; bot = rowsA.max()
mid = range(int(H * 0.45), int(H * 0.70))
Wf = float(np.median([np.nonzero(A[y])[0].max() - np.nonzero(A[y])[0].min() for y in mid]))
cx = float(np.median([(np.nonzero(A[y])[0].max() + np.nonzero(A[y])[0].min()) / 2 for y in mid]))
bb = 0.115 * Wf; yc = bot - bb; ys_ = yc - 0.06 * Wf
Y = np.arange(H, dtype=np.float32)
t = np.clip((Y - ys_) / (yc - ys_), 0, 1); t = t * t * (3 - 2 * t)
hw = np.where(Y <= yc, Wf / 2 * (1 - 0.055 * t), 0.945 * Wf / 2 * np.sqrt(np.clip(1 - ((Y - yc) / bb) ** 2, 0, 1)))
hw = np.where(Y > bot, -1, hw)
Xc = np.abs(np.arange(W, dtype=np.float32)[None, :] - cx)
shape = np.clip(hw[:, None] - Xc + 0.75, 0, 1.5) / 1.5
low = Y >= int(H * 0.80)
# where the label ends: an elliptical arc parallel to the bottom rim (circles on the can seen from slightly above)
Xs = np.arange(W, dtype=np.float32)
yg = yc - 0.07 * Wf
groove = yg + bb * np.sqrt(np.clip(1 - ((Xs - cx) / (0.5 * Wf)) ** 2, 0, 1))
# label pixels the new outline adds (plus the photo's own shadowed bottom rows) are inpainted from the label around them
import cv2
Yi = np.arange(H, dtype=np.float32)[:, None]
Aer = ndi.binary_erosion(A, structure=np.ones((41, 1), bool))
R = (shape > 0.3) & ~Aer & low[:, None] & (Yi < groove[None, :] + 4)
src8 = (np.clip(rgb, 0, 1) * 255).round().astype(np.uint8)
fill = cv2.inpaint(src8[..., ::-1].copy(), R.astype(np.uint8) * 255, 25, cv2.INPAINT_TELEA)[..., ::-1]
rgb = np.where(R[..., None], fill.astype(np.float32) / 255, rgb)
# below the groove: bare aluminium bevel and rim, with a thin dark seam at the groove
belowg = Yi > groove[None, :]
rgb = np.where(belowg[..., None], np.array([0.74, 0.75, 0.78], np.float32), rgb)
seam = np.exp(-((Yi - groove[None, :]) / 3.0) ** 2)
rgb = rgb * (1 - 0.45 * seam[..., None])
wa = np.clip((Y - H * 0.76) / (H * 0.06), 0, 1)[:, None]     # ease from the photo's outline into the drawn one
a = (a * (1 - wa) + shape * wa).astype(np.float32)

# 1. white balance on the white body
L = rgb.mean(2); sat = rgb.max(2) - rgb.min(2)
white = (a > 0.99) & (L > 0.55) & (sat < 0.12)
gain = np.array([0.90, 0.905, 0.92]) / rgb[white].mean(0)
rgb = np.clip(rgb * gain, 0, 1)

# 2. per-row cylinder coordinate
inside = a > 0.5
left = np.full(H, np.nan); right = np.full(H, np.nan)
for y in range(H):
    xs = np.nonzero(inside[y])[0]
    if len(xs) > 20: left[y], right[y] = xs.min(), xs.max()
ok = ~np.isnan(left)
for arr in (left, right):
    arr[ok] = ndi.median_filter(arr[ok], 41)
    arr[~ok] = np.interp(np.nonzero(~ok)[0], np.nonzero(ok)[0], arr[ok])
c = (left + right) / 2; half = np.maximum((right - left) / 2, 1)
X = np.arange(W)[None, :]
u = np.clip((X - c[:, None]) / half[:, None], -1, 1)
nz = np.sqrt(np.clip(1 - u * u, 0, 1))

# 3. diffuse, light from the front-left
lx, lz = -0.5, 0.866
diff = np.clip(u * lx + nz * lz, 0, 1)
shade = (0.30 + 0.78 * diff) / (0.30 + 0.78 * lz)
rgb = rgb * shade[..., None]

# 4. specular strip lights
def band(u0, w): return np.exp(-((u - u0) / w) ** 2)
spec = 0.80 * band(-0.46, 0.055) + 0.45 * band(-0.33, 0.018) + 0.26 * band(0.58, 0.11)
# the strips are straight on the straight body; over the tapered shoulders and base they roll off
yy = np.arange(H)[:, None].astype(np.float32)
def ss(x, e0, e1): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)
spec = spec * (0.12 + 0.88 * ss(yy, 360, 600)) * (1 - 0.88 * ss(yy, H - 300, H - 140))
rgb = 1 - (1 - rgb) * (1 - np.clip(spec, 0, 1)[..., None])

# 5. environment: blue on the edges, bright rim on the right
edge = np.clip((np.abs(u) - 0.70) / 0.28, 0, 1) ** 1.6
env = np.array([0.10, 0.27, 1.0])
Lum = rgb.mean(2, keepdims=True)
rgb = rgb * (1 - 0.62 * edge[..., None]) + env * (0.35 + 0.65 * Lum) * 0.62 * edge[..., None]
rim = np.clip((u - 0.93) / 0.06, 0, 1)
rgb = 1 - (1 - rgb) * (1 - 0.55 * rim[..., None] * np.array([0.75, 0.86, 1.0]))

# 6. a little snap
rgb = np.clip(0.5 + (rgb - 0.5) * 1.10, 0, 1)
Image.fromarray((np.dstack([rgb, a]) * 255).round().astype(np.uint8), 'RGBA').save(sys.argv[2])
