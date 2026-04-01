# Host CNVTR on merkabaent.com — step-by-step

## What you’re uploading

- **One file:** `index.html` from this folder  
- **Full path on your PC:** `C:\Users\admin\CNVTR\website\index.html`

Result on the site: **https://merkabaent.com/cnvtr/** (or https://www.merkabaent.com/cnvtr/ if you use www).

---

## Step 1 — Log in to your web host

- Open your hosting provider’s control panel (e.g. cPanel, Plesk, or your host’s “dashboard”).
- Log in with the account that manages **merkabaent.com**.

---

## Step 2 — Open the website root folder

- Find the folder that is the **document root** for merkabaent.com.  
  Common names: **`public_html`**, **`www`**, **`htdocs`**, or **`httpdocs`**.
- Open that folder.  
  Everything inside it is what visitors see at **merkabaent.com**.

---

## Step 3 — Create the `cnvtr` folder

- Inside that root folder, create a **new folder**.
- Name it exactly: **`cnvtr`** (all lowercase).
- Open the **`cnvtr`** folder so you’re inside it.

---

## Step 4 — Upload index.html

- Use **Upload** (or “File Manager” → Upload).
- Select the file: **`C:\Users\admin\CNVTR\website\index.html`**.
- Upload it **into** the **`cnvtr`** folder (not into `public_html` itself).

You should end up with:

- `public_html/cnvtr/index.html`  
  or  
- `www/cnvtr/index.html`  

(depending on your host’s folder name).

---

## Step 5 — Check the link

- In your browser go to: **https://merkabaent.com/cnvtr/**  
  (or **https://www.merkabaent.com/cnvtr/** if your site uses www.)
- You should see the CNVTR page: logo, tagline, “Download for Windows”, “Download for Mac”, requirements, legal, footer.
- Click **Download for Windows** or **Download for Mac** — they should open your GitHub Releases page.

---

## If you use a different URL

- **Subdomain (e.g. cnvtr.merkabaent.com):** In your host or DNS, point the subdomain to the **folder** that contains `index.html` (e.g. the `cnvtr` folder or a folder you created for the subdomain).
- **Homepage (merkabaent.com):** You’d replace or add to your existing homepage; if you want CNVTR only at **/cnvtr/**, keep the steps above and don’t touch the main root files.

---

## Quick checklist

- [ ] Logged in to host for merkabaent.com  
- [ ] Opened document root (`public_html` or `www`)  
- [ ] Created folder `cnvtr`  
- [ ] Uploaded `index.html` into `cnvtr`  
- [ ] Opened https://merkabaent.com/cnvtr/ and saw the page  
- [ ] Clicked a download button and got GitHub Releases  

Once that works, CNVTR is hosted on merkabaent.com.
