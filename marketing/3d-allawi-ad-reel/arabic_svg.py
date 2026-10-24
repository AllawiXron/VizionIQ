# Arabic set with HarfBuzz in my font, written as outlines so Blender can extrude it (Blender's own text objects
# don't join Arabic letters): an SVG to look at, and a JSON of each glyph's closed point loops for Blender.
# Usage: python arabic_svg.py out.svg "النص" [font.ttf]
import json, sys
import uharfbuzz as hb
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.basePen import BasePen


# collects every contour as a loop of points, with the curves cut into short straight steps
class LoopPen(BasePen):
    def __init__(self, glyphSet, steps=10):
        super().__init__(glyphSet)
        self.loops, self.cur, self.steps = [], [], steps

    def _moveTo(self, p):
        self.cur = [p]

    def _lineTo(self, p):
        self.cur.append(p)

    def _curveToOne(self, p1, p2, p3):
        p0 = self.cur[-1]
        for i in range(1, self.steps + 1):
            t = i / self.steps
            self.cur.append(tuple((1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d for a, b, c, d in zip(p0, p1, p2, p3)))

    def _qCurveToOne(self, p1, p2):
        p0 = self.cur[-1]
        for i in range(1, self.steps + 1):
            t = i / self.steps
            self.cur.append(tuple((1 - t) ** 2 * a + 2 * (1 - t) * t * b + t * t * c for a, b, c in zip(p0, p1, p2)))

    def _closePath(self):
        if len(self.cur) > 2:
            if self.cur[0] == self.cur[-1]:
                self.cur.pop()
            self.loops.append(self.cur)
        self.cur = []

    _endPath = _closePath

FONT = "../brand-fonts/DG-Sahabah-Reg.ttf"


def shape(text, path=FONT):
    blob = hb.Blob.from_file_path(path)
    font = hb.Font(hb.Face(blob))
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, {"kern": True, "liga": True})
    return buf.glyph_infos, buf.glyph_positions


def merge(glyphs, close=0.004):
    from shapely.geometry import Polygon, MultiPolygon
    from shapely.ops import unary_union
    parts = []
    for loops in glyphs:
        g = None
        for l in loops:
            p = Polygon(l).buffer(0)
            g = p if g is None else g.symmetric_difference(p)
        if g is not None and not g.is_empty:
            parts.append(g.buffer(close))
    word = unary_union(parts).buffer(-close)
    polys = word.geoms if isinstance(word, MultiPolygon) else [word]
    r = lambda ring: [(round(a, 5), round(b, 5)) for a, b in list(ring.coords)[:-1]]
    return [[r(p.exterior)] + [r(h) for h in p.interiors] for p in polys if p.area > 1e-5]


def svg(text, out, path=FONT):
    tt = TTFont(path)
    gs, names = tt.getGlyphSet(), tt.getGlyphOrder()
    upm, asc, desc = tt["head"].unitsPerEm, tt["hhea"].ascent, tt["hhea"].descent
    infos, pos = shape(text, path)
    x, paths, glyphs = 0, [], []
    for info, p in zip(infos, pos):
        lp = LoopPen(gs)
        gs[names[info.codepoint]].draw(TransformPen(lp, (1 / upm, 0, 0, 1 / upm, (x + p.x_offset) / upm, p.y_offset / upm)))
        if lp.loops:
            glyphs.append([[(round(a, 5), round(b, 5)) for a, b in l] for l in lp.loops])
        pen = SVGPathPen(gs)
        # font units have y up; the SVG has y down, with the baseline at the ascent
        gs[names[info.codepoint]].draw(TransformPen(pen, (1, 0, 0, -1, x + p.x_offset, asc - p.y_offset)))
        d = pen.getCommands()
        if d:
            paths.append(f'<path d="{d}"/>')
        x += p.x_advance
    h = asc - desc
    with open(out, "w") as f:
        f.write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {x} {h}" width="{x}" height="{h}"><title>{text}</title>'
                f'<g id="word" fill="#000">{"".join(paths)}</g></svg>')
    # in em units, baseline at y = 0, y up; "shapes" is the whole word merged into clean outlines with holes, so joined
    # letters become one solid with no seam where the glyphs meet
    with open(out.replace(".svg", ".json"), "w") as f:
        json.dump({"text": text, "width": x / upm, "glyphs": glyphs, "shapes": merge(glyphs)}, f)
    return x / upm, h / upm, asc / upm


if __name__ == "__main__":
    w, h, a = svg(sys.argv[2], sys.argv[1], sys.argv[3] if len(sys.argv) > 3 else FONT)
    print(f"{w:.3f} {h:.3f} {a:.3f}")
