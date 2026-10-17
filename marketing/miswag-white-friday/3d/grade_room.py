"""Grade for the room render: lift the shade towards warm white (it's White Friday), keep the sunlit stars bright,
then pull the ribbon to Miswag red with grade_gift's rule. Usage: python grade_room.py in.png out.png"""
import os
import subprocess
import sys

import numpy as np
from PIL import Image

src, dst = sys.argv[1], sys.argv[2]
a = np.asarray(Image.open(src).convert("RGB")).astype(np.float32) / 255
lift = 1 - (1 - a) ** 1.45  # opens the mids and shade, leaves the highlights
lift *= np.array([1.015, 1.0, 0.975])  # a touch warmer
out = np.clip(a * 0.35 + lift * 0.65, 0, 1)
tmp = dst + ".tmp.png"
Image.fromarray((out * 255).round().astype(np.uint8)).convert("RGBA").save(tmp)
subprocess.run([sys.executable, os.path.join(os.path.dirname(__file__), "grade_gift.py"), tmp, dst], check=True)
os.remove(tmp)
Image.open(dst).convert("RGB").save(dst)
