const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const os = require('os');
const { isUnderRoot, isAllowedFilePath } = require('../backend/safePaths.js');

describe('safePaths', () => {
  it('isUnderRoot accepts same path', () => {
    const r = path.join(os.tmpdir(), 'cnvtr-root');
    assert.equal(isUnderRoot(r, r), true);
  });

  it('isUnderRoot rejects parent escape', () => {
    const root = path.join(os.tmpdir(), 'cnvtr-safe-root');
    const evil = path.join(root, '..', '..', 'etc', 'passwd');
    assert.equal(isUnderRoot(evil, root), false);
  });

  it('isAllowedFilePath matches one of several roots', () => {
    const home = os.homedir();
    const inside = path.join(home, 'Downloads', 'CNVTR', 'x.mp3');
    assert.equal(isAllowedFilePath(inside, [home, os.tmpdir()]), true);
  });
});
