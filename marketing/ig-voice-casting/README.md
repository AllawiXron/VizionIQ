# «مطلوب صوت نسائي عراقي»: a casting call for a voice-over artist

A 2-slide Instagram carousel (1080×1350) and a story (1080×1920) for @allawi.psd. The page owner wants an Iraqi woman to voice his motion reels. The look is the dollar reel's analog collage: red cloth, a torn strip of newsprint, a black-and-white print with tape, a notebook sheet in blue pen, and a red rubber stamp.

- **`out/casting-1.png`, the call:** «مطلوب صوت / نسائي عراقي». A vintage microphone print sits beside a pinned notebook sheet that says: short reels, 30 to 40 seconds, Iraqi dialect, recorded at home on a phone, steady work. A red «مدفوع» stamp marks it as paid. At the bottom: «دزّيلي فويس ٢٠ ثانية بالدايركت».
- **`out/casting-2.png`, how to apply:** «شلون تتقدمين؟».
  1. Record the 4-line script, lines from the dollar reel.
  2. Send it as a voice note in the DMs.
  3. Agree the pay and details.

  Underlined in red: «ما تحتاجين تنشرين اسمج أو صورتج.. بس الصوت.» Many women will only apply if they can stay anonymous, so the post says it plainly.
- **`out/casting-story.png`:** the call as a story. The lower third is left empty for a question or DM sticker.
- `caption.txt`: the caption.

Files:
- `post.html`: all three artboards.
- `fonts.css`: points at `../hf-dollar-reel/assets/fonts`. Textures and paper pieces also come from `../hf-dollar-reel/assets/img`.
- `prep.py`: builds `img/p-mic.png` from `photo/src-mic.jpg`.
- `node render.cjs`: renders `out/`. It needs `NODE_PATH=/opt/node-tools/node_modules` here.
- Checks: `node ../tools/textcheck.cjs post.html '.art'` finds no collisions.

The stamp's worn ink comes from an SVG noise filter (`#stampF`), not a CSS mask: Chrome blocks image masks on pages opened from `file://`.

Photo: "Free microphone image", rawpixel, CC0 (via Openverse). Fonts: Reem Kufi, IBM Plex Sans Arabic (SIL OFL).
