# Ministry of Digital Economy and Governance: identity proposal (cuneiform to data)

A proposal for the ministry's logo and identity competition (applications close 30 Oct 2026), for the user's
@allawi.psd work. The user chose the direction «من أول سجلّ في التاريخ.. إلى الاقتصاد الرقمي».

**The mark:** three lines, read left to right as cuneiform was written. Each line goes from a cuneiform wedge, to the
same wedge head drawn in pixels (a stepped 5×5 triangle), to a single pixel. The top right pixel is gold: the new value.
The regular 3×3 layout stands for governance (order, clarity, transparency).
- An earlier draft used the bare wedge head in the middle column; with a triangle next to a square it read as "play ▶
  stop ■" buttons, so the middle became the pixelated wedge.
- Two other directions were explored and dropped: "dissolve" (wedges whose tails break into pixels) and "growth"
  (vertical wedges as a rising bar chart, which read as nails or golf tees). Both are still in `marks.js`.

**Colours:** أزرق بابل `#17357D`, حبر الليل `#0C1B40`, ذهب عشتار `#C99A2E` (accent, used sparingly), الطين `#ECE2D0`.
**Type:** Readex Pro for headings, IBM Plex Sans Arabic for text (both SIL OFL; files in `fonts/`).

- `marks.js`: the mark in code (`hWedge`, `pxWedge`, `sq`; `MARKS.morph` is the chosen one).
- `identity.html`: the slides (1920×1080, PowerPoint-ready): cover, the idea, logo versions, colour and type,
  construction. `node render.cjs` renders `out/slide-1..5.png` (`NODE_PATH=/opt/node-tools/node_modules`).
- `out/svg/`: the mark as SVG (colour, white, black) to open in Illustrator.
- `shot.cjs page.html out.png [w h]`: a screenshot of any page, for quick looks.

Still to do: applications (letterhead, business card, ID badge, social posts, signage), the website concept (home and
one inner page), the PowerPoint and the ZIP for the form.
