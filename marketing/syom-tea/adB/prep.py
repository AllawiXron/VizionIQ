# Textures for the 3D scene, from the client's files (run ../fetch.sh first):
#   tex/pouch_art.jpg    the printed strip of the pouch (side, front, side, back) from the die-cut file
#   tex/pouch_gold.png   where that print is gold ink (metallic in the render)
#   tex/gobo.png         the palm and window shadow from the shoot (DSC05178), white where light passes
#   tex/tape.png         a 150 cm tailor's tape, 2 cm wide: cm and half-cm ticks, a number every cm, every tenth in red
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as nd

FILES = '../files/'
Image.MAX_IMAGE_PIXELS = None

# pouch print: the strip is x 240-5436, y 152-3459 in the 5677x4520 preview
art = Image.open(FILES + 'brand/5- Print Materials/pouch die cut preview only-02.png').convert('RGB')
strip = art.crop((240, 152, 5436, 3459)).resize((4096, 2607), Image.LANCZOS)
strip.save('tex/pouch_art.jpg', quality=94)
a = np.asarray(strip).astype(np.float32) / 255
hsv = cv2.cvtColor(np.asarray(strip), cv2.COLOR_RGB2HSV).astype(np.float32)
gold = (hsv[..., 0] > 8) & (hsv[..., 0] < 28) & (hsv[..., 1] > 70) & (hsv[..., 2] > 120)
gold = cv2.GaussianBlur(gold.astype(np.float32), (0, 0), 1.0)
Image.fromarray((gold * 255).astype(np.uint8)).save('tex/pouch_gold.png')

# gobo: the top of the shoot frame (window bars and palm fronds, above the pouch), white where light passes
shot = np.asarray(Image.open(FILES + 'shoot/Product Photo Session/photos- New pack/DSC05178.jpg').convert('L').resize((1600, 2400), Image.LANCZOS)).astype(np.float32)
top = shot[:930]
light = np.clip(top / np.percentile(top, 97), 0, 1)
light = np.clip((light - 0.70) / 0.22, 0, 1) ** 1.5  # deepen the shadows so they read on a dark green wall
Image.fromarray((light * 255).astype(np.uint8)).save('tex/gobo.png')

# tailor's tape: 150 cm at 64 px per cm, 2 cm wide
PX, CM, WD = 64, 150, 2.0
w, h = PX * CM, int(PX * WD)
tape = Image.new('RGB', (w, h), (200, 132, 6))
d = ImageDraw.Draw(tape)
font = ImageFont.truetype(FILES + 'brand/3- Fonts/LamaSans-BoldCondensed.ttf', int(h * 0.42))
font3 = ImageFont.truetype(FILES + 'brand/3- Fonts/LamaSans-BoldCondensed.ttf', int(h * 0.31))
for mm in range(0, CM * 10 + 1, 5):
    x = mm * PX / 10
    long = mm % 10 == 0
    for edge in (0, 1):
        y0 = 0 if edge == 0 else h
        ln = h * (0.26 if long else 0.15)
        d.line([(x, y0), (x, y0 + (ln if edge == 0 else -ln))], fill=(24, 20, 16), width=3 if long else 2)
    if long and 0 < mm < CM * 10:
        n = mm // 10
        col = (190, 30, 28) if n % 10 == 0 else (24, 20, 16)
        fnt = font if n < 100 else font3                 # three-digit numbers set smaller so they keep their own centimetre
        tb = d.textbbox((0, 0), str(n), font=fnt)
        d.text((x - (tb[2] - tb[0]) / 2, h / 2 - (tb[3] - tb[1]) / 2 - tb[1]), str(n), font=fnt, fill=col)
t = np.asarray(tape).astype(np.float32)
# woven fabric: fine noise and a faint weave so the ink doesn't look printed by a computer
rng = np.random.default_rng(3)
noise = cv2.GaussianBlur(rng.normal(0, 1, (h, w)).astype(np.float32), (0, 0), 0.8) * 5
weave = (np.sin(np.arange(w) * 0.9)[None, :] * np.sin(np.arange(h) * 0.9)[:, None]) * 3
t = np.clip(t + (noise + weave)[..., None], 0, 255)
Image.fromarray(t.astype(np.uint8)).save('tex/tape.png')
print('ok')
