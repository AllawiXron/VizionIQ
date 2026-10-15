"""Joins each prop's shadow pass and object pass at a lighter, common shadow strength, and trims the PNG.
  python3 -I finish.py SRC DST name ..."""
import sys, os
import numpy as np
from PIL import Image
src, dst = sys.argv[1], sys.argv[2]
K = {'mug': 0.5}
for n in sys.argv[3:]:
    sh = np.asarray(Image.open(os.path.join(src, n + '.shadow.png')).convert('RGBA')).astype(np.float32) / 255
    ob = Image.open(os.path.join(src, n + '.obj.png')).convert('RGBA')
    a = sh[..., 3]
    a = np.clip((a - 0.025) / 0.975, 0, 1) * K.get(n, 0.62)
    shadow = np.zeros(sh.shape, np.float32)
    shadow[..., :3] = (0.09, 0.055, 0.03)   # a warm shadow, not grey
    shadow[..., 3] = a
    im = Image.fromarray((shadow * 255).astype(np.uint8), 'RGBA')
    im.alpha_composite(ob)
    im.save(os.path.join(dst, n + '.png'), optimize=True)
    print(n, im.size)
