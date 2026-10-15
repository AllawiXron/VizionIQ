# «ثانية وحدة»: the allawi.psd sales reel, v3 (HyperFrames)

A 30 s reel at 1080×1920 that turns viewers into DMs. It is modelled on a reference the user sent (a designer's 68 s
voice-led reel: flat colour fields, word-by-word captions, designs popping in), made shorter and built to sell: the
hook is shown, not said; each point is proved on one of his designs; the price is out loud; and the ask is one word
in the DM. Why it is built this way: `BRIEF.md`. The user records the voice himself: `VOICE-SCRIPT.md`.

- `renders/one-second-reel.mp4`: the reel with sound effects, no voice and no music (H.264, 30 fps, 13 MB).
- `renders/one-second-reel-cover.jpg`: a cover frame.
- `caption.txt`: the post caption (prices from his highlights; the unofficial-ads note).

| Time | Scene | On screen |
|---|---|---|
| 0–3.4 | ink | A phone feed scrolls fast (motion-blurred) under «زبونك يقرّر بـ ثانية وحدة», then «يوقف.. لو يعبر؟» |
| 3.4–7.6 | paper | Dull, made-up posts (sale, follow us, opening, delivery, offer, Friday) get flicked away: «وأغلب البوستات.. تنعبر.», «لأن ما بيها شي يوقّفك.» |
| 7.6–9.8 | orange | A long flick stops dead on his quzi post; a double-tap heart: «إلا هيچ بوست.», «ليش؟ بيه ٣ شغلات» |
| 9.8–13 | ink | ١ «فكرة وحدة.. تنفهم بثانية.»: the Asiacell ad, «النت ما طفى» circled |
| 13–16.2 | paper | ٢ «حچي بلهجة زبونك.»: the Pepsi ad, «نگول ببسي» circled |
| 16.2–19.4 | orange | ٣ «وسبب يخلّيه يطلب هسه»: the lab ad, the «وفّر ١٥ ألف» badge circled |
| 19.4–24.2 | ink | Seven of his designs fly in and stack: «وهذا بالضبط اللي أسويه لمشروعك.»; then the price card «٣ بوستات بـ ٤٠ ألف», «يعني البوست تقريباً بـ١٣ ألف» |
| 24.2–30 | orange | «دز كلمة «بوست» بالدايركت»; «بوست» is typed in a DM bar and sent; his reply «هلا! هاي نماذج من شغلي بنفس مجالك» with four samples; @allawi.psd |

## Build

- `./sfx.sh` copies the 21 sounds and 6 transition clips this reel uses from the user's own packs (`../sfx-pack`,
  `../transitions-pack`; run their `fetch.sh` first) into `assets/sfx` and `assets/tr` (neither is committed).
- `python3 build.py` writes `index.html` from `src/template.html` (layout, copy), `src/timeline.js` (motion; every cue
  is in its `T` table) and the sound cue list in `build.py`. Never edit `index.html` by hand.
- `npx hyperframes@0.8.162 check`, then `render`. Set `HYPERFRAMES_BROWSER_PATH` to the headless shell on this machine.

## When the voice comes in

Place it as `assets/voice.wav` (an `<audio>` cue in `build.py` at 0), move the `T` cues in `src/timeline.js` and the
matching sound cues in `build.py` to his words, and re-render. Keep the sound effects at their low levels under it.

## Credits and honesty

- Sounds: only the user's own pack. Transitions: only the user's own flash clips, screen-blended over the cuts.
- The brand ads (Asiacell, Pepsi, Qi Card, Iraqi Airways, talabat) are his unofficial concepts and are labelled so on
  screen; photo credits are in `../brand-ads-2026/README.md`. Quzi and the lab are his sample designs.
- The dull posts in the feed are made up for the reel and show no real shop.
