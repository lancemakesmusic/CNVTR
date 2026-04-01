# CNVTR landing page for merkabaent.com

This folder is a **static, single-file site**. No build step, no server required.

## Contents

- **index.html** — One page with download links, description, requirements, and legal note.

## How to put it on merkabaent.com

1. **Upload** the contents of this folder to your web host (e.g. via FTP, cPanel File Manager, or your host’s static site deploy).
2. **Place it** where you want the app to live, for example:
   - **Subfolder:** `merkabaent.com/cnvtr/` → upload so `index.html` is at `merkabaent.com/cnvtr/index.html`
   - **Subdomain:** e.g. `cnvtr.merkabaent.com` → point the subdomain to the folder that contains `index.html`
3. **Download links** point to `https://github.com/lancemakesmusic/CNVTR/releases/latest`. After you publish a release with Windows and Mac installers, the page will offer the right files.

No backend or database: the page runs entirely on its own and works offline once loaded (except for the download buttons).
