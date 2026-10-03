# Social media ad — Al-Waseet (شركة الوسيط)

A 4:5 post for [@alwaseetcompany1](https://www.instagram.com/alwaseetcompany1/), the Baghdad express-delivery
company, made for the allawi.psd portfolio (slide 2 of `../ig-portfolio-cover`).

**Idea.** The winged genies on the Nimrud palace reliefs (Iraq, 883–859 BCE) all carry a small handled bucket,
the famous "ancient handbag". Here it is a Waseet parcel: the genie holds a real 3D box by a blue strap,
on a royal-blue museum wall.

> أجدادنا شالوا الأمانة
> وإحنا كمّلنا الطريق
>
> "Our ancestors carried the parcel, and we carried on the road."

It follows Al-Waseet's own post system: royal-blue stage, one sculptural object, a white logo on top, a two-line
dialect headline, red chevrons from their arrow mark, and the small caps footer. The allawi.psd signatures are
the Ruqaa headline, the museum wall label ("Fig. 883 — winged genie + parcel"), the parcel's shipping label
(من: نمرود ← إلى: بغداد) and the grain.

- `out/alwaseet-ad.png`: the ad, 1620×2025.
- `psd/alwaseet-ad.psd`: layered, 1080×1350 (3D render + grade, red chevrons, museum label, headline & footer, logo).
- `ad.html`: the typography layer over `img/hero.png`. `node render.cjs` re-renders the PNG;
  `node render.cjs --layers` then `python build_psd.py` rebuilds the PSD.

## The 3D render (`3d/`)

`img/hero.png` is rendered in Blender 4.2 (Cycles, run as the `bpy` Python module), not taken from a website.

1. `prep_relief.py DP355702.jpg` cuts the relief photo out of its grey backdrop into `relief_tex.png`.
2. `box.html` holds the parcel's face textures (tape, logo, label); screenshot `#front #side #top #back #plain`
   to PNGs next to `scene.py`.
3. `python scene.py <prefix> 100 160` builds the scene (relief slab with stone thickness on a blue wall, key
   spotlight, the parcel with bevelled edges and a strap modelled to follow the carved bucket handle into the
   fist) and renders two passes, with and without the parcel.
4. `python build_hero.py <prefix>` lays the carved fingers from the second pass over the strap, so the genie
   grips it, and writes `img/hero.png`.

## Assets

- Relief: *Relief panel*, Assyrian, Nimrud, ca. 883–859 BCE, The Metropolitan Museum of Art 17.190.2077,
  Gift of J. Pierpont Morgan 1917, Open Access / CC0: https://www.metmuseum.org/art/collection/search/322486
- Al-Waseet logo mark and wordmark: their own trademarks (mark from al-waseet.com, wordmark cut from their App
  Store icon). This is a portfolio piece; label it a concept if they did not commission it.
- Fonts (Google Fonts, SIL OFL): Aref Ruqaa, Alexandria, IBM Plex Mono.
