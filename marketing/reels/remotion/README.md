# Reels in Remotion: "شلون سويت هذا الإعلان؟" (Sala)

`out/sala-reel.mp4`: 1080×1920, 30 fps, 15 s, H.264, silent. Add a trending sound in Instagram or TikTok; the cuts sit on
a 120 BPM grid (one beat every 15 frames), so most trending tracks line up.

Made in [Remotion](https://www.remotion.dev) (React video). The Sala ad is rebuilt live as components
(`src/SalaAd.tsx`, from `../../sala-ad/ad.html`), so each part has its own motion instead of flat layer images.

| Frames | Beat |
|---|---|
| 0–36 | **Cold open:** the finished ad in a Photoshop window, zoomed in. Caption «شلون سويت هذا الإعلان؟» |
| 36–50 | **Rewind:** the build plays backwards fast (RGB split, scanlines, ◀◀) to an empty canvas |
| 50–80 | Camera eases out to the whole window. «نبدي من الصفر» |
| 80 | Cursor clicks the eye of *Red + doodles*: Sala's red floods out from the centre, their doodles settle. «أول شي: أحمر سلة ورسوماتهم» |
| 125 | *Egg basket*: the camera punches in, the basket drops and bounces, and the camera shakes on impact. «صورة حقيقية… مو AI» |
| 170–196 | *App card* slides in; the cursor taps its button: «إضافة إلى السلة» → «✓ أضيفت للسلة». «كارت من تطبيقهم نفسه» |
| 215–281 | Grandma's line types in word by word, «إلا هاي.» stamps down (with shake), and the arrow draws itself onto the basket while the camera follows. «ومثل بيبيتي… بس بالمقلوب» |
| 300 | Footer and logo. «وآخر شي: اللوگو» |
| 316–330 | Whip zoom into the canvas (motion blur) |
| 330–450 | **End card** on the allawi.psd paper: «طبقة فوق طبقة · @allawi.psd», the ad springs into place in the orange ring, «تحب إعلان مثله لمشروعك؟ راسلني» |

Made to feel hand-edited:
- spring physics on every move
- a cursor that travels in arcs and leaves a click ripple
- a History panel that fills in as you work
- handheld camera drift, punch-ins and impact shakes
- real camera motion blur (`@remotion/motion-blur`, 6 samples, 200° shutter)
- first-person captions in Iraqi dialect

Captions and the end card stay inside the Reels safe zone.

## Run

```
npm install
npx remotion studio                                   # preview and scrub in the browser
npx remotion render src/index.ts SalaReel out/sala-reel.mp4 --concurrency=4
```

`remotion.config.ts` points Remotion at the preinstalled headless Chromium; on another machine remove that line and
Remotion downloads its own. Remotion is free for individuals and companies of up to 3 people.

- `src/SalaReel.tsx`: timeline, Photoshop window, cursor, camera, captions, rewind, end card.
- `src/SalaAd.tsx`: the ad, driven by build time `b` (`S` holds each layer's entrance).
- `src/anim.ts`: springs, keyframe tracks, shake. `src/Fonts.tsx`: local fonts (Alexandria, Readex Pro, IBM Plex Mono).
- `public/`: the ad's images (basket, doodles, logo, thumbnail), layer thumbnails, fonts.
