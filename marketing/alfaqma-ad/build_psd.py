"""Builds psd/alfaqma-ad.psd from layers/ (run `node render.cjs --layers` first). Requires psd-tools and pillow."""
import json
import os

from PIL import Image
from psd_tools import PSDImage
from psd_tools.constants import Compression

HERE = os.path.dirname(os.path.abspath(__file__))
psd = PSDImage.new("RGB", (1080, 1350), color=(244, 245, 249))
for key, name in json.load(open(os.path.join(HERE, "layers", "manifest.json"))):
    im = Image.open(os.path.join(HERE, "layers", f"{key}.png")).convert("RGBA")
    bbox = (0, 0, im.width, im.height) if key == "bg" else im.getchannel("A").getbbox()
    psd.create_pixel_layer(im.crop(bbox), name=name, top=bbox[1], left=bbox[0], compression=Compression.ZIP_WITH_PREDICTION)
psd._record.image_data.compression = Compression.RLE  # merged preview; psd-tools defaults to raw
os.makedirs(os.path.join(HERE, "psd"), exist_ok=True)
out = os.path.join(HERE, "psd", "alfaqma-ad.psd")
psd.save(out)
print(out, f"{os.path.getsize(out) / 1e6:.1f} MB", [l.name for l in psd])
