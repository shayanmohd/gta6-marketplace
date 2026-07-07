/* ============================================================================
 * GTA6.LLC — MONETIZATION CONTROL PANEL
 * ----------------------------------------------------------------------------
 * This is the ONE file you edit to turn the site into a money-maker.
 * The site works out of the box (all links point to real official stores).
 * To start EARNING, replace the placeholder IDs / tags below with your own.
 *
 * Nothing here is secret — it ships to the browser. Never put private keys here.
 * Read LAUNCH.md for step-by-step signup instructions for every program.
 * ========================================================================== */

window.GTA6_CONFIG = {

  /* --------------------------------------------------------------------------
   * 1. AFFILIATE — PRE-ORDER RETAILERS  (highest-intent money, do this first)
   * --------------------------------------------------------------------------
   * Each button already links to the REAL store. To earn a commission, append
   * your affiliate tag/param to the URL (instructions per-program in LAUNCH.md).
   * Set `affiliate: true` once you've added your tag so the badge shows.
   */
  preorder: {
    editions: {
      standardPrice: "$79.99",
      ultimatePrice: "$99.99",
      bonus: "Vintage Vice City Pack (pre-order before Nov 20) + 1 month GTA+ (digital)"
    },
    retailers: [
      { key: "rockstar",  label: "Rockstar Store",   emoji: "🎮", note: "Official • best bonuses",
        url: "https://store.rockstargames.com/", affiliate: false },
      { key: "playstation", label: "PlayStation Store", emoji: "🅿️", note: "PS5 / PS5 Pro digital",
        url: "https://store.playstation.com/", affiliate: false },
      { key: "xbox",      label: "Xbox Store",        emoji: "🟢", note: "Series X|S digital",
        url: "https://www.xbox.com/games/store", affiliate: false },
      { key: "amazon",    label: "Amazon",            emoji: "📦", note: "Physical (code-in-box)",
        // → Add your Amazon Associates tag:  ?tag=YOURTAG-20
        url: "https://www.amazon.com/s?k=Grand+Theft+Auto+VI&tag=gta6087-20", affiliate: false },
      { key: "gamestop",  label: "GameStop",          emoji: "🕹️", note: "Physical + trade-in",
        url: "https://www.gamestop.com/", affiliate: false },
      { key: "gmg",       label: "Green Man Gaming",  emoji: "💚", note: "Often discounted keys",
        url: "https://www.greenmangaming.com/", affiliate: false }
    ]
  },

  /* --------------------------------------------------------------------------
   * 2. AFFILIATE — VPN  (⭐ HIGHEST $-PER-SALE — set this up FIRST)
   * --------------------------------------------------------------------------
   * Research finding: a single VPN partner (NordVPN ~$40+/sale + recurring)
   * out-earns dozens of low-ticket key sales. The "reduce lag / stop DDoS /
   * protect your account in GTA Online" angle converts hard. Sign up at
   * nordvpn.com/affiliate (or via Awin/Impact) and paste your link below.
   */
  vpn: {
    show: true,
    headline: "Beat GTA Online lag & DDoS",
    blurb: "Cut ping, dodge DDoS boots, and protect your account when GTA 6's online mode goes live. A gaming VPN is the cheapest upgrade you'll make before launch.",
    brand: "NordVPN",
    cta: "Get the deal",
    url: "https://go.nordvpn.net/aff_c?offer_id=15&aff_id=151959&url_id=902"   // NordVPN affiliate (aff_id 151959)
  },

  /* --------------------------------------------------------------------------
   * 3. AFFILIATE — GEAR TO PLAY GTA 6  (Amazon Associates / brand programs)
   * --------------------------------------------------------------------------
   * Replace each `url` with your affiliate link. Keep it honest & relevant.
   * `price` is display-only — update to match your linked product.
   * Tip: route physical products through Amazon Associates EARLY — the account
   * closes if you don't get 3 qualifying sales in your first 180 days.
   */
  gear: [
    { title: "PlayStation 5 Pro",        emoji: "🎮", price: "$699", tag: "Runs GTA 6 at its best",
      url: "https://www.amazon.com/s?k=PlayStation+5+Pro&tag=gta6087-20" },
    { title: "Xbox Series X",            emoji: "🟢", price: "$499", tag: "4K console-ready",
      url: "https://www.amazon.com/s?k=Xbox+Series+X&tag=gta6087-20" },
    { title: "Secretlab Gaming Chair",   emoji: "🪑", price: "$549", tag: "For those all-nighter sessions",
      url: "https://secretlab.co/" },   // ← Secretlab affiliate: 12% per sale, best margin
    { title: "Razer Headset",            emoji: "🎧", price: "$99",  tag: "Hear Vice City breathe",
      url: "https://www.amazon.com/s?k=razer+gaming+headset&tag=gta6087-20" },
    { title: "4K Capture Card",          emoji: "🎥", price: "$149", tag: "Record launch-day clips",
      url: "https://www.amazon.com/s?k=4k+capture+card&tag=gta6087-20" },
    { title: "2TB NVMe SSD",             emoji: "💾", price: "$129", tag: "GTA 6 is a big install",
      url: "https://www.amazon.com/s?k=2tb+nvme+ssd+ps5&tag=gta6087-20" }
  ],

  /* --------------------------------------------------------------------------
   * 4. AFFILIATE — TOP-UPS & KEYS  (wallet top-ups + legit key deals)
   * --------------------------------------------------------------------------
   * IMPORTANT: never promote "cheap GTA$/Shark Cards" — it violates Take-Two's
   * ToS and gets buyers banned. Monetize wallet top-ups instead. Keep grey-
   * market keys to Eneba ONLY (skip G2A/Kinguin) and show the risk note.
   */
  giftcards: [
    { title: "PSN Gift Cards",      emoji: "🅿️", url: "https://www.amazon.com/s?k=playstation+gift+card&tag=gta6087-20" },
    { title: "Xbox Gift Cards",     emoji: "🟢", url: "https://www.amazon.com/s?k=xbox+gift+card&tag=gta6087-20" },
    { title: "Game Key Deals",      emoji: "🔑", url: "https://www.eneba.com/" }
  ],
  giftcardNote: "Key marketplaces are third-party resellers — buy from reputable sellers only. We are not responsible for third-party purchases.",

  /* --------------------------------------------------------------------------
   * 4b. GUIDE-PAGE AFFILIATE LINKS  (buyer guides: chair / controller / headset)
   * --------------------------------------------------------------------------
   * The buyer-guide pages show static product cards for SEO. Each "Check price"
   * button reads its link from this map by key. Replace each URL with YOUR
   * affiliate link — the pages already work with the plain store links below.
   */
  guideLinks: {
    // gta-6-editions.html
    "editions-standard": "https://store.rockstargames.com/",
    "editions-ultimate": "https://store.rockstargames.com/",
    "editions-amazon":   "https://www.amazon.com/s?k=Grand+Theft+Auto+VI&tag=gta6087-20",
    // best-gaming-chair-gta-6.html
    "chair-secretlab-titan": "https://secretlab.co/",
    "chair-secretlab-classic": "https://secretlab.co/",
    "chair-razer-iskur":    "https://www.amazon.com/s?k=razer+iskur+gaming+chair&tag=gta6087-20",
    "chair-budget":         "https://www.amazon.com/s?k=gaming+chair&tag=gta6087-20",
    // best-controller-gta-6.html
    "controller-dualsense":      "https://www.amazon.com/s?k=dualsense+controller&tag=gta6087-20",
    "controller-dualsense-edge": "https://www.amazon.com/s?k=dualsense+edge&tag=gta6087-20",
    "controller-xbox-elite":     "https://www.amazon.com/s?k=xbox+elite+controller+series+2&tag=gta6087-20",
    "controller-xbox-core":      "https://www.amazon.com/s?k=xbox+wireless+controller&tag=gta6087-20",
    // best-headset-gta-6.html
    "headset-pulse-elite":   "https://www.amazon.com/s?k=pulse+elite+headset&tag=gta6087-20",
    "headset-razer":         "https://www.amazon.com/s?k=razer+barracuda+gaming+headset&tag=gta6087-20",
    "headset-steelseries":   "https://www.amazon.com/s?k=steelseries+arctis+nova&tag=gta6087-20",
    "headset-hyperx-budget": "https://www.amazon.com/s?k=hyperx+cloud+gaming+headset&tag=gta6087-20"
  },

  /* --------------------------------------------------------------------------
   * 4. DISPLAY ADS  (Google AdSense — Auto Ads ALREADY LIVE)
   * --------------------------------------------------------------------------
   * ✅ Auto Ads is active: the loader script is in the <head> of every page and
   *    Google auto-places ads once your site is APPROVED (review takes days-2wks).
   *    Turn "Auto ads" ON in the AdSense dashboard → Apply to site.
   *
   * The block below is ONLY for optional MANUAL ad units (extra control). Leave
   * enabled:false unless you create ad units in AdSense → Ads → By ad unit and
   * paste their slot IDs here.
   */
  adsense: {
    enabled: false,
    client: "ca-pub-6834902829870684",   // your AdSense publisher ID
    slots: {
      inArticle: "0000000000",           // ← paste a real ad-unit slot ID to use
      footer: "0000000000"
    }
  },

  /* --------------------------------------------------------------------------
   * 5. NEWSLETTER / EMAIL LIST  (your #1 long-term asset — build it from day 1)
   * --------------------------------------------------------------------------
   * ⚠️ RECOMMENDED: use a real email service, NOT Supabase, for your list.
   *    Reasons: (1) free Supabase projects PAUSE after ~1 week of inactivity, so
   *    signups silently fail during quiet periods; (2) Supabase can STORE emails
   *    but can't SEND them — you'd have to export to an email tool anyway.
   *
   *    → beehiiv (best: free to 2,500 subs, sends email + built-in monetization)
   *      or Formspree (fastest: 2-min signup, emails you each submission).
   *      Create a form, then set:  provider:"formspree", actionUrl:"https://formspree.io/f/XXXX"
   *      (any provider that accepts a POST works — beehiiv, MailerLite, Formspree.)
   *
   * provider: "supabase" (stopgap, already wired) | "formspree" | "beehiiv" | "mailerlite"
   */
  newsletter: {
    provider: "supabase",
    actionUrl: "",                 // ← paste your Formspree/beehiiv/MailerLite POST URL, then set provider above
    supabaseTable: "subscribers"   // used only when provider === "supabase"
  },

  /* --------------------------------------------------------------------------
   * 6. DIGITAL PRODUCTS & MERCH  (near-zero cost — sell downloads & POD merch)
   * --------------------------------------------------------------------------
   * Sell wallpaper packs / guides via Gumroad/Ko-fi. Sell merch via Printful/
   * Redbubble (no inventory). Use ORIGINAL neon/Miami designs — never Rockstar
   * art or the "GTA" logo (see LAUNCH.md → IP rules). Empty url = card hidden.
   */
  store: [
    { title: "Vice Neon Wallpaper Pack", emoji: "🖼️", price: "$4", type: "download",
      blurb: "40 phone + desktop 4K wallpapers. Original neon art.", url: "" },
    { title: "GTA 6 Launch Guide (PDF)", emoji: "📘", price: "$7", type: "download",
      blurb: "Everything confirmed + pre-order checklist + launch-day tips.", url: "" },
    { title: "Countdown Tee",            emoji: "👕", price: "$24", type: "merch",
      blurb: "Original 'See you in Vice City' neon design. Print-on-demand.", url: "" }
  ],

  /* --------------------------------------------------------------------------
   * 7. DONATIONS / TIP JAR  (small but instant — costs nothing to add)
   * --------------------------------------------------------------------------
   */
  support: {
    kofi: "",             // e.g. "https://ko-fi.com/yourname"
    buymeacoffee: ""      // e.g. "https://buymeacoffee.com/yourname"
  },

  /* --------------------------------------------------------------------------
   * 8. SOCIAL / COMMUNITY  (traffic engine — see LAUNCH.md playbook)
   * --------------------------------------------------------------------------
   */
  social: {
    discord: "",   // your invite link — a community you own = repeat traffic
    twitter: "",   // https://x.com/yourhandle
    tiktok: "",    // countdown clips convert insanely well pre-launch
    youtube: "",
    reddit: ""
  }
};
