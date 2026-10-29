# Crops of her photos (square, the cups photo kept whole), all with one grade so they sit together: python3 -I photos.py <her photos dir>
# Each crop stays clear of the price labels she printed on some of them.
import sys, os, glob
import numpy as np
from PIL import Image

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'art/photos')
CROPS = [  # name, photo, box in pixels
    ('basbousa',       '866203917', (0, 460, 1242, 1702)),
    ('honeycomb-mix',  '871361891', (0, 150, 1080, 1230)),
    ('honeycomb',      '863861604', (0, 490, 1290, 1780)),
    ('cinnabon',       '859144057', (0, 170, 1086, 1256)),
    ('cake',           '867588736', (0, 300, 1242, 1542)),
    ('marble-cake',    '862425682', (0, 575, 1290, 1865)),
]

def grade(im):
    a = np.asarray(im).astype(float) / 255
    lum = a @ [.299, .587, .114]
    a = a * (0.50 / max(lum.mean(), .2)) ** .35                     # bring every photo nearer one exposure
    a = np.clip(a, 0, 1)
    a = a + .10 * (a - a ** 2) * (2 * a - 1) * -1 + .06 * np.sin(np.pi * a) * (a - .5)  # soft S curve
    g = (a @ [.299, .587, .114])[..., None]
    a = g + (a - g) * .92                                            # a touch less colour, all alike
    a = a * [1.025, 1.0, .955]                                       # warm, like her logo wall
    return Image.fromarray((np.clip(a, 0, 1) * 255).astype('uint8'))


os.makedirs(OUT, exist_ok=True)
for name, prefix, box in CROPS:
    im = Image.open(sorted(glob.glob(os.path.join(SRC, prefix + '*.jpg')))[0]).convert('RGB').crop(box)
    grade(im.resize((940, round(940 * im.height / im.width)), Image.LANCZOS)).save(os.path.join(OUT, name + '.jpg'), quality=93)
    print(name)
