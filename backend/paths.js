/**
 * Project / install root: dev = repo root; packaged = app.asar.unpacked (bundled binaries live here).
 */
const path = require('path');
const fs = require('fs');

let app = null;
try {
  ({ app } = require('electron'));
} catch (_) {
  /* non-Electron context */
}

function getAppRoot() {
  if (app && app.isPackaged && process.resourcesPath) {
    const unpacked = path.join(process.resourcesPath, 'app.asar.unpacked');
    if (fs.existsSync(unpacked)) return unpacked;
  }
  return path.resolve(__dirname, '..');
}

/**
 * Binaries cannot execute from inside app.asar; ffmpeg-static lives under node_modules
 * and is listed in asarUnpack, so remap .../app.asar/... to .../app.asar.unpacked/...
 */
function resolveAsarBinaryPath(binaryPath) {
  if (!binaryPath || typeof binaryPath !== 'string') return binaryPath;
  const marker = `${path.sep}app.asar${path.sep}`;
  if (binaryPath.includes(marker)) {
    const alt = binaryPath.replace(marker, `${path.sep}app.asar.unpacked${path.sep}`);
    if (fs.existsSync(alt)) return alt;
  }
  return binaryPath;
}

module.exports = { getAppRoot, resolveAsarBinaryPath };
