# Step-by-step: Test, release, and put CNVTR on merkabaent.com

Follow these in order. Everything uses tools you already have (terminal, browser, your web host).

---

## Part 1 — Test the app on your computer

### 1.1 Open the project in a terminal

- **Windows:** Open PowerShell or Command Prompt.
- Go to the project folder:
  ```bash
  cd C:\Users\admin\CNVTR
  ```

### 1.2 Install dependencies (if you haven’t already)

```bash
npm install
```

Wait until it finishes without errors.

### 1.3 Run the app in dev mode

```bash
npm run electron:dev
```

- A CNVTR window should open (and maybe a separate DevTools window; you can close DevTools).
- The first time, you’ll see **Terms of Use**. Click **“I agree — Continue”**.

### 1.4 Check the requirements banner

- If **yt-dlp** or **FFmpeg** is missing on your PC, a red banner appears at the top saying something like “yt-dlp not found” or “FFmpeg not found” with a download link.
- The **Convert** button should be **disabled** (greyed out) when either is missing.
- If both are available (e.g. you have the `yt-dlp` folder and FFmpeg on PATH), there is no banner and Convert is enabled.

### 1.5 Test a conversion

1. Paste a **single public YouTube URL** in the big text box (e.g. any public music video).
2. Leave **Output format** as MP3 and **Quality** as Studio.
3. Click **Convert**.
4. In the **Queue** section you should see the job move from “downloading” to “converting” to “Done”.
5. In the **Log** at the bottom you should see lines like “Starting batch…”, “[download] …”, “Saved: …”.
6. If “Open folder after download” is checked, the output folder (e.g. `Downloads\CNVTR`) should open and you should see the new MP3 file.

If anything fails (e.g. “FFmpeg not found” in the queue), fix that (install FFmpeg and add it to PATH) and try again. When this works, you’re ready to build and release.

### 1.6 Stop the app

- Close the CNVTR window, or in the terminal press **Ctrl+C** to stop the dev server.

---

## Part 2 — Publish a release on GitHub (Windows + Mac installers)

### 2.1 Build the Windows installer (on your Windows PC)

In the same project folder:

```bash
cd C:\Users\admin\CNVTR
npm run build:win
```

- Wait until it finishes. You should see something like: `building target=nsis file=release\CNVTR Setup 1.0.0.exe`.
- The installer file is here: **`C:\Users\admin\CNVTR\release\CNVTR Setup 1.0.0.exe`**.

### 2.2 Get the Mac installer

You have two options:

**Option A — You have a Mac**

1. On the Mac, open Terminal.
2. Clone the repo and build:
   ```bash
   git clone https://github.com/lancemakesmusic/CNVTR.git
   cd CNVTR
   npm install
   npm run build:mac
   ```
3. The Mac installer will be at: **`CNVTR/release/CNVTR-1.0.0.dmg`**. Copy this file to your Windows PC (e.g. via USB, cloud storage, or email yourself) so you can upload it in the next step.

**Option B — Use GitHub Actions (no Mac needed)**

1. On your Windows PC, push your latest code to GitHub (if you haven’t already):
   ```bash
   cd C:\Users\admin\CNVTR
   git add -A
   git commit -m "Prepare release"
   git push origin main
   ```
2. In your browser go to: **https://github.com/lancemakesmusic/CNVTR**
3. Click the **Actions** tab.
4. In the left sidebar click **Release** (the workflow we added).
5. Click **Run workflow** (right side), then the green **Run workflow** button.
6. Wait until both jobs (build-windows and build-mac) are green (about 5–10 minutes).
7. Click the latest run, then at the bottom you’ll see **Artifacts**.
8. Download **cnvtr-windows** (contains the .exe) and **cnvtr-macos** (contains the .dmg). Unzip each if needed so you have:
   - `CNVTR Setup 1.0.0.exe`
   - `CNVTR-1.0.0.dmg`

### 2.3 Create the release on GitHub

1. Go to: **https://github.com/lancemakesmusic/CNVTR/releases**
2. Click **“Draft a new release”**.
3. **Choose a tag:** Click **“Choose a tag”**, type e.g. **`v1.0.0`**, then click **“Create new tag: v1.0.0”**. Leave “Target” as your main branch (e.g. `main`).
4. **Release title:** e.g. **CNVTR 1.0.0**
5. **Description:** You can write something like:
   ```
   First public release.
   - Windows: run the installer, then install FFmpeg and add it to PATH.
   - Mac: open the .dmg, drag CNVTR to Applications. Install FFmpeg (e.g. `brew install ffmpeg`).
   ```
6. **Attach files:** Scroll to the “Attach binaries” area. Drag and drop (or click to select):
   - **CNVTR Setup 1.0.0.exe** (Windows)
   - **CNVTR-1.0.0.dmg** (Mac)
7. Leave “Set as the latest release” checked.
8. Click **“Publish release”**.

Your release URL will be: **https://github.com/lancemakesmusic/CNVTR/releases/tag/v1.0.0**  
The landing page’s “Download for Windows” and “Download for Mac” links point to **releases/latest**, so they will now offer these installers.

---

## Part 3 — Put the page on merkabaent.com

The goal is to have **merkabaent.com/cnvtr/** (or another URL you choose) show the CNVTR landing page.

### 3.1 Get the files from your project

On your computer, the page is in:

- **Folder:** `C:\Users\admin\CNVTR\website\`
- **File you need:** `index.html` (and optionally `README.md`; only `index.html` is required for the page).

So you need to upload **at least** `C:\Users\admin\CNVTR\website\index.html` to your web host.

### 3.2 Log in to your web host

- Open the place where you manage **merkabaent.com** (e.g. cPanel, Plesk, your host’s “File Manager”, or FTP).
- Log in with the same account you use for merkabaent.com.

### 3.3 Find the root folder for merkabaent.com

- There is usually a folder named **`public_html`**, **`www`**, **`htdocs`**, or **`httpdocs`**. That folder is the “root” of merkabaent.com: whatever you put in it appears at **merkabaent.com**.
- If you’re not sure, check your host’s help or ask their support: “Where do I upload files so they appear on my domain?”

### 3.4 Create a subfolder for CNVTR (for merkabaent.com/cnvtr/)

Inside that root folder:

1. Create a **new folder**.
2. Name it exactly: **`cnvtr`** (all lowercase, no spaces).  
   So you’ll have something like:
   - `public_html/cnvtr/`  
   or  
   - `www/cnvtr/`

### 3.5 Upload index.html into the cnvtr folder

1. Open the **`cnvtr`** folder you just created.
2. **Upload** the file **`index.html`** from `C:\Users\admin\CNVTR\website\index.html` into this folder.
3. After upload, the path on the server should look like:
   - `public_html/cnvtr/index.html`  
   or  
   - `www/cnvtr/index.html`

Most hosts treat `index.html` as the default page for a folder, so:

- **URL to use:** **https://merkabaent.com/cnvtr/**  
  (or **https://www.merkabaent.com/cnvtr/** if your site uses www.)

### 3.6 Check that it works

1. Open a browser and go to: **https://merkabaent.com/cnvtr/**  
   (or **https://www.merkabaent.com/cnvtr/** if that’s your setup.)
2. You should see the CNVTR page: logo, tagline, “Download for Windows”, “Download for Mac”, requirements, and footer links.
3. Click **“Download for Windows”** (or Mac). You should be taken to your GitHub release page where the installers are.

If you see a “404 Not Found” or a directory listing instead of the page:

- Confirm the file is named exactly **`index.html`** (lowercase).
- Confirm it’s inside the **`cnvtr`** folder (e.g. `public_html/cnvtr/index.html`).
- Try **https://merkabaent.com/cnvtr/index.html**; if that works, the folder/default setup may need to be fixed (your host’s help can say how to set “index.html” as default).

---

## Quick reference

| Step | What to do |
|------|------------|
| **1** | In `C:\Users\admin\CNVTR`: `npm install` then `npm run electron:dev`. Accept terms, check banner/Convert, test one URL. |
| **2** | Build Windows: `npm run build:win`. Get Mac build from a Mac or from GitHub Actions. |
| **3** | On GitHub: Releases → Draft release → tag e.g. `v1.0.0` → attach `.exe` and `.dmg` → Publish. |
| **4** | On your host: create folder `cnvtr` in site root, upload `website/index.html` into it. |
| **5** | Open **https://merkabaent.com/cnvtr/** and test the download links. |

If you tell me how you manage merkabaent.com (e.g. “cPanel”, “FTP”, “Netlify”), I can give the exact clicks or commands for that setup.
