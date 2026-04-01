# Host CNVTR on merkabaent.com (Wix)

Wix doesn’t let you upload a custom HTML file. Use one of these approaches.

**Fastest:** Option A — add a Wix page with two buttons that link to GitHub Releases.

---

## Option A — Wix page + links to GitHub (simplest)

Create a normal Wix page and add buttons that point to your GitHub release. No file upload.

### 1. Create a new page

1. In **Wix Editor**, go to **Pages** (left sidebar) → **Add Page**.
2. Choose **Blank** or **Start from scratch**.
3. Name the page **CNVTR** (or “CNVTR Download”).  
   The URL will be something like **merkabaent.com/cnvtr** (Wix may add a prefix; you can set the slug in Page Settings).

### 2. Add content

1. Add a **Title** or **Heading**: e.g. **CNVTR**.
2. Add **Text**: e.g. “Turn any public link into studio-ready audio. Free desktop app for Windows and Mac.”
3. Add **two buttons** (or a single “Download” section with two links):
   - **Download for Windows**  
     Link: **https://github.com/lancemakesmusic/CNVTR/releases/latest**  
     (Visitors will pick the Windows installer on the GitHub page.)
   - **Download for Mac**  
     Same link: **https://github.com/lancemakesmusic/CNVTR/releases/latest**  
     (Visitors will pick the Mac .dmg on the GitHub page.)
4. Optional: add a short line like “Requires FFmpeg. See the release page for details.”
5. Optional: add a link “Source code” → **https://github.com/lancemakesmusic/CNVTR**

### 3. Set the page URL

- Click the page in the **Pages** list → **Show More** (…) → **Settings** (or **Page URL**).
- Set the URL slug to **cnvtr** so the page is **merkabaent.com/cnvtr** (or www.merkabaent.com/cnvtr).

### 4. Publish

- Click **Publish** so the new page is live.

---

## Option B — Use GitHub Pages for the full landing page, link from Wix

Host the designed landing page (the `index.html` from the `website` folder) on **GitHub Pages** for free, then link to it from Wix.

### 1. Enable GitHub Pages for CNVTR

1. Go to **https://github.com/lancemakesmusic/CNVTR** → **Settings** → **Pages**.
2. Under **Source**, choose **Deploy from a branch**.
3. **Branch:** pick **main** (or **master**), folder **/ (root)**.
4. Click **Save**.  
   The site will be at **https://lancemakesmusic.github.io/CNVTR/** only if the repo has an `index.html` at the root. Right now the HTML is in `website/index.html`, so you have two choices:
   - **A)** Copy `website/index.html` to the **root** of the repo (so the repo has `index.html` at the top level), commit and push. Then the Pages URL will serve it.
   - **B)** Set the Pages source to the **website** folder if your theme supports it (many do: “Branch: main, folder: /website”). Then the URL might be **https://lancemakesmusic.github.io/CNVTR/website/** or similar.

So the “pretty” CNVTR page will live at a URL like:

- **https://lancemakesmusic.github.io/CNVTR/** (if index.html is at repo root), or  
- **https://lancemakesmusic.github.io/CNVTR/website/** (if served from website folder).

### 2. Link from Wix

1. Create a Wix page (e.g. **CNVTR** with URL **/cnvtr**).
2. Add a heading and one main button: **“Download CNVTR”** or **“Go to CNVTR”**.
3. Set the button link to your GitHub Pages URL (e.g. **https://lancemakesmusic.github.io/CNVTR/**).
4. Publish.

Then **merkabaent.com/cnvtr** will send people to the full landing page on GitHub Pages, and from there they can download from GitHub Releases.

---

## Recommendation

- **Use Option A** if you’re fine with a simple Wix page and “Download for Windows” / “Download for Mac” buttons that go straight to GitHub Releases.
- **Use Option B** if you want the full dark-themed landing page (with requirements, legal, etc.) and don’t mind that it’s served from GitHub Pages with a link from Wix.

Both work with Wix; Option A is faster to set up.
