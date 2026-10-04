# Stories: free page check (مراجعة مجانية)

A story series for @allawi.psd that turns followers into leads. Post the call; the first 3 people who send their
@ get a free review of their page, posted as a story the next day (with their permission); then wrap up. Same
paper / ink / orange system as the أعمالي carousel (Aref Ruqaa titles, Readex Pro, IBM Plex Mono, Photoshop
transform boxes, the marble head).

| Story | File | Notes |
|---|---|---|
| 1 · The call | `out/01-call.png` | «مراجعة مجانية لصفحتك · أول ٣ يدزون يوزر صفحتهم، أسويلهم مراجعة مجانية» with a phone showing a page with 3 marks. The arrow points at the empty band above the footer: put Instagram's **question sticker** there («دز يوزر صفحتك 👇»). |
| 2 · A review | `out/02-review-<name>.png` | One per page. Their screenshot in a phone, 3 orange loops, numbered notes with leader lines, «تريد مراجعة لصفحتك؟ راسلني». `02-review-demo-cafe.png` is an example on a made-up café page (`mock-profile.html`). Don't post it. |
| 3 · Wrap-up | `out/03-wrap.png` | «خلصت المراجعات · الجولة الجاية الأسبوع الجاي، تابعني حتى لا تفوتك» and the head with the selected layer «تريد أرتب صفحتك؟ راسلني». |

All 1080×1920 (rendered at 1620×2880), with text kept clear of Instagram's top bar and reply bar. Layered PSDs are in
`psd/` (paper + ring, photo / screenshot, marks & layer UI, text, grain).

## Making a review

1. Ask permission, then take a screenshot of their profile (1080 wide; phone screenshots are) into `shots/`.
2. Copy `reviews/demo-cafe.json` to `reviews/<name>.json`, set `handle`, `n` («1/3»), `shot`, the `crop` (top and
   bottom of the part to show, in screenshot pixels, up to about 2260 px tall), and three `notes`: `t` (the point),
   `sub` (one line on why it matters), and the loop `x`, `y`, `rx`, `ry` in screenshot pixels.
3. `node render.cjs` writes `out/02-review-<name>.png` (and `--layers` + `python build_psd.py` the PSD).

## Build

```
node render.cjs --layers   # out/*.png, layers/*/ (also redraws shots/demo-cafe.png from mock-profile.html)
python build_psd.py        # psd/*.psd
```

The marble head is "Marble head of an athlete", Roman, 138–192 CE, The Met (CC0), from the carousel. Fonts: Aref Ruqaa,
Readex Pro, IBM Plex Mono, Instrument Serif (Google Fonts, SIL OFL).
