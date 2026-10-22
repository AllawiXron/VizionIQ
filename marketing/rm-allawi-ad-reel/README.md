# Ad reel for allawi.psd (Remotion)

A 41 s reel at 1080×1920, 30 fps, that sells my design work, rebuilt in Remotion from the HyperFrames version in
`../hf-allawi-ad-reel` (same script, same voice take, same sounds, same cut-outs).

The look follows the Brandek reel the user sent: one orange field for the whole reel (my brand orange, #e2541b to
#f07a2e, with a light paper texture), big white DG Sahabah with the key word in my brown (#1f1510), an outlined word or
a stretched word (tatweel) where the voice leans on it, and one black-and-white cut-out per idea, anchored to a frame
edge and acting on the words. All the cut-outs get the same treatment: grey, raised contrast, the same print grain
inside their own outline, one warm shadow. They were enlarged and sharpened to 1500 px before use.

It is one take: the ten ideas sit in a row on a strip and the camera holds on each while it is spoken, then pushes to
the next, right to left. The motion keeps the reel standard (`../hf-simple-logos-reel`): Smart Bounce on the hits,
motion blur on the camera and on every moving cut-out (measured from its own move over a 1/30 s shutter), and the
frame stepping at 15 fps (`stepped()` in `src/lib.tsx`).

| Time | Line | On screen |
|---|---|---|
| 0–2.6 | مشروعك متعوب عليه، بس أرباحك قليلة | «أرباحك» outlined over the open, empty wallet; a coin drops in on «قليلة», bounces off and flies into the next idea |
| 2.6–5.2 | عدنا نصمملك موشن جرافيك وبوستات إعلانية | «نصمملك» stretches; three phones play my dollar, viZion and logos reels, then turn; «إعلانية» outlined |
| 5.2–7.7 | تحجي بقوة براندك وتبيع بمكانك | a megaphone from the left edge, «براندك» bursts out of its mouth on a dark star; a shop owner comes up |
| 7.7–12.6 | حركة تشد العين، فكرة تقنع الزبون، ونتيجة ترفع مبيعاتك | one big phone; each word plays on its screen and its own thing pops in at the corner: binoculars, a bulb, coins |
| 12.6–14.4 | من أول 3 ثواني بإعلانك | «من» stretches across the frame on a long line; a giant 3; a hand holds up the stopwatch |
| 14.4–19 | الكواليتي العالي، يثق بمنتجك، ويدخل يطلب منك مباشرة | the magnifier's glass settles on «الكواليتي», which grows; a handshake shakes on «يثق»; «مباشرة» lands over it |
| 19–23.5 | يعزلك تماما عن منافسيك | the king among the pawns; the pawns are knocked out to both sides, «منافسيك» fills the background |
| 23.5–28.5 | مرة ومرتين وعشرة، لأن شاف براند حقيقي قدامه | the words tilt in, a bag on each, then a pile; a man with binoculars looks at «براند» |
| 28.5–35.5 | كافي تضيع جمهورك... توقف الزبون وتقفل وياه البيعة | crowds walk past; the stop hand comes up and the crowd stops; a padlock drops and locks |
| 35.5–41.2 | تواصل ويانا بالخاص، شوف أعمالنا، وخلي براندك يبيع صح | a receiver swings in, then my reels on three phones to the end, @allawi.psd |

## Build

- `npm install`.
- `public/` holds the font, the textures and the cut-outs (`public/el`). Not committed: the voice
  (`public/voice.wav`, made by `../hf-allawi-ad-reel/voice_fit.py`), the sounds (`public/sfx`, from
  `../hf-allawi-ad-reel/sfx.sh`) and the three reels (`public/clips`); copy them from `../hf-allawi-ad-reel/assets`.
- `npx remotion studio` to preview; `npx remotion render AdReel out/raw.mp4` to render (on this machine add
  `--browser-executable` pointing at the headless Chromium), then strip the tags:
  `ffmpeg -i out/raw.mp4 -map_metadata -1 -c copy out/allawi-ad-reel.mp4`.

## Credits

- The empty wallet: rawpixel, CC0. The other cut-outs were picked or made by the user and cut out by me.
- Sounds: only the user's own pack. No music.
