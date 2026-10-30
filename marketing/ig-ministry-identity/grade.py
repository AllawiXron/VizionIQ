"""python3 grade.py <dir>: one grade over each slide in dir, the same for all ten so the photos, renders and type
share one look: a gentle S curve, warm highlights and cool shadows, and a light mono grain (about 2.5 %)."""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

rng = np.random.default_rng(7)
for f in sorted(Path(sys.argv[1]).glob('slide-*.png')):
    a = np.asarray(Image.open(f).convert('RGB')).astype(np.float32) / 255
    a = a - 0.0096 * np.sin(2 * np.pi * a)  # soft S around the mid grey
    lum = a @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    hi, lo = np.clip((lum - 0.55) / 0.45, 0, 1)[..., None], np.clip((0.45 - lum) / 0.45, 0, 1)[..., None]
    a = a + hi * np.array([0.018, 0.008, -0.014]) + lo * np.array([-0.012, 0.0, 0.016])
    g = rng.normal(0, 1, lum.shape).astype(np.float32)
    g = (g + np.roll(g, 1, 0) + np.roll(g, 1, 1)) / 3 * 0.0425
    a = np.clip(a + g[..., None] * (0.35 + 0.65 * (1 - np.abs(lum - 0.5) * 2))[..., None], 0, 1)
    Image.fromarray((a * 255 + 0.5).astype(np.uint8)).save(f)
