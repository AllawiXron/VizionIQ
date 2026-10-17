#!/usr/bin/env bash
# The user's sound-effects packs on Google Drive:
#   https://drive.google.com/drive/folders/1tBq1RwjvGUFLbHziU9DfEfqJo4_rRCfu  (shared 15 Oct 2026; loose files)
#   https://drive.google.com/drive/folders/11f5ih2YdrKcxYcawC9mRx7CK99Yb_dl_  (shared 9 Oct 2026; one folder per type)
# Reels and videos use ONLY these sounds (see /CLAUDE.md). `./fetch.sh` downloads every file listed in manifest.tsv
# (Drive id <TAB> path) into files/, skipping ones already there. Some ".wav"s may be MP3 inside; ffmpeg reads both.
set -e
cd "$(dirname "$0")"
mkdir -p files
while IFS=$'\t' read -r id name; do
  [ -s "files/$name" ] && continue
  mkdir -p "files/$(dirname "$name")"
  curl -sSfL -o "files/$name" "https://drive.usercontent.google.com/download?id=$id&export=download" || echo "failed: $name"
done < manifest.tsv
ls files | wc -l
