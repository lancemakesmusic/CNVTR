/**
 * Rename MP3s in DJ Set to 001 - Title.mp3, 002 - … using playlist_youtube.json order.
 * Matches ID3 title (fallback: filename) to each playlist row; two-phase rename avoids collisions.
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const mm = require('music-metadata');

const playlistPath =
  process.argv[2] || path.join(__dirname, '..', 'playlist_youtube.json');
const dir =
  process.argv[3] ||
  path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', 'CNVTR', 'DJ Set');
const cacheFile = path.join(path.dirname(playlistPath), 'dj_set_yt_titles.cache.json');

function norm(s) {
  return String(s || '')
    .replace(/\uFFFD/g, '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[''"]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function safeFileStem(s) {
  return String(s || '')
    // eslint-disable-next-line no-control-regex -- strip Windows-invalid filename chars
    .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
}

function tokenize(s) {
  return norm(s)
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => (w === 'ft' || w === 'featuring' ? 'feat' : w));
}

/** Alternate retail / clean / regional titles (playlist vs YouTube/ID3). */
function expandMatchNeedles(title) {
  const t = String(title || '').trim();
  if (!t) return [''];
  const out = new Set([t]);
  if (/\bsexy\s+bitch\b/i.test(t)) {
    out.add(t.replace(/\bbitch\b/gi, 'Chick'));
  }
  if (/\bsexy\s+chick\b/i.test(t)) {
    out.add(t.replace(/\bchick\b/gi, 'Bitch'));
  }
  const parenFeat = /\([^)]*\b(feat|ft)\.?\b[^)]*\)/i;
  if (parenFeat.test(t)) {
    const stripped = t
      .replace(parenFeat, '')
      .replace(/\s+/g, ' ')
      .replace(/\(\s*\)/g, '')
      .trim();
    if (stripped.length >= 3) out.add(stripped);
  }
  return [...out];
}

/** All words from phrase appear as whole tokens in hay tokens, in order (subsequence). */
function phraseAsTokenSubsequence(hayTokens, phraseTokens) {
  if (!phraseTokens.length) return false;
  let j = 0;
  for (let i = 0; i < hayTokens.length && j < phraseTokens.length; i++) {
    if (hayTokens[i] === phraseTokens[j]) j++;
  }
  return j === phraseTokens.length;
}

/** Levenshtein distance (for short strings only). */
function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + cost);
      prev = tmp;
    }
  }
  return dp[n];
}

function levSimilarityScore(needle, hayStack) {
  const a = norm(needle).slice(0, 100);
  const b = norm(hayStack).slice(0, 120);
  if (a.length < 8 || b.length < 8) return 0;
  const d = levenshtein(a, b);
  const mx = Math.max(a.length, b.length);
  const r = d / mx;
  if (r < 0.38) return Math.round((1 - r) * 8e5);
  return 0;
}

/** Strong when several distinctive tokens from needle all appear in hay (slash vs space tolerant). */
function anchorWordsScore(needle, hayStack) {
  const h = norm(hayStack);
  const words = tokenize(needle).filter((w) => w.length >= 2 && w !== 'the' && w !== 'and');
  if (words.length < 2) return 0;
  const longOnes = words.filter((w) => w.length >= 4);
  const need = longOnes.length >= 2 ? longOnes : words.slice(0, 6);
  if (need.length < 2) return 0;
  if (need.every((w) => h.includes(w))) return 420000 + need.length * 50;
  return 0;
}

/** Very short titles: compare with spaces removed (e.g. "7/11" vs "7_11"). */
function compactSubstringScore(needle, hayStack) {
  const a = norm(needle).replace(/\s/g, '');
  const b = norm(hayStack).replace(/\s/g, '');
  if (a.length < 3 || b.length < 3) return 0;
  if (b.includes(a) || a.includes(b)) return 390000;
  return 0;
}

function scoreMatch(playlistTitle, id3Title, baseName) {
  const hayCombo = `${id3Title} ${baseName.replace(/\.mp3$/i, '')}`;
  let s = Math.max(
    levSimilarityScore(playlistTitle, hayCombo),
    anchorWordsScore(playlistTitle, hayCombo),
    compactSubstringScore(playlistTitle, hayCombo)
  );
  const p = norm(playlistTitle);
  const t = norm(id3Title);
  const b = norm(baseName.replace(/\.mp3$/i, ''));
  const hay = t.length >= b.length ? t : b;
  const pt = tokenize(playlistTitle);

  if (!p || !hay) return s;

  // Whole-phrase as substring (strong)
  if (hay === p) s = Math.max(s, 1e6);
  if (hay.startsWith(p + ' ') || hay.endsWith(' ' + p) || hay.includes(' ' + p + ' ')) {
    s = Math.max(s, 5e5 + p.length);
  }

  // Long titles: substring is usually safe
  if (p.length >= 14 && hay.includes(p)) s = Math.max(s, 4e5 + p.length);

  // Short titles: avoid "work" matching "work from home" — require token equality for single-token phrase
  if (pt.length === 1) {
    const w = pt[0];
    if (w.length >= 3) {
      const toks = tokenize(hay);
      if (toks.some((x) => x === w)) s = Math.max(s, 3e5);
    }
    if (s >= 50000) return s;
    const lz = levSimilarityScore(playlistTitle, hayCombo);
    return Math.max(s, lz);
  }

  // Multi-word: ordered token subsequence in hay
  const ht = tokenize(hay);
  if (phraseAsTokenSubsequence(ht, pt)) s = Math.max(s, 2e5 + pt.length * 10);

  // First few significant tokens appear together as substring (handles brackets / mix differences)
  const significant = pt.filter((w) => w.length > 2 && !/^\d+$/.test(w));
  if (significant.length >= 2) {
    const p4 = significant.slice(0, 4).join(' ');
    if (p4.length >= 6 && hay.includes(p4)) s = Math.max(s, 3.8e5 + significant.length * 10);
    const p3 = significant.slice(0, 3).join(' ');
    if (p3.length >= 6 && hay.includes(p3)) s = Math.max(s, 3.5e5 + significant.length * 10);
    const p2 = significant.slice(0, 2).join(' ');
    if (p2.length >= 8 && hay.includes(p2)) s = Math.max(s, 3.2e5);
  }

  // Partial: most significant words (len>=4) all present as tokens
  const sig = pt.filter((w) => w.length >= 4);
  if (sig.length && sig.every((w) => ht.includes(w))) s = Math.max(s, 1e5 + sig.length * 20);

  return s >= 50000 ? s : 0;
}

async function readMp3Meta(filePath) {
  try {
    const m = await mm.parseFile(filePath, { duration: false });
    const title = m.common.title || '';
    const artist = m.common.artist || (m.common.artists && m.common.artists[0]) || '';
    return { path: filePath, title, artist, base: path.basename(filePath) };
  } catch {
    return { path: filePath, title: '', artist: '', base: path.basename(filePath) };
  }
}

function openFolder(folderPath) {
  const winPath = folderPath.replace(/\//g, '\\');
  if (process.platform === 'win32') {
    exec(`cmd /c start "" "${winPath}"`, (err) => {
      if (err) {
        exec(
          `powershell -NoProfile -Command "Invoke-Item -LiteralPath '${winPath.replace(/'/g, "''")}'"`,
          () => {}
        );
      }
    });
  } else if (process.platform === 'darwin') {
    exec(`open "${folderPath}"`, () => {});
  } else {
    exec(`xdg-open "${folderPath}"`, () => {});
  }
}

async function main() {
  if (!fs.existsSync(playlistPath)) {
    console.error('Playlist JSON not found:', playlistPath);
    process.exit(1);
  }
  if (!fs.existsSync(dir)) {
    console.error('Folder not found:', dir);
    process.exit(1);
  }

  const playlist = JSON.parse(fs.readFileSync(playlistPath, 'utf8'));
  const ordered = [...playlist].sort((a, b) => a.n - b.n);

  const mp3Paths = fs
    .readdirSync(dir)
    .filter((f) => f.toLowerCase().endsWith('.mp3'))
    .map((f) => path.join(dir, f));

  if (mp3Paths.length === 0) {
    console.error('No .mp3 files in folder:', dir);
    process.exit(1);
  }

  let ytByN = {};
  if (fs.existsSync(cacheFile)) {
    try {
      const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      for (const e of cached) ytByN[e.n] = e.ytTitle;
      console.error(`Using yt title cache (${Object.keys(ytByN).length} rows): ${cacheFile}`);
    } catch (e) {
      console.error('Ignoring bad cache file:', e.message);
    }
  } else {
    console.error(
      `No ${path.basename(cacheFile)} — matching uses playlist titles only.\n` +
        'For best accuracy run:  npm run build:dj-set-yt-cache'
    );
  }

  const metas = [];
  for (const p of mp3Paths) {
    metas.push(await readMp3Meta(p));
  }

  const used = new Set();
  const plan = [];

  for (const row of ordered) {
    const rawYt = ytByN[row.n];
    const matchKey =
      rawYt && !/\uFFFD/.test(rawYt) && rawYt.trim().length > 2 ? rawYt : row.title;
    let best = { meta: null, score: 0 };
    for (const meta of metas) {
      if (used.has(meta.path)) continue;
      let s = 0;
      for (const needle of expandMatchNeedles(matchKey)) {
        s = Math.max(s, scoreMatch(needle, meta.title, meta.base));
      }
      if (s > best.score) best = { meta, score: s };
    }
    if (!best.meta || best.score < 50000) {
      console.error(
        `No confident match for #${row.n}: "${row.title}" (match key: "${matchKey}", best score ${best.score})`
      );
      process.exit(1);
    }
    used.add(best.meta.path);
    plan.push({ n: row.n, title: row.title, src: best.meta.path });
  }

  if (used.size !== metas.length) {
    const unused = metas.filter((m) => !used.has(m.path));
    console.error(
      'Unmatched files remain:',
      unused.map((u) => u.base).join(', ')
    );
    process.exit(1);
  }

  const tmpTag = '.cnvtr-order-';
  // Phase 1 -> temp names
  for (let i = 0; i < plan.length; i++) {
    const dest = path.join(dir, `${tmpTag}${i}.mp3`);
    fs.renameSync(plan[i].src, dest);
    plan[i].tmp = dest;
  }
  // Phase 2 -> final names
  for (const row of plan) {
    const num = String(row.n).padStart(3, '0');
    const stem = safeFileStem(row.title);
    const dest = path.join(dir, `${num} - ${stem}.mp3`);
    fs.renameSync(row.tmp, dest);
  }

  console.log(`Renamed ${plan.length} file(s) in playlist order under:\n${dir}`);
  openFolder(dir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
