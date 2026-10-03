# Social media ad — Saj Al-Reef (صاج الريف)

A 4:5 offer post for Saj Al-Reef, the Baghdad restaurant chain (Karrada, Street 62 · Mansour, 14 Ramadan Street), made
for the allawi.psd portfolio. (Not the Michigan "Saj Alreef", which only borrowed the name.)

**Brief from their own feed.** Their posts are warm, full-bleed food photography around «اللمة» (the family gathering),
with quzi as the hero dish, a dialect line («يلم الحبايب», «قوزي يتسولف بي») and a boxed offer: «عرض لفترة محدودة ·
قوزي مكس · 37 ألف دينار». This post takes the same offer and pushes it further.

**Idea.** Friday lunch, and the family can't agree: lamb or chicken? Quzi Mix answers with one word.

> غدا الجمعة
> لحم لو دجاج؟
> **ثنينهم.**
>
> "Friday lunch. Lamb or chicken? Both."

The offer (their real one, from their posts and Baly listing) is a pinned app-style card on the tray: «عرض لفترة
محدودة · قوزي مكس · قوزي لحم، قوزي دجاج، مقبلات وسط، ٢ شنينة · ٣٧ ألف دينار». Footer: logo, both branches, «اطلب هسة».

The allawi.psd system: real photography, an Alexandria headline in Iraqi dialect built as question → one-word answer,
a pinned card carrying the brand's real offer, logo + CTA footer. Here in the brand's own black and gold.

- `out/sajalreef-ad.png`: the ad, 1620×2025.
- `psd/sajalreef-ad.psd`: layered, 1080×1350 (photo + shade, offer card, headline & footer, logo).
- `ad.html`: the layout over `img/hero.png`. `node render.cjs` re-renders the PNG; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSD.
- `photo/`: `upscale.py` (Real-ESRGAN x4, ONNX, tiled; model `imgdesignart/realesrgan-x4-onnx` on Hugging Face) and
  `plate.py` (blend, extend the slate to 4:5, grade): `python upscale.py source-quzi-mix.jpg quzi_x4.png model.onnx` (model not committed, 67 MB),
  then `python plate.py source-quzi-mix.jpg quzi_x4.png ../img/hero.png`.

## Assets

- **Food photo:** Saj Al-Reef's own «قوزي مكس» product photo (their Baly Food listing, 800×744), upscaled 4× for the
  post. If they commission it, use their original high-res file.
- **Logo and gold:** their logo from their Baly Food listing; gold `#cfad57` sampled from it. Saj Al-Reef's trademark;
  label the post a concept if they did not commission it.
- **Font:** Alexandria (Google Fonts, SIL OFL).
