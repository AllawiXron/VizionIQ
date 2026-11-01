"""python3 strip.py <dir>: rewrite every PNG in dir with its pixels only (no text, EXIF or other chunks)."""
import sys
from pathlib import Path

from PIL import Image

for f in Path(sys.argv[1]).glob('*.png'):
    im = Image.open(f)
    clean = Image.new(im.mode, im.size)
    clean.putdata(list(im.getdata())) if im.mode == 'P' else clean.paste(im)
    clean.save(f, optimize=True)
