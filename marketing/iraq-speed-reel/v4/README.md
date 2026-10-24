# The Iraq internet speed reel, fourth version

The site grew from a page of averages into tools people use: a test of your own line against your area, ping for
gamers, home line or mobile, two areas before renting, and a page for the ministry. This 37 s reel shows each of them
in Ali's words, at the pace of a fast track he lays over it (no scene still for more than about 3 s). It keeps the
look of v3: the off-white room with the moving data grid, the real site on a 3D phone, cards that land with a bounce,
the zoom into a colour.

| Time | Scene |
|---|---|
| 0 to 3 | النت يمك ضعيف؟ المشكلة من صاحب البرج.. لو من منطقتك؟ A red bar stops at ١٢ far short of the line «معدل منطقتك: ٨٧ ميغابت» |
| 3 to 8 | افحص خطك.. واكشف الفرق بالأرقام. On the phone: the tap on ابدأ الفحص, the test, the result «خطك أبطأ من معدل منطقتك بـ ٧ أضعاف!» |
| 8 to 11 | وثق فحصك ببطاقة جاهزة للنشر. The share picture comes out of the phone |
| 11 to 17 | للگيمرية.. اكشف سبب اللاگ وقت اللعب. The ping test jumps from ١٢ to about ١٦٠ while the line is busy; then السليمانية ٦ and الأنبار ٤٣ |
| 17 to 22 | في ٨٢٤ منطقة بالعراق.. الـ 4G أسرع من الواي فاي! Saqlawiya: home ٣٫٧, mobile ٥٣, أسرع بـ ١٤ مرة |
| 22 to 26 | قبل لا تنتقل أو تأجر.. قارن بين منطقتين. Karrada and Mansour side by side, the better numbers in green |
| 26 to 33 | The ministry's view: the map with Diyala's ٦١٪, the zoom into the green, Iraq from ١٧ to ٦٢ since 2019 |
| 33 to 37 | منصة سرعة الإنترنت في العراق, the call to action, the credit, the phone and its start button pulsing |

The phone screens are the real site (`capture.cjs`, at 3x). The line test result and the ping test are a sample, as
the badge «نموذج فحص» on those screens says: the capture holds the line at about 12 Mbps down and 4 up, and answers
the ping requests in 12 ms, or about 160 ms while the line is busy. Every other number is the site's own data.

Sound: only Ali's pack (`marketing/sfx-pack`), quiet enough to sit under his music. No music in the file.

Build, from this folder, with `NODE_PATH=/opt/node-tools/node_modules`: `node capture.cjs`, `python3 mix.py`,
`node beats.cjs <dir> "t1,t2,..."` for single frames, `node render.cjs <frames dir> ../out/iraq-internet-speed-reel-v4.mp4`.
