"""Profile-grid preview: grid-preview.jpg shows the allawi.psd grid once every post in captions.txt is up, newest
top-left, as Instagram's 3:4 tiles (a 4:5 post loses a thin strip on each side). The last tile is the أعمالي carousel
cover (../ig-portfolio-cover/out/slide-01.png).   python grid_preview.py"""
from PIL import Image

# newest first = reverse of the posting order in captions.txt (the 2026 set was posted after the first six)
TILES = ['talabat', 'asiacell', 'pepsi', 'iqa', 'qi', 'sala', 'waseet', 'saj', 'miswag', 'faqma', 'baly', None]
TW, GAP = 362, 1
TH = round(TW * 4 / 3)


def tile(path):
    im = Image.open(path).convert('RGB')
    w = round(im.height * 3 / 4)                          # 3:4 window, centred
    x = (im.width - w) // 2
    return im.crop((x, 0, x + w, im.height)).resize((TW, TH), Image.LANCZOS)


rows = (len(TILES) + 2) // 3
grid = Image.new('RGB', (3 * TW + 2 * GAP, rows * TH + (rows - 1) * GAP), (240, 240, 240))
for i, k in enumerate(TILES):
    src = f'out/{k}-1.png' if k else '../ig-portfolio-cover/out/slide-01.png'
    grid.paste(tile(src), ((i % 3) * (TW + GAP), (i // 3) * (TH + GAP)))
grid.save('grid-preview.jpg', quality=88)
print(grid.size)
