# Ministry of Digital Economy and Governance: identity proposal (cuneiform to data)

A proposal for the ministry's logo and identity competition (applications close 30 Oct 2026), for the user's
@allawi.psd work. The user chose the direction «من أول سجلّ في التاريخ.. إلى الاقتصاد الرقمي».

**The mark (v2, current): «اللوح الطيني.. أول شاشة في التاريخ».** A clay tablet, the same soft rounded rectangle as
a phone screen, with two lines of cuneiform (horizontal and vertical wedges) and a third line written in pixels that
ends in a gold text cursor on the left, where an Arabic line ends. One silhouette, read in a second: the first written
records (data, governance) and the screen (digital economy), with the cursor saying the story is still being written.
The tablet is blue with white writing on light grounds, and clay with night-blue writing on dark ones.

How it got here (the user asked for an honest opinion and wants first place):
- v1 «morph»: a 3×3 grid of wedge → pixelated wedge → pixel. A good story, but nine pieces instead of one shape, a
  tech-startup feel, and read from the right (as Arabic readers do) it went pixel → wedge, future to past.
- A single wedge breaking into pixels, in a seal: read as a trumpet or megaphone.
- The star of Shamash from four wedges with pixel rays: read as the ✦ sparkle that AI tools use. Dropped at once.
- Also tried earlier: «dissolve» and «growth» (still in `marks.js`).

**Round 3 (current, the user loves it): «بوابة عشتار.. بوابة العراق الرقمية».** The user turned the
tablet down ("looks like an app icon", "the idea itself") and asked for exactly what the brief says, but better. The
Ishtar Gate (`concepts.js`, `gate3`): two tall towers and a lower wall with stepped Mesopotamian crenellations, and an
open arch framed by two nested gold arches, which are both the gate's recessed arches and signal waves. A gate is the
state's digital gateway (every service passes through it); open and connected; the stepped crenellations read as
pixels. `concepts.html` → `node render-concepts.cjs` → `out/concept-gate.png`. Also drawn this round and dropped
before showing: a pixel-brick gate (read as an "M" or a server rack), the two rivers meeting (a slingshot) and the
Malwiya as rising tiers (a Christmas tree).

**Colours:** أزرق بابل `#17357D`, حبر الليل `#0C1B40`, ذهب عشتار `#C99A2E` (accent, used sparingly), الطين `#ECE2D0`.
**Type:** Readex Pro for headings, IBM Plex Sans Arabic for text (both SIL OFL; files in `fonts/`).

- `marks.js`: the gate (`gate`, proportions in `GATE`), `markSVG`, and the patterns from it: `crenelBand` (a row of
  stepped merlons, for borders) and `archTile` (nested arches, for large fields). The tablet and the cuneiform grid
  are in git history (commits 2048851 and f51f9c4).
- `concepts.js` / `concepts.html`: round 3's presentation board (`node render-concepts.cjs` → `out/concept-gate.png`).
- `identity.html`: the slides (1920×1080, PowerPoint-ready): cover, the idea, logo versions, construction, colour and
  type, patterns. `node render.cjs` renders `out/slide-1..6.png` (`NODE_PATH=/opt/node-tools/node_modules`).
- `out/svg/`: the gate as SVG (blue, clay on night, black with white arches) to open in Illustrator.
- `shot.cjs page.html out.png [w h]`: a screenshot of any page, for quick looks.

- `applications.html` → slides 7–10: stationery (letterhead, envelope, business card), employee ID and lanyard, the app
  splash and icon, social posts and a story, the building sign and a wayfinding totem.
  `node render.cjs applications.html 7`.
- `website.html` → slides 11–12: the homepage (desktop in a browser, and mobile) and a mobile flow (a service page and
  request tracking) with the design principles. `node render.cjs website.html 11`.
- `out/ministry-identity-proposal.pdf`: slides 1–12 in one file.

Names, phone numbers, IDs and the `example.gov.iq` addresses are placeholders, and the QR-like squares are decoration,
not working codes. The services on the website are illustrations, not the ministry's real list.

- `concept-ar.txt`: the concept write-up for the form (rule 3: the idea, what each element and colour means), in
  formal Arabic. It is the source: `python3 concept.py` lays it out as `concept.html` and `node concept-pdf.cjs`
  prints `out/concept-ar.pdf` (one A4 page in the identity's style).

Still to do: the PowerPoint, a logo animation, and the ZIP.
