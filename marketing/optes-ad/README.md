# Social media ad — OPTES 1.0 Flash (spec post)

A 4:5 launch post for OPTES (optes.code on TikTok, optes3.com), the Arabic-first AI platform, made by allawi.psd as a
sample to pitch post design to them. Not commissioned.

**Idea.** Their launch post lists three promises for the new model: سرعة فائقة، جودة عالية، استهلاك أقل. Said in
Iraqi dialect, those three promises become a question, and the model's name is the one-word answer:

> إطلاق النموذج الجديد
> سريع، ذكي، وخفيف على رصيدك؟
> **فلاش.**
>
> "Fast, smart, and light on your balance? Flash."

The hero is a real lightning strike (Flash), graded into OPTES' black and electric blue, with their gold for the
answer and the CTA. A model card is pinned to the bolt in their own wording: «متاح لجميع المشتركين · OPTES 1.0 Flash ·
سرعة فائقة، جودة عالية، استهلاك أقل», with their mascot app icon and a «جديد» badge. Footer: the OPTES wordmark set
as on their site (Manrope 600, 0.06em tracking), «AI FOR EVERYONE · optes3.com» and «جرّبه هسة».

Same allawi.psd system as the other ads: real photography, an Alexandria headline in Iraqi dialect built as
question → one-word answer, the brand's app card pinned into the photo, logo and CTA in the footer, grain.

- `out/optes-flash.png`: the post, 1620×2025.
- `psd/optes-flash.psd`: layered, 1080×1350 (graded photo + shade, model card, headline & footer, logo).
- `ad.html`: the layout over `img/hero.png`. `node render.cjs` re-renders the PNG; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSD.
- `photo/grade.py`: crop to 4:5 and the black/blue grade with a glow on the bolt
  (`python grade.py source-lightning.jpg ../img/hero.png`).

## Credits

- **Photo:** "Lightning Ground Storm" by Brandon Morgan (Unsplash), CC0, via Wikimedia Commons:
  https://commons.wikimedia.org/wiki/File:Lightning_Ground_Storm_(Unsplash).jpg (1920 px rendition). No credit
  required.
- **OPTES wordmark, colours, mascot icon (`img/app-icon.png`) and wording:** from optes3.com and their launch post.
  OPTES' trademarks; this is a concept.
- **Fonts (Google Fonts, SIL OFL):** Alexandria, Manrope.
