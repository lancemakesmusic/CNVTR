# Share CNVTR so others can download (GitHub Releases)

Your repo: **https://github.com/lancemakesmusic/CNVTR**

After you publish a release, anyone can download installers from:

**https://github.com/lancemakesmusic/CNVTR/releases/latest**

---

## Option A — Automated (recommended)

The **Release** workflow builds the Mac `.dmg` and Windows `.exe` and attaches them to a **GitHub Release** when you push a **version tag**.

### One-time: commit and push your latest code

```bash
cd /path/to/CNVTR
git add -A
git status   # review
git commit -m "Release: bundled deps, GitHub Releases upload"
git push origin main
```

### Cut a release (example: version 1.0.0)

1. Bump **`version`** in `package.json` if needed (should match the tag, e.g. `1.0.0`).
2. Commit and push that change to `main`.
3. Create and push a tag (same version with a `v` prefix):

```bash
git tag v1.0.0
git push origin v1.0.0
```

4. Open **GitHub → Actions** and wait for the **Release** workflow to finish (green check).
5. Open **https://github.com/lancemakesmusic/CNVTR/releases** — you should see **v1.0.0** with the `.dmg` and `.exe` attached.

### Send your coworker (Mac)

Share this link (always points at the newest release):

**https://github.com/lancemakesmusic/CNVTR/releases/latest**

They click **Assets**, download **`CNVTR-*-arm64.dmg`** (Apple Silicon) or the **x64** DMG if you built for Intel.

**First launch:** If macOS blocks the app (unsigned build), they use **Right‑click → Open** on the app in Applications, or run:

`xattr -dr com.apple.quarantine /Applications/CNVTR.app`

---

## Option B — Manual upload (no Actions)

1. Run `npm run build:mac` locally — DMG is in **`release/`**.
2. GitHub → **Releases** → **Draft a new release**.
3. Choose tag `v1.0.0` (create new tag if needed), title e.g. `CNVTR 1.0.0`.
4. Drag **`release/CNVTR-1.0.0-arm64.dmg`** into **Attach binaries**.
5. **Publish release**.
6. Share **https://github.com/lancemakesmusic/CNVTR/releases/latest**.

---

## Troubleshooting

- **Workflow failed:** Open the failed job log on the **Actions** tab; fix the error (often `npm ci` / lockfile or build script). You can still use **Option B** with a local DMG.
- **Release exists but no files:** Re-run the workflow for that tag or upload the DMG manually on the release page (**Edit release** → attach file).
