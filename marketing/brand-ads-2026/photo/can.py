"""Pepsi: the can from source-pepsi-can.jpg ("Pepsi Can" by Michael Thomas, CC BY 2.0) cut out with rembg
(isnet-general-use), with a little extra contrast and a cool rim so it sits on the blue.  python can.py ../img/pepsi-can.png"""
import sys
import numpy as np
from PIL import Image
from rembg import remove, new_session

im = Image.open('source-pepsi-can.jpg').convert('RGB')
cut = remove(im, session=new_session('isnet-general-use'))
cut = cut.crop(cut.getbbox())
a = np.asarray(cut).astype(np.float32) / 255
rgb, al = a[..., :3], a[..., 3]
rgb = np.clip((rgb - 0.5) * 1.08 + 0.5, 0, 1)
al = np.where(al < 0.06, 0, al)
Image.fromarray((np.dstack([rgb, al]) * 255).round().astype(np.uint8), 'RGBA').save(sys.argv[1])
print(cut.size)
