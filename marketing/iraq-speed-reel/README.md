# سطر السرعة: the ad reel for the Iraq internet speed site

A 15-second reel (1080 x 1920, 60 fps, 120 BPM) for the site in `marketing/iraq-internet-map/site`, in the style of the
Apple-like reference Ali sent (white field, heavy type out of a blur, UI moments, one full-colour scene, an end title).
Ali mentions Minister Mustafa Sanad in the caption.

The idea in one line: one line becomes everything. It grows like a loading bar, splits into the speed colours, becomes
two real places (Karrada 87 Mbps from 4,678 tests, Saqlawiya 4 from 236), Karrada's ٨٧ unravels into Karrada's real
streets, the camera pulls back to Iraq's 18 governorates rising in 3D by their speed, they fall into the site's ranked
bars, the bars merge into the site's search box, «الكرادة» is typed and answered, the green of «جيد» fills the screen
for Iraq's summers from 17 to 62 Mbps, and the title closes back into the first line, so the reel loops.

| Bar (2 s) | Technique | Beats |
|---|---|---|
| 1 | hook, kinetic type | line grows, «الإنترنت» «مو نفس السرعة» «بكل العراق.» rise out of it, the line splits into red, amber, green |
| 2 | kinetic type | the pieces become two bars: الكرادة ٨٧ and الصقلاوية ٤; ٨٧ fills the screen |
| 3 | shape morph | the outline of ٨٧ unravels into 120 strands that land on Karrada's main roads; the rest of the streets draw in |
| 4 | 2D to 3D | pull back to Iraq, tilt, the governorates rise to their speeds; «١٨ محافظة» «من أكثر من مليون اختبار سرعة» |
| 5 | data | the governorates fall into the ranked bars (السليمانية ٨٩ first, ديالى ٣٠ last) |
| 6 | UI | the bars merge into the search box; «الكرادة» typed, the result, the answer |
| 7 | strongest moment | the green of «جيد» fills the screen; Iraq's summers 2019 to 2026 rise and the counter runs from ١٧ to ٦٢ |
| 7½ | end title | «سرعة الإنترنت في العراق» «اعرف سرعة منطقتك، الرابط بالبايو», then back into the line |

All numbers are the site's own data. Type: Rubik (the site's face, SIL OFL), one family. Colour: red `#d2483f`,
amber `#e3b021`, green `#12795a`, ink `#14202b` and white. Motion: a critically damped spring and exponential eases,
written as functions of time; fast moves smear along their direction (copies averaged on a separate layer), and each
frame blends three subframes.

Sound: only Ali's own pack (`marketing/sfx-pack`): High Click on every beat, Smooth Pop as words land, whooshes timed
by their peak to each move, Smooth Riser into the last full bar, Whoosh hit on the green field, Slice Ring on ٦٢.
No music, as Ali's sound rule asks; a track can be laid under it if he sends one.

Build: `python3 prep.py` (Karrada's streets from the site's tiles, the ٨٧ outlines from Rubik, the governorates) ->
`data.js`; `python3 mix.py` -> `sound.wav` (run `../sfx-pack/fetch.sh` first);
`NODE_PATH=/opt/node-tools/node_modules node beats.cjs <dir>` for one frame per beat to check;
`NODE_PATH=/opt/node-tools/node_modules node render.cjs <frames dir> out/iraq-internet-speed-reel.mp4` for the reel.
