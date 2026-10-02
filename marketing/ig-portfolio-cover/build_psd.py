"""Builds psd/slide-0N.psd from the layer renders in layers/ (run `node render.cjs --layers` first).

Layer order, bottom to top: Background, PHOTO 1…n (one placeholder per photo frame), Frames & UI, Text.
Put your image right above a PHOTO layer and clip it (Alt+Ctrl+G / Option+Cmd+G) so it fills that frame.
If works/<slide>-<n>.jpg (or .png) exists, it is placed there already: scaled to cover the frame and clipped.

Requires: pip install psd-tools pillow
"""
import json
import os

from PIL import Image
from psd_tools import PSDImage
from psd_tools.constants import Compression

HERE = os.path.dirname(os.path.abspath(__file__))
LAYERS = os.path.join(HERE, "layers")
WORKS = os.path.join(HERE, "works")
OUT = os.path.join(HERE, "psd")


def work_for(slide, k):
    for ext in ("jpg", "jpeg", "png", "webp"):
        path = os.path.join(WORKS, f"{slide}-{k}.{ext}")
        if os.path.exists(path):
            return path
    return None


def cover(im, w, h):
    """Scale and centre-crop like CSS background-size: cover."""
    s = max(w / im.width, h / im.height)
    im = im.resize((max(w, round(im.width * s)), max(h, round(im.height * s))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def main():
    os.makedirs(OUT, exist_ok=True)
    manifest = json.load(open(os.path.join(LAYERS, "manifest.json")))
    for entry in manifest:
        n = f"{entry['slide']:02d}"
        psd = PSDImage.new("RGB", (1080, 1350), color=(236, 227, 212))
        for key, name in entry["layers"]:
            im = Image.open(os.path.join(LAYERS, f"s{n}-{key}.png")).convert("RGBA")
            bbox = im.getchannel("A").getbbox()
            if bbox is None:
                continue
            if key == "bg":
                bbox = (0, 0, im.width, im.height)
            elif key.startswith("slot"):
                name = f"{name}  > put your image above this layer, then Alt+Ctrl+G"
            psd.create_pixel_layer(
                im.crop(bbox), name=name, top=bbox[1], left=bbox[0], compression=Compression.ZIP_WITH_PREDICTION
            )
            work = work_for(n, key.split("-")[1]) if key.startswith("slot") else None
            if work:
                photo = cover(Image.open(work).convert("RGB"), bbox[2] - bbox[0], bbox[3] - bbox[1])
                layer = psd.create_pixel_layer(
                    photo, name=os.path.basename(work), top=bbox[1], left=bbox[0], compression=Compression.ZIP_WITH_PREDICTION
                )
                layer.clipping = True
        # store the merged preview RLE-compressed (psd-tools defaults to raw)
        psd._record.image_data.compression = Compression.RLE
        path = os.path.join(OUT, f"slide-{n}.psd")
        psd.save(path)
        print(path, f"{os.path.getsize(path) / 1e6:.1f} MB", [l.name.split('  ')[0] for l in psd])


if __name__ == "__main__":
    main()
