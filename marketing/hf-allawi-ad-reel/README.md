# Ad reel for allawi.psd

A 41 s reel at 1080×1920 that sells my design work. The idea comes from an agency reel the user sent (Brandek): a
problem, who we are, why it works, what waiting costs, then the ask. Its look is mine: one colour world per line of the
voice, my real posts as prints, my real reels playing on phones, my real profile and grid, and the reel motion standard
(`../hf-simple-logos-reel`, Motion).

The voice is the user's ElevenLabs take of `voice-script.txt`, trimmed and sped up by the user.

| Time | Line | On screen |
|---|---|---|
| 0–2.6 | مشروعك متعوب عليه، بس أرباحك قليلة | a real empty wallet slams onto the word, shakes on قليلة |
| 2.6–4.3 | عدنا نصمملك موشن جرافيك | three phones come up playing my dollar reel, my viZion course reel and my logos reel |
| 4.3–5.2 | وبوستات إعلانية | Asiacell, Miswag and Pepsi fan out |
| 5.2–6.6 | تحجي بقوة براندك | the Iraqi Airways concept rises onto the word |
| 6.6–7.7 | وتبيع بمكانك | the Talabat concept on paper |
| 7.7–9.1 | حركة تشد العين | the logos reel on a phone, the apple's bite on the beat |
| 9.1–10.7 | فكرة تقنع الزبون | the Al-Waseet ad drops in |
| 10.7–12.6 | ونتيجة ترفع مبيعاتك | a real tile of my grid with its real views |
| 12.6–14.4 | من أول 3 ثواني بإعلانك | a hand with a stopwatch, the 3 bounces in |
| 14.4–17.5 | الزبون راح يلمس الكواليتي العالي، يثق بمنتجك | the camera pushes into the Saj Al-Reef ad |
| 17.5–19 | ويدخل يطلب منك مباشرة | so close to that ad only its order button shows |
| 19–23.5 | لأن ويانا راح يطلع إعلانك بمستوى يعزلك تماما عن منافسيك | the Baly concept in the light, plain sheets fall away |
| 23.5–26.6 | ويخلي الزبون يشتري منك مرة ومرتين وعشرة | Al-Faqma prints pile up, one per word, then ten |
| 26.6–28.5 | لأن شاف براند حقيقي قدامه | my real profile |
| 28.5–35.5 | كافي تضيع جمهورك... ابدأ اليوم بتصاميم توقف الزبون | plain sheets stream past, the Sala ad slams down and stops them |
| 35.5–36.7 | تواصل ويانا بالخاص | my profile's real buttons, Contact punches |
| 36.7–41.2 | شوف أعمالنا، وخلي براندك يبيع صح | the portfolio thrown on the table, then @allawi.psd |

Big-brand concepts (Iraqi Airways, Talabat, Baly) carry «إعلان غير رسمي · فكرة وتصميم @allawi.psd» when they stand
alone.

## Build

- `./sfx.sh` copies the sounds used from `../sfx-pack` (run its `fetch.sh` first) into `assets/sfx` (not committed).
- The three reels in `assets/clips` are not committed: copy `../hf-dollar-reel/renders/dollar-reel.mp4`,
  `../hf-simple-logos-reel/renders/simple-logos-reel.mp4` (as `logos-reel.mp4`) and the viZion course reel the user
  sent (as `vizion-reel.mp4`) there, tags stripped (`ffmpeg -map_metadata -1 -c copy`).
- `python3 voice_fit.py assets/voice-take.mp3 src/words-raw.json` writes `assets/voice.wav` and `src/words.json`
  (pauses over 0.35 s cut to 0.26 s, nothing else touched).
- `python3 build.py` writes `index.html` from `src/template.html`, `src/timeline.js` and `src/reel.json`.
- `npx hyperframes@0.8.162 check`, then `render`, then strip the tags:
  `ffmpeg -i raw.mp4 -map_metadata -1 -c copy allawi-ad-reel.mp4`.
- `stills.html` holds the still frames agreed before the build.

## Credits

- The empty wallet: rawpixel, CC0. The hand with the stopwatch: sent by the user.
- Sounds: only the user's own pack. No music.
- Brand names and logos in the concept ads belong to their owners.
