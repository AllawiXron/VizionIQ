# «لو أكلاتنا صارت براندات فخمة»: real-photo version

An Instagram carousel for @allawi.psd. It is the same idea and jokes as `../ig-luxury-food`, redone without 3D, in
the style of bold Iraqi food-brand posts:
- real food photos cut out on flat red, yellow and cream backgrounds, on a faint grid;
- heavy Arabic headlines with a highlight box;
- white hand-drawn doodles: crown, sparkles, heart, steam, arrow.

Slides, 1080×1350 (`out/food-1..6.png`):

1. **Cover:** all four foods, «لو أكلاتنا العراقية / صارت براندات فخمة», with a crown on the samoon.
2. **Samoon:** «چان بربع… / صار بربع مليون», with a price tag «سمّونة وحدة · ٢٥٠,٠٠٠ د.ع».
3. **Amba:** the squeeze bottle as a perfume. «عطر يبقى وياك ٣ أيام / حتى لو تسبحت».
4. **Istikan:** «ما تگدر تگول لا / للاستكان الثاني».
5. **Dolma:** «الفخامة تبدي / من قلبة الجدر».
6. **Question:** «شنو الأكلة الجاية؟», with chips (باچة؟ كبة؟ لبلبي؟ تمن ومرگ؟) to get comments, plus
   «تحتاج تصاميم لمشروعك؟ راسلني».

## Files

- `photo/`: the source photos.
- `cutout.py`: cuts the foods out with rembg, writing `cut/*.png`. The amba bottle is cut hard-edged with its nozzle
  restored. `cut/samoon-gold.png` is the samoon warmed and with its shadows lifted.
- `slides.html` / `slides.cjs`: the slides. Run `node slides.cjs`.
- `fonts/`: Alexandria 800/900, Lalezar and Reem Kufi Fun, from Google Fonts (OFL).

## Photo credits (Wikimedia Commons)

- Samoon: "Iraqi Samoon 2.jpg", Muhib mansour, CC BY-SA 4.0.
  https://commons.wikimedia.org/wiki/File:Iraqi_Samoon_2.jpg
- Amba: "עמבה.jpg", Nirvadel, CC BY-SA 4.0. https://commons.wikimedia.org/wiki/File:%D7%A2%D7%9E%D7%91%D7%94.jpg
- Dolma: "Iraqi Dolma-Mosul 04.jpg", Abdulsalam Al Dabbagh, CC BY-SA 4.0.
  https://commons.wikimedia.org/wiki/File:Iraqi_Dolma-Mosul_04.jpg
- Tea: "Turkish tea with classical glass.jpg", CC0. https://commons.wikimedia.org/wiki/File:Turkish_tea_with_classical_glass.jpg

CC BY-SA asks for the credit, which is on slide 6 and should also go in the caption. It also asks that the
adapted images be shared under the same licence. To own every picture outright, reshoot the four foods on a plain
table and drop the new cutouts into `cut/`.
