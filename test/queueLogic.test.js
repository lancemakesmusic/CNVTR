const { describe, it, before } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { getOutputPath, formatOptions } = require('../backend/queueLogic.js');

describe('queueLogic', () => {
  let tmpDir;
  before(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cnvtr-qtest-'));
  });

  it('formatOptions normalizes format and bitrate', () => {
    const o = formatOptions({ outputFormat: 'MP3', qualityPreset: 'high', sampleRate: 48000 });
    assert.equal(o.format, 'mp3');
    assert.equal(o.bitrate, 256);
    assert.equal(o.sampleRate, 48000);
  });

  it('getOutputPath avoids collision', () => {
    const info = { title: 'Test', uploader: 'Artist' };
    const first = getOutputPath(tmpDir, info, 'mp3', 'artist-title');
    fs.writeFileSync(first, '');
    const second = getOutputPath(tmpDir, info, 'mp3', 'artist-title');
    assert.notEqual(first, second);
    assert.match(path.basename(second), / \(1\)/);
    if (fs.existsSync(first)) fs.unlinkSync(first);
    if (fs.existsSync(second)) fs.unlinkSync(second);
  });
});
