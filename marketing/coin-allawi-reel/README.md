# The Orange Coin (ad reel for my page)

My ad reel as one take, in the motion language of the reference the user sent: every scene grows out of the last one,
with no cuts and no crossfades. The concept is one orange coin that carries the viewer from a weak ad to a sale. It
drops into the wallet, flips into the circle that opens the orange world, shrinks into a window and into the icon of
a card, opens the last scene again from the padlock and ends as the dot of @allawi.psd. The last frame is the first,
so the reel loops.

Same script and fitted voice as `../ae-core-reel` (`reel/sound.js`), same cut-outs (from
`../rm-allawi-ad-reel/public/el`). The phone screens play my reels from `../ae-core-reel/media/clips` (VP9 webm). Type: DG Sahabah only. Colours: cream paper, my orange, my brown and white, under
my paper texture.

| Time | Line | Technique | On screen |
|---|---|---|---|
| 0–2.8 | مشروعك متعوب عليه، بس أرباحك قليلة | kinetic type | words out of a blur on cream; the coin drops into the wallet; «قليلة؟» stamped on it and held before anything moves |
| 2.8–5.2 | عدنا نصمملك موشن جرافيك وبوستات إعلانية | iris | at 2.8 the orange opens from the wallet and fills the frame; a white block wipes in from right to left and «موشن جرافيك» lands whole inside it once the block is open; the film camera; a hand brings the box |
| 5.2–7.7 | تحجي بقوة براندك، وتبيع بمكانك | shape morph | the megaphone blasts «براندك» out; the orange shrinks to a window with the shop owner in it and closes |
| 7.7–12.6 | حركة تشد العين، فكرة تقنع الزبون، ونتيجة ترفع مبيعاتك | camera over the page | giant «حركة» with the binoculars, the camera drops to «تشد العين», whips left to the bulb and «فكرة تقنع الزبون», then pulls back to «ونتيجة» and «ترفع مبيعاتك» on one line over the register and the bag |
| 12.6–14.4 | من أول 3 ثواني بإعلانك | 2D to 3D | the page tilts flat into a floor and a giant 3 stands up off it |
| 14.4–16.3 | الزبون راح يلمس الكواليتي العالي | lens | the whole phrase «الكواليتي العالي» sits soft and half-faded on the page; inside the glass ring it is sharp and 1.15 times larger (two copies, the sharp one clipped to the glass) |
| 16.3–19 | يثق بمنتجك، ويدخل يطلب منك مباشرة | diagonal wipe | a diagonal orange panel sweeps in; the handshake |
| 19–23.5 | لأن ويانا راح يطلع إعلانك بمستوى يعزلك تماما عن منافسيك | wipe back | the king stays and the pawns slide to the edges |
| 23.5–26.5 | ويخلي الزبون يشتري منك مرة ومرتين وعشرة | dark stage | the brown opens from the bag; one bag on «مرة», the camera pulls back and two more spring in on «ومرتين», then pulls back again as the bags spread in a deep arc behind a huge «وعشرة» |
| 26.5–28.5 | لأن شاف براند حقيقي قدامه | iris | the cream opens over the dark stage: the man with binoculars |
| 28.5–35.5 | كافي تضيع جمهورك… توقف الزبون وتقفل وياه البيعة | kinetic type | the crowd rises in and pans slowly one way, right to left, at one pace, while the camera pushes in on the words; at 32.5 the stop hand slams up from the bottom and the frame shakes; the padlock |
| 35.5–41.2 | تواصل ويانا بالخاص، شوف أعمالنا، وخلي براندك يبيع صح | end title | the circle opens from the padlock; on «شوف أعمالنا» three tilted phones fan up from the bottom playing my own reels; «وخلي براندك يبيع صح» above them; then the circle shrinks to the dot of @allawi.psd and back to the first frame |

## How it is built

- `reel.html`: every style is computed from `t` inside `drawFrame(t)`; `window.seek(t)` draws it and waits for the phone videos to land on their frame, with no CSS animation, no timers and no state
  between frames. Each element has a life and a `pose(t)`. Moves use springs (damped to land without bouncing) and
  exponential eases written as functions of time. Blur comes from how far an element moved in one frame on each axis,
  so it follows its speed and direction. The camera pushes a little on every word of the voice and settles back.
- `render.cjs`:
  - `beats` writes one frame per word of the voice as a contact sheet to check first;
  - `stills <t…>` writes single frames;
  - with no argument it renders at 60 fps with 3 subframes per frame, averages them with ffmpeg `tmix` for motion
    blur, mixes the voice and the cues and writes `out/allawi-orange-coin.mp4` (no tags).

  Run it with `NODE_PATH` pointing at a folder that has playwright-core. The sounds come from `../ae-core-reel/media/audio`
  (its `tools/assets.sh`).

## Sound design

`sfx.js` holds the cue list and `StudioSoundEngine`, which makes every sound with Web Audio on six tracks:

| Track | What it is | Where |
|---|---|---|
| Whoosh 1 | pink and brown noise through a band-pass sweeping 180 to 950 Hz and back, played at 82.76%, with a low body | the wallet, the megaphone, the camera moves over the page, the pawns leaving, the crowd (a slow pan from right to left) |
| Whoosh 3 | pink noise through a band-pass sweeping 830 to 3900 Hz, at 118.92% | the box, the binoculars, the magnifier, the man with binoculars, the way to the end card; a short bright swipe on the white block |
| FireWhoosh | pink and brown noise under a low-pass that opens to 2.6 kHz and closes, with a light crackle and a low body | every full-screen colour change: the orange, the diagonal panel, the dark stage, the page coming back, the last orange |
| Counting 8 | eight soft ticks, tick and tock a little apart in pitch and a little off the grid | the first words, «موشن جرافيك», the register; at stopwatch pace next to the 3 |
| Deep | a sine dropping from 120 to 50 Hz, a triangle an octave up so phone speakers carry it, a soft knock | the stamp, the shop owner, the bulb, the handshake, the ten bags, the stop hand |
| UI Pop | marimba plucks (a sine that drops onto its note and a fast bright partial), cascades 60 ms apart rising 0, 2, 4, 5 semitones, and the tactile sounds: cursor click, slap, lens detents, glass chime, till latch and bell, padlock, handset | the pawns, the bags, the three phones, @allawi.psd, and each click named in the cue list |

Each cue is rendered on its own in an OfflineAudioContext, its peak set 12 to 16 dB under the voice's peak (−1.5 dBFS),
and trimmed where it goes silent. The cues are summed to one bus. Where they stack on one hit, a look-ahead limiter
keeps the bus 12 dB under the voice. The voice is never touched. The noise is seeded, so every render gives the same
sound. `engine.load({ "Deep": "<file>.wav" })` puts a recorded sound on a track (or on one kind, like `padlock`) in place of
the synthesis.

Preview: serve `marketing/` (`python3 -m http.server`), open `coin-allawi-reel/reel.html` and click. The voice and
the sound bus start on one audio clock and every frame is drawn from that clock, so the picture follows the sound.
`?t=25` starts from 25 s.

`node render.cjs sound` rebuilds only the sound, puts it on the rendered video and writes the After Effects track:
`out/ae/` has `sfx_timeline.jsx`, `sfx/` (one file per cue, named by number, track and kind) and `voice.wav`, and
`out/allawi_sfx_AE.zip` packs them. In AE, open the comp (or none, and it makes `allawi_orange_coin`), then File >
Scripts > Run Script File… and pick the script. Every cue lands as a green audio layer named after its track, at its
time, with the time and kind in the layer comment. Above them, the null `SFX_TIMELINE` has a green marker per cue,
as long as the sound. With `allawi-orange-coin.mp4` beside the script, a new comp also gets the reel as a picture layer.

## EffectCraft project

`effectcraft/` turns the reel into an editable EffectCraft project (`.ecproj`), since After Effects' own `.aep`
can't be written outside After Effects:

- `describe.js` runs inside `reel.html` and reads every element as a layer:
  - every word becomes a DG Sahabah text layer, set on its baseline with a right-to-left paragraph;
  - each cut-out becomes footage with its two drop shadows, and the white block, the stamp's frame and the phones
    become shape layers;
  - each clipped scene (the orange, the panel, the dark stage, the page coming back, the last orange) becomes a
    comp with its circle or diagonal as an animated mask;
  - the page camera and the camera worlds over the page and the stage become nulls;
  - the phones are 3D comps playing my reels behind a 1400 px camera.

  Keys are set the way I set them by hand: one where a move starts, lands or turns back, with a Bezier ease between
  (speed and influence, rounded to whole percents, Easy Ease where it fits), and one more only where the ease can't
  follow the move within 2% of it. About 2,200 keys in all, a dozen on a typical word; position is split into X and
  Y. Each layer's bar covers only the frames it shows. Each scene comp starts at its own zero and lasts as long as
  the scene, placed on the main timeline where it plays. A comp made for one piece gets room around it, so the dots
  under a final ya and the phones' shadows aren't cut at its edge.
- The main comp has the voice lines as comp markers and every word as a marker on VOICE. The camera null's slow push
  is keyed; the small push on every word is an expression reading those markers, and the shake when the stop hand
  lands is an expression too. Main-comp layers carry one label colour per scene.
- `export.cjs` writes `out/ec/reel.json` and `out/ec/footage` (cut-outs, paper, the phone reels without tags, the
  two drawings as PNGs, the voice and the 47 sound cues).
- `build_reel.jsx` builds the project through EffectCraft's scripting (its After Effects object model). The voice
  sits at the bottom of the main comp, then the cues as green layers, and `SFX_TIMELINE` has a green marker per cue.
- `pack.sh` runs all of it with `effectcraft-cli`, makes the footage paths relative to the project file (it then
  opens wherever the folder is unzipped), checks nothing is missing and writes
  `out/allawi_orange_coin_EffectCraft.zip`. `compare.sh` renders frames of the project next to the same frames of
  the page.

To open it: install `fonts/DG-Sahabah-Reg.ttf`, unzip, and open `allawi_orange_coin.ecproj`. What comes out close
rather than exact: the page's blur that follows each element's speed is the layers' motion blur, and the 3D page
tilt and the phones share one camera instead of a perspective each.

## Credits

- The empty wallet: rawpixel, CC0. The other cut-outs are ones I picked and cut out myself.
- Sounds: made in `sfx.js`. No music.
