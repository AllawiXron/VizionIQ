# «مطلوب صوت نسائي عراقي»: a casting call for a voice-over artist

A 2-slide Instagram carousel (1080×1350) and a story (1080×1920) for @allawi.psd: the page owner wants an Iraqi woman to voice his motion reels.

It uses the page's own brand system, the same as `../ig-why-not-selling`:
- paper `#ece3d4`, ink `#1f1510`, orange `#e2541b` / `#f07a2e`, cream `#fbf3e6`;
- Alexandria for headlines, Readex Pro for text, IBM Plex Mono for labels;
- the orange Photoshop selection box with handles.

- **`out/casting-1.png`, the call (paper):**
  - an orange pill «فرصة شغل», then «مطلوب صوت» with «نسائي عراقي» in the selection box, and «للتعليق الصوتي على ريلزاتي»;
  - a cream DM card: her 0:20 voice note, selected with transform handles and a cursor, and his orange reply «صوتج حلو.. نتفق؟»;
  - chips: «من ٣٠ لـ ٤٠ ثانية», «لهجة عراقية», «من البيت», and «مدفوع» in orange;
  - footer: «دزّه لوحدة صوتها حلو» and «اسحب».
- **`out/casting-2.png`, what is wanted and how to apply (ink):**
  - «أدوّر على صوت.. / مو مذيعة أخبار.»;
  - three orange checks: natural Iraqi, a voice with feeling, a clean phone recording;
  - an orange-outlined box with the audition line «تدري شنو أحلى شي بالعراق؟ إنو كل مشكلة.. عدنا الها نكتة.»;
  - «دزّيه بالدايركت» next to a lock and «بدون اسم أو صورة، بس الصوت». Many women will only apply if they can stay anonymous, so the post says it plainly.
- **`out/casting-story.png`:** the call as a story, with «دزّيلي فويس بالدايركت». The lower part is left free for a sticker.
- `caption.txt`: the caption.

Files:
- `post.html`: all three artboards. Fonts come from `../brand-ads-2026/fonts`.
- `node render.cjs`: renders `out/`. It needs `NODE_PATH=/opt/node-tools/node_modules` here.
- Checks: `node ../tools/textcheck.cjs post.html '.art'` finds no collisions.
