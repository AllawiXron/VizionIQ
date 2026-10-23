# R6 unlock all 5: YouTube thumbnail

The fifth thumbnail for the UnlockX menu video, 1920×1080. The idea comes from the operator art itself: he is already
doing a magician's move, so his raised hand now holds a fan of operator cards like a deck, every one unlocked, and
the UnlockX menu sits on the left as the trick behind it. Upload `out/r6-unlock-all.jpg` (under YouTube's 2 MB
limit); `out/r6-unlock-all.png` is the lossless copy. The thumbnail rules and the notes on the reference thumbnails
are in `../yt-r6-unlock-all/README.md`.

## Layers, back to front

1. The operator art as sent, scaled to the frame and lightly sharpened: the operator on the navy wall of Siege icons.
2. The fan (`fan.py`): five cards cut from the attackers screen sent for the fourth thumbnail, the one with the green
   goggles on top, each scaled to 420 px tall with a thin dark edge and rounded corners. They turn about a point in his palm from -22° to +68°, spread so every face shows, each card
   shading the one under it. His raised hand is cut from the art and laid back over them, with its shadow on the
   cards, so his fingers hold the fan.
3. The menu, rebuilt from the Recoil tab screenshot, bottom left at 42 %, turned 16° toward him.
4. UNLOCK ALL on two lines in the empty navy at the top left: the series type with the gold fill and brushed brass of
   the first thumbnail, which matches his gold visor and the gold cards.
5. `finish.py`: a gentle S curve, cooler shadows and warmer highlights, a little more saturation on the colour areas,
   about 2.5 % mono grain.

The card portraits in the screenshot are 110 px wide, so at 252 px they are a little soft up close; at phone size
they read.

## Rebuild

- `python fan.py` (Pillow, numpy, scipy, OpenCV) builds `img/operator.jpg` and `img/fan.png`. The cut-out mask is kept
  in `src/`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes the PNG and the JPG with no metadata.

## Sources

- The operator art, the operators screenshot and the menu screenshot came with the brief.
- `img/brass.jpg`: the title texture from the first thumbnail (a padlock photo on rawpixel, CC0).
- Fonts: Big Shoulders Display and Plus Jakarta Sans, SIL Open Font License, from Google Fonts.
