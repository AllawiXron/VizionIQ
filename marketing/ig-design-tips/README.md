# ٧ أشياء يسويها المصمم المحترف: design tips carousel

A 10-slide Instagram carousel for @allawi.psd (1080×1350, `out/tips-1..10.png`). The earlier tip posts
(`../ig-ad-mistakes`, `../ig-why-not-selling`) talk to business owners; this one shows the craft behind the work, so the
profile reads as a designer who knows the trade, not only a feed of finished ads.

The look is an art director's desk: each tip is a print taped to the paper and corrected in orange pen, with a kraft
tag for its number. A piece of tape crosses from each slide into the next, so the swipe reads as one desk. Font: DG
Sahabah only.

1. **Cover:** ٧ أشياء يسويها المصمم المحترف / وما يحجي عنها, an ad with the logo circled صغره! and the offer
   circled هذا هو العرض.. كبره, tag احفظه، راح ترجعله.
2. **Blur test:** the same ad with the logo first and with the offer first, both blurred, each with a small sharp copy.
3. **Size contrast:** a headline 1.2× the text next to one 3× the text.
4. **No pure black:** the cup with a grey shadow and #000 text, next to a brown shadow and #2A170D.
5. **Optical centre:** a play triangle centred by its box, and one moved 18 px right.
6. **Arabic tracking and kashida:** قهوة سمرة set normally, tracked, and stretched.
7. **Grayscale test:** teal on orange-red of the same brightness, in colour and in grey.
8. **Glue layer:** a cut-out cup lit cold from the right pasted on a table in warm light from the left, next to the cup
   in the same light; a layers slip shows the top colour layer لزق.
9. **Checklist** (dark): four checks before handing over a design.
10. **Call to action** (orange): three of the page's ads (`../ig-highlights/assets/work/`), أفكار إعلانات من
    تصميمي, راسلني على الخاص.

سمرة � محمصة قهوة is a made-up roastery; its offer is a made-up example.

## Files

- `studio.py`: the props, built in Blender (Cycles): the takeaway cup with the سمرة sleeve, and a table and plaster
  wall with sun through a window. `python studio.py cup|cold|table|scene` writes `renders/`. Needs the `bpy` module
  (`pip install bpy` in a venv).
- `tex/sleeve.html`, `tex/render.cjs`: the sleeve artwork (`tex/sleeve.png`).
- `slides.html`: the slides; `node render.cjs` renders `out/` (with `NODE_PATH=/opt/node-tools/node_modules`).
  Check text with `node ../tools/textcheck.cjs slides.html '.slide'`.
- `caption.txt`: the caption, 5 hashtags.
