# Square crops of her photos, all with one grade so they sit together: python3 -I photos.py <her photos dir>
# Each crop stays clear of the price labels she printed on some of them.
import sys, os, glob
import numpy as np
from PIL import Image

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'art/photos')
CROPS = [  # name, photo, square box in pixels
    ('basbousa',       '866203917', (0, 460, 1242, 1702)),
    ('honeycomb-mix',  '871361891', (0, 150, 1080, 1230)),
    ('honeycomb',      '863861604', (0, 490, 1290, 1780)),
    ('cinnabon',       '859144057', (0, 170, 1086, 1256)),
    ('cake',           '867588736', (0, 300, 1242, 1542)),
    ('marble-cake',    '862425682', (0, 575, 1290, 1865)),
]
# The four cups sit turned on a gold mat in one photo. Each is found, turned straight and cropped to the cup alone,
# so no slices of the cups next to it show (she found the first crops messy, 29 Oct).
CUPS_PHOTO = '836468147'
CUPS = [
    ('cup-tiramisu',   (330, 160, 850, 670)),
    ('cup-lotus',      (0, 400, 510, 910)),
    ('cup-khashkhash', (630, 490, 1086, 1000)),
    ('cup-chocolate',  (270, 760, 820, 1320)),
]


def straight_cup(photo, box):
    from PIL import ImageDraw
    from rembg import remove, new_session
    crop = photo.crop(box)
    a = np.asarray(remove(crop, session=new_session('u2net'), post_process_mask=True))[..., 3]
    m = Image.fromarray(((a > 128) * 255).astype('uint8')).copy()
    ImageDraw.floodfill(m, (m.width // 2, m.height // 2), 128)     # the cup in the middle, not its neighbours
    m = m.point(lambda v: 255 if v == 128 else 0)
    # the turn that makes the cup's outline tightest is the one that sets it straight
    best = min(range(-45, 46), key=lambda t: (lambda b: (b[2] - b[0]) * (b[3] - b[1]))(m.rotate(t, expand=True).getbbox()))
    big = photo.crop((box[0] - 150, box[1] - 150, box[2] + 150, box[3] + 150)).rotate(best, Image.BICUBIC)
    seen = Image.new('L', photo.size, 255).crop((box[0] - 150, box[1] - 150, box[2] + 150, box[3] + 150)).rotate(best)
    mm = Image.new('L', big.size)
    mm.paste(m, (150, 150))
    x0, y0, x1, y1 = mm.rotate(best).getbbox()
    side = max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    inset = int(side * .045)                                          # inside the rounded plastic corners
    sq = lambda i: (cx - side // 2 + i, cy - side // 2 + i, cx + side // 2 - i, cy + side // 2 - i)
    while min(seen.crop(sq(inset)).getextrema()) < 255:              # keep the square inside her photo
        inset += 2
    return big.crop(sq(inset)), best


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
    grade(im.resize((940, 940), Image.LANCZOS)).save(os.path.join(OUT, name + '.jpg'), quality=93)
    print(name)
cups = Image.open(sorted(glob.glob(os.path.join(SRC, CUPS_PHOTO + '*.jpg')))[0]).convert('RGB')
for name, box in CUPS:
    im, turn = straight_cup(cups, box)
    grade(im.resize((700, 700), Image.LANCZOS)).save(os.path.join(OUT, name + '.jpg'), quality=93)
    print(name, 'turned', turn)
