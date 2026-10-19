# «علّق كورس»: the viZion free-trial reel (HyperFrames)

A 23 s reel at 1080×1920 for the viZion page. It ends on «علّق بـ «كورس»» so commenters get the free trial in DMs.
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

- `renders/vizion-trial-reel.mp4`: the draft (H.264, 30 fps on twos, 10 Mbps) with his sound effects; no voice or
  music.
- `caption.txt`: the post caption, with the prank reveal line at the end.

| Time | Shot |
|---|---|
| 0–2.3 | wall: «تجيك رسائل» + «هواي..» (script); three 3D DMs fly up («شكد السعر؟», «عاشت إيدك، من أقرر أراسلك», «شدعوة هلگد غالي؟») |
| 2.3–3.9 | «ومحد» + «يشتري؟» slams in, with a floor reflection |
| 3.9–5.5 | a paper price tag swings in on its string; «الخلل مو بسعرك..», the price struck through |
| 5.5–7.5 | the navy floor comes up, a megaphone flies in; «الخلل بطريقة ردك وإعلانك!» |
| 7.5–10.5 | his flash 19 into dark navy: the 3D VZ mark turns in; «كورس viZion يحول الرسائل إلى طلبات حقيقية.» (yellow script, glowing), a parcel |
| 10.5–15 | four shots on the floor, 01–04: target «أسرار الاستهداف», gift «صناعة العروض», magnet «فن الإقناع», coins «مضاعفة الأرباح» |
| 15–17.3 | «يوقف خسارتك ويضاعف مبيعاتك», coins grow out of the floor |
| 17.3–23 | his flash 6: «تريد تجربة مجانية للكورس؟», «علّق بـ» slams in, the blue 3D bubble with «كورس» typed in, «ونرسلك التجربة المجانية بالخاص.», the mark |

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
«كورس», and whooshes peaking on the two flashes. No music and no voice-over yet.

## Honesty

Every line is the user's own copy. The four shots name course parts he listed. The DMs illustrate typical questions;
they are not real chats. There are no prices or results. Every object is modelled for this reel. The HDRI is CC0
(Poly Haven).
