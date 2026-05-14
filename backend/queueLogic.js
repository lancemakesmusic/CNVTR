const path = require('path');
const fs = require('fs');

function getOutputPath(outputDir, info, format, template) {
  const safe = (s) => (s || 'Unknown').replace(/[<>:"/\\|?*]/g, '_').slice(0, 100);
  const title = safe(info?.title);
  const artist = safe(info?.uploader || info?.artist);
  const ext = format === 'wav' ? '.wav' : format === 'flac' ? '.flac' : '.mp3';
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
    format: format === 'wav' ? 'wav' : format === 'flac' ? 'flac' : 'mp3',
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

module.exports = { getOutputPath, formatOptions };
