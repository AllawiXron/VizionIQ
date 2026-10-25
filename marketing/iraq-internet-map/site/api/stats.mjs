// Live counts for the home page: how many browsers have opened the site and how many line and ping tests have
// finished on it. Only the two numbers are kept, with no name, address or result. The store is an Upstash Redis
// database linked to the Vercel project (Storage, Upstash for Redis), which gives it KV_REST_API_URL and
// KV_REST_API_TOKEN. GET reads the two numbers; POST {"kind": "visit" | "test"} adds one and reads them.
import crypto from 'node:crypto';

const STORE = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEYS = { visit: 'iqspeed:visits', test: 'iqspeed:tests' };

async function redis(commands) {
  const r = await fetch(`${STORE}/pipeline`, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' }, body: JSON.stringify(commands),
  });
  if (!r.ok) throw new Error(`store ${r.status}`);
  return (await r.json()).map(x => x.result);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!STORE || !TOKEN) return res.status(503).json({ error: 'no store' });
  try {
    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
      const kind = body && body.kind;
      if (!KEYS[kind]) return res.status(400).json({ error: 'kind' });
      // one count per address and kind every 10 seconds, so reloading the page again and again does not run the number up;
      // the address is only hashed into a key that expires
      const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
      const key = 'iqspeed:once:' + crypto.createHash('sha256').update(ip + '|' + kind).digest('hex').slice(0, 20);
      const [first] = await redis([['SET', key, '1', 'NX', 'EX', '10']]);
      if (first === 'OK') await redis([['INCR', KEYS[kind]]]);
    } else if (req.method !== 'GET') return res.status(405).end();
    const [visits, tests] = await redis([['GET', KEYS.visit], ['GET', KEYS.test]]);
    res.status(200).json({ visits: Number(visits) || 0, tests: Number(tests) || 0 });
  } catch (e) {
    res.status(502).json({ error: 'store' });
  }
}
