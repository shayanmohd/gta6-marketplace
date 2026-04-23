// ============================================================================
// VICE SYNDICATE - GTA 6 MARKETPLACE
// Client-side state management, authentication, and bidding system
// ============================================================================

// UI Element References
const countdownEl = document.getElementById("countdown");
const revealEls = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".market-card");
const searchInput = document.getElementById("searchInput");
const marketSummary = document.getElementById("marketSummary");
const watchlistItems = document.getElementById("watchlistItems");
const clearBidsButton = document.getElementById("clearBids");

// Modal and signup
const signupModal = document.getElementById("signupModal");
const closeModalBtn = document.getElementById("closeModal");
const signupNavBtn = document.getElementById("signupNavBtn");
const signupFormModal = document.getElementById("signupFormModal");
const signupMessage = document.getElementById("signupMessage");

// Crypto elements
const connectWalletBtn = document.getElementById("connectWallet");
const walletStatus = document.getElementById("walletStatus");
const bidHistory = document.getElementById("bidHistory");

// Menu toggle
const menuToggle = document.getElementById("menuToggle");
const siteNav = document.getElementById("siteNav");

// Storage keys
const BID_STORAGE_KEY = "vice-syndicate-bids";
const USERS_STORAGE_KEY = "vice-syndicate-users";
const CURRENT_USER_KEY = "vice-syndicate-current-user";
const WALLET_STORAGE_KEY = "vice-syndicate-wallet";

// State
let activeFilter = "all";
let currentUser = null;
let connectedWallet = null;

// Countdown target
const targetDate = new Date("2026-10-01T00:00:00");

// ============================================================================
// COUNTDOWN
// ============================================================================

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

// ============================================================================
// ANIMATIONS
// ============================================================================

function setupRevealAnimation() {
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
}

function setupCounters() {
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

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
}

// ============================================================================
// UTILITIES
// ============================================================================

function formatPrice(value) {
  return `$${value.toLocaleString("en-US")}`;
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

// ============================================================================
// STORAGE
// ============================================================================

function getStoredBids() {
  const raw = localStorage.getItem(BID_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function setStoredBids(bids) {
  localStorage.setItem(BID_STORAGE_KEY, JSON.stringify(bids));
}

function getAllUsers() {
  const raw = localStorage.getItem(USERS_STORAGE_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveUser(username, email, passwordHash) {
  const users = getAllUsers();
  users[username] = {
    username,
    email,
    passwordHash,
    createdAt: Date.now()
  };
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return String(hash);
}

function handleSignup(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!username || !email || !password) {
    signupMessage.textContent = "All fields required.";
    return;
  }

  if (password !== confirmPassword) {
    signupMessage.textContent = "Passwords do not match.";
    return;
  }

  if (password.length < 8) {
    signupMessage.textContent = "Password must be at least 8 characters.";
    return;
  }

  const users = getAllUsers();
  if (users[username]) {
    signupMessage.textContent = "Username already taken.";
    return;
  }

  const passwordHash = simpleHash(password);
  saveUser(username, email, passwordHash);

  currentUser = username;
  localStorage.setItem(CURRENT_USER_KEY, username);

  signupMessage.textContent = `Welcome, ${username}!`;
  setTimeout(() => {
    signupModal.classList.remove("open");
    signupFormModal.reset();
    renderWatchlist();
    showToast(`Account created! Welcome, ${username}`);
  }, 1000);
}

function openSignupModal() {
  signupModal.classList.add("open");
}

function closeSignupModal() {
  signupModal.classList.remove("open");
  signupMessage.textContent = "";
}

// ============================================================================
// MARKETPLACE
// ============================================================================

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

    if (shouldShow) visibleCount += 1;
    card.classList.toggle("hidden", !shouldShow);
  });

  marketSummary.textContent = `${visibleCount} listing${visibleCount === 1 ? "" : "s"} active`;
}

function setupBidding() {
  cards.forEach((card) => {
    const priceEl = card.querySelector("[data-price]");
    const bidBtn = card.querySelector(".bid-btn");
    const listingId = card.getAttribute("data-id");
    const listingName = card.querySelector("h3").textContent;

    bidBtn.addEventListener("click", () => {
      if (currentUser) {
        const currentPrice = Number(priceEl.getAttribute("data-price"));
        const nextBid = Math.round(currentPrice * 1.05);
        priceEl.setAttribute("data-price", String(nextBid));
        priceEl.textContent = formatPrice(nextBid);

        const bids = getStoredBids();
        bids[listingId] = {
          id: listingId,
          name: listingName,
          amount: nextBid,
          timestamp: Date.now(),
          user: currentUser
        };
        setStoredBids(bids);
        renderWatchlist();
        showToast(`Bid placed on ${listingName}`);
      } else {
        openSignupModal();
        showToast("Sign up to place bids!");
      }
    });
  });
}

function handleClearBids() {
  localStorage.removeItem(BID_STORAGE_KEY);

  cards.forEach((card) => {
    const priceEl = card.querySelector("[data-price]");
    const baseValue = Number(priceEl.getAttribute("data-base-price"));
    priceEl.setAttribute("data-price", String(baseValue));
    priceEl.textContent = formatPrice(baseValue);
  });

  renderWatchlist();
  showToast("All bids cleared");
}

// ============================================================================
// WEB3 / CRYPTO
// ============================================================================

async function handleConnectWallet() {
  if (typeof window.ethereum === "undefined") {
    showToast("MetaMask or Web3 wallet not detected");
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    connectedWallet = accounts[0];
    localStorage.setItem(WALLET_STORAGE_KEY, connectedWallet);

    walletStatus.classList.add("active");
    walletStatus.innerHTML = `
      <strong>Connected:</strong> ${connectedWallet.substring(0, 6)}...${connectedWallet.substring(38)}
    `;

    renderBidHistory();
    showToast(`Wallet connected: ${connectedWallet.substring(0, 6)}...`);
  } catch (error) {
    showToast("Failed to connect wallet");
  }
}

function renderBidHistory() {
  const bids = getStoredBids();
  const entries = Object.entries(bids);

  if (entries.length === 0) {
    bidHistory.innerHTML = "";
    return;
  }

  let html = "<h4>Recent Bids (Wallet)</h4><ul>";
  entries
    .sort((a, b) => b[1].timestamp - a[1].timestamp)
    .slice(0, 5)
    .forEach(([_, bid]) => {
      html += `<li><strong>${bid.name}</strong> - ${formatPrice(bid.amount)}</li>`;
    });
  html += "</ul>";
  bidHistory.innerHTML = html;
}

// ============================================================================
// EMAIL SIGNUP
// ============================================================================

function handleEmailSignup(e) {
  e.preventDefault();
  const email = document.getElementById("emailInput").value.trim();

  if (!email || !email.includes("@")) {
    document.getElementById("formMessage").textContent = "Please enter a valid email address.";
    return;
  }

  document.getElementById("formMessage").textContent = `You're on the list, ${email}. Intel drops every Friday.`;
  document.getElementById("joinForm").reset();
}

// ============================================================================
// UI
// ============================================================================

function setupMenuToggle() {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function initialize() {
  // Countdown
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // Animations
  setupRevealAnimation();
  setupCounters();

  // Marketplace
  setupBidding();
  setupMenuToggle();

  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");
      activeFilter = button.getAttribute("data-filter");
      applyFilters();
    });
  });

  // Search input
  searchInput.addEventListener("input", applyFilters);

  // Clear bids
  clearBidsButton.addEventListener("click", handleClearBids);

  // Signup modal
  signupNavBtn.addEventListener("click", openSignupModal);
  closeModalBtn.addEventListener("click", closeSignupModal);
  signupFormModal.addEventListener("submit", handleSignup);

  // Email signup
  document.getElementById("joinForm").addEventListener("submit", handleEmailSignup);

  // Crypto
  connectWalletBtn.addEventListener("click", handleConnectWallet);

  // Restore session state
  currentUser = localStorage.getItem(CURRENT_USER_KEY);
  connectedWallet = localStorage.getItem(WALLET_STORAGE_KEY);

  if (connectedWallet) {
    walletStatus.classList.add("active");
    walletStatus.innerHTML = `
      <strong>Connected:</strong> ${connectedWallet.substring(0, 6)}...${connectedWallet.substring(38)}
    `;
    renderBidHistory();
  }

  // Restore bids
  const saved = getStoredBids();
  cards.forEach((card) => {
    const listingId = card.getAttribute("data-id");
    const priceEl = card.querySelector("[data-price]");
    if (!saved[listingId]) return;
    priceEl.setAttribute("data-price", String(saved[listingId].amount));
    priceEl.textContent = formatPrice(saved[listingId].amount);
  });

  renderWatchlist();
  applyFilters();

  // Footer year
  document.getElementById("year").textContent = String(new Date().getFullYear());
}

// ============================================================================
// START APP
// ============================================================================

document.addEventListener("DOMContentLoaded", initialize);
