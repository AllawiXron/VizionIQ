# Social media ad — Al-Waseet (شركة الوسيط)

A 4:5 post for [@alwaseetcompany1](https://www.instagram.com/alwaseetcompany1/), the Baghdad express-delivery company,
made for the allawi.psd portfolio (it is slide 2 of `../ig-portfolio-cover`).

**Idea.** الوسيط literally means "the middleman", so the headline reads *بينك وبين زبونك… الوسيط*
("between you and your customer: Al-Waseet"). The van sits under a delivery route that runs from a "إنتَ" pin
to a "زبونك" pin, through a Baghdad hub, over a faint map of Iraq with every governorate capital wired to Baghdad.

**Copy** (Iraqi dialect) only claims what the company states on al-waseet.com: delivery to all governorates and
"to the farthest point in Iraq", daily pickup from merchants, goods secured in transit, and a merchant app for
iPhone and Android.

- `out/alwaseet-ad.png`: the ad, 1620×2025.
- `psd/alwaseet-ad.psd`: layered, 1080×1350 (Background + map, Route/hub/pins, Van, Text & CTA, Logo).
- `ad.html`: the source. `node render.cjs` re-renders the PNG; `node render.cjs --layers` then `python build_psd.py`
  rebuilds the PSD (Playwright, psd-tools, pillow).

## Assets

- Logo mark, van render and wordmark: Al-Waseet's own brand assets, from al-waseet.com and their App Store icon
  (the wordmark is cut from the icon with a colour-to-alpha pass). Brand colours are sampled from the logo:
  navy `#2d2f64`, red `#cc1f2c`. These are Al-Waseet's trademarks; this is a portfolio piece, so label it as a
  concept if they did not commission it.
- Map of Iraq: Natural Earth 1:10m country outline (public domain), via the `world-atlas` package.
- Fonts (Google Fonts, SIL OFL): Alexandria, IBM Plex Mono.
