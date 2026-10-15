# Notes for Claude

## Sound in reels and videos

Use only the user's own sound pack in `marketing/sfx-pack/` (run `./fetch.sh` there first; `README.md` lists every
sound and its length). Don't synthesize sound effects, don't use HyperFrames-kit or other stock sounds, and don't add
generated or stock music. If a piece needs music, ask the user for a track.

## Transitions in reels and videos

Use the user's own transition clips in `marketing/transitions-pack/` for most transitions (run `./fetch.sh` there
first). `README.md` gives each clip's cut point and how to lay it over a cut (`mix-blend-mode: screen`, muted, with a
sound from the sound pack on the cut). Prefer them to built-in or registry transitions.
