# Social media ad — Baly (بَلي)

A 4:5 post for Baly, the Iraqi super app (taxi, food delivery, Baly Box parcels, Baly Digital cards), made for the
allawi.psd portfolio.

**Idea.** Every Iraqi house has the enamel سفرطاس, the stacked lunch carrier with the flowered band that carried
home-cooked food to work. Here it is exploded tier by tier on Baly blue, and each tier carries a Baly service
instead of rice and stew: a burger (Food), a taxi (Taxi), a parcel (Box) and a gift card (Digital).

> سفرطاس أمك صار بيه
> تكسي وأكل وبوكس
>
> "Your mum's lunch carrier now has a taxi, food and a box in it."

The hidden joke is the paper tag on the handle, called out on the right: «من: أمك · إلى: الدوام ·
التوصيل: ٢٧ دقيقة» (from: mum, to: work, delivery: 27 minutes; 27 minutes is Baly's own food-delivery claim).
The footer is Baly's own line from baly.iq: «أسهل، أوفر، بَلي يمك».

The allawi.psd system: one Iraqi object × the brand in one twist, the gallery shot (one hero object on a seamless
brand-colour stage, spotlight, soft shadow, grain), a two-line Ruqaa headline in Iraqi dialect, one hidden joke,
logo on top, small caps footer.

- `out/baly-ad.png`: the ad, 1620×2025.
- `psd/baly-ad.psd`: layered, 1080×1350 (3D render + grade, tag callout, headline & footer, logo).
- `ad.html`: the typography layer over `img/hero.png`. `node render.cjs` re-renders the PNG;
  `node render.cjs --layers` then `python build_psd.py` rebuilds the PSD.

## The 3D render (`3d/`)

`img/hero.png` is modelled and rendered in Blender 4.2 (Cycles, run as the `bpy` Python module):
`python sefertas.py <out.png> 100 128`. `tex.html` holds the textures (the enamel flower band, the tag, the gift
card, the taxi's door decal and roof sign, the parcel tape and face); screenshot `#band #tag #card #decal #sign
#tape #pface` to PNGs next to `sefertas.py`.

## Assets

- Baly logo: `img/logo-white.svg` / `logo-blue.svg`, the vector mark from baly.iq's favicon. Brand blue `#0043ff`,
  accent yellow `#ffe15e` (both from baly.iq). Baly's trademark; label the post a concept if they did not
  commission it.
- Fonts (Google Fonts, SIL OFL): Aref Ruqaa, Alexandria, IBM Plex Mono.
