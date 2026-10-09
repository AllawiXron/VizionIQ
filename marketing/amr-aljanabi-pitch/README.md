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

## The two posts (`posts.html` → `out/`, `node render.cjs`, 1620×2025)

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
