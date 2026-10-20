# «جمعتكم مباركة»: a Friday greeting post (20 Oct 2026)

A single post (1080×1350) for @allawi.psd, the user's pick of three ideas ("calendar page"), remade after the user said the first
version looked cheap: dark brown field, a wire-bound tear-off pad on a cardboard back with a page stack, torn stubs and
a curled corner, strips with a white fibre edge, real masking tape, no drawn pencil or pin. A torn-off calendar
page «هذا الأسبوع» is pinned to the paper: Saturday to Thursday are crossed off in pen and «الجمعة» is circled in
orange marker. Above it is the strip «جمعتكم مباركة»; below it, «ونرجع السبت بأفكار جديدة». There is also a worn
«allawi.psd» stamp and a handwritten «أخيراً..». No dates, so the post can be reused any Friday.

- `out/happy-friday.jpg`: the post. `caption.txt`: the caption.
- `post.html`: the artboard. DG Sahabah comes from `../brand-fonts`; the paper texture and grain come from
  `../ig-highlights/assets/img`. The stamp's worn ink is the SVG noise filter `#stampF`.
- `NODE_PATH=/opt/node-tools/node_modules node render.cjs` renders `out/`. It serves `marketing/` over a local http
  server because the page uses `../` paths.
- Check: `node ../tools/textcheck.cjs post.html '.art'` reports no collisions.
