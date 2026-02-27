# CNVTR

**CNVTR** converts public media URLs (YouTube, Instagram, X, TikTok, SoundCloud, Vimeo, Facebook) into high-quality downloadable audio (MP3, WAV, FLAC). Built for creators, DJs, producers, and editors.

- **Professional grade** — 320kbps MP3, lossless WAV, metadata & album art
- **Batch processing** — Queue multiple URLs, pause/resume/cancel
- **Modern dark UI** — Matte black + electric blue, minimal and fast

---

## Requirements

- **Node.js** 18+
- **yt-dlp** — [Install](https://github.com/yt-dlp/yt-dlp#installation) and ensure `yt-dlp` (or `yt-dlp.exe` on Windows) is on your PATH, or place it in `CNVTR/yt-dlp/`
- **FFmpeg** — [Install](https://ffmpeg.org/download.html) and ensure `ffmpeg` is on your PATH, or place it in `CNVTR/ffmpeg/`

---

## Quick start

```bash
npm install
npm run electron:dev
```

- **Dev:** Vite dev server + Electron; app loads from `http://localhost:5173`.
- First launch shows **Terms of Use**; accept to continue.

---

## Build installers

```bash
npm run build        # all platforms
npm run build:win    # Windows (NSIS .exe installer)
npm run build:mac    # macOS (.dmg)
```

Output is in `release/`. For Windows you need `assets/icon.ico`; for macOS, `assets/icon.icns`. See `assets/ICONS.md`.  
On Windows, the build disables code signing by default (`signAndEditExecutable: false`) so the installer can be created without elevated privileges.

**Distributing to other computers:** See **[docs/DISTRIBUTION.md](docs/DISTRIBUTION.md)** for packaging, hosting (e.g. GitHub Releases), code signing, and CI.

---

## Project structure

```
CNVTR/
├── main.js              # Electron main process
├── preload.js           # Preload script (IPC bridge)
├── index.html           # Entry HTML
├── renderer/            # React UI
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   └── styles/
├── backend/             # Node (runs in main process)
│   ├── platforms.js     # URL validation, platform detection
│   ├── downloader.js    # yt-dlp wrapper
│   ├── converter.js     # FFmpeg conversion
│   ├── metadata.js      # ID3 / album art
│   └── queue.js         # Batch queue, pause/resume
├── assets/              # Icons (see ICONS.md)
├── ffmpeg/              # Optional: bundled FFmpeg
└── yt-dlp/              # Optional: bundled yt-dlp
```

---

## Features (MVP)

| Feature | Description |
|--------|-------------|
| **URL input** | Single or batch paste; drag-and-drop; validation; supported platforms detected |
| **Formats** | MP3 (up to 320kbps), WAV, FLAC |
| **Quality** | Standard / High / Studio / Lossless presets; bitrate, sample rate, normalize, trim, mono, remove silence |
| **Queue** | Per-file progress, pause/resume/cancel, auto-retry on failure |
| **Metadata** | Title, artist, thumbnail; ID3 for MP3; album art; file naming templates |
| **Output** | Choose folder; open folder after download; history panel |
| **Legal** | Terms of Use on first launch; disclaimer (public content, no DRM bypass) |

---

## Legal & compliance

- **Terms of Use** appear on first launch. User must accept to continue.
- User is responsible for rights; only **public** content is supported.
- No DRM circumvention; platform rate limits must be respected.

---

## Optional: bundled yt-dlp / FFmpeg

- **yt-dlp:** Put `yt-dlp` (Unix) or `yt-dlp.exe` (Windows) in `CNVTR/yt-dlp/`. The app will use it instead of PATH.
- **FFmpeg:** Put `ffmpeg` (and optionally `ffprobe`) in `CNVTR/ffmpeg/` (or `ffmpeg.exe` on Windows). The app will use it instead of PATH.

---

## Landing page copy (for marketing site)

**Headline:** Turn any public link into studio-ready audio.

**Subhead:** CNVTR turns YouTube, Instagram, TikTok, and more into MP3 or WAV in one click. Built for DJs, producers, and editors who need fast, reliable conversion—batch support, metadata, and a clean dark interface.

**CTA:** Download for Windows or Mac.

---

## License

MIT.
