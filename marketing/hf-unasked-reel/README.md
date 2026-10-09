# «محد طلبها منه»: the allawi.psd sales reel, v2 (HyperFrames)

A 25 s reel at 1080×1920 that sells the user's design packages. It replaces the DM-order reel (`../hf-dm-order-reel`),
which the user rejected as AI-looking and boring. Why this one is built the way it is: `BRIEF.md`.

`renders/unasked-reel-draft.mp4` is the draft with music and sound effects. The user on the draft (9 Oct): "thats a 10/10
post!". Noor's voice is next (`VOICE-SCRIPT.md`); the picture is approved as it is.

| Time | Scene | On screen | Noor (planned) |
|---|---|---|---|
| 0–5 | S1 red cloth | Pepsi is down on frame one; Qi Card, Iraqi Airways, Asiacell and talabat slam on top, one per beat (1.0, 2.0, 2.75, 3.0). The pile is dealt out into a collage (3.25) and on the music's drop each print is stamped «محد طلبه» (4.0–4.6). «إعلانات غير رسمية · فكرة وتصميم @allawi.psd». | «سوّى إعلان لببسي.. ولكي كارد.. وللخطوط العراقية.. ومحد طلبها منه!» |
| 5–10 | S2 dark | «ليش؟» in red marker. The Iraqi Airways ad tilts back and comes apart into its real layers (photo, boarding pass, type, logo), each with a kraft tag; then it closes up and flies out. | «ليش؟ حتى تشوف.. شيگدر يسوّي لمحلك.» |
| 10–14 | S3 paper | Quzi «مطعم», the lab «عيادة», then an empty print with a dashed marker frame: «محلك؟». | «لمطعمك.. لعيادتك.. لأي محل.» |
| 14–20 | S4 green board | A sticky note «السعر.. بالخاص 🤫» is crossed out and ripped off. The price list is pinned and written: ٣ بوستات ٤٠ ألف, ٥ بوستات ٦٥ ألف, باقة شهرية ٩٠ ألف (٨ بوستات + ٤ ستوري); «٣ بوستات» circled. | «والسعر؟ مو بالخاص.. هنا. ثلاث بوستات.. بأربعين ألف بس.» |
| 20–25 | S5 dark | A torn note: «أريد ٣ بوستات» written as she says it, a marker paper plane, @allawi.psd cut out of magazines, `instagram.com/allawi.psd`. Held to the end. | «دزّله بالدايركت: أريد ثلاث بوستات.» |

Every line Noor says is also on screen, on torn paper strips, for people watching muted.

## Build

- `python3 build.py` writes `index.html` from `src/template.html` (layout, copy), `src/timeline.js` (motion; every cue
  is in its `T` table) and the sound cue list in `build.py`. Never edit `index.html` by hand.
- `./music.sh` downloads the track and writes `assets/music/bed.wav` (not committed; see Credits).
- `assets/sfx-kit/` (two whooshes from the HyperFrames kit) is not committed either; copy it from `../hf-dollar-reel`.
- `./drive-sfx.sh` fetches seven sounds from the user's own sound pack on Google Drive into `assets/sfx-drive/` (not
  committed): the riser into the drop (cut at its peak on the first stamp), the whooshes on the cuts, the camera shutter
  on frame one, the cash sound as «٣ بوستات · ٤٠ ألف» is circled, the pops on the tags and the clicks on the handle's
  cut-out letters.
- `python sfx.py` (needs numpy) synthesizes `assets/sfx/rip.wav`, the sticky note tearing off.
- `npx hyperframes@0.8.142 check`, then `render`. Set `HYPERFRAMES_BROWSER_PATH` to the headless shell on this machine.

## Credits

- Music: "Arab Nights" by Arulo, Mixkit free licence (https://mixkit.co/license/#musicFree).
- Photos inside the brand ads: Pepsi can by Ominae (CC BY-SA 3.0), the Baghdad aerial by U.S. DoD / CJCS (CC BY 2.0);
  credit both in the caption (`caption.txt` has it). The other photos are CC0 (see `../brand-ads-2026/README.md`).
- The brand ads are unofficial concepts; none of the brands commissioned them. The logos are their trademarks.
- Paper textures, the rubber stamp style, the ransom-note letters and the paper sound effects come from `../hf-dollar-reel`;
  the riser, whooshes, shutter, cash, pop and click sounds from the user's own pack (`drive-sfx.sh`).
