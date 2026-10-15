# The user's transition clips (use these first)

The user's own transitions, shared on Google Drive on 15 Oct 2026:
https://drive.google.com/drive/folders/18-kIK8Od-qMZfv2XDctbLxGCsBcOE6OG

**Preference (from the user):** reels use these transitions mostly, instead of built-in or registry ones.

`./fetch.sh` downloads the 6 clips into `files/` (not committed; about 40 MB). `manifest.tsv` lists each clip's Drive id
and name.

## How to use them

All of them are light flashes on black. Lay a clip over the cut with `mix-blend-mode: screen`, so the black disappears
and only the light shows. Time it so the brightest moment, the "cut point" below, lands exactly on the cut. Then swap
the scene underneath on that frame.

- The four "Flash Transitions" clips are 1920×1080. In a 9:16 reel, scale them to cover with `object-fit: cover`. The
  light is soft, so the crop doesn't show.
- Every clip has its own sound. Mute it (`muted`) and put a sound from `../sfx-pack` on the cut instead: a whoosh, or a
  riser into the flash. Use the clip's own sound only if the user asks for it.

| Clip | Size, fps | Length | Cut point (full white) | Look |
|---|---|---|---|---|
| Flash Transitions 16.mp4 | 1920×1080, 25 | 0.64 s | 0.28 s (white 0.24–0.32) | grey bokeh into a white burst, warm edge |
| Flash Transitions 19.mp4 | 1920×1080, 25 | 0.76 s | 0.34 s (0.32–0.36) | white burst, then a blue streak and bokeh |
| Flash Transitions 4.mp4 | 1920×1080, 25 | 0.76 s | 0.48 s (0.44–0.52); a double flicker before it | warm orange-red leak, then white |
| Flash Transitions 6.mp4 | 1920×1080, 25 | 0.80 s | 0.38 s (0.36–0.40) | grey bokeh, white, then light streaks |
| Vip overlaymp4.mp4 | 1080×1920, 29.97 | 0.40 s | 0.00 s (starts at mid-grey, fades to black) | a quick soft flash for small cuts |
| Premium Transition.mp4 | 1080×1920, 29.97 | 7.37 s | six flashes in one file, see below | |

**Premium Transition.mp4** holds six separate flashes. Trim one out with `data-media-start` and a duration:

| # | Starts | Brightest | Ends | Look |
|---|---|---|---|---|
| 1 | 0.27 s | 0.70–1.84 s (holds white) | 2.30 s | a point of light grows to a full white-out. Good for an opening or a big reveal |
| 2 | 2.80 s | 2.90 s | 3.10 s | violet-blue glow |
| 3 | 3.90 s | 4.04 s | 4.21 s | cyan glow |
| 4 | 5.04 s | 5.17 s | 5.34 s | lime-green glow |
| 5 | 6.14 s | 6.27 s | 6.44 s | lavender glow |
| 6 | 6.97 s | 7.14 s | 7.31 s | white-grey glow |
