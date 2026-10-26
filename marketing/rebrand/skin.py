"""python3 skin.py: img/skin.png, a fill for type: the chameleon's new orange on the left and its old sage green on the
right, as on the animal, meeting along a ragged edge, with the scales of its flank printed into both."""
import numpy as np
from PIL import Image, ImageFilter, ImageOps

W, H = 1100, 520
src = Image.open('img/chameleon-2-src.jpg').convert('RGB')
scales = ImageOps.grayscale(src.crop((1140, 840, 1740, 1320))).resize((W, H), Image.LANCZOS)
s = np.asarray(ImageOps.autocontrast(scales, cutoff=2), np.float32) / 255
s = 0.62 + 0.5 * (s - 0.5)                                    # the scales as a gentle light and dark pattern
rng = np.random.default_rng(9)
noise = np.asarray(Image.fromarray((rng.random((H // 10, W // 10)) * 255).astype(np.uint8)).resize((W, H), Image.BICUBIC)
                   .filter(ImageFilter.GaussianBlur(5)), np.float32) / 255
x = np.linspace(0, 1, W)[None, :]
t = np.clip((x - 0.45 + (noise - 0.5) * 0.3) / 0.03, 0, 1)[..., None]
sage, orange = np.array([150, 170, 140]), np.array([238, 112, 46])
fill = (orange * (1 - t) + sage * t) * (s[..., None] * 1.25)          # orange on the left like the head, green on the right like the tail
Image.fromarray(np.clip(fill, 0, 255).astype(np.uint8)).save('img/skin.png')
