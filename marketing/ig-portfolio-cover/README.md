# Instagram post — allawi.psd portfolio cover ("أعمالي · سوشيال ميديا")

One 4:5 post (1620×2025) for @allawi.psd. The idea follows the blindfolded-statue reference: a classical marble
head where the blindfold is a selected Photoshop layer named `allawi.psd` (transform handles, hidden-layer eye
icon, cursor). The typography follows the editorial Arabic references: a big Ruqaa headline with tashkeel,
Latin italic serif, mono labels, warm paper grain, and an orange halo ring that echoes the reference's orange loops.

- `out/post.png`: the post, ready to upload.
- `caption.txt`: the caption.
- `post.html`: the source. Edit the text there and re-render the `#post` element at deviceScaleFactor 1.5
  (any headless Chromium screenshot works; fonts are local in `fonts/`).
  The blindfold bar is placed with `--y` and `--rot` on `.post`.

## Image and font credits

- Statue: *Marble head of an athlete*, Roman, ca. 138–192 CE, The Metropolitan Museum of Art, Rogers Fund 1911
  (11.210.2), Open Access / CC0: https://www.metmuseum.org/art/collection/search/248579.
  `img/head.webp` is that photo with the background and pedestal removed (rembg, `isnet-general-use`) and a warm
  gradient-map grade mixed in at 60%.
- Fonts (Google Fonts, SIL Open Font License): Aref Ruqaa, Readex Pro, Instrument Serif, IBM Plex Mono.
