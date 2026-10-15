# «ثانية وحدة»: the allawi.psd sales reel, v3 (HyperFrames)

A 38 s reel at 1080×1920 that turns viewers into DMs, cut in the editing style of a reference the user sent (a
designer's 68 s voice-led reel). The user records the voice himself: `VOICE-SCRIPT.md`. Why: `BRIEF.md`.

- `renders/one-second-reel.mp4`: the reel with sound effects, no voice and no music (H.264, 30 fps, 10 Mbps).
- `renders/one-second-reel-cover.jpg`: a cover frame.
- `caption.txt`: the post caption (his services, no prices; the unofficial-ads note and photo credits).

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
caption (Aref Ruqaa stayed for the handwriting until v8); it has no «چ», so the screen says «هيج» and «حجي». «ليش؟» used to be
followed by «٣ شغلات» 0.7 s later ("appears fast right after"): now «ليش؟» lands alone and hangs for 1.35 s with the
disc pulsing, then «بيه», then «٣ شغلات» on its own beat (the move to the wall starts 0.35 s later to make room).

**v7 → v8 (15 Oct).** "make the handwritten lines DG Sahabah too, dont say the prices … use a sfx for each word pop
up … look for it in the sfx google drive … it looks grainy, also please use some premium png stuff like png editing pack
maybe look in pinterest".

- **Font:** the handwritten lines, the kraft tags, «ونبدي بمشروعك.», the «؟» disc and the bar's "1s" are DG Sahabah
  now; Aref Ruqaa is gone from the reel.
- **No prices:** the price scene is now what he makes, from his price highlight: four torn labels pinned to the rust
  sheet («بوستات»، «ستوريات»، «منيو»، «شعار»), then «وهوية كاملة.» slams in. The caption lists his services instead of
  the bundles.
- **A sound on every word:** his Drive folders hold the same 127 sounds as `../sfx-pack` (checked again 15 Oct), but
  two of his pop files hold several pops each («Normal Pop»: five, «Premium And Smooth Pop»: four). `sfx.sh` cuts them
  apart, and `build.py` puts one on every word as it pops up (the five plain pops in turn; the four smoother ones on the
  coloured key words), read straight from the `T` table, so they stay on the words when the timing moves. Words now pop
  (a small overshoot in scale) as well as coming out of the blur.
- **Less grain:** the film grain went from .32 to .07 and no longer moves every frame; the paper texture is lighter
  (.2, rust .26) and the vignette softer; the file is encoded at 10 Mbps instead of 6.
- **Props instead of Pinterest PNGs:** PNG packs on Pinterest are mostly other people's paid or copyrighted packs, so
  everything here is made for this reel: paper clips, map pins, a binder clip, a pencil and a mug of coffee rendered
  top-down in Blender with real soft shadows (`props/props.py`, `props/finish.py`); masking tape made from noise
  (`props/tape.py`); and real torn paper for every strip and label, drawn in the page at its own size, with the white
  fibres along the tear (`tear()` in `src/timeline.js`). The mug and pencil frame the hook; clips and a pin hold the
  strips; tape, pins and a binder clip hold the prints on the wall; the labels are pinned.

**v8 → v9 (15 Oct).** "make the highlight text better, because its just static highlighting, also instead of راسلني
say راسلنا". The highlight on each of the three lines is now drawn by a highlighter pen (his own render, like the other
props): it comes in from the lower right, lands on the key words, strokes right to left (each highlighted word bumps as
the tip passes it), strokes back a little lower, then lifts off and leaves, its shadow drifting away as it lifts. The
ink is real marker ink, drawn at its own size (`inkStroke()` in `src/timeline.js`): streaks along the stroke, darker
edges, a blot where the tip lands, a chisel-cut end, two passes overlapping darker. Sounds: a soft whoosh as it comes
in, a tick as it lands, his two «Ui Granular, Button, Select» for the two strokes. The ask says «راسلنا» on screen, in
the voice script and in the caption.
Then, at his request, «وهذا بالضبط اللي أسويه» became «… نسويه» to match.

| Time | Camera | On screen |
|---|---|---|
| 0–4.7 | close on a paper sheet, easing back | «زبونك يقرّر / بثانية وحدة.», «يوقف على بوستك.. لو يعبره.», a one-second bar fills |
| 4.7–10.0 | down to a rust sheet | the phone, its feed flying past; torn strips «وأغلب البوستات.. تنعبر.», «لأن ما بيها شي يوقّفك.» |
| 10.0–11.6 | push in | the scroll stops on his quzi post, a heart; strip «إلا هيچ بوست.» |
| 11.3–14.75 | across to the desk | «؟» disc with a ripple, «ليش؟» alone, a pause, then «بيه / ٣ شغلات» |
| 14.75–25.0 | into the wall, three stops | Asiacell, Pepsi and lab prints among nine; a kraft tag, a tick, a handwritten line, and a highlighter pen that marks the key words |
| 25.0–29.0 | pull back over the wall | all nine of his designs; strip «وهذا بالضبط اللي نسويه / لمشروعك.» with the unofficial-ads note |
| 29.0–32.6 | dive into a rust sheet | four pinned labels «بوستات»، «ستوريات»، «منيو»، «شعار», then «وهوية كاملة.» slams in |
| 32.6–38 | down to the last sheet | strip «عجبك الشغل؟», «راسلنا» slams in, «بالدايركت..», «ونبدي بمشروعك.», a paper plane; a button, a click, «@allawi.psd» |

## Build

- `./sfx.sh` copies the 25 sounds this reel uses from the user's own pack (`../sfx-pack`; run its `fetch.sh` first)
  into `assets/sfx` (not committed); nine of them are single pops cut out of his two multi-pop files.
- `assets/props/` holds the rendered props and tape (committed). To redo them: `props/props.py` in Blender 4.2, then
  `props/finish.py` (joins each shadow and object pass at one shadow strength); `props/tape.py` for the tape.
- `python3 build.py` writes `index.html` from `src/template.html` (layout, copy), `src/timeline.js` (motion; every cue
  is in its `T` table) and the sound cue list in `build.py`. Never edit `index.html` by hand.
- `npx hyperframes@0.8.162 check`, then `render`. Set `HYPERFRAMES_BROWSER_PATH` to the headless shell on this machine.

## When the voice comes in

Place it as `assets/voice.wav` (an `<audio>` cue in `build.py` at 0), move the `T` cues in `src/timeline.js` and the
matching sound cues in `build.py` to his words, and re-render. Keep the sound effects at their low levels under it.

## Credits and honesty

- Sounds: only the user's own pack. No music.
- Props, tape and torn paper: made for this reel (Blender renders and noise), no stock or Pinterest images.
- The brand ads (Asiacell, Pepsi, Qi Card, Iraqi Airways, talabat) are his unofficial concepts and are labelled so on
  screen; photo credits are in `../brand-ads-2026/README.md`. Quzi and the lab are his sample designs.
- The posts in the feed are plain made-up placeholders (colour blocks); they show no real shop.
