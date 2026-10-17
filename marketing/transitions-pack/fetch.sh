#!/usr/bin/env bash
# The user's transition clips (Google Drive, shared 15 Oct 2026):
#   https://drive.google.com/drive/folders/18-kIK8Od-qMZfv2XDctbLxGCsBcOE6OG
# Reels use these for transitions instead of built-in ones (see /CLAUDE.md). `./fetch.sh` downloads every clip listed in
# manifest.tsv (Drive id <TAB> file name) into files/, skipping ones already there.
set -e
cd "$(dirname "$0")"
mkdir -p files
while IFS=$'\t' read -r id name; do
  [ -s "files/$name" ] && continue
  curl -sSfL -o "files/$name" "https://drive.usercontent.google.com/download?id=$id&export=download&confirm=t" || echo "failed: $name"
done < manifest.tsv
ls files | wc -l
