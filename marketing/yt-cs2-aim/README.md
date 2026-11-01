# CS2 cheat video: YouTube thumbnails

Thumbnails for the CS2 cheat video, built on two reference thumbnails I was sent: a light grey studio background,
big black type with one word stressed, one game object as the hero, and the visuals.gg watermark.

## 1. inhuman aim (`out/cs2-inhuman-aim.jpg`, 1920×1080)

1. Light studio grey (`#e4e4e2`), a little darker toward the edges.
2. inhuman aim in PT Serif: inhuman in Regular at 168 px, aim in Bold Italic at 214 px, like the reference's
   bookish serif with the stressed word.
3. The AK-47 Point Disarray, a real CS2 skin, cut from its Steam Workshop render (2000 px, side-on), 1778 px wide on
   the frame with a soft shadow. Behind it the smear (`prep.py`): the gun dragged sideways in red, cyan and green
   copies, motion-blurred along the barrel, as if it just snapped onto a target.
4. A red marker arrow from aim down to the receiver, stopping just above the gun so it doesn't vanish on the red skin.
   It is drawn as a brush stroke: the width swells and thins, the line wobbles, the ink is a little uneven.
5. Watermark bottom right: visuals.gg in the same Bold Italic, grey, with the dot in red, the aim dot.
6. `finish.py`: gentle S curve, warm/cool split, about 2.5 % grain; writes the PNG and the JPG with no metadata.

## Rebuild

- `python prep.py` (Pillow, numpy, scipy, OpenCV) builds `img/ak.png`, `img/smear.png` and `img/arrow.png`. The gun's
  cut-out mask is kept in `src/`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes `out/cs2-inhuman-aim.png` and `.jpg`.

## Sources

- AK-47 Point Disarray: the skin's Steam Workshop render by C-LEGFX, via the Counter-Strike wiki
  (`Csgo-ak47-point-disarray-workshop.jpg`). Game art; used as fan content, as the references do.
- Font: PT Serif, SIL Open Font License, from Google Fonts.
