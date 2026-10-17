# Social media ad — Sala (سلة)

A 4:5 post for **Sala**, the grocery delivery app from Ramadi ([@sala.iqr](https://www.instagram.com/sala.iqr/),
sala-iqr.com), made for the allawi.psd portfolio. Their name means "basket", and the add-to-cart button in their app
literally reads «اضافة الى السلة».

**Idea.** Twist the proverb everybody grew up with:

> بيبيتك تگول:
> لا تخلي البيض كله بسلة وحدة
> **إلا هاي.**
>
> "Grandma says: don't put all your eggs in one basket. Except this one."

A real basket of eggs, tilted and lit (a soft glow behind, a contact shadow under it), sits in the middle of their own
hand-drawn grocery doodles. A white hand-drawn stroke underlines «هاي» and swings into an arrow onto the basket, and an
app card in their UI language, with a thumbnail cropped from the same eggs, is pinned on it: «طبقة بيض، ٣٠ حبة ·
توصيل للرمادي والفلوجة · ✓ أضيفت للسلة». Footer: their logo, their line «تسوّق بذكاء من بيتك» and «حمّل التطبيق».

Same allawi.psd system as the Baly, Miswag and Saj Al-Reef posts (real photography, Alexandria dialect headline
built as a line and a short punch, a pinned app card, logo + CTA footer), in Sala's red and white.

- `out/sala-ad.png`: the ad, 1620×2025.
- `psd/sala-ad.psd`: layered, 1080×1350 (red + doodles, egg basket, app card, headline & footer, logo).
- `ad.html`: the layout. `node render.cjs` re-renders the PNG; `node render.cjs --layers` then `python build_psd.py`
  rebuilds the PSD.
- `photo/basket_fix.py`: cleans the basket cut-out (leaves seen through the wire mesh → shadow, black point restored):
  `python basket_fix.py basket_cutout.png ../img/basket.png`. The cut-out was made from `source-fresh-eggs.jpg` with
  rembg (isnet-general-use), keeping the largest component.

## Assets

- **Photo:** "Fresh Eggs" by Autumn Mott (Unsplash, 2015), CC0 via Wikimedia Commons:
  https://commons.wikimedia.org/wiki/File:Fresh_Eggs_(Unsplash).jpg (the camera EXIF still says "all rights
  reserved", but the photo was published on Unsplash under CC0 and is listed CC0 on Commons).
- **Sala logo, red `#e10b17` and doodles:** their App Store icon and the doodle artwork from sala-iqr.com, converted to
  white-on-transparent. Sala's trademark; label the post a concept if they did not commission it.
- **Service areas:** Ramadi (their bio) and Fallujah (their «الفلوجة… تطبيق سلة وصلكم رسمياً» post).
- **Font:** Alexandria (Google Fonts, SIL OFL).
