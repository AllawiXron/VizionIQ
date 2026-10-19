# Notes for Claude

The user is Ali: an Iraqi graphic designer (@allawi.psd on Instagram) who also sells viZion, an Iraqi e-commerce course
built as this website (vizioniq.vercel.app; Vercel deploys `main`). The site is `src/`, `api/`, `server.ts`;
everything for Instagram (posts, reels, briefs, sound and transition packs) is in `marketing/`.

## Working with Ali (saves his weekly usage)

- When he says "don't waste usage" or sends a lead or caption question, answer in text: no tools, no reading code.
- Lead replies: viZion leads follow `marketing/vizion-sales-brief.md`; design-page leads and captions follow
  `marketing/allawi-psd-brief.md`. Iraqi dialect, short; gender-neutral wording when you don't know who is writing.
- For a new reel or design: show the idea or 2–3 still frames first, build after he approves, then one draft render.
  For a small change, make one pass and one render; don't re-check everything.
- When he states a new like or dislike, add it to this file in a line or two so later sessions know it.
- Be honest: don't invent features, results, clients or prices. No emojis on the site.
- Privacy: never commit voice-artist or applicant recordings, chat exports or screenshots of leads; don't repeat
  phone numbers.
- Commit and push to the session's branch when done. No pull request unless he asks.

## Reference projects (start from these; copy their structure and look)

- Reel: `marketing/hf-one-second-reel` (HyperFrames, the current standard: one-take camera over paper sheets, word
  pops with sound, highlighter pen, real voice-over fitted to captions). Its README explains every part.
- Collage reel: `marketing/hf-dollar-reel`. Photo post: `marketing/ig-diy-haircut`. Collage post and story:
  `marketing/ig-voice-casting`. Highlights: `marketing/ig-highlights`.
- Full style description (for another AI too): `marketing/gemini-style-prompt.md`.
- Render setup: HyperFrames is pinned at `hyperframes@0.8.162`; set `HYPERFRAMES_BROWSER_PATH` to
  `/opt/pw-browsers/chromium_headless_shell-*/chrome-linux/headless_shell`. Static posts render with
  `NODE_PATH=/opt/node-tools/node_modules node render.cjs`. Check Arabic text with
  `node marketing/tools/textcheck.cjs <page.html> '<selector>'` (it finds glyph collisions box checks miss).

## Sound in reels and videos

Use only the user's own sound packs in `marketing/sfx-pack/` (two Drive packs, 127 sounds; run `./fetch.sh` there
first; `README.md` lists every sound and its length). Don't synthesize sound effects, don't use HyperFrames-kit or other stock sounds, and don't add
generated or stock music. If a piece needs music, ask the user for a track.

A pop on every word as it appears (softer on the orange key words), a whoosh on each camera move or transition, a
stamp or impact on big moments.

## Voice-over

- Use a real recorded voice (or the ElevenLabs take he sends). Don't process it: no denoise, EQ, compressor or
  loudness normalising. One fixed gain only (peaks about −1.5 dB), 30 ms fades, and keep the word tails. He said a
  processed take sounded "weird and bad" next to the original (18 Oct).
- Cut it into lines at the pauses and start each line on its caption (word times from faster-whisper medium); see
  `marketing/hf-one-second-reel/voice_fit.py`. Tighten the visuals to the voice rather than padding pauses: he found
  a padded section "slow and boring" (18 Oct).

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
He also rejected a reel as "AI-looking and boring" (9 Oct): keep it handmade (paper, tape, real props) and keep it moving.

Sizes: post 1080×1350, story and reel 1080×1920; keep reel text clear of the top 250 px, the bottom 350 px and the
right-hand buttons. The hook is in the first second.

## Photos and people

Use the client's real product photos, the user's own photos, licensed photos (CC0, public domain, CC-BY with credit),
or made-up AI people he generates. Never a real celebrity's face or a real person edited as a joke. Ads for big
brands are unofficial concepts: label them «إعلان غير رسمي · فكرة وتصميم @allawi.psd».
