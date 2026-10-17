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

**Round 3 (current, waiting for the user's yes): «بوابة عشتار.. بوابة العراق الرقمية».** The user turned the
tablet down ("looks like an app icon", "the idea itself") and asked for exactly what the brief says, but better. The
Ishtar Gate (`concepts.js`, `gate3`): two tall towers and a lower wall with stepped Mesopotamian crenellations, and an
open arch framed by two nested gold arches, which are both the gate's recessed arches and signal waves. A gate is the
state's digital gateway (every service passes through it); open and connected; the stepped crenellations read as
pixels. `concepts.html` → `node render-concepts.cjs` → `out/concept-gate.png`. Also drawn this round and dropped
before showing: a pixel-brick gate (read as an "M" or a server rack), the two rivers meeting (a slingshot) and the
Malwiya as rising tiers (a Christmas tree).

**Colours:** أزرق بابل `#17357D`, حبر الليل `#0C1B40`, ذهب عشتار `#C99A2E` (accent, used sparingly), الطين `#ECE2D0`.
**Type:** Readex Pro for headings, IBM Plex Sans Arabic for text (both SIL OFL; files in `fonts/`).

- `marks.js`: the marks in code. `MARKS.tab` (`tabletMark`) is the chosen one; `morph`, `dissolve` and `growth` are v1.
- `identity.html`: the slides (1920×1080, PowerPoint-ready): cover, the idea, logo versions, colour and type,
  construction. `node render.cjs` renders `out/slide-1..5.png` (`NODE_PATH=/opt/node-tools/node_modules`).
- `out/svg/`: the logo as SVG (blue tablet, clay tablet, black) to open in Illustrator.
- `shot.cjs page.html out.png [w h]`: a screenshot of any page, for quick looks.

Still to do: applications (letterhead, business card, ID badge, social posts, signage), the website concept (home and
one inner page), the PowerPoint and the ZIP for the form.
