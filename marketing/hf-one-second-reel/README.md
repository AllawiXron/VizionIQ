# «ثانية وحدة»: the allawi.psd sales reel, v3 (HyperFrames)

A 38 s reel at 1080×1920 that turns viewers into DMs, cut in the editing style of a reference the user sent (a
designer's 68 s voice-led reel). The user records the voice himself: `VOICE-SCRIPT.md`. Why: `BRIEF.md`.

- `renders/one-second-reel.mp4`: the reel with sound effects, no voice and no music (H.264, 30 fps).
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

| Time | Scene | On screen |
|---|---|---|
| 0–2.0 | paper/rust/brown flips | «زبونك» «يقرّر» «بثانية» «وحدة.», one word per beat |
| 2.0–4.9 | rust | «يوقف على بوستك.. لو يعبره.», a one-second bar fills |
| 4.9–10.0 | paper | whip-pan; a tilted phone rises, the feed flies past; torn strips «وأغلب البوستات.. تنعبر.», «لأن ما بيها شي يوقّفك.» |
| 10.0–12.3 | brown | the scroll stops on his quzi post, a double-tap heart; strip «إلا هيچ بوست.»; zoom-through |
| 12.3–14.4 | rust | «؟» disc with a ripple, «ليش؟ بيه / ٣ شغلات»; the disc opens into a circle reveal |
| 14.4–24.6 | paper | Asiacell, Pepsi and lab prints (tape, kraft tag) swap above a handwritten list: «فكرة وحدة تنفهم بثانية», «حچي بلهجة زبونك», «وسبب يخلّيه يطلب هسه», a tick and a highlighter on each |
| 24.6–28.6 | brown | whip-pan; seven prints fly into a collage under the strip «وهذا بالضبط اللي أسويه / لمشروعك.»; zoom-through |
| 28.6–31.9 | rust | «٣ بوستات», «بـ ٤٠ ألف» slams in, «يعني البوست تقريباً بـ١٣ ألف»; a dot opens into the last scene |
| 31.9–38 | paper | strip «عجبك الشغل؟», «راسلني» slams in, «بالدايركت..», «ونبدي بمشروعك.», a paper plane; a button, a click, «@allawi.psd» |

## Build

- `./sfx.sh` copies the 18 sounds this reel uses from the user's own pack (`../sfx-pack`; run its `fetch.sh` first)
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
