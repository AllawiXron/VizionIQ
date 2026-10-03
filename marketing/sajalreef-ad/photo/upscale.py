"""4x upscale with Real-ESRGAN x4 (ONNX, fixed 64x64 tiles). Overlapping tiles, centre crops stitched.
Usage: python upscale.py in.png out.png"""
import sys

import numpy as np
import onnxruntime as ort
from PIL import Image

T, PAD, S = 64, 8, 4
step = T - 2 * PAD
sess = ort.InferenceSession(sys.argv[3] if len(sys.argv) > 3 else "model.onnx", providers=["CPUExecutionProvider"])
name = sess.get_inputs()[0].name
img = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(np.float32) / 255
H, W, _ = img.shape
pad = np.pad(img, ((PAD, PAD + T), (PAD, PAD + T), (0, 0)), mode="reflect")
out = np.zeros((H * S, W * S, 3), np.float32)
for y in range(0, H, step):
    for x in range(0, W, step):
        tile = pad[y:y + T, x:x + T].transpose(2, 0, 1)[None]
        res = sess.run(None, {name: tile})[0][0].transpose(1, 2, 0)
        core = res[PAD * S:(PAD + step) * S, PAD * S:(PAD + step) * S]
        h, w = min(step, H - y) * S, min(step, W - x) * S
        out[y * S:y * S + h, x * S:x * S + w] = core[:h, :w]
Image.fromarray((np.clip(out, 0, 1) * 255).round().astype(np.uint8)).save(sys.argv[2])
print("done", out.shape)
