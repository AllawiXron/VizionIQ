#!/usr/bin/env bash
# The user's sound-effects pack (Google Drive, shared 15 Oct 2026):
#   https://drive.google.com/drive/folders/1tBq1RwjvGUFLbHziU9DfEfqJo4_rRCfu
# Reels and videos use ONLY these sounds (see /CLAUDE.md). `./fetch.sh` downloads every file listed in manifest.tsv
# (Drive id <TAB> file name) into files/, skipping ones already there. Some ".wav"s may be MP3 inside; ffmpeg reads both.
set -e
cd "$(dirname "$0")"
mkdir -p files
while IFS=$'\t' read -r id name; do
  [ -s "files/$name" ] && continue
  curl -sSfL -o "files/$name" "https://drive.usercontent.google.com/download?id=$id&export=download" || echo "failed: $name"
done < manifest.tsv
ls files | wc -l
