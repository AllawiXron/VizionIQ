# Instagram carousel: the ministry identity proposal (بوابة عشتار)

Ten 4:5 slides (1620×2025) showing the identity the user submitted to the Ministry of Digital Economy and
Governance's logo competition, as a premium case study: one realistic photograph per slide, with a few words placed
in that photo's empty space. It is labelled on the first and last slides as a proposal, not the ministry's identity.
Post it after applications close (30 Oct).

- `shots.py`: the nine Blender shots in portrait (sign on limestone, the business card with foil-stamped arches,
  the construction sheet, the colour swatch cards, a letterhead close-up, the stationery set, the ID on its lanyard,
  the phone with the app, a foil close-up), built on `../ministry-identity/print/studio.py` and its print artwork.
  `python shots.py all` (or one name, `--preview` for quick ones).
- `carousel.html`: the slides; text in DG Sahabah, placed per photo; a light grain over each.
  The website slide uses the flat website mock-up (`../ministry-identity/out/fig/web-1.jpg`).
- `render.cjs`: writes `out/slide-1..10.png`, then `strip.py` leaves only pixels in each PNG (no metadata).
- `caption.txt`: the caption.
