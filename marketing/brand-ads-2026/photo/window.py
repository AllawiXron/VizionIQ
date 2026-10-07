"""Iraqi Airways background: the plane window from source-window.jpg with the view replaced by the aerial photo of
Baghdad and the Tigris (source-baghdad-aerial.jpg).  python window.py ../img/iqa-window.jpg
The aerial is tilted like a banking plane, hazed toward the horizon, and the glass gets a soft reflection and a dark
gasket rim so the seam reads as a real window edge."""
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from glass import curve

win = Image.open('source-window.jpg').convert('RGB')
W, H = win.size
# glass mask, slightly inside the traced edge, feathered
m = Image.new('L', (W * 2, H * 2), 0)
ImageDraw.Draw(m).polygon([(x * 2, y * 2) for x, y in curve()], fill=255)
m = m.resize((W, H), Image.LANCZOS)
mask = m.filter(ImageFilter.GaussianBlur(1.2))

# the view: aerial Baghdad, tilted ~-9 degrees, scaled to cover the glass with room for the rotation
air = Image.open('source-baghdad-aerial.jpg').convert('RGB')
air = air.crop((0, 40, 1024, 683))                        # drop the top strip of hazy sky
scale = 1.9
air = air.resize((int(air.width * scale), int(air.height * scale)), Image.LANCZOS)
air = air.rotate(-9, resample=Image.BICUBIC, expand=False)
view = Image.new('RGB', (W, H), (150, 180, 210))
# place so the river loop sits in the middle of the glass
ox, oy = 400 - 520, 640 - 230
view.paste(air, (ox, oy))
v = np.asarray(view).astype(np.float32) / 255
yy = np.linspace(0, 1, H)[:, None, None]
gy0, gy1 = 640 / H, 1600 / H
t = np.clip((yy - gy0) / (gy1 - gy0), 0, 1)               # 0 at the top of the glass, 1 at the bottom
haze = np.array([0.80, 0.86, 0.93])
v = v * (0.72 + 0.28 * t) + haze * (0.28 - 0.28 * t)       # atmospheric haze toward the horizon (top)
v = np.clip((v - 0.5) * 1.08 + 0.5 + 0.02, 0, 1)
v = v * np.array([0.98, 1.0, 1.03])                       # a touch cooler, like through tinted acrylic
# soft diagonal reflection on the acrylic
X, Y = np.meshgrid(np.arange(W), np.arange(H))
band = np.exp(-(((X - 820) * 0.85 + (Y - 1000) * 0.55) / 140.0) ** 2) * 0.10
v = np.clip(v + band[..., None], 0, 1)
view = Image.fromarray((v * 255).round().astype(np.uint8))

out = Image.composite(view, win, mask)
# dark gasket rim just inside the edge
rim = Image.new('L', (W, H), 0)
ImageDraw.Draw(rim).line(curve() + [curve()[0]], fill=255, width=9)
rim = rim.filter(ImageFilter.GaussianBlur(4))
inner = Image.new('L', (W, H), 0)
ImageDraw.Draw(inner).polygon(curve(), fill=255)
inner_soft = inner.filter(ImageFilter.GaussianBlur(26))
shade = (np.asarray(inner, np.float32) - np.asarray(inner_soft, np.float32)).clip(0) / 255   # inner shadow band
o = np.asarray(out).astype(np.float32)
o *= 1 - 0.55 * (np.asarray(rim, np.float32) / 255)[..., None]
o *= 1 - 0.35 * shade[..., None]
Image.fromarray(o.clip(0, 255).round().astype(np.uint8)).save(sys.argv[1], quality=95)
