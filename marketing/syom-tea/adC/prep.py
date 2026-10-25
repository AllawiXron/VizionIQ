# Photo layers for ad C (2D), from the client's shoot (run ../fetch.sh first):
#   img/pouch.png  the new pouch, front on (DSC05046), cut along its outline, warmed slightly for the green field
#   img/light.jpg  the window and palm shadow from DSC05178, as a light pattern for the green field
import numpy as np, cv2
from PIL import Image, ImageDraw
from scipy import ndimage as nd
from scipy.spatial import ConvexHull

SHOOT = '../files/shoot/Product Photo Session/photos- New pack/'

im = Image.open(SHOOT + 'DSC05046.jpg').convert('RGB')
im = im.resize((im.width // 2, im.height // 2), Image.LANCZOS)
a = np.asarray(im).astype(np.float32)
lum = a @ np.array([0.3, 0.59, 0.11], np.float32)
m = lum < 165
m = nd.binary_opening(m, iterations=3)
lab, n = nd.label(m)
m = lab == (np.argmax(nd.sum(m, lab, range(1, n + 1))) + 1)
ys, xs = np.nonzero(m)
pts = np.c_[xs, ys][ConvexHull(np.c_[xs, ys]).vertices]
mask = Image.new('L', im.size, 0)
ImageDraw.Draw(mask).polygon([tuple(p) for p in pts], fill=255)
alpha = cv2.GaussianBlur(np.asarray(mask).astype(np.float32), (0, 0), 1.0)
# pull the edge in by a pixel so no white sweep shows around it
alpha = np.clip((alpha - 60) * 1.4, 0, 255)
warm = np.clip(a * np.array([1.03, 1.0, 0.95]), 0, 255)
out = np.dstack([warm, alpha]).astype(np.uint8)
bb = Image.fromarray(alpha.astype(np.uint8)).getbbox()
Image.fromarray(out).crop(bb).save('img/pouch.png', optimize=True)

g = np.asarray(Image.open('../adB/tex/gobo.png').convert('L')).astype(np.float32)
g = cv2.resize(np.ascontiguousarray(np.rot90(g, -1)), (1080, 1920), interpolation=cv2.INTER_CUBIC)
g = cv2.GaussianBlur(g, (0, 0), 5)
Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).save('img/light.jpg', quality=92)
print(Image.open('img/pouch.png').size)
