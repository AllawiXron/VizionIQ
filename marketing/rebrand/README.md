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
  version that stands came from three plain layouts (`options.html`, `out/options.jpg`); the user picked B and asked
  for more effort, and found light-orange type on the orange-brown backdrop hard on the eyes. So: the headline stacked
  on the right in near-white, lit like the photo (white at the top, warm at the foot) with a soft shadow behind it,
  one line under it, the logo lockup («علاوي» and «مصمم جرافيك») top left, the handle bottom left, a warm light on the
  backdrop behind the words, a vignette and grain. No orange words; the orange comes from the photos.
- Build: `python3 prep.py chameleon-1 420 2340` (`chameleon-2 560 2360`, `chameleon-3 200 2400`) grades each plate;
  `node render.cjs carousel.html` writes `out/carousel-s1..3.jpg`.

## Type (27 Oct)

The user felt the font was the problem ("the way the text looks") and turned down DG Sahabah, eight Google display
faces (`fonttest.html`) and six Naskh/Ruqaa faces (`naskhtest.html`), then asked me to choose to match ra.graphicc,
whose headlines are a bold hand-brushed Naskh. Aref Ruqaa came next and was hard to read; Amiri Bold was readable but "basic". The user then asked me to choose
again and turned down Playpen Sans Arabic, Dubai and a vivid red Cairo version. He then sent his own copies of the
Thmanyah fonts and liked them, but dropped them once he saw the licence is personal use only. The closest free
commercial pair: headlines in Markazi Text Bold (a contemporary Arabic serif, OFL) and the line under each in
Vazirmatn Regular (OFL), in the version-B layout on the dark photos. «بالخاص» is set «بالـخاص» because the stacked
ل-خ is hard to read; the logo stays in DG Sahabah.

## Vivid version (27 Oct)

After a third reference (sa.ahmed.ayad: a subject on a vivid lit red sweep, a huge white headline with a stretched
kashida, a second line under it, small text in both top corners, a footer with name, «مصمم جرافيك» and a swipe cue),
slide 1 was rebuilt that way: `python3 vivid.py chameleon-1 0.62 0.42 0.09 "<branch polygon>"` regrades the dark
studio backdrop into a lit orange-red sweep (the branch is marked by a polygon so its bark keeps its colour);
`vivid.html` sets the type in Cairo Black and SemiBold (Google Fonts, OFL), the footer wordmark in DG Sahabah.

## Final pick (27 Oct)

After every later version (type behind the animal, small text, layout options, Ruqaa, Amiri, Playpen, Dubai,
Thmanyah, Markazi, a vivid red Cairo version) the user chose the first build as the best: `post-1.html`,
`post-2.html`, `post-3.html` (restored from commit 97f6e5f), rendered to `out/post-<n>-slide<n>.jpg`. DG Sahabah, one
big one-line headline over the dark graded photo, an orange line and a cream line under it, the wordmark top left,
the handle bottom left. `carousel.html`, `vivid.html` and the test pages stay as the record of what was turned down.

Font (27 Oct): after two sheets of free fonts (`out/font-pick.jpg`, `out/font-pick-2.jpg`, nothing else changed) the
user picked Scheherazade New Bold (SIL OFL, free for commercial use) for the headline and lines of `post-1..3.html`;
the logo and handle stay in DG Sahabah. Slide 3's line moved down 30 px so the ي dots of «دزلي» clear it.
