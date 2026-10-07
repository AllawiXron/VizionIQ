"""The plane-window glass outline in source-window.jpg (1536x2048), traced from its edge map: a closed Catmull-Rom curve
through these points. Imported by window.py; run alone to draw the outline over the photo for checking."""
import numpy as np

PTS = [(540, 627), (700, 633), (860, 639), (1000, 640), (1062, 641), (1100, 664), (1135, 702), (1162, 742), (1182, 785),
       (1196, 840), (1205, 950), (1204, 1060), (1192, 1180), (1172, 1300), (1156, 1390), (1138, 1450), (1112, 1505),
       (1066, 1543), (1000, 1573), (900, 1596), (780, 1600), (660, 1597), (590, 1590), (520, 1570), (465, 1540),
       (425, 1500), (406, 1440), (402, 1350), (403, 1220), (404, 1080), (406, 960), (416, 860), (432, 790), (448, 745),
       (466, 705), (494, 665)]


def curve(pts=PTS, n=24):
    p = np.array(pts, float)
    out = []
    for i in range(len(p)):
        p0, p1, p2, p3 = p[i - 1], p[i], p[(i + 1) % len(p)], p[(i + 2) % len(p)]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    return [tuple(q) for q in out]


if __name__ == '__main__':
    import sys
    from PIL import Image, ImageDraw
    im = Image.open(sys.argv[1]).convert('RGB'); d = ImageDraw.Draw(im)
    d.line(curve() + [curve()[0]], fill=(255, 0, 60), width=3)
    for x, y in PTS: d.ellipse((x - 5, y - 5, x + 5, y + 5), outline=(255, 230, 0), width=2)
    im.save(sys.argv[2])
