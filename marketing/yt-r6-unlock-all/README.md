# R6 unlock all: YouTube thumbnail

A 1920×1080 thumbnail for the UnlockX menu video, built from the centre-hero layout (concept C of the three I pitched).
Upload `out/r6-unlock-all.jpg` (YouTube takes thumbnails up to 2 MB); `out/r6-unlock-all.png` is the lossless copy.

The idea: Sledge opens doors with his hammer in the game, so here he has just sheared a padlock off with it.

## Layers, back to front

1. The House map painting, scaled to 1080 px high and softened (the source is only 766 px wide), graded to dusk.
   The floodlights from Sledge's key art are screened over it in the same place as Sledge, with the sky crushed to
   black so only the lamps and their haze add. They fade out toward the bottom, where the warm map takes over.
2. UNLOCK ALL in Big Shoulders Display Black, 288 px, split around the gas mask so the head sits in the gap. The fill
   is a yellow to orange gradient with the brushed brass of the padlock laid inside it (soft light), a 16 px dark
   edge, a hard extrusion 21 px down and a wide soft shadow. No rotation, like the R6 references.
3. The menu, rebuilt from the Recoil tab screenshot with the same labels and values so it stays sharp. Plus Jakarta
   Sans 700 was the closest match to its type. Scaled to 45 %, turned 15° away and 2° off level; the left arm passes
   in front of its top edge and the torso hides the Account tab.
4. Sledge, cut from the key art, sharpened, with a cold rim from the floodlights on his top edges and a warm one from
   the map on the undersides of his arms.
5. The brass padlock with its shackle sheared, both stubs pointing back at the hammer face. Welding sparks burst from
   the point of contact, and saw sparks fly in at the bottom right.
6. `finish.py`: a gentle S curve, cooler shadows and warmer highlights, a little more saturation where there is colour
   already, and about 2.5 % mono grain.

No ESP lines: the menu has none, so the thumbnail does not show them.

## Rebuild

- `python prep.py` (Pillow, numpy, scipy) builds `img/` from `src/`. The cut-out masks are kept in `src/`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes the PNG and the JPG with no metadata.

## Rules for these thumbnails

- Pitch three layouts in text first and build only the one picked: a split screen (before and after), a menu showcase
  (tilted dark panel on one side, hero on the other) and a centre hero with something flanking each side.
- Depth in five layers: blurred map with dark edges and two light colours behind the hero; the title behind the hero's
  head or anchored low; the panel or props; the hero filling 75 to 90 % of the height with a rim light that matches the
  background; then whatever flies in front (sparks, fragments, ESP lines only if the tool really has ESP).
- Title: two to four words, ultra black, gradient fill (white to silver, yellow to orange or green), a dark edge, a
  hard extrusion down and a heavy soft shadow.
- Menus: dark charcoal, a thin light outline, glowing active toggles. Use the real menu, rebuilt sharp if the
  screenshot is soft. Real numbers only.
- Finish over the whole frame: contrast, edge darkening, colour on the focal points, a warm glow at the bottom.

What the reference thumbnails do on top of that: the map stays readable under a light blur; the darkening comes from
one side, not a ring; the hero is cropped at the thighs and overlaps the title or the panel; one foreground object
crosses in front of a panel; the skeleton lines are a few straight strokes, not real bones; and the channel or menu
name can go on the hero's gear.

## Sources

- Sledge key art, the House map painting and the menu screenshot came with the brief.
- Padlock: rawpixel, CC0 (photo px936843). Welding sparks: rawpixel, "Welder Sparks", CC0. Saw sparks: StockSnap,
  "Sparks Saw" (DC05713422), CC0.
- Fonts: Big Shoulders Display and Plus Jakarta Sans, SIL Open Font License, from Google Fonts.
