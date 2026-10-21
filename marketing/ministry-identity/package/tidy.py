"""python3 package/tidy.py <package dir> <who.json>: the designer as author in the PDFs' and the PowerPoint's document
properties (title, author), and the PowerPoint's page format named as it is (A4, not 16:9)."""
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

from pypdf import PdfReader, PdfWriter

pkg, who = Path(sys.argv[1]), json.load(open(sys.argv[2]))
TITLE = 'مقترح الهوية البصرية لوزارة الاقتصاد الرقمي والحوكمة'

for pdf in pkg.rglob('*.pdf'):
    r = PdfReader(pdf)
    w = PdfWriter(clone_from=r)
    w.add_metadata({'/Title': TITLE if '01-' in str(pdf) or '02-' in str(pdf) else f'{TITLE} - {pdf.stem}',
                    '/Author': who['name'], '/Subject': 'بوابة عشتار.. بوابة العراق الرقمية'})
    with open(pdf, 'wb') as f:
        w.write(f)

for pptx in pkg.rglob('*.pptx'):
    tmp = pptx.with_suffix('.tmp')
    with zipfile.ZipFile(pptx) as zin, zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            data = zin.read(item.filename)
            if item.filename == 'docProps/core.xml':
                s = data.decode()
                s = re.sub(r'<dc:creator>.*?</dc:creator>', f"<dc:creator>{who['name']}</dc:creator>", s)
                s = re.sub(r'<cp:lastModifiedBy>.*?</cp:lastModifiedBy>', f"<cp:lastModifiedBy>{who['name']}</cp:lastModifiedBy>", s)
                data = s.encode()
            elif item.filename == 'docProps/app.xml':
                data = re.sub(rb'<PresentationFormat>.*?</PresentationFormat>', b'<PresentationFormat>A4 Paper (210x297 mm)</PresentationFormat>', data)
            zout.writestr(item, data)
    shutil.move(tmp, pptx)
print('tidied', pkg)
