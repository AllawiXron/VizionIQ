# R6 unlock all 4: YouTube thumbnail

The fourth thumbnail for the UnlockX menu video, 1920×1080. The idea: the wall Sledge breaks is the operators screen,
locked. Every card on it is grey with a padlock; where his hammer lands the wall is smashed open and the same
operators show unlocked behind it, in full colour, and the pieces that carried padlocks fly off. Upload
`out/r6-unlock-all.jpg` (under YouTube's 2 MB limit); `out/r6-unlock-all.png` is the lossless copy. The thumbnail
rules and the notes on the reference thumbnails are in `../yt-r6-unlock-all/README.md`.

Two earlier versions (Sledge bursting out of the menu, then a concrete UNLOCK ALL he breaks) are in the git history.

## Layers, back to front

1. The wall (`wall.py`), from the attackers screen I was sent (`src/operators-unlocked.jpg`), cropped to the grid:
   - Unlocked, behind: the grid as it is, a touch more colour.
   - Locked, in front: every card grey, dark and a little blue, its operator emblem darkened and covered by a white
     padlock badge. The badge is the outline of a real closed padlock from a photo, straightened.
   - The hole, around where the hammer lands: a solid core with an edge made of the cells of a broken-sidewalk photo
     laid over it, and the whole outline wobbling with the sideways wander of a real crack traced from an asphalt
     photo. The broken edge shows the wall's thickness, and the unlocked side throws a little gold light onto it.
   - Cracks: that same traced crack, sent out from the hole at six angles across the locked cards, fading.
2. Sledge, cut from his poster art at 0.9×, his waist on the frame edge, a thin edge in the poster's yellow, his
   hammer face in the hole.
3. The pieces (`wall.py`): up to four bits of the locked wall that carried padlocks, broken along the photo's cells,
   flying out from the hole on the side Sledge doesn't cover, a little bigger as if toward the camera, each with its
   own thickness and shadow.
4. UNLOCK ALL across the top left in the series type with the gold fill and brushed brass of the first thumbnail,
   which matches the gold cards in the hole.
5. `finish.py`: a gentle S curve, cooler shadows and warmer highlights, a little more saturation on the colour areas,
   about 2.5 % mono grain.

The locked look is my recreation (grey card and padlock) made from the unlocked screenshot, as asked.

## Rebuild

- `python prep.py` (Pillow, numpy, scipy) builds Sledge (`img/sledge.png`). The cut-out masks are kept in `src/`.
- `python wall.py` (also OpenCV) builds `img/wall.jpg` and `img/shards.png`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes the PNG and the JPG with no metadata.

## Sources

- The Sledge poster art and the operators screenshot came with the brief.
- Padlock outline: "A small, weathered padlock with peeling...", WordPress Photo Directory, CC0.
- Break: "Broken sidewalk concrete", WordPress Photo Directory, CC0. Crack: "Crack Road", StockSnap (EAH4L9KSFE), CC0.
- `img/brass.jpg`: the title texture from the first thumbnail (a padlock photo on rawpixel, CC0).
- Font: Big Shoulders Display, SIL Open Font License, from Google Fonts.
