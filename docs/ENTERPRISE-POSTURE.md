# Enterprise quality posture

This document summarizes controls that align CNVTR with common **internal security / quality bar** expectations. It is not a substitute for a third-party penetration test, legal review, or formal certification.

## What is implemented in-repo

| Area | Control |
|------|---------|
| **Renderer isolation** | `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` on `BrowserWindow`. |
| **Preload surface** | `contextBridge` API only; renderer **cannot** subscribe to arbitrary IPC channels (`on` allowlist). |
| **Path policy** | File/folder operations from IPC validate resolved paths against allowed roots (Downloads, userData, temp, home, and folders chosen via the OS picker or CLI `--output-dir`). |
| **Abuse limits** | URL length cap, batch size cap, `validate-urls` truncation at the same batch cap. |
| **Queue reliability** | Transient failures can **retry** (bounded); **Cancel** terminates active **yt-dlp** and **ffmpeg** child processes where possible. |
| **Logging** | JSON lines appended to `%userData%/logs/cnvtr.log` plus console (see `backend/logger.js`). |
| **Automated tests** | `npm test` — `node:test` for `safePaths`, `platforms`, `queueLogic`. |
| **Lint** | `npm run lint` — ESLint on main, preload, backend, scripts, tests. |
| **CI** | GitHub Actions workflow runs **tests + lint** on push/PR; release workflow runs tests before installers. |

## What still depends on your organization

- **Code signing & notarization** (Windows/macOS) for SmartScreen / Gatekeeper trust.
- **External audit**: SAST/DAST vendor, penetration test, threat model.
- **Telemetry**: none is built-in; if you add crash reporting, pair it with a privacy notice and data retention policy.
- **Dependency advisories**: `npm audit` is run in CI with production scope; Electron’s advisory surface evolves—review release notes on upgrades.

## Honest scoring note

No shipping application receives a literal **10/10 on every axis** without ongoing evidence (test history in CI, signed releases, external validation). The items above are the concrete engineering controls this repository implements today.
