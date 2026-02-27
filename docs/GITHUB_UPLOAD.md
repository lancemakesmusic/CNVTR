# Upload CNVTR to GitHub (then use on your Mac)

Your project is already a git repo with one commit. Follow these steps to put it on GitHub and pull it on your Mac.

---

## 1. Create a new repo on GitHub

1. Go to **https://github.com/new**
2. **Repository name:** `CNVTR` (or any name you like)
3. Choose **Public**
4. **Do not** check "Add a README" or ".gitignore" — you already have them
5. Click **Create repository**

---

## 2. On your Windows PC — add GitHub as remote and push

Open PowerShell in the project folder and run (replace `YOUR_USERNAME` with your GitHub username):

```powershell
cd C:\Users\admin\CNVTR

git remote add origin https://github.com/YOUR_USERNAME/CNVTR.git
git branch -M main
git push -u origin main
```

If GitHub asks you to sign in, use your GitHub username and a **Personal Access Token** (not your password).  
To create a token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token (classic), enable `repo`, then paste the token when prompted for password.

---

## 3. On your Mac — clone and build the app

Open Terminal and run (replace `YOUR_USERNAME` with your GitHub username):

```bash
cd ~
git clone https://github.com/YOUR_USERNAME/CNVTR.git
cd CNVTR
npm install
npm run build:mac
```

The macOS installer will be at: **`CNVTR/release/CNVTR-1.0.0.dmg`**

Double-click the `.dmg` to install CNVTR on your Mac.

---

## Optional: run in dev mode on Mac (no build)

```bash
cd CNVTR
npm install
npm run electron:dev
```

You’ll need **Node.js** and **FFmpeg** installed on your Mac (`brew install node ffmpeg` if you use Homebrew).
