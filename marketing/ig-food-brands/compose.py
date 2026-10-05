"""Fits each (branded) AI photo to a 1080x1350 slide background in bg/<name>.png. Most photos fill the slide; the
cover and the dolma box are scaled down to leave room for the headline, and their studio backdrop is extended
outwards: the edge is stretched, blurred, given matching grain and feathered into the photo.

Usage: python compose.py
"""
import os

import cv2
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1350
SLIDES = {  # name: (source, scale of the full-bleed size, horizontal centre 0..1)
    "cover": ("ai/cover.png", 0.82, 0.5),
    "samoon": ("ai/branded/samoon.png", 0.8, 0.5),
    "amba": ("ai/branded/amba.png", 1.0, 0.5),
    "tea": ("ai/branded/tea.png", 1.0, 0.5),
    "dolma": ("ai/branded/dolma.png", 0.8, 0.5),
}


def fit(src, scale, cx):
    im = np.asarray(Image.open(os.path.join(HERE, src)).convert("RGB")).astype(np.float32)
    s = W / im.shape[1] * scale
    w, h = int(round(im.shape[1] * s)), int(round(im.shape[0] * s))
    im = cv2.resize(im, (w, h), interpolation=cv2.INTER_AREA)
    if scale >= 1.0:
        return im[:H, :W]
    x0 = int(round((W - w) * cx))
    y0 = H - h  # sits on the bottom edge
    top, left, right = y0, x0, W - w - x0
    big = cv2.copyMakeBorder(im, top, 0, left, right, cv2.BORDER_REPLICATE)
    soft = cv2.GaussianBlur(big, (0, 0), 45)
    # a touch of grain in the stretched part so it matches the photo's texture
    rng = np.random.default_rng(3)
    grain = rng.normal(0, 2.2, big.shape[:2]).astype(np.float32)[..., None]
    soft = soft + grain
    alpha = np.zeros((H, W), np.float32)
    alpha[y0:, x0:x0 + w] = 1
    feather = 60
    alpha = cv2.GaussianBlur(alpha, (0, 0), feather / 2.5)
    alpha[y0 + feather:, x0 + feather:x0 + w - feather] = 1
    return soft * (1 - alpha[..., None]) + big * alpha[..., None]


if __name__ == "__main__":
    os.makedirs(os.path.join(HERE, "bg"), exist_ok=True)
    for name, (src, scale, cx) in SLIDES.items():
        out = fit(src, scale, cx)
        Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(HERE, "bg", name + ".png"))
        print("wrote", name, out.shape)
