const path = require('path');

/** True if absChild is absRoot or a file/dir inside absRoot (no .. escape). */
function isUnderRoot(absChild, absRoot) {
  const a = path.resolve(absChild);
  const b = path.resolve(absRoot);
  if (a === b) return true;
  const rel = path.relative(b, a);
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel);
}

/**
 * @param {string} filePath
 * @param {string[]} allowedAbsRoots
 */
function isAllowedFilePath(filePath, allowedAbsRoots) {
  if (!filePath || typeof filePath !== 'string') return false;
  let resolved;
  try {
    resolved = path.resolve(filePath);
  } catch {
    return false;
  }
  const roots = (allowedAbsRoots || []).filter(Boolean).map((r) => path.resolve(r));
  return roots.some((r) => isUnderRoot(resolved, r));
}

module.exports = { isUnderRoot, isAllowedFilePath };
