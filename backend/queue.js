const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');
const downloader = require('./downloader');
const converter = require('./converter');
const metadata = require('./metadata');
const { detectPlatform } = require('./platforms');

const MAX_RETRIES = 2;
const CONCURRENT = 1; // one at a time for MVP; can increase later

let state = {
  jobs: [],
  running: false,
  paused: false,
  canceled: false,
};
let sendToRenderer = () => {};

function emit(event, data) {
  try {
    sendToRenderer(event, data);
  } catch (e) {
    console.error('queue emit', e);
  }
}

function getOutputPath(outputDir, info, format, template) {
  const safe = (s) => (s || 'Unknown').replace(/[<>:"/\\|?*]/g, '_').slice(0, 100);
  const title = safe(info?.title);
  const artist = safe(info?.uploader || info?.artist);
  const ext = format === 'wav'
    ? '.wav'
    : format === 'flac'
      ? '.flac'
      : format === 'mp4'
        ? '.mp4'
        : '.mp3';
  let baseName;
  if (template === 'artist-title') {
    baseName = `${artist} - ${title}`;
  } else if (template === 'title') {
    baseName = title;
  } else {
    baseName = `${artist} - ${title}`;
  }
  let candidate = path.join(outputDir, `${baseName}${ext}`);
  let n = 0;
  while (fs.existsSync(candidate)) {
    n++;
    candidate = path.join(outputDir, `${baseName} (${n})${ext}`);
  }
  return candidate;
}

function formatOptions(userOptions) {
  const format = (userOptions?.outputFormat || 'mp3').toLowerCase();
  const quality = userOptions?.qualityPreset || 'studio';
  const bitrateMap = { standard: 192, high: 256, studio: 320, lossless: 320 };
  const bitrate = userOptions?.bitrate ?? bitrateMap[quality] ?? 320;
  const sampleRate = userOptions?.sampleRate || 44100;
  return {
    format: format === 'wav' ? 'wav' : format === 'flac' ? 'flac' : format === 'mp4' ? 'mp4' : 'mp3',
    bitrate: format === 'mp3' ? bitrate : 320,
    sampleRate: Number(sampleRate) || 44100,
    normalize: !!userOptions?.normalize,
    trimStart: userOptions?.trimStart != null ? Number(userOptions.trimStart) : undefined,
    trimEnd: userOptions?.trimEnd != null ? Number(userOptions.trimEnd) : undefined,
    mono: !!userOptions?.mono,
    removeSilence: !!userOptions?.removeSilence,
    fileNameTemplate: userOptions?.fileNameTemplate || 'artist-title',
  };
}

async function processOne(itemId, url, options, outputDir, openFolderWhenDone) {
  const job = state.jobs.find((j) => j.id === itemId);
  if (!job) return;
  let info = null;
  let inputPath = null;
  let outputPath = null;
  const opts = formatOptions(options);

  try {
    job.status = 'downloading';
    emit('queue-update', { jobs: state.jobs });
    emit('job-progress', { id: itemId, phase: 'info', percent: 0 });
    const infoResult = await downloader.fetchInfo(url);
    if (!infoResult.ok) {
      throw new Error(infoResult.error || 'Failed to get info');
    }
    info = infoResult;
    job.info = info;

    emit('job-progress', { id: itemId, phase: 'download', percent: 5 });
    if (opts.format === 'mp4') {
      inputPath = await downloader.downloadVideoMp4(url, (line) => {
        emit('job-log', { id: itemId, line });
      });
    } else {
      inputPath = await downloader.downloadAudioOnly(url, (line) => {
        emit('job-log', { id: itemId, line });
      });
    }
    emit('job-progress', { id: itemId, phase: 'download', percent: 70 });

    outputPath = getOutputPath(outputDir, info, opts.format, opts.fileNameTemplate);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });

    if (opts.format === 'mp4') {
      // MP4 is already produced by yt-dlp; just move into final output folder.
      fs.renameSync(inputPath, outputPath);
      inputPath = null;
    } else {
      job.status = 'converting';
      emit('queue-update', { jobs: state.jobs });
      emit('job-progress', { id: itemId, phase: 'convert', percent: 75 });
      await converter.convert({
        inputPath,
        outputPath,
        format: opts.format,
        bitrate: opts.bitrate,
        sampleRate: opts.sampleRate,
        normalize: opts.normalize,
        trimStart: opts.trimStart,
        trimEnd: opts.trimEnd,
        mono: opts.mono,
        removeSilence: opts.removeSilence,
        onProgress: (p) => {
          emit('job-progress', { id: itemId, phase: 'convert', percent: 75 + (p * 0.2) });
        },
      });
    }

    if (opts.format === 'mp3' && info.thumbnail) {
      await metadata.embedMetadata(outputPath, info, info.thumbnail);
    }

    if (inputPath && fs.existsSync(inputPath)) {
      try { fs.unlinkSync(inputPath); } catch (_) {}
    }

    job.status = 'completed';
    job.outputPath = outputPath;
    job.progress = 100;
    emit('job-progress', { id: itemId, phase: 'done', percent: 100 });
    emit('job-done', { id: itemId, success: true, outputPath, openFolderWhenDone });
  } catch (err) {
    job.status = 'failed';
    job.error = err.message || String(err);
    job.progress = 0;
    emit('job-done', { id: itemId, success: false, error: job.error });
    if (inputPath && fs.existsSync(inputPath)) {
      try { fs.unlinkSync(inputPath); } catch (_) {}
    }
  }
}

async function runQueue(options, openFolderWhenDone) {
  const urls = Array.isArray(options?.urls) ? options.urls : [];
  if (urls.length === 0) return;
  const { outputDir, ...userOptions } = options || {};
  const output = outputDir || path.join(app.getPath('downloads'), 'CNVTR');
  state.running = true;
  state.canceled = false;
  state.paused = false;

  const items = urls.map((url) => ({
    id: uuidv4(),
    url: url.trim(),
    status: 'pending',
    progress: 0,
    error: null,
    info: null,
    outputPath: null,
  }));
  state.jobs = items;
  emit('queue-update', { jobs: state.jobs });

  for (const item of items) {
    if (state.canceled) break;
    while (state.paused && !state.canceled) {
      await new Promise((r) => setTimeout(r, 500));
    }
    await processOne(item.id, item.url, userOptions, output, openFolderWhenDone);
    emit('queue-update', { jobs: state.jobs });
  }

  state.running = false;
  emit('queue-finished', {});
}

function startJob(options, send) {
  if (!options || !Array.isArray(options.urls) || options.urls.length === 0) {
    return { ok: false, error: 'No URLs provided' };
  }
  sendToRenderer = send;
  runQueue(options, options.openFolderWhenDone).catch((e) => {
    sendToRenderer('queue-error', { error: e.message });
  });
  return { ok: true };
}

function pause() {
  state.paused = true;
}

function resume() {
  state.paused = false;
}

function cancel() {
  state.canceled = true;
}

function getStatus() {
  return {
    jobs: state.jobs,
    running: state.running,
    paused: state.paused,
  };
}

module.exports = {
  startJob,
  pause,
  resume,
  cancel,
  getStatus,
};
