"""Downloads the reel's sound effects and prepares them (trim, fades, level) -> public/sfx/<name>.wav (48 kHz stereo).

Sources:
- Kenney "Interface Sounds", "UI Audio", "Impact Sounds" (kenney.nl), CC0.
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

# name: (source, trim start s, length s or None, fade in s, fade out s, peak dBFS)
RECIPES = {
    "click":   (("ui", "mouseclick1.ogg"), 0, None, 0, 0.005, -15),
    "release": (("ui", "mouserelease1.ogg"), 0, None, 0, 0.005, -20),
    "tick":    (("interface", "select_002.ogg"), 0, None, 0, 0.004, -21),
    "pop":     (("mixkit", 3005), 0, None, 0, 0.02, -14),          # Explainer video pops whoosh light pop
    "pop2":    (("interface", "pluck_001.ogg"), 0, None, 0, 0.02, -17),
    "air":     (("mixkit", 168), 0, None, 0.02, 0.15, -15),        # Fast air sweep transition
    "sweep":   (("mixkit", 166), 0, None, 0.01, 0.12, -13),        # Fast small sweep transition
    "bright":  (("mixkit", 175), 0.1, None, 0.03, 0.08, -17),      # Short transition sweep
    "thud":    (("impact", "impactSoft_heavy_002.ogg"), 0, None, 0, 0.05, -6),
    "chime":   (("mixkit", 2867), 0, 1.0, 0, 0.3, -13),            # Confirmation tone
    "zoomhit": (("mixkit", 772), 0, None, 0.02, 0.2, -9),          # Quick zoom impact
    "punch":   (("impact", "impactPunch_heavy_002.ogg"), 0, None, 0, 0.05, -9),
    "pencil":  (("mixkit", 3011), 0, 0.95, 0.01, 0.12, -16),       # Explainer video writing pencil
    "rewind":  (("mixkit", 1092), 0.75, None, 0.12, 0.1, -11),     # Fast tape rewind cinematic transition
    "whoosh":  (("mixkit", 1490), 0, 1.2, 0.02, 0.3, -9),          # Fast whoosh transition
    "land":    (("impact", "impactSoft_medium_001.ogg"), 0, None, 0, 0.04, -9),
    "shimmer": (("interface", "glass_004.ogg"), 0, None, 0, 0.2, -16),
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
    for name, (src, t0, length, fi, fo, peak) in RECIPES.items():
        x = decode(source(src))
        a = int(t0 * 48000); b = len(x) if length is None else min(len(x), a + int(length * 48000))
        x = x[a:b].copy()
        n_in, n_out = int(fi * 48000), int(fo * 48000)
        if n_in: x[:n_in] *= np.linspace(0, 1, n_in)
        if n_out: x[-n_out:] *= np.linspace(1, 0, n_out)
        x *= 10 ** (peak / 20) / (np.abs(x).max() + 1e-9)
        st = (np.stack([x, x], 1) * 32767).astype(np.int16)
        with wave.open(os.path.join(OUT, f"{name}.wav"), "wb") as w:
            w.setnchannels(2); w.setsampwidth(2); w.setframerate(48000); w.writeframes(st.tobytes())
        print(f"{name:8s} {len(x) / 48000:5.2f}s  peak {peak} dB")


if __name__ == "__main__":
    main()
