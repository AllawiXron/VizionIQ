# AMR aljanabi: spec designs for a pitch

Two free sample posts for @amr.aljanabi (AMR aljanabi perfumes, Baghdad), which the user wants to pitch to become
the page's designer. Real bottle photos (sent by the user) instead of AI scenes; name, notes and price clear; one
identity built on the existing serif «AMR aljanabi» wordmark.

Facts from the page's own captions (9 Oct 2026):
- Alexandria 2: lavender, rosewood, apple → oud, sandalwood, amber; category S; 35ml; 25,000 IQD.
- Mancera Amberful: yuzu, bergamot, pink pepper, nutmeg / violet, patchouli, amber wood / amber, cedar, oakmoss;
  category S; 35ml; 20,000 IQD.
- Delivery to all Iraqi provinces 5,000 IQD. Shop: Baghdad, Karrada Dakhil.

Fonts (local, `fonts/fonts.css`): Cormorant Garamond (Latin, close to the AMR wordmark), El Messiri and Tajawal (Arabic).

## v1: luxury template (`posts.html`, renders in `out/v1/`)

The user rejected it as looking "made in chatgpt" (the dark-gold, arch, icons and button-bar look).

One template for the whole page: his serif «AMR aljanabi» wordmark with a diamond rule; his real bottle photo in a
gold-lined arch; the name in Cormorant Garamond with a gold italic accent; notes or features in three clear rows;
a band with the price big on the left and delivery, location and «اطلب بالدايركت» on the right. Each perfume gets its
own accent: amber for Amberful, black and gold for Slazenger Gold.

- `post-1-amberful.jpg`: everything from his Mancera Amberful caption (notes, category S, 20 ألف, 35ml).
- `post-2-slazenger.jpg`: only what his label and bio say (35ml eau de parfum, French and Swiss oils, aged by hand,
  «بدائل نخبوية لأشهر الماركات العالمية»). The price is not known yet, so the band says «السعر بالدايركت»; set it in
  `#slz-price` once the user has it.

The photos are the user's screenshots of his reels (about 500px wide, `photos/src/`), cropped, enlarged 2× with
lanczos and lightly sharpened. Originals from him would make the real posts sharper.

## v2: apothecary collage (`collage.html` → `out/collage-*.jpg`, `node render.cjs collage.html`)

The user's own handmade style (kit copied from `../ig-highlights`: paper, dark desk, grain, ruled card, tape, kraft
tag, worn rubber stamp, Aref Ruqaa handwriting, Courier Prime typewriter), made to fit his story («معتقة يدوياً»):
- Amberful on aged paper: the photo as a taped print, a typed apothecary label (AMBERFUL · eau de parfum — 35 ml ·
  hand-aged · category S), the caption's line handwritten, a kraft tag «20 ألف / عبوة 35ml», a ruled card with the
  three note rows, a «معتّق يدوياً» stamp, and a torn slip with delivery, Karrada and «اطلب بالدايركت».
- Slazenger Gold on the dark desk: the big «94» jar print and the 35 ml bottle print joined by a drawn arrow and the
  note «نفس العطر.. بعبوة 35ml» (both labels read Slazenger Gold), the typed label, «ليش AMR؟» with the three bio
  lines, and a tag «35 ml / السعر بالدايركت» until the price is known.

The user found the collage "too much for his style".

## v3: editorial (`editorial.html` → `out/editorial-*.jpg`, `node render.cjs editorial.html`)

A magazine spread, the opposite of the AI template: flat paper (warm for Amberful, near-black for Slazenger Gold),
one real photo bleeding off the page edge with an italic caption, the name huge in Cormorant Garamond (his logo's
serif) with an accent italic, a hairline-ruled column of copy (notes or bio facts), the price as a big serif numeral,
and a hairline footer (delivery, Karrada, «للطلب: دايركت», @amr.aljanabi). No gradients, glows, icons, boxes or pills.
Slazenger Gold adds a small second picture of his «No. 94» jar, «نفس العطر.. بالقنينة الكبيرة», and keeps
«السعر بالدايركت» until the price is known (`#slz-price`).

The user didn't like it either, and asked for research into how strong brands make their ads.

## v4: clean product ads, from research (`dtc.html` → `out/dtc-*.jpg`, `node render.cjs dtc.html`)

What the research found (vendor and press write-ups, not performance data): "inspired-by" brands such as ALT. and
Dossier keep a clean, minimal look with well-lit product shots and a clear layout, lead with value; fragrance ads sell
a mood, and colour carries it (warm, deep tones for rich scents); real, phone-shot product images feel authentic; text
overlays on product images help. So: one scent colour as a studio sweep (amber for Amberful, gold for Slazenger Gold),
his real hand-held bottle cut out with `npx hyperframes remove-background` (u2net) and grounded with a soft shadow,
the name in heavy Alexandria caps, a bold Arabic headline, the notes (or bio facts) as three ruled rows, the price as
a huge numeral, and one delivery line. The Slazenger cut-out comes from his second shelf photo; a scrap of the box
behind it was erased by hand (`cut/slazenger-clean.png`).

The user found v4 "too simple".

## v5: rich product ads (`rich.html` → `out/rich-*.jpg`, `node render.cjs rich.html`)

v4's direction (his real bottle, one scent colour, clear Arabic copy) with the depth big perfume houses add:
- The name huge behind the product (fitted to the page width in JS), with the bottle cap over the letters, so the
  frame has a back, a middle and a front.
- Amberful: the real ingredients float around the bottle, some behind it and out of focus, some in front:
  a yuzu, pink peppercorns and a raw amber stone close to the lens. The notes become photo chips (yuzu for the
  opening, violet for the heart, amber for the base). The price is unchanged: 20 ألف, 35ml, category S.
- Slazenger Gold: no notes are published for it, so no ingredients are invented. Out-of-focus gold light (seeded, so
  every render matches) and the name do the work, with «SLAZENGER» under «GOLD». The bio facts get icon chips, and
  the price stays «السعر بالدايركت» (`#slz-price`).
- Both: a key light behind the bottle, a vignette, grain, and a dark delivery bar with icons (5,000 to every
  province · Baghdad, Karrada Dakhil · order by DM).
- The hand cut-outs had their alpha pulled in 2–4px and feathered (`cut/*-soft.png`) to remove the light halo from
  the shelf behind.

Ingredient photos (`ing/`), cut out with `npx hyperframes remove-background` or a colour key in ffmpeg:
- Amber stone and chip: "Amber (resinite) (Baltics)" by James St. John, CC BY 2.0,
  https://www.flickr.com/photos/47445767@N05/15545782135
- Yuzu and chip: "Basket of Yuzu for sale - Kanagawa - 2025 Dec 23" by Nesnad, CC BY 4.0,
  https://commons.wikimedia.org/wiki/File:Basket_of_Yuzu_for_sale_-_Kanagawa_-_2025_Dec_23.jpeg
- Pink peppercorns (`pc*.png`): "Pink Peppercorns, Penzeys Spices, Arlington Heights MA" by John Phelan,
  CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=30553926
- Violet chip: "Viola-odorata-flower.jpg", CC BY-SA 3.0, https://commons.wikimedia.org/wiki/File:Viola-odorata-flower.jpg

These are spec posts for a pitch. If he publishes them, the CC BY-SA images need the same credit line, so they
should be credited in the caption, or swapped for his own photos of the ingredients.

The user: v5 "feels like i havent even tried", next to the brand-ads-2026 set (Asiacell, Qi Card, Pepsi and the others).

## v6 (current): concept ads, 3D renders of his bottles (`v6/`)

What made the brand ads work, and what v1–v5 lacked: one Iraqi idea per ad, said in dialect, with one hero visual.
They were not spec sheets with notes, rows and bars. So each AMR ad now has an idea, and his real bottle is the hero,
modelled and lit in Blender instead of a 500px reel screenshot.

- `out/amberful.png` «شنو عطرك؟». The moment everyone who wears perfume wants: «أول ما تمرّ.. يسألوك: شنو عطرك؟». Chat
  bubbles from the people who ask («منين جايبه؟», «يا عطر هذا؟!», «ريحتك تخبّل..»; a dramatisation, not reviews). The
  punchline carries the price: «كللهم مانسيرا.. بس لا تكللهم بـ 20 ألف» (the user's spelling). His Mancera flask stands on an amber studio
  sweep: a thick glass shell, amber juice filled to the shoulders, a glass collar, a rose-bronze sleeve and square cap,
  a dip tube, and his label.
- `out/slazenger.png` «عطرك ذهب.. بلا مصنعية.». In an Iraqi gold shop you pay the gram price plus the «مصنعية»
  (making charge). With a dupe, you pay for the scent, not the name: «تدفع عالريحة.. مو عالاسم.» His Slazenger Gold
  bottle is a rounded-square glass block with a sunburst base, a knurled gold collar and a black cap with a gold rim.
  It stands on a black velvet jeweller's riser among out-of-focus shop lights, with the white gold-shop tag on a red
  thread: «العيار 35ml / المصنعية 0». The price is still unknown, so the CTA is «اسأل عن السعر بالدايركت».

Facts used: Amberful's price, size and match line from his caption; «معتّق يدوياً» and «زيوت فرنسية وسويسرية» from
his bio; the labels as printed on his bottles. `v6/captions.txt` has the post captions (notes, delivery 5,000 to every
province, Karrada Dakhil, DM).

Build:
- `v6/tex/labels.html` draws his two labels and the tag; `node v6/tex/render-tex.cjs` writes `v6/tex/*.png`.
- `v6/scene.py` (Blender 4.2, Cycles): `blender -b -P v6/scene.py -- <amber|gold> v6/render/<amber|gold>.png [scale%] [samples]`.
  Final renders: 1620×2025 at 160 samples, denoised. Details that matter:
  - The labels' backs are transparent and invisible to reflections.
  - The gold scene's square key light is hidden from reflections, so it can't leave pale panels inside the glass.
  - The bokeh lamps sit 60–80 units back, behind a lens at f/0.4.
- `v6/ads.html` sets the type over the renders: Alexandria, Readex Pro, and Cormorant for his wordmark. Run
  `node v6/render.cjs` to write `v6/out/*.png`; add `--test` to use the quick test renders instead.
