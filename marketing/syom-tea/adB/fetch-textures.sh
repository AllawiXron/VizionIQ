#!/usr/bin/env bash
# CC0 surface textures from Poly Haven for scene.py: smoked walnut veneer (table) and plastered wall 02 (wall).
set -e
cd "$(dirname "$0")"
mkdir -p tex
B=https://dl.polyhaven.org/file/ph-assets/Textures/jpg/2k
for a in smoked_walnut_veneer plastered_wall_02; do
  for k in diff rough nor_gl; do
    [ -s "tex/${a}_$k.jpg" ] || curl -sSfL -o "tex/${a}_$k.jpg" "$B/$a/${a}_${k}_2k.jpg"
  done
done
