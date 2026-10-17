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
orange `#e2541b`→`#f07a2e` fields under the paper texture (multiply), light film grain and a vignette; headlines and
captions on torn cream strips; designs as taped prints with kraft tags.

Font: the user's own DG Sahabah (`marketing/brand-fonts/DG-Sahabah-Reg.ttf`, one weight: set `font-weight:400` and
`font-synthesis:none`) for all reel text, handwriting included (no Aref Ruqaa), with Alexandria only as a fallback (15 Oct).
It has no «چ» or «گ»: write «ج» on screen («هيج», «حجي») and pick words without «گ» («شعار» for «لوگو»).

Keep the grain light (overlay about .07, not moving every frame) and encode at about 10 Mbps: at .32 the user said the
reel "looks grainy" (15 Oct). For "premium PNG" props, make them (Blender renders with real shadows, noise textures)
rather than taking packs from Pinterest, which are mostly other people's paid or copyrighted work.

No prices in reels unless the user asks for them (15 Oct).

Don't use flat cream + orange + near-black fields with clean UI pills: the user said that reads as "Claude motion" (15 Oct).

## Answering viZion leads

When the user sends a lead's message and asks what to reply, follow `marketing/vizion-sales-brief.md` (offer, price,
who it fits, payment, reply rules). No need to read code for this.
