"""Grade over the whole frame, then the two exports with no metadata.
out/raw.png -> out/r6-unlock-all.png (lossless) and out/r6-unlock-all.jpg (YouTube takes thumbnails up to 2 MB)"""
import os
import numpy as np
from PIL import Image

im = np.asarray(Image.open('out/raw.png').convert('RGB')).astype(np.float32) / 255

# gentle S curve
s = im * im * (3 - 2 * im)
im = im + (s - im) * .3

# cool shadows, warm highlights
lum = im @ np.array([.2126, .7152, .0722], np.float32)
sh = np.clip(1 - lum / .35, 0, 1)[..., None]
hi = np.clip((lum - .6) / .4, 0, 1)[..., None]
im = im + sh * np.array([-.012, .004, .02]) + hi * np.array([.02, .008, -.018])

# a touch more colour where there is colour already (title, sparks, brass), not on the grey gear
g = lum[..., None]
sat = np.clip((im.max(2) - im.min(2))[..., None] * 3, 0, 1)
im = g + (im - g) * (1 + .14 * sat)

# mono grain, about 2.5 %
rng = np.random.default_rng(7)
im = im + rng.normal(0, .025, im.shape[:2]).astype(np.float32)[..., None]

out = Image.fromarray((np.clip(im, 0, 1) * 255 + .5).astype(np.uint8))
out.save('out/r6-unlock-all.png', optimize=True)
q = 93
while True:
    out.save('out/r6-unlock-all.jpg', quality=q, subsampling=0, optimize=True)
    if os.path.getsize('out/r6-unlock-all.jpg') < 1_950_000 or q <= 80:
        break
    q -= 2
print('jpg quality', q, os.path.getsize('out/r6-unlock-all.jpg') // 1024, 'KB')
