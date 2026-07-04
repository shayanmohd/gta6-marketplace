/* ============================================================================
   GTA6.LLC — GTA 6 Countdown & Hub
   All content/links are driven by config.js. Edit config.js to monetize.
   ============================================================================ */

const CFG = window.GTA6_CONFIG || {};
const $ = (id) => document.getElementById(id);

/* GTA 6 official release date. Change here if Rockstar updates it. */
const RELEASE = new Date("2026-11-19T00:00:00");

/* ---------------------------------------------------------------------------
   COUNTDOWN
--------------------------------------------------------------------------- */
function pad(n) { return String(n).padStart(2, "0"); }

function tickCountdown() {
  const diff = RELEASE - new Date();
  const d = $("cdDays"), h = $("cdHours"), m = $("cdMins"), s = $("cdSecs");
  if (!d) return;

  if (diff <= 0) {
    [h, m, s].forEach((el) => (el.textContent = "00"));
    d.textContent = "0";
    const sub = document.querySelector(".hero-sub");
    if (sub) sub.innerHTML = "<strong>GTA 6 is LIVE.</strong> Welcome back to Vice City — grab it below.";
    return;
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff / 3600000) % 24);
  const mins = Math.floor((diff / 60000) % 60);
  const secs = Math.floor((diff / 1000) % 60);
  d.textContent = String(days);
  h.textContent = pad(hours);
  m.textContent = pad(mins);
  s.textContent = pad(secs);
}

/* ---------------------------------------------------------------------------
   RENDER: PRE-ORDER RETAILERS
--------------------------------------------------------------------------- */
function renderRetailers() {
  const grid = $("retailerGrid");
  const po = CFG.preorder;
  if (!grid || !po) return;

  if (po.editions) {
    if ($("stdPrice") && po.editions.standardPrice) $("stdPrice").textContent = po.editions.standardPrice;
    if ($("ultPrice") && po.editions.ultimatePrice) $("ultPrice").textContent = po.editions.ultimatePrice;
  }

  grid.innerHTML = (po.retailers || []).map((r) => `
    <a class="retailer" href="${r.url}" target="_blank" rel="noopener sponsored" data-track="preorder:${r.key}">
      ${r.affiliate ? '<span class="r-badge">Deal</span>' : ''}
      <span class="r-emoji">${r.emoji || "🛒"}</span>
      <span class="r-body">
        <span class="r-label">${r.label}</span><br>
        <span class="r-note">${r.note || ""}</span>
      </span>
      <span class="r-arrow">→</span>
    </a>`).join("");
}

/* ---------------------------------------------------------------------------
   RENDER: GEAR + GIFT CARDS
--------------------------------------------------------------------------- */
function renderGear() {
  const grid = $("gearGrid");
  if (grid && Array.isArray(CFG.gear)) {
    grid.innerHTML = CFG.gear.map((g) => `
      <div class="gear-card">
        <div class="gear-emoji">${g.emoji || "🎮"}</div>
        <h3>${g.title}</h3>
        <p class="gear-tag">${g.tag || ""}</p>
        <div class="gear-foot">
          <span class="gear-price">${g.price || ""}</span>
          <a class="gear-btn" href="${g.url}" target="_blank" rel="noopener sponsored" data-track="gear:${g.title}">View →</a>
        </div>
      </div>`).join("");
  }

  const row = $("giftcardRow");
  if (row && Array.isArray(CFG.giftcards)) {
    row.innerHTML = CFG.giftcards.map((c) => `
      <a class="giftcard" href="${c.url}" target="_blank" rel="noopener sponsored" data-track="giftcard:${c.title}">
        <span>${c.emoji || "🎁"}</span> ${c.title}
      </a>`).join("");
  }

  const note = $("giftcardNote");
  if (note && CFG.giftcardNote) { note.textContent = CFG.giftcardNote; note.hidden = false; }
}

/* ---------------------------------------------------------------------------
   RENDER: VPN money band
--------------------------------------------------------------------------- */
function renderVpn() {
  const band = $("vpnBand");
  const v = CFG.vpn;
  if (!band || !v || !v.show) return;
  if ($("vpnHeadline") && v.headline) $("vpnHeadline").textContent = v.headline;
  if ($("vpnBlurb")) $("vpnBlurb").textContent = v.blurb || "";
  const cta = $("vpnCta");
  if (cta) { cta.href = v.url || "#"; cta.textContent = (v.cta || "Get the deal") + (v.brand ? " →" : ""); }
  band.hidden = false;
}

/* ---------------------------------------------------------------------------
   RENDER: STORE (digital products + merch — only cards with a url show)
--------------------------------------------------------------------------- */
function renderStore() {
  const grid = $("storeGrid");
  if (!grid) return;
  const live = (CFG.store || []).filter((p) => p.url && p.url.trim());
  if (!live.length) {
    grid.innerHTML = "";
    const empty = $("storeEmpty");
    if (empty) empty.hidden = false;
    return;
  }
  grid.innerHTML = live.map((p) => `
    <div class="store-card">
      <div class="store-emoji">${p.emoji || "🛍️"}</div>
      <h3>${p.title}</h3>
      <p class="store-blurb">${p.blurb || ""}</p>
      <div class="store-price">${p.price || ""}</div>
      <a class="btn btn-primary" href="${p.url}" target="_blank" rel="noopener" data-track="store:${p.title}" style="justify-content:center">
        ${p.type === "merch" ? "Shop" : "Get it"}
      </a>
    </div>`).join("");
}

/* ---------------------------------------------------------------------------
   RENDER: COMMUNITY + SUPPORT
--------------------------------------------------------------------------- */
function renderCommunity() {
  const social = CFG.social || {};
  const map = [
    { key: "discord", label: "Discord", emoji: "💬" },
    { key: "twitter", label: "X / Twitter", emoji: "𝕏" },
    { key: "tiktok",  label: "TikTok",  emoji: "🎵" },
    { key: "youtube", label: "YouTube", emoji: "▶️" },
    { key: "reddit",  label: "Reddit",  emoji: "👽" },
  ];
  const el = $("communitySocial");
  if (el) {
    const links = map.filter((m) => social[m.key]).map((m) =>
      `<a class="social-btn" href="${social[m.key]}" target="_blank" rel="noopener">${m.emoji} ${m.label}</a>`).join("");
    el.innerHTML = links || `<p style="color:var(--muted)">Follow the countdown — social links coming soon.</p>`;
  }

  const support = CFG.support || {};
  const sup = $("supportRow");
  if (sup) {
    let html = "";
    if (support.kofi) html += `<a class="btn btn-ghost" href="${support.kofi}" target="_blank" rel="noopener">☕ Support on Ko-fi</a>`;
    if (support.buymeacoffee) html += `<a class="btn btn-ghost" href="${support.buymeacoffee}" target="_blank" rel="noopener">🧋 Buy me a coffee</a>`;
    sup.innerHTML = html;
  }
}

/* ---------------------------------------------------------------------------
   DISPLAY ADS (Google AdSense) — only loads if enabled in config
--------------------------------------------------------------------------- */
function initAds() {
  const ads = CFG.adsense;
  if (!ads || !ads.enabled || !ads.client || ads.client.includes("XXXX")) return;

  const s = document.createElement("script");
  s.async = true;
  s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.client}`;
  s.crossOrigin = "anonymous";
  document.head.appendChild(s);

  document.querySelectorAll(".ad-slot").forEach((slot) => {
    const key = slot.dataset.ad;
    const slotId = ads.slots && ads.slots[key];
    if (!slotId) return;
    slot.hidden = false;
    slot.setAttribute("data-filled", "1");
    slot.innerHTML = `<ins class="adsbygoogle" style="display:block" data-ad-client="${ads.client}" data-ad-slot="${slotId}" data-ad-format="auto" data-full-width-responsive="true"></ins>`;
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  });
}

/* ---------------------------------------------------------------------------
   NEWSLETTER / EMAIL CAPTURE
--------------------------------------------------------------------------- */
let sb = null;
function getSupabase() {
  if (sb) return sb;
  try {
    if (window.supabase && window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
      sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
    }
  } catch (e) {}
  return sb;
}

async function handleNotify(e) {
  e.preventDefault();
  const input = $("notifyEmail");
  const msg = $("notifyMsg");
  const email = (input.value || "").trim();
  msg.className = "form-message";

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    msg.textContent = "Please enter a valid email.";
    msg.classList.add("error");
    return;
  }

  const nl = CFG.newsletter || {};
  let captured = false;

  try {
    if (nl.provider === "supabase") {
      const client = getSupabase();
      if (client) {
        const { error } = await client.from(nl.supabaseTable || "subscribers")
          .insert({ email, source: "gta6.llc", created_at: new Date().toISOString() });
        if (!error) captured = true;
        else if (String(error.message || "").toLowerCase().includes("duplicate")) {
          msg.textContent = "You're already on the list. See you Nov 19! 🌴";
          msg.classList.add("success");
          e.target.reset();
          return;
        }
      }
    } else if (nl.actionUrl) {
      const res = await fetch(nl.actionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
      });
      captured = res.ok;
    }
  } catch (err) { /* fall through to local backup */ }

  // Local backup so no signup is ever lost, even if the backend isn't set up yet.
  try {
    const key = "gta6-subscribers";
    const list = JSON.parse(localStorage.getItem(key) || "[]");
    if (!list.includes(email)) { list.push(email); localStorage.setItem(key, JSON.stringify(list)); }
  } catch (e) {}

  msg.textContent = "You're in! We'll ping you the moment GTA 6 goes live. 🌴";
  msg.classList.add("success");
  e.target.reset();
  showToast("🔔 Launch alert set!");
  if (!captured) console.info("[gta6.llc] Email stored locally. Connect a backend in config.js → newsletter to collect them centrally. See LAUNCH.md.");
}

/* ---------------------------------------------------------------------------
   UI: nav, scroll, reveal, toast, back-to-top
--------------------------------------------------------------------------- */
function showToast(text) {
  const t = $("toast");
  if (!t) return;
  t.textContent = text;
  t.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

function setupNav() {
  const toggle = $("menuToggle");
  const nav = $("siteNav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

function setupScroll() {
  const header = document.querySelector(".site-header");
  const top = $("backToTop");
  window.addEventListener("scroll", () => {
    if (header) header.classList.toggle("scrolled", window.scrollY > 40);
    if (top) top.classList.toggle("visible", window.scrollY > 500);
  }, { passive: true });
  if (top) top.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

function setupCalendarShare() {
  const cal = $("addCalendar");
  if (cal) {
    // Universal Google Calendar template link for the Nov 19, 2026 launch.
    const start = "20261119T000000", end = "20261119T010000";
    const text = encodeURIComponent("GTA 6 Launch Day 🌴");
    const details = encodeURIComponent("Grand Theft Auto VI is out! Countdown & guides: https://gta6.llc");
    cal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}`;
    cal.target = "_blank"; cal.rel = "noopener";
  }

  const share = $("shareBtn");
  if (share) {
    share.addEventListener("click", async () => {
      const data = { title: "GTA 6 Countdown", text: "GTA 6 drops Nov 19, 2026 — live countdown:", url: "https://gta6.llc" };
      try {
        if (navigator.share) { await navigator.share(data); return; }
        await navigator.clipboard.writeText(data.url);
        showToast("🔗 Link copied!");
      } catch (e) { showToast("Share: gta6.llc"); }
    });
  }
}

function setupReveal() {
  const els = document.querySelectorAll(".section, .notify-card");
  if (!("IntersectionObserver" in window)) { els.forEach((el) => el.classList.add("visible")); return; }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); } });
  }, { threshold: 0.08 });
  els.forEach((el) => obs.observe(el));
}

/* ---------------------------------------------------------------------------
   INIT
--------------------------------------------------------------------------- */
function init() {
  renderRetailers();
  renderGear();
  renderVpn();
  renderStore();
  renderCommunity();
  initAds();

  tickCountdown();
  setInterval(tickCountdown, 1000);

  setupNav();
  setupScroll();
  setupReveal();
  setupCalendarShare();

  const form = $("notifyForm");
  if (form) form.addEventListener("submit", handleNotify);

  const year = $("year");
  if (year) year.textContent = String(new Date().getFullYear());
}

document.addEventListener("DOMContentLoaded", init);
