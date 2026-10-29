# The table cloth under every dessert: Poly Haven's Hessian 380 scan (CC0), lifted to a light linen in the logo's
# beige so the brown type reads on it. python3 -I cloth.py -> art/cloth.jpg, art/cloth-dark.jpg (1080x1920)
import os
import numpy as np
from PIL import Image

here = os.path.dirname(os.path.abspath(__file__))
im = Image.open(os.path.join(here, 'tex/hessian_380_diff_4k.jpg')).convert('L')
im = im.crop((300, 0, 300 + 2304, 4096)).resize((1080, 1920), Image.LANCZOS)
L = np.asarray(im).astype(float)
d = (L - L.mean()) / L.std()                      # the weave, without the scan's own colour
for name, base, depth in [
    ('cloth', [236, 225, 209], [9.5, 10, 11]),        # light linen, close to the wall behind her logo
    ('cloth-dark', [58, 37, 26], [7, 5.5, 4.5]),      # the same cloth in cocoa brown
]:
    out = np.array(base, float)[None, None, :] + d[..., None] * np.array(depth)
    Image.fromarray(np.clip(out, 0, 255).astype('uint8')).save(os.path.join(here, 'art', name + '.jpg'), quality=94)
