#!/usr/bin/env node
/**
 * Downloads the official yt-dlp standalone binary for the current OS into yt-dlp/
 * so the packaged app works without a system install. Run before vite/electron-builder.
 */
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');

const ROOT = path.join(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'yt-dlp');

const ASSETS = {
  darwin: { remoteName: 'yt-dlp_macos', localName: 'yt-dlp_macos' },
  win32: { remoteName: 'yt-dlp.exe', localName: 'yt-dlp.exe' },
  linux: { remoteName: 'yt-dlp', localName: 'yt-dlp' },
};

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }
  await fs.promises.mkdir(path.dirname(dest), { recursive: true });
  const out = fs.createWriteStream(dest);
  await pipeline(res.body, out);
}

async function main() {
  const plat = process.platform;
  const spec = ASSETS[plat];
  if (!spec) {
    console.warn(`bundle-ytdlp: no asset for platform "${plat}", skipping.`);
    process.exit(0);
  }
  const base = 'https://github.com/yt-dlp/yt-dlp/releases/latest/download';
  const url = `${base}/${spec.remoteName}`;
  const dest = path.join(OUT_DIR, spec.localName);
  console.log(`bundle-ytdlp: ${url} -> ${dest}`);
  await download(url, dest);
  if (plat !== 'win32') {
    fs.chmodSync(dest, 0o755);
  }
  console.log('bundle-ytdlp: done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
