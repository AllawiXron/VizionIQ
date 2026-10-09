# allawi.psd highlights (Oct 2026): «الأسعار», «أعمالي», «براندات» + covers

The new story highlights, made on 9 Oct 2026 before the «محد طلبها منه» reel (`../hf-unasked-reel`) went up, in the
same handmade collage look (paper, tape, pins, tags, marker, rubber stamps, film grain), but in the allawi.psd brand
colours, as the user asked: paper `#ece3d4`, ink `#1f1510`, orange `#e2541b` / `#f07a2e`, cream `#fbf3e6`, orange-ink
`#c2441a` for orange text on light paper; Alexandria 800/900 for the headlines. They replace the old
«الأسعار» highlight (`../ig-offer`), whose prices were out of date. The user chose the three highlights, kept the other
prices as they were, opened motion videos again ("price by message") and picked the collage look.

`node render.cjs` renders `highlights.html` to `out/highlights-<id>.jpg` (1080×1920, JPEG 92). Run it twice: the profile
preview reads the covers from the first pass. It serves the folder over a local http server, because CSS masks (the
stamps' worn ink) and fonts don't load from `file://`. `out/overview.jpg` shows every story, highlight by highlight.

## The stories

| Highlight | Stories, in order |
|---|---|
| «الأسعار» | `p1` the bundles: ٣ بوستات ٤٠ ألف, ٥ بوستات ٦٥ ألف, باقة شهرية ٩٠ ألف (٨ بوستات + ٤ ستوري هدية), each with its price bought one by one struck through (٤٢, ٧٠, ١٤٠) and what one post comes to (about ١٣, ١٣, about ١١ ألف); «الأوفر» stamp. The user asked for price psychology so the totals don't scare people; only real numbers are used (the single post really is ١٤ ألف), no made-up "was" prices · `p2` single prices (بوست ١٤ ألف، ستوري ٧ آلاف، كاروسيل ٤٠، منيو أو فلاير ٤٠، لوگو ٧٠، هوية كاملة ٢٠٠ ألف، فيديو موشن: راسلني) · `p3` bigger monthly packages (المميزة ١٧٥ ألف, الكاملة ٢٥٠ ألف) · `p4` how to order, in four steps, with the rules (extra revision ٣ آلاف, same-day work: half again) |
| «أعمالي» | `w1`–`w6`: صاج الريف (restaurant), مختبر الشفاء (lab), مسواگ (online shop), سلة (online grocery), بَلي (taxi app), كاكتوس (handmade identity); each labelled «فكرة إعلان من تصميمي» · then `cta`. The الفقمة (home appliances) and ورد · WARD (beauty identity) stories were taken out at the user's request. |
| «براندات» | `b0` intro: «سوّيت إعلانات لأكبر شركات / حتى تشوف شگدر أسوّي لمشروعك» over the five ads, «إعلانات غير رسمية» · `b1`–`b5`: Pepsi, Qi Card, Iraqi Airways, Asiacell, talabat, laid out like the work stories (print, tape, a tag with the name) and labelled «إعلان غير رسمي» · then `cta`. The user asked for no «محد طلبه» stamps here; the reel's stamps now say «allawi.psd». |
| (both) | `cta`: «عجبك الشغل؟», the note «أريد ٣ بوستات», «٣ بوستات بـ٤٠ ألف بس», and an arrow down to the reply bar: «دزّلي من هنا» |

Key content sits between y 250 and 1680, clear of the story header and the reply bar.

## Covers

`c-prices` (a price tag), `c-work` (two prints), `c-brands` (a rubber stamp), `c-identity` (a pen nib, for the existing
«هويات» highlight so the whole row matches): an ink icon on a torn cream disc on brand orange. Instagram crops
the centre circle. `preview` shows the row as it looks on the profile.

## Putting them up

Highlights can only be made from stories that were posted, so each story is posted once (Metricool or the phone), then
in the app: profile → New (+) → pick the stories → name → Edit cover → choose the cover image from the camera roll.
`cta` goes into both «أعمالي» and «براندات». Remove the old «الأسعار» highlight.

What went up (9 Oct, Metricool, Instagram stories): a first version in the reel's red/green/dark colours posted at
12:00–12:09 (p1–p4, b0–b5), before the user's "use my brand colors" reached the session; it can't be removed through
Metricool, so the user deletes those 10 in the app. The brand-colour set went up at 13:40–13:57 in this order:
p1–p4 (13:40–43), the work stories (13:50–56, WARD's held back as a draft), cta (13:57), and the stamp-free b0–b5 at
14:00–14:05 (the stamped versions were held back as drafts before they posted).

Final set (9 Oct, after the price-psychology and wording changes): the user deleted every earlier story, so the
whole set went up again from commit `a5ccf88`, one a minute, in highlight order: p1–p4 (14:35–38), w1–w6
(14:39–44), b0–b5 (14:45–50), cta (14:51). cta posts last so it sits at the end of both «أعمالي» and «براندات»
(highlights keep posting order). The old WARD draft (391927596) stays a draft and never publishes.

All designs shown are the user's concept work; the brand ads are unofficial and labelled so on every story.
