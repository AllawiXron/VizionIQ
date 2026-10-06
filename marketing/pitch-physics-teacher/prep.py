# prep.py <screenshot of his course ad> -> photo/teacher.png
# Cuts the teacher (and his dark study background) out of a phone screenshot of his own ad with a soft shaped mask,
# so no hard cutout edge: the old ad's text on the right is faded away, the room melts into the new navy background.
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src = Image.open(sys.argv[1]).convert('RGB')
im = src.crop((0, 230, 700, 1380))            # the photo part of the ad (screen px)
W, H = im.size
# keep-region polygon (crop px): narrow beside the old title and "2027", wider lower down where only the room is
poly = [(14, 40), (448, 40), (448, 520), (478, 540), (478, 715), (630, 735), (630, 930), (602, 945), (602, H), (14, H)]
m = Image.new('L', (W, H), 0)
ImageDraw.Draw(m).polygon(poly, fill=255)
m = m.filter(ImageFilter.GaussianBlur(14))
a = np.asarray(m).astype(np.float32) / 255
y = np.arange(H)[:, None] / H
x = np.arange(W)[None, :] / W
a *= np.clip((y - 0.0) / 0.10, 0, 1) ** 1.2              # top fade
a *= np.clip((1 - y) / 0.10, 0, 1)                       # bottom fade
a *= np.clip((x - 0.02) / 0.12, 0, 1) ** 0.8             # left fade (the old frame line)
# gentle grade toward the new palette: deeper blacks, cooler mids
rgb = np.asarray(im).astype(np.float32) / 255
rgb = np.clip((rgb - 0.03) * 1.08, 0, 1) ** 1.05
rgb[..., 2] = np.clip(rgb[..., 2] * 1.04 + 0.01, 0, 1)
out = np.dstack([rgb, a]) * 255
img = Image.fromarray(out.astype(np.uint8), 'RGBA')
img = img.resize((W * 2, H * 2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
img.save('photo/teacher.png')
print(img.size)
