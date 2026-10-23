# خريطة الإنترنت في العراق (Iraq internet map)

A public site that shows how fast home internet really is in every part of Iraq, made for the Minister of
Communications' call (Mustafa Sanad, Oct 2026) for local software built by Iraqis. Idea and design: @allawi.psd.

The look: Iraq at night seen from above, where the light is internet speed instead of electricity. Brighter means
faster, dim ember means slow, dark means no measurements. Everything on screen is real data or real geography.

## The three stills (`out/`, 1170 x 2532, phone at 3x)

1. **The country** (`still-1-country.png`): every 500 m square measured by Ookla between Jul and Sep 2026 as a point
   of light, main roads from OpenStreetMap carrying the light of the squares they pass. National average 62 Mbps,
   17 in summer 2019.
2. **A neighbourhood** (`still-2-karrada.png`): Baghdad's real streets (OpenStreetMap) glowing with the speed of the
   square each street sits in; Karrada at full light, the rest of the city held down. Karrada 87 Mbps from 4,678
   tests (16 in summer 2019), Baghdad 70, Iraq 62.
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
- **Fastest and slowest governorates (fixed):** Sulaymaniyah 90.6 Mbps, Basra 71.5, Baghdad 69.8 ... Diyala 38.5,
  Anbar 30.5.
- **Trend, third quarter:** fixed 17.1 (2019) to 61.9 Mbps (2026); mobile 10.5 to 62.8. The tests also jumped from
  425,000 to 1.07 million in a year, which changes who is measured.
- **M-Lab:** not used. Its public statistics stop at December 2024, Iraqi tests travel 110 to 160 ms to servers in
  Doha, Tel Aviv or Athens (median 2.7 Mbps against Ookla's 44 in 2024), and one network holds 38% of all tests.
  A provider ranking from it would be unfair, so the site has no provider ranking and no M-Lab test button.
- **IODA:** exam cuts at 06:00 confirmed on the raw signal; at the deepest point only 27 to 38% of Iraqi networks
  answered. In 2026 BGP routes no longer drop during the cut, only the probes do.

## Sources and licences (credit them on the site)

- Speedtest by Ookla Global Fixed and Mobile Network Performance Maps, CC BY-NC-SA 4.0: credit Ookla, no
  commercial use, and anything made from it is shared under the same licence. If the ministry wants to buy the
  site, the Ookla layer has to be replaced with data the ministry owns.
- IODA (Georgia Tech): outage events and raw signals through its public API. Its terms of use still need checking
  before the site goes public.
- OpenStreetMap contributors, ODbL: roads and water through the HOT export on HDX (7 Oct 2026), places and
  Karrada's boundary through Nominatim.
- NASA GIBS: ASTER GDEM shaded relief and VIIRS Black Marble (only the neighbours' faint lights are used).
- Natural Earth (public domain): Iraq's outline and the rivers. geoBoundaries IRQ ADM1: governorates (Halabja is
  still inside Sulaymaniyah there; a newer boundary is needed).

## Still to do

- The interactive site: search by area, a page per governorate and town, the mobile layer, the trend since 2019.
- A speed test button only if a test server inside Iraq is available (check Cloudflare's open speed test first).
- Check IODA's terms, add Halabja as its own governorate, then the reel and the letter to the minister.
