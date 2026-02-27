const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

function getFfmpegPath() {
  const appRoot = path.resolve(__dirname, '..');
  const ffmpegDir = path.join(appRoot, 'ffmpeg');
  if (process.platform === 'win32') {
    const exe = path.join(ffmpegDir, 'ffmpeg.exe');
    if (fs.existsSync(exe)) return path.join(ffmpegDir, 'ffmpeg.exe');
  } else {
    const exe = path.join(ffmpegDir, 'ffmpeg');
    if (fs.existsSync(exe)) return exe;
  }
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
  }

  return new Promise((resolve, reject) => {
    if (!fs.existsSync(inputPath)) {
      reject(new Error('Input file not found'));
      return;
    }

    let command = ffmpeg(inputPath);

    if (trimStart != null && trimStart > 0) {
      command = command.setStartTime(trimStart);
    }
    if (trimEnd != null && trimEnd > 0) {
      command = command.setDuration(trimEnd - (trimStart || 0));
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

module.exports = { convert, getFfmpegPath };
