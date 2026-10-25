# «زبونك يقرا إعلانك بـ٣ ثواني»: how I build an ad

A 10-slide carousel for @allawi.psd (1080×1350, `out/three-seconds-1..10.jpg`). One idea argued slide by slide, the
way the reference carousels the user picked do it (theabdallahdarwish, grafico_bh, sodom2030): a headline, one line
with a highlighted phrase, and a clean diagram on each slide, a checklist near the end and a DM call last.

1. Cover: «زبونك يقرا إعلانك بـ٣ ثواني», a phone in the feed and a three-part timer.
2. «الإبهام يقرر بلحظة»: what happens in each second (يشوف، يوقف لو يعبر، يفهم، يقرر).
3. «العين ما تقرا من فوق لجوه»: an ad wireframe with the reading order 1 to 4.
4. «رسالة وحدة بكل إعلان»: seven messages in one ad next to one message.
5. «سطر يسأل.. وكلمة تجاوب»: three headlines from the page's ads (بلي، صاج الريف، آسياسيل).
6. «صور اللحظة، مو المنتج»: product vs moment, with the Asiacell, Iraqi Airways and Al-Shifa ads.
7. «الحجم يعني الأهمية»: the order of importance with the type sizes used on a 1080 post.
8. «خطوة وحدة بالآخر»: five requests crossed out, one button, and the button in the same corner on every ad.
9. «قبل ما تنشر، اسأل نفسك»: six questions and the thumb test.
10. Call to action: the profile photo, «تريد إعلان ينقرا بـ٣ ثواني؟ راسلني على الخاص».

The brand ads shown (Baly, Asiacell, Iraqi Airways) are unofficial concepts and are labelled so on the slides and in
the caption.

## Files

- `slides.html`: all ten slides. The pyramid on slide 7 and the timer on the cover are drawn by its script.
- `render.cjs`: `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `out/` (add slide ids such as `s3` to
  render only those). Check text with `node ../tools/textcheck.cjs ig-ad-three-seconds/slides.html '.art'`.
- `caption.txt`: the caption, with 5 hashtags.
- `work/`: the three ads on slide 6 (from `../ig-brand-posts/works/` and `../alshifa-lab/out/`).
- `img/avatar.jpg`: the profile photo (from `../ig-portfolio-cover/img/`).
- Fonts: DG Sahabah (the user's own), IBM Plex Sans Arabic and Alexandria (Google Fonts, OFL).
