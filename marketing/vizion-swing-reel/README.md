# viZion swing reel: «إعلانك ما يبيع؟ / إحنا وياك.»

A 13 s loop (1080×1920, 30 fps) for the viZion page, based on a reference reel the user sent (an agency's "NEED
BRANDING? / WE GOT YOU."). A logo tag hangs on a string from far above the frame and swings like a pendulum. The
string splits the headline: the side it has already passed shows the next line, and the side ahead of it still shows
the old one. So every half swing flips a seller's problem into the answer and back:

| Half swing | Line |
|---|---|
| start | «إعلانك / ما يبيع؟» |
| 1, 3, 5, 7, 9 | «إحنا / وياك.» |
| 2 | «يسألون بيش / وما يشترون؟» |
| 4 | «ما تعرف / شلون تسعّر؟» |
| 6 | «الرواجع / دا تخسّرك؟» |
| 8 | «تريد تبدي / تبيع أونلاين؟» |
| end | back to «إعلانك ما يبيع؟», so the reel loops seamlessly |

The questions come from what the course covers (`../vizion-sales-brief.md`): ads, DMs, pricing, returns and starting
out. There are no prices or promises.

Look: the viZion colours instead of the reference's green. There's a blue spotlight with navy edges, the questions are
in navy and the answer in white. The tag is a navy rounded square with the real VZ mark in blue and yellow (shapes from
`../vizion-results-carousel/brand/vizion-mark.json`, exported to `mark.js`). Light grain (.07, shifting every 0.2 s)
and a vignette sit on top. Text is DG Sahabah. The name "viZion" alone is in Readex Pro (as on the viZion posts),
because DG Sahabah's "v" reads as "u". The footer reads «تسويق · مبيعات · أرباح» and «كورس viZion · راسلنا
بالخاص». Everything stays inside the Reels safe area.

Sound: one whoosh from the user's pack per half swing, peaking as the tag passes the middle and panned the way it
moves («Simple Whoosh» and «Smooth And Fast Whoosh» alternate). There's no music; the user can add a track.

- `reel.html`: the animation. `setTime(t)` draws any moment. The lines are in `Q` and `ANS`, and the swing is set by `A`
  (amplitude) and `HALF` (seconds per half swing).
- `./make.sh`: renders `frames/`, builds `out/sfx.wav` (`sfx.py`, needs `../sfx-pack/fetch.sh` first) and encodes
  `out/vizion-swing-reel.mp4` at about 10 Mbps.
- `node render.cjs --preview 0,0.65,1.3` renders stills only (`NODE_PATH=/opt/node-tools/node_modules`).
- `caption.txt`: three captions (the first asks viewers to comment the number of their problem). `out/cover.jpg`: the
  cover, the first frame with the viZion name moved down so it shows whole in the 4:5 profile grid
  (`node cover.cjs`).
