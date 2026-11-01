# CS2 cheat video: YouTube thumbnails

Thumbnails for the CS2 cheat video. Two thumbnails were sent as a reference for the feel only (light, one object, big
type); a first version followed one of them too closely and was replaced. Each one carries the visuals.gg watermark.

## 1. 30 bullets, 1 hole (`out/cs2-one-hole.jpg`, 1920×1080)

The idea: every CS player knows the AK's spray climbs and pulls sideways; here a whole magazine went through one hole.
Kept minimal and modern on purpose: one light background, one line of big type, one object. (A version on a real
concrete wall with stencilled paint read as too realistic and is in the git history.)

1. Plain light grey, a touch lighter at the top.
2. Bricolage Grotesque, a grotesk with some character in its curves: 30 bullets at 118 px in grey, 1 hole at 392 px
   in near-black. The o of hole is the bullet hole: a real crater cut from a photo of a shot concrete wall, the
   concrete round it toned to the background so it reads as a hole punched through the page.
3. The AK-47 Point Disarray under the words, 1250 px wide, tipped up 5°, muzzle just below the hole, soft shadow.
4. Watermark bottom left: visuals.gg in the same face, grey, its dot a tiny copy of the same bullet hole.
5. `finish.py`: gentle S curve, warm/cool split, about 2.5 % grain; writes the PNG and the JPG with no metadata.

## Rebuild

- `python prep.py` builds `img/ak.png` (the gun's mask is kept in `src/`).
- `python minimal1.py` builds `out/raw.png`; `python finish.py` grades it into `out/cs2-one-hole.png` and `.jpg`.
  (Pillow, numpy, scipy, OpenCV.)

## Sources

- Bullet hole: from "Damaged concrete wall with large hole and impact marks", Pexels (photo 35452995), free under
  the Pexels licence.
- AK-47 Point Disarray: the skin's Steam Workshop render by C-LEGFX, via the Counter-Strike wiki. Game art.
- Font: Bricolage Grotesque, SIL Open Font License, from Google Fonts.
