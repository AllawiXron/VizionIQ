# The Iraq internet speed reel, second version

The first reel (`..`) was 15 seconds at 120 BPM and Ali found it too rushed and hard to follow: someone who has never
seen the site, the minister included, could not tell what they were watching. This one is 35.6 seconds, has no
voice-over, and says one thing per stop in plain words, with every line on screen long enough to read twice. The
middle of it is the real site on a phone, recorded from the live pages, not drawn.

The camera moves down one long white page and stops once per idea:

| Stop | On screen |
|---|---|
| 1 | سرعة الإنترنت تختلف من منطقة لمنطقة. |
| 2 | Two real places from the site, الكرادة in Baghdad at ٨٧ and الصقلاوية in Anbar at ٤ Mbps, then نفس البلد، والفرق أكثر من عشرين مرة. |
| 3 | سويت موقع يبين سرعة الإنترنت الحقيقية بكل منطقة بالعراق, and the site's name in green |
| 4 | The phone: الكرادة typed into the search, the tap, Karrada's page with its number and what it is enough for, then the bars against Baghdad and Iraq. The phone comes closer so its text can be read. Captions: تكتب اسم منطقتك، يطلعلك معدل السرعة، وتقارنها بمحافظتك |
| 5 | الأرقام من أكثر من مليون اختبار سرعة سواها الناس بأنفسهم; the 18 governorates take the colour of their speed, with their numbers and the site's own key |
| 6 | A green field grows out of Sulaymaniyah, the fastest governorate: Iraq's summers from 2019 to 2026, the counter running from ١٧ to ٦٢ |
| 7 | The field folds into a line and the name rises out of it, with اعرف سرعة منطقتك، الرابط بالبايو and the credit |

All numbers are the site's own data (Ookla open data, July to September). Type: Rubik, the site's face. Colours: the
site's speed bands and ink on white.

Timing: the scenes are written on a 32 s clock; `HOLDS` in `reel.html` (copied in `mix.py`) stops that clock for a
moment wherever a frame needs more reading time, so the reel runs 35.6 s. Camera moves take 0.8 s on a smooth ease,
calmer than the first version's.

Sound: only Ali's pack (`marketing/sfx-pack`, run `fetch.sh` there first). A soft pop on each word, a whoosh on each
camera move, the keyboard clicks and the tap on the phone, a riser and a hit into the green field, a ring on ٦٢. No
music; a track can go under it if Ali sends one.

Build, from this folder, with `NODE_PATH=/opt/node-tools/node_modules`:

- `node capture.cjs` records the site at 390 x 844 (3x) into `site/` (the site's own server must be able to start)
- `python3 mix.py` writes `sound.wav`
- `node beats.cjs <dir> "t1,t2,..."` saves single frames to check
- `node render.cjs <frames dir> ../out/iraq-internet-speed-reel-v2.mp4` renders 180 stills a second and blends
  three into each of the 60 frames (delete the frames folder first, it skips frames it already has)

`stills.html` and `three-frames.jpg` are the three frames Ali approved before the build.
