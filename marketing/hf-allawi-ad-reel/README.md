# Ad reel for allawi.psd

A 41 s reel at 1080×1920, 30 fps, that sells my design work. The idea and the visual language come from an agency reel
the user sent (Brandek): one vivid field for the whole reel (here my brand orange, #e2541b to #f07a2e), big white type with the key words in my
brown (#1f1510),
black-and-white cut-outs that come in from the frame edges and act on the words, and the next idea pushing the last one
out of the frame. The content is mine: the script, the elements the user picked, and my three reels playing on phones.

It is one take. The ten ideas sit in a row on a strip (`#strip`) over the fixed orange field, with room between them so
nothing of one idea shows in the next. The camera holds still on an idea while it is spoken and pushes smoothly to the
next, right to left. Each idea has one hero cut-out, anchored to a frame edge and held through its lines (the phone
beat plays «حركة / فكرة / نتيجة» on its own screen), and the words slide up softly in the middle of the frame. The motion
keeps the reel standard (`../hf-simple-logos-reel`): Smart Bounce on the key moments, motion blur on the camera and on
everything that moves, the frame stepping at 15 fps.

The voice is the user's ElevenLabs take of `voice-script.txt`, trimmed and sped up by the user.

| Time | Line | On screen |
|---|---|---|
| 0–2.6 | مشروعك متعوب عليه، بس أرباحك قليلة | the open empty wallet; one coin drops in, bounces off and flies into the next idea |
| 2.6–5.2 | عدنا نصمملك موشن جرافيك وبوستات إعلانية | the coin lands on the middle of three phones playing my dollar, viZion and logos reels |
| 5.2–7.7 | تحجي بقوة براندك وتبيع بمكانك | a megaphone from the left edge, «براندك» comes out of its mouth; a shop owner comes up |
| 7.7–12.6 | حركة تشد العين، فكرة تقنع الزبون، ونتيجة ترفع مبيعاتك | one big phone; the three words play on its screen, the line above changes |
| 12.6–14.4 | من أول 3 ثواني بإعلانك | a giant 3, a hand with a stopwatch |
| 14.4–19 | الكواليتي العالي، يثق بمنتجك، ويدخل يطلب منك مباشرة | a magnifier settles on «الكواليتي»; a handshake comes up and holds |
| 19–23.5 | يعزلك تماما عن منافسيك | the king stands, the pawns are knocked away, «منافسيك» fills the background |
| 23.5–28.5 | مرة ومرتين وعشرة، لأن شاف براند حقيقي قدامه | bags pile up; a man with binoculars looks at «براند» |
| 28.5–35.5 | كافي تضيع جمهورك... توقف الزبون وتقفل وياه البيعة | crowds walk past; the stop hand comes up and the crowd stops; a padlock locks |
| 35.5–41.2 | تواصل ويانا بالخاص، شوف أعمالنا، وخلي براندك يبيع صح | a receiver, then my reels on three phones to the end, @allawi.psd |

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
- `stills.html` holds the first still frames (an earlier look, since replaced).

## Credits

- The empty wallet: rawpixel, CC0. The other elements (objects, hands, people, the handshake) were picked or made by the
  user and cut out here (`assets/el`); the phone frame has its screen cut out so a reel plays inside it.
- Sounds: only the user's own pack. No music.
