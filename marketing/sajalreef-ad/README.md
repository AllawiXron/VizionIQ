# Social media ad — Saj Al-Reef (صاج الريف)

A 4:5 post for Saj Al-Reef, the Baghdad restaurant chain (Karrada, Street 62 · Mansour, 14 Ramadan Street), made for the
allawi.psd portfolio. (Not the Michigan "Saj Alreef", which only borrowed the name.)

**Idea.** Their logo is a gold square full of black diagonal stripes over a black name bar. The stripes look like the
grill marks a saj leaves on the bread, so the post says exactly that:

> هاي الخطوط مو ديزاين
> **هاي بصمة الصاج.**
>
> "These stripes aren't a design. They're the saj's mark."

**A different style, the same hand.** Instead of the full-bleed photo of the Baly and Miswag ads, this one is a graphic
poster built on the structure of their own logo: a gold field of hand-drawn brush stripes on top, a black bar with the
headline underneath, and the real food (four grilled saj wraps cut out of their menu photo) laid across the stripes so
the grill marks run with them. What stays the same: real photography, an Alexandria headline in Iraqi dialect with a
twist, the brand's own details (logo, branches) and a clean CTA.

- `out/sajalreef-ad.png`: the ad, 1620×2025.
- `psd/sajalreef-ad.psd`: layered, 1080×1350 (gold + stripes, black bar, saj cut-out, headline & footer, logo).
- `ad.html`: the layout; the stripes are generated in its script. `node render.cjs` re-renders the PNG;
  `node render.cjs --layers` then `python build_psd.py` rebuilds the PSD.
- `photo/cutout.py`: cuts the wraps out of `photo/source-menu-photo.jpg` into `img/saj.png`.

## Assets

- **Food photo:** Saj Al-Reef's own menu photography («صاج الريف الخاص باللحم», from their Talabat listing). For a
  spec piece; if they commission it, use their original high-res files.
- **Logo and gold:** their logo from their Baly Food listing; gold `#cfad57` sampled from it. Saj Al-Reef's trademark;
  label the post a concept if they did not commission it.
- **Font:** Alexandria (Google Fonts, SIL OFL).
