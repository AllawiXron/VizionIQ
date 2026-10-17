"""Asiacell reel: the same bulb as bulb.py (same crop and cut-out), kept switched ON, for the reel's lit room.
Warm filament, warm glass, alpha kept a little higher than the off version so the lit glass reads solid.
Also saves the plain crop (the photo as shot) for the reel's "real photo" layer.
python bulb_on.py ../img/bulb-on.png ../img/bulb-photo.jpg"""
import sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

src = Image.open('source-bulb.jpg').convert('RGB').crop((560, 820, 1040, 1400))
src.save(sys.argv[2], quality=92)
cut = remove(src, session=new_session('isnet-general-use'))
a = np.asarray(cut).astype(np.float32) / 255
rgb, al = a[..., :3], a[..., 3]
L = rgb @ np.array([0.2126, 0.7152, 0.0722])
rgb = rgb * np.array([1.06, 0.98, 0.84])                     # warmer tungsten
hot = np.clip((L - 0.78) / 0.18, 0, 1)[..., None]             # filament: push towards a hot, near-white amber
rgb = rgb * (1 - hot) + np.array([1.0, 0.93, 0.74]) * hot
rgb = np.clip(rgb * 1.04, 0, 1)
al = al * np.clip(0.55 + 0.8 * L, 0, 1)
Image.fromarray((np.dstack([rgb, al]) * 255).round().astype(np.uint8), 'RGBA').save(sys.argv[1])
