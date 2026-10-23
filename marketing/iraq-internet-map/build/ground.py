# The ground under the map: NASA's shaded relief pressed into a night blue-black, Iraq a shade lighter than its
# neighbours, whose own city lights stay faint and grey. Drawn in Web Mercator to sit under the vector tiles.
# python3 build/ground.py  ->  site/tiles/ground.jpg and its corners in site/tiles/ground.json
import json, math, os
import numpy as np
import shapefile
from PIL import Image, ImageDraw
from scipy.ndimage import gaussian_filter, map_coordinates
from shapely.geometry import shape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
Image.MAX_IMAGE_PIXELS = None
BBOX = (37.5, 28.0, 50.0, 38.5)      # the GIBS plates, 400 px per degree
W = 3000


def my(lat):
    return math.log(math.tan(math.pi / 4 + math.radians(lat) / 2))


def main():
    lon0, lat0, lon1, lat1 = BBOX
    H = int(round(W * (my(lat1) - my(lat0)) / math.radians(lon1 - lon0)))
    xx, yy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    lon = lon0 + (xx + 0.5) / W * (lon1 - lon0)
    m = my(lat1) - (yy + 0.5) / H * (my(lat1) - my(lat0))
    lat = np.degrees(2 * np.arctan(np.exp(m)) - np.pi / 2)
    sx = (lon - lon0) * 400; sy = (lat1 - lat) * 400

    rel = np.asarray(Image.open(D('base', 'wide_ASTER_GDEM_Greyscale_Shaded_Relief.png')).convert('L'), dtype=np.float32) / 255
    rel = map_coordinates(rel, [sy, sx], order=1, mode='nearest')
    bm = np.asarray(Image.open(D('base', 'wide_VIIRS_Black_Marble.png')).convert('L'), dtype=np.float32) / 255
    bm = map_coordinates(bm, [sy, sx], order=1, mode='nearest')

    r = shapefile.Reader(D('base', 'ne_adm0', 'ne_10m_admin_0_countries.shp'))
    iq = [shape(s.__geo_interface__) for s, rec in zip(r.shapes(), r.records()) if rec['ADM0_A3'] == 'IRQ'][0]
    X = lambda lo: (lo - lon0) / (lon1 - lon0) * W
    Y = lambda la: (my(lat1) - my(la)) / (my(lat1) - my(lat0)) * H
    mask = Image.new('L', (W, H), 0); md = ImageDraw.Draw(mask)
    for p in (iq.geoms if iq.geom_type == 'MultiPolygon' else [iq]):
        md.polygon([(X(a), Y(b)) for a, b in p.exterior.coords], fill=255)
    inside = gaussian_filter(np.asarray(mask, dtype=np.float32) / 255, 3)

    shade = gaussian_filter(rel, 0.7) - np.median(rel)
    water = (rel < 0.33).astype(np.float32)
    g = np.stack([0.036 + shade * 0.17, 0.042 + shade * 0.18, 0.058 + shade * 0.21], -1)
    g *= (1 - water[..., None] * 0.45)
    g *= (0.60 + 0.40 * inside)[..., None]
    elec = np.clip((bm - 0.30) / 0.7, 0, 1) ** 1.6 * (1 - inside)
    g += gaussian_filter(elec, 1.2)[..., None] * np.array([0.11, 0.105, 0.10])
    # fade the plate's edges into the page colour so it never ends in a hard line
    e = np.minimum.reduce([xx / (W * 0.08), (W - xx) / (W * 0.08), yy / (H * 0.08), (H - yy) / (H * 0.08)])
    # the tone the map background takes beyond the plate: the plate's own land outside Iraq
    page = np.median(g[(inside < 0.01) & (elec < 0.01)], axis=0)
    g = g * np.clip(e, 0, 1)[..., None] + page * (1 - np.clip(e, 0, 1))[..., None]
    Image.fromarray((np.clip(g, 0, 1) * 255 + 0.5).astype(np.uint8)).save(D('site', 'tiles', 'ground.jpg'), quality=84, optimize=True, progressive=True)
    edge = '#%02x%02x%02x' % tuple(int(round(v * 255)) for v in page)
    json.dump({'coordinates': [[lon0, lat1], [lon1, lat1], [lon1, lat0], [lon0, lat0]], 'edge': edge}, open(D('site', 'tiles', 'ground.json'), 'w'))
    print('edge colour', edge)
    print(W, H, round(os.path.getsize(D('site', 'tiles', 'ground.jpg')) / 1e6, 2), 'MB')


if __name__ == '__main__':
    main()
