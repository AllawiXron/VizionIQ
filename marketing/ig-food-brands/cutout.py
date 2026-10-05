"""Cut the foods out of the photos (rembg), crop each to its subject and save cut/<name>.png with alpha."""
import sys
import numpy as np
from scipy import ndimage
from PIL import Image, ImageFilter
from rembg import remove, new_session

HARD = {"amba"}  # white plastic against a busy cafe: alpha matting turns the cap see-through, so cut these hard

JOBS = {  # name: (photo, crop box in the photo or None, model)
    "samoon": ("photo/samoon.jpg", None, "isnet-general-use"),
    "amba": ("photo/amba.jpg", (1235, 0, 1860, 1440), "isnet-general-use"),
    "amba-cup": ("photo/amba.jpg", (770, 1110, 1150, 1440), "isnet-general-use"),
    "tea": ("photo/tea.jpg", None, "isnet-general-use"),
    "dolma": ("photo/dolma.jpg", None, "isnet-general-use"),
}


def run(name):
    src, box, model = JOBS[name]
    im = Image.open(src).convert("RGB")
    if box:
        im = im.crop(box)
    if name in HARD:
        out = remove(im, session=new_session(model))
        a = (np.array(out.split()[-1]) > 110).astype(np.uint8) * 255
        if name == "amba":  # put back the white nozzle the cut dropped: the bright pixels above the cap
            g = np.array(im.convert("L"))
            x0, x1, y1 = 285, 425, 215
            noz = ndimage.binary_opening(g[:y1, x0:x1] > 175, structure=np.ones((7, 7)))  # drops the thin chrome rail
            a[:y1, x0:x1] = np.maximum(a[:y1, x0:x1], noz.astype(np.uint8) * 255)
        a = ndimage.binary_fill_holes(a > 0).astype(np.uint8) * 255
        m = Image.fromarray(a).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
        out = im.convert("RGBA")
        out.putalpha(m)
    else:
        out = remove(im, session=new_session(model), alpha_matting=True, alpha_matting_foreground_threshold=240,
                     alpha_matting_background_threshold=12, alpha_matting_erode_size=8)
    a = np.array(out.split()[-1])
    ys, xs = np.where(a > 20)
    pad = 6
    out = out.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(out.width, xs.max() + pad), min(out.height, ys.max() + pad)))
    out.save(f"cut/{name}.png")
    print(name, out.size)


for n in (sys.argv[1:] or JOBS):
    run(n)
