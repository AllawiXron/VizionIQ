"""Builds the layers in img/ from the images in src/.
The cut-out mask (src/deimos-mask.png) is kept, so this runs on Pillow, numpy and scipy alone.
python prep.py"""
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

S = 1.74          # Deimos is 563 px tall in the source; this puts his head near the top with his waist on the frame edge

def arr(im):
    return np.asarray(im).astype(np.float32) / 255

def save(a, p, **kw):
    Image.fromarray((np.clip(a, 0, 1) * 255 + .5).astype(np.uint8)).save(p, **kw)

def blur(a, s):
    return ndi.gaussian_filter(a, (s, s, 0) if a.ndim == 3 else s)

def screen(base, light):
    return 1 - (1 - base) * (1 - light)

# Deimos: scaled up, sharpened at the new size, then lit. The menu he is aiming at is the light on his right: a pale
# pink-white rim on every edge facing it, stronger toward the mask and the revolver. The warm lobby behind him gives
# a soft amber rim on his top and back edges.
src = Image.open('src/deimos.jpg').convert('RGB')
msk = Image.open('src/deimos-mask.png').convert('L')
size = (round(src.width * S), round(src.height * S))
im = arr(src.resize(size, Image.LANCZOS))
A = arr(msk.resize(size, Image.LANCZOS))
# edge pixels still carry the light smoke he was shot against; give them the colour from just inside the outline
inner = (A > .92).astype(np.float32)
fill = blur(im * inner[..., None], 3) / (blur(inner, 3)[..., None] + 1e-4)
edge_px = ((A < .92) & (blur(inner, 3) > .02))[..., None]
im = np.where(edge_px, fill, im)
im = im + .9 * (im - blur(im, 1.3))
im = im + .25 * (im - blur(im, 16))
im = np.clip(im, 0, 1)

def edge(dy, dx, w):
    e = np.clip(A - ndi.shift(A, (dy, dx), order=1), 0, 1)
    return blur(e, w) * A ** 3                                        # inside the outline only, no halo

H, W = A.shape
xs = np.linspace(0, 1, W)[None, :]
toward = np.clip((xs - .35) / .45, 0, 1) ** 1.5                       # 0 at his back, 1 at the revolver
front = edge(0, -7, 1.2) * (.3 + .7 * toward)
spill = blur(A, 25) * A * toward * .16                                # broad, faint light on the side facing the menu
back = np.maximum(edge(10, 0, 2.2), edge(0, 9, 2.2) * .6)
light = (front[..., None] * np.array([1.0, .90, .96]) * .8
         + spill[..., None] * np.array([1.0, .88, .95])
         + back[..., None] * np.array([1.0, .62, .30]) * .55)
im = screen(im, np.clip(light, 0, 1))
save(np.dstack([im, A]), 'img/deimos.png')

# Consulate lobby: scaled 1.15 and moved so the arch sits behind his head and the wall with the painting sits behind
# the menu. Softened here so the browser does not have to.
lb = Image.open('src/consulate-lobby.jpg').convert('RGB')
lb = lb.resize((round(lb.width * 1.15), round(lb.height * 1.15)), Image.LANCZOS).crop((150, 100, 2070, 1180))
save(blur(arr(lb), 5), 'img/lobby.jpg', quality=92)
print('ok')
