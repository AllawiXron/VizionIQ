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

---

# Reel 2: «صورة عادية.. صارت إعلان يبيع» (Al-Shifa lab)

`out/alshifa-reel.mp4`: 1080×1920, 30 fps, 17 s, H.264 + AAC. Composition `AlshifaReel` (`src/AlshifaReel.tsx`).
A plain stock photo turns into the Al-Shifa lab offer, built from its real layers, then before/after and the CTA.

| Frames | Beat |
|---|---|
| 0–40 | Shutter flash; the plain photo pops in as a print (IMG_2041.jpg) on the allawi.psd paper, with «صورة عادية..» above and «شوف شصار بيها 👇» below |
| 40–92 | The cursor comes in and drags a marquee (marching ants) around the photo |
| 92–106 | A «Select Subject» chip pops; click, and the hand glows as it gets selected |
| 104–128 | The background dissolves, leaving only the cut-out hand. The cut-out is lined up pixel for pixel with the photo, so nothing jumps |
| 112–150 | The teal floods out from the hand while the hand glides and scales into its place in the ad; landing shake |
| 156–212 | The lab's name wipes onto the tube, the pill pops, the first line wipes in, then «افحص» and «كلشي.» slam down (with shake) |
| 228–300 | The package card swings in, its 7 rows tick in one by one, the price pops, then the «وفّر ١٥ ألف» sticker spins in |
| 318–372 | CTA and logo rise; a light sweep crosses the finished ad on a slow push-in |
| 372–430 | The ad shrinks into a rounded card («بعد») next to the original photo («قبل»); «صورة عادية.. / صارت إعلان يبيع» and a hand-drawn arrow |
| 430–510 | «راسلني هسه» button with «التصميم يبدي من 14 ألف — @allawi.psd»; the cursor taps it |

- **Layers:** `public/img/alshifa/`, exported from the lab's story design by `../../alshifa-lab/motion-layers.cjs`, then cropped to each element's box (`src/alshifaBoxes.ts` holds the positions).
  Every element (each card row, the sticker, each headline word) is its own 1080×1920 transparent PNG, rendered at 1.5x.
- **Before photo:** `public/img/alshifa/before.jpg`, the CC0 Rawpixel lab-tube photo.
- **Motion blur:** 5 samples at a 180° shutter, but only on the fast moves (`FAST` in the file), so the render stays quick.
- **Sound effects:** the same set as the Sala reel (`public/sfx`), cued per frame in `CUES`.

```bash
npx remotion render src/index.ts AlshifaReel out/alshifa-reel.mp4 --concurrency=4
npx remotion still src/index.ts AlshifaReel out/alshifa-cover.png --frame=360   # reel cover
```

---

# Reel 3: kinetic ad for allawi.psd (in the style of the reference reel)

`out/allawi-kinetic.mp4`: 1080×1920, 30 fps, 27 s. Composition `AllawiKinetic` (`src/AllawiKinetic.tsx`).
It is a kinetic-typography ad: short Iraqi lines in pills, 3D icons in rounded tiles, outlined counters, chat
bubbles, an Instagram post crossed out, swooshes on every cut, notifications, a rising graph, the offer and the
logo. Dark scenes and paper scenes alternate, in the allawi.psd colours (ink, paper, orange).

| Time | Scene |
|---|---|
| 0:00 | Dark. «تصرف على الإعلان..» with the megaphone tile and flying shapes; counters climb; «وتجيك آلاف المشاهدات»; «بس..» |
| 0:03 | Light. Bubbles «ولا رسالة وحدة» and «ولا طلب!» with question marks; an Instagram post whose word swaps «المشكلة» → «مو» → «بالإعلان», then a red X |
| 0:06.6 | Dark. «المشكلة بالتصميم..» with [ما يوقّف أحد] highlighted (selection handles); the sleepy tile, «الناس تسكرول بسرعة», «وإذا تصميمك ما وقّفهم», «يعبــرون» stretching |
| 0:10.2 | Dark. «فكرة» «كتابة» «تصميم»; a tile flicks through real ads (Sala, Miswag, Baly, White Friday, Al-Shifa); «48 HRS» counts up with «وتستلمه خلال يومين», a gear and an hourglass |
| 0:13.9 | Light (circle wipe). Camera icon and «دزلي صورة منتجك / وأرجعهالك إعلان يبيع»; «والنتيجة؟» with three Instagram message notifications stacking; «رسايل أكثر» tilted over rising chevrons |
| 0:18.4 | Light. A rising graph over «مبيعات أكثر», «تزيد مبيعاتك», circles «متابعين» and «طلبات» |
| 0:21.7 | Light. «راسلني هسه», the allawi.psd logo assembling, «التصميم يبدي من 14 ألف», before/after cards, «الأسعار كلها بالهايلايت 📌» |

- **3D icons:** Microsoft Fluent Emoji 3D (MIT), in `public/emoji/`.
- **Portfolio thumbnails:** `public/img/kinetic/`.
- **No music.** Add a trending sound inside Instagram; the sound effects sit under it.

```bash
npx remotion render src/index.ts AllawiKinetic out/allawi-kinetic.mp4 --concurrency=3 --timeout=120000
```
