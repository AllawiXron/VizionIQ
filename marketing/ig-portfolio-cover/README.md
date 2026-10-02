# Instagram carousel — allawi.psd portfolio ("أعمالي · سوشيال ميديا")

Eight 4:5 slides for @allawi.psd. Slide 1 is the cover: a CC0 marble head whose blindfold is a selected
Photoshop layer named `allawi.psd`. Slides 2–7 are photo layouts for your work, and slide 8 closes the set with the
same statue after the layer has been dragged off its eyes. One orange loop runs through slides 2–8 and ends in the
halo ring on the last slide, so it reads as one line while swiping.

| Slide | Layout | Photo frames (size in the PSD, 1080×1350 canvas) |
|---|---|---|
| 01 | Cover | — |
| 02 | Featured | Photo 1: 640×800 (4:5) |
| 03 | Series | Photo 1 (right) and Photo 2 (left): 440×550 (4:5) |
| 04 | Case study | Photo 1: 560×700 (4:5) · Photo 2: 348×348 (1:1, a close-up detail) |
| 05 | Selected 2×2 | Photos 1–4: 352×440 (4:5); 1 top-right, 2 top-left, 3 bottom-right, 4 bottom-left |
| 06 | The feed 3×3 | Photos 1–9: 236×295 (4:5), Instagram grid order (left→right, top→bottom) |
| 07 | On screen (phone) | Photo 1: 440×550 (4:5) |
| 08 | Closing | — |

## Adding your photos

**In Photoshop (`psd/slide-0N.psd`).** Each PSD has these layers, bottom to top: `Background`, one `PHOTO n` layer per
frame, `Frames & UI`, `Text`. Select a `PHOTO` layer, place your image (File → Place Embedded, or drag it in) so it sits
right above that layer, press Alt+Ctrl+G (Option+Cmd+G on Mac) to clip it into the frame, and scale it with Ctrl+T.
Your posts are 1080×1350, so they just need scaling down. The paper grain sits under the photos, so your work stays
clean. Export with File → Export → Export As… → PNG/JPG.

**Or in the HTML.** Save each photo as `works/<slide>-<n>.jpg` (for example `works/02-1.jpg`, `works/06-9.jpg`) and run
`node render.cjs`. The images fill their frames (cropped to fit) and `out/slide-0N.png` is rewritten.

## Text to replace

The placeholders are `اسم المشروع`, `Client · 2026`, `Category · 2026`, the case-study description and its
CLIENT / TYPE / YEAR rows, and the caption line under the phone. In the PSDs the `Text` layer is pixels, not live type,
so hide or erase a placeholder and retype it with the Type tool using the same fonts (below). Alternatively, edit
the text in `carousel.html` and re-render.

## Files

- `out/slide-01.png` … `slide-08.png`: 1620×2025 previews (slides 1 and 8 are ready to post).
- `psd/slide-01.psd` … `slide-08.psd`: layered files for adding photos.
- `caption.txt`: the post caption.
- `carousel.html`: the source for all slides.
- `render.cjs`: `node render.cjs` renders `out/`; `node render.cjs --layers` also renders every layer into `layers/`
  (needs Playwright: `npm i -D playwright`).
- `build_psd.py`: turns `layers/` into `psd/` (`pip install psd-tools pillow`, then `python build_psd.py`).

## Image and font credits

- Statue: *Marble head of an athlete*, Roman, ca. 138–192 CE, The Metropolitan Museum of Art, Rogers Fund 1911
  (11.210.2), Open Access / CC0: https://www.metmuseum.org/art/collection/search/248579.
  `img/head.webp` is that photo with the background and pedestal removed (rembg, `isnet-general-use`) and a warm
  gradient-map grade mixed in at 60%.
- Fonts (Google Fonts, SIL Open Font License): Aref Ruqaa (Arabic headlines and numerals), Readex Pro (Arabic text),
  Instrument Serif italic (English labels), IBM Plex Mono (small caps labels).
