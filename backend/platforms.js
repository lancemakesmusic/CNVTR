/**
 * Supported platforms and URL patterns for CNVTR.
 * Used for validation and platform detection.
 */
const SUPPORTED_PLATFORMS = [
  {
    id: 'youtube',
    name: 'YouTube',
    patterns: [
      /youtube\.com\/watch\?v=/i,
      /youtu\.be\//i,
      /youtube\.com\/shorts\//i,
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    patterns: [
      /instagram\.com\/(p|reel|reels)\//i,
      /instagr\.am\/(p|reel|reels)\//i,
    ],
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    patterns: [
      /(?:twitter|x)\.com\/\w+\/status\//i,
      /(?:twitter|x)\.com\/i\/status\//i,
    ],
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    patterns: [
      /tiktok\.com\/@?\w+\/video\//i,
      /vm\.tiktok\.com\//i,
      /vt\.tiktok\.com\//i,
    ],
  },
  {
    id: 'facebook',
    name: 'Facebook',
    patterns: [
      /facebook\.com\/\w+\/(videos|watch)\//i,
      /fb\.watch\//i,
      /fb\.com\/watch/i,
    ],
  },
  {
    id: 'soundcloud',
    name: 'SoundCloud',
    patterns: [
      /soundcloud\.com\//i,
    ],
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    patterns: [
      /vimeo\.com\//i,
      /player\.vimeo\.com\//i,
    ],
  },
];

function detectPlatform(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return null;
  for (const platform of SUPPORTED_PLATFORMS) {
    if (platform.patterns.some((p) => p.test(trimmed))) {
      return { id: platform.id, name: platform.name };
    }
  }
  return null;
}

function isValidUrl(string) {
  try {
    const u = new URL(string.trim());
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function validateUrls(urls) {
  const results = [];
  const seen = new Set();
  for (const raw of urls) {
    const url = (raw || '').trim();
    if (!url) continue;
    if (seen.has(url.toLowerCase())) {
      results.push({ url, valid: false, error: 'Duplicate URL' });
      continue;
    }
    seen.add(url.toLowerCase());
    if (!isValidUrl(url)) {
      results.push({ url, valid: false, error: 'Invalid URL format' });
      continue;
    }
    const platform = detectPlatform(url);
    if (!platform) {
      results.push({ url, valid: false, error: 'Unsupported platform' });
      continue;
    }
    results.push({ url, valid: true, platform });
  }
  return results;
}

module.exports = {
  SUPPORTED_PLATFORMS,
  detectPlatform,
  isValidUrl,
  validateUrls,
};
