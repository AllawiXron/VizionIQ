# Ad reel for allawi.psd

A 41 s reel at 1080×1920 that sells my design work. The idea comes from an agency reel the user sent (Brandek): a
problem, who we are, why it works, what waiting costs, then the ask. Its look is mine: one colour world per line of the
voice, cut-out objects, hands and people acting out each line, my real reels playing on phones, and the reel motion standard
(`../hf-simple-logos-reel`, Motion).

The voice is the user's ElevenLabs take of `voice-script.txt`, trimmed and sped up by the user.

| Time | Line | On screen |
|---|---|---|
| 0–2.6 | مشروعك متعوب عليه، بس أرباحك قليلة | hands hold out a box; the empty wallet slams onto the word, one coin drops in |
| 2.6–5.2 | عدنا نصمملك موشن جرافيك وبوستات إعلانية | three phones play my dollar, viZion and logos reels; an old film camera rolls in; the phones turn |
| 5.2–6.6 | تحجي بقوة براندك | an old megaphone blasts the word |
| 6.6–7.7 | وتبيع بمكانك | a shop owner hands over the bag |
| 7.7–9.1 | حركة تشد العين | binoculars come up in front of the word |
| 9.1–10.7 | فكرة تقنع الزبون | a bulb drops and flickers on |
| 10.7–12.6 | ونتيجة ترفع مبيعاتك | coin stacks rise, cash lands |
| 12.6–14.4 | من أول 3 ثواني بإعلانك | a hand with a stopwatch, the 3 bounces in |
| 14.4–17.5 | الزبون راح يلمس الكواليتي العالي، يثق بمنتجك | a magnifier sweeps across, then a handshake |
| 17.5–19 | ويدخل يطلب منك مباشرة | a finger presses the red button |
| 19–23.5 | لأن ويانا راح يطلع إعلانك بمستوى يعزلك تماما عن منافسيك | the king lands in the light, the pawns fall away |
| 23.5–26.6 | ويخلي الزبون يشتري منك مرة ومرتين وعشرة | shopping bags: one, two, then a pile |
| 26.6–28.5 | لأن شاف براند حقيقي قدامه | a man looks through binoculars |
| 28.5–35.5 | كافي تضيع جمهورك... ابدأ اليوم بتصاميم توقف الزبون وتقفل وياه البيعة | crowds walk past without looking; a stop hand slams down; a padlock locks |
| 35.5–36.7 | تواصل ويانا بالخاص | an old phone receiver swings in |
| 36.7–41.2 | شوف أعمالنا، وخلي براندك يبيع صح | my reels on the phones, then a cash register rings with cash bursting out, then @allawi.psd |

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
- `stills.html` holds the first still frames (an earlier look with my posts, since replaced by the elements).

## Credits

- The empty wallet: rawpixel, CC0. The other elements (objects, hands, people) were picked or made by the user and cut
  out here (`assets/el`); the phone frame has its screen cut out so a reel plays inside it.
- Sounds: only the user's own pack. No music.
