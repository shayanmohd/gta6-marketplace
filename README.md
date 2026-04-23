# Vice Syndicate - GTA 6 Inspired Static Site

Small, stylish, interactive static website for a GTA 6 inspired marketplace plus info hub.

## Runtime Behavior

The marketplace is fully functional as a static front end:
- category filtering
- live search
- bid actions on each listing
- persistent bids and watchlist via localStorage
- clear bid state action

This is client-side functionality only. It does not include a backend, real payments, or auth.

## One-Pass Publish (GitHub Pages)

Run these commands from the parent directory of this project:

```bash
cd gta6-marketplace
git init
git branch -M main
git add .
git commit -m "Initial GTA6 marketplace site"
git remote add origin git@github.com:shayanmohd/gta6-marketplace.git
git push -u origin main
```

Then in GitHub repo settings:
- open Pages
- Source: Deploy from a branch
- Branch: main
- Folder: /(root)
- save

After deploy, expected URL:
- https://shayanmohd.github.io/gta6-marketplace

## Domain Setup (gta6.llc)

This repository already includes CNAME configured as:
- gta6.llc

In Namecheap DNS, add:
- A record: @ -> 185.199.108.153
- A record: @ -> 185.199.109.153
- A record: @ -> 185.199.110.153
- A record: @ -> 185.199.111.153
- CNAME record: www -> shayanmohd.github.io

In GitHub Pages settings:
- Custom domain: gta6.llc
- Enable Enforce HTTPS (once certificate is issued)

## Local Preview

```bash
cd gta6-marketplace
python3 -m http.server 5500
```

Open http://localhost:5500.

## Note

Unofficial fan-made experience. Not affiliated with Rockstar Games.
