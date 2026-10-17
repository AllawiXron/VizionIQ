"""Brands the AI product photos (ai/*.png): prints each parody brand's mark (art/*.png, from `node brand-art.cjs`)
onto its blank packaging as gold foil that follows the light and the perspective of the surface.

  samoon  the band inside the jewellery box's lid (satin)
  dolma   the inside of the gift box's lid (matte green board)
  amba    a black label on the front of the perfume bottle, under the glass's own highlights
  tea     wrapped around the front of the tin

Writes ai/branded/<name>.png at the photos' full size. Usage: python brand.py [samoon|dolma|amba|tea ...]
"""
import math
import os

import cv2
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
AI = os.path.join(HERE, "ai")
GOLD = [(0, (150, 112, 58)), (0.22, (236, 206, 140)), (0.42, (190, 146, 80)), (0.6, (246, 228, 172)), (0.8, (170, 126, 64)), (1, (222, 188, 120))]


def load(name):
    return np.asarray(Image.open(os.path.join(AI, name + ".png")).convert("RGB")).astype(np.float32)


def save(a, name):
    os.makedirs(os.path.join(AI, "branded"), exist_ok=True)
    Image.fromarray(np.clip(a, 0, 255).astype(np.uint8)).save(os.path.join(AI, "branded", name + ".png"))
    print("wrote", name)


def art(name):
    """the mark's alpha, cropped to its ink"""
    a = np.asarray(Image.open(os.path.join(HERE, "art", name + ".png")))[..., 3].astype(np.float32) / 255
    ys, xs = np.nonzero(a > 0.02)
    return a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def panel(mark, quad, shape, cx=0.5, cy=0.5, width=0.6):
    """put the mark on a flat panel given by its corners (TL, TR, BR, BL): it sits at (cx, cy) of the panel, `width`
    of the panel wide, and takes the panel's perspective"""
    q = np.float32(quad)
    W = int(max(np.linalg.norm(q[1] - q[0]), np.linalg.norm(q[2] - q[3])))
    H = int(max(np.linalg.norm(q[3] - q[0]), np.linalg.norm(q[2] - q[1])))
    mw = int(W * width)
    mh = int(mw * mark.shape[0] / mark.shape[1])
    m = cv2.resize(mark, (mw, mh), interpolation=cv2.INTER_AREA)
    flat = np.zeros((H, W), np.float32)
    x0, y0 = int(cx * W - mw / 2), int(cy * H - mh / 2)
    flat[y0:y0 + mh, x0:x0 + mw] = m
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [W, 0], [W, H], [0, H]]), q)
    return cv2.warpPerspective(flat, M, (shape[1], shape[0]), flags=cv2.INTER_LINEAR)


def cylinder(mark, shape, cx, R, y0, height, b, width=0.8, span=58):
    """wrap the mark around the front of an upright cylinder (axis at x = cx, radius R px). The mark's top edge sits
    at y0 where the surface turns away; b is how far a circle's front dips below its sides (the view from above)."""
    th = math.radians(span)
    Wf = int(2 * th * R)  # the flat label: arc length across +-span
    mw = int(Wf * width)
    mh = int(mw * mark.shape[0] / mark.shape[1])
    flat = np.zeros((max(height, mh + 2), Wf), np.float32)
    flat[(flat.shape[0] - mh) // 2:(flat.shape[0] - mh) // 2 + mh, (Wf - mw) // 2:(Wf - mw) // 2 + mw] = cv2.resize(mark, (mw, mh), interpolation=cv2.INTER_AREA)
    Hh, Ww = shape[:2]
    Y, X = np.mgrid[0:Hh, 0:Ww].astype(np.float32)
    s = np.clip((X - cx) / R, -0.999, 0.999)
    ang = np.arcsin(s)
    u = (ang + th) / (2 * th) * Wf
    v = Y - (y0 + b * np.cos(ang))
    inside = (np.abs(ang) < th)
    out = cv2.remap(flat, u.astype(np.float32), v.astype(np.float32), cv2.INTER_LINEAR, borderValue=0)
    return out * inside * np.cos(ang) ** 0.35  # the print fades a touch where the surface turns away


def light_of(photo, m, blur=40):
    """the surface's own light under the mark, around 1"""
    L = ndimage.gaussian_filter(photo @ np.array([0.299, 0.587, 0.114], np.float32), blur)
    ref = (L * m).sum() / max(m.sum(), 1)
    return np.clip((L / max(ref, 1)) ** 0.7, 0.6, 1.45)


def foil(photo, m, lit=None, press=0.35):
    """gold foil: a metallic gradient across the mark, lifted by the light on the surface, with a pressed edge"""
    h, w = m.shape
    ys, xs = np.nonzero(m > 0.05)
    t = ((np.arange(w)[None, :] - xs.min()) + (np.arange(h)[:, None] - ys.min()) * 0.6) / max(1, (xs.max() - xs.min()) + (ys.max() - ys.min()) * 0.6)
    t = np.clip(t, 0, 1)
    col = np.zeros((h, w, 3), np.float32)
    for (o0, c0), (o1, c1) in zip(GOLD[:-1], GOLD[1:]):
        sel = ((t >= o0) & (t <= o1))[..., None]
        k = np.clip((t - o0) / (o1 - o0), 0, 1)[..., None]
        col += ((1 - k) * np.array(c0) + k * np.array(c1)) * sel
    if lit is not None:
        col *= lit[..., None]
    m = ndimage.gaussian_filter(m, 0.6)
    edge = np.clip(ndimage.shift(m, (2, 1.5), order=1) - m, 0, 1)
    out = photo * (1 - edge[..., None] * press)
    return out * (1 - m[..., None]) + col * m[..., None]


def samoon():
    p = load("samoon-b")
    # the satin inside the lid: its flat back panel, above where the loaf's tip comes up
    lid = [(737, 392), (1431, 480), (1450, 930), (744, 817)]
    m = panel(art("samoon"), lid, p.shape, cx=0.5, cy=0.18, width=0.76)
    # the loaf stands in front of the lid: keep the print off it (the bread is saturated orange-brown, the satin is not)
    hsv = cv2.cvtColor(p.astype(np.uint8), cv2.COLOR_RGB2HSV).astype(np.float32)
    bread = (hsv[..., 1] > 70) & (hsv[..., 0] < 30)
    bread = ndimage.binary_closing(bread, iterations=3)
    bread = ndimage.binary_fill_holes(bread)
    bread = ndimage.binary_dilation(bread, iterations=2)
    m *= 1 - ndimage.gaussian_filter(bread.astype(np.float32), 1.2)
    save(foil(p, m, light_of(p, m), press=0.25), "samoon")


def dolma():
    p = load("dolma")
    lid = [(594, 355), (1550, 449), (1488, 1080), (552, 925)]
    m = panel(art("dolma"), lid, p.shape, cx=0.5, cy=0.44, width=0.5)
    save(foil(p, m, light_of(p, m), press=0.4), "dolma")


def amba():
    p = load("amba-a")
    # a black label on the front face of the bottle, the art in foil on it, the glass's highlights over both
    x0, y0, x1, y1 = 752, 1118, 1106, 1592
    lab = np.zeros(p.shape[:2], np.float32)
    lab[y0:y1, x0:x1] = 1
    lab = ndimage.gaussian_filter(lab, 1.0)
    base = p * (1 - lab[..., None] * 0.985) + np.array([20, 15, 13], np.float32) * lab[..., None] * 0.985
    border = np.zeros_like(lab)
    border[y0 + 16:y1 - 16, x0 + 16:x1 - 16] = 1
    border[y0 + 19:y1 - 19, x0 + 19:x1 - 19] = 0
    q = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    m = np.maximum(panel(art("amba"), q, p.shape, cx=0.5, cy=0.5, width=0.7), border)
    out = foil(base, m, light_of(p, lab, 60) * 1.05, press=0.2)
    # the glass's own sparkle over the label: only its brightest specks, not the texture of the sauce behind
    L = p @ np.array([0.299, 0.587, 0.114], np.float32)
    spec = np.clip((L - ndimage.gaussian_filter(L, 6) - 28) / 60, 0, 1) * np.clip((L - 200) / 40, 0, 1)
    out += (spec * lab)[..., None] * 140
    save(out, "amba")


def tea():
    p = load("tea-b")
    m = cylinder(art("istikan"), p.shape, cx=1252, R=297, y0=1080, height=440, b=30, width=0.62)
    save(foil(p, m, light_of(p, m), press=0.3), "tea")


if __name__ == "__main__":
    import sys
    jobs = {"samoon": samoon, "dolma": dolma, "amba": amba, "tea": tea}
    for name in sys.argv[1:] or jobs:
        jobs[name]()
