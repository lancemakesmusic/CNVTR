const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');
const { getAppRoot, resolveAsarBinaryPath } = require('./paths');

function getFfmpegDir() {
  return path.join(getAppRoot(), 'ffmpeg');
}

function getNpmFfmpegPath() {
  try {
    const p = require('ffmpeg-static');
    if (!p) return null;
    return resolveAsarBinaryPath(p);
  } catch {
    return null;
  }
}

function getNpmFfprobePath() {
  try {
    const mod = require('ffprobe-static');
    const p = mod && mod.path;
    if (!p) return null;
    return resolveAsarBinaryPath(p);
  } catch {
    return null;
  }
}

function getFfmpegPath() {
  const ffmpegDir = getFfmpegDir();
  if (process.platform === 'win32') {
    const exe = path.join(ffmpegDir, 'ffmpeg.exe');
    if (fs.existsSync(exe)) return exe;
  } else {
    const exe = path.join(ffmpegDir, 'ffmpeg');
    if (fs.existsSync(exe)) return exe;
  }
  const npmFf = getNpmFfmpegPath();
  if (npmFf && fs.existsSync(npmFf)) return npmFf;
  return 'ffmpeg';
}

/**
 * Convert input audio file to target format.
 * opts: {
 *   inputPath,
 *   outputPath,
 *   format: 'mp3' | 'wav' | 'flac',
 *   bitrate?: number,        // for mp3, e.g. 320
 *   sampleRate?: number,     // 44100 or 48000
 *   normalize?: boolean,
 *   trimStart?: number,      // seconds
 *   trimEnd?: number,        // seconds
 *   mono?: boolean,
 *   removeSilence?: boolean,
 *   onProgress?: (percent) => void
 * }
 */
function convert(opts) {
  if (!opts || typeof opts !== 'object') {
    return Promise.reject(new Error('Invalid conversion options'));
  }
  const {
    inputPath,
    outputPath,
    format = 'mp3',
    bitrate = 320,
    sampleRate = 44100,
    normalize = false,
    trimStart,
    trimEnd,
    mono = false,
    removeSilence = false,
    onProgress,
  } = opts;

  const ff = getFfmpegPath();
  if (ff !== 'ffmpeg') {
    ffmpeg.setFfmpegPath(ff);
    let ffprobe = process.platform === 'win32'
      ? path.join(getFfmpegDir(), 'ffprobe.exe')
      : path.join(getFfmpegDir(), 'ffprobe');
    if (!fs.existsSync(ffprobe)) {
      const npmProbe = getNpmFfprobePath();
      if (npmProbe && fs.existsSync(npmProbe)) ffprobe = npmProbe;
    }
    if (fs.existsSync(ffprobe)) {
      ffmpeg.setFfprobePath(ffprobe);
    }
  }

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputPath)) {
      reject(new Error('Input file not found'));
      return;
    }

    let command = ffmpeg(inputPath);

    const startSec = trimStart != null && Number(trimStart) >= 0 ? Number(trimStart) : 0;
    const endSec = trimEnd != null && Number(trimEnd) > 0 ? Number(trimEnd) : null;
    if (startSec > 0) {
      command = command.setStartTime(startSec);
    }
    if (endSec != null && endSec > startSec) {
      command = command.setDuration(endSec - startSec);
    }
    if (normalize) {
      command = command.audioFilters('loudnorm');
    }
    if (mono) {
      command = command.audioChannels(1);
    }
    if (removeSilence) {
      command = command.audioFilters('silenceremove=start_periods=1:start_duration=0:start_threshold=-50dB');
    }

    command = command.audioFrequency(sampleRate);

    switch (format) {
      case 'mp3':
        command = command
          .format('mp3')
          .audioBitrate(bitrate);
        break;
      case 'wav':
        command = command.format('wav');
        break;
      case 'flac':
        command = command.format('flac');
        break;
      default:
        command = command.format('mp3').audioBitrate(bitrate);
    }

    command
      .output(outputPath)
      .on('start', () => {})
      .on('progress', (p) => {
        if (onProgress && p.percent != null) onProgress(Math.min(100, p.percent));
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => reject(err))
      .run();
  });
}

function getFfmpegMissingMessage() {
  const ffmpegDir = getFfmpegDir();
  const name = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
  return (
    `FFmpeg was not found. Install it and add it to your system PATH, or place ${name} in:\n${ffmpegDir}\n\n` +
    'Download: https://ffmpeg.org/download.html'
  );
}

function isFfmpegAvailable() {
  try {
    const p = getFfmpegPath();
    if (path.isAbsolute(p) && fs.existsSync(p)) return true;
    const { spawnSync } = require('child_process');
    const r = spawnSync(p, ['-version'], { encoding: 'utf8', timeout: 5000 });
    return !r.error && r.status === 0;
  } catch (e) {
    return false;
  }
}

module.exports = { convert, getFfmpegPath, getFfmpegMissingMessage, isFfmpegAvailable };
