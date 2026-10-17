"""Builds psd/<brand>-N.psd from the layer renders in layers/ (run `node render.cjs --layers` first).

Layer order, bottom to top: Background, PHOTO 1 (the ad's frame on slide 1, with works/<brand>.jpg clipped into it),
Frames & UI, Text.

Requires: pip install psd-tools pillow
"""
import json
import os

from PIL import Image
from psd_tools import PSDImage
from psd_tools.constants import Compression

HERE = os.path.dirname(os.path.abspath(__file__))
LAYERS = os.path.join(HERE, "layers")
OUT = os.path.join(HERE, "psd")


def cover(im, w, h):
    """Scale and centre-crop like CSS background-size: cover."""
    s = max(w / im.width, h / im.height)
    im = im.resize((max(w, round(im.width * s)), max(h, round(im.height * s))), Image.LANCZOS)
    x, y = (im.width - w) // 2, (im.height - h) // 2
    return im.crop((x, y, x + w, y + h))


def main():
    os.makedirs(OUT, exist_ok=True)
    for entry in json.load(open(os.path.join(LAYERS, "manifest.json"))):
        sid = entry["id"]
        psd = PSDImage.new("RGB", (1080, 1350), color=(236, 227, 212))
        for key, name in entry["layers"]:
            im = Image.open(os.path.join(LAYERS, f"{sid}-{key}.png")).convert("RGBA")
            bbox = im.getchannel("A").getbbox()
            if bbox is None:
                continue
            if key == "bg":
                bbox = (0, 0, im.width, im.height)
            elif key.startswith("slot"):
                name = f"{name}  > put your image above this layer, then Alt+Ctrl+G"
            psd.create_pixel_layer(im.crop(bbox), name=name, top=bbox[1], left=bbox[0], compression=Compression.ZIP_WITH_PREDICTION)
            if key.startswith("slot"):
                work = os.path.join(HERE, entry["works"][int(key.split("-")[1]) - 1])
                photo = cover(Image.open(work).convert("RGB"), bbox[2] - bbox[0], bbox[3] - bbox[1])
                layer = psd.create_pixel_layer(photo, name=os.path.basename(work), top=bbox[1], left=bbox[0], compression=Compression.ZIP_WITH_PREDICTION)
                layer.clipping = True
        psd._record.image_data.compression = Compression.RLE
        path = os.path.join(OUT, f"{sid}.psd")
        psd.save(path)
        print(path, f"{os.path.getsize(path) / 1e6:.1f} MB", [l.name.split("  ")[0] for l in psd])


if __name__ == "__main__":
    main()
