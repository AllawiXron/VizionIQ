# Social media ad — Miswag (مسواگ)

A 4:5 post for Miswag, Iraq's first online shop, made for the allawi.psd portfolio.

**Idea.** The brand's name is the Iraqi word for the shopping run, and the classic Baghdad shopping run is the
Shorja market. A real 1932 photograph of the covered Shorja, light pouring through the roof, sets the "then"; a
modern Miswag order card pinned above a man waiting in the crowd, hands on hips, is the "now".

> مسواگ جدك بالشورجة
> **ومسواگك بكبسة.**
>
> "Your grandpa's shopping was at Shorja. Yours is one tap."

Card copy uses Miswag's own claims (App Store listing): delivery everywhere in Iraq, cash on delivery, free delivery
on the first order; footer: more than 170,000 original products.

Same system as the Baly ad: a real Iraqi photograph graded for the brand (here black and white so Miswag red is the
only colour), an Alexandria headline in Iraqi dialect, the brand's app card pinned into the photo, their logo and a
CTA in the footer.

- `out/miswag-ad.png`: the ad, 1620×2025.
- `psd/miswag-ad.psd`: layered, 1080×1350 (photo + shade, order card, headline & footer, logo).
- `ad.html`: the layout over `img/hero.png`. `node render.cjs` re-renders the PNG; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSD.
- `photo/grade.py`: crop to 4:5 and black-and-white grade (`python grade.py <shorja.jpg> ../img/hero.png`).

## Credits

- **Photo:** "Inside the Shorjah market, Baghdad", 1932, G. Eric and Edith Matson Photograph Collection, Library of
  Congress (matpc.13213). Public domain. https://www.loc.gov/pictures/collection/matpc/item/mpc2005007807/PP
  (via https://commons.wikimedia.org/wiki/File:Inside_the_Shorjah_market,_Baghdad_LOC_matpc.13213.jpg)
- **Miswag logo and app icon:** from miswag.com and their App Store listing; brand red `#de1c24`. Miswag's trademark;
  label the post a concept if they did not commission it.
- **Font:** Alexandria (Google Fonts, SIL OFL).
