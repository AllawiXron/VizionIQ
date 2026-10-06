# allawi.psd offer ad + «الخدمات والأسعار» highlight

`offer.html` renders five images with `node render.cjs offer.html`, written to `out/offer-<id>.png`:

- `post` (1080x1350): the offer ad, built as a before/after.
  - Headline «صورة عادية.. / صارت إعلان يبيع», with the Photoshop selection on the second line.
  - «قبل»: the plain stock photo of a gloved hand holding a tube (`../alshifa-lab/photo/source-lab-tube.jpg`), shown as a print labelled IMG_2041.jpg.
  - «بعد»: the finished Al-Shifa lab ad, with a hand-drawn arrow from the before to the after.
  - «ونفس الشغل لكل مجال»: one design each from Miswag, Sala and Baly.
  - A bar with «راسلني هسه» and «التصميم يبدي من 14 ألف».
- `h1`, `h2`, `h3` (1080x1920): highlight stories.
  - `h1`: single prices.
  - `h2`: monthly packages, each showing its saving against the single prices.
  - `h3`: how ordering works, plus rules (50% upfront, extra revision 3,000, urgent +50%, motion paused).
- `cover` (1080x1920): highlight cover, with a price-tag icon inside the centre circle.

Prices (IQD), based on 14,000 per post:

| Item | Price |
|---|---|
| Story | 7,000 |
| Carousel | 40,000 |
| Menu / flyer | 40,000 |
| Logo | 70,000 |
| Identity | 200,000 |
| Basic package (8 posts + 4 stories) | 100,000 |
| Premium package (12 posts + 8 stories + 1 carousel) | 175,000 |
| Complete package (16 posts + 12 stories + 2 carousels + content plan) | 250,000 |

`covers.html` renders three highlight cover options (1080x1920 each) to `out/covers-a.png`, `-b.png` and `-c.png`:

- A: «د.ع» on paper, selected like a Photoshop layer.
- B: a cream price tag on orange.
- C: a cream tag icon inside an orange ring on dark.

It also renders `covers-preview.png`, which shows all three as small circles on a profile. Render it twice: the preview reads the PNGs from the first pass.
