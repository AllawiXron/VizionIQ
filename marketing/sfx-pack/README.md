# The user's sound pack (the only sounds for reels)

The user's own sound-effects packs on Google Drive:
- Pack 1, shared 15 Oct 2026, 50 loose files (in `files/`):
  https://drive.google.com/drive/folders/1tBq1RwjvGUFLbHziU9DfEfqJo4_rRCfu
- Pack 2, shared 9 Oct 2026, 77 sounds in one folder per type (in `files/<type>/`):
  https://drive.google.com/drive/folders/11f5ih2YdrKcxYcawC9mRx7CK99Yb_dl_

**Rule (from the user):** every reel or video uses only these sounds. No synthesized effects, no HyperFrames-kit or
other stock sounds, and no generated or stock music. If a piece needs music, ask the user for a track.

`./fetch.sh` downloads both packs into `files/` (not committed; about 59 MB). `manifest.tsv` lists each file's Drive id
and path. Some `.wav` files may be MP3 inside; ffmpeg and HyperFrames read both. Converting to 48 kHz stereo PCM before
use keeps timing exact:

    ffmpeg -i "files/Whoosh Main.wav" -ar 48000 -ac 2 -c:a pcm_s16le whoosh-main.wav

## Pack 1

### Risers (build-ups)

| File | Length |
|---|---|
| Clean Riser.mp3 | 2.6 s |
| Riser 1.wav | 3.2 s |
| Riser 2.mp3 | 5.1 s |
| Riser 3.mp3 | 4.1 s |
| Riser 4.mp3 | 4.9 s |
| Riser 4.wav | 6.5 s |
| riser click.wav | 1.1 s |
| Soft Riser 2.wav | 2.2 s |

### Whooshes and swooshes (cuts, transitions)

| File | Length |
|---|---|
| Delayed Swoosh.mp3 | 2.2 s |
| InspectorJ - Pro Golf Hits - Metal Driver Club Swing Whooshing Hard Hits Reverberant .aac | 2.6 s |
| Trail Swoosh.mp3 | 4.4 s |
| Whoosh Airy Tonal Tail.wav | 2.0 s |
| whoosh clean.wav | 2.8 s |
| whoosh click.wav | 0.6 s |
| Whoosh Deep Light.wav | 3.8 s |
| Whoosh Deep Short.wav | 2.3 s |
| Whoosh four.wav | 5.0 s |
| whoosh glitch.wav | 3.9 s |
| Whoosh hit.wav | 6.6 s |
| Whoosh Main.wav | 1.7 s |
| whoosh sickkk.wav | 1.7 s |
| Whoosh three.wav | 5.0 s |
| Whoosh two.wav | 2.0 s |
| whoosh-pointer-243108.mp3 | 8.0 s |
| Whoosh3.wav | 2.0 s |
| whoosh_magic_spell_01.wav | 1.1 s |
| Wind Gusts.mp3 | 9.5 s |
| Wind Swoosh.wav | 1.5 s |
| Wind whoosh two.wav | 4.0 s |
| Wind whoosh.wav | 6.9 s |

### Camera (shutters, flashes)

| File | Length |
|---|---|
| camera click and ring.wav | 2.2 s |
| Camera Clicks 02.wav | 1.9 s |
| camera flash_By_Idrisdjoudi.wav | 1.0 s |
| Camera shutter modern.mp3 | 2.2 s |
| camera-flash-sound-effect.mp3 | 2.1 s |
| crack flash.wav | 0.6 s |
| shutter.wav | 1.1 s |

### Clicks, UI and pops

| File | Length |
|---|---|
| apple keypord click.mp3 | 0.6 s |
| Correct.mp3 | 1.4 s |
| game-start-317318.mp3 | 1.4 s |
| Ni Sound - SciTech Game - Pop Up Menu Click.aac | 0.7 s |
| Synth Sparkle Tone High Pitch Tone Burst Ding 17.wav | 0.7 s |
| UI Beep 4.wav | 1.4 s |

### Magic, hits and atmosphere

| File | Length |
|---|---|
| Blaster  plasma.wav | 2.8 s |
| lighter + ignite sound.wav | 3.8 s |
| magic_flame_of_light_02.wav | 2.1 s |
| magic_light_bubble_01.wav | 2.2 s |
| Slice Ring.wav | 3.0 s |
| The cave.wav | 15.6 s |
| time stop.wav | 5.8 s |

## Pack 2 (`files/<folder>/`)

Some of these ".wav"/".wma" files are MP3 or AAC inside; ffmpeg reads them. `Ui Sound Effects/project 1.xml` is not a sound.

### Risers (build-ups): `Risers/`

| File | Length |
|---|---|
| Premium Riser.wav | 2.5 s |
| Riser 2.wav | 6.0 s |
| Riser.wav | 2.1 s |
| RJD Riser.wav | 1.0 s |
| Smooth Riser.wav | 2.5 s |

### Whooshes (cuts, transitions): `Whooshes/`

| File | Length |
|---|---|
| Cinematic Fast Normal Whoosh.wav | 0.9 s |
| Cinematic Fast Whoosh.wav | 1.4 s |
| Cinematic Long Whoosh.wav | 12.1 s |
| Cinematic Low Whoosh.wav | 1.6 s |
| Cinematic Low Whoosh.wav | 2.2 s |
| Cinematic Mediam Whoosh.wav | 2.0 s |
| Data_Whoosh.wav | 2.8 s |
| epic-fast-whoosh-345469.mp3 | 0.6 s |
| Fast Whoosh .wav | 1.4 s |
| Fast Whoosh.wav | 2.6 s |
| High And Fast Whoosh.wav | 1.6 s |
| High And Fast Woosh.wav | 2.4 s |
| Long Whoosh.wav | 4.3 s |
| Simple Whoosh 2.wav | 2.0 s |
| Simple Whoosh.wav | 1.5 s |
| Slow And Smooth Whoosh .wav | 3.8 s |
| Smooth And Fast Whoosh.wav | 1.8 s |
| Smooth Like A Butter Whoosh.wav | 3.8 s |
| Whoosh Deep Light 2.wav | 3.8 s |
| Whoosh Deep Short.wav | 2.3 s |

### Camera shutters: `Camera Shutters/`

| File | Length |
|---|---|
| Camera Shutter.wav | 0.4 s |
| Little Bit Hard Cammera Shutter.wav | 0.4 s |
| Smooth Cammera Shutter.wav | 0.6 s |

### Clicks: `Clicks/`

| File | Length |
|---|---|
| Cinematic Click.wav | 0.1 s |
| Click  (1).wav | 0.8 s |
| Click 2.wav | 0.5 s |
| Click_2.wav | 0.4 s |
| High Click.wav | 0.1 s |
| mouse-click-198485.wav | 28.8 s |

### Pops: `Pop/`

| File | Length |
|---|---|
| Meadia Pop.wav | 1.2 s |
| Normal Pop.wav | 3.1 s |
| Premium And Smooth Pop.wav | 4.0 s |
| Slow And Smooth Pop.wav | 0.7 s |
| Smooth Pop.wav | 0.5 s |
| Sweet UI Open.wav | 1.1 s |

### UI sounds (typing, buttons, glitches): `Ui Sound Effects/`

| File | Length |
|---|---|
| Ui All In One.wma | 9.5 s |
| Ui BackSpace.wav | 0.5 s |
| UI Beatbox Click 01.wav | 0.2 s |
| Ui button.wav | 0.3 s |
| Ui Click Digital 03.wav | 0.2 s |
| Ui Click Digital 04.wav | 0.2 s |
| Ui Click.wma | 1.4 s |
| Ui Digital Click.wav | 1.0 s |
| Ui Enter.wav | 0.8 s |
| Ui Glitch Click.wav | 0.4 s |
| Ui Glitch, Flicker, Text  (2).wav | 0.6 s |
| Ui Granular, Button, Select   (9).wav | 0.2 s |
| Ui Granular, Button, Select.wav | 0.2 s |
| Ui Open.wav | 1.5 s |
| UI Premium Open.wav | 3.9 s |
| Ui stretch.wav | 1.8 s |
| Ui Typing.wma | 11.3 s |
| Ui Typing.wma | 2.3 s |
| Ui.wav | 0.8 s |
| Uu Click Digital 01.wav | 0.5 s |
| v4) type & delete (2).wav | 0.1 s |

### Money (cash, coins): `Money/`

| File | Length |
|---|---|
| Cinematic Money 1.wav | 3.0 s |
| Cinematic Money 2.wav | 1.5 s |
| High Volume Money.wav | 5.9 s |
| Mediam Volume Mone.wav | 3.8 s |

### Gear (mechanical ticks, turns): `Gear/`

| File | Length |
|---|---|
| Fast Gear 2.mp3 | 2.2 s |
| Fast Gear.wav | 2.8 s |
| long speed gear.wav | 0.5 s |
| middle gear.wav | 0.7 s |
| Smooth And Premium Gear.wav | 1.3 s |
| Soft Gear 1.wav | 0.7 s |
| Soft Gear 2.wav | 2.2 s |

### Data collect (counters, stopwatch): `Data Collect/`

| File | Length |
|---|---|
| Cinematic Data Collect 2.wav | 3.3 s |
| Cinematic data.wav | 2.2 s |
| Data Collect.mp3 | 1.3 s |
| Data Collect.wav | 1.0 s |
| MA_Tuttkile_Stopwatch_3.wav | 5.6 s |
