"""Lightens the shadow catcher's shadows a little (the room isn't pitch dark outside the sunlight) and saves the still
at the post's size.  python3 -I props/finish.py renders/still.png assets/still.png"""
import sys
import numpy as np
from PIL import Image
im = np.asarray(Image.open(sys.argv[1]).convert('RGBA')).astype(np.float32)
shadow = im[..., :3].max(axis=2) < 10           # the catcher writes pure black with the shadow in alpha
im[..., 3] = np.where(shadow, im[..., 3] * 0.8, im[..., 3])
out = Image.fromarray(im.clip(0, 255).astype(np.uint8), 'RGBA').resize((1080, 1350), Image.LANCZOS)
out.save(sys.argv[2], optimize=True)
print(out.size)
