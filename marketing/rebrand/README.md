# allawi.psd rebrand (26 Oct)

The page starts over in an Arabic poster style: every post built like a printed poster, huge DG Sahabah words cropped
by the frame, an asymmetric layout that changes from post to post, work shown as bold crops, and a strong colour pair
per post (orange stays; deep green, cream, pink and ink around it).

- Logo: «علاوي» pulled out along a long kashida, with a Photoshop free-transform handle on the stretched line (the
  name being stretched in Photoshop, for .psd). Profile picture: the ع and its kashida running out of the circle.
- `brand.html`: logo sheet (`out/brand-logo.jpg`), the rebrand post (`brand-p1`) and a sample work post (`brand-p2`).
  `node render.cjs brand.html` (served from `marketing/`).
- Old posts get archived in the app, not deleted.

Stills for the user's approval; the full announcement carousel, caption, story, bio and the first posts come after.

## After the references (27 Oct)

The user hated the flat type posts above ("basic") and sent two pages he likes (ra.graphicc, space agency). The rule
from them: one colour world over every post and one hero image per post that acts out the headline. For this page
that is an orange world: each hero image graded into burnt orange, deep brown and cream, the headline in DG Sahabah
around the subject, the wordmark small in the top corner.

- The rebrand carousel, one chameleon through it: slide 1 half turned orange; slide 2 fully orange, looking into the
  lens; slide 3 its tongue catching an orange paper plane (Instagram's DM icon). The chameleons are Gemini images the
  user made from my prompts, saved as pixels only (`img/chameleon-<n>-src.jpg`).
- The user found the first build (a photo with a text block above it) low effort, then found a busier version (huge
  words behind the cut-out animal, «لوني» filled with its skin, text blocks around it) worse: "too much at once". The
  version that stands: one headline in two lines and one quiet line per slide, all clear of the animal, on a warm
  light thrown on the backdrop and broken by paper texture, with a vignette and grain over everything. The headlines
  stay one colour (no orange last word); the orange comes from the photos.
- Build: `python3 prep.py chameleon-1 420 2340` (`chameleon-2 560 2360`, `chameleon-3 200 2400`) grades each plate;
  `node render.cjs carousel.html` writes `out/carousel-s1..3.jpg`.
