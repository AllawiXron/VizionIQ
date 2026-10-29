# شغف للحلويات: story menu

Menu for Shaghaf, a home dessert maker in Fallujah who found @allawi.psd through the page ad. Three Instagram stories
(1080 × 1920) for her stories and a highlight, PNG and JPG in `out/`: `shaghaf-menu-1` the trays (بسبوسة, خلية النحل
الثلاثية and سادة), `-2` the cinnabon box and the two cakes, `-3` the four cups under one price.

Each story leads with one dessert big, with its name large beside it, and the other two smaller. Everything sits on one
cocoa-brown linen cloth under a window light from the top left, in the brown and beige of her logo, so her desserts
glow on it the way they do in her own photos. Round plates and trays are her photos cut on the rim as a circle or an
ellipse, so they lie on the cloth like dishes. The box, the cakes and the cups are her photos as prints with a slight
tilt. Every dish has three shadows, falling to the bottom right.

Earlier versions: cut-outs on a light cloth (edges and mixed camera angles looked pasted) and a plain grid of squares
(too basic). Both were dropped.

Prices (from her, 27 to 28 Oct): بسبوسة البوكس 8,000; خلية النحل الثلاثية 8,000; خلية النحل سادة 5,000; سينابون
البوكس 4 قطع 6,000; كيكة 8,000; كيكة الرخام 10,000; the cups 3,000 each. She left out حلا بالفستق الحلبي (it doesn't
sell) and the big trays (shown in her photos for looks only). Delivery is inside Fallujah only.

Before she pays, send `out/preview/*.jpg`: 720 × 1280 copies with @allawi.psd tiled across the whole story, photos
included, and the line نسخة للمعاينة، تصميم علاوي in the middle. Send the clean `out/shaghaf-menu-*` files after the money.

## Files

- `photos.py <her photos>`: the square crops and the grade, into `art/photos/`. Her photos are not kept in the repo.
- `logo.py <tiramisu photo> art/logo.png`: lifts her logo off the wall in her tiramisu photo (she has no logo file yet).
- `cloth.py`: the cloth, from Poly Haven's Hessian 380 scan (CC0), recoloured cocoa (`cloth-dark.jpg`, used) and beige.
  Get `tex/hessian_380_diff_4k.jpg` from polyhaven.com/a/hessian_380 first (kept out of git, 13 MB).
- `menu.html` / `render.cjs`: layout and type. Positions are in `STORIES`. Run `node render.cjs`.

Font: El Messiri 500/700 (Google Fonts, OFL), whose soft naskh matches the للحلويات line of her logo. Names in
cream #f1e3cc, prices in caramel #d9a46a; her logo in cream (`logo.py` writes both colours).
