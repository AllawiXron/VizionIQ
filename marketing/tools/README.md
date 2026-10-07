# tools

## textcheck.cjs: text collisions on the real glyphs

Arabic display fonts (Alexandria, Lalezar, Aref Ruqaa) draw hamzas, shaddas, dots and tall letters well outside their
line boxes. Two lines can look spaced in the layout and still touch on the page. This tool checks the pixels.

```
NODE_PATH=/opt/node22/lib/node_modules node textcheck.cjs <page.html> '<root selector>' [<page.html> '<selector>' ...]
# e.g.
node textcheck.cjs ../ig-offer/fixed-prices.html '#story' ../ig-brand-posts/posts.html '.slide'
```

For every root (each `.art`, `#ad` or `.slide`), each element that holds its own text is rendered alone with shadows
and glows off. A chip's own background (pill, badge, tag) counts as part of it. The masks are then compared:
- `COLLISION`: two pieces of text whose ink touches or comes within 3 px of each other (parent/child pairs are skipped).
- `EDGE`: text ink touching the frame edge, i.e. clipped.

It exits with 1 if it finds anything, so run it before every render that goes to the client. It does not check text
against non-text shapes. Glyphs hanging out of a highlight box still need a look at the render.
