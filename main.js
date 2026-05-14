const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

const preloadPath = path.join(__dirname, 'preload.js');
const indexUrl = isDev
  ? 'http://localhost:5173'
  : `file://${path.join(__dirname, 'dist', 'index.html')}`;

const backendPath = path.join(__dirname, 'backend');
const safePaths = require(path.join(backendPath, 'safePaths.js'));
const logger = require(path.join(backendPath, 'logger.js'));
const downloader = require(path.join(backendPath, 'downloader.js'));
const converter = require(path.join(backendPath, 'converter.js'));
const metadata = require(path.join(backendPath, 'metadata.js'));
const queue = require(path.join(backendPath, 'queue.js'));

/** User-chosen output roots (Browse) — may be outside default builtins. */
const userPickedOutputRoots = new Set();

const MAX_URLS_PER_BATCH = 500;
const MAX_URL_LENGTH = 4096;

function getBuiltinPathRoots() {
  return [
    path.resolve(app.getPath('downloads')),
    path.resolve(app.getPath('userData')),
    path.resolve(os.tmpdir()),
    path.resolve(os.homedir()),
  ];
}

function getAllAllowedRoots() {
  return [...getBuiltinPathRoots(), ...[...userPickedOutputRoots].map((r) => path.resolve(r))];
}

function assertPathInPolicy(absPath, label) {
  const resolved = path.resolve(absPath);
  if (!safePaths.isAllowedFilePath(resolved, getAllAllowedRoots())) {
    logger.warn('path policy reject', { label, resolved });
    throw new Error(`Path not permitted: ${label}`);
  }
}

function assertOutputDirectoryAllowed(dir) {
  if (!dir || typeof dir !== 'string') return;
  const resolved = path.resolve(dir);
  if (safePaths.isAllowedFilePath(resolved, getAllAllowedRoots())) return;
  throw new Error(
    'Output folder must be under your home directory, Downloads, or a folder you selected with Browse.'
  );
}

function readTermsAccepted() {
  const storePath = path.join(app.getPath('userData'), 'terms-accepted.json');
  try {
    const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
    return !!data.accepted;
  } catch {
    return false;
  }
}

function writeTermsAccepted() {
  const storePath = path.join(app.getPath('userData'), 'terms-accepted.json');
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify({ accepted: true, at: new Date().toISOString() }));
}

/** @returns {{ importPath: string|null, outputDir: string|null, acceptTerms: boolean }} */
function parseCliImport() {
  const argv = process.argv.slice(2);
  let importPath = null;
  let outputDir = null;
  let acceptTerms = false;
  for (const a of argv) {
    if (a.startsWith('--import=')) {
      const raw = a.slice('--import='.length);
      importPath = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
    } else if (a.startsWith('--output-dir=')) {
      const raw = a.slice('--output-dir='.length);
      outputDir = path.isAbsolute(raw) ? raw : path.resolve(process.cwd(), raw);
    } else if (a === '--accept-terms') {
      acceptTerms = true;
    }
  }
  return { importPath, outputDir, acceptTerms };
}

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
      sandbox: true,
    },
  };
  if (fs.existsSync(iconPath)) winOpts.icon = iconPath;
  mainWindow = new BrowserWindow(winOpts);

  mainWindow.loadURL(indexUrl);
  if (isDev) mainWindow.webContents.openDevTools({ mode: 'detach' });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  logger.configure({ userDataPath: app.getPath('userData') });
  logger.info('CNVTR starting', { packaged: app.isPackaged });

  const cli = parseCliImport();
  if (cli.importPath) {
    if (!fs.existsSync(cli.importPath)) {
      console.error('CNVTR --import file not found:', cli.importPath);
      app.quit(1);
      return;
    }
    if (!readTermsAccepted()) {
      if (!cli.acceptTerms) {
        console.error(
          'CNVTR: You must accept the in-app terms once, or pass --accept-terms for this CLI import (same agreement as the UI).'
        );
        app.quit(1);
        return;
      }
      writeTermsAccepted();
    }
    if (!downloader.isYtDlpAvailable() || !converter.isFfmpegAvailable()) {
      console.error('CNVTR: yt-dlp or ffmpeg is missing. Install or use bundled binaries, then retry.');
      app.quit(1);
      return;
    }
    const raw = fs.readFileSync(cli.importPath, 'utf8');
    const urls = raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => /^https?:\/\//i.test(l));
    if (urls.length === 0) {
      console.error('CNVTR --import: no http(s) URLs found in file.');
      app.quit(1);
      return;
    }
    const outputDir = cli.outputDir || path.join(app.getPath('downloads'), 'CNVTR', 'DJ Set');
    userPickedOutputRoots.add(path.resolve(outputDir));
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`CNVTR CLI import: ${urls.length} URL(s) -> ${outputDir}`);
    try {
      await queue.startJobAwait(
        {
          urls,
          outputDir,
          openFolderWhenDone: false,
          outputFormat: 'mp3',
          qualityPreset: 'studio',
          bitrate: 320,
          sampleRate: 44100,
          normalize: false,
          trimStart: '',
          trimEnd: '',
          mono: false,
          removeSilence: false,
          fileNameTemplate: 'artist-title',
        },
        () => {}
      );
      console.log('CNVTR CLI import: finished.');
    } catch (e) {
      console.error('CNVTR CLI import failed:', e.message || e);
      process.exitCode = 1;
    }
    app.quit();
    return;
  }

  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('get-default-output-dir', () => path.join(app.getPath('downloads'), 'CNVTR'));

ipcMain.handle('select-output-dir', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Choose output folder',
  });
  if (canceled || !filePaths.length) return null;
  const picked = path.resolve(filePaths[0]);
  userPickedOutputRoots.add(picked);
  logger.info('output root registered', { picked });
  return filePaths[0];
});

ipcMain.handle('open-folder', (_, dir) => {
  const { shell } = require('electron');
  try {
    if (!dir || typeof dir !== 'string') return;
    assertPathInPolicy(dir, 'open-folder');
    if (fs.existsSync(dir)) shell.openPath(dir);
  } catch (e) {
    logger.warn('open-folder blocked', { err: e.message });
  }
});

ipcMain.handle('check-requirements', () => {
  let ytDlpOk = false;
  let ffmpegOk = false;
  try {
    ytDlpOk = downloader.isYtDlpAvailable();
  } catch (e) {
    logger.error('check yt-dlp', { err: String(e.message || e) });
  }
  try {
    ffmpegOk = converter.isFfmpegAvailable();
  } catch (e) {
    logger.error('check ffmpeg', { err: String(e.message || e) });
  }
  return {
    ytDlpOk,
    ytDlpMessage: downloader.getYtDlpMissingMessage(),
    ffmpegOk,
    ffmpegMessage: converter.getFfmpegMissingMessage(),
  };
});

ipcMain.handle('validate-urls', (_, urls) => {
  const list = Array.isArray(urls) ? urls : [];
  const trimmed = list
    .slice(0, MAX_URLS_PER_BATCH)
    .map((u) => String(u || '').slice(0, MAX_URL_LENGTH));
  return downloader.validateUrls(trimmed);
});

ipcMain.handle('fetch-info', async (_, url) => {
  if (!url || typeof url !== 'string' || url.length > MAX_URL_LENGTH) {
    return { ok: false, error: 'Invalid URL' };
  }
  return downloader.fetchInfo(url);
});

ipcMain.handle('start-job', async (_, options) => {
  try {
    if (options?.outputDir) {
      assertOutputDirectoryAllowed(options.outputDir);
      userPickedOutputRoots.add(path.resolve(options.outputDir));
    }
    if (Array.isArray(options?.urls) && options.urls.length > MAX_URLS_PER_BATCH) {
      return { ok: false, error: `Too many URLs (max ${MAX_URLS_PER_BATCH})` };
    }
  } catch (e) {
    return { ok: false, error: e.message || String(e) };
  }
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
  if (!filePath || typeof filePath !== 'string') return;
  try {
    assertPathInPolicy(filePath, 'embed-metadata');
  } catch (e) {
    logger.warn('embed-metadata blocked', { err: e.message });
    return;
  }
  return metadata.embedMetadata(filePath, info, coverUrl);
});

ipcMain.handle('convert-to-format', async (_, opts) => {
  if (!opts || typeof opts !== 'object') {
    return Promise.reject(new Error('Invalid options'));
  }
  try {
    if (opts.inputPath) assertPathInPolicy(opts.inputPath, 'convert input');
    if (opts.outputPath) assertPathInPolicy(opts.outputPath, 'convert output');
  } catch (e) {
    return Promise.reject(e);
  }
  return converter.convert(opts);
});

ipcMain.handle('terms-accepted', () => {
  writeTermsAccepted();
});

ipcMain.handle('terms-check', () => readTermsAccepted());

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
  if (entry.outputPath && typeof entry.outputPath === 'string') {
    try {
      assertPathInPolicy(entry.outputPath, 'history output');
    } catch (e) {
      logger.warn('history-add blocked path', { err: e.message });
      return;
    }
  }
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
    logger.error('history-add', { err: String(e.message || e) });
  }
});
