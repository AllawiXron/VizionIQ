# Instagram carousel: the ministry identity proposal (بوابة عشتار)

Thirteen 4:5 slides (1620×2025) presenting the identity the user submitted to the Ministry of Digital Economy and
Governance's logo competition, set like a brand book post (the user's reference was another entrant's identity
carousel, 30 Oct): the horizontal lockup on paper, the vertical lockup on Babylon blue, a close crop of the arches, the
idea over the real gate, the construction grid, the colours, the type, then the mark in use (foil card, stationery,
the app in a hand, the ministry front, the podium, the reception wall). The cover says it is a proposal, not the
ministry's identity. A first version told it as a story with photos of the gate (git history); the user found it
read like news, not an identity post.

- `photos/`: the material, metadata stripped. `gate-front.jpg` is the reconstructed gate in the Pergamon Museum from
  Wikimedia Commons, CC BY-SA 4.0, by Emmilwastaken (credited in the caption). `facade-a.jpg`, `podium.jpg`,
  `hand.jpg`, `lobby.jpg` are the scene photos the user supplied, shot empty so the gate could be placed in them.
- `scenes.html` → `node scenes.cjs` → `plates/`: the photo slides with the gate placed in them, in each photo's own
  pixels. The facade sign and the lobby sign are fitted to the wall plane with a homography (`quad()`); the podium
  inlay sits in the walnut front; the app screen (`plates/screen.png`, from the print artwork without the drawn
  island) is fitted to the phone glass and cut by `plates/hand-mask.png` where the fingers cross it. Metal comes from
  one SVG filter (`metal()`: brushing, bevel light from the scene's direction), and every sign has three shadows on its
  own plane (contact, cast, ambient). The last frame is the gate photo with the parts the mark keeps traced in gold.
- `grade.py`: one grade over all slides (gentle S curve, warm highlights and cool shadows, light mono grain);
  `render.cjs` runs it before `strip.py`.
- `shots.py`: the nine Blender shots in portrait (sign on limestone, the business card with foil-stamped arches,
  the construction sheet, the colour swatch cards, a letterhead close-up, the stationery set, the ID on its lanyard,
  the phone with the app, a foil close-up), built on `../ministry-identity/print/studio.py` and its print artwork.
  `python shots.py all` (or one name, `--preview` for quick ones).
- `carousel.html`: the slides, in the identity's own type (Markazi Text, IBM Plex Sans Arabic, IBM Plex Sans for
  Latin) and drawn from `../ministry-identity/marks.js`. Slides 8 and 9 are Blender renders (`renders/foil`,
  `renders/stationery`); the other shots in `renders/` are from earlier versions.
- `render.cjs`: writes `out/slide-1..10.png`, then `strip.py` leaves only pixels in each PNG (no metadata).
- `caption.txt`: the caption.
