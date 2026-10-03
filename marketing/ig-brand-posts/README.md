# Instagram brand posts — allawi.psd (6 posts × 2 slides)

One post per ad, so the profile grid reads as one set next to the أعمالي carousel (`../ig-portfolio-cover`).

- **Slide 1 (`out/<brand>-1.png`)**: the ad on the allawi.psd paper, selected like a placed layer: orange file tag,
  transform handles, cursor, «Social ad · 2026 — name». The frame is identical on all six, so the grid looks
  unified and the colour comes from the ads.
- **Slide 2 (`out/<brand>-2.png`)**: «Layer by layer». The ad's real PSD layers (from `../<brand>-ad/layers/`)
  pulled apart in an isometric 3D view on a dark Photoshop-style workspace, each named as in the PSD, with the key
  layer selected in orange, plus the idea in one dialect line.

Brands (`<brand>`): `sala`, `baly`, `miswag`, `saj` (Saj Al-Reef), `waseet` (Al-Waseet), `faqma` (Al-Faqma).

`grid-preview.jpg` shows the profile grid (Instagram's 3:4 tiles) once all six are posted in the order in
`captions.txt` (Baly first, Sala last), with the أعمالي carousel below them. `captions.txt` has a ready caption for
each post, including the concept label and the credits the photos need (Baly's photo is CC BY-SA 2.0 and must be
credited).

## Files

- `posts.html`: all 12 slides, generated from the `POSTS` list in its script (brand, file name, layers, idea line,
  glass tint of the exploded layers).
- `render.cjs`: `node render.cjs` renders `out/`; `node render.cjs --layers` also renders each slide layer by layer
  into `layers/` (Playwright).
- `build_psd.py`: turns `layers/` into `psd/<brand>-N.psd` (Background, the ad clipped into its frame on slide 1,
  Frames & UI, Text).
- `works/<brand>.jpg`: each ad at 1080×1350 (from `../<brand>-ad/out/`); `img/<brand>/`: its layers at 720×900.
- Fonts (Google Fonts, SIL OFL): Readex Pro, Aref Ruqaa, Instrument Serif, IBM Plex Mono.
