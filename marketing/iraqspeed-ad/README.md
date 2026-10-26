# IraqSpeed ad (21 s, Remotion)

A short product film for iraqspeed.vercel.app in two cuts made for their frames: `AdWide` 1920×1080 and `AdTall`
1080×1920 (laid out again for the phone screen, not cropped). Both are 30 fps H.264 in `final/`.

| Time | Shot |
|---|---|
| 0 to 2.6 | The question تعرف سرعة الإنترنت بمنطقتك؟ alone on a light wall |
| 2.6 to 5.4 | The dark opens as a circle from the middle; Iraq's governorates draw themselves in outline, then fill in the site's speed colours, with سرعة الإنترنت في العراق |
| 5.4 to 10 | A soft pink and lavender room opens from the map; the map lands in the site's governorate card, the phone rises with the home screen, the search card arrives, the pointer clicks it, the results open and it presses Karrada |
| 10 to 15 | Karrada's result grows out of the pressed row and the phone turns to Karrada's page; the room turns mint, and the camera moves over the area's street map and the comparison with Baghdad and Iraq |
| 15 to 18.3 | Dark again, opening from the phone: the outline of Iraq traced in light, سرعة الإنترنت في العراق and بكل محافظة ومدينة وحي beside the phone |
| 18.3 to 21 | The end card: two more of the site's screens rise beside it, اكتشف سرعة الإنترنت في العراق and the address |

Everything on screen is the real site. `capture/capture.cjs` takes the phone screens (390×844 at 3x) and
`capture/elements.cjs` takes the cards (each one a clip of the page) from the live site, with the live visitor counter
switched off so no passing number shows. The map in shots 2 and 5 is the site's own governorate shapes and colours
(`src/iraq.json`, from the site's data). Karrada's ٨٧ and the comparison are the site's numbers as captured.

Rubik (Arabic and Latin, OFL, in `public/fonts`) is the site's own typeface. One spring curve, cubic-bezier(0.22, 1,
0.36, 1), for arrivals and one ease, (0.65, 0, 0.35, 1), for the camera and the rooms; a real shutter blur
(`CameraMotionBlur`, 16 samples) only on the four camera moves; light grain over all.

Sound: only Ali's two packs (`marketing/sfx-pack`), set by `mix.py`: an airy swish as each room opens, soft pops as
the cards arrive, the keyboard click on the two presses, a soft riser into the dark shot, one chime on the address.

Build, from this folder: `npm install`, `python3 mix.py wide` and `python3 mix.py tall`, `node stills.mjs <dir>
"t1,t2" AdWide` for single frames, then for each cut
`npx remotion render src/index.ts AdWide out/wide.mp4 --codec=h264 --crf=15 --muted` and the sound under it:
`ffmpeg -i out/wide.mp4 -i sound-wide.wav -map 0:v -map 1:a -c:v libx264 -b:v 10M -pix_fmt yuv420p -c:a aac -b:a 192k
-shortest -map_metadata -1 final/iraqspeed-ad-1920x1080.mp4`. `npx remotion studio` opens the project to edit it; the
timings and positions for each cut are in `LAYOUT` at the top of `src/Ad.tsx`. This is a Remotion project, not an
After Effects one.
