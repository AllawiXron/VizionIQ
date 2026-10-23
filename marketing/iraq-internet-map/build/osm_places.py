# OpenStreetMap places for search: cities, towns and villages from the HOT export on HDX, and neighbourhoods,
# quarters and admin areas through HOT's raw-data API (it takes boxes under 80,000 km², so Iraq goes in 20).
# python3 build/osm_places.py  ->  base/osm_places.parquet, base/hot_hoods/box*/
import json, os, subprocess, time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)
API = 'https://api-prod.raw-data.hotosm.org/v1'
PLACES = 'https://production-raw-data-api.s3.amazonaws.com/ISO3/IRQ/_layers/osm/populated_places.parquet'


def call(args):
    return json.loads(subprocess.run(['curl', '-sS', '-m', '90'] + args, capture_output=True, text=True, check=True).stdout)


def main():
    os.makedirs(D('base', 'hot_hoods'), exist_ok=True)
    subprocess.run(['curl', '-sS', '-f', '-o', D('base', 'osm_places.parquet'), PLACES], check=True)
    boxes = [(38.7 + i * 2.5, 29.0 + j * 1.68) for i in range(4) for j in range(5)]
    tasks = {}
    for k, (x0, y0) in enumerate(boxes):
        x1, y1 = x0 + 2.5, y0 + 1.68
        req = {'fileName': f'box{k}', 'outputType': 'geojson',
               'geometry': {'type': 'Polygon', 'coordinates': [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]]},
               'geometryType': ['point', 'polygon'],
               'filters': {'tags': {'all_geometry': {'join_or': {'place': ['suburb', 'neighbourhood', 'quarter'], 'admin_level': ['8', '9', '10']}}},
                           'attributes': {'all_geometry': ['name', 'name:ar', 'name:en', 'place', 'admin_level', 'boundary']}}}
        tasks[k] = call(['-X', 'POST', f'{API}/snapshot/', '-H', 'Content-Type: application/json', '-d', json.dumps(req)])['task_id']
        time.sleep(1)
    for k, tid in tasks.items():
        for _ in range(60):
            r = call([f'{API}/tasks/status/{tid}/'])
            if r.get('status') in ('SUCCESS', 'FAILURE'):
                break
            time.sleep(5)
        url = (r.get('result') or {}).get('download_url')
        if not url:
            raise SystemExit(f'box {k}: {r.get("status")}')
        z = D('base', 'hot_hoods', f'box{k}.zip')
        subprocess.run(['curl', '-sS', '-f', '-o', z, url], check=True)
        subprocess.run(['unzip', '-o', '-q', z, '-d', D('base', 'hot_hoods', f'box{k}')], check=True)
        print('box', k)


if __name__ == '__main__':
    main()
