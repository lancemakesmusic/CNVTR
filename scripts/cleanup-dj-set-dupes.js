/**
 * Remove CNVTR-style duplicate exports: "Artist - Title (1).mp3" when "Artist - Title.mp3" exists.
 * Default folder: ~/Downloads/CNVTR/DJ Set (override with first CLI arg).
 */
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const dir =
  process.argv[2] ||
  path.join(process.env.USERPROFILE || process.env.HOME || '', 'Downloads', 'CNVTR', 'DJ Set');

const re = /^(.+)\s\((\d+)\)\.mp3$/i;

function main() {
  if (!fs.existsSync(dir)) {
    console.error('Folder not found:', dir);
    process.exit(1);
  }
  const names = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.mp3'));
  let removed = 0;
  for (const name of names) {
    const m = name.match(re);
    if (!m) continue;
    const baseName = `${m[1]}.mp3`;
    const dupPath = path.join(dir, name);
    const basePath = path.join(dir, baseName);
    try {
      if (fs.existsSync(basePath) && fs.statSync(basePath).isFile()) {
        fs.unlinkSync(dupPath);
        removed++;
      }
    } catch (e) {
      console.error('Skip', name, e.message);
    }
  }
  console.log(`Removed ${removed} duplicate MP3(s) in:\n${dir}`);

  const winPath = dir.replace(/\//g, '\\');
  if (process.platform === 'win32') {
    // `explorer "path"` can fail from some Node contexts; `start` is more reliable for folders.
    exec(`cmd /c start "" "${winPath}"`, (err) => {
      if (err) {
        exec(`powershell -NoProfile -Command "Invoke-Item -LiteralPath '${winPath.replace(/'/g, "''")}'"`, (e2) => {
          if (e2) console.error('Could not open folder:', e2.message);
        });
      }
    });
  } else if (process.platform === 'darwin') {
    exec(`open "${dir}"`, (err) => {
      if (err) console.error('Could not open Finder:', err.message);
    });
  } else {
    exec(`xdg-open "${dir}"`, (err) => {
      if (err) console.error('Could not open folder:', err.message);
    });
  }
}

main();
