# Cut-outs from the client's shoot for ad D (run ../fetch.sh first):
#   cut/pouch.png  the pouch at three-quarter angle (DSC05052), cut along its outline
#   cut/pouch-front.png  the pouch facing the camera, from the brand's own doypack mockup (8- Mockups), on its cream ground
#   cut/pouch-straight.png  its front panel turned to face the camera square on (no side panel showing)
#   cut/herbs.png  the loose tea and rose petals spilled at the foot of the pouch in DSC05104
#   (a cut of the cup in DSC05263 was tried and dropped: the cream cup does not key off the pale sweep)
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.spatial import ConvexHull

SHOOT = '../files/shoot/Product Photo Session/photos- New pack/'


def load(name, div=2):
    im = Image.open(SHOOT + name).convert('RGB')
    return np.asarray(im.resize((im.width // div, im.height // div), Image.LANCZOS)).astype(np.float32)


def lum(a):
    return a @ np.array([0.3, 0.59, 0.11], np.float32)


def biggest(m):
    lab, n = nd.label(m)
    return lab == (np.argmax(nd.sum(m, lab, range(1, n + 1))) + 1)


def save(rgb, alpha, path):
    alpha = np.clip(alpha, 0, 255)
    bb = Image.fromarray(alpha.astype(np.uint8)).getbbox()
    Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha]).astype(np.uint8)).crop(bb).save(path, optimize=True)
    return bb


# pouch: dark on the pale sweep; its outline is convex except the bottom gusset notch, so hull + raw mask near the base
a = load('DSC05052.jpg')
m = biggest(nd.binary_opening(lum(a) < 150, iterations=3))
ys, xs = np.nonzero(m)
hull = Image.new('L', (a.shape[1], a.shape[0]), 0)
ImageDraw.Draw(hull).polygon([tuple(p) for p in np.c_[xs, ys][ConvexHull(np.c_[xs, ys]).vertices]], fill=255)
hull = np.asarray(hull) > 0
base = ys.max()
raw = nd.binary_fill_holes(nd.binary_closing(lum(a) < 185, iterations=4))
mask = hull.copy()
band = np.zeros_like(mask); band[base - int(0.06 * (base - ys.min())):] = True
mask[band] = (hull & raw)[band]
alpha = cv2.GaussianBlur(mask.astype(np.float32) * 255, (0, 0), 1.0)
alpha = np.clip((alpha - 70) * 1.5, 0, 255)
print('pouch', save(a, alpha, 'cut/pouch.png'))

# herbs: olive leaves and pink petals; the sweep is pale and cool, the pouch is dark saturated teal
a = load('DSC05104.jpg')
hsv = cv2.cvtColor(a.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
H, S, V = hsv[..., 0], hsv[..., 1], hsv[..., 2]
bg = np.median(a[:40].reshape(-1, 3), 0)
off_bg = np.sqrt(((a - bg) ** 2).sum(2)) > 44
teal = (H > 70) & (H < 100) & (S > 60)       # the pouch print
blackish = V < 38                              # the pouch's dark ground
rows = np.arange(a.shape[0])[:, None] > a.shape[0] * 0.772
cool_pale = (a[..., 2] > a[..., 0] - 2) & (V > 125)    # the sweep and its blue-grey shadows round the leaves
herb = off_bg & ~teal & ~blackish & ~cool_pale & rows
herb = nd.binary_opening(herb, iterations=1)
herb = herb | (nd.binary_fill_holes(herb) & ~cool_pale)
lab, n = nd.label(herb)
sizes = nd.sum(herb, lab, range(1, n + 1))
herb = np.isin(lab, np.nonzero(sizes > 12)[0] + 1)
alpha = cv2.GaussianBlur(herb.astype(np.float32) * 255, (0, 0), 0.7)
print('herbs', save(a, alpha, 'cut/herbs.png'))

# pouch facing the camera: the brand's doypack mockup, dark on a flat cream ground (252, 238, 222)
MOCK = '../files/brand/8- Mockups/Doypack_Mockup_final1.png'
im = Image.open(MOCK).convert('RGB')
im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
a = np.asarray(im).astype(np.float32)
d = np.sqrt(((a - np.array([252, 238, 222], np.float32)) ** 2).sum(2))
m = biggest(nd.binary_opening(lum(a) < 120, iterations=2))
ys, xs = np.nonzero(m)
hull = Image.new('L', (a.shape[1], a.shape[0]), 0)
ImageDraw.Draw(hull).polygon([tuple(p) for p in np.c_[xs, ys][ConvexHull(np.c_[xs, ys]).vertices]], fill=255)
mask = (np.asarray(hull) > 0) & (d > 40)
mask = nd.binary_fill_holes(nd.binary_closing(mask, iterations=2))
alpha = cv2.GaussianBlur(mask.astype(np.float32) * 255, (0, 0), 0.8)
alpha = np.clip((alpha - 60) * 1.4, 0, 255)
print('pouch-front', save(a, alpha, 'cut/pouch-front.png'))

# the same pouch square on: the front panel (top edge from the gusset fold at (60, 43) to the top right corner at
# (630, 0), bottom edge from the fold at (150, 1073) to (703, 1002) in pouch-front.png) warped flat to the camera,
# a little wider at the foot as a filled doypack stands, with its top corners rounded
pf = np.asarray(Image.open('cut/pouch-front.png').convert('RGBA')).astype(np.float32)
SW_T, SW_B, SH = 560, 596, 1052
src = np.float32([[60, 43], [630, 0], [703, 1002], [150, 1073]])
dx = (SW_B - SW_T) / 2
dst = np.float32([[dx, 0], [dx + SW_T, 0], [SW_B, SH], [0, SH]])
Hm = cv2.getPerspectiveTransform(src, dst)
wp = cv2.warpPerspective(pf, Hm, (SW_B, SH), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
outline = Image.new('L', (SW_B, SH), 0)
ImageDraw.Draw(outline).polygon([(dx, 0), (dx + SW_T, 0), (SW_B, SH), (0, SH)], fill=255)
rr = Image.new('L', (SW_B, SH), 0)                 # round both top corners of the trapezoid
dr = ImageDraw.Draw(rr); R_ = 22
dr.polygon([(dx, 0), (dx + SW_T, 0), (SW_B, SH), (0, SH)], fill=255)
for cx in (dx + R_, dx + SW_T - R_):
    dr.rectangle((cx - R_, 0, cx + R_, R_), fill=0)
    dr.ellipse((cx - R_, 0, cx + R_, 2 * R_), fill=255)
dr.rectangle((dx + R_, 0, dx + SW_T - R_, R_), fill=255)
# the warped alpha is used only on the right half, where it holds the pouch's true edge; the left edge is the fold
# between gusset and front, opaque in the mockup, so the trapezoid alone makes it
wa = wp[..., 3].copy(); wa[:, :SW_B // 2] = 255
al = np.minimum(np.minimum(np.asarray(outline), np.asarray(rr)).astype(np.float32), wa)
# the very foot of the warp repeats the mockup's last row: shade it as the base of a standing pouch
foot = np.clip((np.arange(SH)[:, None] - (SH - 26)) / 26, 0, 1)[..., None]
wp[..., :3] = wp[..., :3] * (1 - 0.55 * foot)
al = cv2.erode((al > 200).astype(np.uint8), np.ones((3, 3), np.uint8), iterations=2).astype(np.float32) * 255   # off the cream rim
al = cv2.GaussianBlur(al, (0, 0), 0.8)
Image.fromarray(np.dstack([np.clip(wp[..., :3], 0, 255), al]).astype(np.uint8)).save('cut/pouch-straight.png', optimize=True)
print('pouch-straight', (SW_B, SH))
