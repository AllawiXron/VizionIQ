"""photo/baghdad-cafe.png -> photo/baghdad-cafe-graded.png: a cinematic grade. Lamp and screen bloom, blue TV light
spilling into the room, teal shadows and amber highlights, deeper blacks, a soft vignette."""
import numpy as np
from PIL import Image
from scipy import ndimage

im = np.asarray(Image.open("photo/baghdad-cafe.png").convert("RGB")).astype(np.float32) / 255
H, W, _ = im.shape
L = im @ np.array([0.299, 0.587, 0.114], np.float32)

# bloom: the bright lamps and the screen glow outwards
bright = np.clip((L - 0.62) / 0.38, 0, 1)[..., None] * im
bloom = ndimage.gaussian_filter(bright, (28, 28, 0)) * 1.1 + ndimage.gaussian_filter(bright, (90, 90, 0)) * 0.9
out = 1 - (1 - im) * (1 - np.clip(bloom, 0, 1))

# blue light from the TV (centre in source pixels) falling off across the room
Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
tv = (1095, 700)
d = np.sqrt((X - tv[0]) ** 2 + ((Y - tv[1]) * 1.15) ** 2)
spill = np.exp(-(d / 520) ** 2)[..., None] * np.array([0.30, 0.48, 0.75], np.float32) * 0.5
out = 1 - (1 - out) * (1 - spill)

# split tone: teal shadows, amber highlights
L2 = out @ np.array([0.299, 0.587, 0.114], np.float32)
sh = np.clip(1 - L2 / 0.45, 0, 1)[..., None]
hi = np.clip((L2 - 0.5) / 0.5, 0, 1)[..., None]
out = out + sh * np.array([-0.015, 0.008, 0.02]) + hi * np.array([0.06, 0.025, -0.035])

# contrast curve with deeper blacks
out = np.clip(out, 0, 1)
out = out ** 1.03
out = 0.5 + (out - 0.5) * 1.07
# vignette
v = 1 - 0.28 * np.clip(((X - W / 2) / (W * 0.72)) ** 2 + ((Y - H * 0.55) / (H * 0.72)) ** 2, 0, 1)
out = out * v[..., None]
Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).save("photo/baghdad-cafe-graded.png")
print("ok")
