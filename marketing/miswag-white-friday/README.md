# Miswag (مسواگ): 2 White Friday concepts (الجمعة البيضاء)

Two campaign concepts for Miswag's White Friday, made to pitch to their team (they asked for ideas by email after the
Shorja ad). Both play on the word "white" in an Iraqi saying.

**The look (v5):** the same language as big regional campaigns (valU, Injaz, Bunzy). Each post has one product in
a seamless red studio, big white display lettering (Lalezar, with Marhey for the lead line), a small logo top right,
the campaign tag top left, and one CTA. The two studio shots were made with ChatGPT image generation by allawi.psd
(`photo/chatgpt-pricetag.png`, `photo/chatgpt-gift.png`); the gift shot is upscaled with Real-ESRGAN.

**1 · «بالجمعة البيضاء… الأسعار انگصّت»** «انگصّت» is Iraqi for "got cut": a blank price tag snipped in half by
scissors, with the Miswag mark printed on the tag (multiplied into the card, at its angle). The white pill says it
plainly: «كلشي من مسواگ بأسعار أقل». (This replaced the piggy-bank post; its files, `photo/chatgpt-piggy.png` and
the 1932 riyal cut-out `img/riyal.png`, are kept.)

**2 · «هدية لأمك، لخطيبتك، لأهلك… بيّض وجهك»** «بيّض وجهك» is what you say to someone who did right by you; here it
is the gift you bring home. To make it plainly Miswag's, the gift has a Miswag tag tied to the bow. The line under
the headline says what the post is: «هداياك من مسواگ بأسعار الجمعة البيضاء».

- `out/miswag-white-friday-1.png`, `-2.png`: 1620×2025.
- `psd/*.psd`: layered, 1080×1350 (studio shot, printed logo / gift tag, headline & UI, logo).
- `ads.html`: both layouts. `node render.cjs` re-renders the PNGs; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSDs.
- `photo/prep_sets.py`: prepares the studio shots at 1620×2025 (`--x4 DIR` uses Real-ESRGAN upscales); it moves the
  gift up so it clears the CTA row (and, for the retired piggy shot, paints out the generated US quarter).
- `photo/prep.py`: the coin cut-out (`img/riyal.png`), plus earlier cut-outs from stock photos (piggy, gift box)
  used in v4.

## Photos

- Studio shots: generated with ChatGPT by allawi.psd.
- 1932 Iraqi 1 riyal (Faisal I), by Windrain, CC0, on Wikimedia Commons:
  https://commons.wikimedia.org/w/index.php?curid=155062265
- v4 stock photos (kept in `photo/`): piggy bank by Jay Castor, Unsplash (https://unsplash.com/photos/jZnvn5x08BE);
  gift box, Pexels 13975271 (https://www.pexels.com/photo/two-gift-boxes-13975271/).

## Notes

- Miswag's logo and red `#de1c24` are theirs (from miswag.com and the App Store); these are pitch concepts, not a
  commissioned campaign. Only Miswag's own claims are used (delivery to all Iraq, more than 170,000 original
  products); no discount figures or dates are invented.
- Fonts: Lalezar, Marhey, Alexandria (Google Fonts, SIL OFL).
- `3d/` holds the earlier Blender rounds (v1–v3), kept for reference.
