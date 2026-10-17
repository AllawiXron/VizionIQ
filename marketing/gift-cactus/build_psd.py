"""Builds psd/kaktus-logo.psd from layers/logo/*.png (run `node logo-layers.cjs` first).
Layers are grouped and named the way you'd set the logo up by hand; blend modes and opacities match the design.
Text layers are rasterised (psd-tools can't write live type): retype them with the fonts named in the layer.
Requires psd-tools and pillow."""
import os

from PIL import Image
from psd_tools import PSDImage
from psd_tools.constants import BlendMode, Compression

HERE = os.path.dirname(os.path.abspath(__file__))
L = os.path.join(HERE, "layers", "logo")
os.makedirs(os.path.join(HERE, "psd"), exist_ok=True)

# (key, layer name, opacity 0-255, blend mode) bottom to top; a str entry starts a group, None closes it
STACK = [
    ("bg", "Background · cream #f7f0e3", 255, None),
    ("knit", "Knit texture · V stitches (pattern 44x34)", 18, BlendMode.MULTIPLY),
    ("border", "Stitched border · dashed 6px", 255, None),
    "Cactus",
    ("strand", "Yarn strand from the pot", 255, None),
    ("body", "Body · knit fill (pattern 30x24)", 255, None),
    ("body-shade", "Body · shading (left dark, right light)", 255, None),
    ("spines", "Spines · cross stitches", 255, None),
    ("petals", "Flower · petals #f2a7b4", 255, None),
    ("flower-centre", "Flower · centre #f3c552", 255, None),
    None,
    "Pot",
    ("pot", "Pot · knit fill terracotta #c96b45", 255, None),
    ("pot-shade", "Pot · shading", 255, None),
    ("rim", "Pot · rim #a9532f", 255, None),
    ("rim-stitch", "Pot · rim stitch line", 255, None),
    ("pot-stitch", "Pot · body stitch line", 255, None),
    None,
    "Yarn ball + hook",
    ("ball", "Yarn ball #f2a7b4", 255, None),
    ("ball-wraps", "Yarn ball · wraps #d97f90", 255, None),
    ("hook", "Crochet hook", 255, None),
    None,
    "Text",
    ("wordmark", "كاكتوس · Reem Kufi Fun 700 190px #2f5a3a, dots #e88a9b", 255, None),
    ("tagline", "حياكة يدوية.. بكل حب · Readex Pro 500 46px", 255, None),
    None,
    ("grain", "Grain · multiply 25%", 64, BlendMode.MULTIPLY),
]

psd = PSDImage.new("RGB", (1080, 1080), color=(247, 240, 227))
group_name, members = None, []


def add(key, name, opacity, mode):
    im = Image.open(os.path.join(L, f"{key}.png")).convert("RGBA")
    bbox = (0, 0, im.width, im.height) if key in ("bg", "knit", "grain") else im.getchannel("A").getbbox()
    layer = psd.create_pixel_layer(im.crop(bbox), name=key, top=bbox[1], left=bbox[0], compression=Compression.ZIP_WITH_PREDICTION)
    layer.name = name  # the setter writes the Unicode name block, so Arabic names survive
    layer.opacity = opacity
    if mode is not None:
        layer.blend_mode = mode
    return layer


for item in STACK:
    if isinstance(item, str):
        group_name, members = item, []
    elif item is None:
        psd.create_group(members, name="group").name = group_name
        group_name, members = None, []
    else:
        layer = add(*item)
        if group_name:
            members.append(layer)

psd._record.image_data.compression = Compression.RLE
out = os.path.join(HERE, "psd", "kaktus-logo.psd")
psd.save(out)
check = PSDImage.open(out)
print(out, f"{os.path.getsize(out) / 1e6:.1f} MB")
for layer in check:
    print(" ", layer.name, [c.name for c in layer] if layer.is_group() else "")
