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

`reel-cover.html` renders the cover for the before/after reel (`../hf-allawi-promo`): `node render.cjs reel-cover.html` writes `out/reel-cover-reelcover.png` (1080x1920).
- It uses the video's dark look: the headline «صورة عادية.. صارت إعلان [يبيع]», a before/after slider card with the cursor on the handle, and a «التصميم يبدي من 14 ألف» sticker.
- Everything important sits inside y 240–1680, the 3:4 window the profile grid shows.

`identity-covers.html` renders the cover for the «هويات» highlight, which collects identity work. The first entry is the «كاكتوس» case study in `../gift-cactus/showcase.html`, stories `st1`–`st6`. Running `node render.cjs identity-covers.html` writes `out/identity-covers-<id>.png`:
- `a`, `b` and `c` show a pen-tool nib with an orange hole, in the same three styles as the «الأسعار» options above:
  - A: an ink nib on paper, selected like a Photoshop layer.
  - B: a cream nib with an ink collar on orange.
  - C: a cream outline nib inside an orange ring on dark.
- The nib is drawn on the same 24px grid as the tag icon, so a pair reads as one set.
- `preview` shows each one next to its «الأسعار» partner. It reads the PNGs, so render twice.

`fixed-prices.html` is a story for the week of the 7 Oct 2026 devaluation, when the official rate went from 1,310 to 1,500 and the market jumped to 170–180k per $100. `node render.cjs fixed-prices.html` writes `out/fixed-prices-story.png` (1080x1920):
- The headline «الدولار صعد.. / وأسعاري / [ثابتة]», with a Photoshop-style «LOCKED» badge on the selection.
- A chart where the dollar line shoots up and «أسعاري» stays flat, ending in a lock.
- Three prices from the table above, each with a lock (بوست 14 ألف، ستوري 7 آلاف، كاروسيل 40 ألف).
- The «راسلني هسه» button.
- Everything sits between y 250 and 1760, clear of the story header and reply bar.
