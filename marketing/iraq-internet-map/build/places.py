# Every searchable area with its numbers: governorates, cities, towns, villages and neighbourhoods.
# python3 build/places.py  ->  site/data/places.json, govs.json, country.json and areas/<gov>.json
import glob, json, math, os, re
import numpy as np
import duckdb
import shapely.wkb
from shapely.geometry import shape, Point, Polygon, mapping
from shapely.prepared import prep
from shapely.strtree import STRtree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
YEARS = list(range(2019, 2027))
COS = math.cos(math.radians(33))

GOV_AR = {'Al-Anbar': 'الأنبار', 'Karbala': 'كربلاء', 'An-Najaf': 'النجف', 'Babil': 'بابل', 'Baghdad': 'بغداد',
          'Al-Qadisiyah': 'القادسية', 'Al-Muthanna': 'المثنى', 'Dhi Qar': 'ذي قار', 'Al-Basrah': 'البصرة', 'Maysan': 'ميسان',
          'Wasit': 'واسط', 'Ninawa': 'نينوى', 'Dohuk': 'دهوك', 'Salah al-Din': 'صلاح الدين', 'Diyala': 'ديالى', 'Kirkuk': 'كركوك',
          'Erbil': 'أربيل', 'Al-Sulaimaniyah': 'السليمانية'}
GOV_SLUG = {k: re.sub(r'[^a-z]', '', k.lower()) for k in GOV_AR}
# how far around a point the squares are counted, in km, when OSM has no outline
RADIUS = {'city': 4.0, 'town': 2.0, 'village': 0.9, 'hamlet': 0.6, 'suburb': 1.2, 'neighbourhood': 0.7, 'quarter': 0.8, 'area': 0.8}
ZOOM = {'gov': 8, 'city': 11.5, 'town': 12.5, 'village': 13.5, 'hamlet': 14, 'suburb': 13.5, 'neighbourhood': 14.2, 'quarter': 14, 'area': 14}
MIN_TESTS = 10
DIGITS = str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩')
# a bigger place wins a shared name: a village called الفلوجه must not hide the city of Fallujah
RANK = {'city': 0, 'town': 1, 'suburb': 2, 'quarter': 2, 'neighbourhood': 3, 'area': 3, 'village': 4, 'hamlet': 5}
# OSM entries tagged as places that are really buildings or institutions
# spellings people type that OSM does not carry, and an alias that sends a search to the wrong place
EXTRA_NAMES = {'الكرادة': ['كرادة داخل', 'كرادة خارج']}
DROP_NAMES = {'نهر العشار'}
KURDISH_LETTERS = re.compile('[ەێۆڵڕڤ]')
JUNK = re.compile(r'^(برج|جامعة|كلية|مدرسة|مستشفى|مسجد|جامع|محطة|شركة|معمل|مصفى)\s|/')


KURDISH = set('ەێۆڵڕھڤېۊ')


def arabic(p):
    """The Arabic name: OSM's main name when it is Arabic, otherwise name:ar (Kurdish names fall back to name:ar)."""
    names = [p.get(k) for k in ('name', 'name_ar', 'name:ar')]
    names = [v for v in names if v and any('\u0600' <= ch <= '\u06ff' for ch in v)]
    pick = [v for v in names if not KURDISH & set(v) and ' - ' not in v] or names
    if not pick:
        return None
    v = pick[0].split(' - ')[0].replace('ی', 'ي').replace('ک', 'ك').replace('\u200e', '').replace('\u200f', '')
    return ' '.join(v.split()).translate(DIGITS)


def city_radius(pop):
    try:
        return round(min(10, max(3, 2.5 + 6 * (math.log10(float(pop)) - 5))), 1)
    except (TypeError, ValueError):
        return 4.0


def others(p, name):
    """Every other name OSM gives the place (Kurdish, English, older Arabic spellings), for search."""
    seen, out = {name}, []
    for k in ('name', 'name_ar', 'name:ar', 'name_en', 'name:en', 'name_latin'):
        v = p.get(k)
        if v:
            for part in str(v).split(' - '):
                part = ' '.join(part.replace('\u200e', '').replace('\u200f', '').split())
                if part and part not in seen:
                    seen.add(part); out.append(part)
    return out


def norm(s):
    s = re.sub('[\u064B-\u0652\u0640]', '', s)
    s = s.translate(str.maketrans({'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ة': 'ه', 'ى': 'ي', 'ؤ': 'و', 'ئ': 'ي'}))
    s = s.translate(str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789'))
    return re.sub(r'^(ال)', '', s.strip())


def load_squares(name):
    c = duckdb.connect()
    return c.sql(f"SELECT x, y, d, u, lat, tests FROM '{D('base', 'ookla', name)}'").fetchnumpy()


def combine(names):
    """Test-weighted mean per square over several quarters."""
    c = duckdb.connect()
    files = ', '.join(f"'{D('base', 'ookla', n)}'" for n in names)
    return c.sql(f"""SELECT quadkey, first(x) x, first(y) y, sum(d*tests)/sum(tests) d, sum(u*tests)/sum(tests) u,
                     sum(lat*tests)/sum(tests) lat, sum(tests) tests FROM read_parquet([{files}]) GROUP BY quadkey""").fetchnumpy()


class Index:
    def __init__(self, sq):
        self.sq = sq
        self.pts = [Point(x, y) for x, y in zip(sq['x'], sq['y'])]
        self.tree = STRtree(self.pts)

    def inside(self, geom):
        idx = self.tree.query(geom, predicate='contains')
        return np.asarray(idx, dtype=int)

    def stats(self, idx):
        s = self.sq
        if len(idx) == 0:
            return None
        n = s['tests'][idx]; t = float(n.sum())
        if t <= 0:
            return None
        w = lambda a: float((a[idx] * n).sum() / t)
        return {'d': round(w(s['d']) / 1000, 1), 'u': round(w(s['u']) / 1000, 1), 'l': round(w(s['lat'])), 't': int(t), 'q': int(len(idx))}


def circle(lon, lat, km):
    return Polygon([(lon + km / (111.32 * COS) * math.cos(a), lat + km / 111.32 * math.sin(a)) for a in np.linspace(0, 2 * math.pi, 65)])


def main():
    os.makedirs(D('site', 'data', 'areas'), exist_ok=True)
    fixed = Index(load_squares('fixed_2026q3.parquet'))
    mobile = Index(combine(['mobile_2025q4.parquet', 'mobile_2026q1.parquet', 'mobile_2026q2.parquet', 'mobile_2026q3.parquet']))
    hist_f = {y: Index(load_squares(f'fixed_{y}q3.parquet')) for y in YEARS}

    govs = [(f['properties']['shapeName'], shape(f['geometry'])) for f in json.load(open(D('data', 'irq_adm1.geojson')))['features']]
    gov_tree = STRtree([g for _, g in govs])

    def gov_of(pt):
        hit = [i for i in gov_tree.query(pt) if govs[i][1].contains(pt)]
        return govs[hit[0]][0] if hit else None

    def history(geom):
        out = []
        for y in YEARS:
            s = hist_f[y].stats(hist_f[y].inside(geom))
            out.append([s['d'], s['t']] if s and s['t'] >= MIN_TESTS else None)
        return out

    # candidates: OSM neighbourhoods and admin areas (HOT raw-data export), then OSM populated places
    cand = []
    for f in glob.glob(D('base', 'hot_hoods', 'box*', 'box*.geojson')):
        for ft in json.load(open(f)).get('features', []):
            p = ft['properties']; name = arabic(p)
            if not name:
                continue
            g = shape(ft['geometry'])
            kind = p.get('place') or 'area'
            if kind not in RADIUS:
                kind = 'area'
            cand.append({'id': f"{p.get('osm_type', '')[:1]}{p.get('osm_id')}", 'name': name, 'kind': kind, 'geom': g, 'alt': others(p, name)})
    c = duckdb.connect(); c.sql('LOAD spatial')
    for oid, p_ar, p_name, p_en, place, pop, wkb in c.sql(f"""SELECT id, name_ar, name, name_en, place, population, ST_AsWKB(geom) FROM '{D('base', 'osm_places.parquet')}'
                                                WHERE place IN ('city','town','village','hamlet','suburb','neighbourhood','quarter')""").fetchall():
        props = {'name_ar': p_ar, 'name': p_name, 'name_en': p_en}
        name = arabic(props)
        if not name:
            continue
        if place == 'city' and name.startswith('مدينة ') and len(name) > 7:
            name = name[6:]                      # «مدينة سامراء» is Samarra itself
        cand.append({'id': f'p{oid}', 'name': name, 'kind': place, 'geom': shapely.wkb.loads(bytes(wkb)),
                     'r': city_radius(pop) if place == 'city' else None, 'pop': float(pop) if (pop or '').isdigit() else 0,
                     'alt': others(props, name)})
    cand = [cd for cd in cand if not JUNK.search(cd['name'])]

    # areas: an OSM outline when there is one, otherwise a circle by kind; tiny outlines grow to at least one square
    places, seen, towns_in = [], {}, []
    order = lambda c: (RANK[c['kind']], 0 if c['geom'].geom_type in ('Polygon', 'MultiPolygon') else 1, -c.get('pop', 0))
    for cd in sorted(cand, key=order):
        g = cd['geom']; pt = g.representative_point()
        key = norm(cd['name'])
        near = [o for o, reach in seen.get(key, []) if abs(o.x - pt.x) < reach and abs(o.y - pt.y) < reach]
        if near:
            continue
        seen.setdefault(key, []).append((pt, 0.12 if cd['kind'] in ('city', 'town') else 0.02))
        # OSM tags many city districts (Basra's العشار, المعقل) as villages; inside a city or town they are neighbourhoods
        home = next((t for t in towns_in if t[1].contains(pt)), None) if cd['kind'] not in ('city', 'town') else None
        if home and cd['kind'] in ('village', 'hamlet'):
            cd['kind'] = 'neighbourhood'
        if g.geom_type in ('Polygon', 'MultiPolygon') and g.area > 0:
            area = g if g.area * 111.32 ** 2 * COS > 0.25 else g.buffer(0.004)
        else:
            area = circle(pt.x, pt.y, cd.get('r') or RADIUS[cd['kind']])
        gov = gov_of(pt)
        if not gov:
            continue
        fs = fixed.stats(fixed.inside(area)); ms = mobile.stats(mobile.inside(area))
        if not ((fs and fs['t'] >= MIN_TESTS) or (ms and ms['t'] >= MIN_TESTS)):
            continue
        place = {'id': cd['id'], 'n': cd['name'], 'k': cd['kind'], 'g': GOV_SLUG[gov],
                 'x': round(pt.x, 5), 'y': round(pt.y, 5), 'z': ZOOM[cd['kind']],
                 'f': fs, 'm': ms, 'h': history(area), 'r': None if g.geom_type in ('Polygon', 'MultiPolygon') else (cd.get('r') or RADIUS[cd['kind']]),
                 '_area': area}
        if cd.get('alt'):
            place['a'] = cd['alt']
        if home and home[0] != cd['name']:
            place['c'] = home[0]
        if cd['kind'] in ('city', 'town'):
            towns_in.append((cd['name'], prep(area)))
        places.append(place)

    # OSM often maps one place twice (حطين and حي حطين, an Arabic and a Kurdish spelling); the same squares and the same
    # numbers within 300 m are one place, named in Arabic where there is a choice, with the other name kept for search
    groups, kept = {}, []
    for p in places:
        s0 = p['f'] or p['m']
        k = (p['g'], s0['d'], s0['t'], s0['q'])
        twin = next((o for o in groups.get(k, []) if abs(o['x'] - p['x']) < 0.0035 and abs(o['y'] - p['y']) < 0.003), None)
        if not twin:
            groups.setdefault(k, []).append(p); kept.append(p); continue
        if KURDISH_LETTERS.search(twin['n']) and not KURDISH_LETTERS.search(p['n']):
            twin['n'], p['n'] = p['n'], twin['n']
        twin['a'] = sorted(set(twin.get('a', []) + [p['n']] + p.get('a', [])) - {twin['n']})
    print(len(places) - len(kept), 'places merged into their twins')
    places = kept
    for p in places:
        extra = EXTRA_NAMES.get(p['n'], []) if p['k'] != 'village' else []
        names = [n for n in p.get('a', []) + extra if n not in DROP_NAMES and n != p['n']]
        if names:
            p['a'] = sorted(set(names))
        else:
            p.pop('a', None)

    # the town or city each neighbourhood and village belongs to, for the second line under its name
    towns = [p for p in places if p['k'] in ('city', 'town')]
    tt = STRtree([Point(p['x'], p['y']) for p in towns])
    for p in places:
        if p['k'] in ('city', 'town') or p.get('c'):
            continue
        i = tt.nearest(Point(p['x'], p['y']))
        t = towns[i]
        if abs(t['x'] - p['x']) < 0.18 and abs(t['y'] - p['y']) < 0.15 and t['n'] != p['n']:
            p['c'] = t['n']

    # governorates and the country
    gov_out = []
    for name, g in govs:
        fs = fixed.stats(fixed.inside(g)); ms = mobile.stats(mobile.inside(g))
        b = g.bounds
        gov_out.append({'id': GOV_SLUG[name], 'n': GOV_AR[name], 'k': 'gov', 'g': GOV_SLUG[name],
                        'x': round(g.representative_point().x, 4), 'y': round(g.representative_point().y, 4), 'z': ZOOM['gov'],
                        'b': [round(v, 3) for v in b], 'f': fs, 'm': ms, 'h': history(g)})
    iraq = None
    for _, g in govs:
        iraq = g if iraq is None else iraq.union(g)
    country = {'f': fixed.stats(fixed.inside(iraq)), 'm': mobile.stats(mobile.inside(iraq)), 'h': history(iraq),
               'mh': [], 'fixedPeriod': 'تموز إلى أيلول ٢٠٢٦', 'mobilePeriod': 'تشرين الأول ٢٠٢٥ إلى أيلول ٢٠٢٦'}
    for y in YEARS:
        ix = Index(load_squares(f'mobile_{y}q3.parquet'))
        s = ix.stats(ix.inside(iraq)); country['mh'].append([s['d'], s['t']] if s else None)
    json.dump(country, open(D('site', 'data', 'country.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

    # outlines, one file per governorate, loaded when a place there is opened
    by_gov = {}
    for p in places:
        a = p.pop('_area')
        if not p['r']:                       # outlines are simplified; circles keep their round shape
            a = a.simplify(0.0003, preserve_topology=True)
        by_gov.setdefault(p['g'], {})[p['id']] = json.loads(json.dumps(mapping(a)), parse_float=lambda v: round(float(v), 5))
    for (name, g) in govs:
        by_gov.setdefault(GOV_SLUG[name], {})[GOV_SLUG[name]] = json.loads(json.dumps(mapping(g.simplify(0.003))), parse_float=lambda v: round(float(v), 4))
    for k, v in by_gov.items():
        json.dump(v, open(D('site', 'data', 'areas', f'{k}.json'), 'w'), ensure_ascii=False, separators=(',', ':'))

    places.sort(key=lambda p: -(p['f'] or {'t': 0})['t'])
    # the governorates load first and draw the home page; the places follow for search and the area pages
    json.dump({'govs': gov_out}, open(D('site', 'data', 'govs.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    json.dump({'places': places}, open(D('site', 'data', 'places.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    kinds = {}
    for p in places:
        kinds[p['k']] = kinds.get(p['k'], 0) + 1
    print(len(places), 'places', kinds)


if __name__ == '__main__':
    main()
