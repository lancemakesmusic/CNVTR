# Packaging & distributing CNVTR

How to build installers and make CNVTR available for download like commercial software.

---

## 1. Build the installers

On your machine, run:

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

1. Create a **GitHub repository** for CNVTR (public or private).
2. Push your code and create a **release** (e.g. tag `v1.0.0`).
3. In that release, **attach** the installer files:
   - `CNVTR Setup 1.0.0.exe` (Windows)
   - `CNVTR-1.0.0.dmg` (macOS)
4. Add short release notes (what’s new, system requirements).
5. Share the release URL, e.g. `https://github.com/YourName/CNVTR/releases/latest`.

Users click “Download” for their OS. No cost, no server to maintain.

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

- **yt-dlp:** Already bundled if you have the `yt-dlp/` folder in the project (it’s included in the installer). Otherwise users must install it.
- **FFmpeg:** Not bundled by default. Either:
  - Tell users to install FFmpeg and add it to PATH (document in README / download page), or
  - Bundle FFmpeg in the app (e.g. put it in `ffmpeg/` and ship it; your backend already supports that).

Mention on the download page: “Requires FFmpeg on your system PATH, or download the version that includes FFmpeg.”

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

## 5. Automated builds (CI) — build Mac on Windows

You can’t build a macOS `.dmg` on a Windows PC; you need a Mac or a cloud Mac. This repo includes **GitHub Actions** to build both installers in the cloud.

**How to use:**

1. Push your code to GitHub.
2. **Option A:** In the repo go to **Actions → Release → Run workflow**, then run.  
   **Option B:** Create a tag and push: `git tag v1.0.0` then `git push origin v1.0.0`.
3. When the workflow finishes, open the run and download the **cnvtr-windows** and **cnvtr-macos** artifacts (the `.exe` and `.dmg`).

The workflow (`.github/workflows/release.yml`) runs `npm run build:win` on Windows and `npm run build:mac` on macOS, then uploads the installers as artifacts.

---

## 6. Checklist before publishing

- [ ] Bump `version` in `package.json`.
- [ ] Ensure `yt-dlp/` (and optionally `ffmpeg/`) is in the repo so the installer includes them.
- [ ] Add `assets/icon.ico` (Windows) and `assets/icon.icns` (macOS) so the app has an icon.
- [ ] Run `npm run build:win` (and/or `build:mac`) and test the installer on a clean machine or VM.
- [ ] Write release notes and document FFmpeg requirement (or that it’s bundled).
- [ ] Upload the installer(s) to GitHub Releases (or your site) and link from the download page.

After that, you can share the release or download link so others can install CNVTR like any other program.
