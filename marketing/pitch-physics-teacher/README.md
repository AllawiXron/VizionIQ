# Spec pitch: سيد الفيزياء (TikTok @m.jaber8)

A free sample design to pitch a physics teacher who sells online courses.

- `ad.html`: the redesigned winter-course ad («دورة الفيزياء الإلكترونية الشتوية 2027»). It renders at 1080x1920 (TikTok / story) and 1080x1350 (post).
  - His own caption hook «لسة البداية من الصفر ممكنة» becomes the headline.
  - The headline is drawn as a v–t graph that starts at v₀ = 0 («إنت هنا») and rises to «يوم الوزاري».
- `covers.html`: a lesson-cover system to replace his repeated blue circle-photo covers.
  - Each topic gets its own field diagram (spherical conductor, parallel-plate capacitor, induction).
  - Everything important sits inside the 3:4 area that the profile grid shows.
- `compare.html`: a private before/after sheet comparing his current grid with the new covers.
- `prep.py <screenshot>`: cuts his photo out of a screenshot of his own ad with a soft mask and writes `photo/teacher.png`.
- `render.cjs <page.html>`: renders every `.art` on the page to `out/`.

`photo/` and `out/` are git-ignored. They hold his photo, which is his own ad image; it is used only for a private pitch.
Don't post these publicly without his permission.
