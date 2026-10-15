# Notes for Claude

## Sound in reels and videos

Use only the user's own sound packs in `marketing/sfx-pack/` (two Drive packs, 127 sounds; run `./fetch.sh` there
first; `README.md` lists every sound and its length). Don't synthesize sound effects, don't use HyperFrames-kit or other stock sounds, and don't add
generated or stock music. If a piece needs music, ask the user for a track.

## Transitions in reels and videos

Use the user's own transition clips in `marketing/transitions-pack/` for most transitions (run `./fetch.sh` there
first). `README.md` gives each clip's cut point and how to lay it over a cut (`mix-blend-mode: screen`, muted, with a
sound from the sound pack on the cut). Prefer them to built-in or registry transitions.

## Look of reels and videos

Use the look of the user's Instagram highlights (`marketing/ig-highlights`): paper `#ece3d4`, brown `#1f1510` and
orange `#e2541b`→`#f07a2e` fields under the paper texture (multiply), film grain and a vignette; Alexandria on torn cream
strips; designs as taped prints with kraft tags; Aref Ruqaa for handwriting. Don't use flat cream + orange + near-black
fields with clean UI pills: the user said that reads as "Claude motion" (15 Oct).
