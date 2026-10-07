# «ليش إعلانك ما يبيع؟»: selling tips for business owners

A 6-slide Instagram carousel for @allawi.psd (1080×1350, `out/why-1..6.png`) in the page's own look: paper, ink,
orange and the Photoshop selection. It is the companion to `../ig-ad-mistakes`, which covers how an ad looks; this one
covers why an ad does not sell. The structure (a question on the cover, one idea per slide, save and DM on the last)
follows the self-marketing carousel the page owner liked, but it talks to business owners, the people who hire.

1. **Cover:** «ليش إعلانك / [ما يبيع؟]», «حتى لو تصميمه حلو..». An insights card shows 12,480 views and 86 likes, with
   «0 رسائل» selected.
2. **«يحچي عنك.. مو عن الزبون.»** «مطعم الأصالة.. أفضل مطعم بالمدينة» vs «جوعان بنص الليل؟ برگرك يوصلك خلال 20 دقيقة.»
3. **«السعر.. «بالخاص»»** Comments asking «بكم؟» answered «السعر بالخاص», vs a written price.
4. **«يطلب منه خمس أشياء.»** Five chips (تابعونا، اتصلوا، زورونا، شاركوا، واتساب) vs one button «راسلنا هسه واكتب «برگر»».
5. **«يوصل لكل العراق.. وزبونك بمنطقتك.»** A boost to all of Iraq, ages 18–65, vs Baqubah + 10 km, ages 20–40.
6. **Checklist** (dark): four questions, then «تريد إعلان يبيع؟ راسلني» and «احفظ البوست وارجعله».

The shop, the numbers and the prices are made-up examples.

- `slides.html`: the slides. The reasons live in the `REASONS` list in its script. Fonts come from `../brand-ads-2026/fonts`.
- `node render.cjs`: renders `out/`. Run `node ../tools/textcheck.cjs slides.html '.slide'` before exporting.
- `caption.txt`: the caption, with 5 hashtags.
