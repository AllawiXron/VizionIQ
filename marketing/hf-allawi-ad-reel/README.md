# Ad reel for allawi.psd

A 41 s reel at 1080×1920, 30 fps, that sells my design work. The idea and the visual language come from an agency reel
the user sent (Brandek): one vivid coral field for the whole reel, big white type with the key words in near-black,
black-and-white cut-outs that come in from the frame edges and act on the words, and the next idea pushing the last one
out of the frame. The content is mine: the script, the elements the user picked, and my three reels playing on phones.

It is one take. Everything sits on a long strip (`#strip`) over the fixed coral field, and the camera pushes through it,
mostly right to left with three drops, holding on each beat while it is spoken and leaning towards the next. Things
cross from one beat to the next where the story allows (the coin from the wallet lands on the middle phone). The motion
keeps the reel standard (`../hf-simple-logos-reel`): Smart Bounce, motion blur on the camera and on everything that
moves, the frame stepping at 15 fps.

The voice is the user's ElevenLabs take of `voice-script.txt`, trimmed and sped up by the user.

| Time | Line | On screen |
|---|---|---|
| 0–2.6 | مشروعك متعوب عليه، بس أرباحك قليلة | hands hold out a box from the right edge; the wallet slams it away; a coin bounces off it into the next beat |
| 2.6–5.2 | عدنا نصمملك موشن جرافيك وبوستات إعلانية | the coin lands on the middle phone; three phones play my dollar, viZion and logos reels; a film camera rolls in |
| 5.2–7.7 | تحجي بقوة براندك وتبيع بمكانك | a megaphone from the left edge blasts «براندك» out of its mouth; a shop owner rises from the bottom |
| 7.7–12.6 | حركة تشد العين، فكرة تقنع الزبون، ونتيجة ترفع مبيعاتك | the three words stack up on the right; binoculars, a bulb on its cord that lights, coins and cash on the left |
| 12.6–14.4 | من أول 3 ثواني بإعلانك | a giant 3, a hand with a stopwatch |
| 14.4–19 | الكواليتي العالي، يثق بمنتجك، ويدخل يطلب منك مباشرة | a magnifier passes over «الكواليتي», which swells; a handshake; a finger presses above «مباشرة» |
| 19–23.5 | يعزلك تماما عن منافسيك | the king stands, the pawns are knocked out of the frame, «منافسيك» fills the background |
| 23.5–26.6 | ويخلي الزبون يشتري منك مرة ومرتين وعشرة | the words tilt in; bags drop, one, two, then a pile |
| 26.6–28.5 | لأن شاف براند حقيقي قدامه | a man with binoculars looks at «براند» |
| 28.5–35.5 | كافي تضيع جمهورك... توقف الزبون وتقفل وياه البيعة | crowds walk along the bottom; a stop hand comes up, the crowd scatters; a padlock locks |
| 35.5–41.2 | تواصل ويانا بالخاص، شوف أعمالنا، وخلي براندك يبيع صح | a receiver, my reels on phones over «أعمالنا», a register that throws its cash, @allawi.psd |

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

- The empty wallet: rawpixel, CC0. The other elements (objects, hands, people) were picked or made by the user and cut
  out here (`assets/el`); the phone frame has its screen cut out so a reel plays inside it.
- Sounds: only the user's own pack. No music.
