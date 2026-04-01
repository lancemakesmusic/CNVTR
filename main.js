const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

const preloadPath = path.join(__dirname, 'preload.js');
const indexUrl = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, 'dist', 'index.html')}`;

function createWindow() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  const winOpts = {
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0a',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  };
  if (fs.existsSync(iconPath)) winOpts.icon = iconPath;
  mainWindow = new BrowserWindow(winOpts);

  mainWindow.loadURL(indexUrl);
  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ---------- IPC handlers (delegate to backend) ----------
const backendPath = path.join(__dirname, 'backend');
const downloader = require(path.join(backendPath, 'downloader.js'));
const converter = require(path.join(backendPath, 'converter.js'));
const metadata = require(path.join(backendPath, 'metadata.js'));
const queue = require(path.join(backendPath, 'queue.js'));

ipcMain.handle('get-default-output-dir', () => {
  return path.join(app.getPath('downloads'), 'CNVTR');
});

ipcMain.handle('select-output-dir', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Choose output folder',
  });
  if (canceled || !filePaths.length) return null;
  return filePaths[0];
});

ipcMain.handle('open-folder', (_, dir) => {
  const { shell } = require('electron');
  if (dir && fs.existsSync(dir)) shell.openPath(dir);
});

ipcMain.handle('check-requirements', () => {
  let ytDlpOk = false;
  let ffmpegOk = false;
  try {
    ytDlpOk = downloader.isYtDlpAvailable();
  } catch (e) {
    console.error('check yt-dlp', e);
  }
  try {
    ffmpegOk = converter.isFfmpegAvailable();
  } catch (e) {
    console.error('check ffmpeg', e);
  }
  return {
    ytDlpOk,
    ytDlpMessage: downloader.getYtDlpMissingMessage(),
    ffmpegOk,
    ffmpegMessage: converter.getFfmpegMissingMessage(),
  };
});

ipcMain.handle('validate-urls', (_, urls) => {
  return downloader.validateUrls(urls);
});

ipcMain.handle('fetch-info', async (_, url) => {
  return downloader.fetchInfo(url);
});

ipcMain.handle('start-job', async (_, options) => {
  return queue.startJob(options, (event, data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send(event, data);
    }
  });
});

ipcMain.handle('queue-pause', () => queue.pause());
ipcMain.handle('queue-resume', () => queue.resume());
ipcMain.handle('queue-cancel', () => queue.cancel());
ipcMain.handle('get-queue-status', () => queue.getStatus());

ipcMain.handle('embed-metadata', async (_, opts) => {
  if (!opts || typeof opts !== 'object') return;
  const { filePath, info, coverUrl } = opts;
  return metadata.embedMetadata(filePath, info, coverUrl);
});

ipcMain.handle('convert-to-format', async (_, opts) => {
  return converter.convert(opts);
});

ipcMain.handle('terms-accepted', () => {
  const storePath = path.join(app.getPath('userData'), 'terms-accepted.json');
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
});

ipcMain.handle('terms-check', () => {
  const storePath = path.join(app.getPath('userData'), 'terms-accepted.json');
  try {
    const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    return !!data.accepted;
  } catch {
    return false;
  }
});

ipcMain.handle('history-get', () => {
  const storePath = path.join(app.getPath('userData'), 'history.json');
  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf8') || '[]');
  } catch {
    return [];
  }
});

ipcMain.handle('history-add', (_, entry) => {
  if (!entry || typeof entry !== 'object') return;
  const storePath = path.join(app.getPath('userData'), 'history.json');
  try {
    let list = [];
    if (fs.existsSync(storePath)) {
      list = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    }
    list.unshift({ ...entry, id: entry.id || Date.now(), at: new Date().toISOString() });
    list = list.slice(0, 200);
    fs.writeFileSync(storePath, JSON.stringify(list, null, 2));
  } catch (e) {
    console.error('history-add', e);
  }
});
