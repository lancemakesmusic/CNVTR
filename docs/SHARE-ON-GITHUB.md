# Put CNVTR on GitHub so others can download it

Follow these steps once. After that, every **version tag** you push builds installers and attaches them to a **GitHub Release**.

## 1. Create the repository on GitHub

1. On GitHub, click **New repository**.
2. Name it `CNVTR` (or any name). Leave it **empty** (no README, no .gitignore) if you already have this project locally.
3. Copy the HTTPS URL, e.g. `https://github.com/YourUsername/CNVTR.git`.

## 2. Push this project from your computer

In a terminal, from your **CNVTR** folder (where `package.json` lives):

```bash
git init
git add .
git commit -m "CNVTR initial release"
git branch -M main
git remote add origin https://github.com/YourUsername/CNVTR.git
git push -u origin main
```

If the repo already exists with a remote:

```bash
git remote -v
git push -u origin main
```

## 3. Ship a downloadable release (one command flow)

1. Bump **`version`** in `package.json` if you want a new version string in filenames (e.g. `1.0.1`).
2. Commit and push:

   ```bash
   git add package.json
   git commit -m "Bump version for release"
   git push origin main
   ```

3. Create and push a **tag** whose name starts with `v` (this triggers the Release workflow and publishes assets):

   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

4. On GitHub: **Actions** → wait for **Release** workflow to finish → **Releases** (right side of repo) → open **CNVTR v1.0.0** (or your tag). You should see:

   - **Windows:** `CNVTR Setup x.y.z.exe` (or similar from electron-builder)
   - **macOS:** `CNVTR-x.y.z.dmg`

5. Share this link with anyone:

   `https://github.com/YourUsername/CNVTR/releases/latest`

They pick their OS, download, install. No Git or Node required.

## 4. Manual workflow run (no GitHub Release)

**Actions → Release → Run workflow** still builds Windows and macOS installers and uploads **workflow artifacts**, but it does **not** create a GitHub Release (that only happens on **tag push**). Use artifacts for testing; use **tags** for public downloads.

## 5. macOS note (Apple Silicon vs Intel)

CI builds the `.dmg` on **macos-latest** (Apple Silicon) with an **arm64** FFmpeg bundle. That installer is best for **M1/M2/M3** Macs. **Intel Mac** users may need to build locally with an x86_64 FFmpeg in `ffmpeg/` and run `npm run build:mac`, then share that DMG separately if needed.

## 6. README download link

After you know your repo URL, edit the **Download** section at the top of `README.md` and replace the placeholder with your real username and repo name so the “Latest release” link works.
