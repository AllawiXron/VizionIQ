# «٣ أخطاء تخلي إعلانك يبين رخيص»: design tips for business owners

An Instagram carousel for @allawi.psd, in the page's own colours (paper `#ece3d4`, ink `#1f1510`, orange `#e2541b`,
Readex Pro). Each mistake shows the same ad for a made-up burger shop, «برگر ليل», done cheaply and done properly, side by
side, with the fix in one line of Iraqi dialect. Business owners save posts like this, and it shows the page knows what
it is doing.

Slides, 1080×1350 (`out/mistakes-1..6.png`):

1. **Cover:** «٣ أخطاء / تخلي إعلانك / يبين رخيص», with a cheap and a clean version of the ad, «احفظه وارجعله».
2. **Mistake 1, «تحشي كلشي بإعلان واحد»:** an ad stuffed with offers, prices, phones, address, hours and stickers, next to
   one clear message.
3. **Mistake 2, «خطوط وألوان هواية»:** five fonts, a rainbow, outlines and glows, next to one font and the brand colours.
4. **Mistake 3, «صورة معتمة أو مسحوبة»:** the same layout with a dark, stretched, blocky photo, next to the clean one.
5. **Checklist:** «قبل ما تنشر إعلانك، اسأل نفسك», three questions.
6. **Call to action:** «تريد إعلانك يبين احترافي من أول نظرة؟ راسلني على الخاص», with three of the page's ads
   (`../ig-brand-posts/works/`).

The phone numbers in the cheap ad are masked (×××) on purpose.

## Files

- `photo/burger.jpg`: "Free hand holding plate cheeseburger", rawpixel, CC0 (public domain), via Openverse:
  https://www.rawpixel.com/image/5928088/photo-image-background-public-domain-hand
- `photo/make_bad.py` → `photo/burger-bad.jpg`: the same photo made deliberately bad (stretched, dark, flat, blocky, low
  JPEG quality).
- `slides.html` / `slides.cjs`: the slides; run `node slides.cjs`. The ads are built in the page from the `GOOD` and `BAD`
  sets in its script. Fonts: `../ig-brand-posts/fonts`, `../identity-concepts/fonts`, `../ig-food-brands/fonts`
  (Google Fonts, OFL).
- `caption.txt`: the caption.
