# The Orange Coin (ad reel for my page)

My ad reel as one take, in the motion language of the reference the user sent: every scene grows out of the last one,
with no cuts and no crossfades. The concept is one orange coin that carries the viewer from a weak ad to a sale. It
drops into the wallet, flips into the circle that opens the orange world, shrinks into a window and into the icon of
a card, opens the last scene again from the padlock and ends as the dot of @allawi.psd. The last frame is the first,
so the reel loops.

Same script, fitted voice and sound cues as `../ae-core-reel` (`reel/sound.js`), same cut-outs (from
`../rm-allawi-ad-reel/public/el`). Type: DG Sahabah only. Colours: cream paper, my orange, my brown and white, under
my paper texture.

| Time | Line | Technique | On screen |
|---|---|---|---|
| 0–2.6 | مشروعك متعوب عليه، بس أرباحك قليلة | kinetic type | words out of a blur on cream; the coin drops into the wallet; «قليلة؟» stamped on it |
| 2.6–5.2 | عدنا نصمملك موشن جرافيك وبوستات إعلانية | shape morph | the coin flips into the orange circle that fills the frame; «موشن جرافيك» on a white block drawn word by word; the film camera rides a dotted orbit; a hand brings the box |
| 5.2–7.7 | تحجي بقوة براندك، وتبيع بمكانك | shape morph | the megaphone blasts «براندك» out along a dotted trail; the orange shrinks to a window with the shop owner in it |
| 7.7–12.6 | حركة تشد العين، فكرة تقنع الزبون، ونتيجة ترفع مبيعاتك | data moment | the window becomes the icon of a card; a card per promise lands on the stack over the bag; three dots fill |
| 12.6–14.4 | من أول 3 ثواني بإعلانك | 2D to 3D | the cards fall flat into a floor and a giant 3 stands up off it |
| 14.4–16.3 | الزبون راح يلمس الكواليتي العالي | lens | the magnifier's glass shows «الكواليتي» larger |
| 16.3–19 | يثق بمنتجك، ويدخل يطلب منك مباشرة | diagonal wipe | a diagonal orange panel sweeps in; the handshake |
| 19–23.5 | لأن ويانا راح يطلع إعلانك بمستوى يعزلك تماما عن منافسيك | wipe back | the king stays and the pawns slide to the edges |
| 23.5–26.5 | ويخلي الزبون يشتري منك مرة ومرتين وعشرة | three panels | the frame splits into three panels on brown, with one bag, two bags and ten |
| 26.5–28.5 | لأن شاف براند حقيقي قدامه | morph | the third panel opens to the whole frame: the man with binoculars |
| 28.5–35.5 | كافي تضيع جمهورك… توقف الزبون وتقفل وياه البيعة | kinetic type | crowds walk through the words; the stop hand; the padlock |
| 35.5–41.2 | تواصل ويانا بالخاص، شوف أعمالنا، وخلي براندك يبيع صح | end title | the circle opens from the padlock, then shrinks to the dot of @allawi.psd and back to the first frame |

## How it is built

- `reel.html`: every style is computed from `t` inside `window.seek(t)`, with no CSS animation, no timers and no state
  between frames. Each element has a life and a `pose(t)`. Moves use springs (damped to land without bouncing) and
  exponential eases written as functions of time. Blur comes from how far an element moved in one frame on each axis,
  so it follows its speed and direction. The camera pushes a little on every word of the voice and settles back.
- `render.cjs`:
  - `beats` writes one frame per word of the voice as a contact sheet to check first;
  - `stills <t…>` writes single frames;
  - with no argument it renders at 60 fps with 3 subframes per frame, averages them with ffmpeg `tmix` for motion
    blur, mixes the voice and the cues and writes `out/allawi-orange-coin.mp4` (no tags).

  Run it with `NODE_PATH` pointing at a folder that has playwright-core. The sounds come from `../ae-core-reel/media/audio`
  (its `tools/assets.sh`).

## Credits

- The empty wallet: rawpixel, CC0. The other cut-outs are ones I picked and cut out myself.
- Sounds: only my own sound pack. No music.
