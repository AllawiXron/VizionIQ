#!/usr/bin/env bash
# The client's files on Google Drive (shared with the user for the Syom Tea ads, Oct 2026):
#   https://drive.google.com/drive/folders/1DJOb43HWbobJEU51vv2YC7CvjuzR-HEb  -> files/brand (logos, Lama Sans, elements, guideline)
#   https://drive.google.com/drive/folders/1OK5oZR7kEXBCuDMPUWacf5EPqUkHxtuf  -> files/shoot (photo shoot, old copy, old designs)
# `./fetch.sh` downloads every file in manifest.tsv (Drive id <TAB> path) into files/, skipping ones already there.
# Pass a pattern to fetch only some, e.g. `./fetch.sh 'New pack|Brand Guideline|svg'`. files/ stays out of git.
set -e
cd "$(dirname "$0")"
pat="${1:-.}"
while IFS=$'\t' read -r id name; do
  [[ "$name" =~ $pat ]] || continue
  [ -s "files/$name" ] && continue
  mkdir -p "files/$(dirname "$name")"
  if [ ${#id} -gt 40 ]; then url="https://docs.google.com/document/d/$id/export?format=docx"
  else url="https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t"; fi
  curl -sSfL -o "files/$name" "$url" || echo "failed: $name"
done < manifest.tsv
find files -type f | wc -l
