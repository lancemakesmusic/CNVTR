# Packaging & distributing CNVTR

How to build installers and make CNVTR available for download like commercial software.

---

## 1. Build the installers

### Default (all-in-one for end users)

`npm run build:win` and `npm run build:mac` already run **`npm run bundle:deps`**, which downloads **yt-dlp** for the current OS into `yt-dlp/`. **FFmpeg** and **ffprobe** are bundled via **`ffmpeg-static`** / **`ffprobe-static`** (no separate FFmpeg install for users).

| Platform | Command | Output |
|----------|---------|--------|
| **Windows** | `npm run build:win` | `release/CNVTR Setup x.y.z.exe` |
| **macOS** | `npm run build:mac` | `release/CNVTR-x.y.z*.dmg` |

### Optional: full `ffmpeg/` folder on disk

If you prefer shipping binaries under `ffmpeg/` (instead of relying on npm static builds only), run **`npm run bundle:ci:win`** or **`npm run bundle:ci:mac`** before `vite build` (see `scripts/`). The app prefers `ffmpeg/` when present.

- Build **Windows** installers on a Windows PC.
- Build **macOS** installers on a Mac (or use CI; see below).

After the build, the `release/` folder contains the installer (and `win-unpacked/` on Windows).

Bump `version` in `package.json` before each release so filenames match.

---

## 2. Where to host the files (so others can download)

### Option A: GitHub Releases (free, common for indie apps)

**Automated (this repo):** Push a **version tag** like `v1.0.0`. The **Release** workflow builds Windows + macOS installers (with yt-dlp and FFmpeg bundled), then **creates a GitHub Release** and attaches the `.exe` and `.dmg`. Share:

`https://github.com/YourUsername/CNVTR/releases/latest`

Step-by-step for first-time GitHub setup: **[SHARE-ON-GITHUB.md](SHARE-ON-GITHUB.md)**.

**Manual:** You can still build locally, open **Releases → Draft**, and upload the same files yourself. Release notes can describe system requirements (Windows 10+, macOS, internet).

### Option B: Your own website

- Put the `.exe` and `.dmg` on your server or CDN.
- Add a “Download” page with two buttons/links (Windows / Mac) and optional direct links.
- Example: `https://yoursite.com/cnvtr/CNVTR-Setup-1.0.0.exe`.

### Option C: Other platforms

- **itch.io** — good for indie tools; upload the installer or a zip of `win-unpacked`.
- **Microsoft Store** — possible for Windows; requires a developer account and store packaging.
- **Mac App Store** — requires Apple developer account and sandboxing; often not worth it for this type of app.

---

## 3. What users need (dependencies)

- **Nothing extra** for a normal release build: **yt-dlp** is bundled via `bundle:deps`, and **FFmpeg/ffprobe** ship with the app via **`ffmpeg-static`** / **`ffprobe-static`**.
- **Internet** is required to fetch media from YouTube and other platforms.
- Optional: place custom binaries in `yt-dlp/` or `ffmpeg/` before building; the app prefers those paths.

---

## 4. Code signing (optional but recommended)

Without signing, Windows may show “Unknown publisher” and SmartScreen warnings; macOS may block the app until the user right‑clicks → Open.

**Windows**

- Get a **code signing certificate** (e.g. from DigiCert, Sectigo, or similar).
- In `package.json` → `build.win`, set `signAndEditExecutable: true` and set `certificateFile`, `certificatePassword`, etc. (see [electron-builder docs](https://www.electron.build/code-signing)).
- Build on Windows with the cert installed; the built `.exe` will be signed.

**macOS**

- Enroll in the **Apple Developer Program** and create an “Developer ID Application” certificate.
- Configure signing in `package.json` → `build.mac` (e.g. `identity`, `hardenedRuntime`, `gatekeeperAssess`) and build on a Mac.

We currently have signing **disabled** on Windows so you can build without a cert; turn it on when you have one.

---

## 5. Automated builds (CI)

You can’t build a macOS `.dmg` on a Windows PC; you need a Mac or **GitHub Actions** (macOS runner).

**Publish installers for download (recommended):**

1. Push your code to GitHub.
2. `git tag v1.0.0 && git push origin v1.0.0` (use your real version).
3. Wait for the **Release** workflow. It runs **`npm run bundle:deps`**, tests, lint, builds both platforms, then **publishes a GitHub Release** with the `.exe` and `.dmg`.

**Test builds without a Release:** **Actions → Release → Run workflow** still produces **workflow artifacts** (download from the run summary), but does **not** create a GitHub Release unless the run was triggered by a **tag push**.

Workflow file: `.github/workflows/release.yml`.

---

## 6. Checklist before publishing

- [ ] Bump `version` in `package.json`.
- [ ] Run `npm run build:win` / `npm run build:mac` (includes `bundle:deps` for **yt-dlp**). Network required for that download step.
- [ ] (Optional) Run `npm run bundle:ci:*` if you want a full `ffmpeg/` directory in the shipped app.
- [ ] (Optional) Add `assets/icon.ico` / `assets/icon.icns` for branding (`electron-builder.config.js`).
- [ ] Test the installer from `release/` on a clean machine or VM.
- [ ] Push a **`v*`** tag so the Release workflow publishes to GitHub, or upload installers manually.
- [ ] Point your README “Download” link at `https://github.com/<you>/CNVTR/releases/latest`.

Build configuration: **`electron-builder.config.js`** (referenced from `package.json` via `"extends"`).
