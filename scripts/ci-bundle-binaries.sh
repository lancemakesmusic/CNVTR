#!/usr/bin/env bash
# Download yt-dlp + FFmpeg into ./yt-dlp and ./ffmpeg (macOS CI / local prep for release builds).
set -euo pipefail
mkdir -p yt-dlp ffmpeg

echo "Downloading yt-dlp_macos..."
curl -fsSL -o yt-dlp/yt-dlp_macos "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos"
chmod +x yt-dlp/yt-dlp_macos

TMP="${TMPDIR:-/tmp}/cnvtr-ff-mac.tar.xz"
echo "Downloading FFmpeg (BtbN macos arm64)..."
curl -fsSL -o "$TMP" "https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-macos-arm64-gpl.tar.xz"

EXDIR="${TMPDIR:-/tmp}/cnvtr-ff-unpack"
rm -rf "$EXDIR"
mkdir -p "$EXDIR"
tar -xf "$TMP" -C "$EXDIR"

FFMPEG=$(find "$EXDIR" -type f -name ffmpeg | head -n 1)
if [[ -z "$FFMPEG" ]]; then
  echo "ffmpeg binary not found in archive" >&2
  exit 1
fi
cp "$FFMPEG" ffmpeg/ffmpeg
chmod +x ffmpeg/ffmpeg
echo "Installed ffmpeg/ffmpeg from $FFMPEG"

FFPROBE=$(find "$EXDIR" -type f -name ffprobe | head -n 1 || true)
if [[ -n "${FFPROBE:-}" ]]; then
  cp "$FFPROBE" ffmpeg/ffprobe
  chmod +x ffmpeg/ffprobe
  echo "Installed ffmpeg/ffprobe"
fi

echo "Bundle complete."
