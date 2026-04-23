const countdownEl = document.getElementById("countdown");
const targetDate = new Date("2026-10-01T00:00:00");

function updateCountdown() {
  const now = new Date();
  const diff = targetDate - now;

  if (diff <= 0) {
    countdownEl.textContent = "Live now";
    return;
  }

  const day = 1000 * 60 * 60 * 24;
  const hour = 1000 * 60 * 60;
  const minute = 1000 * 60;

  const days = Math.floor(diff / day);
  const hours = Math.floor((diff % day) / hour);
  const minutes = Math.floor((diff % hour) / minute);

  countdownEl.textContent = `${days}d ${hours}h ${minutes}m`;
}

setInterval(updateCountdown, 1000);
updateCountdown();

const revealEls = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 }
);
revealEls.forEach((el) => revealObserver.observe(el));

const counters = document.querySelectorAll(".counter");
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const el = entry.target;
      const target = Number(el.getAttribute("data-target"));
      let count = 0;
      const duration = 1000;
      const steps = 40;
      const increment = target / steps;
      const interval = duration / steps;

      const timer = setInterval(() => {
        count += increment;
        if (count >= target) {
          el.textContent = `${target}${target === 98 ? "%" : "+"}`;
          clearInterval(timer);
          return;
        }
        el.textContent = `${Math.floor(count)}`;
      }, interval);

      counterObserver.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
counters.forEach((counter) => counterObserver.observe(counter));

const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".market-card");
const searchInput = document.getElementById("searchInput");
const marketSummary = document.getElementById("marketSummary");
const watchlistItems = document.getElementById("watchlistItems");
const clearBidsButton = document.getElementById("clearBids");

let activeFilter = "all";
const BID_STORAGE_KEY = "vice-syndicate-bids";

function formatPrice(value) {
  return `$${value.toLocaleString("en-US")}`;
}

function getStoredBids() {
  const raw = localStorage.getItem(BID_STORAGE_KEY);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function setStoredBids(bids) {
  localStorage.setItem(BID_STORAGE_KEY, JSON.stringify(bids));
}

function showToast(message) {
  let toast = document.querySelector(".market-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "market-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function renderWatchlist() {
  const bids = getStoredBids();
  const entries = Object.entries(bids);
  watchlistItems.innerHTML = "";

  if (entries.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.textContent = "No bids yet. Hit Bid +5% on any listing.";
    watchlistItems.appendChild(emptyItem);
    return;
  }

  entries
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .forEach(([_, bid]) => {
      const item = document.createElement("li");
      const itemName = document.createElement("strong");
      itemName.textContent = bid.name;
      const itemPrice = document.createElement("span");
      itemPrice.textContent = `Current bid ${formatPrice(bid.amount)}`;
      item.append(itemName, itemPrice);
      watchlistItems.appendChild(item);
    });
}

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.getAttribute("data-category");
    const name = card.getAttribute("data-name");
    const categoryMatch = activeFilter === "all" || category === activeFilter;
    const searchMatch = name.includes(term);
    const shouldShow = categoryMatch && searchMatch;

    if (shouldShow) {
      visibleCount += 1;
    }

    card.classList.toggle("hidden", !shouldShow);
  });

  marketSummary.textContent = `${visibleCount} listing${visibleCount === 1 ? "" : "s"} active`;
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");
    activeFilter = button.getAttribute("data-filter");
    applyFilters();
  });
});

searchInput.addEventListener("input", applyFilters);

cards.forEach((card) => {
  const priceEl = card.querySelector("[data-price]");
  const bidBtn = card.querySelector(".bid-btn");
  const listingId = card.getAttribute("data-id");
  const listingName = card.querySelector("h3").textContent;

  bidBtn.addEventListener("click", () => {
    const currentPrice = Number(priceEl.getAttribute("data-price"));
    const nextBid = Math.round(currentPrice * 1.05);
    priceEl.setAttribute("data-price", String(nextBid));
    priceEl.textContent = formatPrice(nextBid);

    const bids = getStoredBids();
    bids[listingId] = {
      id: listingId,
      name: listingName,
      amount: nextBid,
      timestamp: Date.now()
    };
    setStoredBids(bids);
    renderWatchlist();
    showToast(`Bid placed on ${listingName}`);
  });
});

clearBidsButton.addEventListener("click", () => {
  localStorage.removeItem(BID_STORAGE_KEY);

  cards.forEach((card) => {
    const priceEl = card.querySelector("[data-price]");
    const baseValue = Number(priceEl.getAttribute("data-base-price"));
    priceEl.setAttribute("data-price", String(baseValue));
    priceEl.textContent = formatPrice(baseValue);
  });

  renderWatchlist();
  showToast("All bids cleared");
});

// Restore saved bids and apply stored price state on load.
(() => {
  const saved = getStoredBids();
  cards.forEach((card) => {
    const listingId = card.getAttribute("data-id");
    const priceEl = card.querySelector("[data-price]");
    if (!saved[listingId]) {
      return;
    }

    priceEl.setAttribute("data-price", String(saved[listingId].amount));
    priceEl.textContent = formatPrice(saved[listingId].amount);
  });
  renderWatchlist();
  applyFilters();
})();

const cardsForTilt = document.querySelectorAll(".market-card");
cardsForTilt.forEach((card) => {
  card.addEventListener("mousemove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const rotateY = ((x / rect.width) - 0.5) * 8;
    const rotateX = (0.5 - (y / rect.height)) * 8;

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "rotateX(0deg) rotateY(0deg) translateY(0)";
  });
});

const heroPanel = document.getElementById("heroPanel");
heroPanel.addEventListener("mousemove", (event) => {
  const rect = heroPanel.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  heroPanel.style.setProperty("--mx", `${x}%`);
  heroPanel.style.setProperty("--my", `${y}%`);
});

const joinForm = document.getElementById("joinForm");
const emailInput = document.getElementById("emailInput");
const formMessage = document.getElementById("formMessage");

joinForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();

  if (!email || !email.includes("@")) {
    formMessage.textContent = "Please enter a valid email address.";
    return;
  }

  formMessage.textContent = `You're on the list, ${email}. Intel drops every Friday.`;
  joinForm.reset();
});

const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

menuToggle.addEventListener("click", () => {
  const isOpen = siteNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.getElementById("year").textContent = String(new Date().getFullYear());
