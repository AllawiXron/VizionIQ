# The Iraq internet speed reel, fourth version

The site grew from a page of averages into tools people use: a test of your own line against your area, ping for
gamers, home line or mobile, two areas before renting, and a page for the ministry. This 37 s reel shows each of them
in Ali's words.

It is shot by one camera over one big world rather than laid out like pages. Each line of the script first stands
alone, big, in the middle of the frame for about a second; then the camera whips sideways or down, or pulls back, to
what the line is about. On the phone it works like a close-up lens: tight on the button, on the counting number, on
the verdict. No hold is a still frame: between moves the camera always creeps in a few percent and rolls a little.

| Time | Scene |
|---|---|
| 0 to 2.5 | النت يمك ضعيف؟ المشكلة من صاحب البرج.. لو من منطقتك؟ alone, then the pull back to the red bar that stops at ١٢ far short of «معدل منطقتك: ٨٧ ميغابت» |
| 2.5 to 7.6 | افحص خطك.. واكشف الفرق بالأرقام, then a whip to the phone: tight (1.65x, turned −4°) on ابدأ الفحص with the touch, closer still on the counting number and the bar, then a pull back to 1.25x as the verdict «خطك أبطأ من معدل منطقتك بـ ٧ أضعاف!» hits with a short shake |
| 7.6 to 10.9 | وثق فحصك ببطاقة جاهزة للنشر, then back to the phone: the share card comes out in front, the camera turned −3° at 1.15x, and the phone behind it goes out of focus |
| 10.9 to 16.8 | للگيمرية.. اكشف سبب اللاگ وقت اللعب, a whip to the ping test: tight on افحص البنك مالتك, the touch, a punch in on ١٢ ملي ثانية; when it jumps past ١٦٠ the frame shakes hard and the edges go red until the warning has been read; then the lowest and highest governorates, السليمانية ٦ms and الأنبار ٤٣ms |
| 16.8 to 21.8 | في ٨٢٤ منطقة بالعراق.. الـ 4G أسرع من الواي فاي! counting up, then a drop to Saqlawiya: home ٣٫٧, mobile ٥٣, أسرع بـ ١٤ مرة |
| 21.8 to 25.8 | قبل لا تنتقل أو تأجر.. قارن بين منطقتين, pushed out by Karrada and Mansour sliding in from the sides, the better numbers in green |
| 25.8 to 33.3 | The ministry's line, then the map with Diyala's ٦١٪; the camera zooms into the middle of Sulaymaniyah (1 to 35 times in 0.45 s, expo in) until its green is the whole frame, and that green becomes the field of Iraq from ١٧ to ٦٢ since 2019 |
| 33.3 to 37 | منصة سرعة الإنترنت في العراق, the call to action, the credit, the phone rising with its start button pulsing |

The phone screens are the real site (`capture.cjs`, at 3x). The line test result and the ping test are a sample, as
the badge «نموذج فحص» on those screens says: the capture holds the line at about 12 Mbps down and 4 up, and answers
the ping requests in 12 ms, or about 160 ms while the line is busy. Every other number is the site's own data.

Motion: the camera is a list of keys in `reel.html` (`buildCam`): whips and pull backs run on
cubic-bezier(0.85, 0, 0.15, 1), holds creep on a straight line, and the dive into the green grows from the point
of Sulaymaniyah farthest from its border, so the green fills the frame before the chart. The 3D phone and card are
placed under the same camera in 3D, so the close-ups stay sharp. Every line of type slides up through its own mask,
0.06 s apart, with no blur; each frame is one sharp still at 60 fps, with no blended frames or offset copies.
The set is a warm studio backdrop (#F5F4F0) with a spotlight, a falling-off floor, two soft drifting shadows, a
vignette and 2.5 % film grain. The phone is tilted in every scene, with a sheen on its glass and the share card's
shadow falling on it.

Sound: only Ali's pack (`marketing/sfx-pack`), and only two kinds of sound so it sits under his music: soft air
whooshes on the moves (low-passed at 550 Hz) and deep thuds on the big moments (a hit low-passed at 140 Hz).
`out/iraq-internet-speed-reel-v4-silent.mp4` is the same video with no sound at all, for his own pack and music.

Build, from this folder, with `NODE_PATH=/opt/node-tools/node_modules`: `node capture.cjs`, `python3 mix.py`,
`node beats.cjs <dir> "t1,t2,..."` for single frames, `node render.cjs <frames dir> ../out/iraq-internet-speed-reel-v4.mp4`.
