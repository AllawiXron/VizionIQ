"""Trims each prop render to its object (plus a margin for the page's drop shadow) and saves it to the reel's assets.
  python3 -I finish.py SRC DST [name ...]"""
import sys, os
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
names = sys.argv[3:] or sorted(f[:-4] for f in os.listdir(src) if f.endswith('.png') and not f.startswith('_'))
os.makedirs(dst, exist_ok=True)
for n in names:
    im = Image.open(os.path.join(src, n + '.png')).convert('RGBA')
    l, t, r, b = im.split()[3].point(lambda a: 255 if a > 6 else 0).getbbox()
    m = 8
    im = im.crop((max(0, l - m), max(0, t - m), min(im.width, r + m), min(im.height, b + m)))
    im.save(os.path.join(dst, n + '.png'), optimize=True)
    print(n, im.size)
