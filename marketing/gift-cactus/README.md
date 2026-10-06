# «كاكتوس» starter kit (a gift)

A free starter kit for a new handmade crochet store. What she makes and how she sells:
- **Products:** amigurumi keychains, headbands and bandanas, and AirPods cases.
- **Made to order:** everything she posts can be made again («قابل للتنفيذ»).
- **Custom pieces:** customers send her a photo of what they want.

Her own look is sage green and pink, gingham, and white sparkle doodles, next to an existing green "Cactus" logo. The kit adds a mascot that makes the name literal: a cactus knitted from yarn, in a terracotta pot, with a pink yarn ball and hook. Stitched (dashed) outlines replace hard borders. There are no photos of people.

`node render.cjs` renders every board in `kit.html` to `out/<id>.png`. The template photo slots stay empty in these renders.

| Board | Size | What |
|---|---|---|
| `logo` | 1080x1080 | Mascot + «كاكتوس» + «حياكة يدوية.. بكل حب» |
| `avatar` | 1080x1080 | Profile picture, circle-safe, mascot only |
| `hl-ready` `hl-bands` `hl-cases` `hl-custom` `hl-prices` | 1080x1920 | Highlight covers, with her products drawn in the knitted style: strawberry keychain (قابل للتنفيذ), headband with button (باندانات), pumpkin AirPods case (كفرات), photo + heart (طلبات خاصة), price tag (الأسعار) |
| `post-welcome` | 1080x1350 | «كل اللي احتجته.. سنارة وخيط», built from her own intro video |
| `post-order` | 1080x1350 | «شلون تطلب؟»: pick from «قابل للتنفيذ» or send a photo, agree on colour and size, she makes it by hand |
| `tpl-new` | 1080x1350 | Template: new-piece post with a photo slot, a «قطعة جديدة» badge and «الطلب بالخاص» |
| `tpl-story` | 1080x1920 | Template: «قابل للتنفيذ» story with a photo slot and «تريده بلون ثاني؟ دزلي…» |

`node render.cjs --demo <dir> <post-photo> <story-photo> [post-photo-position]` fills the two templates with real photos. Demo renders that use her product photos stay out of the repo.

**Look:**
- Colours: cactus green #6b9a5b, deep green #2f5a3a, cream #f7f0e3, terracotta #c96b45, yarn pink #f2a7b4, sun #f3c552, and a sage gingham background.
- Fonts: Reem Kufi Fun (its colour-font dots are recoloured with `@font-palette-values`: pink on cream, cream on the pink badge) and Readex Pro.

**Overlays she can use herself.** These are PNGs with a transparent photo window: put one on top of any product photo in Canva, CapCut or InShot.
- `out/overlay-tpl-new.png`: photo window x110 y120, 860x950.
- `out/overlay-tpl-story.png`: photo window x90 y370, 900x1100.

Rebuild them with `node render.cjs --overlay <dir>`, which paints the slots #00ff00, then `python overlay.py <dir>/key-tpl-new.png out/overlay-tpl-new.png` (and the same for the story). The keying only removes strong chroma, so the kit's own greens stay opaque.

## Layered PSD of the logo (for learning)

Rebuild it with `node logo-layers.cjs` (writes `layers/logo/*.png`), then `python build_psd.py` (writes `psd/kaktus-logo.psd`). Every part of the logo is its own named layer, grouped as **Cactus**, **Pot**, **Yarn ball + hook** and **Text**, with the design's opacities and blend modes:
- The knit texture is set to Multiply at 7%.
- The grain is set to Multiply at 25%.

How to rebuild it by hand in Photoshop:
1. **Knit texture:** draw one "V" stroke in a 44x34 px document, then use Edit → Define Pattern. Fill a layer with the pattern and set it to Multiply at about 7%.
2. **Cactus body:** five rounded rectangles: the trunk, two arm uprights and two arm joints. Merge them into one shape. Put a pattern-fill layer (a 30x24 "V" stitch tile in greens) above it as a clipping mask (Alt-click between the two layers).
3. **Shading:** a gradient layer (dark green at 35% → transparent → white at 12%), clipped to the same shape.
4. **Stitch lines:** shape layers with a dashed stroke (Stroke Options → dashed, round caps), in cream.
5. **Flower:** five ellipses rotated 72° apart, around a yellow circle.
6. **Text:**
   - «كاكتوس» is Reem Kufi Fun 700. It's a colour font, so its dots come with their own colour; in the design they're recoloured pink.
   - «حياكة يدوية.. بكل حب» is Readex Pro 500.
   - These layers are rasterised in the PSD, so retype them to edit.

## Showcase for allawi.psd

Posted with the store's OK. `node render.cjs --page showcase.html` renders `out/showcase-<id>.png`:
- `s1`–`s4`: a 1080x1350 carousel:
  1. the cover, «من حساب جديد.. [لهوية كاملة]»;
  2. before/after profile mocks;
  3. posts and templates;
  4. the CTA, «راسلني هسه» and «التصميم يبدي من 14 ألف».
- `story`: a 1080x1920 story for the «أعمالي» highlight.

The "before" is a generic empty new account, not her real profile, and no product photos are used.
