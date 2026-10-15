# The user's sound pack (the only sounds for reels)

The user's own sound-effects pack, shared on Google Drive on 15 Oct 2026:
https://drive.google.com/drive/folders/1tBq1RwjvGUFLbHziU9DfEfqJo4_rRCfu

**Rule (from the user):** every reel or video uses only these sounds. No synthesized effects, no HyperFrames-kit or
other stock sounds, and no generated or stock music. If a piece needs music, ask the user for a track.

`./fetch.sh` downloads all 50 files into `files/` (not committed; about 26 MB). `manifest.tsv` lists each file's Drive id
and name. Some `.wav` files may be MP3 inside; ffmpeg and HyperFrames read both. Converting to 48 kHz stereo PCM before
use keeps timing exact:

    ffmpeg -i "files/Whoosh Main.wav" -ar 48000 -ac 2 -c:a pcm_s16le whoosh-main.wav

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
