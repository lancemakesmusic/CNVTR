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

module.exports = { getAppRoot };
