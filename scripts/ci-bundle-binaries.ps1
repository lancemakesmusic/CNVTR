# Bundle yt-dlp + FFmpeg for Windows (CI / local prep before npm run build:win)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path 'yt-dlp', 'ffmpeg' | Out-Null

Write-Host 'Downloading yt-dlp.exe...'
Invoke-WebRequest -Uri 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' -OutFile 'yt-dlp/yt-dlp.exe'

$zip = Join-Path $env:TEMP 'cnvtr-ffmpeg-win.zip'
Write-Host 'Downloading FFmpeg (BtbN win64)...'
Invoke-WebRequest -Uri 'https://github.com/BtbN/FFmpeg-Builds/releases/latest/download/ffmpeg-master-latest-win64-gpl.zip' -OutFile $zip

$dest = Join-Path $env:TEMP 'cnvtr-ffmpeg-win-unpack'
if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
Expand-Archive -Path $zip -DestinationPath $dest -Force

$ffmpeg = Get-ChildItem -Path $dest -Recurse -Filter 'ffmpeg.exe' | Select-Object -First 1
if (-not $ffmpeg) { throw 'ffmpeg.exe not found in archive' }
Copy-Item $ffmpeg.FullName -Destination 'ffmpeg/ffmpeg.exe' -Force
Write-Host "Installed ffmpeg/ffmpeg.exe from $($ffmpeg.FullName)"

$ffprobe = Get-ChildItem -Path $dest -Recurse -Filter 'ffprobe.exe' | Select-Object -First 1
if ($ffprobe) {
  Copy-Item $ffprobe.FullName -Destination 'ffmpeg/ffprobe.exe' -Force
  Write-Host 'Installed ffmpeg/ffprobe.exe'
}

Write-Host 'Bundle complete.'
