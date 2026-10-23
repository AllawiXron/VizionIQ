# Exam mornings for the site: each morning's IODA probe signal from 04:00 to 10:00, as a share of that morning's level before 06:00.
# python3 build/exams.py  ->  site/data/exams.json
import json, os
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = lambda *p: os.path.join(ROOT, *p)


def main():
    out = []
    for r in json.load(open(D('data', 'ioda_exam_mornings.json'))):
        v = np.array([x if x is not None else np.nan for x in r['values']], dtype=float)
        v = v / np.nanmedian(v[:10])
        low = np.where(v < 0.6)[0]
        step = r['step'] // 60
        cut = [int(low[0] * step), int((low[-1] + 1) * step)] if len(low) else None  # minutes after 04:00
        out.append({'d': r['date'], 's': step, 'v': [None if np.isnan(x) else round(float(min(x, 1.1)), 2) for x in v],
                    'cut': cut, 'low': round(float(np.nanmin(v)), 2)})
    json.dump(out, open(D('site', 'data', 'exams.json'), 'w'), separators=(',', ':'))
    for y in ('2025', '2026'):
        rs = [r for r in out if r['d'].startswith(y)]
        print(y, len(rs), 'mornings', sum((r['cut'][1] - r['cut'][0]) for r in rs if r['cut']) / 60, 'hours')


if __name__ == '__main__':
    main()
