# Reels — "layer by layer" (allawi.psd)

9:16 Reels (1080×1920, 30 fps, H.264 + AAC) that build an ad from its real PSD layers, for Instagram Reels and TikTok.

**Sala (`out/sala-reel.mp4`, 13.5 s):**

1. **0–0.8 s, hook:** on the allawi.psd paper with the orange ring, «٥ طبقات… وإعلان كامل» over an empty
   Photoshop canvas (transparency grid).
2. **0.8–6 s, build:** a cursor clicks each layer's eye in a Layers panel and the layer lands on the canvas: background
   fades in, the basket drops, the app card pops, the headline wipes in right to left, the logo pops. Each landing
   plays a rising note (C D E G A).
3. **6.4–9.1 s, 3D:** the background turns into a dark workspace and the ad flies apart into its five layers
   («sala_ad.psd · 5 layers / طبقة فوق طبقة»), drifts, then snaps back together on a whoosh.
4. **9.15 s, impact:** flash, boom and shimmer; the ad grows into the end card.
5. **End card:** «طبقة فوق طبقة · @allawi.psd» above the ad, «تحب إعلان مثله؟ DM @allawi.psd» below.

Text and key content stay inside the Reels safe zone (clear of the top bar, the right-hand buttons and the bottom
caption area).

- `out/sala-reel.mp4`: with the sound design. `out/sala-reel-silent.mp4`: no audio, for adding your own track.
- `reel.html`: the animation. `setTime(t)` draws any moment, so frames are exact. Ads are listed in `ADS`
  (layers bottom to top, each with its entrance: fade, drop, pop or wipe); add one there and copy its layers from
  `../<ad>-ad/layers/` into `img/<ad>/`.
- `render.cjs`: `node render.cjs sala` renders `frames/sala/` and `out/sala-timeline.json`;
  `node render.cjs sala --preview 0,6,8` renders stills only.
- `sfx.py`: `python sfx.py sala` builds `out/sala-sfx.wav` from the timeline.
- Encode:
  `ffmpeg -framerate 30 -i frames/sala/f_%04d.png -i out/sala-sfx.wav -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart out/sala-reel.mp4`
- Fonts (Google Fonts, SIL OFL): Alexandria, Readex Pro, IBM Plex Mono.
