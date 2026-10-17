# «مطلوب صوت نسائي عراقي»: a casting call for a voice-over artist

A 2-slide Instagram carousel (1080×1350) and a story (1080×1920) for @allawi.psd: the page owner wants an Iraqi woman to voice his motion reels.

The style is the dollar reel's analog collage: a torn newsprint strip, a black-and-white print with tape, a pinned notebook sheet, a rubber stamp, marker ticks and underlines, film grain and a film frame. The colours are the allawi.psd brand: orange cloth `#e2541b` in place of the reel's red, brand paper `#ece3d4`, ink `#1f1510`, cream `#fbf3e6`. The user asked for "just the colours, not the whole style".

- **`out/casting-1.png`, the call (orange cloth):**
  - «مطلوب صوت / نسائي عراقي» on a torn strip of newsprint;
  - a vintage microphone print beside a pinned notebook with the details: short reels, 30 to 40 seconds, Iraqi dialect, recorded at home on a phone, steady work;
  - an orange «مدفوع» stamp;
  - at the bottom, «دزّيلي فويس ٢٠ ثانية بالدايركت».
- **`out/casting-2.png`, what is wanted and how to apply (paper):**
  - «أدوّر على صوت.. / مو مذيعة أخبار.», with the second line underlined in orange marker;
  - three orange ticks: natural Iraqi, a voice with feeling, a clean phone recording;
  - a taped slip with the audition line «تدري شنو أحلى شي بالعراق؟ إنو كل مشكلة.. عدنا الها نكتة.»;
  - «دزّيه بالدايركت» and «بدون اسم أو صورة.. بس الصوت.». Many women will only apply if they can stay anonymous, so the post says it plainly.
- **`out/casting-story.png`:** the call as a story. The lower third is left free for a sticker.
- `caption.txt`: the caption.

Files:
- `post.html`: all three artboards. Fonts come from `../hf-dollar-reel/assets/fonts` through `fonts.css`; the notebook sheet and grain come from `../hf-dollar-reel/assets/img`.
- `prep.py`: builds `img/p-mic.png` (from `photo/src-mic.jpg`), `img/orange.jpg` and `img/paper.jpg`.
- `node render.cjs`: renders `out/`. It needs `NODE_PATH=/opt/node-tools/node_modules` here.
- Checks: `node ../tools/textcheck.cjs post.html '.art'` finds no collisions.

The stamp's worn ink comes from an SVG noise filter (`#stampF`), not a CSS mask: Chrome blocks image masks on pages opened from `file://`.

Photo: "Free microphone image", rawpixel, CC0 (via Openverse). Fonts: Reem Kufi, IBM Plex Sans Arabic (SIL OFL).
