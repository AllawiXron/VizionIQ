# allawi.psd — before/after promo (HyperFrames)

25s, 1080×1920 reel: «صورة عادية.. صارت إعلان يبيع». The plain lab photo becomes the Al-Shifa ad, then before/after and the CTA.

Built with [HyperFrames](https://hyperframes.heygen.com): one HTML file (`index.html`) and one seekable GSAP timeline on a 120 BPM grid.

| Time | Scene | Transition in |
|---|---|---|
| 0–3.5 | S1 dark · the phone photo lands with a flash, «عندك صورة [عادية؟]», upload bar | — |
| 3.5–7.6 | S2 light · feed scrolls to the post, views count to 12,480, «وتعبـــر», a giant 0 + «ولا رسالة وحدة» | whip pan |
| 7.6–9.9 | S3 orange · «خليني أحولها / لإعلان / [يبيع]» with marching-ants selection | circle wipe from the 0 |
| 9.9–16.9 | S4 light · a cursor builds the ad in a Photoshop window: select, colour flood, text box, drag the offer in, export | zoom-through |
| 16.9–21.25 | S5 dark · before/after slider dragged by the cursor, then DM notifications | vertical whip |
| 21.25–25 | S6 light · allawi.psd, «راسلني هسه» click, «التصميم يبدي من 14 ألف», marquee | orange band wipe |

```bash
export HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
npx hyperframes@0.8.137 check
npx hyperframes@0.8.137 render -o renders/allawi-promo.mp4 --quality delivery
```

- **Sound effects:** `assets/sfx/` is gitignored. They come from `marketing/reels/remotion/public/sfx`.
- **GSAP:** vendored in `assets/vendor/` so renders work offline.
- **Ad layers:** come from `marketing/alshifa-lab/motion-layers.cjs`.
