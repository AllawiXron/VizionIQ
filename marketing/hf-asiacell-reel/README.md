# Asiacell concept reel (HyperFrames)

`renders/asiacell-reel.mp4`: a 12 s reel at 1080×1920, 30 fps, with sound. It is the Asiacell concept ad «الوطنية طفت.. النت ما طفى.» (`../brand-ads-2026/asiacell.html`), recomposed for 9:16.

It is built for the 3-second problem. On allawi.psd's reels (Metricool, 3–7 Oct 2026), only 8–25% of viewers stayed past 3 seconds, so everything that matters happens before then:
- by 2.1 s the whole joke and the brand are on screen;
- the rest is a reason to stay;
- the end lands back on the first frame, so the reel loops with no seam.

| Time | What happens | Sound |
|---|---|---|
| 0–0.8 | A lit room, the bulb on, «كل بيت عراقي / يعرف هاللحظة..». The light flickers, and the grid drops. | Room hum (50 Hz), flicker crackle, relay clunk winding down |
| 0.8–2.1 | Dark. Only the red signal sign is on. «الوطنية طفت..», then «النت» slams in and «ما طفى.» ignites like neon; then the sub line, the logo and «اشترك بباقة نت». | A beat of silence, thud, neon ticks and buzz, sub boom |
| 2.95 | The music drops, and the ad splits into its 5 layers in 3D: «هذا الإعلان ٥ طبقات.. خلّي أراويك شلون انبنى». | Music in, whoosh |
| 3.95–5.45 | **The bulb** flips out of the stack to face the camera. It shows the real photo, then the cut-out (lit), then the off grade wiping down it. | Clicks on the beat, swish, flicker |
| 5.45 / 6.45 / 7.45 | **The sign** (its bars redraw: «مرسوم رسم، مو صورة»), **the words** (the neon stutters), **the logo and button** (the button gets pressed). | Clicks on the beat |
| 8.45–8.95 | The layers slam back into the finished ad. | Whoosh, boom, flash, shake |
| 9–11 | «دزّه لواحد بيتهم بلا وطنية هسه» with a share icon, and «تصميم مقترح · @allawi.psd». | Music under |
| 11–12 | The power comes back with a flicker, the ad washes out, and the hook text returns. This is the opening frame again. | Relay click, hum spinning up, then the same hum level as at 0 s |

The pop-out works like this. The stack is the whole ad pushed back to half size (`z = −perspective`), tilted 54° and turned −36°. A focused layer counter-rotates by the same angles, so it lands flat and facing the camera. `pop()` in `index.html` solves its translation so the layer's content centre lands at screen (540, 900) at a chosen size.

## Files

- `index.html`: the composition, a single scene with one GSAP timeline.
- `BRIEF.md`: the brief.
- `sfx.py` builds `assets/sfx/*.wav`: room hum, flicker, power cut, neon, power back. It runs with numpy and scipy.
- `assets/img/`:
  - `bulb-off.png`, `bulb-on.png` and `bulb-photo.jpg`, from `../brand-ads-2026/photo/` (`bulb.py`, `bulb_on.py`);
  - the Asiacell logo, from asiacell.com.
- `assets/sfx-kit/` and `assets/music/` are gitignored. They are copied from `../hf-allawi-promo/assets/`:
  - the user's own sound kit, plus boom and whoosh;
  - "Gummies" from Mixkit (Stock Music Free License: social media is fine).
- `renders/asiacell-reel-cover.jpg`: the reel cover, the finished ad at 2.6 s.
- `caption.txt`: the post caption.

```bash
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx hyperframes@0.8.140 check
npx hyperframes@0.8.140 render -o renders/asiacell-reel.mp4 --quality delivery
```

`check` passes: 0 errors in lint, runtime, layout, motion and contrast. The text overlaps inside the exploded 3D stack are intentional (the dimmed layers sit behind the popped one), and are marked `data-layout-allow-overlap`.

## Posting

- Post it on its own, in the evening. Don't post anything else that day.
- Pick `renders/asiacell-reel-cover.jpg` as the cover.
- Keep the original audio.
- This is concept work that Asiacell did not commission; the caption says so.
- The bulb photo is CC0 (Ashesh Magar, WordPress Photo Directory) and needs no credit.
