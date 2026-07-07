# Deploying Storey to Vercel

This is a **static site** (HTML, CSS, JS, images, one video) — no build step, no server.
`vercel.json` turns on clean URLs, so `work.html` is served at `/work`, and `index.html` at `/`.

Files that ship:
- `index.html` (home), `work.html`, `work-momtribe.html`, `services.html`, `about.html`, `contact.html`
- `storey.css`, `storey.js`
- `logo/` (favicon, app icon, marks), `work-assets/` (case-study images + website video)
- `robots.txt`, `sitemap.xml`, `vercel.json`

---

## 1. Deploy

### Option A — Vercel CLI (fastest)
1. Install Node.js if you don't have it: https://nodejs.org
2. In a terminal:
   ```
   npm i -g vercel
   cd "/Users/jessicajudd/Documents/Storey Brand & Website"
   vercel
   ```
   - First run asks you to log in (opens your browser — you're already signed in).
   - Accept the defaults. Framework preset: **Other**. Build command: **none**. Output dir: **./**
3. When it finishes you'll get a preview URL. Ship it live with:
   ```
   vercel --prod
   ```

### Option B — GitHub + Vercel dashboard (no terminal)
1. Put this folder in a GitHub repo (GitHub Desktop makes this a few clicks).
2. In Vercel: **Add New → Project → Import** that repo.
3. Framework preset: **Other**. No build command. Click **Deploy**.

---

## 2. Custom domain (madebystorey.com)
1. Vercel → your project → **Settings → Domains** → add `madebystorey.com` and `www.madebystorey.com`.
2. At your domain registrar, add the DNS records Vercel shows you:
   - Apex `madebystorey.com` → **A** record `76.76.21.21`
   - `www` → **CNAME** `cname.vercel-dns.com`
3. Vercel auto-issues the SSL certificate once DNS resolves (a few minutes to a couple hours).

The canonical URLs and sitemap already point to `https://madebystorey.com/…`, so no code changes needed if you use that domain.

---

## 3. Contact form (Formspree)
The form on `/contact` posts to Formspree (works on any static host — no backend).
1. Create a free account at https://formspree.io and add a new form.
2. Copy its endpoint, e.g. `https://formspree.io/f/abcdwxyz`.
3. In `contact.html`, replace `YOUR_FORM_ID` in the form's `action` with your ID:
   ```html
   <form class="form reveal" action="https://formspree.io/f/abcdwxyz" method="POST">
   ```
4. Redeploy (`vercel --prod`, or push to GitHub). Your first submission triggers a one-time confirm email from Formspree.

---

## 4. After launch
- Submit `https://madebystorey.com/sitemap.xml` in Google Search Console.
- Replace the placeholder OG image (`logo/storey-appicon-512.png`) with a real 1200×630 share image when ready.
- Swap the sample case-study projects for real ones as you add them.
