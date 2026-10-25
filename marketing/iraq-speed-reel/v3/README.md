# The Iraq internet speed reel, third version

Ali liked the idea and the timing of the second version (`../v2`) and cut music to it, but it looked like a flat
web page. This version keeps every cut on the same second (35.6 s, the same `HOLDS`) and rebuilds the picture:

| Time | What changed |
|---|---|
| all | An off-white room (`#F7F8FA`) with a soft light in the middle and a data grid at 4 % that moves at a third of the camera's speed and drifts a little, so held frames still breathe |
| 0:03 to 0:07 | Karrada's counter races from 0 to ٨٧ and shakes with the speed; Saqlawiya's bar crawls to ٤ in red and keeps pulsing a warning |
| 0:08 to 0:11 | The line is now أول منصة تكشف سرعة الإنترنت الحقيقية بكل منطقة وحي في العراق |
| 0:12 to 0:20 | The phone is a 3D model (three.js) turned in perspective, with three shadows (tight, cast away from the light, wide and soft). The camera dives into the search bar, a real caret types الكرادة, a finger's touch presses the result, then the camera steps back and moves down Karrada's page: the number, the comparison, the neighbourhood map. No blur between screens |
| 0:21 to 0:25 | The governorates light up in a wave from the north, with a band of light running down; five number cards (السليمانية ٨٩، البصرة ٧٢، بغداد ٦٧، الأنبار ٣٢، ديالى ٣٠) land with a bounce and soft shadows. The camera then zooms into Sulaymaniyah's green until it fills the frame, which is where the chart begins |
| 0:26 to 0:30 | The bars of the summers 2019 to 2026 grow on a spring that overshoots and settles; at ٦٢ a path climbs over them |
| 0:31 to 0:35 | The name rises out of the line; the site on a phone rises behind and keeps turning; its search box comes out of it as the link and pulses to the last frame |

The site was captured again at 4x so the close-ups stay sharp (`capture.cjs`, the caret positions and the first
result's place go to `site/marks.json`). three.js r160 is in `vendor/` with its licence.

Sound: only Ali's pack (`marketing/sfx-pack`), as in v2, plus the two counters, the warning, a pop per card, the zoom
into the green and the path. No music in the file; Ali lays his track over it as before.

Build, from this folder, with `NODE_PATH=/opt/node-tools/node_modules`: `node capture.cjs`, `python3 mix.py`,
`node beats.cjs <dir> "t1,t2,..."` for single frames, and `node render.cjs <frames dir> ../out/iraq-internet-speed-reel-v3.mp4`
(delete the frames folder first).
