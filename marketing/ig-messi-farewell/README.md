# «حتى بغداد سهرت تودّعك»: Messi's farewell, from a Baghdad café

A tribute for @allawi.psd on the night of Messi's farewell match with Argentina: Argentina v Benin at the Monumental,
Buenos Aires, on 6 October 2026. It is listed at 18:00 local time, which is around midnight in Baghdad.

The idea is an Iraqi café at midnight. Through the arch you can see the river and a minaret; men watch an old TV where
the number 10 waves goodbye; an Argentina flag hangs on an empty chair; a glass of tea steams on the table. The scene is
AI-generated (`photo/baghdad-cafe.png`, made from our prompt). The allawi.psd marks go on top:

- the Ruqaa title «حتى بغداد سهرت تودّعك», selected as a Photoshop layer (frame, handles, the orange
  `thank_you_leo.psd` tag, cursor);
- «2005 — 2026 —— شكراً ليو»;
- the orange ring circling the TV, with a Fig. 10 label;
- Plex Mono meta and footer, @allawi.psd, and grain.

Outputs:

- `out/messi-cafe-post.png`: the feed post, 1080×1350.
- `out/messi-cafe-story.png`: the story, 1080×1920. The photo is extended with its own blurred edges, and the text stays
  clear of Instagram's bars.

Run `node render-cafe.cjs` to render (Playwright). Fonts are from `../ig-brand-posts/fonts` (OFL).
