# «علّق كورس»: the viZion free-trial reel (HyperFrames)

A 26.4 s reel at 1080×1920 for the viZion page. It ends on «علّق بـ «كورس»» so commenters get the free trial in DMs.
The copy is the user's own (19 Oct).

## v2 (19 Oct): made to look made by hand, after the user's reference

The user called v1 "ai slop" (glass cards, gradient text, UI pills). They want people to believe a person made it,
because the caption will reveal it as a prank: Claude made it. They sent a reference reel (a motion designer's
"Ever wonder?" piece) and said they love its "low frames … laggy but with motion blur" motion. Studied frame by frame:

- **Motion on twos with real blur:** the reference holds each frame twice (15 fps inside 30) and smears every fast
  move. Here the page renders at 120 fps and `post.sh` averages each 8 frames (a 1/15 s shutter), keeps 15 fps and
  doubles it to 30. A whip or a fly-in therefore smears along its real path, not with a fake blur filter.
- **Real objects on a studio wall:** a soft grey wall with a vignette, a navy floor in some shots, and one real-looking
  object per shot with its shadow on the wall. Every object is modelled and rendered for this reel in Blender
  (`props/props.py`, lit by Poly Haven's CC0 «Studio Small 09» HDRI): speech bubbles, a paper price tag, a megaphone,
  a parcel, a target with a dart, a gift box, a horseshoe magnet, gold coins, and the VZ mark in 3D. No stock or
  Pinterest images.
- **Type like an editor's:** a few words per shot. Heavy Lalezar is mixed with Aref Ruqaa script for the turn of a
  line (like the reference's condensed caps with "Magic" in script). Readex Pro sets the small words, the big words
  slam in out of a blur, and «يشتري؟» gets a floor reflection.
- **A handheld stage:** the whole frame drifts a little and kicks on each slam.
- viZion's colours stay: navy, blue and the logo's yellow, with a dark navy shot for «كورس viZion».

- `renders/vizion-trial-reel.mp4`: the draft with the voice-over and his sound effects; no music (H.264, 30 fps on
  twos, 10 Mbps).
- `caption.txt`: the post caption, with the prank reveal line at the end.

| Time | Voice / shot |
|---|---|
| 0–1.6 | «تجيك رسائل هواي..»: the title, three 3D DMs fly up |
| 1.6–2.5 | «ومحد يشتري؟»: it slams in with a floor reflection; the DMs drop out of frame |
| 2.7–4.1 | «الخلل مو بسعرك..»: a paper price tag swings in; the price is struck through |
| 4.1–7.1 | «الخلل بطريقة ردّك وإعلانك!»: the navy floor comes up, a megaphone flies in |
| 7.1–10.8 | his flash 19 into dark navy, «كورس فيجن.. يحوّل الرسائل إلى طلبات حقيقية.»: the 3D VZ mark, yellow glowing script, a parcel |
| 11.1–16.1 | the four, each on its word: target, gift, magnet, coins |
| 16.4–19.1 | «يوقف خسارتك.. ويضاعف مبيعاتك.»: coins grow out of the floor |
| 19.2–26.4 | his flash 6, «تريد تجربة مجانية للكورس؟ علّق بكلمة «كورس».. ونرسلك التجربة المجانية بالخاص.»: «علّق بـ» slams in, the blue bubble, «كورس» typed on the word, the mark |

## Voice-over (19 Oct)

The user's ElevenLabs take (Arafat Almnshid voice, 25.5 s) is kept whole and untouched: one fixed gain to peaks of
−1.5 dB and 30 ms fades (the command is in `build.py`). It lives in `assets/voice.wav`, which is not committed. The
visuals were moved to it, not the voice to the visuals. Word starts come from faster-whisper medium (decode the MP3
with ffmpeg first: the installed PyAV doesn't take faster-whisper's arguments). They are snapped to the end of the
pause before them (`silencedetect` at −40 dB), every pop lands on its word, and every shot changes inside the pause
between two lines. The hook is only 1.4 s of voice, so the DMs stay on screen until «يشتري؟» lands and then drop out
of frame. Under the voice the effects play at 70 % of their old levels.

## Build

1. Sounds and transitions: `../sfx-pack/fetch.sh`, `../transitions-pack/fetch.sh`, then `./sfx.sh`. Crop the two
   flashes to 9:16 into `assets/tr` (not committed):
   `ffmpeg -i "../transitions-pack/files/Flash Transitions 19.mp4" -an -vf "scale=-2:1920,crop=1080:1920,fps=30" -c:v libx264 -pix_fmt yuv420p -crf 16 assets/tr/flash19.mp4`
   (and `6` → `flash6.mp4`).
2. Props (committed in `assets/props`). To redo them, fetch the CC0 HDRI with
   `curl -L -o props/hdri/studio.hdr https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/studio_small_09_2k.hdr`
   (not committed), then run `blender -b -P props/props.py -- renders/props-raw [name ...]` with Blender 4.2 (set
   `SAMPLES=48` for speed) and `python3 -I props/finish.py renders/props-raw assets/props`.
3. `python3 build.py` writes `index.html` from `src/template.html`, `src/timeline.js` (every cue is in `T`, which
   build.py also reads for the sounds and the flash start times) and `assets/fonts/fonts.css`. Never edit
   `index.html` by hand. `DUR=7.5 python3 build.py` makes a short test cut.
4. Render at 240 fps, then blend it down:
   `npx hyperframes@0.8.162 render --fps 240 -o renders/raw-240.mp4 .` (with `HYPERFRAMES_BROWSER_PATH` set to the
   headless shell), then `./post.sh renders/raw-240.mp4 renders/vizion-trial-reel.mp4`. At 120 fps the fastest moves
   showed stepped copies; 240 fps with 16 frames blended (plus a CSS blur while things travel) smears smoothly.
   To grab a frame by script, seek with callbacks on: `__timelines.main.seek(t, false)`.

## Sound

Only his pack: a pop on every word (the smooth pops on the script and key words), a whoosh on every fly-in and whip,
a flick and a hit on each slam, a ding per DM, a select on the strike and the yellow bar, a key click per letter of
«كورس», and whooshes peaking on the two flashes. No music.

## Honesty

Every line is the user's own copy. The four shots name course parts he listed. The DMs illustrate typical questions;
they are not real chats. There are no prices or results. Every object is modelled for this reel. The HDRI is CC0
(Poly Haven).
