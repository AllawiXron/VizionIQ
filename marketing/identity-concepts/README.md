# Identity concepts: cosmetics and beauty (NADA, WARD)

Two made-up beauty brands, designed as portfolio concepts to show a client in that field what an allawi.psd identity
includes. Each is 4 slides (1080×1350, for Instagram DMs or a carousel): cover, the idea behind the logo with its
versions, colours and type, and the identity on products, business cards and a post.

| Brand | Idea | Palette | Type |
|---|---|---|---|
| **نَدى · NADA** (skincare) | The dot of the letter ن becomes a drop of morning dew, with a glint of light. | skin blush `#E8C7BE`, cocoa `#4A3029`, rose clay `#C98B7A`, cream `#F6EFE6`, leaf `#A9B5A0` | El Messiri, Cormorant Garamond, Readex Pro |
| **وَرد · WARD** (makeup) | The letter و drawn as a rose: its head is a bud spiralling open, its tail the stem, with one leaf. | wine `#5E1624`, rose red `#B23A4E`, gold `#CC9F63`, champagne `#EADBC8`, black `#1B1416` | Aref Ruqaa, Playfair Display, Readex Pro |

- `out/nada-1..4.png`, `out/ward-1..4.png`: the slides (rendered at 1.5x).
- `identity.html`: all eight slides. `node render.cjs` re-renders them.
- `marks.js`: both logo marks, drawn in code (SVG), so they are exact everywhere.
- `photo/prep.py`: product photos. WARD's white tube and bottle are cut out (rembg) and recoloured to wine red with
  gold caps, keeping the photo's shading; NADA's photo is cropped and warmed.

Business card names and numbers are placeholders. Send these as concept work («هويات كونسبت»), never as client work.

## Credits

- Photos: Pexels 12024942 by Mr. Mockup (https://www.pexels.com/photo/12024942/) and Pexels 7691112 by ROMAN ODINTSOV
  (https://www.pexels.com/photo/7691112/), Pexels License.
- Fonts: El Messiri, Cormorant Garamond, Aref Ruqaa, Playfair Display, Readex Pro (Google Fonts, SIL OFL).
