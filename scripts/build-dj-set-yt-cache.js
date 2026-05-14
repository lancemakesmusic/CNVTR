/**
 * Build dj_set_yt_titles.cache.json — one yt-dlp title fetch per playlist URL (slow, accurate).
 *
 * Usage:
 *   node scripts/build-dj-set-yt-cache.js [playlist_youtube.json]
 *   node scripts/build-dj-set-yt-cache.js --cookies-from-browser=chrome
 *   node scripts/build-dj-set-yt-cache.js path/to/playlist.json --cookies-from-browser=edge
 *
 * Env (optional):
 *   CNVTR_YT_COOKIES=chrome|edge|firefox — same as --cookies-from-browser
 *   CNVTR_YT_SLEEP_REQUESTS=2 — yt-dlp --sleep-requests (may reduce bot prompts)
 *   CNVTR_YT_DELAY_MS=1500 — pause between requests (milliseconds)
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

let playlistPath = path.join(__dirname, '..', 'playlist_youtube.json');
let cookiesFromBrowser = process.env.CNVTR_YT_COOKIES || '';
let sleepRequests = process.env.CNVTR_YT_SLEEP_REQUESTS || '';
const delayMs = Math.max(0, Number(process.env.CNVTR_YT_DELAY_MS || 0) || 0);

const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a.startsWith('--cookies-from-browser=')) {
    cookiesFromBrowser = a.slice('--cookies-from-browser='.length).trim();
  } else if (a === '--cookies-from-browser' && argv[i + 1] && !argv[i + 1].startsWith('--')) {
    cookiesFromBrowser = argv[++i].trim();
  } else if (a.startsWith('--sleep-requests=')) {
    sleepRequests = a.slice('--sleep-requests='.length).trim();
  } else if (!a.startsWith('--')) {
    playlistPath = path.isAbsolute(a) ? a : path.resolve(process.cwd(), a);
  }
}

const cachePath = path.join(path.dirname(playlistPath), 'dj_set_yt_titles.cache.json');

function sleepMs(ms) {
  if (!ms) return;
  const end = Date.now() + ms;
  while (Date.now() < end) {
    /* sync throttle */
  }
}

function ytTitle(url) {
  const args = [
    '-m',
    'yt_dlp',
    '--no-download',
    '--print',
    '%(title)s',
    '--quiet',
    '--no-warnings',
  ];
  if (cookiesFromBrowser) {
    args.push('--cookies-from-browser', cookiesFromBrowser);
  }
  if (sleepRequests) {
    args.push('--sleep-requests', String(sleepRequests));
  }
  args.push(url);

  const r = spawnSync('python', args, {
    encoding: 'utf8',
    timeout: 120000,
    maxBuffer: 4e6,
    env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' },
  });
  if (r.status !== 0) {
    console.error('yt-dlp failed for', url, r.stderr?.slice(0, 400));
    return null;
  }
  return (r.stdout || '').trim() || null;
}

function main() {
  if (cookiesFromBrowser) {
    process.stderr.write(`Using --cookies-from-browser ${cookiesFromBrowser}\n`);
  } else {
    process.stderr.write(
      'Tip: if YouTube returns “Sign in to confirm you’re not a bot”, re-run with ' +
        'CNVTR_YT_COOKIES=chrome (or edge) or --cookies-from-browser=chrome\n'
    );
  }
  const playlist = JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
  const ordered = [...playlist].sort((a, b) => a.n - b.n);
  const out = [];
  for (let i = 0; i < ordered.length; i++) {
    const row = ordered[i];
    process.stderr.write(`Fetching title ${row.n}/${ordered.length}…\n`);
    const t = ytTitle(row.url);
    out.push({ n: row.n, url: row.url, ytTitle: t || row.title });
    if (delayMs && i < ordered.length - 1) sleepMs(delayMs);
  }
  fs.writeFileSync(cachePath, JSON.stringify(out, null, 2), 'utf8');
  console.log('Wrote', cachePath);
}

main();
