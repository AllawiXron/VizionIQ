# Syom Tea: Meta ads

Client job for @allawi.psd (Oct 2026). The client found the page and wants 5 ad designs with their copy for
Syom Tea. The work is -noAI.

Client files: `./fetch.sh` pulls both Drive folders into `files/` (not in git). `files/brand/7- Brand
Guidelines/Syom Brand Guideline.pdf` is the 39-page guide; the new pack photos are in `files/shoot/Product Photo
Session/photos- New pack/`.

## The product
- Syom Tea, a herbal tea for appetite control and safe weight loss. The page sells this one product only.
- Just relaunched in a new green pouch (the old pack is in `photos- old pack`, don't use it in the ads).
- Back of the pouch (DSC05045): Korean Sejak Green Tea, Rosa Petals, Nokcha Tea (in Arabic: شاي سيجاك الكوري
  الأخضر، بتلات الورد، شاي نوكتشا). About 60 cups a pouch, 3.33 g a cup, a teaspoon in boiling water, steep a few
  minutes. The label says Made in China, so say Korean tea or Korean blend, not made in Korea. The pouch itself
  makes no weight-loss claim; it sells calm and taste.
- The pouch says 2 kcal per cup; the client's old copy said zero calories. The client doesn't want calories
  mentioned in the ads at all.
- No lab test or registration certificate, so no "no side effects" or "100% safe" claims. Lead with natural
  Korean herbs and keep health claims soft.

## The brief
- 5 ads for Meta Ads Manager only (dark posts), not posted on the page. The goal is sales: she reads the ad,
  understands the product and its value, and sends a message to ask the price. No prices in the ads.
- Every ad in two sizes: 1080x1350 for the feed and 1080x1920 for Stories and Reels.
- Audience: women 20 to 45. All ad copy in the feminine form, Iraqi dialect.
- Banned word: منحف, and words from its root (منحفات, تنحيف). Women here fear it after fake chemical products.
  Write وتخافين من المنتجات الكيميائية instead of وتخافين المنحفات.
- Look: high-end, clean, natural, trustworthy. Never a cheap weight-loss ad.
- Follow the brand guide exactly, not the allawi.psd paper style:
  - green #014D40, gold #E8B06F, Lily White #FFEBEA
  - Lama Sans (files/brand/3- Fonts), the leaf logo (svg folder), the gold line, the patterns (Pattern 02)
- Meta rules: adults only, no before/after photos, nothing that makes women feel bad about their bodies.
- Quality over speed, no deadline.

## Ideas
The client picks one idea from ten (the 5 below and 5 of his own) to design first.

Mine:
1. The new look: the new pouch on deep green with the gold line around it.
   سيوم بحلته الجديدة / جودة أعلى ومكونات أنقى وأقوى
2. Appetite: the cup of tea with the pouch (DSC05263), steam curling like the leaf in the logo.
   ناقصتج شوية إرادة؟ هاج الإرادة بكوب / سيوم يساعدج تتحكمين بشهيتج بأمان
3. The fear of chemicals: mostly type on green with the brand pattern and a small pouch.
   خايفة من المنتجات الكيميائية؟ / سيوم أعشاب كورية طبيعية 100%
4. Daily ritual: a woman's hand holding the cup, the pouch behind it, warm light (a shoot photo if one fits).
   كوب واحد يوميا خطوتج نحو أفضل نسخة منج (their slogan is Crafted for your best self)
5. Clear ingredients: a close-up of the herbs and rose petals with the list.
   مكوناته واضحة شوفيها بعينج

A calories comparison idea (a cup of Syom next to a latte) was dropped when the client said no calories.

His: the start of his list was cut off in the recording; his idea 4 is
وزنج مضايقج؟ اشربي سيوم وادخلي عالم الرشاقة من اليوم, and one of his lines is ويعطي إحساس بالشبع.

Call to action options sent to him (all soft, since the ad has its own Send Message button):
- راسلينا ونحجزلج كل التفاصيل
- تحبين تعرفين أكثر؟ دزيلنا رسالة
- اسألينا عن سيوم ونرتبلج كلشي

## Where it stands (23 Oct)
- The client approved the notes (no calories, soft CTA, no منحفات, lead with natural Korean herbs).
- His call to action, used on every ad: راسلينا وخلي الباقي على سيوم
- Ad 1 is his idea 4 (وزنج مضايقج؟ اشربي سيوم وادخلي عالم الرشاقة من اليوم). The user told him the Story version
  comes first so he can approve the style; his copywriter's final text for the other ads comes post by post after.
- Meta's personal attributes rule rejects ads that ask her about her own weight (وزنج مضايقج؟ reads like "Are you
  overweight?"). Raised with the user before designing.
- Brand guide look: deep green fields, the gold/apricot tone, Lama Sans Bold, the leaf figure-eight element and
  Pattern 01/02, real tea photos. Shoot: pouch, cups and loose tea on a white sweep (good for clean cut-outs).
- Ad 1 Story (`ad1/`, 23 Oct): the first try (photo in the brand's drop shape over flat green, text stacked under it)
  was rejected as basic. Now a flat lay built on DSC05178: the pouch where it was shot, the cup and loose tea from
  DSC05976 laid beside it, the headline printed on the surface in multiply so the palm and window shadows cross the
  letters, and the pouch lying on the headline. `cd ad1 && python3 build.py` makes the photo layers; `node render.cjs`
  renders it.
- Ad 1 direction A (flat lay) was not liked either. The client's own ads look like the Sept 4 post on syom_iraq: a full
  scene with depth (pouch, cast-iron teapot and cups on a wooden tray, deep green behind, warm light).
- Ad B (`adB/`, chosen 23 Oct): a 3D scene in Blender 4.2. The pouch is modelled as a box-bottom pouch at the die-cut
  proportions and wrapped in the client's print strip, gold ink metallic. A yellow tailor's tape has fallen loose
  around its foot and trails off the right edge. Smoked walnut table, green plaster wall, warm window light cut by
  the palm and window shadow taken from DSC05178, a warm glow behind the pouch. The headline is painted on the wall
  (it takes the light); the rest of the copy is laid over the wall left of the pouch.
  Build: `./fetch.sh`, `adB/fetch-textures.sh`, `cd adB && python3 prep.py && node shot.cjs`
  (NODE_PATH=/opt/node-tools/node_modules), `blender -b -P scene.py -- render/scene.png 100 128`, then
  `node render.cjs` from this folder.
- Ad C (`adC/`, 23 Oct): the same idea in 2D, no 3D render. The pouch photo (DSC05046) cut along its outline on the
  brand green, the window and palm light from DSC05178 laid over the green (soft-light), and the tape drawn as one
  SVG path: half-cm and cm ticks from dashed strokes, a number every cm along the path (red every ten), round the
  front of the pouch, behind it and back to its brass end. `cd adC && python3 prep.py`, then
  `node render.cjs adC/ad.html` from this folder.
- Ad D (`adD/`, 23 Oct), concept 1 of the three pitched under `../ad-composite-rules.md`: a photo composite.
  Cut-outs from the shoot (pouch at three-quarter DSC05052, loose tea and petals from DSC05104), the tape rendered
  alone in Blender with a camera solved to the layout (a stand-in box hides it behind the pouch and throws the pouch's
  cast shadow), a walnut table warped into that camera's perspective, green plaster wall with a warm light behind the
  pouch and the palm shadow out of focus, contact/cast/ambient shadows, rim light, type in Lama Sans, one grade with
  grain over everything. Build: `cd adD && python3 cut.py`, `blender -b -P tape.py -- cut/tape-shadow.png 96`,
  `blender -b -P tape.py -- cut/tape.png 96 tapeonly`, `python3 compose.py`, then from this folder
  `node render.cjs adD/ad.html && python3 adD/grade.py out/syom-adD-story.png out/syom-adD-story.png`.
