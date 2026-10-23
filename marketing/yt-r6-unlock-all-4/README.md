# R6 unlock all 4: YouTube thumbnail

The fourth thumbnail for the UnlockX menu video, 1920×1080, on the yellow of Sledge's poster art. The idea: Sledge's
job in the game is breaking walls, so his hammer comes through the word LOCK. The title is made of concrete; the
hammer blows a hole through the C, cracks run out through L, O and K, and the pieces fly toward the camera. UN and
ALL stay whole, so it still reads UNLOCK ALL. The menu sits top left. Upload `out/r6-unlock-all.jpg` (under YouTube's
2 MB limit); `out/r6-unlock-all.png` is the lossless copy. The thumbnail rules and the notes on the reference
thumbnails are in `../yt-r6-unlock-all/README.md`.

An earlier version had Sledge bursting out of the menu with a flat navy title; it is in the git history.

## Layers, back to front

1. The poster's own yellow, grain and motion streaks, with Sledge painted out: the hole is filled by spreading the
   clean yellow around it inward (at 1/8 size, so the dark streaks don't bleed in), then grain at the strength
   measured on the poster.
2. The menu, rebuilt from the Recoil tab screenshot, top left at 45 %, turned 10°, with a cream edge.
3. Sledge, cut from the poster at 0.9×, his waist on the frame edge. A thin edge in the poster's yellow keeps the navy
   figure off the background. His position comes from `title.py`, so the hammer face lands on the C.
4. The title (`title.py`): Big Shoulders Display at weight 900, 310 px. The face is the intact top of a
   broken-sidewalk photo, calmed to light concrete, with a 9 px bevel lit from the top right, a 30 px dark side
   going down left, a dark outline and a soft shadow on the yellow. The broken bottom of the same photo is laid over
   the C at half size: its real cells decide the hole and the loose pieces, and its gaps (thinned to their middle
   line) are the short cracks. The long cracks are one real crack from an asphalt photo, traced along its darkest
   pixel row by row, copied at four angles out from the hole and fading.
5. The pieces (`title.py`): the larger pieces from the hole and the ring around it, each with its own face, a short
   side, a slight blur along its path, and a shadow, moved out from the hole and a little bigger, as if toward the
   camera.
6. `finish.py`: a gentle S curve, cooler shadows and warmer highlights, a little more saturation on the colour areas,
   about 2.5 % mono grain.

## Rebuild

- `python prep.py` (Pillow, numpy, scipy, OpenCV) builds the background and Sledge in `img/`. The cut-out mask is
  kept in `src/`.
- `python title.py` builds `img/title.png` and `img/chunks.png` and prints where Sledge goes.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes the PNG and the JPG with no metadata.

## Sources

- The Sledge poster art and the menu screenshot came with the brief.
- Concrete: "Broken sidewalk concrete", WordPress Photo Directory, CC0. Crack: "Crack Road", StockSnap
  (EAH4L9KSFE), CC0.
- Fonts: Big Shoulders Display and Plus Jakarta Sans, SIL Open Font License, from Google Fonts.
