# Brand ad concepts 2026: five Iraqi brands, five looks

Five 4:5 concept ads for the allawi.psd portfolio. Each one is for a brand that isn't in the earlier set (Baly, Miswag, Sala and the others), and each uses a different visual language, so together they show range: dark neon, a flat illustration, a phone-UI poster, cinematic photography and a product shot.

None of these brands commissioned the work. Label them as concepts when you post or send them.

| File | Brand | Idea | Look |
|---|---|---|---|
| `out/asiacell.png` | Asiacell | «الوطنية طفت.. / النت ما طفى.» Two pendants hang in a dark room: the grid's bulb is dead, and a red neon signal sign is still on. | Dark, minimal, red neon |
| `out/talabat.png` | talabat Iraq | «عيونُ المها بين الرصافة والجسرِ / ..وطلبك هم.» Ali ibn al-Jahm's Baghdad verse is the set-up. The order is the punchline: the rider is on the bridge between الكرخ and الرصافة, with a tracking card «طلبك يعبر الجسر هسه». | Flat vector map in talabat orange |
| `out/qi.png` | Qi Card (كي كارد) | «أحلى إشعار بالشهر.» The post is a lock screen on Sunday 1 November with the salary notification on top. Under it sit the generator («اشتراك الأمبير يخلص باچر») and Mum («جيب خبز وانت راجع»). | Phone UI in Qi yellow, with the Q mark as wallpaper |
| `out/iraqiairways.png` | Iraqi Airways | «مهما طالت الغربة.. / بغداد قريبة» A real plane window; through it, Baghdad, the Tigris and the palm groves. A boarding pass is tucked on the sill: IST → BGW, «راجع للأهل», «12A · شبّاك». | Cinematic photo, Ruqaa calligraphy |
| `out/pepsi.png` | Pepsi | «بالعراق ما نگول ~~كولا~~.. / نگول / ببسي.», then «من أيام التسعينات.. لهسه.» The 1990s-design Pepsi can, relit as a studio product shot, stands on a glossy floor under a soft spotlight with out-of-focus lights behind it. | Retro product shot on electric blue |

## Build

- `node render.cjs [name ...]` renders `<name>.html` to `out/<name>.png` at 1620×2025. With no names, it renders every page.
- Each page is a 1080×1350 `#ad`.
- Fonts are local, in `fonts/`, from Google Fonts. All are under the SIL OFL: Alexandria, Readex Pro, IBM Plex Sans Arabic, IBM Plex Mono, Baloo Bhaijaan 2, Amiri, Aref Ruqaa and Lalezar.
- `node layers.cjs` splits each ad into its layers (`layers/<name>/<key>.png`, 1080×1350, transparent). `../ig-brand-posts` uses them for its «Layer by layer» slides; that folder also has the posts and captions for posting these on the page.
- Photo prep scripts are in `photo/` and run with the venv that has Pillow, numpy, scipy and rembg:
  - `window.py`: builds `img/iqa-window.jpg`. It puts the aerial photo inside the window glass, along the outline traced in `glass.py` (run `python glass.py source-window.jpg check.png` to see it). It adds haze toward the horizon, a reflection on the acrylic and a dark gasket rim.
  - `bulb.py`: builds `img/bulb-off.png`. It cuts the bulb out with rembg, grades it to look switched off (dull cold filament, see-through glass) and adds a faint red spill from the neon side.
  - `bulb_on.py`: builds `img/bulb-on.png`, the same cut-out kept switched on, and `img/bulb-photo.jpg`, the plain crop as shot. The Asiacell reel (`../hf-asiacell-reel`) uses both.
  - `retro_can.py`: builds `img/pepsi-retro-can.png`, the cut-out. The can is white and silver and its lid sits against a bright wall, so rembg alone fades it. Its mask only seeds OpenCV GrabCut for the body; the lid and shoulders are traced by hand, and the outline is smoothed down the can.
  - `relight.py`: builds `img/pepsi-retro-can-lit.png`, the can the ad uses. The photo was shot close-up from above, in flat warm room light, so on its own the can looked flat and narrowed like a cup. The script:
    - corrects the perspective so the sides are parallel;
    - redraws the base as a short bevel and an elliptical bottom rim, inpainting the label pixels this adds;
    - white-balances the white;
    - shades the can as a cylinder lit from the front-left;
    - adds specular strip-light streaks;
    - picks up the ad's blue on the edges, with a bright rim on the right.

## Credits and licences

| Used in | Photo | Licence |
|---|---|---|
| Asiacell | Hanging light bulb, by Ashesh Magar, WordPress Photo Directory, https://wordpress.org/photos/photo/146663e556/ | CC0 |
| Iraqi Airways | Plane window, by Moin Uddin Ahmed, WordPress Photo Directory, https://wordpress.org/photos/photo/424667aec8/ | CC0 |
| Iraqi Airways | Aerial view of Baghdad, "160731-D-PB383-021", by the Chairman of the Joint Chiefs of Staff (U.S. DoD), https://www.flickr.com/photos/42310076@N04/28578136122 | CC BY 2.0 |
| Pepsi | "Pepsi Can Retro Design", by Ominae, https://commons.wikimedia.org/w/index.php?curid=76921111 | CC BY-SA 3.0 |

When posting publicly, credit the two non-CC0 photos in the caption:
- Iraqi Airways: «Photo: U.S. DoD / CJCS (CC BY 2.0)».
- Pepsi: «Photo: Ominae (CC BY-SA 3.0)». The Pepsi ad is an adaptation of a CC BY-SA photo, so it is shared under CC BY-SA 3.0 too.

The CC0 photos need no credit.

**Brand assets.** The logos and colours come from each brand's own site:
- Asiacell: `#e82228`, `asiacell.com/assets/ac-logo.svg`.
- talabat: `#ff5a00`, `talabat.com/assets/images/logo.svg`.
- Qi Card: `#F3CD00`, `qi.iq/images/logo.svg`.
- Iraqi Airways: `#12470D`, `iraqiairways.com.iq/upload/logo-white.jpg`, keyed to white.

They are the brands' trademarks.

**Verse.** «عيون المها بين الرصافة والجسر» is by Ali ibn al-Jahm, from the 9th century, so it is in the public domain.
