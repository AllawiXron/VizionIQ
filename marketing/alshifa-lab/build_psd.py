"""Builds psd/<name>.psd for each design from layers/<name>/ (run `node render.cjs --layers` first).
`python build_psd.py naqaa` builds the made-up lab's set (after `node render.cjs --layers --lab naqaa`).
Requires psd-tools and pillow."""
import json
import os
import sys

from PIL import Image
from psd_tools import PSDImage
from psd_tools.constants import BlendMode, Compression

HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(HERE, "psd"), exist_ok=True)
PREFIX = sys.argv[1] if len(sys.argv) > 1 else "alshifa"
for name in (f"{PREFIX}-offer", f"{PREFIX}-vitamin-d", f"{PREFIX}-offer-story"):
    d = os.path.join(HERE, "layers", name)
    size = Image.open(os.path.join(d, "bg.png")).size
    psd = PSDImage.new("RGB", size, color=(39, 118, 138))
    for key, label in json.load(open(os.path.join(d, "manifest.json"))):
        im = Image.open(os.path.join(d, f"{key}.png")).convert("RGBA")
        bbox = (0, 0, im.width, im.height) if key in ("bg", "grain") else im.getchannel("A").getbbox()
        if not bbox:
            continue
        layer = psd.create_pixel_layer(im.crop(bbox), name=label, top=bbox[1], left=bbox[0], compression=Compression.ZIP_WITH_PREDICTION)
        if key == "grain":
            layer.blend_mode = BlendMode.OVERLAY
    psd._record.image_data.compression = Compression.RLE  # merged preview; psd-tools defaults to raw
    out = os.path.join(HERE, "psd", f"{name}.psd")
    psd.save(out)
    print(out, f"{os.path.getsize(out) / 1e6:.1f} MB", [l.name for l in psd])
