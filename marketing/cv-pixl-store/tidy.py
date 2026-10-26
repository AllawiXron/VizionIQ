"""python3 tidy.py: the PDF carries the designer as author and no browser creator string; the PNG keeps only its pixels."""
from pathlib import Path
from pypdf import PdfReader, PdfWriter
from PIL import Image

out = Path(__file__).parent / 'out'
pdf = out / 'Ali-Ahmed-Shihab-CV.pdf'
w = PdfWriter(clone_from=PdfReader(pdf))
w._info = None
w.add_metadata({'/Title': 'السيرة الذاتية - علي احمد شهاب', '/Author': 'علي احمد شهاب'})
with open(pdf, 'wb') as f:
    w.write(f)

png = out / 'Ali-Ahmed-Shihab-CV.png'
im = Image.open(png)
im.load()
Image.frombytes(im.mode, im.size, im.tobytes()).save(png)
print('tidied')
