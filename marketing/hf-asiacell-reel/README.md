# Asiacell concept reel (HyperFrames)

`renders/asiacell-reel.mp4`: a 9.9 s reel at 1080×1920, 30 fps, with sound, that loops with no seam. It is the Asiacell concept ad «الوطنية طفت.. النت ما طفى.» (`../brand-ads-2026/asiacell.html`) as a short cinematic spot.

Why it is built this way:
- On allawi.psd's reels (Metricool, 3–7 Oct 2026), only 8–25% of viewers stayed past 3 seconds, so the joke and the brand are on screen by 2.5 s.
- At just under 10 s, most viewers reach the end, and the loop gives them a replay.
- v1 (12 s, with a 3D layer breakdown) looked fake at the start and was boring in the middle. v2 uses the real photo of the room and drops the breakdown.
- v3 slows v2 down so the ad has time to land and stay on screen (it holds about 5.5 s), and drops the «دزّه لواحد..» share line.

| Time | Picture | Sound |
|---|---|---|
| 0–1.12 | The real room, lit by its bulb, with «كل بيت عراقي / يعرف هاللحظة..». The light flickers, and the grid drops. | Room hum (50 Hz), flicker crackle, relay clunk winding down |
| 1.12–1.9 | Black. The filament's orange afterglow dies away, and «الوطنية طفت..» fades in. | Silence |
| 1.95–2.9 | «النت» ignites as white neon, then «ما طفى.» as red neon, and the red light spills over the room's walls. The signal bars light one by one, and dust floats in the glow. | Neon ticks and buzz, sub boom, a dark drone, a glass tick per bar, then the street generator starting up |
| 3.1–8.8 | The sub line, the Asiacell logo and «اشترك بباقة نت», then the small «تصميم مقترح · @allawi.psd» under the headline. The full ad holds for about 5.5 s, and the neon stutters twice. | Drone and generator |
| 8.8–9.9 | The grid comes back with a flicker, the lit room washes out the neon, and the hook text returns. This is the opening frame again. | Relay click, hum spinning up, then the same hum level as at 0 s |

The camera pushes in slowly (1 → 1.08) through the cut and eases back as the light returns.

## Files

- `index.html`: the composition, a single scene with one GSAP timeline.
- `BRIEF.md`: the brief.
- `photo.py` builds the plates in `assets/img/` from the CC0 bulb photo (`../brand-ads-2026/photo/source-bulb.jpg`), a real room lit by that bulb:
  - `room-lit.jpg`: the room as shot;
  - `room-dark.jpg`: the power cut (~6% exposure, cold), with the bulb swapped for its switched-off grade;
  - `room-red.jpg`: the room lit only by the neon words, using the shot's surfaces tinted red and falling off from the text;
  - `filament.png`: the orange afterglow.
- `sfx.py` builds `assets/sfx/*.wav`: room hum, flicker, power cut, neon, power back, generator, drone and tick. It runs with numpy and scipy.
- `assets/sfx-kit/` is gitignored. It holds the user's own sound kit (boom, whoosh, pops), copied from `../hf-allawi-promo/assets/sfx/`.
- `renders/asiacell-reel-cover.jpg`: the reel cover, the frame at 4.5 s.
- `caption.txt`: the post caption.

```bash
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx hyperframes@0.8.140 check
npx hyperframes@0.8.140 render -o renders/asiacell-reel.mp4 --quality delivery
```

Checks:
- `check` passes, with 0 errors.
- `../tools/textcheck.cjs` finds no glyph collisions in the two text states (the hook, and the full ad). textcheck only reads the frame's static state, so to check each state, force its elements visible in a copy of the page.

## Posting

- Post it on its own, in the evening. Don't post anything else that day.
- Pick `renders/asiacell-reel-cover.jpg` as the cover.
- Keep the original audio.
- This is concept work that Asiacell did not commission; the caption says so.
- The bulb and room photo is CC0 (Ashesh Magar, WordPress Photo Directory) and needs no credit.
