# R6 unlock all 2: YouTube thumbnail

The second thumbnail for the UnlockX menu video, 1920×1080, built from concept B: Deimos aims his revolver across the
frame at the menu, and the menu is what lights him. Upload `out/r6-unlock-all.jpg` (under YouTube's 2 MB limit);
`out/r6-unlock-all.png` is the lossless copy. The thumbnail rules and the notes on the reference thumbnails are in
`../yt-r6-unlock-all/README.md`.

## Layers, back to front

1. The Consulate lobby key art, scaled 1.15 so the arch and the stairs sit behind his head and the wall with the
   painting sits behind the menu. Softened, dimmed and kept warm, darker toward his side and the top. The statue in
   the middle of the lobby stays hidden behind him.
2. UNLOCK ALL across the top right in Big Shoulders Display Black, 250 px, with the same brass-gold fill, dark edge
   and extrusion as the first thumbnail so the two read as a series.
3. The menu from the first thumbnail (rebuilt from the Recoil tab screenshot), at 50 %, turned 14° toward him on its
   right edge, with a pale pink-white light around it in its own colours.
4. Deimos, cut from his image and scaled 1.74× so his head sits near the top and his waist on the frame edge. The
   source is only 563 px tall, so the edge pixels are refilled from just inside the outline (the light smoke he was
   shot against made a halo), then sharpened at the new size. The light from the menu adds a thin pale rim on every
   edge facing it, strongest on the mask and the revolver; the warm lobby adds a soft amber rim on his back and top.
5. `finish.py`: a gentle S curve, cooler shadows and warmer highlights, a little more saturation on the colour areas,
   about 2.5 % mono grain.

## Rebuild

- `python prep.py` (Pillow, numpy, scipy) builds `img/` from `src/`. The cut-out mask is kept in `src/`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes the PNG and the JPG with no metadata.

## Sources

- The Deimos image, the Consulate key art and the menu screenshot came with the brief.
- `img/brass.jpg` is the title texture from the first thumbnail (a padlock photo on rawpixel, CC0).
- Fonts: Big Shoulders Display and Plus Jakarta Sans, SIL Open Font License, from Google Fonts.
