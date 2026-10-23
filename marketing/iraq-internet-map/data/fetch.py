# Rebuilds data/ and base/ from the public sources.
# python3 data/fetch.py   (pip install duckdb shapely pyshp; base/ is large and stays out of git)
import json, os, subprocess, time, urllib.parse, datetime as dt
import duckdb
from shapely.geometry import shape, Point
from shapely.ops import unary_union
from shapely.prepared import prep
from shapely.strtree import STRtree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
OOKLA = 'https://ookla-open-data.s3.amazonaws.com/parquet/performance/type={t}/year={y}/quarter={q}/{y}-{m}-01_performance_{t}_tiles.parquet'
MONTH = {1: '01', 2: '04', 3: '07', 4: '10'}
IODA = 'https://api.ioda.inetintel.cc.gatech.edu/v2'
GIBS = ('https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.1.1'
        '&LAYERS={layer}&SRS=EPSG:4326&BBOX={bbox}&WIDTH={w}&HEIGHT={h}&FORMAT=image/png&STYLES=')
HOT = 'https://production-raw-data-api.s3.amazonaws.com/ISO3/IRQ/_layers/osm/{layer}.parquet'
UA = 'iraq-internet-map/0.1 (vizioniraq@gmail.com)'
# IODA's certificate chains to emSign, which some trust stores lack; Mozilla's list from curl.se has it
CA = D('base', 'mozilla-ca.pem')


def curl(url, out=None, ca=None, ua=None):
    cmd = ['curl', '-sS', '-f', '-L', '-m', '300']
    if ca: cmd += ['--cacert', ca]
    if ua: cmd += ['-A', ua]
    if out: cmd += ['-o', out]
    r = subprocess.run(cmd + [url], capture_output=True, text=not out, check=True)
    return r.stdout


def ookla_iraq(con, t, y, q, govs):
    """Ookla tiles for one quarter whose centre falls inside an Iraqi governorate."""
    u = OOKLA.format(t=t, y=y, q=q, m=MONTH[q])
    cols = [d[0] for d in con.sql(f"DESCRIBE SELECT * FROM read_parquet('{u}')").fetchall()]
    if 'tile_x' in cols:
        rows = con.sql(f"""SELECT quadkey, tile_x, tile_y, avg_d_kbps, avg_u_kbps, avg_lat_ms, tests, devices
                           FROM read_parquet('{u}') WHERE tile_x BETWEEN 38.7 AND 48.7 AND tile_y BETWEEN 29.0 AND 37.4""").fetchall()
    else:  # older files carry only the square as WKT
        rows = []
        for r in con.sql(f"""SELECT quadkey, tile, avg_d_kbps, avg_u_kbps, avg_lat_ms, tests, devices
                             FROM read_parquet('{u}') WHERE quadkey LIKE '12%'""").fetchall():
            pts = [tuple(map(float, p.split())) for p in r[1].split('((')[1].rstrip(')').split(',')[:4]]
            x = sum(p[0] for p in pts) / 4; yy = sum(p[1] for p in pts) / 4
            if 38.7 <= x <= 48.7 and 29.0 <= yy <= 37.4:
                rows.append((r[0], x, yy) + r[2:])
    tree = STRtree([g for _, g in govs])
    out = []
    for r in rows:
        p = Point(r[1], r[2])
        hit = [i for i in tree.query(p) if govs[i][1].contains(p)]
        if hit:
            out.append(r + (govs[hit[0]][0],))
    return out


def main():
    os.makedirs(D('base'), exist_ok=True)
    con = duckdb.connect(); con.sql('INSTALL httpfs; LOAD httpfs;')

    # governorates (geoBoundaries, from Wikimedia Commons): Halabja is still inside Sulaymaniyah in this release
    adm = D('data', 'irq_adm1.geojson')
    if not os.path.exists(adm):
        meta = json.loads(curl('https://www.geoboundaries.org/api/current/gbOpen/IRQ/ADM1/'))
        url = meta['simplifiedGeometryGeoJSON'].replace('github.com/wmgeolab/geoBoundaries/raw/', 'media.githubusercontent.com/media/wmgeolab/geoBoundaries/')
        curl(url, adm)
    govs = [(f['properties']['shapeName'], shape(f['geometry'])) for f in json.load(open(adm))['features']]

    # Ookla: the latest quarter for the maps, and the third quarter of every year for the trend
    cols = 'quadkey tile_x tile_y avg_d_kbps avg_u_kbps avg_lat_ms tests devices gov'.split()
    for t in ['fixed', 'mobile']:
        rows = ookla_iraq(con, t, 2026, 3, govs)
        con.execute(f"CREATE OR REPLACE TABLE r ({', '.join(c + (' VARCHAR' if c in ('quadkey', 'gov') else ' DOUBLE') for c in cols)})")
        con.executemany(f"INSERT INTO r VALUES ({', '.join('?' * len(cols))})", rows)
        con.sql(f"COPY r TO '{D('data', f'{t}_2026q3_iraq.parquet')}'")
    trend = {}
    for t in ['fixed', 'mobile']:
        for y in range(2019, 2027):
            rows = ookla_iraq(con, t, y, 3, govs)
            n = sum(r[6] for r in rows)
            trend[f'{t} {y}'] = {'tiles': len(rows), 'tests': n, 'down_mbps': round(sum(r[3] * r[6] for r in rows) / n / 1000, 1)}
    json.dump(trend, open(D('data', 'ookla_trend_q3.json'), 'w'), indent=1)

    # Karrada's boundary and Baghdad's neighbourhood points (OpenStreetMap through Nominatim)
    def nominatim(q, **kw):
        time.sleep(1.1)
        args = urllib.parse.urlencode(dict(q=q, limit=1, **kw))
        return json.loads(curl(f'https://nominatim.openstreetmap.org/search?{args}', ua=UA))
    json.dump(nominatim('الكرادة, بغداد', format='geojson', polygon_geojson=1), open(D('data', 'karrada.json'), 'w'), ensure_ascii=False)
    places = {}
    for q in ['Al-Mansour', 'Karrada', 'Sadr City', 'Kadhimiya', 'Zayouna', 'Jadriya', 'Ghazaliya', 'Shula', 'New Baghdad',
              'Amiriya', 'Saydiya', 'Bab al-Sharqi']:
        j = nominatim(f'{q}, Baghdad, Iraq', format='jsonv2', namedetails=1, **{'accept-language': 'ar'})[0]
        places[q] = {'lat': float(j['lat']), 'lon': float(j['lon']), 'ar': j.get('namedetails', {}).get('name:ar') or j['name'], 'type': j['type']}
    json.dump(places, open(D('data', 'bgd_places_nominatim.json'), 'w'), ensure_ascii=False, indent=1)

    # Karrada and Baghdad, third quarter of each year
    karr = prep(shape(json.load(open(D('data', 'karrada.json')))['features'][0]['geometry']))
    bag = [g for n, g in govs if n == 'Baghdad']
    hist = {}
    for y in range(2019, 2027):
        rows = ookla_iraq(con, 'fixed', y, 3, [('Baghdad', bag[0])])
        f = lambda rs: (len(rs), sum(r[6] for r in rs), round(sum(r[3] * r[6] for r in rs) / max(1, sum(r[6] for r in rs)) / 1000, 1))
        hist[y] = {'karrada': f([r for r in rows if karr.contains(Point(r[1], r[2]))]), 'baghdad': f(rows)}
    json.dump(hist, open(D('data', 'karrada_history.json'), 'w'))

    # IODA: outage events since 2025, and the raw active-probing signal for each exam morning (04:00 to 10:00 Baghdad time)
    if not os.path.exists(CA):
        curl('https://curl.se/ca/cacert.pem', CA)
    tz = dt.timezone(dt.timedelta(hours=3))
    f0 = int(dt.datetime(2025, 1, 1, tzinfo=tz).timestamp()); f1 = int(dt.datetime(2026, 10, 23, tzinfo=tz).timestamp())
    ev = json.loads(curl(f'{IODA}/outages/events?entityType=country&entityCode=IQ&from={f0}&until={f1}&limit=500', ca=CA))
    json.dump(ev, open(D('data', 'ioda_events_iq.json'), 'w'))
    days = set()
    for e in ev['data']:
        s = dt.datetime.fromtimestamp(e['start'], tz)
        if e['datasource'] in ('ping-slash24', 'bgp') and dt.time(5, 30) <= s.time() <= dt.time(7, 0) and e['duration'] <= 3 * 3600:
            days.add(s.date())
    days.discard(dt.date(2025, 12, 8))  # a single short BGP dip, not an exam pattern
    mornings = []
    for d in sorted(days):
        s = int(dt.datetime(d.year, d.month, d.day, 4, tzinfo=tz).timestamp())
        sig = json.loads(curl(f'{IODA}/signals/raw/country/IQ?from={s}&until={s + 6 * 3600}&datasource=ping-slash24', ca=CA))
        sig = [x for x in sig['data'][0] if x['datasource'] == 'ping-slash24'][0]
        mornings.append({'date': d.isoformat(), 'from': sig['from'], 'step': sig['step'], 'values': sig['values']})
    json.dump(mornings, open(D('data', 'ioda_exam_mornings.json'), 'w'))

    # base layers: NASA GIBS relief and night lights, Natural Earth borders and rivers, OpenStreetMap through HOT
    for layer in ['VIIRS_Black_Marble', 'ASTER_GDEM_Greyscale_Shaded_Relief']:
        curl(GIBS.format(layer=layer, bbox='41.5,28.5,49.5,41.0', w=3200, h=5000), D('base', f'hero_{layer}.png'))
    curl(GIBS.format(layer='ASTER_GDEM_Greyscale_Shaded_Relief', bbox='44.25,33.12,44.55,33.57', w=1800, h=2700), D('base', 'bgd_relief.png'))
    for name, path in [('ne_adm0', 'cultural/ne_10m_admin_0_countries'), ('ne_rivers', 'physical/ne_10m_rivers_lake_centerlines')]:
        z = D('base', name + '.zip')
        curl(f'https://naciscdn.org/naturalearth/10m/{path}.zip', z)
        subprocess.run(['unzip', '-o', '-q', z, '-d', D('base', name)], check=True)
    g = nominatim('Tigris', format='geojson', polygon_geojson=1, polygon_threshold=0.0002)
    json.dump(g, open(D('data', 'tigris.json'), 'w'), ensure_ascii=False)
    for layer in ['roads', 'waterways']:
        curl(HOT.format(layer=layer), D('base', f'osm_{layer}.parquet'))
    import pickle, shapely.wkb
    con.sql('INSTALL spatial; LOAD spatial;')
    roads = D('base', 'osm_roads.parquet')
    rows = con.sql(f"""SELECT highway, ST_AsWKB(geom) FROM '{roads}'
                       WHERE bbox.xmax > 44.25 AND bbox.xmin < 44.56 AND bbox.ymax > 33.10 AND bbox.ymin < 33.58""").fetchall()
    pickle.dump([(h, shapely.wkb.loads(bytes(g))) for h, g in rows], open(D('base', 'osm_baghdad_roads.pkl'), 'wb'))
    rows = con.sql(f"""SELECT highway, ST_AsWKB(ST_SimplifyPreserveTopology(geom, 0.0008)) FROM '{roads}'
                       WHERE highway IN ('motorway','trunk','primary','secondary','motorway_link','trunk_link','primary_link','tertiary')""").fetchall()
    pickle.dump([(h, shapely.wkb.loads(bytes(g))) for h, g in rows], open(D('base', 'osm_iraq_main_roads.pkl'), 'wb'))
    con.sql(f"""COPY (SELECT name, ST_AsWKB(geom) g FROM '{D('base', 'osm_waterways.parquet')}'
                WHERE bbox.xmax > 44.25 AND bbox.xmin < 44.56 AND bbox.ymax > 33.10 AND bbox.ymin < 33.58
                AND ST_GeometryType(geom) IN ('POLYGON','MULTIPOLYGON')) TO '{D('base', 'osm_baghdad_water.parquet')}'""")


if __name__ == '__main__':
    main()
