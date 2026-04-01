# CNVTR

**CNVTR** converts public media URLs (YouTube, Instagram, X, TikTok, SoundCloud, Vimeo, Facebook) into high-quality downloadable audio (MP3, WAV, FLAC). Built for creators, DJs, producers, and editors.

- **Professional grade** — 320kbps MP3, lossless WAV, metadata & album art
- **Batch processing** — Queue multiple URLs, pause/resume/cancel
- **Modern dark UI** — Matte black + electric blue, minimal and fast
- **One desktop app** — Frontend (React) and backend (Node in Electron main) ship together; no separate server. You only need **internet** to fetch media from URLs.

### Download for Mac / Windows (installers)

**Latest release:** [github.com/lancemakesmusic/CNVTR/releases/latest](https://github.com/lancemakesmusic/CNVTR/releases/latest) — open **Assets**, download the `.dmg` (Mac) or `.exe` (Windows).

**Publishing a new build for your team:** see **[docs/SHARE-WITH-COWORKERS.md](docs/SHARE-WITH-COWORKERS.md)** (push a `v*` tag, or upload the DMG manually).

### Self-contained installers

Release builds (`npm run build`, `npm run build:mac`, `npm run build:win`) run **`npm run bundle:deps`**, which downloads the official **yt-dlp** binary into `yt-dlp/`. **FFmpeg** and **ffprobe** ship via the **`ffmpeg-static`** and **`ffprobe-static`** npm dependencies and are unpacked from the ASAR bundle so the app runs **without** installing yt-dlp or FFmpeg on PATH. End users who install the `.dmg` or `.exe` only need **network access** to fetch media.

Optional overrides: put your own **`ffmpeg/`** (and **`ffprobe`**) or **`yt-dlp/`** binaries in the project folder — the app prefers those over the bundled tools.

---

## Requirements

- **Node.js** 18+ (for building from source)
- **To develop without bundling:** `yt-dlp` and/or **FFmpeg** on your PATH, or place binaries in `yt-dlp/` and `ffmpeg/` as described in `yt-dlp/README.md` and `ffmpeg/README.md`

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

Output is in `release/`. Icons are optional: add `assets/icon.ico` and/or `assets/icon.icns` for branded installers (see `assets/ICONS.md`); otherwise the default Electron icon is used.

**macOS (unsigned builds):** The first open may be blocked by Gatekeeper. Users can **right‑click the app → Open**, or run `xattr -dr com.apple.quarantine /path/to/CNVTR.app` after copying the app. For wide distribution, use an Apple Developer ID certificate and notarize the app (see `docs/DISTRIBUTION.md`).

On Windows, code signing is disabled by default so you can build without a certificate.

**Distributing to other computers:** **[docs/SHARE-WITH-COWORKERS.md](docs/SHARE-WITH-COWORKERS.md)** (GitHub Releases for coworkers), then **[docs/DISTRIBUTION.md](docs/DISTRIBUTION.md)** for signing and CI details.

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

## Optional: override bundled yt-dlp / FFmpeg

- **yt-dlp:** Put `yt-dlp`, `yt-dlp_macos`, or `yt-dlp.exe` in `yt-dlp/` (or use PATH). The app checks the project folder first.
- **FFmpeg:** Put `ffmpeg` and optionally `ffprobe` in `ffmpeg/` (or `ffmpeg.exe` / `ffprobe.exe` on Windows). Overrides the npm-bundled binaries when present.

---

## Landing page copy (for marketing site)

**Headline:** Turn any public link into studio-ready audio.

**Subhead:** CNVTR turns YouTube, Instagram, TikTok, and more into MP3 or WAV in one click. Built for DJs, producers, and editors who need fast, reliable conversion—batch support, metadata, and a clean dark interface.

**CTA:** Download for Windows or Mac.

---

## License

MIT.
