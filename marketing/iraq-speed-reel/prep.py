# Real material for the reel, from the site's own data: Karrada's streets with the speed of their squares
# (decoded from the site's z13 tiles), the outlines of the digits ٨٧ in Rubik, and Iraq's 18 governorates.
# python3 prep.py  ->  data.js
import gzip, json, math, os, re
import mapbox_vector_tile
from pmtiles.reader import Reader, MmapSource
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen

HERE = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(HERE, '..', 'iraq-internet-map', 'site')

def tile_of(lon, lat, z):
    n = 2 ** z
    x = int((lon + 180) / 360 * n)
    y = int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)
    return x, y

def lonlat(z, x, y, px, py, extent=4096):
    n = 2 ** z
    lon = (x + px / extent) / n * 360 - 180
    lat = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + py / extent) / n))))   # rows run down the tile
    return lon, lat

# Karrada and the streets around it
karrada = json.load(open(os.path.join(SITE, 'data', 'areas', 'baghdad.json')))['r2964648']
ring = karrada['coordinates'][0] if karrada['type'] == 'Polygon' else karrada['coordinates'][0][0]
xs = [c[0] for c in ring]; ys = [c[1] for c in ring]
cx, cy = (min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2
half = max(max(xs) - min(xs), (max(ys) - min(ys)) / math.cos(math.radians(cy))) * 0.72
box = (cx - half, cy - half * math.cos(math.radians(cy)) * 1.25, cx + half, cy + half * math.cos(math.radians(cy)) * 1.25)
z = 13
r = Reader(MmapSource(open(os.path.join(SITE, 'tiles', 'iraq-c.pmtiles'), 'rb')))
x0, y1 = tile_of(box[0], box[1], z); x1, y0 = tile_of(box[2], box[3], z)
streets = []
for tx in range(x0, x1 + 1):
    for ty in range(y0, y1 + 1):
        data = r.get(z, tx, ty)
        if not data:
            continue
        if data[:2] == b'\x1f\x8b':
            data = gzip.decompress(data)
        layers = mapbox_vector_tile.decode(data, default_options={'y_coord_down': True})
        for f in layers.get('rd', {}).get('features', []):
            g = f['geometry']; lines = [g['coordinates']] if g['type'] == 'LineString' else g['coordinates']
            for ln in lines:
                pts = [lonlat(z, tx, ty, px, py) for px, py in ln]
                if all(not (box[0] <= p[0] <= box[2] and box[1] <= p[1] <= box[3]) for p in pts):
                    continue
                streets.append({'p': [[round(a, 6), round(b, 6)] for a, b in pts], 'f': f['properties'].get('f', -1), 'r': f['properties'].get('r', 5)})
print(len(streets), 'street pieces')

# the digits ٨٧ (U+0668 U+0667) as outlines, flattened to points, in font units
font = TTFont(os.path.join(SITE, 'fonts', 'Rubik-Arabic-800.woff2'))
cmap = font.getBestCmap(); gs = font.getGlyphSet()
def outline(ch):
    pen = RecordingPen(); gs[cmap[ord(ch)]].draw(pen)
    rings, cur, last = [], [], None
    for op, args in pen.value:
        if op == 'moveTo':
            cur = [args[0]]; last = args[0]
        elif op == 'lineTo':
            cur.append(args[0]); last = args[0]
        elif op == 'qCurveTo':
            pts = [last] + list(args)
            # implied on-curve points between consecutive off-curve points
            seq = [pts[0]]
            for i in range(1, len(pts) - 1):
                seq.append(pts[i])
                if i < len(pts) - 2:
                    seq.append(((pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2, 'on'))
            seq.append(pts[-1])
            p0 = seq[0]; i = 1
            while i < len(seq):
                c, p1 = seq[i], seq[i + 1]
                for k in range(1, 9):
                    t = k / 8
                    cur.append(((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p1[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p1[1]))
                p0 = p1; i += 2
            last = args[-1]
        elif op == 'curveTo':
            p0 = last; c1, c2, p1 = args
            for k in range(1, 11):
                t = k / 10
                cur.append(tuple((1 - t) ** 3 * p0[j] + 3 * (1 - t) ** 2 * t * c1[j] + 3 * (1 - t) * t * t * c2[j] + t ** 3 * p1[j] for j in (0, 1)))
            last = p1
        elif op in ('closePath', 'endPath'):
            if cur:
                rings.append([[round(p[0], 1), round(p[1], 1)] for p in cur]); cur = []
    return rings, gs[cmap[ord(ch)]].width
digits = []
adv = 0
for ch in '٨٧':                 # set right to left: ٨ first on the right
    rings, w = outline(ch)
    digits.append({'ch': ch, 'rings': rings, 'w': w})

# governorates (the site's own home-map paths) with their speeds
gm = json.load(open(os.path.join(SITE, 'data', 'govmap.json')))
govs = {g['id']: g for g in json.load(open(os.path.join(SITE, 'data', 'govs.json')))['govs']}
shapes = []
for s in gm['shapes']:
    polys = [[[float(a), float(b)] for a, b in re.findall(r'(-?[\d.]+),(-?[\d.]+)', part)] for part in s['d'].split('M') if part.strip()]
    g = govs[s['id']]
    shapes.append({'id': s['id'], 'n': g['n'], 'd': g['f']['d'], 't': g['f']['t'], 'polys': polys, 'x': s['x'], 'y': s['y']})
country = json.load(open(os.path.join(SITE, 'data', 'country.json')))
out = {'karrada': {'ring': ring, 'box': box}, 'streets': streets, 'digits': digits, 'upm': font['head'].unitsPerEm,
       'govmap': {'w': gm['w'], 'h': gm['h'], 'shapes': shapes}, 'years': [h[0] for h in country['h']], 'iraq': country['f']['d']}
open(os.path.join(HERE, 'data.js'), 'w').write('window.DATA = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('data.js', round(os.path.getsize(os.path.join(HERE, 'data.js')) / 1e3), 'KB')
