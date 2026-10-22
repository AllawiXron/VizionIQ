# Instagram sizes, from my own phone

A 7-slide carousel for @allawi.psd (1080×1350, `out/ig-1..7.png`). It replaces the drawn sizes guide in
`../ig-design-guides`: every example here is a real screenshot of the page (`shots/`, taken on 22 Oct), and the marks
are Photoshop's own (guides, the transform box, Quick Mask red, the info tooltip).

1. My profile grid, darkened, with the qicard post lit up: إنستغرام يقص من تصميمك.
2. The qicard post full and as its grid tile: the grid shows 3:4, so a 4:5 post loses 34 px each side, and the app's
   icons sit on the corners.
3. The original file (`../ig-brand-posts/works/qi.jpg`) with guides at 34 and 1046 px.
4. My reel where the end of بثانية وحدة. sits under the like button.
5. What covers a reel on my phone, measured from the screenshot (about 130 px top, 140 right, 280 bottom of a
   1080×1920 file), and the margins I keep (250, 150, 350).
6. The sizes I work on, and export at 1080 wide in sRGB.
7. Contact: my bio and the Contact button.

- `slides.html`: the slides; `node render.cjs` renders `out/` (with `NODE_PATH=/opt/node-tools/node_modules`).
- `caption.txt`: the caption.
