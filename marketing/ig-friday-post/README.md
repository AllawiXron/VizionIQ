# «جمعة مباركة»: a Friday post for @allawi.psd (20 Oct)

A 1080×1350 post in his look: the brown desk under the paper texture, «جمعة مباركة» on a torn cream strip with an
orange pin, «استريحوا اليوم.. والأفكار علينا» in DG Sahabah, and a kraft tag «@allawi.psd».

v2 (the user asked for "same post but better") is shot like a photo. An Iraqi istikan of tea stands on a gold-rimmed
saucer with a teaspoon and two sugar cubes, with his orange pencil out of focus in front. Warm morning sun comes
through a window, and the window frame's shadow falls across the desk. The render covers the whole frame, so the
objects, their shadows and the window shadow lay straight over the page's desk. A turbulent CSS steam rises from the
glass.

- `out/friday.png` / `out/friday.jpg`: the post. `caption.txt`: the caption.
- `props/tea.py` (Blender 4.2, Cycles) builds the whole still, lit by the sun plus the CC0 Poly Haven «Studio Small 09»
  HDRI at low strength: `blender -b -P props/tea.py -- $PWD/renders/still.png ../hf-vizion-trial-reel/props/hdri/studio.hdr`
  (`SAMPLES=24 PCT=30` for a test; the final is `SAMPLES=160 PCT=150`, about 15 min on 4 cores). Then
  `python3 -I props/finish.py renders/still.png assets/still.png` lightens the catcher's shadows a little and scales
  the still to 1080×1350.
- The glass is modelled with its real interfaces: air|glass outside and above the tea, glass|tea (IOR 1.33/1.5) on the
  inner wall and floor below the tea line, and tea|air on top. v1 overlapped two separate solids, and the thin gap
  between them made the glass look milky.
- The pin, paper texture and grain are from `../hf-one-second-reel`; `tear.js` is that reel's torn paper.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `post.html` to `out/friday.png`.
