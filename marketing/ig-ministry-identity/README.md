# Instagram carousel: the ministry identity proposal (بوابة عشتار)

Ten 4:5 slides (1620×2025) showing the identity the user submitted to the Ministry of Digital Economy and
Governance's logo competition. It answers one question across the slides, why a 2600-year-old gate for a digital
ministry: the real gate first (an aurochs close-up as the hook, the gate with the parts the mark keeps traced in gold,
a blue brick pulled out of a dragon panel for the colour), then the grid and the foil, then the gate in use (the
ministry front at dusk, the press podium, the app in a hand, the reception wall), and the answer with the designer's
name last. It is labelled on the last slide as a proposal, not the ministry's identity. Post it after applications
close (30 Oct).

- `photos/`: the material, metadata stripped. `gate-front.jpg`, `aurochs.jpg`, `dragon.jpg` are photos of the
  reconstructed gate in the Pergamon Museum from Wikimedia Commons, CC BY-SA 4.0, by Emmilwastaken, Jami430 and
  Dosseman (credited in the caption). `facade-a.jpg`, `podium.jpg`, `hand.jpg`, `lobby.jpg` are the scene photos the
  user supplied, shot empty so the gate could be placed in them.
- `scenes.html` → `node scenes.cjs` → `plates/`: the photo slides with the gate placed in them, in each photo's own
  pixels. The facade sign and the lobby sign are fitted to the wall plane with a homography (`quad()`); the podium
  inlay sits in the walnut front; the app screen (`plates/screen.png`, from the print artwork without the drawn
  island) is fitted to the phone glass and cut by `plates/hand-mask.png` where the fingers cross it. Metal comes from
  one SVG filter (`metal()`: brushing, bevel light from the scene's direction), and every sign has three shadows on its
  own plane (contact, cast, ambient). The traced gate and the pulled brick are the last two frames.
- `grade.py`: one grade over all ten slides (gentle S curve, warm highlights and cool shadows, 2.5 % mono grain);
  `render.cjs` runs it before `strip.py`.
- `shots.py`: the nine Blender shots in portrait (sign on limestone, the business card with foil-stamped arches,
  the construction sheet, the colour swatch cards, a letterhead close-up, the stationery set, the ID on its lanyard,
  the phone with the app, a foil close-up), built on `../ministry-identity/print/studio.py` and its print artwork.
  `python shots.py all` (or one name, `--preview` for quick ones).
- `carousel.html`: the slides; text in DG Sahabah, placed in each photo's empty space. Slides 4, 5 and 10 are the
  Blender renders (grid sheet, foil card, foil close-up); the other shots in `renders/` are from the first version.
- `render.cjs`: writes `out/slide-1..10.png`, then `strip.py` leaves only pixels in each PNG (no metadata).
- `caption.txt`: the caption.
