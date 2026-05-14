# Packaging & distributing CNVTR

How to build installers and make CNVTR available for download like commercial software.

---

## 1. Build the installers

### All-in-one (recommended before `npm run build:*`)

So the installer **includes yt-dlp and FFmpeg** (end users do not install them separately):

| Platform | Command |
|----------|---------|
| **Windows** | `npm run bundle:ci:win` |
| **macOS** | `npm run bundle:ci:mac` |

These scripts download current binaries into `yt-dlp/` and `ffmpeg/`. The same steps run automatically in **GitHub Actions** before each release build.

Then build:

| Platform | Command | Output |
|----------|---------|--------|
| **Windows** | `npm run build:win` | `release/CNVTR Setup 1.0.0.exe` (installer) |
| **macOS** | `npm run build:mac` | `release/CNVTR-1.0.0.dmg` |

- Build **Windows** installers on a Windows PC.
- Build **macOS** installers on a Mac (or use CI; see below).

After the build, the `release/` folder contains:

- **Windows:** `CNVTR Setup 1.0.0.exe` (run this to install), plus `win-unpacked/` (portable folder).
- **macOS:** `CNVTR-1.0.0.dmg` (disk image users double‑click to install).

Bump `version` in `package.json` before each release so filenames and the app’s “About” show the right version.

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

- **Nothing extra** if they install a **GitHub Release** build from this repo: CI bundles **yt-dlp** and **FFmpeg** into the installer.
- **Internet** is still required to fetch media from YouTube and other platforms.
- If someone builds from source **without** running the bundle scripts, they must install yt-dlp / FFmpeg or place them in `yt-dlp/` and `ffmpeg/` as described in the main README.

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
3. Wait for the **Release** workflow. It bundles **yt-dlp + FFmpeg**, runs tests and lint, builds both platforms, then **publishes a GitHub Release** with the `.exe` and `.dmg`.

**Test builds without a Release:** **Actions → Release → Run workflow** still produces **workflow artifacts** (download from the run summary), but does **not** create a GitHub Release unless the run was triggered by a **tag push**.

Workflow file: `.github/workflows/release.yml`.

---

## 6. Checklist before publishing

- [ ] Bump `version` in `package.json`.
- [ ] For **local** builds: run `npm run bundle:ci:win` / `bundle:ci:mac` (or keep your own copies in `yt-dlp/` and `ffmpeg/`). **CI** does this automatically.
- [ ] Add `assets/icon.ico` (Windows) and `assets/icon.icns` (macOS) so the app has an icon.
- [ ] Run `npm run build:win` (and/or `build:mac`) and test the installer on a clean machine or VM.
- [ ] Push a **`v*`** tag to GitHub so the Release workflow publishes installers, or upload installers manually to a GitHub Release.
- [ ] Update the **Download** link in `README.md` with your real GitHub username/repo.

After that, share `https://github.com/<you>/CNVTR/releases/latest` so others can install CNVTR like any other program.
