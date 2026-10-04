# Miswag (مسواگ): 2 White Friday concepts (الجمعة البيضاء)

Two campaign concepts for Miswag's White Friday, made to pitch to their team (they asked for ideas by email after the
Shorja ad). Both play on the word "white" in an Iraqi saying, and both are built in Blender. They share one campaign
system: a Ruqaa headline in Miswag red, Alexandria for the rest, Miswag's order card, and their logo + CTA.

**1 · «خبّي قرشك الأبيض… لجمعتك البيضاء.»** The proverb tells you to keep your white coin (قرشك الأبيض) for a black
day (ليومك الأسود). The top is night: the proverb in white Ruqaa, its old ending crossed out with a red marker. Silver
coins fall out of the dark into the light; the hero coin is sharp, the others are blurred by the lens and by their
fall. A hand-drawn arrow carries the eye down to the new ending, written in red: «لجمعتك البيضاء.» The coins are
1932 Iraqi riyal-style pieces («المملكة العراقية · ريال · ١٩٣٢»), the year of the Shorja photo in the first ad.
Card: «الجمعة البيضاء بمسواگ · خصومات على آلاف المنتجات الأصلية · قريباً، فعّل التنبيه», for the teaser phase.

**2 · «هدية لأمك، لخطيبتك، لأهلك… بيّض وجهك.»** «بيّض وجهك» is what you say to someone who did right by you; here it
is the gift you bring home. A white box with a Miswag-red satin bow in a white room, in late-afternoon sun that
comes through a shanasheel (the carved wooden window screens of old Baghdad houses) and lays its eight-point stars
across the wall, the floor and the box. The line sits in the shade, top right. Card: «هديتك بالطريق · توصيل لكل
العراق · الدفع عند الاستلام», badge «عروض الجمعة البيضاء».

- `out/miswag-white-friday-1.png`, `-2.png`: 1620×2025.
- `psd/*.psd`: layered, 1080×1350 (background / 3D render, shade, order card, headline & footer, logo, grain).
- `ads.html`: both layouts. `node render.cjs` re-renders the PNGs; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSDs.

## 3D (`3d/`, Blender 4.2 as the `bpy` module, Cycles)

- `coin_face.html` draws the coin face as a height map; `node shoot.cjs` writes `coin_height.png`.
- `coin.py`: bevelled silver coins (the face as a bump map, polished field and frosted relief, a reeded edge), one in
  focus and five at other depths, keyframed falling for real motion blur, with depth of field; a transparent 4:5
  frame. `bvenv/bin/python coin.py ../img/coins.png 100 160`.
- `giftbox.py`: the box (base and lid in matte paper), the ribbon wrapped both ways, and a bow of swept bands (two
  loops, a knot, two notched tails).
- `lattice.py`: the shanasheel window as a gobo (two lattice panels in a frame); `python lattice.py lattice.png`.
- `gift.py`: the room (white floor and wall), the sun through the lattice, a cool sky fill; the full 4:5 frame.
  `bvenv/bin/python gift.py room_raw.png 100 192`, then `python grade_room.py room_raw.png ../img/room.png` (lifts
  the shade towards warm white and pulls the ribbon to Miswag red #de1c24 with `grade_gift.py`).

## Notes

- Miswag's logo, app icon and red `#de1c24` are theirs (from miswag.com and the App Store); these are pitch concepts,
  not a commissioned campaign. The claims on the cards are their own (delivery to all Iraq, cash on delivery, more
  than 170,000 original products); no discount figures or dates are invented.
- The coin is drawn for this post in the manner of the 1932 riyal's reverse, not copied from a photo.
- Fonts: Alexandria, Aref Ruqaa, Readex Pro (Google Fonts, SIL OFL).
