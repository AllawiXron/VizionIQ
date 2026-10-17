# Social media ad — Baly (بَلي)

A 4:5 post for Baly, the Iraqi super app (taxi, food delivery, Baly Box, Baly Digital), made for the allawi.psd
portfolio.

**Idea.** The brand name is the answer. A real Baghdad street at night, graded into Baly's blue with the street
lamps and headlights in Baly yellow, asks the question every late-night Baghdadi has asked:

> تكسي بنص الليل؟
> **بَلي.**
>
> "A taxi in the middle of the night? Yes." (بَلي = "yes, indeed")

An app card is pinned to the car in the photo: «كابتنك بالطريق · سوبر · ٣٬٠٠٠ د · سعر ثابت · ٣ دقائق», using Baly's
own wording and figures from baly.iq. Footer: their logo, their line «أسهل، أوفر، بَلي يمك» and a «حمّل التطبيق» CTA.
The format can run as a series («أكل بنص الليل؟ بَلي.», «طرد لأربيل؟ بَلي.»).

- `out/baly-ad.png`: the ad, 1620×2025.
- `psd/baly-ad.psd`: layered, 1080×1350 (graded photo + shade, app card, headline & footer, logo).
- `ad.html`: the layout over `img/hero.png`. `node render.cjs` re-renders the PNG; `node render.cjs --layers` then
  `python build_psd.py` rebuilds the PSD.
- `photo/grade.py`: crops the photo to 4:5, adds a shallow depth-of-field blur (background soft, car sharp) and the
  blue/yellow grade: `python grade.py <photo.jpg> ../img/hero.png` (3840×2560 Commons rendition).

## Credits and licences

- **Photo:** "Baghdad, Arrasat" (Arasat al-Hindiya, Baghdad, 31 Oct 2011) by **ainudil**, CC BY-SA 2.0,
  https://commons.wikimedia.org/wiki/File:Baghdad,_Arrasat.jpg (original on Flickr:
  https://www.flickr.com/photos/ainudil/6525799379/). The ad is an adaptation, so under the licence it is shared
  under CC BY-SA 2.0 too; credit the photographer in the caption when posting:
  «Photo: ainudil (CC BY-SA 2.0)».
- **Baly logo:** the vector mark from baly.iq's favicon; brand blue `#0043ff` and yellow `#ffe15e` from baly.iq.
  Baly's trademark; label the post a concept if they did not commission it.
- **Font:** Alexandria (Google Fonts, SIL OFL).
