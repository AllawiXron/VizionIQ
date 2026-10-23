"""The magician's fan: five operator cards from the operators screen, fanned out of the operator's raised hand.
Writes img/operator.jpg (the art at frame size), img/operator-cut.png (him alone) and img/fan.png (the cards with his hand back on top of them).
- Cards: cut from src/operators-unlocked.jpg (110 x 183 px each there), scaled to 420 px tall and sharpened, thin dark
  edge, small rounded corners like a printed card.
- Fan: pivoted in his palm, -22° to +68°, the cards starting just above the palm so the spread at face height is
  about one face wide and every operator shows; the right-hand card on top; each card shades the one under it.
- Hand: his raised hand cut from the art (rembg mask, src/operator-mask.png) and laid back over the cards, so the
  fingers hold them, with its shadow on the cards.
python fan.py   (Pillow, numpy, scipy, OpenCV)"""
import cv2
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage as ndi

W, H = 1920, 1080
S = W / 2000
PIVOT = (1418, 600)            # in his palm, frame px
CH = 420                       # card height on the frame

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def save(a, p, **kw):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p, **kw)

art = Image.open('src/operator.jpg').convert('RGB').resize((W, H), Image.LANCZOS)
bg = arr(art)
bg = np.clip(bg + .4 * (bg - blur(bg, 1.2)), 0, 1)
save(bg, 'img/operator.jpg', quality=94)
mask = arr(Image.open('src/operator-mask.png').convert('L').resize((W, H), Image.LANCZOS))
save(np.dstack([bg, mask]), 'img/operator-cut.png')      # him alone, in front of the title

shot = Image.open('src/operators-unlocked.jpg').convert('RGB')
cols = [43 + 119.8 * i for i in range(11)]
rows = [303, 497, 691]
pick = [(0, 0), (1, 7), (2, 2), (0, 9), (2, 6)]
cw = round(CH * 110 / 183)

def card(r, c):
    x, y = round(cols[c]), rows[r]
    im = arr(shot.crop((x, y, x + 110, y + 183)).resize((cw, CH), Image.LANCZOS))
    im = np.clip(im + .6 * (im - blur(im, 1.2)), 0, 1)
    m = Image.new('L', (cw, CH), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, cw - 1, CH - 1), radius=9, fill=255)
    a = arr(m)
    edge = a - ndi.grey_erosion(a, size=(5, 5))
    im = im * (1 - .7 * edge[..., None])
    im *= np.linspace(1.0, .78, CH)[:, None, None]          # a little darker toward his hand
    return im, a

out = np.zeros((H, W, 3), np.float32); oa = np.zeros((H, W), np.float32)

def over(rgb, a):
    global out, oa
    na = a + oa * (1 - a)
    out = (rgb * a[..., None] + out * (oa * (1 - a))[..., None]) / np.maximum(na[..., None], 1e-5)
    oa = na

angles = np.linspace(-22, 68, len(pick))
for k, ((r, c), ang) in enumerate(zip(pick, angles)):
    im, a = card(r, c)
    # the card's bottom centre sits 30 px above the pivot, then the whole card turns about the pivot
    T = np.float32([[1, 0, PIVOT[0] - cw / 2], [0, 1, PIVOT[1] - 30 - CH]])
    R = cv2.getRotationMatrix2D(PIVOT, -ang, 1.0)
    M = (np.vstack([R, [0, 0, 1]]) @ np.vstack([T, [0, 0, 1]]))[:2]
    rgb = cv2.warpAffine(im, M, (W, H), flags=cv2.INTER_LINEAR)
    al = cv2.warpAffine(a, M, (W, H), flags=cv2.INTER_LINEAR)
    sh = blur(ndi.shift(al, (6, -8), order=1), 7) * .45       # on the card under it, and on the wall behind the fan
    over(np.zeros((H, W, 3), np.float32) + .02, sh)
    over(rgb, al)

# his hand back on top: the cut-out inside a box round the raised hand (not the other hand or the disc)
yy, xx = np.mgrid[:H, :W].astype(np.float32)
box = ((xx > 1360 * S) & (xx < 1650 * S) & (yy > 290 * S) & (yy < 760 * S)).astype(np.float32)
hand = mask * blur(box, 3)
hs = blur(ndi.shift(hand, (16, 12), order=1), 12) * .55 * (1 - hand)
out = out * (1 - hs[..., None] * (oa > 0)[..., None])
over(bg, hand * (oa > .01))
save(np.dstack([out, oa]), 'img/fan.png')
print('cards', len(pick), 'card', cw, 'x', CH)
