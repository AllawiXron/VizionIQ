"""Traces Al-Faqma's 320 px profile logo into img/logo.svg so it stays crisp at any size.

The orange ring is redrawn as a perfect circle (centre and radii measured from the orange pixels); the black
calligraphy is traced with potrace after an opening that removes the ring's thin outline. A white disc sits
behind it, as on their Instagram avatar.

Usage: python trace_logo.py <logo.jpg> <out.svg>   (pip install potracer scipy pillow numpy)
"""
import sys

import numpy as np
import potrace
from PIL import Image
from scipy import ndimage as ndi

K = 8
im = Image.open(sys.argv[1]).convert("RGB")
big = np.asarray(im.resize((im.width * K, im.height * K), Image.LANCZOS)).astype(np.float32)
r, g, b = big[..., 0], big[..., 1], big[..., 2]
orange = (r > 170) & (g > 50) & (g < 160) & (b < 110) & (r - b > 90)
ys, xs = np.nonzero(orange)
cx, cy = xs.mean() / K, ys.mean() / K
d = np.hypot(xs / K - cx, ys / K - cy)
r_in, r_out = np.percentile(d, 2), np.percentile(d, 98)
black = ndi.binary_opening((r < 110) & (g < 110) & (b < 110), structure=np.ones((3, 3)), iterations=10)
path = potrace.Bitmap(~black).trace(turdsize=60, alphamax=1.1, opticurve=True, opttolerance=0.3)
parts = []
for curve in path:
    seg = [f"M{curve.start_point.x / K:.2f},{curve.start_point.y / K:.2f}"]
    for s in curve.segments:
        if s.is_corner:
            seg.append(f"L{s.c.x / K:.2f},{s.c.y / K:.2f}L{s.end_point.x / K:.2f},{s.end_point.y / K:.2f}")
        else:
            seg.append(f"C{s.c1.x / K:.2f},{s.c1.y / K:.2f} {s.c2.x / K:.2f},{s.c2.y / K:.2f} {s.end_point.x / K:.2f},{s.end_point.y / K:.2f}")
    parts.append("".join(seg) + "Z")
pad = r_out + 16
open(sys.argv[2], "w").write(f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{cx - pad:.1f} {cy - pad:.1f} {2 * pad:.1f} {2 * pad:.1f}">
  <circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r_out + 14:.2f}" fill="#ffffff"/>
  <circle cx="{cx:.2f}" cy="{cy:.2f}" r="{(r_in + r_out) / 2:.2f}" fill="none" stroke="#eb6424" stroke-width="{r_out - r_in:.2f}"/>
  <circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r_in:.2f}" fill="none" stroke="#6b3216" stroke-width="0.9"/>
  <circle cx="{cx:.2f}" cy="{cy:.2f}" r="{r_out:.2f}" fill="none" stroke="#6b3216" stroke-width="0.9"/>
  <path d="{"".join(parts)}" fill="#1c1b17" fill-rule="evenodd"/>
</svg>''')
