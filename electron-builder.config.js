const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, 'assets');
const iconIcns = path.join(assetsDir, 'icon.icns');
const iconIco = path.join(assetsDir, 'icon.ico');

const win = {
  target: ['nsis'],
  signAndEditExecutable: false,
};
if (fs.existsSync(iconIco)) win.icon = 'assets/icon.ico';

const mac = {
  target: ['dmg'],
  category: 'public.app-category.utilities',
  // Unsigned builds: avoid extra Gatekeeper noise in logs; users may still need Right-click → Open
  gatekeeperAssess: false,
};
if (fs.existsSync(iconIcns)) mac.icon = 'assets/icon.icns';

module.exports = {
  appId: 'com.cnvtr.app',
  productName: 'CNVTR',
  // Local and CI builds: never require GH_TOKEN / draft releases
  publish: null,
  directories: {
    output: 'release',
  },
  files: [
    'dist/**/*',
    'main.js',
    'preload.js',
    'backend/**/*',
    'assets/**/*',
    'yt-dlp/**/*',
    'ffmpeg/**/*',
  ],
  asarUnpack: [
    'yt-dlp/**',
    'ffmpeg/**',
    'node_modules/ffmpeg-static/**',
    'node_modules/ffprobe-static/**',
  ],
  win,
  mac,
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
  },
};
