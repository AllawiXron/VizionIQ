# AMR aljanabi: spec designs for a pitch

Two free sample posts for @amr.aljanabi (AMR aljanabi perfumes, Baghdad), which the user wants to pitch to become
the page's designer. Real bottle photos (sent by the user) instead of AI scenes; name, notes and price clear; one
identity built on the existing serif «AMR aljanabi» wordmark.

Facts from the page's own captions (9 Oct 2026):
- Alexandria 2: lavender, rosewood, apple → oud, sandalwood, amber; category S; 35ml; 25,000 IQD.
- Mancera Amberful: yuzu, bergamot, pink pepper, nutmeg / violet, patchouli, amber wood / amber, cedar, oakmoss;
  category S; 35ml; 20,000 IQD.
- Delivery to all Iraqi provinces 5,000 IQD. Shop: Baghdad, Karrada Dakhil.

Fonts (local, `fonts/fonts.css`): Cormorant Garamond (Latin, close to the AMR wordmark), El Messiri and Tajawal (Arabic).

## v1: luxury template (`posts.html`, renders in `out/v1/`)

The user rejected it as looking "made in chatgpt" (the dark-gold, arch, icons and button-bar look).

One template for the whole page: his serif «AMR aljanabi» wordmark with a diamond rule; his real bottle photo in a
gold-lined arch; the name in Cormorant Garamond with a gold italic accent; notes or features in three clear rows;
a band with the price big on the left and delivery, location and «اطلب بالدايركت» on the right. Each perfume gets its
own accent: amber for Amberful, black and gold for Slazenger Gold.

- `post-1-amberful.jpg`: everything from his Mancera Amberful caption (notes, category S, 20 ألف, 35ml).
- `post-2-slazenger.jpg`: only what his label and bio say (35ml eau de parfum, French and Swiss oils, aged by hand,
  «بدائل نخبوية لأشهر الماركات العالمية»). The price is not known yet, so the band says «السعر بالدايركت»; set it in
  `#slz-price` once the user has it.

The photos are the user's screenshots of his reels (about 500px wide, `photos/src/`), cropped, enlarged 2× with
lanczos and lightly sharpened. Originals from him would make the real posts sharper.

## v2: apothecary collage (`collage.html` → `out/collage-*.jpg`, `node render.cjs collage.html`)

The user's own handmade style (kit copied from `../ig-highlights`: paper, dark desk, grain, ruled card, tape, kraft
tag, worn rubber stamp, Aref Ruqaa handwriting, Courier Prime typewriter), made to fit his story («معتقة يدوياً»):
- Amberful on aged paper: the photo as a taped print, a typed apothecary label (AMBERFUL · eau de parfum — 35 ml ·
  hand-aged · category S), the caption's line handwritten, a kraft tag «20 ألف / عبوة 35ml», a ruled card with the
  three note rows, a «معتّق يدوياً» stamp, and a torn slip with delivery, Karrada and «اطلب بالدايركت».
- Slazenger Gold on the dark desk: the big «94» jar print and the 35 ml bottle print joined by a drawn arrow and the
  note «نفس العطر.. بعبوة 35ml» (both labels read Slazenger Gold), the typed label, «ليش AMR؟» with the three bio
  lines, and a tag «35 ml / السعر بالدايركت» until the price is known.

The user found the collage "too much for his style".

## v3 (current): editorial (`editorial.html` → `out/editorial-*.jpg`, `node render.cjs editorial.html`)

A magazine spread, the opposite of the AI template: flat paper (warm for Amberful, near-black for Slazenger Gold),
one real photo bleeding off the page edge with an italic caption, the name huge in Cormorant Garamond (his logo's
serif) with an accent italic, a hairline-ruled column of copy (notes or bio facts), the price as a big serif numeral,
and a hairline footer (delivery, Karrada, «للطلب: دايركت», @amr.aljanabi). No gradients, glows, icons, boxes or pills.
Slazenger Gold adds a small second picture of his «No. 94» jar, «نفس العطر.. بالقنينة الكبيرة», and keeps
«السعر بالدايركت» until the price is known (`#slz-price`).
