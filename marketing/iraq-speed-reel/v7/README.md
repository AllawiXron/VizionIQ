# The Iraq internet speed reel, seventh version (55 s, Remotion)

v6 slowed down and told as a story, so a viewer understands what the site does and why it matters. Same look, same
camera language (`src/Reel.tsx`, whip pans through `<CameraMotionBlur shutterAngle={180} samples={48}>`), but every
scene holds for 6 to 9 s and the lines explain each step.

| Time | Scene |
|---|---|
| 0 to 6 | النت يمك بطيء.. وتحتار وين الخلل؟ and هل المشكلة من صاحب البرج، لو من الضغط بمنطقتك؟ |
| 6 to 14 | طورنا منصة مجانية.. تفحص سرعة خطك الحقيقية. The pointer presses ابدأ الفحص (close up), the test runs on the phone, the result close up, then the verdict card beside the phone: your line ١٢ against Karrada's ٨٧ and خطك أبطأ من معدل منطقتك بـ ٧ أضعاف! |
| 14 to 22 | The dark room: للي يلعبون أونلاين.. شنو سبب اللاگ؟ then the ping card, ١٢ ms jumping to ١٦٢ ms, and البنگ يرتفع لما يكون خط البيت مشغول |
| 22 to 30.5 | في ٨٢٤ منطقة بالعراق.. الـ 4G يتفوق عالواي فاي! then Saqlawiya: home ٣٫٧, mobile ٥٣, إنترنت الموبايل أسرع بـ ١٤ ضعف |
| 30.5 to 38 | قبل لا تنتقل أو تأجر.. قارن بين منطقتين: Karrada and Mansour slide in, the better numbers turn green one by one |
| 38 to 47 | بيانات ميدانية أمام وزارة الاتصالات, the map with Diyala's ٦١٪, the zoom into the green, then قفزة العراق: من ١٧ إلى ٦٢ ميغابت |
| 47 to 55 | The dark end card: the name, the link in the bio, the credit, and the phone rising with the pointer starting a test |

Each scene's line is 58 to 62 px bold (made smaller only if it would not fit in 900 px), with a 34 to 36 px line under
the key ones at 65 %. The map's last moment fades into the green over 0.25 s. The buttons and badges are soft matte pills (#EFEFF4, a hairline of light along the top, a 0 8px 20px shadow at 8 %)
that fill with colour when pressed or picked. Everything stays straight; nothing covers text.

The phone screens are the real site from `../v4/capture.cjs`, copied into `public/site`. The line test and the ping
test are a sample, as the tag «نموذج فحص» on the screens and cards says. The two side share cards are drawn by
`cards.cjs` with the site's own share picture code, for the same sample ping test and for a line at Karrada's average.

Sound: only Ali's two packs (`marketing/sfx-pack`), set like a phone launch film (`mix.py`): the Apple keyboard click
on each press with a soft tap as the button turns blue, small soft pops as cards arrive and as the better numbers turn
green, an airy wind swish on each whip pan, faint ticks while the test and the ٨٢٤ count run, a soft riser and a
thump into ١٦٢ ms, a short chime when the mobile line wins, a clean riser into the green. `silence.wav` is the silent copy.

Build, from this folder: `npm install`, `python3 mix.py`, `node stills.mjs <dir> "t1,t2"` for single frames,
`npx remotion render src/index.ts Reel out/video.mp4 --codec=h264 --crf=15 --muted`, then the sound under it:
`ffmpeg -i out/video.mp4 -i sound.wav -map 0:v -map 1:a -c:v libx264 -b:v 10M -pix_fmt yuv420p -c:a aac -b:a 192k -t 55
-map_metadata -1 ../out/iraq-internet-speed-reel-v7.mp4` (and the same with `silence.wav` for the silent copy). Remotion is free for one person working
alone, which is Ali's case.
