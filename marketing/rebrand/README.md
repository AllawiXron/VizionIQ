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

- The rebrand carousel, one chameleon through it: slide 1 half turned orange, «غيرت لوني»; slide 2 fully orange and
  looking into the lens, «شنو اسوي هنا» with the services; slide 3 its tongue catching an orange paper plane
  (Instagram's DM icon), «دزلي بالخاص». The chameleons are Gemini images the user made from my prompts, saved as pixels only
  (`img/chameleon-<n>-src.jpg`). `python3 prep.py chameleon-1 420 2340` (`chameleon-2 560 2360`, `chameleon-3 200 2400`) builds each
  graded plate in `img/`; `node render.cjs post-<n>.html` renders the slide to `out/`.
