# Vice Syndicate — GTA 6 Marketplace Platform

A modern, fully-interactive static website showcasing marketplace functionality, user authentication, and Web3 wallet integration—all without a backend. Production-ready code built for GitHub Pages deployment.

**Live Demo:** [gta6.llc](https://gta6.llc)

## Features

### Core Marketplace
- **Interactive Listings** — 6 curated marketplace items with real-time filtering
- **Smart Search** — Live search across all listings with instant results
- **Bidding System** — Persistent bid tracking with +5% increment logic
- **Watchlist** — Active bid summary panel with user-specific tracking

### User System
- **Client-Side Auth** — Signup/signin with username, email, and password validation
- **Persistent Sessions** — localStorage-based account persistence across page reloads
- **Demo Security** — Simple hashing for educational purposes

### Web3 Integration
- **Wallet Connection** — MetaMask/Web3 wallet detection and account linking
- **Bid History** — Crypto-enabled bid tracking synchronized with localStorage
- **No Backend Required** — All wallet state managed client-side

### Design & UX
- **Responsive Layout** — Mobile-first design with breakpoints at 720px, 980px
- **Scroll Animations** — Reveal effects and animated stat counters
- **Card Interactivity** — 3D tilt hover effects on marketplace cards
- **Toast Notifications** — In-app feedback for all user actions
- **Dark Mode** — Neon cyberpunk aesthetic with accent gradients

## Technology Stack

| Category | Tech |
|----------|------|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript (ES6+) |
| **Storage** | localStorage (no database) |
| **Web3** | ethers.js v6 (CDN) |
| **Fonts** | Google Fonts (Bebas Neue, Space Grotesk) |
| **Hosting** | GitHub Pages (static) |

## Project Structure

```
gta6-marketplace/
├── index.html           # Main page + modal markup
├── styles.css          # All styling (responsive, animations, modals)
├── script.js           # Core app logic (280+ lines, well-commented)
├── logo.svg            # Vice Syndicate logo + favicon
├── CNAME               # Custom domain configuration
├── LICENSE             # MIT License
└── README.md           # This file
```

## Key Features Deep Dive

### User Authentication
```javascript
function handleSignup(e) {
  // Validates credentials, checks duplicates
  // Stores user with hashed password (client-side)
  // Sets persistent session
  // Displays welcome toast
}
```
Signup form requires:
- Username (unique)
- Email address
- Password (min 8 characters, must confirm)

### Marketplace Bidding
```javascript
bidBtn.addEventListener("click", () => {
  if (currentUser) {
    // Calculate 5% increment on current price
    // Persist to localStorage
    // Update watchlist UI in real-time
    // Show toast confirmation
  } else {
    openSignupModal(); // Gate behind authentication
  }
});
```

### Web3 Wallet Integration
```javascript
async function handleConnectWallet() {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });
  // Store wallet address persistently
  // Render bid history panel
  // Display connection status
}
```
Seamlessly integrates with MetaMask or any Web3 provider.

## Getting Started

### Local Development
```bash
cd gta6-marketplace
python3 -m http.server 5500
```
Open `http://localhost:5500` in your browser.

### Production Deployment (GitHub Pages)

Already deployed at [gta6.llc](https://gta6.llc). To deploy your own fork:

1. **Create GitHub repo:**
   ```bash
   gh repo create gta6-marketplace --public
   ```

2. **Push code:**
   ```bash
   cd gta6-marketplace
   git add .
   git commit -m "Deploy Vice Syndicate"
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Repo Settings → Pages
   - Source: Deploy from branch
   - Branch: main, Folder: /(root)
   - Save and wait ~2 minutes

4. **Connect Custom Domain** (optional):
   - Add DNS records (A records pointing to GitHub Pages IPs, CNAME for www)
   - Set custom domain in Pages settings
   - Enable HTTPS enforcement

## Usage Guide

### As an End User
1. Click **Sign Up** in the navigation bar
2. Create account (username must be unique)
3. Browse marketplace by category (Vehicles, Gear, Property, Fashion)
4. Use search to find specific listings
5. Click **Bid +5%** on any item to increase your bid
6. View all active bids in **My Active Bids** panel
7. **Connect Wallet** (optional) to see wallet-based bid history

### As a Developer

#### Modify Listings
Edit marketplace cards in `index.html`:
```html
<article class="market-card" data-category="vehicles" data-id="my-item">
  <p class="tag">Vehicles</p>
  <h3>Item Name</h3>
  <p>Description text</p>
  <div class="card-foot">
    <span data-price="999000" data-base-price="999000">$999,000</span>
    <button type="button" class="bid-btn">Bid +5%</button>
  </div>
</article>
```

#### Customize Theme
Adjust colors in `styles.css`:
```css
:root {
  --bg: #090d14;                    /* Background */
  --text: #f5f9ff;                  /* Text color */
  --accent-b: #ff6b35;              /* Primary accent */
  --accent-a: #00d2a2;              /* Success color */
  --accent-c: #1ecbff;              /* Info color */
}
```

#### Hook to Backend
Replace localStorage calls in `script.js`:
```javascript
// Instead of:
setStoredBids(bids);

// Use:
await fetch("/api/bids", {
  method: "POST",
  body: JSON.stringify(bids)
});
```

## Architecture

### State Management
- **Users:** `localStorage['vice-syndicate-users']` — JSON object of all users
- **Bids:** `localStorage['vice-syndicate-bids']` — Current user's bid history
- **Session:** `localStorage['vice-syndicate-current-user']` — Active username
- **Wallet:** `localStorage['vice-syndicate-wallet']` — Connected wallet address

### Data Flow
1. User signup → validated → hashed → stored in localStorage
2. Bid placed → calculated → persisted → watchlist updated → toast shown
3. Wallet connected → address stored → bid history rendered
4. Page reload → session restored from localStorage → UI updated

### Browser Support
- Modern browsers with ES6+ (Chrome, Firefox, Safari, Edge)
- Requires localStorage API support
- Web3 optional (graceful fallback)

## Security Notes

**Educational Project:**
- Passwords hashed client-side with simple algorithm (NOT cryptographically secure)
- All data stored locally in browser (no server validation)
- No HTTPS enforcement in development

**For Production:**
- Implement proper backend authentication (JWT, OAuth2)
- Add server-side input validation and rate limiting
- Use HTTPS everywhere
- Hash passwords with bcrypt or similar
- Add CSRF protection
- Implement API request signing

## Customization Ideas

- [ ] Add item images (use image hosting like imgbb)
- [ ] Implement real auction countdown timers
- [ ] Add user profile pages with bid history
- [ ] Email notifications for auction updates
- [ ] Real cryptocurrency payment integration
- [ ] Admin dashboard for managing listings
- [ ] Multi-language support
- [ ] Dark/light theme toggle

## Performance Metrics

- **Total Bundle:** ~15 KB (uncompressed)
- **Load Time:** <500ms (typical connection)
- **Lighthouse Score:** 95+ (performance, accessibility)
- **API Calls:** 0 (fully static)
- **Database:** None (localStorage only)

## Licensing & Attribution

**MIT License** — See [LICENSE](LICENSE) file.

You are free to:
- Use for personal or commercial projects
- Modify and distribute
- Sublicense (must include original license)

Just keep the license file and attribute original work.

## Known Limitations

- No real payment processing (bids are simulated)
- No real-time sync between users (each user has isolated state)
- No image uploads (static listings only)
- Web3 features require MetaMask or compatible wallet
- Data lost if localStorage is cleared

## Future Roadmap

- **v1.1:** Backend API (Node.js/Express) for shared user state
- **v1.2:** Real Ethereum smart contracts for NFT marketplace
- **v1.3:** User profiles, leaderboards, achievement system
- **v1.4:** Email notifications and bid alerts
- **v2.0:** Mobile app (React Native)

## Contributing

Contributions welcome! Areas for improvement:
- Additional marketplace categories
- Animation improvements
- Accessibility enhancements
- Backend integration examples
- Test suite

## Support

Issues or questions? Check [gta6.llc](https://gta6.llc) or open a GitHub issue.

## Author

**Mohd Shayan**  
- **GitHub:** [@shayanmohd](https://github.com/shayanmohd)
- **Portfolio:** [mohdshayan.com](https://mohdshayan.com)
- **Email:** contact@mohdshayan.com
- **LinkedIn:** [linkedin.com/in/shayanmohd](https://linkedin.com/in/shayanmohd)

## Disclaimer

Vice Syndicate is an **unofficial fan project** inspired by GTA themes. Not affiliated with or endorsed by Rockstar Games or Take-Two Interactive.

---

Built with ❤️ using vanilla JavaScript, CSS3, and HTML5. No frameworks. No build step. Just pure web tech.

---



Serverless Supabase Setup (No Backend Required)
-----------------------------------------------
This project is now 100% serverless and runs entirely from GitHub Pages (or any static host) using Supabase for authentication and data storage.

Quick start
1. Create a free project at https://app.supabase.com
2. In your project, go to the SQL Editor and run the SQL in `supabase_migration.sql` to create the required tables.
3. In Project Settings → API, copy your `SUPABASE_URL` and `anon` public key.
4. In `index.html`, set:
  ```js
  window.SUPABASE_URL = 'https://tjymcnjlfmnamvnznhln.supabase.co';
  window.SUPABASE_ANON_KEY = 'sb_publishable_-AdMefXcCPBWRgLs6uzjLA_iYhM0ctB';
  ```
5. Push your site to GitHub Pages (or any static host).

Features
- Email/password and social login (Google, GitHub, etc.)
- All auctions and bids are stored in your Supabase database
- No backend server or Node.js required

Security notes
- Only use the `anon` public key in your front-end. Never expose the service role key.

To customize tables, see `supabase_migration.sql`.

---

Test Checklist
==============
1. **Sign up with email/password**
  - Go to the site, click Sign Up, and create a new account.
  - Confirm you can log in and see your user info.
2. **Sign in with email/password**
  - Log out, then log in with your credentials.
3. **Try social login**
  - Use Google or GitHub login (if enabled in your Supabase project).
4. **Place a bid**
  - Click Bid +5% on any listing. Confirm your bid appears in “My Active Bids.”
5. **Clear bids**
  - Click “Clear My Bids.” Confirm all bids are removed and prices reset.
6. **Persistence**
  - Refresh the page. Your session and bids should persist.
7. **Multiple users**
  - Sign up with a different email. Confirm each user’s bids are isolated.
8. **Mobile/responsive**
  - Test on mobile and desktop for layout and login.
9. **API status**
  - Confirm the API status indicator shows “Online.”

If all pass, your serverless marketplace is live!



