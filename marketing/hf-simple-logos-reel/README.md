# Six everyday things that became logos (reel)

A 66 s reel at 1080×1920 made from the `../ig-simple-logos` carousel, cut in the motion style of a reference reel the
user sent (a 58 s voice-led explainer), move for move, with my identity: DG Sahabah, my colour worlds, my cut-out objects
and my own sound pack. The voice is the user's ElevenLabs take of `../ig-simple-logos/voice-script-v3.txt`.

The script follows hook, lead, body 1, open loop, body 2, open loop, body 3, CTA:

| Time | Line | On screen |
|---|---|---|
| 0–3 | hook: أي طفل يقدر يرسم أشهر الشعارات بالعالم | words slide in out of a blur; Apple, Shell and Lacoste spring in |
| 3–7.7 | lead: تفاحة، تمساح، صدفة، ثور.. أشياء تشوفها كل يوم | whip; one hero object per word, whipped in and out; then the others burst in around the bull |
| 7.7–10 | بس ليش هاي صارت شعارات ما تنسى | hard cut to red; the Apple logo drops in trailing echoes |
| 10–12.3 | وشعار مشروعك محد يتذكره | vertical whip to paper; «يتذكره» falls apart into specks of ink |
| 12.3–15.4 | خليك للآخر، لأن السر بتفصيلة وحدة | a black apple shape flies in spinning, lands, shakes, gets knocked out |
| 15.4–20.7 | body 1: Lacoste | green; the crocodile; the logo springs in, punches on «التمساح» |
| 20.7–24.7 | body 1: Shell | vertical whip to yellow; the shell rises; the logo |
| 24.7–27.2 | يعني الفكرة طلعت من قصة صاحبها | the two logos slapped on a paper wall as prints |
| 27.2–29.5 | open loop: بس هذا مو أغرب شي بالموضوع | hard cut to black, a small shake, zoom-through |
| 29.5–33.1 | body 2: Starbucks | the old woodcut in a frame; the logo on a disc |
| 33.1–36 | body 2: Red Bull | two bronze bulls charge in and collide, the sun comes up, the logo |
| 36–40.7 | body 2: Mastercard | the six logos slide past with a blur; two circles meet over a compass drawing, the overlap turns orange |
| 40.7–46.3 | open loop: والأغرب.. شعار يمكن بإيدك هسه، ناقص منه قطعة، وعلى قصد | black; a giant logo out of focus racks in, the camera travels to the bite |
| 46.3–53.9 | body 3: the bite | the real apple drops in; on «قص» the bite is taken out of it; the logo beside it |
| 53.9–58.8 | الشي البسيط.. والتفصيلة الوحدة | the six things bounce in, then each flips into its logo |
| 58.8–66.6 | CTA: اكتب مشروعك بالتعليقات | orange; the ask; @allawi.psd |

## Build

- `./sfx.sh` copies the sounds used from `../sfx-pack` (run its `fetch.sh` first) into `assets/sfx` (not committed).
- `python3 voice_fit.py assets/voice-take.mp3 src/words-raw.json` writes `assets/voice.wav` (not committed): every pause
  longer than 0.35 s is cut down, nothing else is changed (one fixed gain, 30 ms fades). It also writes
  `src/words.json`, the word times on the new clock, which the cues in `src/reel.json` follow.
- `python3 build.py` writes `index.html` from `src/template.html`, `src/timeline.js` and `src/reel.json` (scenes,
  captions with their word times, sound cues). Never edit `index.html` by hand.
- `npx hyperframes@0.8.162 check`, then `render` (set `HYPERFRAMES_BROWSER_PATH` to the headless shell), then strip
  the file's tags: `ffmpeg -i raw.mp4 -map_metadata -1 -c copy simple-logos-reel.mp4`.

## Credits

- Sounds: only the user's own pack. No music.
- Photos: the apple (Red Delicious, public domain), the bronze bull (Spurlock Museum, CC0), the crocodile (Holger
  Krisp, CC BY 3.0), the shell, the woodcut and the compass drawing (CC0); details in `../ig-simple-logos/README.md`.
  The crocodile needs its credit in the caption.
- Logos: trademarks of their owners, shown to talk about them.
