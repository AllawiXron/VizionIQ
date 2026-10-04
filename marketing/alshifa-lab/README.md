# Sample posts: مختبر الشفاء للتحليلات المرضية (Al-Shifa lab, Hay Sumer)

Three samples for [@alshifa_lab_](https://www.instagram.com/alshifa_lab_/), made to show the lab what their page would
look like before the first month: they asked for 5 posts a month (mostly offers) plus stories, and wanted to see lab
work. Same allawi.psd system as the other ads (real photo, Alexandria headline built as a line and a short punch, a
pinned card in the client's own language, logo + CTA footer, grain), in the lab's teal `#27768a`.

| File | What |
|---|---|
| `out/alshifa-offer.png` (1620×2025) | **Offer.** «بدل ما تحتار شتفحص، / افحص كلشي.» A gloved hand holds an EDTA tube with the lab's name on its label; the pinned card is the package as a lab price list (7 tests with their codes, the price, a «وفّر ١٥ ألف» sticker). CTA «احجز بالرسائل». |
| `out/alshifa-vitamin-d.png` (1620×2025) | **Awareness.** «نعسان طول الوكت؟ / مو كسل.» A hand-drawn arrow points to a result slip: vitamin D 12 ng/mL, flagged low, on a 0–100 gauge with the normal range 30–100. One line explains it; CTA «افحص فيتامين D». |
| `out/alshifa-offer-story.png` (1620×2880) | The offer as a 9:16 story (text clear of the top bar and the reply bar). |
| `psd/*.psd` | Layered, 1080 wide: teal + grid, hand (photo), card, headline & footer, logo, grain (Overlay). |

**Neutral copies (`out/naqaa-*.png`, `psd/naqaa-*.psd`):** the same three posts for a made-up lab, «مختبر نقاء
للتحليلات المرضية», with its own mark (a drop with a cross cut out). Use them to show the style to any lab without
using a real lab's name. Build them with `node render.cjs --layers --lab naqaa` and `python build_psd.py naqaa`
(`posts.html?lab=naqaa` swaps the name, the line under it and the mark).

**Before posting for real:** the prices (٣٥٬٠٠٠ instead of ٥٠٬٠٠٠), the package contents and the vitamin D wording are
examples. The lab supplies or approves every test name, price and health line. The logo is redrawn from their
profile picture; swap in their original file.

## Build

```
cd photo && python prep.py --x4 <dir with labtube_x4.png, bloodtube_x4.png>   # cut-outs -> ../img/
node render.cjs --layers                                                     # out/*.png + layers/
python build_psd.py                                                          # psd/
```

- `posts.html`: all three designs; `render.cjs` screenshots each `section` and, with `--layers`, one PSD layer at a
  time.
- `photo/prep.py`: rembg (isnet-general-use) masks from the 1024 px originals, pixels from 4× Real-ESRGAN upscales
  (without `--x4` it falls back to Lanczos). On the blue-glove photo it lifts the maker's print off the tube's label
  and makes the clear glass see-through. On the blood tube, rembg frays the frosted glass, so the tube gets a
  geometric capsule outline, measured from the mask, and the glass is made neutral and see-through with its
  reflections kept.

## Assets

- **Photos:** both CC0, from Rawpixel's public-domain collection (via Openverse):
  - "Lab tube": https://www.rawpixel.com/image/3338342/free-photo-image-blood-collection-tube-cc0-creative-commons
  - "Free scientist running blood test": https://www.rawpixel.com/image/5922274/photo-image-background-public-domain-person
- **Mark and teal:** redrawn from the lab's Instagram profile picture. Their trademark.
- **Vitamin D reference range:** 25-OH vitamin D, 30–100 ng/mL sufficient, under 20 deficient (the common lab
  reference).
- **Font:** Alexandria (Google Fonts, SIL OFL).
