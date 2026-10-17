# وَرد · WARD: beauty identity in 3D (v3)

The WARD concept, rebuilt in the way strong regional identity case studies are shown (for example @m.aestrodesign's
«مسرى» tea identity). The whole range is shot in one colour world, with products on the brand's own wine and
champagne backdrops. There is a cover that shows everything at once, and colour swatches shaped like the products
(here, lipstick bullets).

Slides, 1080×1350 (`out/ward-1..10.png`):

1. **Cover:** the whole identity at a glance.
2. **The logo:** in gold on wine, with the five colours as lipstick bullets.
3. **The idea:** the rose wāw, with its construction.
4. **The collection:** pump bottle, jar, tube, lipsticks, compact and gift box on podiums.
5. **Lipsticks:** three shades, open and closed.
6. **Skincare:** on champagne.
7. **Gift box:** with the rose pattern.
8. **Gold compact:** the rose pressed into the lid.
9. **Shopping bags.**
10. **Stationery and social:** gold-foil cards, pattern, posts, app icon.

## How it is made

- `studio.py`: Blender 4.2 / Cycles. It builds a seamless studio sweep, three soft area lights and every product at
  real size in centimetres:
  - Lathed profiles for the lipstick, jar, pump bottle and compact.
  - A squeeze tube that flattens to its crimp.
  - A box with lid, and a paper bag with rope handles.
  - Materials: glossy wine lacquer, gold metal, and paper. Artwork is applied as gold foil, ink, or pressed into the
    metal.
  - Run `python studio.py <shot>`. Shots: hero, lipsticks, skincare, giftbox, bags, compact. `--preview` renders small
    and fast. `render_all.sh` renders all six.
- `textures.html` / `textures.cjs`: the artwork the renders use (`tex/*.png`): the logotype, product labels, the rose
  alone, and a tiling rose pattern.
- `slides.html` / `slides.cjs`: the 10 slides.
- Slides 1 and 10 also use `../img/mock-ward-cards.jpg`, the gold-foil business cards printed onto Pexels photo
  4466420 by `../photo/mockups.py`.

The logo drawing is shared with the 2D concepts in `../marks.js` (`wardWordmark`, `wardRose`).
