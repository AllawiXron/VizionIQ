# viZion carousel: «صرف $70 بس.. ورجعتله مليون و475 ألف»

A redo of the user's four-slide viZion course post (originals in `src/`), which they found flat. Four 4:5 slides
(1620×2025) in the viZion style: navy-to-blue gradient, line-art arrows, mint VZ logo, corner arrows, contact footer;
Readex Pro and IBM Plex Mono (copied from `../ig-advisor-update/fonts`).

## v2 (current): simple, one idea per slide

The user liked a competitor-style post whose cover is just a big number, one line, the chat screenshot and a hand
pointing at the numbers ("there isn't many stuff that will confuse the viewer"), and asked for that in their own style
and colours. Same order as the user's original post:

| Slide | Content |
|---|---|
| 1 | «صرف $70 بس.. ورجعتله» / «مليون و475 ألف» (132px, cyan gradient) / «بأول تطبيق لتعليمات viZion!», then the real chat with a selection box (handles) around the numbers message and the pixel hand cursor from the advisor carousel pointing at it, the viZion version of the reference's hand. |
| 2 | «هاي تجربة مشترك من بين +230 مشترك بـ viZion، بدأ من إعلانات خسرانة.. وهسه صار يعرف وين تروح كل دينار» over the second real chat. |
| 3 | «الحجز مفتوح!» big, «اشترك هسه، وخلي كل دينار تصرفه على الإعلان يرجعلك بربح», a price pill «49 ألف بدل 99 ألف» (99 struck), «اشتراك مدى الحياة». |
| 4 | «شنو يتغيّر بشغلك مع كورس viZion؟» and the five points with circled numbers. |

Page numbers «1/4» sit under the footer, as in the reference.

## v1

The first, busier five-slide version (phone mockup, zoomed numbers, profit card, before/after slide, sticker and CTA
button) is kept in `out/v1/`; its source is in git history (commit 3670883).

Every quote and number comes from the user's original slides; the chats are cropped from their full-resolution
images (`shots/`), nothing in them is retyped or changed. `node render.cjs` renders `carousel.html` to
`out/slide-1.jpg` … `slide-4.jpg`. The selection box on slide 1 is placed from the screenshot's measured layout
(at 534px wide the numbers message is y 248–443, x 8–445). `caption.txt` is the post caption.
