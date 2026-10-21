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

**Refined (20 Oct):** the user liked the gate but saw misplacements when zoomed in (tower crenellations cut off at the
top, smaller than the wall's, little ledges at the corners, uneven gaps around the gold arches, and a doorway and seams
painted in the ground colour). Redrawn on one grid of U = 6 units, same idea and look: towers 11U, wall 23U, seams U/2,
every merlon 5U×3U in equal steps and flush with the edges, the arch in equal 1.5U bands (doorway, blue, gold, blue, gold,
blue) from one centre. The doorway, seams and (in one colour) the gold bands are real holes, so the mark works on photos,
and each colour is one compound path in the SVGs.

**Colours:** أزرق بابل `#17357D`, حبر الليل `#0C1B40`, ذهب عشتار `#C99A2E` (accent, used sparingly), الطين `#ECE2D0`.
**Type:** Markazi Text for headings and the ministry's name, IBM Plex Sans Arabic for text, IBM Plex Sans for Latin (all
SIL OFL; files in `fonts/`). The user found Readex Pro unprofessional and Noto Naskh Arabic "a default font" (20 Oct);
they picked Markazi Text over Amiri and Reem Kufi.

- `marks.js`: the gate (`gate`, proportions in `GATE`), `markSVG`, and the patterns from it: `crenelBand` (a row of
  stepped merlons, for borders) and `archTile` (nested arches, for large fields). The tablet and the cuneiform grid
  are in git history (commits 2048851 and f51f9c4).
- `concepts.js` / `concepts.html`: round 3's presentation board (`node render-concepts.cjs` → `out/concept-gate.png`).
- `identity.html`: the slides (1920×1080, PowerPoint-ready): cover, the idea, logo versions, construction, colour and
  type, patterns. `node render.cjs` renders `out/slide-1..6.png` (`NODE_PATH=/opt/node-tools/node_modules`).
- `out/svg/`: the gate as SVG (blue, clay for dark grounds, black with open arches) to open in Illustrator.
  `node export-svg.cjs` writes them.
- `shot.cjs page.html out.png [w h]`: a screenshot of any page, for quick looks.

- `applications.html` → slides 7–10: stationery (letterhead, envelope, business card), employee ID and lanyard, the app
  splash and icon, social posts and a story, the building sign and a wayfinding totem.
  `node render.cjs applications.html 7`.
- `website.html` → slides 11–12: the homepage (desktop in a browser, and mobile) and a mobile flow (a service page and
  request tracking) with the design principles. `node render.cjs website.html 11`.
- `closing.html` → slide 13: «شكراً لكم», with a gold rule where the designer's name and contact go.
  `node render.cjs closing.html 13`.
- `proposal.html` → `out/ministry-identity-proposal.pdf` (`node doc.cjs`): **the proposal document**, 21 pages of A4
  landscape, printed from HTML so the text, the mark and the patterns are vector. A full-blue cover with the gate
  standing on the page edge, contents, then three parts, each opened by a dark divider page (big gold numeral, the
  part's sections, a crenellated wall along the bottom): 1 the logo (idea, elements, construction, versions, clear
  space, misuse), 2 the visual system (colour, type, patterns), 3 applications (stationery, ID and app, social, signage,
  website, service flow), and a closing page. Applications are full-bleed photographs with the text below.
  The user found the first version "cheap" (flat drawn mockups, small elements in hairline boxes) and asked for it to
  look made by a professional document designer, not AI, with copy that reads as written by a person.
  Page numbers, the header and the contents are filled in by its script. Patterns are drawn with `archField` and
  `crenRow` from `marks.js` (shapes, not an SVG `<pattern>`, which prints as a blurry bitmap), the same geometry as
  `archTile` and `crenelBand` on the mockups.
- `print/`: the photographic mockups. `art.html` holds the flat print artwork at real sizes (letterhead A4, envelope DL,
  business card front and back, employee ID, lanyard, the app's start screen, the building sign);
  `node print/art.cjs` writes it to `print/tex/` (about 380 dpi). `print/studio.py` (Blender 4.2 as the `bpy` Python
  module: `python3.11 -m venv v && v/bin/pip install bpy==4.2.0`) lays it on paper, card, a phone and a sign panel and
  renders `print/renders/{stationery,devices,sign}.png` (2600×1365, Cycles; `--preview` for a quick look; each final
  takes 3–6 minutes on 4 cores).
- **The designer's name and contact** live in `who.json` (git-ignored). `node doc.cjs --final` and
  `node deck.cjs --final` write the copies with them to `out/final/` (git-ignored, sent to the user); the committed
  `out/` copies show placeholders.
- `deck.cjs` → `out/ministry-identity-proposal.pptx` (rule 5): the 21 pages as full-bleed A4 slides (the fonts won't
  be on the judges' computers), with a presenter script in formal Arabic in every slide's notes. Needs pptxgenjs:
  `NODE_PATH=<dir>/node_modules node deck.cjs [--final]`, after `node doc.cjs [--final]`.
- `node fig.cjs` renders the application and website mockups as figures (`out/fig/`, 2x, slide captions hidden).

Names, phone numbers, IDs and the `example.gov.iq` addresses are placeholders, and the QR-like squares are decoration,
not working codes. The services on the website are illustrations, not the ministry's real list.

- `concept-ar.txt`: the concept write-up for the form (rule 3: the idea, what each element and colour means), in
  formal Arabic. It is the source: `python3 concept.py` lays it out as `concept.html` and `node concept-pdf.cjs`
  prints `out/concept-ar.pdf` (one A4 page in the identity's style).

The 1920×1080 slides (`out/slide-*.png`, `render.cjs`) are the earlier presentation, kept for reference.

- `anim/logo.html` → `anim/out/logo-animation.mp4` (`node anim/render.cjs`, about 2 minutes; `--preview` for 4 stills):
  the logo animation, 6.4 s, 1920×1080, 60 fps, H.264 at 10 Mbps. A gold ground line draws out, the construction grid
  opens from the doorway, the wall and towers rise in whole grid units (like pixels), the gold arches draw up from their
  legs, two signal waves pass behind the gate, and the mark glides into the horizontal lockup as the name arrives from
  the right; the arch pattern settles faintly behind. Sound from the user's pack only (riser, two whooshes, a sparkle),
  each at a fixed gain, peaks about −4 dB. `window.seek(t)` draws any moment; the page plays live in a browser.

- `package/package.cjs` → `out/final/Ministry-Identity-Proposal-Ali-Ahmed-Shihab.zip` (git-ignored: it carries the
  designer's contact): the submission. 01 the presentation (PDF and PPTX, the --final copies), 02 the concept (PDF and
  text), 03 the logo (SVG; every version as vector PDF and transparent PNG from `package/logos.html`: the mark in colour,
  on dark, black and white; the horizontal lockup in colour, on dark and black; the vertical lockup in colour and on
  dark), 04 the animation, 05 the three mockup renders, and `package/README.txt` (a guide to the files, the colours and
  the fonts), 06 the three Blender scenes (named objects, textures packed), and 07 the designer: `package/bio.txt`,
  `package/portfolio.html` (six recent concept ads: Qi Card, Asiacell, Iraqi Airways, Miswag White Friday 1, Miswag
  Shorja, Baly; White Friday 2 is left out because its gift photo was generated with ChatGPT) and the Asiacell reel.
  `package/tidy.py` puts the designer as author in the PDFs and the PowerPoint. Run `doc.cjs --final`,
  `deck.cjs --final` and `anim/render.cjs` first, with `BLENDER_PY` set to a python that has bpy 4.2.

Phone model: "Low Poly Mobile Phone" (the user's download, Creative Commons Attribution), converted from ASCII FBX to
`print/models/phone.glb` with assimp. Credited in figure 3-2's caption; add the author's name there and here when known.
The user prefers flat designs for the social and website pages ("we don't overuse 3D", 20 Oct).
The copy speaks in the first person singular: the user made and researched the identity alone (20 Oct).
