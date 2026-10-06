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
