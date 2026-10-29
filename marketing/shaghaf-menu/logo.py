# Lifts her logo off the wall in her tiramisu photo (no logo file yet): python3 -I logo.py <photo> <out.png>
import sys
import numpy as np
from PIL import Image, ImageFilter

im = Image.open(sys.argv[1]).convert('RGB').crop((610, 70, 990, 340))
im = im.resize((im.width * 3, im.height * 3), Image.LANCZOS)
L = np.asarray(im.convert('L')).astype(float)
bg = np.asarray(im.convert('L').filter(ImageFilter.GaussianBlur(40))).astype(float)
a = np.clip((bg - L - 12) * 12, 0, 255)
a[:, int(a.shape[1] * 0.84):] = 0  # wall shadow streaks to the right of the logo
alpha = Image.fromarray(a.astype('uint8')).filter(ImageFilter.GaussianBlur(0.8))
ink = Image.new('RGB', im.size, (98, 64, 44))
ink.putalpha(alpha)
ink.crop(alpha.point(lambda v: 255 if v > 40 else 0).getbbox()).save(sys.argv[2])
