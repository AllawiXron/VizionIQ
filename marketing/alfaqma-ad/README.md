# Social media ad — Al-Faqma (مثلجات الفقمة)

A 4:5 post for [@alfaqma.iq](https://www.instagram.com/alfaqma.iq/), the ice-cream shop in Karrada, Baghdad,
made for the allawi.psd portfolio. Their bio: «منذ عام 1983 عُمر وياكم · ايس كريم وحلويات»; brand colours
orange `#eb6424`, black `#1c1b17` and white, which the stage, headline and sticker follow.

**Idea.** Baghdad in July: the desert air cooler (مبردة) is not enough. Here the cooler's door is swung open
like a fridge and, instead of straw pads and a fan, it is packed with layered ice cream; cold mist rolls out and
a scoop melts on the floor.

> المبردة ما تكفي
> تعال للفقمة
>
> "The air cooler isn't enough. Come to Al-Faqma."

The allawi.psd system: one Iraqi object × the brand in one twist, the gallery shot (one hero object on a seamless
stage, spotlight, soft shadow, grain), a two-line Ruqaa headline in Iraqi dialect, one hidden joke (the cooler's
plate: «مبردة الفقمة · MODEL 1983 · قوة التبريد: كلش · الضمان: طول الصيف»), logo on top, small caps footer.

- `out/alfaqma-ad.png`: the ad, 1620×2025.
- `psd/alfaqma-ad.psd`: layered, 1080×1350 (3D render + grade, cold mist, 50° sticker, headline & footer, logo).
- `ad.html`: the typography layer over `img/hero.png`. `node render.cjs` re-renders the PNG;
  `node render.cjs --layers` then `python build_psd.py` rebuilds the PSD.
- `img/logo.svg`: Al-Faqma's logo, traced to vectors from their 320 px profile picture (`3d/trace_logo.py`).

## The 3D render (`3d/`)

`img/hero.png` is modelled and rendered in Blender 4.2 (Cycles, run as the `bpy` Python module):
`python cooler.py <out.png> 100 128` builds the cooler (louvered sides with straw pads, the fan on the open door,
the tank and its plate), the layered ice-cream block, the melting scoop and the stage. `plate.html` is the plate
texture (screenshot `#plate` to `plate.png` next to `cooler.py`). The hero is rendered with
`STAGE="0.83,0.13,0.018" WASH=1100` (their orange, in linear RGB, and a brighter backdrop wash).

Fonts (Google Fonts, SIL OFL): Aref Ruqaa, Alexandria, IBM Plex Mono.
