const path = require('path');
const fs = require('fs');
const NodeID3 = require('node-id3');
const https = require('https');

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Embed metadata and optional cover into the file.
 * filePath: path to mp3 (or other format - ID3 only applies to mp3)
 * info: { title, uploader (artist), upload_date }
 * coverUrl: optional URL to thumbnail
 */
async function embedMetadata(filePath, info, coverUrl) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.mp3') {
    return; // Only ID3 for MP3; WAV/FLAC could use other libs later
  }
  const tags = {
    title: info?.title || path.basename(filePath, ext),
    artist: info?.uploader || info?.artist || '',
    year: info?.upload_date ? String(info.upload_date).slice(0, 4) : undefined,
  };
  if (coverUrl) {
    try {
      const imageBuffer = await downloadImage(coverUrl);
      tags.image = {
        mime: 'image/jpeg',
        type: { id: 3, name: 'front cover' },
        description: 'Cover',
        imageBuffer,
      };
    } catch (_) {
      // ignore cover failure
    }
  }
  try {
    NodeID3.write(tags, filePath);
  } catch (e) {
    console.error('embedMetadata', e);
  }
}

module.exports = { embedMetadata };
