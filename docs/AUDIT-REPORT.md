# CNVTR — Code quality & functionality audit

**Date:** Pre–release (full push & .com integration)  
**Scope:** Main process, preload, backend, renderer, config, security, build.

---

## Summary

- **Status:** Ready for full push and merkabaent.com integration.
- **Build:** Windows installer builds successfully (`npm run build:win`).
- **Fixes applied:** Input validation, IPC guards, optional chaining, and queue/renderer error handling.

---

## 1. Main process (`main.js`)

| Check | Status |
|-------|--------|
| Context isolation, no nodeIntegration in renderer | OK |
| Preload path resolved from __dirname | OK |
| Dev vs prod URL (localhost vs file) | OK |
| IPC handlers guard against missing/invalid args | Fixed |
| history-add: reject null/undefined entry | Fixed |
| embed-metadata: accept opts object safely | Fixed |
| open-folder: shell.openPath (async, no await — acceptable) | OK |

---

## 2. Preload (`preload.js`)

| Check | Status |
|-------|--------|
| Only contextBridge.exposeInMainWorld('cnvtr', …) | OK |
| All IPC channels match main.js handlers | OK |
| on() returns unsubscribe function | OK |

---

## 3. Backend

### Queue (`backend/queue.js`)

| Check | Status |
|-------|--------|
| startJob validates options and urls array | Fixed |
| runQueue guards against empty urls | Fixed |
| getOutputPath: duplicate filenames get (1), (2), … | OK |
| Temp file cleanup on success/failure | OK |
| Pause/resume/cancel state | OK |
| queue-error emitted on runQueue catch | OK |

### Downloader (`backend/downloader.js`)

| Check | Status |
|-------|--------|
| yt-dlp path: bundled (win/mac/unix) or PATH | OK |
| ENOENT → user-friendly message | OK |
| Accept download success when file exists even if exit code ≠ 0 | OK |
| fetchInfo: private/unavailable message normalized | OK |
| validateUrls: array or single URL | OK |

### Converter (`backend/converter.js`)

| Check | Status |
|-------|--------|
| convert() rejects when opts missing/invalid | Fixed |
| FFmpeg path: bundled or PATH | OK |
| Trim: start/end validated, invalid duration skipped | OK |
| isFfmpegAvailable try/catch | OK |

### Metadata (`backend/metadata.js`)

| Check | Status |
|-------|--------|
| embedMetadata: return early if no filePath | Fixed |
| ID3 only for .mp3; cover download failure ignored | OK |

### Platforms (`backend/platforms.js`)

| Check | Status |
|-------|--------|
| URL validation and platform detection | OK |
| Duplicate URL detection | OK |

---

## 4. Renderer

### App.jsx

| Check | Status |
|-------|--------|
| Optional chaining on window.cnvtr for all calls | Fixed |
| handleConvert checks startJob result, logs error | Fixed |
| Terms/outputDir load failure doesn’t hang UI | OK |
| queue-error and job-done listeners | OK |
| Requirements banner (yt-dlp + FFmpeg) | OK |

### UrlInput, QueuePanel, HistoryPanel, LogPanel, ConversionOptions, TermsModal

| Check | Status |
|-------|--------|
| validateUrls with optional chaining | Fixed |
| Queue progress map and job status display | OK |
| History: open folder, list from storage | OK |
| No direct node/electron access | OK |

---

## 5. Config & build

| Check | Status |
|-------|--------|
| package.json main, scripts, build.files | OK |
| build.files includes yt-dlp, ffmpeg (optional) | OK |
| Vite base: './' for Electron | OK |
| index.html CSP (script, style, img, connect) | OK |

---

## 6. Security

| Check | Status |
|-------|--------|
| Renderer: no nodeIntegration, contextIsolation | OK |
| Preload: only exposed API, no direct require to renderer | OK |
| IPC: no arbitrary shell execution; openPath for user dirs only | OK |
| No sensitive data in frontend or logs | OK |
| HTTPS for thumbnail fetch (metadata) | OK |

---

## 7. Edge cases covered

- Empty or invalid URLs: validated before job start; startJob returns error.
- Missing yt-dlp/FFmpeg: banner + clear errors in queue/log.
- Duplicate output filenames: auto (1), (2), …
- yt-dlp exit code 1 but file present: treated as success.
- Invalid trim (e.g. end ≤ start): skipped in converter.
- Terms/history storage failure: caught; UI still usable.

---

## 8. Recommended before push

1. **Run once more:** `npm run electron:dev` → accept terms, convert one URL, check queue and log.
2. **Build:** `npm run build:win` (and Mac build if applicable).
3. **.gitignore:** Ensure `node_modules/`, `dist/`, `release/` are ignored (ffmpeg/ and yt-dlp/ can be committed if you ship them).
4. **Wix:** Option A page with download buttons to GitHub Releases; ensure a release exists with Windows and Mac installers attached.

---

## 9. Files changed in this audit

- `main.js` — history-add and embed-metadata guards.
- `backend/queue.js` — startJob validation, runQueue urls guard.
- `backend/converter.js` — convert() opts guard.
- `backend/metadata.js` — embedMetadata filePath guard.
- `renderer/App.jsx` — optional chaining, startJob result check.
- `renderer/components/UrlInput.jsx` — optional chaining on validateUrls.
- `package.json` — build.files includes `ffmpeg/**/*` (optional; remove if you don’t ship FFmpeg).

No breaking changes; behavior is unchanged for normal use.
