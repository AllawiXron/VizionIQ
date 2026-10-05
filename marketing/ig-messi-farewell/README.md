# «شكراً ليو»: Messi's farewell, in the allawi.psd look

A tribute for @allawi.psd on the day of Messi's farewell match with Argentina: Argentina v Benin at the Monumental,
Buenos Aires, on 6 October 2026. It is listed at 18:00 local time, which is around midnight in Iraq. Two options, both
in the page's own style: paper background, orange ring, Aref Ruqaa, Instrument Serif and Plex Mono labels, and
Photoshop selection chrome.

- `out/messi-a.png`: the «أعمالي» cover layout. Messi stands in the orange ring, with «شكراً ليو» in Ruqaa, «The Last
  Dance — آخر رقصة», a selected `thank_you_leo.psd` layer bar with cursor, and Fig. labels with his numbers and trophies.
- `out/messi-b.png`: the brand-post layout. A finished tribute poster («آخر رقصة», the Albiceleste stripes, Messi's
  fist-pump, a «شكراً ليو» stamp, and a band with 207 matches, 125 goals and the 2022 world title) sits on the paper as
  the selected layer `messi_last_dance.psd`.

Photos: Hossein Zohrevand / Tasnim News Agency, CC BY 4.0, via Wikimedia Commons ("Lionel-Messi-Argentina-2022-FIFA-World-Cup
(cropped-upscale).jpg" and "Lionel Messi WC2022.jpg"), cut out with rembg (`photo/*-cut.png`). The credit is on both
designs and must stay in the caption too. Some 2022 final photos on Flickr are marked "public domain" by an account that
re-uploads agency images. Those are not really free, so they are not used.

Facts: ESPN and CNN for the retirement and the 207 caps and 125 goals; Hypebeast, AFP and Buenos Aires Times for the
farewell against Benin.

Run `node render-theme.cjs` to render (Playwright). Fonts are from `../ig-brand-posts/fonts` plus Anton and Lalezar
(`fonts/`), all OFL.
