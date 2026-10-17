"""Dollar reel: textures, paper pieces and photo prints -> assets/img/. The look is analog collage (deep red cloth, old
paper, a green board, torn slips, black-and-white prints with white borders), so everything here carries texture.
python prep.py   (Pillow, numpy, scipy)

Textures (1080x1920): red.jpg, paper.jpg, dark.jpg, board.jpg; grain.png (1024 tile, mid-grey film grain).
Paper pieces (RGBA, torn or cut edges, words are set on top in the page): cal.png, slip.png, wasl.png, tag.png,
  list.png, ticket.png.
Photos: bill.png (the $100 note), dinar.png (25,000 dinar note), and prints with a white border:
  p-fan.png, p-bazaar1.png, p-coffee.png, p-bulb.png, p-zahawi.png; plus full-frame plates bazaar2.jpg and street.jpg.
v3: plank.png + fulcrum.png (a cardboard seesaw), newsprint.jpg (the newspaper swipe and the ransom-note scraps)."""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.ndimage import gaussian_filter, zoom

here = os.path.dirname(os.path.abspath(__file__))
out = os.path.join(here, 'assets', 'img')
src = lambda n: os.path.join(here, 'photo', n)
rng = np.random.default_rng(2026)
W, H = 1080, 1920


def save(a, name, q=90):
    a = np.clip(a, 0, 1)
    if a.shape[-1] == 4:
        Image.fromarray((a * 255).round().astype(np.uint8), 'RGBA').save(os.path.join(out, name))
    else:
        Image.fromarray((a * 255).round().astype(np.uint8)).save(os.path.join(out, name), quality=q)


def noise(h, w, scale, octaves=4):
    """fractal value noise in 0..1"""
    acc = np.zeros((h, w)); amp = 1.0; tot = 0
    for o in range(octaves):
        s = max(2, int(scale / (2 ** o)))
        g = rng.random((h // s + 2, w // s + 2))
        acc += zoom(g, (s, s), order=3)[:h, :w] * amp
        tot += amp; amp *= 0.5
    acc /= tot
    return (acc - acc.min()) / (acc.max() - acc.min() + 1e-9)


def vignette(h, w, k=0.9, p=2.2):
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2) / 1.42
    return 1 - k * np.clip(d, 0, 1) ** p


# ---------- textures ----------
# red cloth: crimson, mottled, a soft lighter middle, dark edges
m = noise(H, W, 420) * 0.6 + noise(H, W, 60) * 0.25 + noise(H, W, 8, 2) * 0.15
fib = gaussian_filter(rng.standard_normal((H, W)), (0.6, 3.5)) * 0.05
base = np.array([0.50, 0.035, 0.05])
red = base[None, None, :] * (0.72 + 0.5 * m[..., None] + fib[..., None]) * vignette(H, W, 0.82, 1.6)[..., None]
save(red, 'red.jpg')

# old paper: warm beige, fibres, faint stains, darker edges
m = noise(H, W, 300) * 0.5 + noise(H, W, 40) * 0.3 + noise(H, W, 6, 2) * 0.2
fib = gaussian_filter(rng.standard_normal((H, W)), (4, 0.7)) * 0.025 + gaussian_filter(rng.standard_normal((H, W)), (0.7, 4)) * 0.02
stain = np.clip(noise(H, W, 500, 2) - 0.62, 0, 1) * 0.35
paper = np.array([0.84, 0.77, 0.64])[None, None, :] * (0.9 + 0.14 * m[..., None] + fib[..., None])
paper = paper - stain[..., None] * np.array([0.10, 0.14, 0.2])
paper = paper * vignette(H, W, 0.42, 2.0)[..., None]
save(paper, 'paper.jpg')

# dark desk: near-black, a warm pool of light in the middle
m = noise(H, W, 260) * 0.7 + noise(H, W, 20, 2) * 0.3
yy, xx = np.mgrid[0:H, 0:W]
pool = np.exp(-(((xx - 540) / 620) ** 2 + ((yy - 980) / 760) ** 2))
dark = np.array([0.05, 0.042, 0.04])[None, None, :] * (0.8 + 0.4 * m[..., None]) + pool[..., None] * np.array([0.12, 0.085, 0.06])
save(dark, 'dark.jpg')

# green board: deep green, chalk dust and wipe marks
m = noise(H, W, 340) * 0.6 + noise(H, W, 30) * 0.4
wipe = gaussian_filter(rng.standard_normal((H, W)), (2, 60)) * 0.6
wipe = np.clip(np.abs(wipe) - 0.25, 0, 1) * 0.16
board = np.array([0.11, 0.2, 0.17])[None, None, :] * (0.78 + 0.42 * m[..., None]) + wipe[..., None] * np.array([0.5, 0.55, 0.5])
board = board * vignette(H, W, 0.7, 1.8)[..., None]
save(board, 'board.jpg')

# film grain tile: mid grey, clumped a little
g = gaussian_filter(rng.standard_normal((1024, 1024)), 0.7)
g = 0.5 + g / (np.abs(g).max()) * 0.5
Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), 'L').convert('RGB').save(os.path.join(out, 'grain.png'))


# ---------- paper pieces ----------
def piece(w, h, color, torn=('top',), tex=0.06, holes=False, lines=None, perf=None, zig=None):
    m = noise(h, w, 120) * 0.6 + noise(h, w, 12, 2) * 0.4
    fib = gaussian_filter(rng.standard_normal((h, w)), (3, 0.6)) * 0.02
    rgb = np.array(color)[None, None, :] * (1 - tex + 2 * tex * m[..., None] + fib[..., None])
    a = np.ones((h, w))
    if lines:                                                # ruled notebook lines
        for y in range(lines[0], h - 20, lines[1]):
            rgb[y:y + 2, 30:w - 10] *= np.array([0.78, 0.85, 0.98])
        rgb[:, 88:90] *= np.array([1.0, 0.7, 0.7])
    for side in torn:                                        # torn edge: ragged, fibrous, with a pale rim
        n = gaussian_filter(rng.standard_normal(w if side in ('top', 'bottom') else h), 2.2) * 9 + 14
        n += gaussian_filter(rng.standard_normal(n.shape), 0.6) * 2.5
        if side == 'top':
            for x in range(w):
                d = int(n[x]); a[:d, x] = 0; rgb[d:d + 5, x] = rgb[d:d + 5, x] * 0.3 + 0.7 * np.array([0.97, 0.95, 0.9])
        if side == 'bottom':
            for x in range(w):
                d = int(n[x]); a[h - d:, x] = 0; rgb[h - d - 5:h - d, x] = rgb[h - d - 5:h - d, x] * 0.3 + 0.7 * np.array([0.97, 0.95, 0.9])
        if side == 'left':
            for y in range(h):
                d = int(n[y]); a[y, :d] = 0; rgb[y, d:d + 5] = rgb[y, d:d + 5] * 0.3 + 0.7 * np.array([0.97, 0.95, 0.9])
    if zig:                                                  # receipt cut: zig-zag bottom
        step = zig
        for x in range(w):
            d = 10 + abs((x % step) - step / 2) * (16 / step)
            a[int(h - d):, x] = 0
    if perf:                                                 # perforation holes along the left
        for y in range(18, h, 26):
            yy, xx = np.ogrid[0:h, 0:w]
            a[(yy - y) ** 2 + (xx - perf) ** 2 < 36] = 0
    if holes:                                                # calendar pad holes along the top
        for x in range(70, w - 40, 64):
            yy, xx = np.ogrid[0:h, 0:w]
            a[(yy - 44) ** 2 + (xx - x) ** 2 < 70] = 0
    # light falls across it from the top left: a touch brighter there, shaded towards the bottom right
    yy, xx = np.mgrid[0:h, 0:w]
    rgb = rgb * (1.07 - 0.2 * ((xx / w + yy / h) / 2) ** 1.2)[..., None]
    # soft edge so it doesn't look cut by a computer
    a = gaussian_filter(a, 0.6)
    return np.dstack([np.clip(rgb, 0, 1), a])


save(piece(760, 860, (0.93, 0.9, 0.82), torn=('top',), holes=True), 'cal.png')
save(piece(600, 940, (0.95, 0.94, 0.9), torn=('top',), tex=0.04, zig=28), 'slip.png')
save(piece(640, 820, (0.95, 0.84, 0.82), torn=(), perf=26), 'wasl.png')
save(piece(470, 250, (0.86, 0.74, 0.52), torn=(), tex=0.09), 'tag.png')
save(piece(720, 900, (0.95, 0.94, 0.9), torn=('top',), lines=(170, 66)), 'list.png')
save(piece(330, 700, (0.96, 0.95, 0.92), torn=(), tex=0.03, zig=24), 'ticket.png')


# ---------- notes ----------
def cut_note(path, name, thresh=0.12):
    im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32) / 255
    L = im.mean(-1)
    rows = np.where((L > thresh).mean(1) > 0.5)[0]; cols = np.where((L > thresh).mean(0) > 0.5)[0]
    im = im[rows[0] + 4:rows[-1] - 4, cols[0] + 4:cols[-1] - 4]
    h, w = im.shape[:2]
    a = np.ones((h, w))
    r = 10                                                     # rounded corners
    yy, xx = np.ogrid[0:h, 0:w]
    for cy, cx in ((r, r), (r, w - r), (h - r, r), (h - r, w - r)):
        corner = ((yy < r) if cy == r else (yy > h - r)) & ((xx < r) if cx == r else (xx > w - r))
        a[corner & ((yy - cy) ** 2 + (xx - cx) ** 2 > r * r)] = 0
    save(np.dstack([im, a]), name)


bill = np.asarray(Image.open(src('src-bill100.jpg')).convert('RGB')).astype(np.float32) / 255
bill = bill * 0.92 + 0.04                                     # a little worn
save(np.dstack([bill, np.ones(bill.shape[:2])]), 'bill.png')
cut_note(src('src-dinar-front.jpg'), 'dinar.png')


# ---------- prints: black-and-white (or sepia) photos with a white border ----------
def to_print(path, name, crop=None, bw=True, sepia=False, size=720, border=26, contrast=1.15):
    im = Image.open(path).convert('RGB')
    if crop:
        w0, h0 = im.size
        im = im.crop((int(crop[0] * w0), int(crop[1] * h0), int(crop[2] * w0), int(crop[3] * h0)))
    im.thumbnail((size, size), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32) / 255
    if bw:
        L = a @ np.array([0.3, 0.59, 0.11])
        L = np.clip((L - 0.5) * contrast + 0.5, 0, 1)
        a = np.repeat(L[..., None], 3, -1)
        a = a * np.array([1.0, 0.985, 0.95])                   # silver print, a touch warm
    if sepia:
        L = a @ np.array([0.3, 0.59, 0.11])
        a = L[..., None] * np.array([1.0, 0.86, 0.66]) + 0.03
    h, w = a.shape[:2]
    out_ = np.ones((h + 2 * border, w + 2 * border, 3)) * np.array([0.95, 0.93, 0.88])
    out_[border:border + h, border:border + w] = a
    tex = noise(h + 2 * border, w + 2 * border, 80, 3)
    out_ = out_ * (0.95 + 0.07 * tex[..., None])
    save(np.dstack([out_, np.ones(out_.shape[:2])]), name)


to_print(src('src-fan100.jpg'), 'p-fan.png', crop=(0.0, 0.12, 1.0, 0.95), size=620)
to_print(src('src-bazaar1.jpg'), 'p-bazaar1.png', crop=(0.08, 0.05, 0.92, 0.95), size=700)
to_print(src('src-coffee-vic.jpg'), 'p-coffee.png', bw=False, sepia=True, crop=(0.04, 0.05, 0.96, 0.95), size=640)
to_print(src('src-bulb.jpg'), 'p-bulb.png', crop=(0.22, 0.3, 0.8, 0.8), size=520, contrast=1.3)
to_print(src('src-zahawi.jpg'), 'p-zahawi.png', bw=False, size=900, border=22)
to_print(src('src-falafel-wrap.jpg'), 'p-falafel.png', bw=False, crop=(0.0, 0.1, 0.95, 1.0), size=760, border=0)

# full-frame plates
def plate(path, name, crop_box, tint=None, blur=0, dark=1.0, inset=0.0):
    im = Image.open(path).convert('RGB')
    w0, h0 = im.size
    if inset:                                                 # trim a scan's own border
        im = im.crop((int(inset * w0), int(inset * h0), int((1 - inset) * w0), int((1 - inset) * h0))); w0, h0 = im.size
    cw = min(w0, h0 * W / H)
    x0 = int(crop_box * (w0 - cw))
    im = im.crop((x0, 0, int(x0 + cw), h0)).resize((W, H), Image.LANCZOS)
    if blur: im = im.filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(im).astype(np.float32) / 255
    L = a @ np.array([0.3, 0.59, 0.11])
    if tint is not None:
        a = L[..., None] * np.array(tint)
    a = a * dark * vignette(H, W, 0.7, 1.8)[..., None]
    save(a, name)

plate(src('src-bazaar2.jpg'), 'bazaar2.jpg', 0.42, tint=(1.0, 0.97, 0.92), inset=0.07)
# Al-Rashid Street as a sharp duotone: deep red-black shadows, warm cream lights (the «؟» bubbles sit on the people)
im = Image.open(src('src-rashid.jpg')).convert('RGB')
w0, h0 = im.size; cw = h0 * W / H; x0 = int(0.5 * (w0 - cw))
im = im.crop((x0, 0, int(x0 + cw), h0)).resize((W, H), Image.LANCZOS)
L = (np.asarray(im).astype(np.float32) / 255) @ np.array([0.3, 0.59, 0.11])
L = np.clip((L - 0.04) * 1.12, 0, 1) ** 1.15
stops = np.array([[0.03, 0.004, 0.008], [0.42, 0.035, 0.05], [0.97, 0.86, 0.76]])   # black-red, crimson, cream
k = np.clip(L * 2, 0, 2)[..., None]
duo = np.where(k < 1, stops[0] + (stops[1] - stops[0]) * k, stops[1] + (stops[2] - stops[1]) * (k - 1))
save(duo * vignette(H, W, 0.75, 1.7)[..., None], 'street.jpg')


# ---------- v3: cardboard seesaw, newsprint ----------
def cardboard(w, h, tri=False):
    m = noise(h, w, 90) * 0.6 + noise(h, w, 10, 2) * 0.4
    flute = 0.5 + 0.5 * np.sin(np.arange(w) / w * np.pi * 2 * (w / 14))[None, :]          # corrugation showing through
    rgb = np.array([0.69, 0.52, 0.34])[None, None, :] * (0.86 + 0.18 * m[..., None] + 0.04 * flute[..., None])
    a = np.ones((h, w))
    yy, xx = np.mgrid[0:h, 0:w]
    if tri:                                                     # a cut triangle, edges a touch uneven
        j = gaussian_filter(rng.standard_normal(h), 3) * 2.5
        half = (yy / h) * (w / 2 - 6) + j[:, None]
        a[np.abs(xx - w / 2) > half] = 0
        rgb *= (1.06 - 0.22 * (xx / w))[..., None]               # lit from the left
    else:
        rgb[h - 12:] *= 0.62                                    # the cut edge shows its thickness
        j = gaussian_filter(rng.standard_normal(w), 4) * 1.6
        a[yy < 2 + j[None, :]] = 0
    rgb *= (1.05 - 0.12 * ((xx / w + yy / h) / 2))[..., None]
    return np.dstack([np.clip(rgb, 0, 1), gaussian_filter(a, 0.7)])


save(cardboard(980, 62), 'plank.png')
save(cardboard(250, 270, tri=True), 'fulcrum.png')

# newsprint: grey-cream, fibrous, a little uneven (for the newspaper swipe and the ransom-note scraps)
m = noise(1024, 1024, 160) * 0.6 + noise(1024, 1024, 12, 2) * 0.4
fib = gaussian_filter(rng.standard_normal((1024, 1024)), (0.6, 2.5)) * 0.03
save(np.array([0.86, 0.84, 0.78])[None, None, :] * (0.9 + 0.12 * m[..., None] + fib[..., None]), 'newsprint.jpg')
print('ok', sorted(os.listdir(out)))
