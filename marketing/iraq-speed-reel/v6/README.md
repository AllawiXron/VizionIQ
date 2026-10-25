# The Iraq internet speed reel, sixth version (Remotion)

Built in Remotion (`src/Reel.tsx`): every frame comes from `useCurrentFrame()`, and the whip pans are rendered
through `<CameraMotionBlur shutterAngle={180} samples={48}>`. At 10 samples a pan this fast showed stepped copies
of the type, so the shutter takes 48. It follows the phone launch film Ali sent: single short lines with a lot of
air, the phone off to one side with soft buttons beside it, horizontal whip pans between stations, and the camera
punching in on the button being pressed and on the numbers.

| Time | Station |
|---|---|
| 0 | الخلل من خطك.. لو من منطقتك؟ alone, then a whip left to the two bars: your line ١٢, your area ٨٧ |
| 3 | The phone on the right, the button ابدأ الفحص on the left; the pointer presses it and the camera punches in to 2.2 times, then onto the screen while the test runs, and close on the result: ١٢ and خطك أبطأ من معدل منطقتك بـ ٧ أضعاف |
| 8 | The dark room (#121215): the share picture rises in the middle with a soft glow, the ping card and a card at Karrada's average dimmed on either side |
| 11 | فحص اللاگ للگيمرية, then the ping card, closer and closer: ١٢ ms with the line empty, ١٦٢ ms in red the moment it is busy |
| 15 | A whip back to the light room: السليمانية ٦ ms and الأنبار ٤٣ ms as soft pills |
| 17 | ٨٢٤ منطقة: الـ 4G أسرع من الواي فاي counting up, then Saqlawiya's two bars, home ٣٫٧ and mobile ٥٣, and أسرع بـ ١٤ مرة |
| 22 | قارن بين منطقتين: Karrada and Mansour slide in from the two sides, the better numbers turn green |
| 26 | أولويات وزارة الاتصالات, the map with Diyala's ٦١٪, then the zoom into Sulaymaniyah's green |
| 29.75 | On the green: من ١٧ إلى ٦٢ ميغابت, home internet in Iraq, summers 2019 to 2026 |
| 33 | The dark room: the name, the link in the bio and @allawi.psd at the top, the top half of the phone rising from the bottom edge, the pointer pressing ابدأ الفحص |

The buttons and badges are soft matte pills (#EFEFF4, a hairline of light along the top, a 0 8px 20px shadow at 8 %)
that fill with colour when pressed or picked. Everything stays straight; nothing covers text.

The phone screens are the real site from `../v4/capture.cjs`, copied into `public/site`. The line test and the ping
test are a sample, as the tag «نموذج فحص» on the screens and cards says. The two side share cards are drawn by
`cards.cjs` with the site's own share picture code, for the same sample ping test and for a line at Karrada's average.

Sound: only Ali's pack. `python3 mix.py` writes `sound.wav` (a whoosh on each whip, deep thuds on the hits) and
`silence.wav`.

Build, from this folder: `npm install`, `python3 mix.py`, `node stills.mjs <dir> "t1,t2"` for single frames,
`npx remotion render src/index.ts Reel out/video.mp4 --codec=h264 --crf=15 --muted`, then the sound under it:
`ffmpeg -i out/video.mp4 -i sound.wav -map 0:v -map 1:a -c:v libx264 -b:v 10M -pix_fmt yuv420p -c:a aac -b:a 192k -t 37
-map_metadata -1 ../out/iraq-internet-speed-reel-v6.mp4` (and the same with `silence.wav` for the silent copy). Remotion is free for one person working
alone, which is Ali's case.
