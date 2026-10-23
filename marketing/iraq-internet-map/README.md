# خريطة الإنترنت في العراق (Iraq internet map)

A public site that shows how fast home internet really is in every part of Iraq, made for the Minister of
Communications' call (Mustafa Sanad, Oct 2026) for local software built by Iraqis. Idea and design: @allawi.psd.

The look: Iraq at night seen from above, where the light is internet speed instead of electricity. Brighter means
faster, dim ember means slow, dark means no measurements. Everything on screen is real data or real geography.

## The site (`site/`)

A static site, no build step: `site/index.html`, `app.js`, `app.css`, data in `site/data/`, the map in three
PMTiles files by zoom (`site/tiles/iraq-a.pmtiles` z4 to 11, `iraq-b` z12, `iraq-c` z13, 34.7 MB together, each under
15 MB) and `site/tiles/ground.jpg`. The page reads a tile file in pieces where the host answers range requests and
fetches it whole where it does not, and keeps its own page routing so it also works inside a frame. MapLibre GL JS 4.7.1 and
PMTiles 3.2.1 are kept in `site/vendor/` with their licences, so nothing loads from outside. The first page needs only
`govs.json`, `country.json` and `exams.json` (21 KB); the map libraries and the 4,300 areas in `places.json` load after it
is on screen, and area pages wait for them.

The page reads top to bottom in plain sentences (rebuilt 23 Oct after the user found the first version confusing:
no colour key, numbers without labels, text floating over the map):
- **Home:** what the site does in one sentence, a real search box with examples, the البيت / الموبايل switch, the
  map with its colour key and controls (on phones it sits in the page and moves with two fingers; ملء الشاشة opens it
  full screen), Iraq's numbers as labelled rows, the governorates as a ranked table, and the exam days as a small table.
- **Area pages** (`#/p/<osm id>`, `#/g/<governorate>`): one answer sentence (معدل سرعة تنزيل ... يبلغ ٨٧ ميغابت), how it
  compares with its governorate and Iraq and what share of areas it beats, a scale with the three marks, the map
  focused on the area, home and mobile side by side in one table, the summer of every year since 2019, nearby areas.
- **Exams** (`#/exams`): the days, usual hours and total per year, then every day as a labelled row (date, line from
  04:00 to 10:00, dark where the internet was cut); tap a day for its exact times.
- Brightness and colour on the map are download speed; ember is slow, white is fast, dark is no tests. Tap a square
  for its speed and test count. No area shows a number from fewer than 10 tests.
- Kufi headings set their digits in Markazi; numbers never sit next to each other across a comma (Arabic bidi
  joins them into one number).
- Ranked lists give the test count under every name, and equal numbers share a place. A governorate's place in the
  order says when a neighbour is within 5%.

Test it before showing anyone: `NODE_PATH=/opt/node-tools/node_modules node build/check.cjs --out <dir>` drives every
page and interaction at phone, tablet and desktop sizes and on slow 4G, with screenshots and automatic layout and
Arabic checks. Then look at every screenshot as an Iraqi on a phone, as the minister, as a designer, as someone checking
the numbers against `site/data/`, and for contrast and tap sizes.

Rebuild everything, in order: `python3 data/fetch.py` (boundaries, IODA, base layers), `python3 build/ookla_years.py`,
`python3 build/osm_places.py`, `python3 build/places.py`, `python3 build/exams.py`, `python3 build/tiles.py`,
`python3 build/ground.py` (needs `pip install duckdb shapely pyshp scipy mapbox-vector-tile pmtiles`).
Try it locally with `node build/serve.cjs` (Python's http.server can't do range requests) and open
http://localhost:8765; add `--no-range` to act like a host without range requests.

A private test page of the whole site is published as one HTML file with its data and tiles beside it:
`python3 build/artifact.py <out dir>` writes the page (CSS, fonts and script inline, MapLibre and PMTiles from cdnjs
and jsDelivr) and the tiles as base64 text parts of at most 15 MB, for a host that serves no binary files.

To publish: any static host that serves range requests (Vercel, Netlify, GitHub Pages, Cloudflare Pages). On Vercel,
make a new project from this repo with the root directory `marketing/iraq-internet-map/site` and no build command;
it stays separate from the viZion site.

## The three stills (`out/`, 1170 x 2532, phone at 3x)

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

## Type and colour

- **Reem Kufi** (headlines and big numbers): a geometric Kufi. The Kufic script is named after Kufa in Iraq, and
  its square construction echoes the 500 m squares the data comes in. Its Arabic digits read well only at large
  sizes, so years and small numbers are set in Markazi.
- **Markazi Text** (text, labels, years): a Naskh text face the user picked for the ministry identity work.
- Both are SIL OFL, files in `fonts/`.
- Light ramp from slow to fast: ember `#6e1c08`, orange `#e2681c`, amber `#ffb856`, warm white `#fff4de`. Ground: a
  cold night blue-black with NASA's real relief pressed into it. Big numbers take the light colour of their own speed.
- Digits are Arabic-Indic and months are the Iraqi names (تموز، آب، أيلول).

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
- IODA (Georgia Tech): outage events and raw signals through its public API. Its terms of use still need checking
  before the site goes public.
- OpenStreetMap contributors, ODbL: roads and water through the HOT export on HDX (7 Oct 2026), places and
  Karrada's boundary through Nominatim.
- NASA GIBS: ASTER GDEM shaded relief and VIIRS Black Marble (only the neighbours' faint lights are used).
- Natural Earth (public domain): Iraq's outline and the rivers.
- OCHA, Iraq Subnational Administrative Boundaries (COD-AB) on HDX, CC BY-IGO: the governorates (Halabja is still
  inside Sulaymaniyah there).

## Still to do

- Publish it (see above) and check it on a real phone over Iraqi internet; the 34.7 MB tile file loads in small pieces.
- A speed test button only if a test server inside Iraq is available (check Cloudflare's open speed test first).
- Check IODA's terms, add Halabja as its own governorate, then the reel and the letter to the minister.
- Kurdish-only names in OSM (no Arabic form) are shown as written in Kurdish.
