#!/usr/bin/env bash
# Frames of the EffectCraft project next to the same frames of the page, as one sheet: out/ec/compare.jpg.
# usage: compare.sh <effectcraft-cli> <project.ecproj> [times…]
set -euo pipefail
cd "$(dirname "$0")/.."
CLI=$1 PROJ=$2
shift 2
T=${*:-0.5 2.3 3.8 5.6 6.9 8.0 9.6 11.9 12.4 13.4 15.6 16.9 19.5 22.2 24.0 25.2 26.2 27.4 29.5 32.8 34.6 36.0 37.8 39.0 40.3}
D=out/ec/frames
rm -rf "$D" && mkdir -p "$D"
NODE_PATH=/opt/node-tools/node_modules${NODE_PATH:+:$NODE_PATH} node render.cjs stills $T >/dev/null
i=0
for t in $T; do
  n=$(printf %02d $i)
  "$CLI" render-frame --project "$PROJ" --comp allawi_orange_coin --time "$t" --out "$D/ec-$n.png" >/dev/null
  ffmpeg -v error -y -i "out/still-$(printf %.2f "$t").png" -i "$D/ec-$n.png" -filter_complex "[0]scale=270:480[a];[1]scale=270:480[b];[a][b]hstack,drawtext=text='$t':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6" "$D/pair-$n.png"
  i=$((i + 1))
done
ffmpeg -v error -y -pattern_type glob -i "$D/pair-*.png" -filter_complex "tile=5x$(((i + 4) / 5))" -frames:v 1 out/ec/compare.jpg
echo "out/ec/compare.jpg ($i pairs: page left, EffectCraft right)"
