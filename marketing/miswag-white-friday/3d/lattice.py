"""Shanasheel window (the carved wooden screens of old Baghdad houses) as a gobo: white = open, black = wood.

Two tall panels of eight-point-star lattice (a star in every cell, a diamond at every corner) in a wooden frame;
everything outside the window is solid, so the sun throws one window of patterned light into the room.
Usage: python lattice.py lattice.png"""
import math
import sys

from PIL import Image, ImageDraw, ImageFilter

S = 2048  # the gobo plane is 8 m, so 256 px per metre
C = 84  # lattice cell
WIN = (600, 640, 1440, 1560)  # window opening (x0, y0, x1, y1)
BAR = 34  # frame and centre mullion


def star(cx, cy, r, inner=0.72, rot=math.pi / 8):
    pts = []
    for i in range(16):
        rr = r if i % 2 == 0 else r * inner
        a = rot + i * math.pi / 8
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts


lat = Image.new("L", (S, S), 0)
d = ImageDraw.Draw(lat)
for gy in range(-1, S // C + 2):
    for gx in range(-1, S // C + 2):
        cx, cy = gx * C + C / 2, gy * C + C / 2
        d.polygon(star(cx, cy, C * 0.47), fill=255)
        x, y, r = gx * C, gy * C, C * 0.13
        d.polygon([(x, y - r), (x + r, y), (x, y + r), (x - r, y)], fill=255)

mask = Image.new("L", (S, S), 0)
m = ImageDraw.Draw(mask)
x0, y0, x1, y1 = WIN
mid = (x0 + x1) // 2
for a, b in ((x0 + BAR, mid - BAR // 2), (mid + BAR // 2, x1 - BAR)):
    m.rectangle((a, y0 + BAR, b, y1 - BAR), fill=255)
out = Image.composite(lat, Image.new("L", (S, S), 0), mask).filter(ImageFilter.GaussianBlur(1.0))
out.save(sys.argv[1])
print("wrote", sys.argv[1])
