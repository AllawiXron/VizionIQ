# Draws the map plates for the phone stills: Iraq at night lit by home-internet speed,
# Baghdad with Karrada picked out, and the exam-morning light lines.
# python3 stills/maps.py [hero|baghdad|mornings]   (needs data/ and base/ from data/fetch.py)
import json, math, os
import numpy as np
import pickle
import duckdb, shapefile, shapely.wkb
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, map_coordinates
from shapely.geometry import shape, Point
from shapely.prepared import prep

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
W, H = 1170, 2532          # 390 x 844 phone screen at 3x
COS = math.cos(math.radians(33))
Image.MAX_IMAGE_PIXELS = None

# speed -> light: dim ember for slow lines, amber, then warm white for fast ones
RAMP = [(0.00, (110, 28, 8)), (0.35, (226, 104, 28)), (0.65, (255, 184, 86)), (1.00, (255, 244, 222))]

def ramp(v):
    v = np.clip(v, 0, 1)
    out = np.zeros(v.shape + (3,))
    for (a, ca), (b, cb) in zip(RAMP, RAMP[1:]):
        m = (v >= a) & (v <= b)
        t = ((v - a) / (b - a))[m][:, None]
        out[m] = np.array(ca) * (1 - t) + np.array(cb) * t
    return out / 255

def speed_v(mbps):
    return np.clip((np.log(np.maximum(mbps, 1)) - math.log(4)) / (math.log(200) - math.log(4)), 0, 1)

def tiles():
    c = duckdb.connect()
    return c.sql(f"SELECT quadkey, tile_x, tile_y, avg_d_kbps/1000.0 d, tests FROM '{D('data', 'fixed_2026q3_iraq.parquet')}'").fetchnumpy()

def iraq_shape():
    r = shapefile.Reader(D('base', 'ne_adm0', 'ne_10m_admin_0_countries.shp'))
    for s, rec in zip(r.shapes(), r.records()):
        if rec['ADM0_A3'] == 'IRQ':
            return shape(s.__geo_interface__)

def rivers():
    r = shapefile.Reader(D('base', 'ne_rivers', 'ne_10m_rivers_lake_centerlines.shp'))
    keep = {'Tigris', 'Euphrates', 'Shatt al Arab', 'Diyala', 'Great Zab', 'Little Zab', 'Dijlah', 'Al Furat'}
    for s, rec in zip(r.shapes(), r.records()):
        if rec['name'] in keep or rec['name_en'] in keep:
            yield s

def tone(x):
    return 1 - np.exp(-x)

def save(img, name):
    a = (np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8)
    Image.fromarray(a).save(D('stills', 'plates', name), optimize=True)

def sample_gray(path, bbox, ppd_x, ppd_y, lon, lat):
    g = np.asarray(Image.open(path).convert('L'), dtype=np.float32) / 255
    sx = (lon - bbox[0]) * ppd_x
    sy = (bbox[3] - lat) * ppd_y
    return map_coordinates(g, [sy, sx], order=1, mode='nearest'), g


def hero():
    k, L0, T0 = 225.0, 42.5, 40.37
    X = lambda lon: (lon - L0) * k * COS
    Y = lambda lat: (T0 - lat) * k
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    lon = L0 + xx / (k * COS); lat = T0 - yy / k

    bbox = (41.5, 28.5, 49.5, 41.0)
    rel, _ = sample_gray(D('base', 'hero_ASTER_GDEM_Greyscale_Shaded_Relief.png'), bbox, 400, 400, lon, lat)
    bm = np.asarray(Image.open(D('base', 'hero_VIIRS_Black_Marble.png')).convert('RGB'), dtype=np.float32) / 255
    sx = (lon - bbox[0]) * 400; sy = (bbox[3] - lat) * 400
    blum = map_coordinates(bm.mean(axis=2), [sy, sx], order=1, mode='nearest')

    iq = iraq_shape()
    mask = Image.new('L', (W, H), 0); md = ImageDraw.Draw(mask)
    polys = iq.geoms if iq.geom_type == 'MultiPolygon' else [iq]
    for p in polys:
        md.polygon([(X(x), Y(y)) for x, y in p.exterior.coords], fill=255)
    inside = gaussian_filter(np.asarray(mask, dtype=np.float32) / 255, 2)

    # ground: a cold night blue-black with the real relief pressed into it; water a shade deeper
    shade = gaussian_filter(rel, 0.8) - np.median(rel)
    water = (rel < 0.33).astype(np.float32)
    ground = np.stack([0.034 + shade * 0.16, 0.040 + shade * 0.17, 0.055 + shade * 0.20], -1)
    ground = ground * (1 - water[..., None] * 0.45)
    ground *= (0.62 + 0.38 * inside)[..., None]
    # neighbours keep their real electric light from the NASA plate, grey and faint, so the eye knows where it is
    elec = np.clip((blum - 0.30) / 0.7, 0, 1) ** 1.6 * (1 - inside)
    ground += gaussian_filter(elec, 1.5)[..., None] * np.array([0.10, 0.095, 0.09])

    img = ground.copy()
    rv = Image.new('L', (W, H), 0); rd = ImageDraw.Draw(rv)
    for s in rivers():
        pts = s.points; parts = list(s.parts) + [len(pts)]
        for a, b in zip(parts, parts[1:]):
            rd.line([(X(x), Y(y)) for x, y in pts[a:b]], fill=255, width=3)
    riv = gaussian_filter(np.asarray(rv, dtype=np.float32) / 255, 1.0)
    img *= (1 - 0.55 * riv)[..., None]

    t = tiles()
    v = speed_v(t['d']); conf = 0.45 + 0.55 * np.minimum(1, t['tests'] / 8)
    lum = (0.10 + 0.90 * v ** 1.5) * conf
    col = ramp(v) * lum[:, None]
    px = X(t['tile_x']); py = Y(t['tile_y'])
    acc = np.zeros((H, W, 3)); cnt = np.zeros((H, W))
    x0 = np.floor(px).astype(int); y0 = np.floor(py).astype(int); fx = px - x0; fy = py - y0
    for dx, dy, w in [(0, 0, (1 - fx) * (1 - fy)), (1, 0, fx * (1 - fy)), (0, 1, (1 - fx) * fy), (1, 1, fx * fy)]:
        xi, yi = x0 + dx, y0 + dy
        ok = (xi >= 0) & (xi < W) & (yi >= 0) & (yi < H)
        np.add.at(acc, (yi[ok], xi[ok]), col[ok] * w[ok][:, None])
        np.add.at(cnt, (yi[ok], xi[ok]), w[ok])
    light = acc / np.maximum(cnt, 1)[..., None] * np.minimum(cnt, 1)[..., None] * 1.25
    core = np.stack([gaussian_filter(light[..., i], 0.55) for i in range(3)], -1)
    b1 = np.stack([gaussian_filter(light[..., i], 3.5) for i in range(3)], -1)
    b2 = np.stack([gaussian_filter(light[..., i], 14) for i in range(3)], -1)
    glow = core * 1.7 + b1 * 1.5 + b2 * 1.4
    # main roads from OpenStreetMap carry the light of the squares they pass; desert stretches stay almost dark
    rm = Image.new('L', (W * 2, H * 2), 0); rmd = ImageDraw.Draw(rm)
    for hw, g in pickle.load(open(D('base', 'osm_iraq_main_roads.pkl'), 'rb')):
        if g.geom_type not in ('LineString', 'MultiLineString'):
            continue
        wd = 3 if hw in ('motorway', 'trunk', 'primary') else 2
        for ln in (g.geoms if g.geom_type == 'MultiLineString' else [g]):
            rmd.line([(X(x) * 2, Y(y) * 2) for x, y in ln.coords], fill=255, width=wd)
    road = np.asarray(rm.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
    near = np.stack([gaussian_filter(light[..., i], 5) for i in range(3)], -1)
    glow = glow + road[..., None] * (np.clip(near * 9, 0, 1.2) * 0.9 + np.array([0.025, 0.026, 0.03]) * inside[..., None])
    img = img + tone(glow * 1.15)
    # lens falloff toward the frame corners
    r = np.hypot((xx - W * 0.55) / W, (yy - H * 0.55) / H)
    img *= (1 - 0.35 * np.clip(r - 0.25, 0, 1) ** 1.3)[..., None]
    save(img, 'hero.png')
    # the same country with its lights almost out, behind the exam-morning page
    dark = ground * 0.85 + tone(glow * 0.10)
    dark *= (1 - 0.35 * np.clip(r - 0.25, 0, 1) ** 1.3)[..., None]
    dark *= (1 - 0.5 * np.clip((0.3 - yy / H) / 0.3, 0, 1))[..., None]
    save(dark, 'exam_bg.png')

    places = {'بغداد': (44.39, 33.33), 'البصرة': (47.79, 30.52), 'الموصل': (43.13, 36.35), 'أربيل': (44.01, 36.19),
              'السليمانية': (45.43, 35.56), 'كركوك': (44.39, 35.47), 'النجف': (44.33, 32.0), 'كربلاء': (44.02, 32.61),
              'الناصرية': (46.26, 31.05), 'العمارة': (47.15, 31.84), 'الكوت': (45.82, 32.51), 'الرمادي': (43.30, 33.42),
              'دهوك': (42.99, 36.87), 'الحلة': (44.43, 32.48), 'السماوة': (45.29, 31.31), 'الديوانية': (44.93, 31.99),
              'بعقوبة': (44.64, 33.75), 'تكريت': (43.68, 34.61)}
    json.dump({n: [round(X(a) / 3, 1), round(Y(b) / 3, 1)] for n, (a, b) in places.items()},
              open(D('stills', 'plates', 'hero_places.json'), 'w'), ensure_ascii=False)


def quad_bounds(q):
    x = y = 0
    for ch in q:
        d = int(ch); x = x * 2 + (d & 1); y = y * 2 + (d >> 1)
    n = 2 ** len(q)
    lon0 = x / n * 360 - 180; lon1 = (x + 1) / n * 360 - 180
    lat = lambda yy: math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * yy / n))))
    return lon0, lat(y + 1), lon1, lat(y)


def baghdad():
    k, L0, T0 = 6966.0, 44.300, 33.545
    X = lambda lon: (lon - L0) * k * COS
    Y = lambda lat: (T0 - lat) * k
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    lon = L0 + xx / (k * COS); lat = T0 - yy / k
    rel, _ = sample_gray(D('base', 'bgd_relief.png'), (44.25, 33.12, 44.55, 33.57), 6000, 6000, lon, lat)
    shade = gaussian_filter(rel, 1.2) - np.median(rel)
    img = np.stack([0.030 + shade * 0.05, 0.036 + shade * 0.055, 0.050 + shade * 0.065], -1)

    karr = shape(json.load(open(D('data', 'karrada.json')))['features'][0]['geometry']); kp = prep(karr)
    t = tiles()
    sel = (t['tile_x'] > 44.25) & (t['tile_x'] < 44.56) & (t['tile_y'] > 33.10) & (t['tile_y'] < 33.58)
    # the speed of each 500 m square, as a colour field
    field = Image.new('RGB', (W, H), (0, 0, 0)); fd = ImageDraw.Draw(field)
    has = Image.new('L', (W, H), 0); hd = ImageDraw.Draw(has)
    for q, tx, ty, d, n in zip(t['quadkey'][sel], t['tile_x'][sel], t['tile_y'][sel], t['d'][sel], t['tests'][sel]):
        a, b, c, e = quad_bounds(q)
        box = [X(a), Y(e), X(c), Y(b)]
        if box[2] < 0 or box[0] > W or box[3] < 0 or box[1] > H:
            continue
        vv = float(speed_v(np.array([d]))[0]); conf = 0.4 + 0.6 * min(1, n / 10)
        lum = (0.10 + 0.90 * vv ** 1.5) * conf * (1.0 if kp.contains(Point(tx, ty)) else 0.28)
        fd.rectangle(box, fill=tuple(int(255 * min(1, x)) for x in ramp(np.array([vv]))[0] * lum))
        hd.rectangle(box, fill=255)
    field = np.asarray(field, dtype=np.float32) / 255
    field = np.stack([gaussian_filter(field[..., i], 4) for i in range(3)], -1)

    # the light itself follows Baghdad's real streets (OpenStreetMap), each street taking the speed of its square
    widths = {'motorway': 5, 'trunk': 5, 'primary': 4.2, 'secondary': 3.6, 'tertiary': 3, 'motorway_link': 3, 'trunk_link': 3,
              'primary_link': 3, 'secondary_link': 2.6, 'unclassified': 2.2, 'residential': 1.8, 'living_street': 1.6, 'service': 1.3}
    roads = pickle.load(open(D('base', 'osm_baghdad_roads.pkl'), 'rb'))
    rm = Image.new('L', (W * 2, H * 2), 0); rmd = ImageDraw.Draw(rm)
    for hw, g in sorted(roads, key=lambda r: widths.get(r[0], 0)):
        wd = widths.get(hw)
        if not wd or g.geom_type not in ('LineString', 'MultiLineString'):
            continue
        for ln in (g.geoms if g.geom_type == 'MultiLineString' else [g]):
            rmd.line([(X(x) * 2, Y(y) * 2) for x, y in ln.coords], fill=int(150 + 105 * min(1, wd / 4.2)), width=max(1, round(wd * 2)))
    road = np.asarray(rm.resize((W, H), Image.LANCZOS), dtype=np.float32) / 255
    nodata = road * (1 - np.clip(gaussian_filter(np.asarray(has, dtype=np.float32) / 255, 4), 0, 1))
    light = road[..., None] * field * 2.6 + nodata[..., None] * np.array([0.05, 0.055, 0.065])
    core = np.stack([gaussian_filter(light[..., i], 0.6) for i in range(3)], -1)
    b1 = np.stack([gaussian_filter(light[..., i], 6) for i in range(3)], -1)
    b2 = np.stack([gaussian_filter(light[..., i], 30) for i in range(3)], -1)
    img = img + tone(core * 1.15 + b1 * 0.5 + b2 * 0.32)

    # the Tigris from its real banks; it takes a faint, cold reflection of the city around it
    wm = Image.new('L', (W, H), 0); wmd = ImageDraw.Draw(wm)
    c2 = duckdb.connect()
    for name, gb in c2.sql(f"SELECT name, g FROM '{D('base', 'osm_baghdad_water.parquet')}'").fetchall():
        g = shapely.wkb.loads(bytes(gb))
        for poly in (g.geoms if g.geom_type == 'MultiPolygon' else [g]):
            if poly.area < 2e-6 and not (name and 'دجلة' in name):
                continue
            wmd.polygon([(X(x), Y(y)) for x, y in poly.exterior.coords], fill=255)
            for hole in poly.interiors:
                wmd.polygon([(X(x), Y(y)) for x, y in hole.coords], fill=0)
    water = gaussian_filter(np.asarray(wm, dtype=np.float32) / 255, 1.2)
    refl = np.stack([gaussian_filter(light[..., i], 14) for i in range(3)], -1) * np.array([0.35, 0.40, 0.55])
    img = img * (1 - water[..., None]) + water[..., None] * (np.array([0.010, 0.016, 0.028]) + tone(refl * 0.9))
    r = np.hypot((xx - W * 0.6) / W, (yy - H * 0.62) / H)
    img *= (1 - 0.45 * np.clip(r - 0.2, 0, 1) ** 1.2)[..., None]
    # burn the top and bottom of the print where the type sits
    burn = 1 - 0.55 * np.clip((0.40 - yy / H) / 0.40, 0, 1) ** 1.4 - 0.6 * np.clip((yy / H - 0.80) / 0.20, 0, 1) ** 1.3
    img *= burn[..., None]
    save(img, 'baghdad.png')

    pl = json.load(open(D('data', 'bgd_places_nominatim.json')))
    extra = {'Adhamiyah': ('الأعظمية', 44.3652, 33.3700), 'Yarmouk': ('اليرموك', 44.3366, 33.2964),
             'Hay al-Jamia': ('حي الجامعة', 44.3259, 33.3237), 'Bayaa': ('البياع', 44.3455, 33.2697)}
    names = {}
    for key in ['Al-Mansour', 'Sadr City', 'Kadhimiya', 'Zayouna', 'Jadriya', 'New Baghdad', 'Saydiya', 'Bab al-Sharqi']:
        p = pl[key]; names[p['ar']] = (p['lon'], p['lat'])
    names['الدورة'] = (44.395, 33.245)
    for k2, (ar, a, b) in extra.items():
        names[ar] = (a, b)
    names.pop('الكرادة', None)
    json.dump({n: [round(X(a) / 3, 1), round(Y(b) / 3, 1)] for n, (a, b) in names.items()},
              open(D('stills', 'plates', 'baghdad_places.json'), 'w'), ensure_ascii=False)
    kc = karr.centroid
    json.dump({'karrada': [round(X(kc.x) / 3, 1), round(Y(kc.y) / 3, 1)]}, open(D('stills', 'plates', 'baghdad_focus.json'), 'w'))


def mornings():
    rows = json.load(open(D('data', 'ioda_exam_mornings.json')))
    PW, row_h = 1170, 18
    by = {2025: [r for r in rows if r['date'].startswith('2025')], 2026: [r for r in rows if r['date'].startswith('2026')]}
    for year, rs in by.items():
        h = len(rs) * row_h + 60
        light = np.zeros((h, PW, 3))
        for i, r in enumerate(rs):
            v = np.array([x if x is not None else np.nan for x in r['values']], dtype=float)
            base = np.nanmedian(v[:10])
            v = np.clip(v / base, 0, 1.05)
            # time runs right to left, 04:00 at the right edge and 10:00 at the left
            tt = np.linspace(0, len(v) - 1, PW)
            line = np.interp(tt, np.arange(len(v)), np.nan_to_num(v, nan=1.0))[::-1]
            y = 30 + i * row_h
            c = ramp(0.12 + 0.58 * line ** 1.6) * (0.08 + 0.92 * line ** 2.2)[:, None]
            light[y:y + 2, :, :] += c[None, :, :] * 1.3
        core = np.stack([gaussian_filter(light[..., j], 0.8) for j in range(3)], -1)
        b1 = np.stack([gaussian_filter(light[..., j], 5) for j in range(3)], -1)
        # light only, on black; the page lays it over the background with a screen blend
        img = tone(core * 1.5 + b1 * 1.1)
        save(img, f'mornings_{year}.png')


def grain():
    rng = np.random.default_rng(7)
    g = gaussian_filter(rng.normal(0.5, 0.16, (H, W)), 0.55)
    Image.fromarray((np.clip(g, 0, 1) * 255).astype(np.uint8), 'L').save(D('stills', 'plates', 'grain.png'), optimize=True)


if __name__ == '__main__':
    import sys
    os.makedirs(D('stills', 'plates'), exist_ok=True)
    for name in sys.argv[1:] or ['hero', 'baghdad', 'mornings', 'grain']:
        globals()[name](); print(name)
    # the page reads label positions from a script, since file:// pages can't fetch
    pl = {n: json.load(open(D('stills', 'plates', f))) for n, f in
          [('hero', 'hero_places.json'), ('bgd', 'baghdad_places.json'), ('focus', 'baghdad_focus.json')]}
    open(D('stills', 'plates', 'places.js'), 'w').write('window.PLACES = ' + json.dumps(pl, ensure_ascii=False) + ';\n')
