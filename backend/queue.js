const path = require('path');
const fs = require('fs');
const { app } = require('electron');
const { v4: uuidv4 } = require('uuid');
const downloader = require('./downloader');
const converter = require('./converter');
const metadata = require('./metadata');
const { getOutputPath, formatOptions } = require('./queueLogic');
const logger = require('./logger');

const MAX_RETRIES = 2;

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
    logger.warn('queue emit failed', { err: String(e.message || e) });
  }
}

function isRetryableError(err) {
  const m = ((err && err.message) || String(err)).toLowerCase();
  if (/canceled|cancelled|killed|sign in to confirm/.test(m)) return false;
  return /etimedout|econnreset|timeout|temporar|502|503|504|429|network|unavailable/.test(m);
}

async function processOne(job, url, options, outputDir, openFolderWhenDone) {
  if (!job) return;
  const itemId = job.id;
  const opts = formatOptions(options);
  let lastErr = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (state.canceled) {
      job.status = 'failed';
      job.error = 'Canceled';
      job.progress = 0;
      emit('job-done', { id: itemId, success: false, error: job.error });
      return;
    }

    let info = null;
    let inputPath = null;
    let outputPath = null;

    try {
      job.status = 'downloading';
      job.error = null;
      emit('queue-update', { jobs: state.jobs });
      emit('job-progress', { id: itemId, phase: 'info', percent: 0 });

      const infoResult = await downloader.fetchInfo(url);
      if (!infoResult.ok) {
        throw new Error(infoResult.error || 'Failed to get info');
      }
      info = infoResult;
      job.info = info;

      emit('job-progress', { id: itemId, phase: 'download', percent: 5 });
      inputPath = await downloader.downloadAudioOnly(url, (line) => {
        emit('job-log', { id: itemId, line });
      });
      emit('job-progress', { id: itemId, phase: 'download', percent: 70 });

      outputPath = getOutputPath(outputDir, info, opts.format, opts.fileNameTemplate);
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });

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

      if (opts.format === 'mp3' && info.thumbnail) {
        await metadata.embedMetadata(outputPath, info, info.thumbnail);
      }

      if (inputPath && fs.existsSync(inputPath)) {
        try {
          fs.unlinkSync(inputPath);
        } catch (_) {
          void 0;
        }
      }

      job.status = 'completed';
      job.outputPath = outputPath;
      job.progress = 100;
      emit('job-progress', { id: itemId, phase: 'done', percent: 100 });
      emit('job-done', { id: itemId, success: true, outputPath, openFolderWhenDone });
      return;
    } catch (err) {
      lastErr = err;
      if (inputPath && fs.existsSync(inputPath)) {
        try {
          fs.unlinkSync(inputPath);
        } catch (_) {
          void 0;
        }
      }
      if (outputPath && fs.existsSync(outputPath)) {
        try {
          fs.unlinkSync(outputPath);
        } catch (_) {
          void 0;
        }
      }

      if (state.canceled) {
        job.status = 'failed';
        job.error = 'Canceled';
        job.progress = 0;
        emit('job-done', { id: itemId, success: false, error: job.error });
        return;
      }

      const canRetry = attempt < MAX_RETRIES && isRetryableError(err);
      if (canRetry) {
        const delayMs = 1200 * (attempt + 1);
        logger.warn('queue job retry', { id: itemId, attempt: attempt + 1, err: err.message });
        emit('job-log', {
          id: itemId,
          line: `[retry ${attempt + 1}/${MAX_RETRIES}] ${err.message || err} — waiting ${delayMs}ms`,
        });
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }

      job.status = 'failed';
      job.error = err.message || String(err);
      job.progress = 0;
      emit('job-done', { id: itemId, success: false, error: job.error });
      return;
    }
  }

  if (lastErr) {
    job.status = 'failed';
    job.error = lastErr.message || String(lastErr);
    job.progress = 0;
    emit('job-done', { id: itemId, success: false, error: job.error });
  }
}

async function runQueue(options, openFolderWhenDone) {
  const urls = Array.isArray(options?.urls) ? options.urls : [];
  if (urls.length === 0) return;
  if (state.running) {
    throw new Error('A conversion batch is already running. Wait for it to finish or cancel it in the app.');
  }
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

  try {
    for (const item of items) {
      if (state.canceled) break;
      while (state.paused && !state.canceled) {
        await new Promise((r) => setTimeout(r, 500));
      }
      await processOne(item, item.url, userOptions, output, openFolderWhenDone);
      emit('queue-update', { jobs: state.jobs });
    }
  } finally {
    state.running = false;
    emit('queue-finished', {});
  }
}

function startJob(options, send) {
  if (!options || !Array.isArray(options.urls) || options.urls.length === 0) {
    return { ok: false, error: 'No URLs provided' };
  }
  if (state.running) {
    return { ok: false, error: 'A conversion batch is already running.' };
  }
  sendToRenderer = send;
  runQueue(options, options.openFolderWhenDone).catch((e) => {
    sendToRenderer('queue-error', { error: e.message });
  });
  return { ok: true };
}

function startJobAwait(options, send) {
  if (!options || !Array.isArray(options.urls) || options.urls.length === 0) {
    return Promise.reject(new Error('No URLs provided'));
  }
  if (state.running) {
    return Promise.reject(new Error('A conversion batch is already running.'));
  }
  sendToRenderer = typeof send === 'function' ? send : () => {};
  return runQueue(options, options.openFolderWhenDone).catch((e) => {
    sendToRenderer('queue-error', { error: e.message });
    throw e;
  });
}

function pause() {
  state.paused = true;
}

function resume() {
  state.paused = false;
}

function cancel() {
  state.canceled = true;
  downloader.cancelActiveDownload();
  converter.cancelActiveConvert();
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
  startJobAwait,
  pause,
  resume,
  cancel,
  getStatus,
};
