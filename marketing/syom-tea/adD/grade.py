# Final pass over the whole ad (photo, tape and type together), like a Camera Raw export:
# a gentle S curve, warm highlights and green-cool shadows, and about 2.5 % monochrome grain.
#   python3 grade.py <in.png> <out.png>
import sys
import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32) / 255
l = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
curve = lambda x: x + 0.10 * np.sin(np.pi * (x - 0.5)) * (1 - np.abs(2 * x - 1)) * 0.9
a = curve(a)
hi = np.clip((l - 0.55) / 0.45, 0, 1)[..., None]
lo = np.clip((0.40 - l) / 0.40, 0, 1)[..., None]
a = a + hi * np.array([0.018, 0.008, -0.014]) + lo * np.array([-0.010, 0.006, 0.004])
rng = np.random.default_rng(11)
grain = rng.normal(0, 0.025, a.shape[:2]).astype(np.float32)
a = a + grain[..., None] * (0.6 + 0.4 * (1 - np.abs(2 * l - 1)))[..., None]
Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8)).save(dst, optimize=True)
