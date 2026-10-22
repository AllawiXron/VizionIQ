# Design guides: education carousels for @allawi.psd

Reference-style carousels that teach something real, so the profile reads as a designer who knows the trade. The look
follows the posts the user picked (a sizes guide, a step-by-step strategy explainer): paper with a faint drawing grid,
big DG Sahabah titles, hairline diagrams drawn to scale, orange marker on the key line, a slide number and a swipe cue
on every inner slide, orange fields for the cover and the last slide.

## Sizes guide, `out/sizes-1..9.png`

1. Cover: دليل المقاسات لكل منصة, the four common ratios drawn at one scale.
2. How to read the drawings (the canvas, the hatched app overlay, the dashed profile crop).
3. Instagram: 1:1, 4:5, 3:4, 9:16; the profile grid crop and the reel overlay.
4. TikTok and Snapchat: 1080×1920 with their overlays (approximate, they vary by device).
5. Facebook: 1:1, 4:5, 9:16, link 1.91:1.
6. YouTube: thumbnail 1280×720, Shorts, channel art 2560×1440 with the 1546×423 area every device shows.
7. X: 1600×900, 1200×1200, header 1500×500 with the profile photo over its lower left corner.
8. Before exporting (dark): 1080 wide, sRGB, PNG for text, check on the phone.
9. Save it, DM.

## Design process, `out/process-1..10.png`

طريقتي بتصميم أي بوست: six stations (message, hierarchy, grid, type, colour, check) with a tracker, and the same
example post (the made-up roastery سمرة, cup photo from `../ig-design-tips/renders/scene.jpg`) built up one station per
slide, then the finished post and a DM slide.

## Files

- `guides.css`: the shared look. `sizes.html`, `process.html`: the carousels. `frames.html`: the first style frames;
  its `f3` is a 12 principles sheet that can become its own post.
- `node render.cjs <page.html>` renders every `.f` in the page to `out/<id>.png` (with
  `NODE_PATH=/opt/node-tools/node_modules`).
- `caption-sizes.txt`, `caption-process.txt`: the captions, 5 hashtags each.
