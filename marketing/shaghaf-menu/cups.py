# Splits my cut-out of her four cups into one PNG per cup, at the angle they sit in her photo: python3 -I cups.py
# Her photo cuts off the lotus on the left and the khashkhash on the right; those cut sides go against the story edges.
import os
import numpy as np
from PIL import Image
from skimage.measure import label, regionprops

here = os.path.dirname(os.path.abspath(__file__))
im = Image.open(os.path.join(here, 'art/cups-cut.png')).convert('RGBA')
a = np.asarray(im)
lab = label(a[..., 3] > 40)
cups = sorted(regionprops(lab), key=lambda r: -r.area)[:4]
# top, left, right and bottom of her diamond
by = {
    'tiramisu': min(cups, key=lambda r: r.centroid[0]),
    'chocolate': max(cups, key=lambda r: r.centroid[0]),
    'lotus': min(cups, key=lambda r: r.centroid[1]),
    'khashkhash': max(cups, key=lambda r: r.centroid[1]),
}
for name, r in by.items():
    one = a.copy()
    one[lab != r.label, 3] = 0
    y0, x0, y1, x1 = r.bbox
    cup = Image.fromarray(one).crop((max(x0 - 40, 0), max(y0 - 40, 0), x1 + 40, y1 + 40))
    out = cup.crop(cup.getbbox())
    Image.frombytes('RGBA', out.size, out.tobytes()).save(os.path.join(here, f'art/cup-{name}.png'), optimize=True)
    print(name, out.size)
