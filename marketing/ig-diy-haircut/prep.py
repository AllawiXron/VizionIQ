# python3 prep.py -> img/guy.jpg: the AI portrait (photo/src-guy.jpg, 1200x896) on the 1080x1350 post. Scaled 1.3x and
# set at the bottom with his face at about x 330, so the whole haircut shows and the grey wall on the right holds the
# headline; the 185 px above the photo continue the wall (its top row, stretched and softened). Light warm grade.
from PIL import Image, ImageFilter, ImageEnhance

W, H, S, X0 = 1080, 1350, 1.3, 246
src = Image.open('photo/src-guy.jpg').convert('RGB')
ph = src.resize((round(src.width * S), round(src.height * S)), Image.LANCZOS).crop((X0, 0, X0 + W, round(src.height * S)))
ph = ph.filter(ImageFilter.UnsharpMask(radius=1.6, percent=70, threshold=2))
top = H - ph.height
ext = ph.crop((0, 0, W, 6)).resize((W, top + 60), Image.BILINEAR).filter(ImageFilter.GaussianBlur(14))
im = Image.new('RGB', (W, H))
im.paste(ext, (0, 0))
mask = Image.linear_gradient('L').resize((W, 60))           # fade the seam over 60 px
im.paste(ph.crop((0, 0, W, 60)), (0, top), mask)
im.paste(ph.crop((0, 60, W, ph.height)), (0, top + 60))
r, g, b = im.split()                                        # warm the greys a touch toward the brand paper
r = r.point(lambda v: min(255, v * 1.03 + 2)); b = b.point(lambda v: v * 0.95)
im = ImageEnhance.Contrast(Image.merge('RGB', (r, g, b))).enhance(1.04)
im.save('img/guy.jpg', quality=93)
print(im.size, 'photo top', top)
