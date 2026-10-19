# «علّق كورس»: the viZion free-trial reel (HyperFrames)

A 22 s reel at 1080×1920 for the viZion page. It ends on «علّق بـ «كورس»» so commenters get the free trial in DMs.
The copy is the user's own (19 Oct). The look is the viZion page's, not the @allawi.psd paper look: the user asked
for "my viZion page style" after seeing the first stills. Navy-to-blue fields with pinstripes, soft blue glows, the
VZ mark (mint, plus big faint outlines), Readex Pro with cyan gradient words, glass cards with a white edge, a cyan
send button, the selection box with handles and the pixel cursor. All of it comes from
`../vizion-results-carousel`. The motion follows `../hf-one-second-reel`: one take, a camera moving down one long
canvas, words popping out of a blur, big lines slamming in sideways.

- `renders/vizion-trial-reel.mp4`: the draft with sound effects; no voice, no music (H.264, 30 fps, 10 Mbps).
- `caption.txt`: the post caption.
- `stills/stills.jpg`: the three approved frames (`stills/render.cjs` redraws them from `index.html`).

| Time | On screen |
|---|---|
| 0–6.3 | «تجيك رسائل هواي..», three DMs pop in («شكد السعر؟», «عاشت إيدك، من أقرر أراسلك», «شدعوة هلگد غالي؟»); «ومحد يشتري؟» hits and the DMs grey out; «الخلل مو بسعرك.. الخلل بطريقة ردك وإعلانك!» with a selection box and a click |
| 6.3–7.2 | camera down, his Flash Transitions 19 on the move |
| 7.2–13.7 | card «كورس viZion / يحول الرسائل إلى طلبات حقيقية.»; four cards «أسرار الاستهداف», «صناعة العروض», «فن الإقناع», «مضاعفة الأرباح»; «يوقف خسارتك / ويضاعف مبيعاتك» slam in |
| 13.7–14.6 | camera down, his Flash Transitions 6 on the move |
| 14.6–22 | «تريد تجربة مجانية للكورس؟», «علّق بـ» slams in; the comment box, «كورس» typed a key at a time, the cursor taps send; «ونرسلك التجربة المجانية بالخاص.»; the VZ mark |

## Build

- `../sfx-pack/fetch.sh` and `../transitions-pack/fetch.sh`, then `./sfx.sh`. It copies the sounds into
  `assets/sfx` (not committed). The two flash clips go to `assets/tr` (not committed), cropped to 9:16:
  `ffmpeg -i "../transitions-pack/files/Flash Transitions 19.mp4" -an -vf "scale=-2:1920,crop=1080:1920,fps=30" -c:v libx264 -pix_fmt yuv420p -crf 16 assets/tr/flash19.mp4`
  (and the same for `6` → `flash6.mp4`).
- `python3 build.py` writes `index.html` from `src/template.html` (layout, copy), `src/timeline.js` (motion; every
  cue is in its `T` table, which build.py also reads for the sounds and the flash start times),
  `src/vz-symbol.svg` (the traced mark) and `assets/fonts/fonts.css`. Never edit `index.html` by hand.
- `npx hyperframes@0.8.162 check`, then `npx hyperframes@0.8.162 render --video-bitrate=10M -o renders/vizion-trial-reel.mp4 .`,
  with `HYPERFRAMES_BROWSER_PATH` set to the headless shell. To grab a frame by script, seek with callbacks on:
  `__timelines.main.seek(t, false)`. The camera and the typing are driven from an onUpdate.

## Sound

Only his pack: a pop on every word (the smooth pops on the cyan key words), a ding per DM, a flick and a pop on each
slam, whooshes peaking on the two flashes, a key click per letter of «كورس», and a click with «Ui Enter» on send. No
music. There is no voice-over yet. If the user records one, fit it the way `../hf-one-second-reel/voice_fit.py` does
and move the `T` cues to his words.

## Honesty

Every line is the user's own copy. The four cards name course parts he listed. The DMs are illustrations of typical
questions, not real chats. There are no prices and no results.
