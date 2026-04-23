// ============================================================================
// VICE SYNDICATE - GTA 6 MARKETPLACE
// Client-side state management, authentication, and bidding system
// ============================================================================

// UI Element References
const $ = (id) => document.getElementById(id);
const countdownEl = $("countdown");
const revealEls = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll(".counter");
const filterButtons = document.querySelectorAll(".filter-btn");
const cards = document.querySelectorAll(".market-card");
const searchInput = $("searchInput");
const marketSummary = $("marketSummary");
const watchlistItems = $("watchlistItems");
const clearBidsButton = $("clearBids");
const toast = $("toast");

// Modal and signup
const signupModal = $("signupModal");
const closeModalBtn = $("closeModal");
const signupNavBtn = $("signupNavBtn");
const signupFormModal = $("signupFormModal");
const loginFormModal = $("loginFormModal");
const signupMessage = $("signupMessage");
const signupView = $("signupView");
const loginView = $("loginView");
const showLoginBtn = $("showLogin");
const showSignupBtn = $("showSignup");

// User profile elements
const userProfile = $("userProfile");
const profileToggle = $("profileToggle");
const profileDropdown = $("profileDropdown");
const userAvatar = $("userAvatar");
const userName = $("userName");
const dropdownName = $("dropdownName");
const dropdownEmail = $("dropdownEmail");
const userBidCount = $("userBidCount");
const userJoinDate = $("userJoinDate");
const logoutBtn = $("logoutBtn");
const backToTopBtn = $("backToTop");

// Crypto elements
const connectWalletBtn = $("connectWallet");
const walletStatus = $("walletStatus");
const bidHistory = $("bidHistory");

// Menu toggle
const menuToggle = $("menuToggle");
const siteNav = $("siteNav");

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
  signupMessage.className = "form-message";

  const username = $("username").value.trim();
  const email = $("signupEmail").value.trim();
  const password = $("password").value;
  const confirmPassword = $("confirmPassword").value;

  if (!username || !email || !password) {
    signupMessage.textContent = "All fields are required.";
    signupMessage.classList.add("error");
    return;
  }

  if (password !== confirmPassword) {
    signupMessage.textContent = "Passwords do not match.";
    signupMessage.classList.add("error");
    return;
  }

  if (password.length < 8) {
    signupMessage.textContent = "Password must be at least 8 characters.";
    signupMessage.classList.add("error");
    return;
  }

  const users = getAllUsers();
  if (users[username]) {
    signupMessage.textContent = "Username already taken.";
    signupMessage.classList.add("error");
    return;
  }

  const passwordHash = simpleHash(password);
  saveUser(username, email, passwordHash);

  currentUser = username;
  localStorage.setItem(CURRENT_USER_KEY, username);

  signupMessage.textContent = `Account created! Welcome, ${username}`;
  signupMessage.classList.add("success");
  setTimeout(() => {
    signupModal.classList.remove("open");
    signupFormModal.reset();
    signupMessage.textContent = "";
    updateAuthUI();
    renderWatchlist();
    showToast(`Welcome to Vice Syndicate, ${username}!`);
  }, 800);
}

function handleLogin(e) {
  e.preventDefault();
  signupMessage.className = "form-message";

  const username = $("loginUsername").value.trim();
  const password = $("loginPassword").value;

  if (!username || !password) {
    signupMessage.textContent = "All fields are required.";
    signupMessage.classList.add("error");
    return;
  }

  const users = getAllUsers();
  if (!users[username]) {
    signupMessage.textContent = "Account not found.";
    signupMessage.classList.add("error");
    return;
  }

  const passwordHash = simpleHash(password);
  if (users[username].passwordHash !== passwordHash) {
    signupMessage.textContent = "Incorrect password.";
    signupMessage.classList.add("error");
    return;
  }

  currentUser = username;
  localStorage.setItem(CURRENT_USER_KEY, username);

  signupMessage.textContent = `Welcome back, ${username}!`;
  signupMessage.classList.add("success");
  setTimeout(() => {
    signupModal.classList.remove("open");
    loginFormModal.reset();
    signupMessage.textContent = "";
    updateAuthUI();
    renderWatchlist();
    showToast(`Welcome back, ${username}!`);
  }, 800);
}

function handleLogout() {
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
  profileDropdown.classList.remove("open");
  updateAuthUI();
  showToast("Logged out successfully");
}

function updateAuthUI() {
  if (currentUser) {
    signupNavBtn.classList.add("hidden");
    userProfile.classList.remove("hidden");

    const initial = currentUser.charAt(0).toUpperCase();
    userAvatar.textContent = initial;
    userName.textContent = currentUser;
    dropdownName.textContent = currentUser;

    const users = getAllUsers();
    const userData = users[currentUser];
    if (userData) {
      dropdownEmail.textContent = userData.email || "";
      if (userData.createdAt) {
        const d = new Date(userData.createdAt);
        userJoinDate.textContent = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
      }
    }

    const bids = getStoredBids();
    userBidCount.textContent = String(Object.keys(bids).length);
  } else {
    signupNavBtn.classList.remove("hidden");
    userProfile.classList.add("hidden");
    profileDropdown.classList.remove("open");
  }
}

function openSignupModal() {
  signupView.classList.remove("hidden");
  loginView.classList.add("hidden");
  signupMessage.textContent = "";
  signupMessage.className = "form-message";
  signupModal.classList.add("open");
}

function openLoginModal() {
  loginView.classList.remove("hidden");
  signupView.classList.add("hidden");
  signupMessage.textContent = "";
  signupMessage.className = "form-message";
  signupModal.classList.add("open");
}

function closeSignupModal() {
  signupModal.classList.remove("open");
  signupMessage.textContent = "";
  signupMessage.className = "form-message";
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
        updateAuthUI();
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

  // Close mobile nav on link click
  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ============================================================================
// HERO PANEL EFFECTS
// ============================================================================

function setupHeroPanel() {
  const heroPanel = $("heroPanel");
  if (!heroPanel) return;

  heroPanel.addEventListener("mousemove", (e) => {
    const rect = heroPanel.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    heroPanel.style.setProperty("--mx", `${x}%`);
    heroPanel.style.setProperty("--my", `${y}%`);
  });

  heroPanel.addEventListener("mouseleave", () => {
    heroPanel.style.setProperty("--mx", "30%");
    heroPanel.style.setProperty("--my", "30%");
  });
}

// ============================================================================
// SCROLL EFFECTS
// ============================================================================

function setupScrollEffects() {
  const header = document.querySelector(".site-header");

  window.addEventListener("scroll", () => {
    // Header shadow on scroll
    header.classList.toggle("scrolled", window.scrollY > 50);

    // Back to top button visibility
    backToTopBtn.classList.toggle("visible", window.scrollY > 400);
  }, { passive: true });

  backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

// ============================================================================
// PROFILE DROPDOWN
// ============================================================================

function setupProfileDropdown() {
  profileToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle("open");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!profileDropdown.contains(e.target) && !profileToggle.contains(e.target)) {
      profileDropdown.classList.remove("open");
    }
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
  setupHeroPanel();
  setupScrollEffects();
  setupProfileDropdown();

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
  loginFormModal.addEventListener("submit", handleLogin);
  logoutBtn.addEventListener("click", handleLogout);

  // Toggle between login and signup views
  showLoginBtn.addEventListener("click", () => {
    signupView.classList.add("hidden");
    loginView.classList.remove("hidden");
    signupMessage.textContent = "";
    signupMessage.className = "form-message";
  });
  showSignupBtn.addEventListener("click", () => {
    loginView.classList.add("hidden");
    signupView.classList.remove("hidden");
    signupMessage.textContent = "";
    signupMessage.className = "form-message";
  });

  // Close modal on backdrop click
  signupModal.addEventListener("click", (e) => {
    if (e.target === signupModal) closeSignupModal();
  });

  // Close modal on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeSignupModal();
      profileDropdown.classList.remove("open");
    }
  });

  // Email signup
  $("joinForm").addEventListener("submit", handleEmailSignup);

  // Crypto
  connectWalletBtn.addEventListener("click", handleConnectWallet);

  // Restore session state
  currentUser = localStorage.getItem(CURRENT_USER_KEY);
  connectedWallet = localStorage.getItem(WALLET_STORAGE_KEY);
  updateAuthUI();

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
  $("year").textContent = String(new Date().getFullYear());
}

// ============================================================================
// START APP
// ============================================================================

document.addEventListener("DOMContentLoaded", initialize);
