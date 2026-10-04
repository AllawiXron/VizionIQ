# Miswag (مسواگ): 2 White Friday concepts (الجمعة البيضاء)

Two campaign concepts for Miswag's White Friday, made to pitch to their team (they asked for ideas by email after the
Shorja ad). Both play on the word "white" in Iraqi sayings, and each has one 3D object rendered in Blender, a dialect
headline in Alexandria, Miswag's order card and their logo + CTA footer.

**1 · «خبّي قرشك الأبيض… لجمعتك البيضاء.»** The proverb tells you to keep your white coin (قرشك الأبيض) for a black
day (ليومك الأسود). The top of the post is black, with the proverb and its old ending struck out by hand in Miswag red.
A silver coin falls out of the black into the white half, where the new ending waits: «لجمعتك البيضاء.» The coin is
a 1932 Iraqi riyal-style piece («المملكة العراقية · ريال · ١٩٣٢»), the same year as the Shorja photo in the first ad.
Card: «الجمعة البيضاء بمسواگ · خصومات على آلاف المنتجات الأصلية · قريباً، فعّل التنبيه», for the teaser phase.

**2 · «هدية لأمك، لخطيبتك، لأهلك… بيّض وجهك.»** «بيّض وجهك» is what you say to someone who did right by you. Here it is
the gift you bring home: a white box tied with a Miswag-red satin bow on a white studio background. Card: «هديتك
بالطريق · توصيل لكل العراق · الدفع عند الاستلام», badge «عروض الجمعة البيضاء».

- `out/miswag-white-friday-1.png`, `-2.png`: 1620×2025.
- `psd/*.psd`: layered, 1080×1350 (background, 3D render, order card, headline & footer, logo, grain).
- `ads.html`: both layouts. `node render.cjs` re-renders the PNGs; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSDs.

## 3D (`3d/`, Blender 4.2 as the `bpy` module, Cycles)

- `coin_face.html` draws the coin face as a height map; `node shoot.cjs` writes `coin_height.png`.
- `coin.py`: a bevelled silver coin, the face as a bump map (polished field, frosted relief), a reeded edge, lit by
  soft boxes and a dark-to-light studio. `bvenv/bin/python coin.py ../img/coin.png 100 160`.
- `gift.py`: base and lid in matte paper, the ribbon wrapped both ways, a bow of swept bands (two loops, a knot, two
  notched tails), a shadow-catcher floor. `bvenv/bin/python gift.py gift_raw.png 100 160`, then
  `python grade_gift.py gift_raw.png ../img/gift.png` pulls the satin to Miswag red (#de1c24).

## Notes

- Miswag logo, app icon and red `#de1c24` are Miswag's (from miswag.com and the App Store); concepts for a pitch, not
  a commissioned campaign. The claims on the cards are their own (delivery to all Iraq, cash on delivery, more than
  170,000 original products); no discount figures or dates are invented.
- The coin is drawn for this post in the manner of the 1932 riyal's reverse, not copied from a photo.
- Font: Alexandria (Google Fonts, SIL OFL); the coin uses Aref Ruqaa and Readex Pro (SIL OFL).
