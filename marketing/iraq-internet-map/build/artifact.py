# One-file version of the site for a host that takes a page body plus published files, allows scripts only from
# public CDNs and serves no binary files: the CSS, fonts and app script go inline, MapLibre and PMTiles load from
# cdnjs and jsDelivr (the same files as site/vendor/), and the tiles go as base64 text parts of at most 15 MB.
# python3 build/artifact.py <out dir>  ->  <out dir>/iraq-internet-map.html and <out dir>/tiles/*.txt
import base64, json, os, re, sys
from pmtiles.reader import Reader, MmapSource, all_tiles
from pmtiles.writer import Writer
from pmtiles.tile import tileid_to_zxy, zxy_to_tileid

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = lambda *p: os.path.join(ROOT, 'site', *p)
CDN = ['https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.js',
       'https://cdn.jsdelivr.net/npm/pmtiles@3.2.1/dist/pmtiles.js']
SOURCES = [(4, 11, 'iraq-a'), (12, 12, 'iraq-b'), (13, 13, 'iraq-c')]
MAX_RAW = 11_000_000          # base64 grows by a third; the host takes text files up to 16 MB


def write_pmtiles(path, header, meta, tiles):
    with open(path, 'wb') as f:
        w = Writer(f)
        for tid, data in tiles:
            w.write_tile(tid, data)
        h = {k: v for k, v in header.items() if k in ('tile_type', 'tile_compression', 'min_lon_e7', 'min_lat_e7', 'max_lon_e7',
                                                      'max_lat_e7', 'center_zoom', 'center_lon_e7', 'center_lat_e7')}
        zs = [tileid_to_zxy(t)[0] for t, _ in tiles]
        h['min_zoom'], h['max_zoom'] = min(zs), max(zs)
        w.finalize(h, meta)


def tile_parts(out_dir):
    os.makedirs(os.path.join(out_dir, 'tiles'), exist_ok=True)
    parts = []
    for z0, z1, name in SOURCES:
        src = open(S('tiles', f'{name}.pmtiles'), 'rb'); r = Reader(MmapSource(src))
        header, meta = r.header(), r.metadata()
        tiles = sorted(((zxy_to_tileid(*zxy), data) for zxy, data in all_tiles(r.get_bytes)), key=lambda t: t[0])
        total = sum(len(d) for _, d in tiles)
        n = -(-total // MAX_RAW)
        # split by tile column so each part holds about the same bytes
        cols = sorted({tileid_to_zxy(t)[1] for t, _ in tiles}) if n > 1 else []
        cuts, acc, per = [], 0, total / max(n, 1)
        by_col = {}
        for t, d in tiles:
            by_col[tileid_to_zxy(t)[1]] = by_col.get(tileid_to_zxy(t)[1], 0) + len(d)
        for c in cols:
            acc += by_col[c]
            if acc >= per * (len(cuts) + 1) and len(cuts) < n - 1:
                cuts.append(c)
        ranges, lo = [], 0
        for c in cuts:
            ranges.append((lo, c)); lo = c + 1
        ranges.append((lo, 10 ** 9))
        for i, (x0, x1) in enumerate(ranges):
            pick = [(t, d) for t, d in tiles if x0 <= tileid_to_zxy(t)[1] <= x1]
            label = name if len(ranges) == 1 else f'{name}{i + 1}'
            tmp = os.path.join(out_dir, 'tiles', label + '.pmtiles')
            write_pmtiles(tmp, header, meta, pick)
            txt = os.path.join(out_dir, 'tiles', label + '.txt')
            open(txt, 'wb').write(base64.b64encode(open(tmp, 'rb').read()))
            os.remove(tmp)
            parts.append([z0, z1, x0, x1, f'tiles/{label}.txt'])
            print(label, len(pick), 'tiles', round(os.path.getsize(txt) / 1e6, 2), 'MB as text')
    return parts


def main(out_dir):
    os.makedirs(out_dir, exist_ok=True)
    parts = tile_parts(out_dir)
    css = open(S('app.css'), encoding='utf-8').read()
    css = re.sub(r"url\(fonts/([\w-]+\.woff2)\)",
                 lambda m: 'url(data:font/woff2;base64,' + base64.b64encode(open(S('fonts', m.group(1)), 'rb').read()).decode() + ')', css)
    css = css.replace(":root {", ":root {\n  color-scheme: dark;", 1)
    mlcss = open(S('vendor', 'maplibre-gl.css'), encoding='utf-8').read()
    html = open(S('index.html'), encoding='utf-8').read()
    body = html.split('<body>', 1)[1].split('</body>', 1)[0]
    body = re.sub(r'\s*<script src="[^"]+"></script>', '', body)
    app = open(S('app.js'), encoding='utf-8').read()
    page = ['<title>خريطة الإنترنت في العراق</title>',
            '<style>', mlcss, css, 'html { direction: rtl; }', '</style>',
            "<script>document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl';</script>",
            body.strip()]
    page += [f'<script src="{u}"></script>' for u in CDN]
    page += ['<script>window.TILE_PARTS = ' + json.dumps(parts) + ';</script>', '<script>', app, '</script>']
    out = os.path.join(out_dir, 'iraq-internet-map.html')
    open(out, 'w', encoding='utf-8').write('\n'.join(page) + '\n')
    print(out, round(os.path.getsize(out) / 1e3), 'KB')


if __name__ == '__main__':
    main(sys.argv[1])
