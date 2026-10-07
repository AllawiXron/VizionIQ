"""Pepsi: the 1990s-design can from source-pepsi-retro-can.jpg ("Pepsi Can Retro Design" by Ominae, CC BY-SA 3.0).
rembg finds the can roughly but fades its white/silver body, so its mask only seeds OpenCV GrabCut (sure / probable
foreground), which separates the bright can from the dark room by colour. Holes are filled (the dark blue lettering),
the edge is feathered by a pixel, and the colours come straight from the photo.
python retro_can.py ../img/pepsi-retro-can.png"""
import sys
import cv2
import numpy as np
from PIL import Image
from rembg import remove, new_session
from scipy import ndimage as ndi

BOX = (560, 180, 2600, 3700)
src = Image.open('source-pepsi-retro-can.jpg').convert('RGB').crop(BOX)
al = np.asarray(remove(src, session=new_session('isnet-general-use')))[..., 3].astype(np.float32) / 255
s = 0.5                                                      # GrabCut at half size, mask scaled back up
small = cv2.resize(np.asarray(src)[..., ::-1], None, fx=s, fy=s, interpolation=cv2.INTER_AREA)
a = cv2.resize(al, (small.shape[1], small.shape[0]), interpolation=cv2.INTER_AREA)
seed = ndi.binary_fill_holes(a > 0.03)
gc = np.full(a.shape, cv2.GC_PR_BGD, np.uint8)
gc[seed] = cv2.GC_PR_FGD
gc[ndi.binary_erosion(seed, iterations=40)] = cv2.GC_FGD    # deep inside the rough shape: surely can
gc[~ndi.binary_dilation(seed, iterations=25)] = cv2.GC_BGD  # well outside it: surely room
bgm, fgm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
cv2.grabCut(small, gc, None, bgm, fgm, 6, cv2.GC_INIT_WITH_MASK)
m = (gc == cv2.GC_FGD) | (gc == cv2.GC_PR_FGD)
m = ndi.binary_fill_holes(m)
lab, n = ndi.label(m)
m = lab == (np.argmax(np.bincount(lab.ravel())[1:]) + 1)
m = ndi.binary_opening(m, iterations=2)
m = cv2.resize(m.astype(np.float32), src.size, interpolation=cv2.INTER_LINEAR) > 0.5
# the lid sits against a bright cream wall, so neither matte gets the top right: above y=600 the outline is traced by
# hand from the photo (lid edge and both shoulders) and joined to GrabCut's body edges at y=600
from PIL import ImageDraw
J = 760
rows = [np.nonzero(m[y])[0] for y in range(J, J + 300, 10)]       # body edges just below the join, where GrabCut is clean
l0 = int(np.median([r.min() for r in rows if len(r)])); r0 = int(np.median([r.max() for r in rows if len(r)]))
top = [(l0, J + 20), (l0, J), (66, 690), (72, 640), (75, 602), (95, 522), (120, 442), (150, 362), (190, 282), (238, 212), (252, 196),
       (258, 100), (272, 86), (1774, 88), (1790, 100), (1786, 196), (1792, 206), (1810, 282), (1840, 362), (1868, 442),
       (1900, 522), (1940, 602), (1952, 640), (1960, 690), (r0, J), (r0, J + 20)]
poly = Image.new('L', src.size, 0)
ImageDraw.Draw(poly).polygon(top, fill=255)
m[:J] = False
m |= np.asarray(poly) > 0
m = ndi.binary_fill_holes(m)
# base: GrabCut picks up bits of the dark reflection under the can, so cut the bottom to a smooth curve fitted to it
cols = np.nonzero(m.any(0))[0]
cx = cols[len(cols) // 6: -len(cols) // 6]                      # the middle two thirds of the base
by = np.array([np.nonzero(m[:, x])[0].max() for x in cx])
med = ndi.median_filter(by, 151)
coef = np.polyfit(cx, med, 2)
yy = np.arange(m.shape[0])[:, None]
xx = np.arange(m.shape[1])[None, :]
m &= yy <= (np.polyval(coef, xx) - 6)
m = m.astype(np.float32)
alpha = np.clip(ndi.gaussian_filter(m, 1.4) * 1.1 - 0.05, 0, 1)
rgb = np.asarray(src).astype(np.float32) / 255
rgb = np.clip((rgb - 0.5) * 1.06 + 0.5 + 0.01, 0, 1)
im = Image.fromarray((np.dstack([rgb, alpha]) * 255).round().astype(np.uint8), 'RGBA')
print('bbox', im.getbbox(), 'l0 r0', l0, r0)
im.crop(im.getbbox()).save(sys.argv[1])
