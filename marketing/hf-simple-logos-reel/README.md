# Six everyday things that became logos (reel)

A 66 s reel at 1080×1920 made from the `../ig-simple-logos` carousel, with my identity: DG Sahabah, my colour worlds, my
cut-out objects and my own sound pack. Its motion follows an After Effects project I was sent (comp «01», read
keyframe by keyframe), described under Motion. The voice is the user's ElevenLabs take of `../ig-simple-logos/voice-script-v3.txt`.

The script follows hook, lead, body 1, open loop, body 2, open loop, body 3, CTA:

| Time | Line | On screen |
|---|---|---|
| 0–3 | hook: أي طفل يقدر يرسم أشهر الشعارات بالعالم | letters come out of a blur; Apple, Shell and Lacoste spring in |
| 3–7.7 | lead: تفاحة، تمساح، صدفة، ثور.. أشياء تشوفها كل يوم | one hero object per word, whipped in and out; then the others burst in around the bull |
| 7.7–10 | بس ليش هاي صارت شعارات ما تنسى | red; the Apple logo drops in trailing echoes |
| 10–12.3 | وشعار مشروعك محد يتذكره | paper; «يتذكره» falls apart into specks of ink |
| 12.3–15.4 | خليك للآخر، لأن السر بتفصيلة وحدة | a black apple shape flies in spinning, lands, shakes, gets knocked out |
| 15.4–20.7 | body 1: Lacoste | green; the crocodile; the logo springs in, punches on «التمساح» |
| 20.7–24.7 | body 1: Shell | yellow; the shell rises; the logo |
| 24.7–27.2 | يعني الفكرة طلعت من قصة صاحبها | the two logos slapped on a paper wall as prints |
| 27.2–29.5 | open loop: بس هذا مو أغرب شي بالموضوع | black, a small shake |
| 29.5–33.1 | body 2: Starbucks | the old woodcut in a frame; the logo on a disc |
| 33.1–36 | body 2: Red Bull | two bronze bulls charge in and collide, the sun comes up, the logo |
| 36–40.7 | body 2: Mastercard | a compass drawing; two circles bounce in apart, slide into each other, the overlap turns orange |
| 40.7–46.3 | open loop: والأغرب.. شعار يمكن بإيدك هسه، ناقص منه قطعة، وعلى قصد | black; a giant logo out of focus racks in, the camera travels to the bite |
| 46.3–53.9 | body 3: the bite | the real apple drops in; on «قص» the bite is taken out of it; the logo beside it |
| 53.9–58.8 | الشي البسيط.. والتفصيلة الوحدة | the six things bounce in, then each flips into its logo |
| 58.8–66.6 | CTA: اكتب مشروعك بالتعليقات | orange; the ask; @allawi.psd |

## Motion

Taken from the After Effects project, with its numbers:

- Camera: every shot has a camera on two nulls (zoom 1050). The inner null starts off its mark and settles over the shot
  (ease: outgoing influence 0, incoming 100). The outer null holds, then speeds into the cut (outgoing 100, incoming
  0.01). Some shots add a slow drift between the two (33 / 100). `RIG` in `src/timeline.js` lists each shot's moves in
  the project's units; push-ins stay under 220 so the captions fit. The colour world behind moves a third as much.
- Cuts: hard cuts with a 0.3 s blur pulse centred on the cut (Fast Box Blur radius 0, 6, 0, linear).
- Motion blur: a 1/30 s shutter. The camera's move blurs the whole frame; every object that moves (the cut-outs, logos,
  prints, the circles) gets its own blur along its own move, measured from where it was at the start of the shutter.
- Text: TextEvo. Each letter fades in out of a blur on the same one-second curve, 4.8 frames (0.048 s) after the one
  before, starting on its word in the voice. The letters stay joined.
- Pop-ins: Smart Bounce (elastic, amplitude 50, frequency 2, decay 4): scale 0 to 100 in 0.16 s, rotation 20° to 0 in
  0.09 s, then the overshoot.
- Look: the whole frame steps like the project's Posterize Time, at 15 fps rather than 12: on a 30 fps video every step
  then holds exactly two frames, where 12 fps gave an uneven 3, 2, 3 that read as lag. A grunge texture sits over
  everything on multiply at 50 % with its exposure raised. `POSTER` and `SHUTTER` in `src/timeline.js` set both.

## Build

- `./sfx.sh` copies the sounds used from `../sfx-pack` (run its `fetch.sh` first) into `assets/sfx` (not committed).
- `python3 voice_fit.py assets/voice-take.mp3 src/words-raw.json` writes `assets/voice.wav` (not committed): every pause
  longer than 0.35 s is cut down, nothing else is changed (one fixed gain, 30 ms fades). It also writes
  `src/words.json`, the word times on the new clock, which the cues in `src/reel.json` follow.
- `python3 build.py` writes `index.html` from `src/template.html`, `src/timeline.js` and `src/reel.json` (scenes,
  captions with their word times, sound cues). Never edit `index.html` by hand.
- `npx hyperframes@0.8.162 check`, then `render` (set `HYPERFRAMES_BROWSER_PATH` to the headless shell), then strip
  the file's tags: `ffmpeg -i raw.mp4 -map_metadata -1 -c copy simple-logos-reel.mp4`.

## Cover

`cover.html` is the reel's cover (1080×1920, the text inside the 3:4 crop the profile grid shows): the red world, the
word عضة and the real apple with its bite standing on it. `assets/obj/apple-cover.png` is the apple with its edge pulled
in a few pixels so no fringe shows at that size. The render is `renders/cover.png`.

## Credits

- Sounds: only the user's own pack. No music.
- Photos: the apple (Red Delicious, public domain), the bronze bull (Spurlock Museum, CC0), the crocodile (Holger
  Krisp, CC BY 3.0), the shell, the woodcut and the compass drawing (CC0); details in `../ig-simple-logos/README.md`.
  The crocodile needs its credit in the caption.
- Logos: trademarks of their owners, shown to talk about them.
