# CS2 cheat video: YouTube thumbnails

Thumbnails for the CS2 cheat video. Two thumbnails were sent as a reference for the feel only (light, one object, big
type); a first version followed one of them too closely and was replaced. Each one carries the visuals.gg watermark.

## 1. 30 bullets, 1 hole (`out/cs2-one-hole.jpg`, 1920×1080)

The idea: every CS player knows the AK's spray climbs and pulls sideways; here a whole magazine went through one hole.

1. The wall (`wall1.py`): the upper right of a photo of a concrete panel wall full of bullet holes. Every hole and
   its soot is found (darker than the concrete around it), filled from that concrete at quarter size, and the grain
   is put back from clean parts of the same wall, so the panels, joints and rain streaks stay real. A little lighter
   top left, falling off toward the bottom right.
2. The one hole: a single crater from the same photo, chosen between joints, set back on the clean wall right of
   the words at about 320 px.
3. 30 BULLETS / 1 HOLE stencilled on the wall like spray paint (Big Shoulders Stencil Display, 800 and 900): the paint
   takes the wall's texture, the edges are a little soft, with a faint overspray.
4. Watermark: visuals.gg as a red spray tag in the top right, the way a CS2 graffiti sits on a wall (Permanent Marker).
5. The AK-47 Point Disarray (`prep.py` cuts it from its workshop render) across the bottom, 2150 px wide so both
   edges crop it, turned 3°, with its shadow on the wall.
6. `finish.py`: gentle S curve, warm/cool split, about 2.5 % grain; writes the PNG and the JPG with no metadata.

## Rebuild

- `python prep.py` builds `img/ak.png` (the mask is kept in `src/`).
- `python wall1.py` builds `out/raw.png`; `python finish.py` grades it into `out/cs2-one-hole.png` and `.jpg`.
  (Pillow, numpy, scipy, OpenCV.)

## Sources

- Wall: "Damaged concrete wall with large hole and impact marks", Pexels (photo 35452995), free under the Pexels
  licence.
- AK-47 Point Disarray: the skin's Steam Workshop render by C-LEGFX, via the Counter-Strike wiki. Game art.
- Fonts: Big Shoulders Stencil Display (SIL Open Font License) and Permanent Marker (Apache 2.0), from Google Fonts.
