#!/usr/bin/env bash
# The Orange Coin as an EffectCraft project, ready to open: out/allawi_orange_coin_EffectCraft.zip.
# usage: EC=<path to effectcraft-cli> effectcraft/pack.sh   (run `node render.cjs sound` first)
set -euo pipefail
cd "$(dirname "$0")/.."
: "${EC:?set EC to the effectcraft-cli binary}"
NODE_PATH=/opt/node-tools/node_modules${NODE_PATH:+:$NODE_PATH} node effectcraft/export.cjs
P=$PWD/out/ec
cp effectcraft/build_reel.jsx "$P/"
mkdir -p "$P/fonts" && cp ../brand-fonts/DG-Sahabah-Reg.ttf "$P/fonts/"
# EffectCraft lets a script read files only in its project's folder, so the project is saved there first
"$EC" script --eval "1" --empty --save-as "$P/allawi_orange_coin.ecproj" >/dev/null
"$EC" script "$P/build_reel.jsx" --project "$P/allawi_orange_coin.ecproj" --save
# footage paths relative to the project file, so it opens wherever the folder is unzipped
sed -i "s#\"$P/#\"#g" "$P/allawi_orange_coin.ecproj"
if grep -q "$PWD\|/tmp/\|/home/" "$P/allawi_orange_coin.ecproj"; then echo "a machine path is left in the project" >&2; exit 1; fi
"$EC" exec footage.missing '{}' --project "$P/allawi_orange_coin.ecproj" --json | grep -q '"missing":\[\]' || { echo "missing footage" >&2; exit 1; }
rm -f out/allawi_orange_coin_EffectCraft.zip
(cd "$P" && zip -q -r -X ../allawi_orange_coin_EffectCraft.zip allawi_orange_coin.ecproj footage fonts build_reel.jsx reel.json)
echo "out/allawi_orange_coin_EffectCraft.zip"
