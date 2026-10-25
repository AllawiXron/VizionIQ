# Iraq's 18 governorates as SVG paths for the home page map, with a point inside each for its name.
# python3 build/govmap.py  ->  site/data/govmap.json
import json, math, os
from shapely.geometry import shape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
NAMES = {'Al-Anbar': 'الأنبار', 'Al-Basrah': 'البصرة', 'Al-Muthanna': 'المثنى', 'An-Najaf': 'النجف', 'Al-Qadisiyah': 'القادسية',
         'Al-Sulaimaniyah': 'السليمانية', 'Babil': 'بابل', 'Baghdad': 'بغداد', 'Diyala': 'ديالى', 'Dohuk': 'دهوك', 'Erbil': 'أربيل',
         'Karbala': 'كربلاء', 'Kirkuk': 'كركوك', 'Maysan': 'ميسان', 'Ninawa': 'نينوى', 'Salah al-Din': 'صلاح الدين', 'Dhi Qar': 'ذي قار', 'Wasit': 'واسط'}
W, LON0, LON1, LAT0, LAT1 = 400, 38.75, 48.65, 29.05, 37.4
KX = math.cos(math.radians(33.2)); S = W / ((LON1 - LON0) * KX); H = round((LAT1 - LAT0) * S)
xy = lambda lon, lat: ((lon - LON0) * KX * S, (LAT1 - lat) * S)

ids = {g['n']: g['id'] for g in json.load(open(D('site', 'data', 'govs.json')))['govs']}
out = []
for f in json.load(open(D('data', 'irq_adm1.geojson')))['features']:
    g = shape(f['geometry']).simplify(0.01, preserve_topology=True)
    polys = list(g.geoms) if g.geom_type == 'MultiPolygon' else [g]
    d = ''.join('M' + 'L'.join('%.1f,%.1f' % xy(*c) for c in p.exterior.coords) + 'Z' for p in polys if p.area > 0.002)
    pt = shape(f['geometry']).representative_point()
    lx, ly = xy(pt.x, pt.y)
    out.append({'id': ids[NAMES[f['properties']['shapeName']]], 'd': d, 'x': round(lx), 'y': round(ly)})
json.dump({'w': W, 'h': H, 'shapes': out}, open(D('site', 'data', 'govmap.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print(W, H, round(os.path.getsize(D('site', 'data', 'govmap.json')) / 1e3), 'KB')
