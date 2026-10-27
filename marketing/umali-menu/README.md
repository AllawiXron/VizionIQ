# معجنات العافية: menu

Menu for Um Ali's home bakery in Baladrooz, Diyala (her Facebook page), replacing the old menu with generated food
pictures. Type only: name, sections and prices, made to be read and ordered from.

- Print: 13 × 13 cm. `out/menu-print.pdf` / `.png` / `.jpg` at the cut size (1536 px, 300 dpi), and
  `out/menu-print-bleed.*` at 13.6 cm with 3 mm bleed on each side (1606 px) for the print shop.
- Post: `out/menu-post.png`, 1080 × 1080 (the print square).
- Story: `out/menu-story.png`, 1080 × 1920, same menu with larger spacing; nothing in the top 200 px.

Fonts: Aref Ruqaa for the name and section titles (Ruqaa, the hand of bakery signs here), Almarai for items and prices
(clear at 9 pt). Both from Google Fonts (OFL), in `fonts/`. Browns she asked for: coffee band #4b2d1c, light brown
#d9b07a, section titles #6a3c20 on light cream paper.

Logo: her chef profile picture, cut off its white background by `cut_logo.py <source.jpg> art/chef.png` (source not
kept in the repo), sitting on the bottom edge of the band.

Items live in the `MENU` list in `menu.html`; pieces per box go once under a section title when every item shares them.
Edit there and run `node render.cjs`.
