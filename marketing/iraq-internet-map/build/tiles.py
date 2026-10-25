# Vector tiles for the site, as PMTiles: the measured squares as points, roads cut at the square
# edges and carrying each square's speed, and water.
# python3 build/tiles.py  ->  site/tiles/iraq-a.pmtiles (z4-11), iraq-b (z12), iraq-c (z13)
import gzip, math, os, time
import numpy as np
import duckdb, shapely, shapely.wkb
import mapbox_vector_tile
from shapely.geometry import box
from shapely.strtree import STRtree
from pmtiles.tile import zxy_to_tileid, tileid_to_zxy, TileType, Compression
from pmtiles.writer import Writer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
R = 6378137.0
Z16 = 16
MINZ, MAXZ = 4, 13
PARTS = [(4, 11, 'iraq-a'), (12, 12, 'iraq-b'), (13, 13, 'iraq-c')]
RANK = {'motorway': 1, 'trunk': 1, 'motorway_link': 1, 'trunk_link': 1, 'primary': 2, 'primary_link': 2,
        'secondary': 3, 'secondary_link': 3, 'tertiary': 4, 'tertiary_link': 4,
        'unclassified': 5, 'residential': 5, 'living_street': 5}
# the most detailed road rank drawn at each zoom
SHOW = {4: 2, 5: 2, 6: 2, 7: 2, 8: 3, 9: 3, 10: 4, 11: 4, 12: 5, 13: 5}


def merc(lon, lat):
    x = np.radians(lon) * R
    y = np.log(np.tan(np.pi / 4 + np.radians(lat) / 2)) * R
    return x, y


def to_merc(g):
    return shapely.transform(g, lambda c: np.column_stack(merc(c[:, 0], c[:, 1])))


def tile_bounds(z, x, y):
    n = 2 ** z; size = 2 * math.pi * R / n
    x0 = -math.pi * R + x * size; y1 = math.pi * R - y * size
    return x0, y1 - size, x0 + size, y1


def lonlat_tile(lon, lat, z):
    n = 2 ** z
    x = int((lon + 180) / 360 * n)
    y = int((1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n)
    return x, y


def quad_xy(q):
    x = y = 0
    for ch in q:
        d = int(ch); x = x * 2 + (d & 1); y = y * 2 + (d >> 1)
    return x, y


def squares():
    c = duckdb.connect()
    fx = c.sql(f"SELECT quadkey, x, y, d, tests FROM '{D('base', 'ookla', 'fixed_2026q3.parquet')}'").fetchall()
    files = ', '.join(f"'{D('base', 'ookla', n)}'" for n in ['mobile_2025q4.parquet', 'mobile_2026q1.parquet', 'mobile_2026q2.parquet', 'mobile_2026q3.parquet'])
    mb = c.sql(f"""SELECT quadkey, first(x), first(y), sum(d*tests)/sum(tests), sum(tests) FROM read_parquet([{files}]) GROUP BY quadkey""").fetchall()
    sq = {}
    for q, x, y, d, n in fx:
        sq[q] = {'x': x, 'y': y, 'f': round(d / 1000), 'a': int(n), 'm': -1, 'b': 0}
    for q, x, y, d, n in mb:
        s = sq.setdefault(q, {'x': x, 'y': y, 'f': -1, 'a': 0})
        s['m'] = round(d / 1000); s['b'] = int(n)
    return sq


def cut_roads(sq):
    """Each road split at the edges of the measured squares; pieces outside any square keep f = m = -1."""
    t0 = time.time()
    c = duckdb.connect(); c.sql('LOAD spatial')
    rows = c.sql(f"""SELECT highway, ST_AsWKB(geom) FROM '{D('base', 'osm_roads.parquet')}'
                     WHERE highway IN ({', '.join(repr(k) for k in RANK)})""").fetchall()
    cells = {quad_xy(q): (q, s) for q, s in sq.items()}
    n = 2 ** Z16
    lon_of = lambda tx: tx / n * 360 - 180
    lat_of = lambda ty: math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * ty / n))))
    geoms, props = [], []
    for hw, wkb in rows:
        g = shapely.wkb.loads(bytes(wkb))
        if g.geom_type not in ('LineString', 'MultiLineString'):
            continue
        r = RANK[hw]
        x0, y0, x1, y1 = g.bounds
        tx0, ty1 = lonlat_tile(x0, y0, Z16); tx1, ty0 = lonlat_tile(x1, y1, Z16)
        hits = [(tx, ty) for tx in range(tx0, tx1 + 1) for ty in range(ty0, ty1 + 1) if (tx, ty) in cells]
        rest = g
        for tx, ty in hits:
            cb = box(lon_of(tx), lat_of(ty + 1), lon_of(tx + 1), lat_of(ty))
            piece = g.intersection(cb)
            if piece.is_empty or piece.length == 0:
                continue
            s = cells[(tx, ty)][1]
            geoms.append(piece); props.append((r, s['f'], s['m'], s['a'], s['b']))
            rest = rest.difference(cb)
        if not rest.is_empty and rest.length > 0 and r <= 4:
            geoms.append(rest); props.append((r, -1, -1, 0, 0))
    print(len(rows), 'roads ->', len(geoms), 'pieces', round(time.time() - t0), 's')
    return geoms, props


def water():
    c = duckdb.connect(); c.sql('LOAD spatial')
    polys = [shapely.wkb.loads(bytes(w)) for (w,) in c.sql(f"""SELECT ST_AsWKB(geom) FROM '{D('base', 'osm_waterways.parquet')}'
                 WHERE ST_GeometryType(geom) IN ('POLYGON', 'MULTIPOLYGON')""").fetchall()]
    rivers = [shapely.wkb.loads(bytes(w)) for (w,) in c.sql(f"""SELECT ST_AsWKB(geom) FROM '{D('base', 'osm_waterways.parquet')}'
                 WHERE waterway = 'river' AND ST_GeometryType(geom) IN ('LINESTRING', 'MULTILINESTRING')""").fetchall()]
    return polys, rivers


def main():
    os.makedirs(D('site', 'tiles'), exist_ok=True)
    sq = squares()
    keys = list(sq)
    sq_geom = to_merc(shapely.points([sq[k]['x'] for k in keys], [sq[k]['y'] for k in keys]))
    sq_tree = STRtree(sq_geom)

    rg, rp = cut_roads(sq)
    rg = to_merc(np.array(rg, dtype=object)); rp = np.array(rp)
    road_tree = STRtree(rg)
    wp, wr = water()
    wp = to_merc(np.array(wp, dtype=object)); wr = to_merc(np.array(wr, dtype=object))
    wp_area = shapely.area(wp)
    wp_tree = STRtree(wp); wr_tree = STRtree(wr)

    lon0, lat0, lon1, lat1 = 38.6, 28.9, 48.9, 37.5
    tiles = {}
    t0 = time.time()
    for z in range(MINZ, MAXZ + 1):
        tx0, ty0 = lonlat_tile(lon0, lat1, z); tx1, ty1 = lonlat_tile(lon1, lat0, z)
        px = 2 * math.pi * R / 2 ** z / 4096          # metres per tile unit
        count = 0
        for tx in range(tx0, tx1 + 1):
            for ty in range(ty0, ty1 + 1):
                b = tile_bounds(z, tx, ty)
                buf = px * 64
                clip = (b[0] - buf, b[1] - buf, b[2] + buf, b[3] + buf)
                layers = []

                idx = sq_tree.query(box(*b))
                if len(idx):
                    feats = []
                    for i in idx:
                        s = sq[keys[i]]
                        p = {'f': s['f'], 'm': s['m'], 'a': s['a'], 'b': s['b']}
                        if z >= 9:
                            p['k'] = keys[i]
                        feats.append({'geometry': sq_geom[i], 'properties': p})
                    layers.append({'name': 'sq', 'features': feats})

                idx = road_tree.query(box(*clip))
                idx = idx[rp[idx, 0] <= SHOW[z]] if len(idx) else idx
                if len(idx):
                    gs = shapely.clip_by_rect(rg[idx], *clip)
                    gs = shapely.simplify(gs, px * (1.0 if z >= 12 else 1.5))
                    feats = []
                    for g, (r, f, m, a, bb) in zip(gs, rp[idx]):
                        if g.is_empty:
                            continue
                        feats.append({'geometry': g, 'properties': {'r': int(r), 'f': int(f), 'm': int(m),
                                                                    'a': min(10, int(a)), 'b': min(10, int(bb))}})
                    if feats:
                        layers.append({'name': 'rd', 'features': feats})

                idx = wp_tree.query(box(*clip))
                idx = idx[wp_area[idx] > (px * 4) ** 2] if len(idx) else idx
                if len(idx):
                    gs = shapely.simplify(shapely.clip_by_rect(wp[idx], *clip), px)
                    feats = [{'geometry': g, 'properties': {}} for g in gs if not g.is_empty and g.area > 0]
                    if feats:
                        layers.append({'name': 'wt', 'features': feats})
                if z <= 11:
                    idx = wr_tree.query(box(*clip))
                    if len(idx):
                        gs = shapely.simplify(shapely.clip_by_rect(wr[idx], *clip), px * 1.5)
                        feats = [{'geometry': g, 'properties': {}} for g in gs if not g.is_empty]
                        if feats:
                            layers.append({'name': 'rv', 'features': feats})

                if not layers:
                    continue
                data = mapbox_vector_tile.encode(layers, default_options={'quantize_bounds': b, 'extents': 4096, 'y_coord_down': False})
                tiles[zxy_to_tileid(z, tx, ty)] = gzip.compress(data, 6)
                count += 1
        print('z', z, count, 'tiles', round(sum(len(v) for k, v in tiles.items()) / 1e6, 1), 'MB so far', round(time.time() - t0), 's')

    # three files by zoom, each under 15 MB, so hosts with a per-file limit take them too
    for z0, z1, name in PARTS:
        with open(D('site', 'tiles', f'{name}.pmtiles'), 'wb') as f:
            w = Writer(f)
            for tid in sorted(tiles):
                if z0 <= tileid_to_zxy(tid)[0] <= z1:
                    w.write_tile(tid, tiles[tid])
            w.finalize({'tile_type': TileType.MVT, 'tile_compression': Compression.GZIP, 'min_zoom': z0, 'max_zoom': z1,
                        'min_lon_e7': int(lon0 * 1e7), 'min_lat_e7': int(lat0 * 1e7), 'max_lon_e7': int(lon1 * 1e7), 'max_lat_e7': int(lat1 * 1e7),
                        'center_zoom': 6, 'center_lon_e7': int(44.0 * 1e7), 'center_lat_e7': int(33.2 * 1e7)},
                       {'vector_layers': [{'id': k, 'fields': {}} for k in ('sq', 'rd', 'wt', 'rv')],
                        'attribution': 'Ookla, OpenStreetMap contributors'})
        print(name, round(os.path.getsize(D('site', 'tiles', f'{name}.pmtiles')) / 1e6, 1), 'MB')


if __name__ == '__main__':
    main()
