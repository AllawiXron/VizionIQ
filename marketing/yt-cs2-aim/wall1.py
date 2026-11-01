"""Thumbnail 1: 30 bullets, 1 hole. Writes out/raw.png (1920x1080); finish.py grades it.
- Wall: the upper right of a photo of a concrete panel wall full of bullet holes (src/concrete-wall-holes.jpg). Every
  hole is found (dark against the concrete around it), filled from the concrete around it at quarter size, and the
  grain is put back from a clean part of the same wall, so the panels, joints and rain streaks stay real.
- The one hole: a single crater cut from the same photo and set back on the clean wall, right of the words.
- Words: stencilled on the wall like spray paint (Big Shoulders Stencil Display): the paint takes the wall's texture,
  the edges are a little soft and there is a faint overspray round them.
- Watermark: visuals.gg as a red spray tag in the top right corner, the way a CS2 graffiti sits on a wall.
- The AK-47 Point Disarray (img/ak.png, from prep.py) across the bottom, cropped by both edges, casting its shadow
  on the wall.
python wall1.py   (Pillow, numpy, scipy, OpenCV)"""
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi

W, H = 1920, 1080
X0, Y0, CW = 4480, 120, 2528                 # the crop of the photo that becomes the wall (16:9)
HOLE_SRC = (5788, 3260)                    # the crater that stays, in photo px
HOLE_AT, HOLE_SCALE = (1452, 352), 1.25    # where it goes on the frame, and its size there

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def save(a, p):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p)

photo = Image.open('src/concrete-wall-holes.jpg').convert('RGB')
CH = round(CW * 9 / 16)
wall = arr(photo.crop((X0, Y0, X0 + CW, Y0 + CH)).resize((W, H), Image.LANCZOS))
crater = arr(photo.crop((HOLE_SRC[0] - 170, HOLE_SRC[1] - 170, HOLE_SRC[0] + 170, HOLE_SRC[1] + 170)))

# 1. find the holes: dark against the concrete around them, grown to take in the crushed rim
lum = wall.mean(2)
holes = (lum < blur(lum, 25) - .08) | (blur(lum, 3) < blur(lum, 45) - .045)    # the craters, and the soot round them
holes = ndi.binary_opening(holes, iterations=1)
lab, n = ndi.label(holes)
sizes = ndi.sum(holes, lab, range(1, n + 1))
holes = np.isin(lab, 1 + np.nonzero(sizes > 40)[0])           # holes, not joints or grain
holes = ndi.binary_dilation(holes, iterations=11)

# 2. fill them from the concrete around, at quarter size, then bring the grain back from a clean part of the wall
q = (W // 4, H // 4)
small = cv2.resize((wall * 255).astype(np.uint8), q, interpolation=cv2.INTER_AREA)
hs = cv2.resize(holes.astype(np.uint8) * 255, q, interpolation=cv2.INTER_NEAREST)
hs = cv2.dilate(hs, np.ones((3, 3), np.uint8))
fill = arr(cv2.resize(cv2.inpaint(small, hs, 12, cv2.INPAINT_TELEA), (W, H), interpolation=cv2.INTER_CUBIC))
hf = wall - blur(wall, 3)
grain = np.zeros_like(wall)
for dx, dy in ((320, 0), (-410, 60), (180, -240), (-260, -180)):
    sh_hf = np.roll(hf, (dy, dx), (0, 1)); sh_h = np.roll(holes, (dy, dx), (0, 1))
    take = (~sh_h) & (np.abs(grain).sum(2) == 0)
    grain[take] = sh_hf[take]
m = blur(holes.astype(np.float32), 3)[..., None]
clean = wall * (1 - m) + np.clip(blur(fill, 2) + grain, 0, 1) * m

# 3. the one hole, back on the clean wall
cs = round(340 * HOLE_SCALE * W / CW)
cr = cv2.resize(crater, (cs, cs), interpolation=cv2.INTER_CUBIC)
cr = np.clip(cr + .4 * (cr - blur(cr, 1.2)), 0, 1)
yy, xx = np.mgrid[:cs, :cs].astype(np.float32)
d = np.hypot(xx - cs / 2, yy - cs / 2) / (cs / 2)
cm = np.clip((1 - d) / .35, 0, 1) ** 1.5
x0, y0 = HOLE_AT[0] - cs // 2, HOLE_AT[1] - cs // 2
reg = clean[y0:y0 + cs, x0:x0 + cs]
cr = cr - cr.mean((0, 1)) * (1 - cm[..., None]) * 0 + (reg.mean((0, 1)) - cr[cm < .3].mean(0)) * (1 - cm[..., None])
reg[:] = reg * (1 - cm[..., None]) + cr * cm[..., None]

# light: a little brighter top left, falling off toward the bottom right
yy, xx = np.mgrid[:H, :W].astype(np.float32)
fall = 1.06 - .2 * np.clip((xx / W) * .5 + (yy / H) * .7, 0, 1)
img = np.clip(clean * fall[..., None], 0, 1)

# 4. spray paint
rng = np.random.default_rng(9)
def text_mask(txt, font, size, x, y, weight=None, rot=0):
    f = ImageFont.truetype(font, size * 2)
    if weight:
        f.set_variation_by_axes([weight])
    bb = f.getbbox(txt)
    im = Image.new('L', (W * 2, H * 2), 0)
    ImageDraw.Draw(im).text((x * 2 - bb[0], y * 2 - bb[1]), txt, font=f, fill=255)
    if rot:
        im = im.rotate(rot, resample=Image.BICUBIC, center=(x * 2, y * 2))
    return arr(im.resize((W, H), Image.LANCZOS))

def spray(img, mask, colour, strength=.92, over=.18):
    noise = blur(rng.normal(0, 1, (H, W)).astype(np.float32), 1.2)
    a = blur(mask, .8) * np.clip(strength + .08 * noise, 0, 1)
    halo = np.clip(blur(mask, 7) - mask, 0, 1) * over * np.clip(.6 + .8 * rng.random((H, W)), 0, 1)
    a = np.clip(a + halo, 0, 1)[..., None]
    tex = img.mean(2, keepdims=True) / max(img.mean(), 1e-3)          # the wall's texture shows through the paint
    paint = np.clip(np.array(colour) * (.85 + .15 * tex), 0, 1)
    return img * (1 - a) + paint * a

STENCIL = 'fonts/BigShouldersStencilDisplay-VF.ttf'
img = spray(img, text_mask('30 BULLETS', STENCIL, 118, 74, 70, 800), (.07, .07, .075))
img = spray(img, text_mask('1 HOLE', STENCIL, 380, 60, 200, 900), (.07, .07, .075))
img = spray(img, text_mask('visuals.gg', 'fonts/PermanentMarker-Regular.ttf', 62, 1500, 40, rot=6), (.86, .1, .08), .9, .25)

# 5. the gun across the bottom, with its shadow on the wall
ak = Image.open('img/ak.png')
gw = 2150
ak = ak.resize((gw, round(ak.height * gw / ak.width)), Image.LANCZOS).rotate(3, resample=Image.BICUBIC, expand=True)
g = arr(ak)
gx, gy = (W - g.shape[1]) // 2 + 30, 650
layer = np.zeros((H, W, 4), np.float32)
sy0, sx0 = max(0, -gy), max(0, -gx)
ty0, tx0 = max(0, gy), max(0, gx)
h_ = min(H - ty0, g.shape[0] - sy0); w_ = min(W - tx0, g.shape[1] - sx0)
layer[ty0:ty0 + h_, tx0:tx0 + w_] = g[sy0:sy0 + h_, sx0:sx0 + w_]
ga = layer[..., 3]
shadow = blur(ndi.shift(ga, (46, 34), order=1), 22) * .5
img = img * (1 - shadow[..., None] * .9)
img = img * (1 - ga[..., None]) + layer[..., :3] * ga[..., None]
save(img, 'out/raw.png')
print('wall holes filled:', int(sizes.size), 'crater', cs, 'px')
