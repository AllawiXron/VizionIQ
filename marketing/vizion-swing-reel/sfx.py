"""Sound for the swing reel -> out/sfx.wav (48 kHz stereo), from out/timeline.json.
One whoosh per half swing from the user's pack (../sfx-pack, run ./fetch.sh there first), its peak on the moment the
tag passes the middle (its fastest point), panned the way the tag moves. Two whooshes alternate so it doesn't loop
the same sound ten times. No music: ask the user for a track if the reel needs one."""
import json
import subprocess

import numpy as np

SR = 48000
PACK = "../sfx-pack/files/Whooshes/"
tl = json.load(open("out/timeline.json"))
n = int(tl["duration"] * SR)
mix = np.zeros((n, 2))

def load(name):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", PACK + name, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.float32).astype(np.float64)
    env = np.convolve(np.abs(x), np.ones(2400) / 2400, "same")
    return x / np.abs(x).max(), env.argmax() / SR       # normalised sound, time of its peak

whooshes = [load("Simple Whoosh.wav"), load("Smooth And Fast Whoosh.wav")]
for k in range(tl["steps"]):
    sig, peak = whooshes[k % 2]
    mid = (k + 0.5) * tl["half"]                       # the tag passes the middle here
    i = int((mid - peak) * SR)
    j = min(n, i + len(sig))
    if i < 0:
        sig, i = sig[-i:], 0
    seg = sig[: j - i]
    # even half swings go right -> left, odd ones left -> right
    pan = np.linspace(0.8, 0.2, len(seg)) if k % 2 == 0 else np.linspace(0.2, 0.8, len(seg))
    gain = 0.42
    mix[i:j, 0] += seg * gain * np.sqrt(1 - pan)
    mix[i:j, 1] += seg * gain * np.sqrt(pan)

# short fades so the reel loops without a click
f = int(0.02 * SR)
mix[:f] *= np.linspace(0, 1, f)[:, None]
mix[-f:] *= np.linspace(1, 0, f)[:, None]
mix /= max(1.0, np.abs(mix).max() / 0.89)
pcm = (mix * 32767).astype("<i2")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", str(SR), "-ac", "2", "-i", "-", "out/sfx.wav"],
               input=pcm.tobytes(), check=True)
print("out/sfx.wav", round(n / SR, 2), "s")
