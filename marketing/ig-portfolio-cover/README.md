# Instagram carousel — allawi.psd portfolio ("أعمالي · سوشيال ميديا")

Six 4:5 slides for @allawi.psd. Slide 1 is the cover: a CC0 marble head whose blindfold is a selected
Photoshop layer named `allawi.psd`. Slides 2–5 show six social ads (each in its own folder under `../`), and slide 6
closes the set with the same statue after the layer has been dragged off its eyes. One orange loop runs through slides
2–6 and ends in the halo ring on the last slide, so it reads as one line while swiping.

| Slide | Layout | What's in it (`works/`) | Frames (in the 1080×1350 PSD) |
|---|---|---|---|
| 01 | Cover | — | — |
| 02 | Layers | Sala ad (`02-1`, from `../sala-ad`) next to its real Photoshop Layers panel, with the App card layer selected | 560×700 (4:5) |
| 03 | Featured | Baly ad (`03-1`, from `../baly-ad`) | 640×800 (4:5) |
| 04 | Series | Miswag (`04-1`, right) and Saj Al-Reef (`04-2`, left) | 440×550 each (4:5) |
| 05 | On screen (2 phones) | Al-Waseet (`05-1`, right) and Al-Faqma (`05-2`, left) in the Instagram feed | 396×495 each (4:5) |
| 06 | Closing | — | — |

The ads are spec/concept work for real Iraqi brands; `caption.txt` says so, and credits the Baly photo
(ainudil, CC BY-SA 2.0) as its licence requires.

## Adding your photos

**In Photoshop (`psd/slide-0N.psd`).** Each PSD has these layers, bottom to top: `Background`, one `PHOTO n` layer per
frame, `Frames & UI`, `Text`. Select a `PHOTO` layer, place your image (File → Place Embedded, or drag it in) so it sits
right above that layer, press Alt+Ctrl+G (Option+Cmd+G on Mac) to clip it into the frame, and scale it with Ctrl+T.
Your posts are 1080×1350, so they just need scaling down. The paper grain sits under the photos, so your work stays
clean. Export with File → Export → Export As… → PNG/JPG.

**Or let the scripts place them.** Save each photo as `works/<slide>-<n>.jpg` (for example `works/02-1.jpg`,
`works/05-2.jpg`) and run `node render.cjs --layers` then `python build_psd.py`. The images fill their frames
(cropped to fit, like Photoshop's "fill"): `out/slide-0N.png` is rewritten, and each PSD gets the photo as a layer
already clipped to its `PHOTO` frame.

## Changing the text

The captions, case-study text and phone caption are set in `carousel.html`; edit them there and re-render. In the
PSDs the `Text` layer is pixels, not live type, so to change text in Photoshop hide or erase it and retype it with the
Type tool using the same fonts (below).

## Files

- `out/slide-01.png` … `slide-06.png`: 1620×2025 slides, ready to post in order.
- `psd/slide-01.psd` … `slide-06.psd`: layered files; each work sits as a layer clipped to its `PHOTO` frame.
- `caption.txt`: the post caption.
- `carousel.html`: the source for all slides.
- `img/avatar.jpg`: the @allawi.psd profile picture, used as the avatar in the slide 5 phones.
- `img/sala-layers/`: the layer thumbnails in the slide 2 panel, made from `../sala-ad/layers/` (Logo and App card use
  Photoshop's Layer Bounds thumbnails, on the medium transparency grid).
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
