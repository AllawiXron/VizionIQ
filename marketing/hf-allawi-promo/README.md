# allawi.psd — before/after promo (HyperFrames)

24s, 1080×1920 reel: «صورة عادية.. صارت إعلان يبيع». The plain lab photo becomes the Al-Shifa ad, then before/after and the CTA.

Built with [HyperFrames](https://hyperframes.heygen.com): one HTML file (`index.html`) and one seekable GSAP timeline. This replaces the Remotion `AllawiMotion` version.

| Time | Scene | Transition in |
|---|---|---|
| 0–3.6 | S1 dark · «عندك صورة [عادية؟]», the phone photo | — |
| 3.6–7.4 | S2 light · the feed scrolls past, «وتعبـــر» stretches, «ولا رسالة وحدة» | vertical push |
| 7.4–9.8 | S3 dark · «خليني أحولها [لإعلان يبيع]» | vertical push |
| 9.8–17.4 | S4 light · the ad builds in a Photoshop window, 4 steps with selection boxes | zoom-through |
| 17.4–20.6 | S5 dark · before / after cards | vertical push |
| 20.6–24 | S6 light · allawi.psd, «راسلني هسه», «التصميم يبدي من 14 ألف» | blur crossfade |

```bash
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx hyperframes@0.8.137 check
npx hyperframes@0.8.137 render -o renders/allawi-promo.mp4 --quality delivery
```

- **Sound effects:** `assets/sfx/` is gitignored. They come from `marketing/reels/remotion/public/sfx`.
- **GSAP:** vendored in `assets/vendor/` so renders work offline.
- **Ad layers:** come from `marketing/alshifa-lab/motion-layers.cjs`.
