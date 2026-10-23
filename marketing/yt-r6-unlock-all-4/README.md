# R6 unlock all 4: YouTube thumbnail

The fourth thumbnail for the UnlockX menu video, 1920×1080, built from concept C: Sledge is inside the menu and
bursts out of it, his helmet through the top edge and the hammer through the right edge, on the yellow of his poster
art. Upload `out/r6-unlock-all.jpg` (under YouTube's 2 MB limit); `out/r6-unlock-all.png` is the lossless copy. The
thumbnail rules and the notes on the reference thumbnails are in `../yt-r6-unlock-all/README.md`.

## Layers, back to front

1. The poster's own yellow, grain and motion streaks, mirrored, with Sledge painted out: the hole is filled by
   spreading the clean yellow around it inward (at 1/8 size, so the dark streaks don't bleed in), then grain at the
   strength measured on the poster.
2. The menu (rebuilt from the Recoil tab screenshot) as the frame he comes out of: about 1430 px wide, turned 8°,
   running off the bottom of the frame, with a cream edge so its outline reads where he crosses it. Its header and
   the labels down the left stay clear.
3. Sledge, mirrored so the swing goes right and the hammer leaves through the menu's right edge, away from the labels.
   His body stays inside the menu; only the helmet, the mask and the hammer cross its edges. A thin edge in the
   poster's yellow keeps the navy figure apart from the dark menu. The page measures the turned menu's corners and
   hides anything of him right of its edge below the hammer.
4. UNLOCK ALL across the top right in the series type, navy from his suit with the 3D side in a dark ochre from the
   poster, so it sits in the poster's two colours.
5. `finish.py`: a gentle S curve, cooler shadows and warmer highlights, a little more saturation on the colour areas,
   about 2.5 % mono grain.

## Rebuild

- `python prep.py` (Pillow, numpy, scipy, OpenCV) builds `img/` from `src/`. The cut-out mask is kept in `src/`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `thumb.html` to `out/raw.png`.
- `python finish.py` grades it and writes the PNG and the JPG with no metadata.

## Sources

- The Sledge poster art and the menu screenshot came with the brief.
- `img/steel.jpg` is the title texture from the third thumbnail (from a padlock photo on rawpixel, CC0).
- Fonts: Big Shoulders Display and Plus Jakarta Sans, SIL Open Font License, from Google Fonts.
