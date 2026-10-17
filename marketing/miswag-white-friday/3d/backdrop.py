"""The empty Miswag-red studio sweep (floor curving up into the wall, soft light), as the backdrop for the photo
cut-outs in ads.html. Usage: bvenv/bin/python backdrop.py <out.png> [percent] [samples]"""
import os
import sys

import bpy  # noqa: F401  (Blender as a Python module)

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import studio  # noqa: E402

out = sys.argv[1]
sc = studio.setup(int(sys.argv[2]) if len(sys.argv) > 2 else 100, int(sys.argv[3]) if len(sys.argv) > 3 else 64)
studio.cyclorama(sc)
studio.lights(sc, target=(0, 0, 1.0))
studio.camera(sc, (0.0, -6.4, 2.3), (0.0, 0.4, 1.55), lens=40)
sc.render.filepath = out
bpy.ops.render.render(write_still=True)
print("wrote", out)
