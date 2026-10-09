# viZion carousel: «صرف $70 بس.. ورجعتله مليون و475 ألف»

A redo of the user's four-slide viZion course post (originals in `src/`), which they found flat: "just text and an image
screenshot". Five 4:5 slides (1620×2025) in the viZion style (navy-to-blue gradient, line-art arrows, mint VZ logo,
corner arrows, contact footer; Readex Pro and IBM Plex Mono, copied from `../ig-advisor-update/fonts`).

| Slide | What it does |
|---|---|
| 1 · Hook | The result as the headline: «صرف $70 بس.. ورجعتله / مليون و475 ألف» at 112px. Underneath, the subscriber's real chat in a phone, with the numbers message pulled out and zoomed, the sales ringed and the profit underlined; a «900 ألف دينار» profit card; «شنو الفرق اللي سوّاه؟ اسحب ←» to pull people to slide 2; a small «النتائج تختلف من مشروع لمشروع». |
| 2 · What changed | Before (ضعف المبلغ، ويطلع خسران) vs after ($70 إعلان، 900 ألف ربح صافي), then «والفرق الوحيد؟ شغلتين بس»: the start of the video and the way he answers messages, with his own words from the same chat. |
| 3 · 230+ | «+230 مشترك بـ viZion», the second subscriber's real chat, his key line underlined and pulled out as a tag. |
| 4 · What changes | The five points from the original, as cards with icons. |
| 5 · Offer | «الحجز مفتوح!», the original line, «49 ألف» huge with «فقط، بدل 99 ألف» struck, «اشتراك مدى الحياة», «خصم 50%» sticker, a CTA button «دزلنا «أريد أشترك» بالخاص» and WhatsApp, and the proof again (+230 مشترك، $70 ← مليون و475 ألف). |

The order moved the offer to the end, so the post finishes on the price and the call to action; the four original
slides' content is all here. Every quote and number comes from the user's original slides: the chats are cropped
from their full-resolution images (`shots/`), nothing in them is retyped or changed.

`node render.cjs` renders `carousel.html` to `out/slide-1.jpg` … `slide-5.jpg`. The marker strokes on the chats are
in the screenshots' own coordinates (see the comments next to `MARKS` in the page script).
`caption.txt` is the post caption.
