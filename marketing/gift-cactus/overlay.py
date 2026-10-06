# python overlay.py <in key-*.png> <out.png>: turn the #00ff00 photo slot transparent.
# Only strong chroma counts (the kit's own greens have g - max(r, b) < 60), so the cactus and gingham stay opaque.
import sys
import numpy as np
from PIL import Image
a = np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
spill = g - np.maximum(r, b)
T = 70.0
keyed = spill > T
alpha = np.where(keyed, np.clip(255 - (spill - T) * 255 / (255 - T), 0, 255), 255)
g2 = np.where(keyed, np.maximum(r, b), g)
Image.fromarray(np.dstack([r, g2, b, alpha]).astype(np.uint8), 'RGBA').save(sys.argv[2])
print(sys.argv[2], int((alpha < 10).mean() * 100), '% transparent,', int(((alpha > 10) & (alpha < 250)).mean() * 1000) / 10, '% partial')
