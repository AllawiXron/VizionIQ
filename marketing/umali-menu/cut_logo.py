# Cuts the chef logo off its white background: fills the white connected to the edges and the hole of the OK sign.
import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
a = np.asarray(im).astype(int)
W, H = im.size
m = Image.fromarray(((a.min(2) > 236) * 255).astype('uint8')).copy()
seeds = [(0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1), (W // 2, H - 1), (0, H // 2)]
seeds += [(x, y) for y in range(280, 360, 4) for x in range(150, 260, 4) if a[y, x].min() > 240]
for s in seeds:
    if m.getpixel(s) != 255:
        continue
    t = m.copy()
    ImageDraw.floodfill(t, s, 128)
    # only real background: the shine on the fingertips is white too but small
    if s in seeds[:6] or (np.asarray(t) == 128).sum() - (np.asarray(m) == 128).sum() > 600:
        m = t
bg = np.asarray(m) == 128
alpha = Image.fromarray(((~bg) * 255).astype('uint8')).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(.7))
# the cut edge takes the colour of the outline next to it, so no white fringe is left
rgb = a.copy()
dark = np.asarray(im.filter(ImageFilter.MinFilter(5))).astype(int)
al = np.asarray(alpha)
edge = (al < 255) & (al > 0) | (np.asarray(Image.fromarray(((~bg) * 255).astype('uint8')).filter(ImageFilter.MinFilter(5))) == 0) & (al > 0)
rgb[edge] = dark[edge]
out = Image.fromarray(rgb.astype('uint8'))
out.putalpha(alpha)
out.save(dst)
