# Identity concepts: cosmetics and beauty (NADA, WARD)

Two made-up beauty brands, designed as portfolio concepts to show a client in that field what an allawi.psd identity
looks like. Each is 5 slides (1080×1350, for Instagram DMs or a carousel):

1. A hero photo.
2. The logo.
3. The idea behind it, with its construction drawn over it.
4. A photo mockup.
5. A brand board: palette, type, pattern, seal or app icon, social post, more mockups.

| Brand | Logo | Palette | Type |
|---|---|---|---|
| **نَدى · NADA** (skincare) | «ندى» set in IBM Plex Sans Arabic Light, with the dot of the ن replaced by a drop of dew. | skin blush `#E8C7BE`, cocoa `#4A3029`, rose clay `#C98B7A`, leaf `#A9B5A0` | IBM Plex Sans Arabic, Cormorant Garamond |
| **وَرد · WARD** (makeup) | «ورد» drawn as one fine gold line: the و is a rose (its head a bud opening inside two petals, its tail the stem and a leaf), then ر and د in the same line. | wine `#5E1624`, rose red `#B23A4E`, gold `#CC9F63`, black `#1B1416` | Amiri, Playfair Display |

- `out/nada-1..5.png` and `out/ward-1..5.png`: the slides.
- `identity.html`: the slides. `node render.cjs slides` re-renders them.
- `marks.js`: the logos, drawn in code.
  - `nadaWordmark()` sets «ندى» on a canvas with and without the dot, finds where the font puts the dot, and places the drop there.
  - `wardWordmark()` and `wardRose()` draw the line logo.
- `assets.html`: the label and card artwork, in white on transparent. `node render.cjs assets` writes it to `art/`.
- `photo/mockups.py`: prints that artwork onto the product photos (`img/mock-*.jpg`).
  - Ink is multiplied into the paper, and gold foil follows the surface's light with a pressed edge.
  - Labels are bent around the bottles, and card corners are found in the photo so the print sits in perspective.
  - WARD's white tube and bottle are recoloured wine red with gold caps.
  - The sample text on the pump bottle's label is painted out first.

Business card names and numbers are placeholders. Send these as concept work («هويات كونسبت»), never as client work.

## Credits

Photos (Pexels License):
- 8101512 (dropper bottles on linen): https://www.pexels.com/photo/8101512/
- 5797999 (pump bottle with eucalyptus): https://www.pexels.com/photo/5797999/
- 4066294 (hand holding a card): https://www.pexels.com/photo/4066294/
- 7691112 (jar, tube and pump with towels, ROMAN ODINTSOV): https://www.pexels.com/photo/7691112/
- 12024942 (tube and pump bottle, Mr. Mockup): https://www.pexels.com/photo/12024942/
- 4466420 (black business cards): https://www.pexels.com/photo/4466420/

Fonts (Google Fonts, SIL OFL): IBM Plex Sans Arabic, Cormorant Garamond, Amiri, Playfair Display, plus Reem Kufi,
El Messiri, Aref Ruqaa, Alexandria, Noto Sans Arabic and Readex Pro, which were tried while choosing.
