# Instagram carousel: the ministry identity proposal (بوابة عشتار)

Thirteen 4:5 slides (1620×2025) presenting the identity the user submitted to the Ministry of Digital Economy and
Governance's logo competition, set like a brand book post (the user's reference was another entrant's identity
carousel, 30 Oct): the horizontal lockup on paper, the vertical lockup on Babylon blue, a close crop of the arches, the
idea over the real gate, the construction grid, the colours, the type, then the mark in use in the Blender renders
(foil card, letterhead, stationery, ID badge, the app on a phone, the building sign). The cover says it is a proposal,
not the ministry's identity. A first version told it as a story with photos of the gate (git history); the user found
it read like news, not an identity post. Generated scene photos (a building front, a podium, a hand with a phone, a
lobby) were tried and dropped: the user hates them.

- `photos/gate-front.jpg`: the reconstructed gate in the Pergamon Museum, Wikimedia Commons, CC BY-SA 4.0, by
  Emmilwastaken (credited in the caption), metadata stripped.
- `scenes.html` → `node scenes.cjs` → `plates/gate-front.png`: that photo with the parts the mark keeps traced in
  gold (towers, wall, arch bands), for the idea slide.
- `grade.py`: one grade over all slides (gentle S curve, warm highlights and cool shadows, light mono grain);
  `render.cjs` runs it before `strip.py`.
- `shots.py`: the nine Blender shots in portrait (sign on limestone, the business card with foil-stamped arches,
  the construction sheet, the colour swatch cards, a letterhead close-up, the stationery set, the ID on its lanyard,
  the phone with the app, a foil close-up), built on `../ministry-identity/print/studio.py` and its print artwork.
  `python shots.py all` (or one name, `--preview` for quick ones).
- `carousel.html`: the slides, in the identity's own type (Markazi Text, IBM Plex Sans Arabic, IBM Plex Sans for
  Latin) and drawn from `../ministry-identity/marks.js`. Slides 8 to 13 are the Blender renders in `renders/`
  (`grid`, `swatches` and `macro` are not used).
- `render.cjs`: writes `out/slide-1..10.png`, then `strip.py` leaves only pixels in each PNG (no metadata).
- `caption.txt`: the caption.
