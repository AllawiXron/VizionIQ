"""Asiacell reel v2: the real room. Builds the 9:16 plates from the CC0 bulb photo (../brand-ads-2026/photo/source-bulb.jpg),
which is a real room lit by that bulb:
  assets/img/room-lit.jpg   the room as shot, crop to 1080x1920 (bulb centred), warmed a touch
  assets/img/room-dark.jpg  the power cut: the same room at ~6% exposure, cold and nearly grey; the bulb swapped for the
                            switched-off grade (bulb-off.png, same crop) so the dead glass and filament read faintly
  assets/img/room-red.jpg   the room lit only by the neon text in front of the bulb: surfaces from the shot, tinted red,
                            falling off from the text. The page fades it with the neon's flicker.
  assets/img/filament.png   the filament's afterglow (orange, transparent) for the half second after the cut
python photo.py   (Pillow, numpy, scipy)"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

here = os.path.dirname(os.path.abspath(__file__))
src = os.path.join(here, '..', 'brand-ads-2026')
out = os.path.join(here, 'assets', 'img')

S = 1920 / 2048                       # scale the 1536x2048 shot to 1920 tall (1440 wide), then crop 1080 around the bulb
OX = 210                              # crop offset: bulb centre (800 px in the shot) lands at x 540
BOX = (round(560 * S) - OX, round(820 * S), round(1040 * S) - OX, round(1400 * S))   # where bulb-*.png sit (450 x 544)

shot = Image.open(os.path.join(src, 'photo', 'source-bulb.jpg')).convert('RGB').resize((1440, 1920), Image.LANCZOS).crop((OX, 0, OX + 1080, 1920))
lit = np.asarray(shot).astype(np.float32) / 255
H, W = lit.shape[:2]

def place(png):
    """bulb cut-out (480x580, same crop as the shot) scaled into BOX on a full-frame RGBA canvas"""
    im = Image.open(os.path.join(src, 'img', png)).convert('RGBA').resize((BOX[2] - BOX[0], BOX[3] - BOX[1]), Image.LANCZOS)
    c = Image.new('RGBA', (W, H)); c.paste(im, BOX[:2])
    a = np.asarray(c).astype(np.float32) / 255
    return a[..., :3], a[..., 3:]

def save(a, name, q=92):
    Image.fromarray((np.clip(a, 0, 1) * 255).round().astype(np.uint8)).save(os.path.join(out, name), quality=q)

# lit: warm it a touch, lift the shadows a little so the room reads as lived-in rather than black
L = lit @ np.array([0.2126, 0.7152, 0.0722])
room_lit = np.clip(lit * np.array([1.06, 1.0, 0.9]) * 1.08 + 0.015, 0, 1)
save(room_lit, 'room-lit.jpg')

# dark: grid's down. The shot's own light came from the bulb, so take it to ~6%, mostly grey, cold
off_rgb, off_a = place('bulb-off.png')
grey = L[..., None]
dark = (grey * 0.75 + lit * 0.25) * 0.06 * np.array([0.86, 0.93, 1.12])
dark = dark * (1 - off_a) + off_rgb * 0.22 * off_a          # the dead bulb, barely there
save(dark, 'room-dark.jpg')

# red: the surfaces of the room (their brightness in the shot, with the bulb's glare softened and the bulb itself swapped
# for the dead glass) lit by red light from the neon words, which sit in front of the bulb's lower half
alb = gaussian_filter(L, 1.2)
glare = gaussian_filter(L, 60)
alb = alb / (0.35 + glare) * 0.5                            # flatten the bulb's halo: keep texture, not the old light
off_L = off_rgb @ np.array([0.2126, 0.7152, 0.0722])
alb = alb * (1 - off_a[..., 0]) + off_L * 0.4 * off_a[..., 0]   # dead glass catches a little red; the filament must not look lit
alb = np.minimum(alb, 0.42)                                 # no hot spots: lamps and glints in the shot are off now
yy, xx = np.mgrid[0:H, 0:W]
d = np.sqrt(((xx - 540) / 1.0) ** 2 + ((yy - 1060) / 1.25) ** 2)
fall = np.clip(1 - d / 980, 0, 1) ** 1.6
red = alb[..., None] * fall[..., None] * np.array([1.0, 0.1, 0.12]) * 2.0
save(np.clip(red + dark, 0, 1), 'room-red.jpg')

# filament afterglow: the hot strips of the lit cut-out, orange, soft
on_rgb, on_a = place('bulb-on.png')
on_L = on_rgb @ np.array([0.2126, 0.7152, 0.0722])
strip = (np.abs(xx - 540) < 75) & (yy > 900) & (yy < 1230)      # the filament itself, not the bright scratches on the glass
hot = np.clip((on_L - 0.72) / 0.2, 0, 1) * on_a[..., 0] * strip
hot = np.maximum(hot, gaussian_filter(hot, 6) * 0.9)
glow = np.dstack([np.full_like(hot, 1.0), np.full_like(hot, 0.5), np.full_like(hot, 0.12), np.clip(hot * 1.1, 0, 1)])
Image.fromarray((glow * 255).round().astype(np.uint8), 'RGBA').save(os.path.join(out, 'filament.png'))
print('bulb box', BOX)
