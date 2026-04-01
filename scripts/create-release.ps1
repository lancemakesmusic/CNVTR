# Create GitHub release v1.0.0 and upload Windows installer.
# Run from project root. Requires: gh auth login (once).

$ErrorActionPreference = "Stop"
$repo = "lancemakesmusic/CNVTR"
$tag = "v1.0.0"
$exe = "release\CNVTR Setup 1.0.0.exe"

# Create release (fails if tag already exists; delete tag/release on GitHub first if re-running)
Write-Host "Creating release $tag..."
gh release create $tag $exe `
  --repo $repo `
  --title "CNVTR 1.0.0" `
  --notes "First public release.

**Windows:** Run the installer. Install FFmpeg and add it to PATH (or place ffmpeg.exe in the app's ffmpeg folder).

**Mac:** Open the .dmg and drag CNVTR to Applications. Install FFmpeg (e.g. \`brew install ffmpeg\`).

- yt-dlp is included with the app.
- Supports YouTube, Instagram, X, TikTok, SoundCloud, Vimeo, Facebook.
- MP3 up to 320 kbps, WAV, FLAC. Batch conversion, metadata, album art."

Write-Host "Done. Release: https://github.com/$repo/releases/tag/$tag"
Write-Host "Latest: https://github.com/$repo/releases/latest"
