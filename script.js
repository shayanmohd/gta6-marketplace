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
const AUTH_TOKEN_KEY = "vice-syndicate-token";
const REMOTE_MAP_KEY = "vice-syndicate-remote-map";


// Supabase client setup
const supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

function setApiStatus(status, color) {
  const el = document.getElementById('apiStatus');
  const txt = document.getElementById('apiStatusText');
  if (!el || !txt) return;
  el.style.display = 'block';
  txt.textContent = status;
  el.style.background = color || '#222';
}

async function probeApiHealth() {
  // For serverless, just check Supabase connection
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (!error) {
      setApiStatus('Online', '#1db954');
    } else {
      setApiStatus('Offline', '#e74c3c');
    }
  } catch {
    setApiStatus('Offline', '#e74c3c');
  }
}

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


  async function handleSignup(e) {
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

    // Supabase email/password signup
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { username } } });
    if (error) {
      signupMessage.textContent = error.message || 'Registration failed';
      signupMessage.classList.add('error');
      return;
    }
    currentUser = email;
    localStorage.setItem(CURRENT_USER_KEY, currentUser);
    signupMessage.textContent = `Account created! Welcome, ${currentUser}`;
    signupMessage.classList.add('success');
    setTimeout(() => {
      signupModal.classList.remove('open');
      signupFormModal.reset();
      signupMessage.textContent = '';
      updateAuthUI();
      renderWatchlist();
      showToast(`Welcome to Vice Syndicate, ${currentUser}!`);
    }, 800);
  }


// Supabase-based bids (fetch all bids for current user)
async function getStoredBids() {
  if (!currentUser) return {};
  const { data, error } = await supabase.from('bids').select('*').eq('user_email', currentUser);
  if (error || !data) return {};
  // Map by listingId for compatibility
  const bids = {};
  data.forEach(bid => {
    bids[bid.listing_id] = {
      id: bid.listing_id,
      name: bid.listing_name,
      amount: bid.amount,
      timestamp: new Date(bid.created_at).getTime(),
      user: bid.user_email
    };
  });
  return bids;
}

async function setStoredBids(listingId, bidObj) {
  // Upsert bid for current user
  if (!currentUser) return;
  await supabase.from('bids').upsert({
    listing_id: listingId,
    listing_name: bidObj.name,
    amount: bidObj.amount,
    user_email: currentUser,
    created_at: new Date().toISOString()
  }, { onConflict: ['listing_id', 'user_email'] });
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

  // If backend API is available, register via API (email/password). Otherwise fallback to localStorage.
  if (useApi) {
    fetch((apiRoot || '') + '/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(r => r.json()).then(data => {
      if (data.error) {
        signupMessage.textContent = data.error;
        signupMessage.classList.add('error');
        return;
      }
      const token = data.token;
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      currentUser = data.user.email || data.user.id;
      localStorage.setItem(CURRENT_USER_KEY, currentUser);
      signupMessage.textContent = `Account created! Welcome, ${currentUser}`;
      signupMessage.classList.add('success');
      setTimeout(() => {
        signupModal.classList.remove('open');
        signupFormModal.reset();
        signupMessage.textContent = '';
        updateAuthUI();
        renderWatchlist();
        showToast(`Welcome to Vice Syndicate, ${currentUser}!`);
      }, 800);
    }).catch(err => {
      signupMessage.textContent = 'Registration failed';
      signupMessage.classList.add('error');
    });
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


async function handleLogin(e) {
  e.preventDefault();
  signupMessage.className = "form-message";

  const email = $("loginUsername").value.trim();
  const password = $("loginPassword").value;

  if (!email || !password) {
    signupMessage.textContent = "All fields are required.";
    signupMessage.classList.add("error");
    return;
  }

  // Supabase email/password login
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    signupMessage.textContent = error.message || 'Login failed';
    signupMessage.classList.add('error');
    return;
  }
  currentUser = email;
  localStorage.setItem(CURRENT_USER_KEY, currentUser);
  signupMessage.textContent = `Welcome back, ${currentUser}!`;
  signupMessage.classList.add('success');
  setTimeout(() => {
    signupModal.classList.remove('open');
    loginFormModal.reset();
    signupMessage.textContent = '';
    updateAuthUI();
    renderWatchlist();
    showToast(`Welcome back, ${currentUser}!`);
  }, 800);
}


async function handleLogout() {
  await supabase.auth.signOut();
  currentUser = null;
  localStorage.removeItem(CURRENT_USER_KEY);
  profileDropdown.classList.remove("open");
  updateAuthUI();
  showToast("Logged out successfully");
}
// Social login (Google, GitHub, etc.)
async function handleSocialLogin(provider) {
  const { error } = await supabase.auth.signInWithOAuth({ provider });
  if (error) {
    showToast('Social login failed');
  }
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


async function renderWatchlist() {
  const bids = await getStoredBids();
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

    bidBtn.addEventListener("click", async () => {
      if (!currentUser) {
        openSignupModal();
        showToast("Sign up to place bids!");
        return;
      }
      const currentPrice = Number(priceEl.getAttribute("data-price"));
      const nextBid = Math.round(currentPrice * 1.05);
      priceEl.setAttribute("data-price", String(nextBid));
      priceEl.textContent = formatPrice(nextBid);

      // Store bid in Supabase
      await setStoredBids(listingId, {
        id: listingId,
        name: listingName,
        amount: nextBid,
        timestamp: Date.now(),
        user: currentUser
      });
      await renderWatchlist();
      updateAuthUI();
      showToast(`Bid placed on ${listingName}`);
    });
  });
}


async function handleClearBids() {
  if (!currentUser) return;
  // Delete all bids for current user
  await supabase.from('bids').delete().eq('user_email', currentUser);
  cards.forEach((card) => {
    const priceEl = card.querySelector("[data-price]");
    const baseValue = Number(priceEl.getAttribute("data-base-price"));
    priceEl.setAttribute("data-price", String(baseValue));
    priceEl.textContent = formatPrice(baseValue);
  });
  await renderWatchlist();
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


async function renderBidHistory() {
  const bids = await getStoredBids();
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


async function initialize() {
  // Probe API health and show status
  probeApiHealth();
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
    await renderBidHistory();
  }

  // Restore bids
  const saved = await getStoredBids();
  cards.forEach((card) => {
    const listingId = card.getAttribute("data-id");
    const priceEl = card.querySelector("[data-price]");
    if (!saved[listingId]) return;
    priceEl.setAttribute("data-price", String(saved[listingId].amount));
    priceEl.textContent = formatPrice(saved[listingId].amount);
  });

  await renderWatchlist();
  applyFilters();

  // Footer year
  $("year").textContent = String(new Date().getFullYear());
}

// ============================================================================
// START APP
// ============================================================================

document.addEventListener("DOMContentLoaded", initialize);
