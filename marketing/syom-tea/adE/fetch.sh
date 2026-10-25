#!/usr/bin/env bash
# CC0 assets from Poly Haven for ad E: the rock surface for the stone slab, and two scanned plants
# (shrub 04 throws the leaf shadow from out of frame, nettle gives the fresh sprigs close to the lens).
set -e
cd "$(dirname "$0")"
mkdir -p tex models
B=https://dl.polyhaven.org/file/ph-assets
for k in diff rough nor_gl disp; do
  [ -s "tex/rock_surface_$k.jpg" ] || curl -sSfL -o "tex/rock_surface_$k.jpg" "$B/Textures/jpg/2k/rock_surface/rock_surface_${k}_2k.jpg"
done
for m in shrub_04 nettle_plant; do
  # the API lists the gltf and every file it includes, with their URLs
  curl -sSf "https://api.polyhaven.com/files/$m" | python3 -c '
import json, sys, os, subprocess
m = sys.argv[1]
g = json.load(sys.stdin)["gltf"]["2k"]["gltf"]
files = {f"{m}_2k.gltf": g["url"], **{k: v["url"] for k, v in g["include"].items()}}
for name, url in files.items():
    p = f"models/{m}/{name}"
    if not (os.path.exists(p) and os.path.getsize(p)):
        os.makedirs(os.path.dirname(p), exist_ok=True)
        subprocess.run(["curl", "-sSfL", "-o", p, url], check=True)
' "$m"
done
