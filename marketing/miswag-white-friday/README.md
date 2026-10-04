# Miswag (مسواگ): 2 White Friday concepts (الجمعة البيضاء)

Two campaign concepts for Miswag's White Friday, made to pitch to their team (they asked for ideas by email after the
Shorja ad). Both play on the word "white" in an Iraqi saying.

**The look (v3, 2.5D):** the same language as the big regional campaigns (valU, Injaz, Bunzy). There is one clean 3D
object on a seamless Miswag-red studio sweep, with soft shadows and glossy materials. The line is big white display
lettering (Lalezar, with Marhey for the lead line). Small logo top left, the campaign tag top right, and one CTA.

**1 · «خبّي قرشك الأبيض… لجمعتك البيضاء»** The proverb tells you to keep your white coin for a black day; Miswag
says keep it for your White Friday. A glossy white ceramic piggy bank, with a silver coin half into the slot and
another falling (motion blur). The coins are 1932 Iraqi riyal-style pieces («المملكة العراقية · ريال · ١٩٣٢»), the
year of the Shorja photo in the first ad.

**2 · «هدية لأمك، لخطيبتك، لأهلك… بيّض وجهك»** «بيّض وجهك» is what you say to someone who did right by you; here it
is the gift you bring home. A white gift box opening: the lid, tied with its red bow, lifts off, the red tissue
lining shows, and confetti flies.

- `out/miswag-white-friday-1.png`, `-2.png`: 1620×2025.
- `psd/*.psd`: layered, 1080×1350 (3D render, headline & UI, logo).
- `ads.html`: both layouts over the renders. `node render.cjs` re-renders the PNGs; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSDs.

## 3D (`3d/`, Blender 4.2 as the `bpy` module, Cycles)

- `studio.py`: shared set: the red cyclorama (floor curving into the wall), soft boxes, a reflection card, a world
  that is dim red for light but bright grey in reflections (so silver reads as silver), the Standard view transform
  (AgX turns the brand red orange), and the 4:5 camera.
- `piggy.py`: the piggy bank (body, snout, ears, eyes, legs, tail, slot) and two coins.
  `bvenv/bin/python piggy.py ../img/piggy.png 100 192`.
- `giftburst.py`: the box from `giftbox.py`, hollowed (red tissue inside), the lid group lifted and tilted, a dim
  glow inside, and confetti. `bvenv/bin/python giftburst.py ../img/giftburst.png 100 192`.
- `coinmesh.py`: the silver coin (face from `coin_face.html` → `coin_height.png` via `node shoot.cjs`, as a bump
  map; reeded edge).
- `giftbox.py`: the white box and the Miswag-red satin ribbon and bow, built from swept bands.
- Earlier rounds, kept for reference: `coin.py` (falling coins, v2), `gift.py` + `lattice.py` + `grade_room.py` +
  `grade_gift.py` (the gift in shanasheel light, v2).

## Notes

- Miswag's logo and red `#de1c24` are theirs (from miswag.com and the App Store); these are pitch concepts, not a
  commissioned campaign. Only Miswag's own claims are used (delivery to all Iraq, more than 170,000 original
  products); no discount figures or dates are invented.
- The coin is drawn for this post in the manner of the 1932 riyal's reverse, not copied from a photo.
- Fonts: Lalezar, Marhey, Alexandria (Google Fonts, SIL OFL).
