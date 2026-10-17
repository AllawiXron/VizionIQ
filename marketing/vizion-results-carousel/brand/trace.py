"""Traces the user's viZion logo (brand/vizion-logo.jpg, blue VZ with a yellow arrow on black) into SVG paths:
the whole mark as one shape (for the one-colour uses), and its blue and yellow parts apart.
  python3 -I brand/trace.py > brand/vizion-mark.json"""
import json, sys, os
import numpy as np
from PIL import Image, ImageFilter
import potrace

here = os.path.dirname(os.path.abspath(__file__))
im = Image.open(os.path.join(here, 'vizion-logo.jpg')).convert('RGB').filter(ImageFilter.MedianFilter(5))
a = np.asarray(im).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
masks = {
    'all': np.maximum(np.maximum(r, g), b) > 70,
    'blue': (b > 120) & (b > r + 60),
    'yellow': (r > 120) & (g > 90) & (b < 110) & (r > b + 60),
}


def path_d(mask):
    bm = potrace.Bitmap(~mask)   # potracer traces the False pixels
    pl = bm.trace(turdsize=40, alphamax=1.0, opticurve=True, opttolerance=0.2)
    out = []
    for c in pl:
        P = lambda p: f'{p.x:.1f} {p.y:.1f}'
        d = ['M' + P(c.start_point)]
        for s in c.segments:
            if s.is_corner:
                d.append('L' + P(s.c) + 'L' + P(s.end_point))
            else:
                d.append('C' + P(s.c1) + ' ' + P(s.c2) + ' ' + P(s.end_point))
        out.append(''.join(d) + 'Z')
    return ''.join(out)


ys, xs = np.nonzero(masks['all'])
box = [int(xs.min()), int(ys.min()), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)]
json.dump({'viewBox': box, **{k: path_d(m) for k, m in masks.items()}}, sys.stdout)
