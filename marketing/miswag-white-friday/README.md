# Miswag (مسواگ): 2 White Friday concepts (الجمعة البيضاء)

Two campaign concepts for Miswag's White Friday, made to pitch to their team (they asked for ideas by email after the
Shorja ad). Both play on the word "white" in an Iraqi saying.

**The look (v4):** the same language as big regional campaigns (valU, Injaz, Bunzy). Each post has one real product
photo, cut out, on a seamless Miswag-red studio sweep with a soft contact shadow. The line is big white display
lettering (Lalezar, with Marhey for the lead line). Small logo top right, the campaign tag top left, one CTA.

**1 · «خبّي قرشك الأبيض… لجمعتك البيضاء»** The proverb tells you to keep your white coin for a black day; Miswag
says keep it for your White Friday. A white ceramic piggy bank, with a real 1932 Iraqi silver riyal («المملكة العراقية
· ريال · ١٩٣٢») dropping into the slot and another falling. 1932 is also the year of the Shorja photo in the first ad.

**2 · «هدية لأمك، لخطيبتك، لأهلك… بيّض وجهك»** «بيّض وجهك» is what you say to someone who did right by you; here it
is the gift you bring home. A white gift box tied with a red satin bow, with a few sparkles.

- `out/miswag-white-friday-1.png`, `-2.png`: 1620×2025.
- `psd/*.psd`: layered, 1080×1350 (red studio, photo cut-outs & shadows, headline & UI, logo).
- `ads.html`: both layouts. `node render.cjs` re-renders the PNGs; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSDs.
- `photo/prep.py`: cuts the photos into `img/`:
  - **The piggy bank:** cut with rembg. Its black-studio reflections are pulled to deep red so it sits on the set.
  - **The gift box:** white on a white wall, so it's cut as a quad from four fitted edges. The side face, in shadow,
    is painted back in with the photo's own paper texture and the ribbon wrapping round.
  - **The coin:** cut as a disc, plus a motion-blurred copy for the falling coin.

## Photos

- Piggy bank: Jay Castor, Unsplash (Unsplash License, free for commercial use):
  https://unsplash.com/photos/jZnvn5x08BE
- Gift box: Pexels photo 13975271, "Two Gift Boxes" (Pexels License, free for commercial use):
  https://www.pexels.com/photo/two-gift-boxes-13975271/
- 1932 Iraqi 1 riyal (Faisal I), by Windrain, CC0, on Wikimedia Commons:
  https://commons.wikimedia.org/w/index.php?curid=155062265

## Notes

- Miswag's logo and red `#de1c24` are theirs (from miswag.com and the App Store); these are pitch concepts, not a
  commissioned campaign. Only Miswag's own claims are used (delivery to all Iraq, more than 170,000 original
  products); no discount figures or dates are invented.
- Fonts: Lalezar, Marhey, Alexandria (Google Fonts, SIL OFL).
- `3d/` holds the earlier Blender rounds (v1–v3), kept for reference.
