# Brand ad concepts 2026: five Iraqi brands, five looks

Five 4:5 concept ads for the allawi.psd portfolio. Each one is for a brand that isn't in the earlier set (Baly, Miswag, Sala and the others), and each uses a different visual language, so together they show range: dark neon, a flat illustration, a phone-UI poster, cinematic photography and a product shot.

None of these brands commissioned the work. Label them as concepts when you post or send them.

| File | Brand | Idea | Look |
|---|---|---|---|
| `out/asiacell.png` | Asiacell | «الوطنية طفت.. / النت ما طفى.» Two pendants hang in a dark room: the grid's bulb is dead, and a red neon signal sign is still on. | Dark, minimal, red neon |
| `out/talabat.png` | talabat Iraq | «عيونُ المها بين الرصافة والجسرِ / ..وطلبك هم.» Ali ibn al-Jahm's Baghdad verse is the set-up. The order is the punchline: the rider is on the bridge between الكرخ and الرصافة, with a tracking card «طلبك يعبر الجسر هسه». | Flat vector map in talabat orange |
| `out/qi.png` | Qi Card (كي كارد) | «أحلى إشعار بالشهر.» The post is a lock screen on Sunday 1 November with the salary notification on top. Under it sit the generator («اشتراك الأمبير يخلص باچر») and Mum («جيب خبز وانت راجع»). | Phone UI in Qi yellow, with the Q mark as wallpaper |
| `out/iraqiairways.png` | Iraqi Airways | «مهما طالت الغربة.. / بغداد قريبة» A real plane window; through it, Baghdad, the Tigris and the palm groves. A boarding pass is tucked on the sill: IST → BGW, «راجع للأهل», «12A · شبّاك». | Cinematic photo, Ruqaa calligraphy |
| `out/pepsi.png` | Pepsi | «بالعراق ما نگول ~~كولا~~.. / نگول / ببسي.», then «ويا العشا، ويا الكص، ويا كلشي.» A real glass bottle with the current Pepsi globe bleeds off the right edge under a spotlight. | Product photo on electric blue |

## Build

- `node render.cjs [name ...]` renders `<name>.html` to `out/<name>.png` at 1620×2025. With no names, it renders every page.
- Each page is a 1080×1350 `#ad`.
- Fonts are local, in `fonts/`, from Google Fonts. All are under the SIL OFL: Alexandria, Readex Pro, IBM Plex Sans Arabic, IBM Plex Mono, Baloo Bhaijaan 2, Amiri, Aref Ruqaa and Lalezar.
- Photo prep scripts are in `photo/` and run with the venv that has Pillow, numpy, scipy and rembg:
  - `window.py`: builds `img/iqa-window.jpg`. It puts the aerial photo inside the window glass, along the outline traced in `glass.py` (run `python glass.py source-window.jpg check.png` to see it). It adds haze toward the horizon, a reflection on the acrylic and a dark gasket rim.
  - `bulb.py`: builds `img/bulb-off.png`. It cuts the bulb out with rembg, grades it to look switched off (dull cold filament, see-through glass) and adds a faint red spill from the neon side.
  - `bottle.py`: builds `img/pepsi-bottle.png`. It cuts the glass bottle out with rembg and re-tints the clear neck from the restaurant's warm lights to the ad's blue. The bottle touches the photo's right edge, so the layout bleeds it off the canvas.

## Credits and licences

| Used in | Photo | Licence |
|---|---|---|
| Asiacell | Hanging light bulb, by Ashesh Magar, WordPress Photo Directory, https://wordpress.org/photos/photo/146663e556/ | CC0 |
| Iraqi Airways | Plane window, by Moin Uddin Ahmed, WordPress Photo Directory, https://wordpress.org/photos/photo/424667aec8/ | CC0 |
| Iraqi Airways | Aerial view of Baghdad, "160731-D-PB383-021", by the Chairman of the Joint Chiefs of Staff (U.S. DoD), https://www.flickr.com/photos/42310076@N04/28578136122 | CC BY 2.0 |
| Pepsi | "Top-down View of a Burger Meal with Two Pepsi Bottles", by Iwaqarhashmi, https://commons.wikimedia.org/w/index.php?curid=150883079 | CC BY-SA 4.0 |

When posting publicly, credit the two non-CC0 photos in the caption:
- Iraqi Airways: «Photo: U.S. DoD / CJCS (CC BY 2.0)».
- Pepsi: «Photo: Iwaqarhashmi (CC BY-SA 4.0)». The Pepsi ad is an adaptation of a CC BY-SA photo, so it is shared under CC BY-SA 4.0 too.

The CC0 photos need no credit.

**Brand assets.** The logos and colours come from each brand's own site:
- Asiacell: `#e82228`, `asiacell.com/assets/ac-logo.svg`.
- talabat: `#ff5a00`, `talabat.com/assets/images/logo.svg`.
- Qi Card: `#F3CD00`, `qi.iq/images/logo.svg`.
- Iraqi Airways: `#12470D`, `iraqiairways.com.iq/upload/logo-white.jpg`, keyed to white.

They are the brands' trademarks.

**Verse.** «عيون المها بين الرصافة والجسر» is by Ali ibn al-Jahm, from the 9th century, so it is in the public domain.
