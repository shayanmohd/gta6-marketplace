# GTA6.LLC — GTA 6 Countdown & Hub

A fast, static **GTA 6 launch hub**: a live countdown to the November 19, 2026 release, a where-to-pre-order buyer's guide, "everything we know," the Leonida map, an FAQ, and an email capture — built to turn launch hype into real revenue at near-zero cost.

**Live:** [gta6.llc](https://gta6.llc) · **Stack:** vanilla HTML/CSS/JS · GitHub Pages · optional free Supabase backend · **no build step.**

> 👉 **To make money with this site, read [LAUNCH.md](LAUNCH.md).** It's the full monetization + marketing playbook.

## What's here

| File | Purpose |
|---|---|
| `index.html` | The countdown hub (hero + pre-order guide + gear + news + map + FAQ + email capture). |
| `best-vpn-gta-online.html` | Top affiliate "money page" (VPN — highest $/sale). |
| `pc-release-tracker.html` | Evergreen PC-release tracker (survives the post-launch traffic cliff). |
| `styles.css` | Neon Vice City design system, responsive, reduced-motion aware. |
| `script.js` | Countdown, config-driven rendering, email capture, calendar/share, conditional ads. |
| **`config.js`** | **The one file you edit to monetize** — affiliate links, ad IDs, newsletter, socials. |
| `supabase_migration.sql` | Creates the `subscribers` table (insert-only, safe for the public key). |
| `ads.txt`, `sitemap.xml`, `robots.txt`, `og-image.svg` | SEO / ads / social scaffolding. |

## Quick start

```bash
# preview locally
python3 -m http.server 5500      # → http://localhost:5500

# publish (GitHub Pages, already configured for gta6.llc)
git add -A && git commit -m "Relaunch: GTA 6 countdown & hub" && git push origin main
```

## Turn on the money (summary)

1. Edit **`config.js`**: paste your NordVPN + Amazon Associates + AdSense IDs and your Discord/socials.
2. Run `supabase_migration.sql` in Supabase so email signups are saved.
3. Add your AdSense `pub-ID` to `ads.txt`; set `adsense.enabled: true` after approval.
4. Submit `sitemap.xml` to Google Search Console + Bing.
5. Post original countdown content on Reddit + TikTok/Shorts. → **Full details in [LAUNCH.md](LAUNCH.md).**

## Updating the release date

If Rockstar changes the date, edit `RELEASE` in `script.js` and the copy/schema in `index.html`.

## Disclaimer

GTA6.LLC is an **unofficial fan project**. Not affiliated with, authorized, or endorsed by Rockstar Games or Take-Two Interactive. "Grand Theft Auto" and "GTA" are trademarks of their respective owners, used here for identification and commentary only. All release info is sourced from official Rockstar announcements and is subject to change.
