"""Feathers the edges of the tea render (the shadow catcher's shadow must fade out, not stop at the frame), then trims it.
  python3 -I props/finish.py renders/tea-raw.png assets/tea.png"""
import sys
import numpy as np
from PIL import Image
im = np.asarray(Image.open(sys.argv[1]).convert('RGBA')).astype(np.float32)
h, w = im.shape[:2]
y, x = np.mgrid[0:h, 0:w]
d = np.minimum(np.minimum(x, w - 1 - x), np.minimum(y, h - 1 - y)).astype(np.float32)
im[..., 3] *= np.clip(d / 140, 0, 1) ** 1.5
out = Image.fromarray(im.clip(0, 255).astype(np.uint8), 'RGBA')
out = out.crop(out.split()[3].point(lambda a: 255 if a > 2 else 0).getbbox())
out.save(sys.argv[2], optimize=True)
print(out.size)
