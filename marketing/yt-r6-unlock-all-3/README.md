# R6 unlock all 3: YouTube thumbnail

The third thumbnail for the UnlockX menu video, 1920×1080, built from concept A: the menu is held up close to the
camera at the bottom left, in front of Thatcher, who walks out of his own orange smoke. Upload
`out/r6-unlock-all.jpg` (under YouTube's 2 MB limit); `out/r6-unlock-all.png` is the lossless copy. The thumbnail
rules and the notes on the reference thumbnails are in `../yt-r6-unlock-all/README.md`.

## Layers, back to front

1. Thatcher's key art at 1.75×, moved 100 px right so he stands right of centre; the strip that leaves on the left is
   the next 100 px mirrored. The orange smoke and the embers are the art's own.
2. UNLOCK ALL across the top left, the series title (Big Shoulders Display Black, dark edge, hard extrusion) in white
   to silver this time, since gold disappears on orange. The brushed texture inside is the brass from the first
   thumbnail turned to steel.
3. Thatcher, cut from the art, edges refilled from inside the outline and sharpened at the new size. The menu is a
   screen in front of him, so it throws a cool white edge on everything facing the bottom left; his lenses get a
   little more of their own orange.
4. The menu, in two copies with the same transform (perspective 1300 px, turned 30°, tipped back 8°): a blurred copy
   underneath and a sharp copy on top that fades out across the panel, so the near side with UnlockX is crisp and the
   far side, where it crosses his arm, is out of focus. The bottom left corner runs off the frame.
5. `finish.py`: a gentle S curve, cooler shadows and warmer highlights, a little more saturation on the colour areas,
   about 2.5 % mono grain.

## Rebuild

- `python prep.py` (Pillow, numpy, scipy) builds `img/` from `src/`. The cut-out mask is kept in `src/`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes the PNG and the JPG with no metadata.

## Sources

- Thatcher's key art and the menu screenshot came with the brief.
- `img/brass.jpg` is the title texture from the first thumbnail (a padlock photo on rawpixel, CC0).
- Fonts: Big Shoulders Display and Plus Jakarta Sans, SIL Open Font License, from Google Fonts.
