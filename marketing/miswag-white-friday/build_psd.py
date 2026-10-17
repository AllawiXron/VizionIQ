"""Builds psd/<name>.psd from layers/<name>/ (run `node render.cjs --layers` first). Requires psd-tools and pillow."""
import json
import os

from PIL import Image
from psd_tools import PSDImage
from psd_tools.constants import BlendMode, Compression

HERE = os.path.dirname(os.path.abspath(__file__))
os.makedirs(os.path.join(HERE, "psd"), exist_ok=True)
for name in ("miswag-white-friday-1", "miswag-white-friday-2"):
    d = os.path.join(HERE, "layers", name)
    psd = PSDImage.new("RGB", (1080, 1350), color=(246, 245, 242))
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
