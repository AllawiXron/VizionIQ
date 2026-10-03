# Reels in Remotion: "شلون سويت هذا الإعلان؟" (Sala)

`out/sala-reel.mp4`: 1080×1920, 30 fps, 15 s, H.264 + AAC, with motion-graphics sound design (clicks, whooshes, a
success chime, keyboard, bass hits, a riser and a reveal). `out/sala-reel-silent.mp4`: the same without audio, for adding your own track. The cuts sit on a
120 BPM grid (one beat every 15 frames), so most trending tracks line up.

Made in [Remotion](https://www.remotion.dev) (React video). The Sala ad is rebuilt live as components
(`src/SalaAd.tsx`, from `../../sala-ad/ad.html`), so each part has its own motion instead of flat layer images.

| Frames | Beat |
|---|---|
| 0–36 | **Cold open:** the finished ad in a Photoshop window, zoomed in. Caption «شلون سويت هذا الإعلان؟» |
| 36–50 | **Rewind:** the build plays backwards fast (RGB split, scanlines, ◀◀) to an empty canvas |
| 50–80 | Camera eases out to the whole window. «نبدي من الصفر» |
| 80 | Cursor clicks the eye of *Red + doodles*: Sala's red floods out from the centre, their doodles settle. «١ لون البراند» |
| 125 | *Egg basket*: the camera punches in, the basket drops and bounces, and the camera shakes on impact. «٢ صورة المنتج» |
| 170–196 | *App card* slides in; the cursor taps its button: «إضافة إلى السلة» → «✓ أضيفت للسلة». «٣ كارت من تطبيقهم» |
| 215–281 | The headline types in word by word, «إلا هاي.» stamps down (with shake), and the arrow draws itself onto the basket while the camera follows. «٤ العنوان والسهم» |
| 300 | Footer and logo. «٥ اللوگو» |
| 316–330 | Whip zoom into the canvas (motion blur) |
| 330–450 | **End card** on the allawi.psd paper: «طبقة فوق طبقة · @allawi.psd», the ad springs into place in the orange ring, «تحب إعلان مثله لمشروعك؟ راسلني» |

Made to feel hand-edited:
- spring physics on every move
- a cursor that travels in arcs and leaves a click ripple
- a History panel that fills in as you work
- handheld camera drift, punch-ins and impact shakes
- real camera motion blur (`@remotion/motion-blur`, 6 samples, 200° shutter)
- Apple-style captions: each word rises out of a soft blur, one after another, on a frosted-glass pill; the hook, then one numbered step per layer
- UI sound design synced to the frame

Captions and the end card stay inside the Reels safe zone.

## Sound

`src/Sound.tsx` is the cue sheet (frame, sound, volume). Only actions make sound (clicks, layers landing, the stamp,
the cut); captions are silent. `python sfx_prep.py` downloads and prepares the sounds into `public/sfx/` (trim, fades,
level; the clicks and pops get a gentle low-pass and a small dark room so they sound glassy rather than dry):
- **Elements SFX** by Crafter Station (github.com/crafter-station/elements), CC0, made for motion graphics: click,
  pop, whoosh, whoosh-alt1/alt2, swoosh, reverse-whoosh, riser, boom, success, keyboard, magic-reveal.
- **Mixkit** (mixkit.co), Mixkit Free Sound Effects License (free in commercial and personal projects, no
  attribution): "User interface zoom in". The raw files can't be redistributed, so they're fetched by the script and
  not committed.

## Run

```
npm install
python sfx_prep.py                                    # sounds (needs ffmpeg + numpy)
npx remotion studio                                   # preview and scrub in the browser
npx remotion render src/index.ts SalaReel out/sala-reel.mp4 --concurrency=4
```

`remotion.config.ts` points Remotion at the preinstalled headless Chromium; on another machine remove that line and
Remotion downloads its own. Remotion is free for individuals and companies of up to 3 people.

- `src/SalaReel.tsx`: timeline, Photoshop window, cursor, camera, captions, rewind, end card.
- `src/SalaAd.tsx`: the ad, driven by build time `b` (`S` holds each layer's entrance).
- `src/anim.ts`: springs, keyframe tracks, shake. `src/Fonts.tsx`: local fonts (Alexandria, Readex Pro, IBM Plex Mono).
- `public/`: the ad's images (basket, doodles, logo, thumbnail), layer thumbnails, fonts.
