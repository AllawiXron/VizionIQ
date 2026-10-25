# «ما أنصحك بالثنتين»: a joke post for @allawi.psd

One 1080×1350 post (`out/diy-haircut.png`, `.jpg`). It adapts an English post the user liked ("You can make a website
yourself. You can also cut your own hair. I don't recommend either.") to the design page:

> تكدر تصمم بوستاتك بنفسك. / وتكدر هم تزيّن شعرك بنفسك. / ما أنصحك بالثنتين.

with «خلّي التصميم على أهله.. راسلنا» on a kraft tag and an «allawi.psd» stamp.

- The photo is an AI-generated, made-up man the user generated from our prompt (`photo/src-guy.jpg`), not a real
  person; the original post used a celebrity, which we avoided. The caption says the photo is AI-generated.
- Look: the page's own: torn cream strips with tape, an orange highlighter on «بالثنتين», a worn stamp, paper texture
  (multiply, .16), light grain (.07) and a vignette. Font: DG Sahabah (the text has no «چ» or «گ»).
- `prep.py` builds `img/guy.jpg`: the photo at 1.3x, set at the bottom with his face on the left, the grey wall
  continued 185 px upward; a light warm grade.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `out/`. `node ../tools/textcheck.cjs post.html '#post'`
  finds no collisions.
- `caption.txt`: the caption.
