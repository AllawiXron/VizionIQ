# «لو أكلاتنا صارت براندات فخمة»: Iraqi foods as luxury brands

An Instagram carousel for @allawi.psd. Four everyday Iraqi foods are dressed as luxury brands and shot like product
ads, with a joke in Iraqi dialect on each one. It is made to be shared and commented on, and it also shows clients
the kind of premium branding the page can do.

Slides, 1080×1350 (`out/food-1..6.png`):

1. **Cover:** the whole collection, «لو أكلاتنا العراقية صارت براندات فخمة».
2. **SAMOON «سمّون»:** a samoon in a velvet jewellery box. «چان بربع… صار بربع مليون», priced at ٢٥٠,٠٠٠ د.ع.
3. **AMBA «عمبة»:** an eau de parfum with a gold mango for a cap. «عطر يبقى وياك ٣ أيام حتى لو تسبحت».
4. **ISTIKAN «استكان»:** tea in a gold-rimmed istikan, with a tin, cardamom and sugar. «ما تگدر تگول لا للاستكان الثاني».
5. **DOLMA «دولمة»:** stuffed vine leaves and onions as chocolates in a gold-cupped box. «الفخامة تبدي من قلبة الجدر».
6. **Question:** «شنو الأكلة الجاية؟», with prompts (باچة؟ كبة؟ لبلبي؟ تمن ومرگ؟) to get comments, plus
   «تحتاج هوية فخمة لمشروعك؟ راسلني».

## How it is made

- `studio.py`: Blender 4.2 / Cycles scenes, built on the studio kit in `../identity-concepts/ward3d/studio.py`.
  - Products are modelled at real size: a diamond-shaped samoon with a split seam, a jewellery box with a hinged lid,
    a perfume flacon with amber juice (volume absorption), a lathed istikan with tea, a saucer and spoon, a tea tin,
    cardamom pods, sugar cubes, and pleated gold praline cups with leaf and onion rolls.
  - Run `python studio.py <shot> [--preview]`. Shots: cover, samoon, amba, istikan, dolma. `render_all.sh` renders
    all five.
  - Each camera leaves the top third of the frame clear for the text.
- `textures.html` / `textures.cjs`: the brand artwork printed on the products (`tex/*.png`, white on transparent,
  used as gold foil).
- `slides.html` / `slides.cjs`: the six slides. `node slides.cjs --preview` uses the quick preview renders.

All artwork, models and fonts are original or open-licensed (Google Fonts). No photos or brand marks of real companies
are used.
