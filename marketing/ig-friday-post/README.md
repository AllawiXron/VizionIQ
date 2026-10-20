# «جمعة مباركة»: a Friday post for @allawi.psd (20 Oct)

A 1080×1350 post in his highlights' look. The brown desk sits under the paper texture, «جمعة مباركة» is on a torn
cream strip pinned with an orange pin, and «استريحوا اليوم.. والأفكار علينا» is on a second clipped strip. Below them
is an Iraqi istikan of tea on a gold-rimmed saucer with two sugar cubes, with a little steam, his pencil and a kraft tag
«@allawi.psd». DG Sahabah throughout.

- `out/friday.png` / `out/friday.jpg`: the post. `caption.txt`: the caption.
- The tea is modelled and rendered for this post in Blender 4.2 (`props/tea.py`, lit by the CC0 Poly Haven «Studio
  Small 09» HDRI from `../hf-vizion-trial-reel/props/hdri`), on a shadow catcher so it carries its own shadow:
  `blender -b -P props/tea.py -- $PWD/renders/tea-raw.png ../hf-vizion-trial-reel/props/hdri/studio.hdr`, then
  `python3 -I props/finish.py renders/tea-raw.png assets/tea.png`, which fades the shadow out at the edges and trims
  the image. The tea touches the glass wall on purpose: a thin air gap between them turned the glass white.
- The pencil, pin, clip, paper texture and grain are from `../hf-one-second-reel`. The torn paper is that reel's
  `tear()` (`tear.js`).
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `post.html` to `out/friday.png`.
