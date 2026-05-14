const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { detectPlatform, isValidUrl, validateUrls } = require('../backend/platforms.js');

describe('platforms', () => {
  it('detectPlatform youtube watch', () => {
    const p = detectPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    assert.equal(p?.id, 'youtube');
  });

  it('isValidUrl rejects non-http', () => {
    assert.equal(isValidUrl('ftp://a'), false);
    assert.equal(isValidUrl('https://a'), true);
  });

  it('validateUrls marks duplicate', () => {
    const u = 'https://www.youtube.com/watch?v=abc123def45';
    const r = validateUrls([u, u]);
    assert.equal(r.length, 2);
    assert.equal(r[0].valid, true);
    assert.equal(r[1].valid, false);
    assert.match(r[1].error, /Duplicate/i);
  });

  it('validateUrls unsupported host', () => {
    const r = validateUrls(['https://example.com/video/1']);
    assert.equal(r[0].valid, false);
  });
});
