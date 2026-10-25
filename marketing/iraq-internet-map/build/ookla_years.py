# Ookla squares inside Iraq for every quarter the site uses, saved to base/ookla/ (not in git).
# python3 build/ookla_years.py
import json, os
import duckdb
from shapely.geometry import shape, Point
from shapely.strtree import STRtree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
URL = 'https://ookla-open-data.s3.amazonaws.com/parquet/performance/type={t}/year={y}/quarter={q}/{y}-{m}-01_performance_{t}_tiles.parquet'
MONTH = {1: '01', 2: '04', 3: '07', 4: '10'}

# fixed: the third quarter of each year (the latest one draws the map); mobile: the same, plus the last four quarters for the map
QUARTERS = [('fixed', y, 3) for y in range(2019, 2027)] + [('mobile', y, 3) for y in range(2019, 2027)] + \
           [('mobile', 2025, 4), ('mobile', 2026, 1), ('mobile', 2026, 2)]


def main():
    os.makedirs(D('base', 'ookla'), exist_ok=True)
    govs = [(f['properties']['shapeName'], shape(f['geometry'])) for f in json.load(open(D('data', 'irq_adm1.geojson')))['features']]
    tree = STRtree([g for _, g in govs])
    con = duckdb.connect(); con.sql('INSTALL httpfs; LOAD httpfs;')
    for t, y, q in QUARTERS:
        out = D('base', 'ookla', f'{t}_{y}q{q}.parquet')
        if os.path.exists(out):
            continue
        u = URL.format(t=t, y=y, q=q, m=MONTH[q])
        cols = [d[0] for d in con.sql(f"DESCRIBE SELECT * FROM read_parquet('{u}')").fetchall()]
        if 'tile_x' in cols:
            rows = con.sql(f"""SELECT quadkey, tile_x, tile_y, avg_d_kbps, avg_u_kbps, avg_lat_ms, tests, devices FROM read_parquet('{u}')
                               WHERE tile_x BETWEEN 38.7 AND 48.7 AND tile_y BETWEEN 29.0 AND 37.4""").fetchall()
        else:
            rows = []
            for r in con.sql(f"""SELECT quadkey, tile, avg_d_kbps, avg_u_kbps, avg_lat_ms, tests, devices FROM read_parquet('{u}')
                                 WHERE quadkey LIKE '12%'""").fetchall():
                pts = [tuple(map(float, p.split())) for p in r[1].split('((')[1].rstrip(')').split(',')[:4]]
                x = sum(p[0] for p in pts) / 4; yy = sum(p[1] for p in pts) / 4
                if 38.7 <= x <= 48.7 and 29.0 <= yy <= 37.4:
                    rows.append((r[0], x, yy) + tuple(r[2:]))
        keep = []
        for r in rows:
            p = Point(r[1], r[2])
            hit = [i for i in tree.query(p) if govs[i][1].contains(p)]
            if hit:
                keep.append(tuple(r) + (govs[hit[0]][0],))
        con.execute("CREATE OR REPLACE TABLE r (quadkey VARCHAR, x DOUBLE, y DOUBLE, d DOUBLE, u DOUBLE, lat DOUBLE, tests DOUBLE, devices DOUBLE, gov VARCHAR)")
        con.executemany("INSERT INTO r VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", keep)
        con.sql(f"COPY r TO '{out}'")
        print(t, y, q, len(keep), 'squares')


if __name__ == '__main__':
    main()
