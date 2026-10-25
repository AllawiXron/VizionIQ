# سرعة الإنترنت في العراق (Iraq internet speeds)

A public site where anyone types the name of their area and sees how fast its internet really is, from tests people
ran themselves, compared with their governorate and with Iraq. Made for the Minister of Communications' call (Mustafa
Sanad, Oct 2026) for local software built by Iraqis. Idea and design: @allawi.psd.

## The site (`site/`)

Rebuilt a third time on 23 Oct as "result first", after the user found the night-map version confusing and weird (a
dark map, too much on one page, no clear sense of what the site is for). The approved stills are
`out/redesign-1-home.png` and `out/redesign-2-area.png` (`redesign/`). The exam-day internet cuts are left out of the
site on the user's decision; their data stays in `data/exams.json`.

- **Home** (`#/`): the headline says what the site does, then a large search box with examples, then Iraq's number
  (62 Mbps) with a plain verdict (جيد، يكفي لفيديو 4K على أكثر من جهاز) and the 2019 figure, then the 18 governorates
  as a map coloured by speed (tap one to open it). Home loads three small files and no map library.
- **Area and governorate pages** (`#/p/<osm id>`, `#/g/<governorate>`): the area's number in one size, its verdict,
  three bars against its governorate and Iraq, the share of areas it beats (or a governorate's place among the 18,
  saying when a neighbour is within 5%), its streets on a light map coloured by speed, home and mobile side by side,
  the summer of every year since 2019, and nearby areas or the governorate's areas with test counts.
- **Governorates** (`#/govs`) as a ranked list, and **About** (`#/about`) with the sources, the method, what each
  verdict word means and the limits of the data.
- The البيت / الموبايل switch sits above every number it changes. No area shows a number from fewer than 10 tests.
- Verdict words come from what a speed is enough for at home, on Netflix's figures (5 Mbps per screen for HD, 15 for
  4K): under 10 بطيء، 10 to 25 مقبول، 25 to 50 متوسط، 50 to 100 جيد، above 100 سريع جدا.
- Colour follows the same five bands as the words, on the page and on the maps: red `#d2483f`, orange `#ea8a2e`, amber
  `#e3b021`, green `#5aa85e`, deep green `#12795a`. Under every number the five bands sit in a row with their speeds and
  a mark where the number falls; it is also the key under every map. Text is ink `#14202b` on white.
- A number from fewer than 30 tests is set in grey and says it is rough, and leaves out the share of areas it beats
  (which counts only areas with 30 tests or more). Twin places in OSM (حطين and حي حطين, Arabic and Kurdish
  spellings) with the same squares and numbers within 300 m are merged in `build/places.py`.
- Type: Rubik (SIL OFL, `site/fonts/`), chosen for a clear speed-test feel, round shapes that read well on cheap phone
  screens, and Arabic digits that stay legible at 13 px and at 96 px.
- The street map is MapLibre GL JS 4.7.1 with PMTiles 3.2.1 (`site/vendor/`, with licences), loaded only on area
  pages. In the page it is a still picture the page scrolls over; a tap or «افتح الخريطة كاملة» opens it full screen,
  where it moves and a tap on a street gives its 500 m square's speed and test count. Streets from squares with few
  tests are drawn fainter. On wide screens the map sits beside the numbers and stays in view.
- Tiles: three PMTiles files by zoom (`site/tiles/iraq-a.pmtiles` z4 to 11, `iraq-b` z12, `iraq-c` z13, 34.7 MB
  together), read in pieces where the host answers range requests and whole where it does not. The page keeps its
  own routing so it also works inside a frame.

Test it before showing anyone: `NODE_PATH=/opt/node-tools/node_modules node build/check.cjs --out <dir>` drives every
page and interaction at phone, tablet and desktop sizes and on slow 4G (home text in about 1.3 s, ready in about
3 s), with screenshots and automatic layout and Arabic checks. `build/design-audit.cjs --out <dir>` screenshots every
page at three sizes and measures type styles, gaps, text measure and edges for a design review.

Rebuild everything, in order: `python3 data/fetch.py` (boundaries, IODA, base layers), `python3 build/ookla_years.py`,
`python3 build/osm_places.py`, `python3 build/places.py`, `python3 build/govmap.py`, `python3 build/exams.py`,
`python3 build/tiles.py` (needs `pip install duckdb shapely pyshp scipy mapbox-vector-tile pmtiles`).
`build/ground.py` made the relief plate of the night version and is no longer used by the site.
Try it locally with `node build/serve.cjs` (Python's http.server can't do range requests) and open
http://localhost:8765; add `--no-range` to act like a host without range requests.

A private test page of the whole site is published as one HTML file with its data and tiles beside it:
`python3 build/artifact.py <out dir>` writes the page (CSS, fonts and script inline, MapLibre and PMTiles from cdnjs
and jsDelivr) and the tiles as base64 text parts of at most 15 MB, for a host that serves no binary files.
`node build/og.cjs` renders the share image `site/og.jpg` from the home page.

Before sharing the link, set `og:image` in `site/index.html` to the full address of `og.jpg` on the real domain and
add `og:url` (WhatsApp and Facebook previews need absolute addresses), then run `check.cjs --base <live url>`; on a host
without range requests an area page costs about 20 MB instead of 1 MB.

To publish: any static host that serves range requests (Vercel, Netlify, GitHub Pages, Cloudflare Pages). On Vercel,
make a new project from this repo with the root directory `marketing/iraq-internet-map/site` and no build command;
it stays separate from the viZion site.

The live counts on the home page (visitors and finished tests) come from `site/api/stats.mjs`, a Vercel function. It
needs a store: in the Vercel project, Storage, Create, Upstash for Redis (the free plan is enough), and connect it to
the project; that adds `KV_REST_API_URL` and `KV_REST_API_TOKEN`, then redeploy. It keeps only the two numbers. A
browser counts as a visitor once; a line or ping test counts when it finishes; the same address counts once per kind
every 10 seconds. Where there is no store (another host, the preview), the counts stay hidden.

## The three night stills (`out/`, 1170 x 2532, phone at 3x; the first direction, kept for the record)

1. **The country** (`still-1-country.png`): every 500 m square measured by Ookla between Jul and Sep 2026 as a point
   of light, main roads from OpenStreetMap carrying the light of the squares they pass. National average 62 Mbps,
   17 in summer 2019.
2. **A neighbourhood** (`still-2-karrada.png`): Baghdad's real streets (OpenStreetMap) glowing with the speed of the
   square each street sits in; Karrada at full light, the rest of the city held down. Karrada 87 Mbps from 4,678
   tests (16 in summer 2019), Baghdad 70, Iraq 62. (The still used the older geoBoundaries governorates; with OCHA's
   the site gives Baghdad 67.)
3. **Exam mornings** (`still-3-exams.png`): one line of light per exam morning from 04:00 to 10:00, right to left,
   dimming when Iraqi networks stop answering IODA's probes. 2025: 32 mornings, 06:00 to 08:00 each time. 2026: 34
   mornings, an hour and a half until July, then 40 minutes from 26 Aug. Written neutrally, dates and minutes only.

Rebuild: `python3 data/fetch.py` (data and base layers), `python3 stills/maps.py` (map plates), then
`NODE_PATH=/opt/node-tools/node_modules node stills/render.cjs`. Check the Arabic with
`node ../tools/textcheck.cjs stills/screens.html '.screen'`.

## Type and colour of the night stills

- Reem Kufi for headlines and Markazi Text for text and numbers (SIL OFL, `fonts/`); a light ramp from ember
  `#6e1c08` through orange and amber to warm white `#fff4de` on a night blue-black ground with NASA's relief. The site
  no longer uses either; it is set in Rubik on white (see above).
- Digits are Arabic-Indic and months are the Iraqi names (تموز، آب، أيلول), on the site too.

## What the data says (checked 23 Oct 2026)

- **Ookla fixed, Jul–Sep 2026:** 24,141 squares inside Iraq, 1.07 million tests, about 245,000 devices; 10,938 squares
  have 10+ tests. Dense enough for neighbourhoods in the cities; small towns (Ramadi, Rutba, Mosul old city) are thin
  and should show as one number per town.
- **Ookla mobile:** 78,000 tests, only 1,632 squares with 10+ tests. Governorate or city level only.
- **Fastest and slowest governorates (fixed, OCHA boundaries):** Sulaymaniyah 89.3 Mbps, Basra 71.5, Baghdad 67.1
  (438,000 tests), Erbil 65.3 ... Anbar 31.5, Diyala 30.3. geoBoundaries' Baghdad covered only 912 km² of the city, which
  put Dora, Saydiya and Zafaraniya outside it; OCHA's is the whole governorate.
- **Trend, third quarter:** fixed 17.1 (2019) to 61.9 Mbps (2026); mobile 10.5 to 62.8. The tests also jumped from
  425,000 to 1.07 million in a year, which changes who is measured.
- **M-Lab:** not used. Its public statistics stop at December 2024, Iraqi tests travel 110 to 160 ms to servers in
  Doha, Tel Aviv or Athens (median 2.7 Mbps against Ookla's 44 in 2024), and one network holds 38% of all tests.
  A provider ranking from it would be unfair, so the site has no provider ranking and no M-Lab test button.
- **IODA:** exam cuts at 06:00 confirmed on the raw signal; at the deepest point only 27 to 38% of Iraqi networks
  answered. In 2026 BGP routes no longer drop during the cut, only the probes do. Measured on the raw signal (below
  60% of the level before 06:00), the cuts add up to about 64 hours over 32 mornings in 2025 and 33 hours over 34
  mornings in 2026; IODA's own event list gives about 70 and 38.

## Sources and licences (credit them on the site)

- Speedtest by Ookla Global Fixed and Mobile Network Performance Maps, CC BY-NC-SA 4.0: credit Ookla, no
  commercial use, and anything made from it is shared under the same licence. If the ministry wants to buy the
  site, the Ookla layer has to be replaced with data the ministry owns.
- IODA (Georgia Tech): outage events and raw signals through its public API, for the exam-day cuts, which the site
  does not show. Check its terms before using them anywhere public.
- OpenStreetMap contributors, ODbL: roads and water through the HOT export on HDX (7 Oct 2026), places and
  Karrada's boundary through Nominatim.
- NASA GIBS: ASTER GDEM shaded relief and VIIRS Black Marble, in the night stills only.
- Natural Earth (public domain): Iraq's outline and the rivers.
- OCHA, Iraq Subnational Administrative Boundaries (COD-AB) on HDX, CC BY-IGO: the governorates (Halabja is still
  inside Sulaymaniyah there).

## Still to do

- Publish it (see above) and check it on a real phone over Iraqi internet; the home page needs no tiles, an area page
  reads only the pieces around it.
- A speed test button only if a test server inside Iraq is available (check Cloudflare's open speed test first).
- Add Halabja as its own governorate, then the reel and the letter to the minister.
- Kurdish-only names in OSM (no Arabic form) are shown as written in Kurdish.
