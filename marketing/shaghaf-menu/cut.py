# Cuts each dessert out of her photos: python3 -I cut.py <photos dir> <out dir>
# Each entry: output name, source file prefix, crop box around the dish (fractions of the photo), model.
# isnet keeps cleaner edges; u2net keeps the orange cake (isnet drops it) and the cocoa on the tiramisu.
import sys, os, glob
import numpy as np
from PIL import Image, ImageDraw
from rembg import remove, new_session

SRC, OUT = sys.argv[1], sys.argv[2]
PICKS = [
    ('basbousa',      '866203917', (0.00, 0.20, 1.00, 0.80), 'isnet-general-use'),
    ('honeycomb',     '863861604', (0.00, 0.14, 1.00, 0.86), 'isnet-general-use'),
    ('honeycomb-mix', '871361891', (0.00, 0.00, 1.00, 0.90), 'isnet-general-use'),
    ('cinnabon',      '859144057', (0.00, 0.00, 1.00, 1.00), 'isnet-general-use'),
    ('cake',          '867588736', (0.00, 0.00, 1.00, 1.00), 'u2net'),
    ('marble-cake',   '862425682', (0.00, 0.22, 1.00, 0.95), 'isnet-general-use'),
]
# The four cups, each cut alone from her cups photo (pixel boxes), so each sits by its own name.
CUPS_PHOTO = '836468147'
CUPS = [
    ('cup-tiramisu',   (330, 160, 850, 670)),
    ('cup-lotus',      (0, 400, 510, 910)),
    ('cup-khashkhash', (630, 490, 1086, 1000)),
    ('cup-chocolate',  (270, 760, 820, 1320)),
]


def photo(prefix):
    return Image.open(sorted(glob.glob(os.path.join(SRC, prefix + '*.jpg')))[0]).convert('RGB')


def middle_piece(a):
    # keeps the cup in the middle of the crop, drops the slices of its neighbours
    m = Image.fromarray(((a[..., 3] > 128) * 255).astype('uint8')).copy()
    h, w = a.shape[:2]
    ImageDraw.floodfill(m, (w // 2, h // 2), 128)
    a[np.asarray(m) != 128, 3] = 0


# her photo cuts these off at one side: mirrored so the cut side faces the edge of the story
FLIP = {'honeycomb', 'cinnabon'}


def save(a, name):
    cut = Image.fromarray(a)
    if name in FLIP:
        cut = cut.transpose(Image.FLIP_LEFT_RIGHT)
    cut = cut.crop(cut.getbbox())
    cut.save(os.path.join(OUT, name + '.png'))
    print(name, cut.size)


sessions = {}
os.makedirs(OUT, exist_ok=True)
for name, prefix, (x0, y0, x1, y1), model in PICKS:
    session = sessions.setdefault(model, new_session(model))
    im = photo(prefix)
    W, H = im.size
    im = im.crop((int(x0 * W), int(y0 * H), int(x1 * W), int(y1 * H)))
    a = np.asarray(remove(im, session=session, post_process_mask=True)).copy()
    if name == 'marble-cake':
        rgb = a[..., :3].astype(int)
        a[(rgb.max(2) - rgb.min(2) < 40) & (rgb.max(2) > 150), 3] = 0  # the white plate under the cake
    save(a, name)

session = sessions.setdefault('u2net', new_session('u2net'))
cups = photo(CUPS_PHOTO)
for name, box in CUPS:
    a = np.asarray(remove(cups.crop(box), session=session, post_process_mask=True)).copy()
    middle_piece(a)
    save(a, name)
