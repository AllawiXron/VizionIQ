# شغف للحلويات: story menu

Menu for Shaghaf, a home dessert maker in Fallujah who found @allawi.psd through the page ad. Two Instagram stories
(1080 × 1920) for her stories and a highlight: `out/shaghaf-menu-1` (the trays and boxes) and `out/shaghaf-menu-2`
(the two cakes and the four cups), PNG and JPG.

She asked for every dessert on one shared background instead of a different backdrop per photo, and left the design
to me. So each dessert is cut out of her own photos and laid on one light linen cloth, seen from above, with the
window light from the top left and the shadows falling to the bottom right. Each name and price sits in the empty
cloth beside its dish, aligned to the edge that faces it. The four cups share one price, so their names sit around
them the way she labels them in her own story.

Prices (from her, 27 to 28 Oct): بسبوسة البوكس 8,000; خلية النحل الثلاثية 8,000; خلية النحل سادة 5,000; سينابون
البوكس 4 قطع 6,000; كيكة 8,000; كيكة الرخام 10,000; the cups 3,000 each. She left out حلا بالفستق الحلبي (it doesn't
sell) and the big trays (shown in her photos for looks only). Delivery is inside Fallujah only.

## Files

- `cut.py <her photos> art/`: cuts each dessert out of her photos. Her photos are not kept in the repo.
- `logo.py <tiramisu photo> art/logo.png`: lifts her logo off the wall in her tiramisu photo (she has no logo file yet).
- `cloth.py`: the cloth, from Poly Haven's Hessian 380 scan (CC0), lifted to the beige of the wall behind her logo.
  Get `tex/hessian_380_diff_4k.jpg` from polyhaven.com/a/hessian_380 first (kept out of git, 13 MB).
- `menu.html` / `render.cjs`: layout and type. Positions are in `STORIES`. Run `node render.cjs`.

Font: El Messiri 500/700 (Google Fonts, OFL), whose soft naskh matches the للحلويات line of her logo. Brown #5b3a28
from the logo.
