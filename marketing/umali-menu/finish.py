# PDFs at exact print size (13 cm, or 13.6 cm with bleed), post size from the 13 cm print, 300 dpi stamp on the print files, and PNGs with no extra chunks.
import sys, os
from PIL import Image

out = sys.argv[1]
trim = Image.open(os.path.join(out, 'menu-print.png')).convert('RGB')
trim.resize((1080, 1080), Image.LANCZOS).save(os.path.join(out, 'menu-post.png'), optimize=True)
for n in ('menu-print.png', 'menu-print-bleed.png'):
    im = Image.open(os.path.join(out, n)).convert('RGB')
    im.save(os.path.join(out, n), dpi=(300, 300), optimize=True)
    im.save(os.path.join(out, n.replace('.png', '.jpg')), dpi=(300, 300), quality=95, subsampling=0)
    im.save(os.path.join(out, n.replace('.png', '.pdf')), resolution=300, title='معجنات العافية', author='Ali')
st = Image.open(os.path.join(out, 'menu-story.png')).convert('RGB')
st.save(os.path.join(out, 'menu-story.png'), optimize=True)
print('done')
