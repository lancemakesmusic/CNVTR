# FFmpeg for CNVTR

Place **ffmpeg.exe** (and optionally **ffprobe.exe**) in this folder so CNVTR can convert audio without needing FFmpeg on your system PATH.

---

## You need the Windows *executable*, not the source

- **❌ ffmpeg-8.0.1.tar.xz** — This is **source code**. It won’t run on Windows by itself.
- **✅ A .zip that contains ffmpeg.exe** — Use one of the pre-built Windows builds below.

---

## Download a Windows build

1. **Option A — gyan.dev (recommended)**  
   - Go to: **https://www.gyan.dev/ffmpeg/builds/**  
   - Download **ffmpeg-release-essentials.zip** (or the latest “essentials” build).  
   - Unzip the file. Inside you’ll see a folder like `ffmpeg-8.0.1-essentials_build`.  
   - Open the **bin** folder inside it. You’ll find **ffmpeg.exe** (and ffprobe.exe).

2. **Option B — BtbN (GitHub)**  
   - Go to: **https://github.com/BtbN/FFmpeg-Builds/releases**  
   - Download the **win64** .zip (e.g. `ffmpeg-master-latest-win64-gpl.zip`).  
   - Unzip it and open the **bin** folder to get **ffmpeg.exe**.

---

## Install into CNVTR

1. Copy **ffmpeg.exe** from the **bin** folder of the zip you unzipped.  
2. Paste it into **this folder**:  
   `C:\Users\admin\CNVTR\ffmpeg\`  
   So the file path is:  
   `C:\Users\admin\CNVTR\ffmpeg\ffmpeg.exe`  
3. (Optional) Copy **ffprobe.exe** into the same folder.  
4. Restart CNVTR. The “FFmpeg not found” banner should disappear and conversion will work.
