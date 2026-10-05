# «لو أكلاتنا صارت براندات فخمة»: Iraqi foods as luxury brands

An Instagram carousel for @allawi.psd. Four everyday Iraqi foods are shown as luxury products, with a joke in Iraqi
dialect on each, in the style of bold Iraqi food-brand posts: flat red and yellow, heavy Arabic headlines with a
highlight box, and a few white doodles.

Slides, 1080×1350 (`out/food-1..6.png`):

1. **Cover:** a gloved hand holding up a samoon like a jewel. «لو أكلاتنا العراقية / صارت براندات فخمة».
2. **SAMOON:** the samoon in a velvet jewellery box, «چان بربع… / صار بربع مليون», price tag ٢٥٠,٠٠٠ د.ع.
3. **AMBA:** amba as an eau de parfum. «عطر يبقى وياك ٣ أيام / حتى لو تسبحت».
4. **ISTIKAN:** tea with its own tin. «ما تگدر تگول لا / للاستكان الثاني».
5. **DOLMA:** dolma as a box of pralines. «الفخامة تبدي / من قلبة الجدر».
6. **Question:** «شنو الأكلة الجاية؟», with prompts to get comments, the four products, and
   «تحتاج تصاميم لمشروعك؟ راسلني».

## How it is made

1. `ai/*.png`: the product photos, generated with an AI image tool from prompts that ask for blank, unbranded
   packaging on flat brand-colour backdrops, with the top third left empty. The picks used are `samoon-b`, `amba-a`,
   `tea-b`, `dolma` and `cover`.
2. `brand-art.html` / `brand-art.cjs` → `art/*.png`: the four marks (SAMOON, AMBA, ISTIKAN, DOLMA).
3. `brand.py` → `ai/branded/*.png`: prints each mark onto its packaging as gold foil that follows the surface's
   light and perspective:
   - inside the jewellery box's lid, kept off the loaf;
   - on the dolma box's lid;
   - on a black label on the perfume bottle, under the glass's highlights;
   - wrapped around the tea tin.
4. `compose.py` → `bg/*.png`: fits each photo to the slide. Where the headline needs room, the photo is scaled down and
   its studio backdrop extended.
5. `slides.html` / `slides.cjs` → `out/`: type, doodles and layout. Run `node slides.cjs`.

Fonts: Alexandria 800/900 (`fonts/`), Cormorant Garamond, Aref Ruqaa and Playfair Display (`../identity-concepts/fonts`).
All are from Google Fonts (OFL).
