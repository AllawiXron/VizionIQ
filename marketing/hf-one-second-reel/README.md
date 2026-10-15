# «ثانية وحدة»: the allawi.psd sales reel, v3 (HyperFrames)

A 38 s reel at 1080×1920 that turns viewers into DMs, cut in the editing style of a reference the user sent (a
designer's 68 s voice-led reel). The user records the voice himself: `VOICE-SCRIPT.md`. Why: `BRIEF.md`.

- `renders/one-second-reel.mp4`: the reel with sound effects, no voice and no music (H.264, 30 fps, 6 Mbps, 30 MB).
- `renders/one-second-reel-cover.jpg`: a cover frame.
- `caption.txt`: the post caption (prices from his highlights; the unofficial-ads note and photo credits).

**v1 → v2 (15 Oct).** The first cut (pills, marker circles, a cartoon phone feed, flash transitions, grain) was
rejected: "it looks like ai slop … make it … as if it was made by an editor just like the video i sent you … learn from
the video how they do the stuff like text, transitions". v2 copies the reference's grammar, studied frame by frame:

- flat fields that flip on the beat (orange / cream / black, his colours in place of the reference's blue);
- one calm Arabic face (IBM Plex Sans Arabic, the closest we have) at the reference's sizes, words coming out of a
  blur, one key word in colour; no boxes;
- a big word that slams in sideways with motion blur; whip-pans with motion blur; a dot or icon that opens into a
  circle reveal; zoom-through exits; a phone-style text selection with handles; a small icon with a ripple;
- his designs as rounded cards with soft shadows, a list that builds up under a card that swaps, a collage that flies in
  from the edges; a tilted phone with a motion-blurred feed;
- the ending: a round button, a cursor clicks it, it opens into a pill with his handle.

The user's flash clips (`../transitions-pack`) are not used here: the user asked for the reference's transitions.

**v2 → v3 (15 Oct).** "it looks rushed". Re-paced to the reference: ~0.28 s between words (was 0.14), a pause after
every line, scenes that hold 3–4 s, longer and softer moves; 30 s → 45 s with the same script.

**v3 → v4 (15 Oct).** "Make it 38 seconds", end on a plain "DM me" instead of a keyword, and use his own colours and the
style of his highlights: the flat cream / orange / black looked like "Claude motion". v4 takes the highlights' recipe
(`../ig-highlights`: paper, brown and orange fields under the paper texture, grain and vignette; torn Alexandria strips;
taped prints with kraft tags; Aref Ruqaa handwriting; a highlighter and marker ticks) and keeps the reference's motion.
The ending is «عجبك الشغل؟ راسلني بالدايركت.. ونبدي بمشروعك.» with a hand-drawn paper plane and the button that opens
into @allawi.psd.

**v4 → v5 (15 Oct).** "make the video one-take". No cuts: the whole reel is laid out on one desk (the highlights'
brown, with paper and rust sheets on it) and a single camera travels across it. `MOVES` in `src/timeline.js` lists every
move; a move eases in and out, rolls a few degrees at its middle and blurs along its direction (an SVG blur on the whole
frame, set from the camera's speed every frame), and holds drift in a little. Every station is a 1080×1920 box on the
desk, so at camera scale 1 it fills the frame; the wide shot's caption is drawn at screen size and scaled up.

**v5 → v6 (15 Oct).** "it looks so bad and rushed in some clips", still 38 s. A frame-by-frame pass on v5 found: the
camera landing on empty sheets before the text started, strips showing blank, a choppy four-pan hook, every move
smearing the frame, a sparse wide shot of tiny prints, and the placeholder posts readable in the phone. v6: every
frame the camera lands on is already composed (text starts as it arrives); fewer, longer moves with a sine ease and a
light blur (at most 22 px); the hook is one sheet with a slow pull-back; the feed never stops until his post; the three
points are three stops on a full wall of nine of his designs, and the pull-back reveals the whole wall.

**v6 → v7 (15 Oct).** The user's own font, DG Sahabah (`../brand-fonts`), replaces Alexandria for every headline and
caption (Aref Ruqaa stays for the handwriting); it has no «چ», so the screen says «هيج» and «حجي». «ليش؟» used to be
followed by «٣ شغلات» 0.7 s later ("appears fast right after"): now «ليش؟» lands alone and hangs for 1.35 s with the
disc pulsing, then «بيه», then «٣ شغلات» on its own beat (the move to the wall starts 0.35 s later to make room).

| Time | Camera | On screen |
|---|---|---|
| 0–4.7 | close on a paper sheet, easing back | «زبونك يقرّر / بثانية وحدة.», «يوقف على بوستك.. لو يعبره.», a one-second bar fills |
| 4.7–10.0 | down to a rust sheet | the phone, its feed flying past; torn strips «وأغلب البوستات.. تنعبر.», «لأن ما بيها شي يوقّفك.» |
| 10.0–11.6 | push in | the scroll stops on his quzi post, a heart; strip «إلا هيچ بوست.» |
| 11.3–14.75 | across to the desk | «؟» disc with a ripple, «ليش؟» alone, a pause, then «بيه / ٣ شغلات» |
| 14.75–25.0 | into the wall, three stops | Asiacell, Pepsi and lab prints among nine; a kraft tag, a tick, a handwritten line and a highlighter at each |
| 25.0–29.0 | pull back over the wall | all nine of his designs; strip «وهذا بالضبط اللي أسويه / لمشروعك.» with the unofficial-ads note |
| 29.0–32.6 | dive into a rust sheet | «٣ بوستات», «بـ ٤٠ ألف» slams in, «يعني البوست تقريباً بـ١٣ ألف» |
| 32.6–38 | down to the last sheet | strip «عجبك الشغل؟», «راسلني» slams in, «بالدايركت..», «ونبدي بمشروعك.», a paper plane; a button, a click, «@allawi.psd» |

## Build

- `./sfx.sh` copies the 19 sounds this reel uses from the user's own pack (`../sfx-pack`; run its `fetch.sh` first)
  into `assets/sfx` (not committed).
- `python3 build.py` writes `index.html` from `src/template.html` (layout, copy), `src/timeline.js` (motion; every cue
  is in its `T` table) and the sound cue list in `build.py`. Never edit `index.html` by hand.
- `npx hyperframes@0.8.162 check`, then `render`. Set `HYPERFRAMES_BROWSER_PATH` to the headless shell on this machine.

## When the voice comes in

Place it as `assets/voice.wav` (an `<audio>` cue in `build.py` at 0), move the `T` cues in `src/timeline.js` and the
matching sound cues in `build.py` to his words, and re-render. Keep the sound effects at their low levels under it.

## Credits and honesty

- Sounds: only the user's own pack. No music.
- The brand ads (Asiacell, Pepsi, Qi Card, Iraqi Airways, talabat) are his unofficial concepts and are labelled so on
  screen; photo credits are in `../brand-ads-2026/README.md`. Quzi and the lab are his sample designs.
- The posts in the feed are plain made-up placeholders (colour blocks); they show no real shop.
