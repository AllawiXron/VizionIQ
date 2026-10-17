"""photo/burger-bad.jpg: the same burger photo the way a rushed ad uses it: stretched sideways to fill the frame,
dark and flat, blown up from a small copy (blocky) and saved at low JPEG quality."""
import io

import numpy as np
from PIL import Image, ImageEnhance

im = Image.open("burger.jpg").convert("RGB")
w, h = im.size
im = im.resize((int(w * 1.7), h))                      # stretched sideways: the burger goes fat
cx = int(370 * 1.7)                                   # keep the burger and fries in frame
im = im.crop((cx - w // 2, 0, cx - w // 2 + w, h))
im = ImageEnhance.Brightness(im).enhance(0.8)        # underexposed
im = ImageEnhance.Contrast(im).enhance(0.72)          # flat
im = ImageEnhance.Color(im).enhance(0.7)
a = np.asarray(im).astype(np.float32)
a[..., 2] *= 1.08                                     # a cold, phone-at-night cast
a[..., 0] *= 0.94
im = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
im = im.resize((w // 7, h // 7), Image.BILINEAR).resize((w, h), Image.NEAREST)  # blocky
buf = io.BytesIO()
im.save(buf, "JPEG", quality=8)
Image.open(buf).save("burger-bad.jpg", quality=92)
