# The Iraq internet speed reel, fifth version

The same 37 s script as v4, shot the way a phone launch film is: everything straight and in its place, moving on
one soft spring, cubic-bezier(0.22, 1, 0.36, 1). No tilts, no camera roll, no shake.

Each scene's line rises in the middle of the frame, is read there for 0.65 s, then glides up to the top (620 px above
the middle, down to 78 % of its size) and stays there for the whole scene. The phone or the cards rise into the space
under it, always at least 80 px below the last line.

| Time | Scene |
|---|---|
| 0 to 2.8 | النت يمك ضعيف؟ المشكلة من صاحب البرج.. لو من منطقتك؟ and a card: your line ١٢ against the area's ٨٧ |
| 2.8 to 7.9 | افحص خطك.. واكشف الفرق بالأرقام. The phone rises, a pointer glides in on a curve and presses ابدأ الفحص (the button goes 1, 0.94, 1.02, 1 and turns blue), the test runs, then the result lifts off the screen as two cards while the phone behind them dims |
| 7.9 to 10.9 | وثق فحصك ببطاقة جاهزة للنشر. The phone comes back and the share picture lifts off its screen into the middle |
| 10.9 to 16.8 | للگيمرية.. اكشف سبب اللاگ وقت اللعب. The pointer presses افحص البنك مالتك; the ping card shows ١٢ms with the line empty, then ١٦٢ms when the line is busy: the room turns dark (#141417) in 0.4 s and the card glows red; then السليمانية ٦ms and الأنبار ٤٣ms |
| 16.8 to 21.8 | في ٨٢٤ منطقة بالعراق.. الـ 4G أسرع من الواي فاي! Saqlawiya: home ٣٫٧, mobile ٥٣, أسرع بـ ١٤ مرة |
| 21.8 to 25.8 | قبل لا تنتقل أو تأجر.. قارن بين منطقتين. Karrada and Mansour, the better numbers in green |
| 25.8 to 29.8 | The ministry's line, the map with Diyala's ٦١٪, then the zoom into the middle of Sulaymaniyah (1 to 35 times in 0.45 s) until its green is the whole frame |
| 29.8 to 33.3 | On the green (#0B6E4F): رغم قفزة العراق من ١٧ إلى ٦٢ ميغابت.. and the summers 2019 to 2026 |
| 33.3 to 37 | Back to the light room: the name, the call to action and the credit in the upper part (140 to 600 px), the phone under them from 720 px, and the pointer pressing ابدأ الفحص so the test starts |

The room is #F2F2F7 with a soft light from above, dark only for the ping jump and green only for the chart. Cards are
white with a 0 25px 60px shadow at 12 %. The phone is drawn flat on to us (no 3D now), with the real site on its
screen from `../v4/site` (the captures and `marks.json` from `../v4/capture.cjs`). The line test and the ping test are
a sample, as the «نموذج فحص» tag on the screens and the cards says.

Sound: only Ali's pack, as before: a soft air whoosh as each line glides up, deep thuds on the hits (the ping jump
loudest, the three presses softest). `out/iraq-internet-speed-reel-v5-silent.mp4` has no sound, for his own music.

Build, from this folder, with `NODE_PATH=/opt/node-tools/node_modules`: `python3 mix.py`,
`node beats.cjs <dir> "t1,t2,..."` for single frames, `node render.cjs <frames dir> ../out/iraq-internet-speed-reel-v5.mp4`.
