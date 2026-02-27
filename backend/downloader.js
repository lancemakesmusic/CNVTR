const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { validateUrls, detectPlatform } = require('./platforms');

const appRoot = path.resolve(__dirname, '..');

function getYtDlpPath() {
  const dir = path.join(appRoot, 'yt-dlp');
  const localWin = path.join(dir, 'yt-dlp.exe');
  const localMac = path.join(dir, 'yt-dlp_macos');
  const localUnix = path.join(dir, 'yt-dlp');
  if (process.platform === 'win32' && fs.existsSync(localWin)) return localWin;
  if (process.platform === 'darwin' && fs.existsSync(localMac)) return localMac;
  if (fs.existsSync(localUnix)) return localUnix;
  return process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
}

function getYtDlpMissingMessage() {
  const ytDlpDir = path.join(appRoot, 'yt-dlp');
  const name = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
  return (
    `yt-dlp was not found. Install it and add it to your system PATH, or place ${name} in this folder:\n${ytDlpDir}\n\n` +
    'Download: https://github.com/yt-dlp/yt-dlp/releases'
  );
}

function isYtDlpAvailable() {
  const p = getYtDlpPath();
  if (path.isAbsolute(p) && fs.existsSync(p)) return true;
  const r = spawnSync(p, ['--version'], { encoding: 'utf8', timeout: 5000 });
  return !r.error && r.status === 0;
}

function normalizeYtDlpError(e) {
  if (e && e.code === 'ENOENT') return getYtDlpMissingMessage();
  return e?.stderr || e?.message || String(e);
}

function runYtDlp(args, options = {}) {
  const ytDlpPath = getYtDlpPath();
  return new Promise((resolve, reject) => {
    const proc = spawn(ytDlpPath, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      ...options,
    });
    let stdout = '';
    let stderr = '';
    proc.stdout?.on('data', (d) => { stdout += d.toString(); });
    proc.stderr?.on('data', (d) => { stderr += d.toString(); });
    proc.on('error', (err) => reject(new Error(normalizeYtDlpError(err))));
    proc.on('close', (code) => {
      if (code !== 0) {
        const err = new Error(stderr || stdout || `yt-dlp exited ${code}`);
        err.code = code;
        err.stderr = stderr;
        reject(err);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * Validate a list of URLs. Returns array of { url, valid, error?, platform? }.
 */
function validateUrlsFromBackend(urls) {
  return validateUrls(Array.isArray(urls) ? urls : [urls].filter(Boolean));
}

/**
 * Fetch info for a single URL (JSON). Uses yt-dlp -j.
 */
async function fetchInfo(url) {
  const platform = detectPlatform(url);
  if (!platform) {
    return { ok: false, error: 'Unsupported platform' };
  }
  try {
    const { stdout } = await runYtDlp([
      '--no-download',
      '--no-warnings',
      '-J',
      '--no-playlist',
      '--',
      url.trim(),
    ]);
    const info = JSON.parse(stdout);
    return {
      ok: true,
      id: info.id,
      title: info.title || 'Unknown',
      uploader: info.uploader || info.channel || info.creator || '',
      thumbnail: info.thumbnail || null,
      upload_date: info.upload_date || null,
      duration: info.duration,
      platform: platform.id,
    };
  } catch (e) {
    const msg = normalizeYtDlpError(e);
    const isPrivate = !e?.code && /private|login|sign in|unavailable|removed|blocked|age.restricted/i.test(msg);
    return {
      ok: false,
      error: isPrivate ? 'Video is private, age-restricted, or unavailable.' : msg.slice(0, 600),
    };
  }
}

/**
 * Download best audio only to a temp file. Returns path to the downloaded file.
 */
async function downloadAudioOnly(url, progressCb) {
  const tmpDir = require('os').tmpdir();
  const outTemplate = path.join(tmpDir, `cnvtr_${Date.now()}_%(id)s.%(ext)s`);
  const args = [
    '--no-warnings',
    '--no-playlist',
    '-x',
    '--audio-format', 'best',
    '--audio-quality', '0',
    '-o', outTemplate,
    '--newline',
    '--',
    url.trim(),
  ];
  const ytDlpPath = getYtDlpPath();
  return new Promise((resolve, reject) => {
    const proc = spawn(ytDlpPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let lastPath = null;
    let stderr = '';
    const onLine = (line) => {
      const s = line.toString().trim();
      if (progressCb && s.startsWith('[download]')) progressCb(s);
      const match = s.match(/Destination:\s*(.+)/);
      if (match) lastPath = match[1].trim();
    };
    proc.stdout?.on('data', (d) => d.toString().split('\n').forEach(onLine));
    proc.stderr?.on('data', (d) => {
      const t = d.toString();
      stderr += t;
      t.split('\n').forEach(onLine);
    });
    proc.on('error', (err) => reject(new Error(normalizeYtDlpError(err))));
    proc.on('close', (code) => {
      const dir = path.dirname(outTemplate);
      const findInDir = () => {
        try {
          const files = fs.readdirSync(dir).filter((f) => f.startsWith('cnvtr_') && path.extname(f));
          const full = files.length ? path.join(dir, files[0]) : null;
          return full && fs.existsSync(full) ? full : null;
        } catch {
          return null;
        }
      };
      const filePath = (lastPath && fs.existsSync(lastPath) ? lastPath : null) || findInDir();
      if (filePath) {
        resolve(filePath);
        return;
      }
      if (code !== 0) {
        const msg = stderr.trim() || `yt-dlp exited ${code}`;
        reject(new Error(msg.slice(0, 500)));
      } else {
        reject(new Error('yt-dlp did not produce an output file'));
      }
    });
  });
}

module.exports = {
  validateUrls: validateUrlsFromBackend,
  fetchInfo,
  downloadAudioOnly,
  getYtDlpPath,
  isYtDlpAvailable,
  getYtDlpMissingMessage,
};
