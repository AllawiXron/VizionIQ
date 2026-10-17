"""Downloads the reel's sound effects and prepares them (trim, fades, level) -> public/sfx/<name>.wav (48 kHz stereo).

Sources:
- Elements SFX by Crafter Station (github.com/crafter-station/elements), CC0: sound effects made for motion graphics.
- Mixkit sound effects (mixkit.co), Mixkit Free Sound Effects License: free in commercial and personal projects,
  no attribution; the raw files must not be redistributed, so they are fetched here and not committed.
Needs ffmpeg and numpy. Usage: python sfx_prep.py
"""
import io
import os
import subprocess
import urllib.request
import wave
import zipfile

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, ".sfx-cache")
OUT = os.path.join(HERE, "public", "sfx")
UA = {"User-Agent": "Mozilla/5.0"}
KENNEY = {
    "interface": "https://kenney.nl/media/pages/assets/interface-sounds/fa43c1dd4d-1677589452/kenney_interface-sounds.zip",
    "ui": "https://kenney.nl/media/pages/assets/ui-audio/490d233f68-1677590494/kenney_ui-audio.zip",
    "impact": "https://kenney.nl/media/pages/assets/impact-sounds/87b4ddecda-1677589768/kenney_impact-sounds.zip",
}
MIXKIT = "https://assets.mixkit.co/active_storage/sfx/{0}/{0}-preview.mp3"
ELEMENTS = "https://raw.githubusercontent.com/crafter-station/elements/main/public/sfx/{0}.mp3"

# name: (source, trim start s, length s or None, fade in s, fade out s, peak dBFS, low-pass Hz or 0, reverb wet 0..1)
RECIPES = {
    "click":   (("elements", "click"), 0, 0.3, 0, 0.05, -17, 7000, 0.14),       # dry UI click, softened, a little room
    "pop":     (("elements", "pop"), 0, 0.4, 0, 0.05, -15, 0, 0.12),            # soft pop
    "whoosh":  (("elements", "whoosh"), 0, None, 0.01, 0.08, -16, 0, 0),         # smooth transition whoosh
    "flood":   (("elements", "whoosh-alt2"), 0, None, 0.02, 0.2, -14, 0, 0),     # longer whoosh with body
    "swoosh":  (("elements", "swoosh"), 0, 1.2, 0.01, 0.3, -16, 0, 0),           # quick light transition
    "success": (("elements", "success"), 0, 1.3, 0, 0.35, -13, 0, 0),           # completion chime
    "keys":    (("elements", "keyboard"), 1.3, 0.66, 0.02, 0.08, -21, 0, 0),    # mechanical keyboard, a short burst
    "boom":    (("elements", "boom"), 0.85, 1.6, 0.005, 0.6, -6, 0, 0),         # bass hit
    "thump":   (("elements", "boom"), 0.85, 0.7, 0.005, 0.3, -12, 0, 0),        # the same, short and soft
    "rewind":  (("elements", "reverse-whoosh"), 0.9, 1.1, 0.05, 0.15, -12, 0, 0),
    "zoomin":  (("mixkit", 2618), 0, None, 0.01, 0.1, -19, 0, 0),                # User interface zoom in
    "riser":   (("elements", "riser"), 1.9, 0.85, 0.2, 0.02, -13, 0, 0),
    "whoosh2": (("elements", "whoosh-alt1"), 0, None, 0.01, 0.15, -11, 0, 0),    # whoosh with more body
    "reveal":  (("elements", "magic-reveal"), 0, 1.6, 0, 0.45, -13, 0, 0),      # sparkle unveil
}


def fetch(url, path):
    if not os.path.exists(path):
        with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
            open(path, "wb").write(r.read())
    return path


def source(src):
    kind, ref = src
    if kind == "mixkit":
        return fetch(MIXKIT.format(ref), os.path.join(CACHE, f"mixkit-{ref}.mp3"))
    if kind == "elements":
        return fetch(ELEMENTS.format(ref), os.path.join(CACHE, f"elements-{ref}.mp3"))
    z = fetch(KENNEY[kind], os.path.join(CACHE, f"kenney-{kind}.zip"))
    out = os.path.join(CACHE, f"kenney-{kind}-{ref}")
    if not os.path.exists(out):
        with zipfile.ZipFile(z) as zf:
            name = next(n for n in zf.namelist() if n.endswith("/" + ref))
            open(out, "wb").write(zf.read(name))
    return out


def decode(path):
    raw = subprocess.run(["ffmpeg", "-loglevel", "error", "-i", path, "-ac", "1", "-ar", "48000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float64) / 32768


def main():
    os.makedirs(CACHE, exist_ok=True); os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        os.remove(os.path.join(OUT, f))
    for name, (src, t0, length, fi, fo, peak, lp, wet) in RECIPES.items():
        x = decode(source(src))
        a = int(t0 * 48000); b = len(x) if length is None else min(len(x), a + int(length * 48000))
        x = x[a:b].copy()
        n_in, n_out = int(fi * 48000), int(fo * 48000)
        if n_in: x[:n_in] *= np.linspace(0, 1, n_in)
        if n_out: x[-n_out:] *= np.linspace(1, 0, n_out)
        if lp:                                   # gentle one-pole low-pass, twice (softer, less clicky)
            k = np.exp(-2 * np.pi * lp / 48000)
            for _ in range(2):
                y = np.empty_like(x); acc = 0.0
                for i, v in enumerate(x):
                    acc = (1 - k) * v + k * acc; y[i] = acc
                x = y
        if wet:                                  # a small, dark room: exponentially decaying filtered noise
            rng = np.random.default_rng(1); n = int(0.35 * 48000)
            ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (0.07 * 48000))
            ir = np.convolve(ir, np.ones(12) / 12, "same"); ir /= np.abs(ir).sum()
            x = np.concatenate([x, np.zeros(n)])
            x = x * (1 - wet) + np.convolve(x, ir)[: len(x)] * wet * 8
        x *= 10 ** (peak / 20) / (np.abs(x).max() + 1e-9)
        st = (np.stack([x, x], 1) * 32767).astype(np.int16)
        with wave.open(os.path.join(OUT, f"{name}.wav"), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000); w.writeframes(st.tobytes())
        print(f"{name:8s} {len(x) / 48000:5.2f}s  peak {peak} dB")


if __name__ == "__main__":
    main()
