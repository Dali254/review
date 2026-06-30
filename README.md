# ReviewKE 🇰🇪

**Rate Kenyan businesses and earn M-Pesa rewards.**

A full Next.js web app where Kenyan users review 54 local businesses (or 26 famous international brands on the Pro plan) and earn KES per review, paid via M-Pesa (PayHero STK Push). Earning rates and fees are configurable in lib/config.js.

---

## ⚠️ Important — payment verification on Vercel

Reviews and Pro upgrades now require a **real, confirmed M-Pesa payment** before
anything is credited. The flow is:

1. Client calls `/api/pay` → PayHero sends an STK push → returns `success: true`
   only meaning "the push was sent," **not** "payment completed."
2. Client polls `/api/pay-status?reference=...` every 3s for up to 45s.
3. PayHero calls `/api/pay-callback` with the real result once the customer
   enters their PIN (or cancels). This updates the status store.
4. Only when `/api/pay-status` returns `SUCCESS` does the app credit earnings
   or activate Pro. If it returns `FAILED`/`CANCELLED`, or times out, nothing
   is credited and the user sees a "Payment not completed" screen.

**The status store in `lib/paymentStore.js` is in-memory (a `Map`).** This is
fine for local development and often works on Vercel within a single warm
container, but Vercel serverless functions can run in fresh containers
between requests, so the webhook write and the polling read aren't
guaranteed to share memory in production.

**Before going live, replace `lib/paymentStore.js`** with a real persistent
store — the two functions (`setPaymentStatus`, `getPaymentStatus`) are the
only interface the rest of the app uses, so swapping the implementation is
a self-contained change. Good options on Vercel's free tier:

- **Vercel KV** (Redis-compatible, free tier available) — simplest swap
- **Upstash Redis** (free tier: 10K commands/day)
- A lightweight database row (Vercel Postgres, Supabase, etc.) if you're
  also persisting users/reviews server-side

## Features

- 🏢 **80 real businesses** — 54 local Kenyan businesses (Safaricom, Equity Bank, KFC Kenya, Naivas...) across 13 categories, plus 26 famous international brands (Google, Amazon, Alibaba, Starbucks, Marriott...) reserved for Pro subscribers
- 🖼️ **Google Maps photos** — Real business photos pulled via Google Places API
- 🤖 **AI insights** — Claude AI analyzes reviews and generates sentiment insights
- 💚 **M-Pesa payments** — STK Push via PayHero for fee collection
- 💰 **Wallet** — Track earnings, view transactions, withdraw to M-Pesa
- 📱 **Mobile-first** — Fully responsive with bottom navigation
- ⚡ **Vercel-optimized** — Edge-ready Next.js with API routes

---

## Editing earning rates, fees, and limits

Every money-related number in the app lives in **one file**: `lib/config.js`.
Edit it and every page — homepage, business detail, wallet, admin dashboard —
picks up the change automatically.

```js
// lib/config.js
export const EARN_RATES = { 1: 15, 2: 20, 3: 25, 4: 30, 5: 35 }; // KES per review, by star rating
export const PUBLISH_FEE_KES = 1;        // KES charged via M-Pesa to verify + publish a review (0 = free)
export const WITHDRAWAL_TAX_RATE = 0.16; // 16% deducted only when withdrawing to M-Pesa
export const DAILY_FREE_LIMIT = 20;      // free-plan reviews per day before Pro is required
export const PRO_PRICE_KES = 299;        // monthly Pro subscription price
export const MIN_WITHDRAWAL_KES = 100;   // smallest withdrawal allowed
```

Current defaults:

| Stars | Reviewer earns | Withdrawal tax (16%) | Net to M-Pesa |
|-------|-----------------|------------------------|----------------|
| ★ | KES 15 | KES 2.40 | KES 12.60 |
| ★★ | KES 20 | KES 3.20 | KES 16.80 |
| ★★★ | KES 25 | KES 4.00 | KES 21.00 |
| ★★★★ | KES 30 | KES 4.80 | KES 25.20 |
| ★★★★★ | KES 35 | KES 5.60 | KES 29.40 |

A separate small **publish fee** (default KES 1, set `PUBLISH_FEE_KES = 0` to
disable) is charged via M-Pesa STK push before a review is published — this
is a verification step to deter fake/spam reviews, not the main revenue
mechanism. Most platform revenue comes from the 16% withdrawal tax and Pro
subscriptions.

After editing `lib/config.js`, redeploy (or just `git push` if connected to
Vercel) for the change to go live — no other files need to change.

---

## Admin dashboard

Visit `/admin` on your deployed app (e.g. `https://your-app.vercel.app/admin`)
to see a dashboard of every fee collected: publish fees, withdrawal tax, and
Pro subscriptions, broken down by type, with a searchable transaction log.

It's protected by a simple password gate (default password:
`reviewke-admin`, set in `pages/admin.js` — **change this before deploying**).
This is a basic device-level gate, not real authentication; don't rely on it
to protect sensitive data.

**Important limitation:** the dashboard currently reads from a
browser-local ledger (`lib/feeLedger.js`), so it only shows fees collected
in the same browser that's viewing `/admin` — not platform-wide across every
user's device. This works for local testing and demos. For a real
multi-user dashboard, every fee event needs to be written to a shared
backend (a database table, or the same persistent store recommended for
`lib/paymentStore.js`) instead of `localStorage`. The `recordFee()` /
`getFees()` functions in `lib/feeLedger.js` are the only interface the rest
of the app uses, so swapping the storage backend is a contained change.

---

## Deploy to Vercel (free plan)

### Step 1 — Push to GitHub

```bash
cd reviewke
git init
git add .
git commit -m "Initial ReviewKE commit"
# Create a repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/reviewke.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)
4. Click **Deploy**

### Step 3 — Add environment variables

In Vercel dashboard → Your project → **Settings → Environment Variables**, add:

| Key | Value | Notes |
|-----|-------|-------|
| `GOOGLE_PLACES_API_KEY` | `your_key_here` | See below |
| `ANTHROPIC_API_KEY` | `your_key_here` | See below |
| `PAYHERO_AUTH` | `Basic ZWFybmlmeTpDdXRlcG9pc29uQDI1NA==` | Your existing credentials |
| `PAYHERO_CHANNEL_ID` | `133` | Your channel ID |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` | Your Vercel URL |

After adding env vars → **Redeploy** (Deployments tab → three dots → Redeploy).

---

## API Keys Setup

### Google Places API (for real business photos)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → **Enable these APIs**:
   - **Places API** (required — this is the one used)
3. Go to **Credentials → Create API Key**
4. Restrict the key:
   - Under "API restrictions" → select **Places API**
   - Under "Application restrictions" → **HTTP referrers** → add your Vercel domain (`*.vercel.app/*` and your custom domain if you have one)
5. In Vercel, set the environment variable **`GOOGLE_PLACES_API_KEY`** to this key
6. Redeploy

**How this works:** `/api/place-photo.js` looks up each business by **name +
address** (no pre-stored Place ID required) using Google's "Find Place from
Text" endpoint, then proxies the actual photo bytes back to the browser. If
Google has no photo for a business, or the key is missing/invalid, the
endpoint returns no content and the `<img>` tag's `onError` handler falls
back to `/api/logo` (the company's real logo, fetched from their domain) —
so a business card is never blank, it just falls back gracefully through
photo → logo → colored initial.

**Free tier**: Places API gives 28,500 free text-search + photo requests per
month, and every photo is cached for 30 days server-side, so a business's
photo is only fetched from Google once even with heavy traffic.

> Without this key, the app still works — every business shows its real
> logo (via `/api/logo`, no key required) instead of a Google Maps photo.

### Anthropic API (for AI insights)

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. **API Keys → Create Key**
3. Uses `claude-haiku-4-5-20251001` (fastest + cheapest model)

> Without this key, AI insights return sensible fallback text instead of failing.

---

## Local development

```bash
npm install
cp .env.local.example .env.local  # fill in your keys
npm run dev
# Open http://localhost:3000
```

---

## Project structure

```
reviewke/
├── pages/
│   ├── index.js              # Homepage with hero + featured businesses
│   ├── businesses.js         # Browse local/international businesses with region toggle
│   ├── wallet.js             # Earnings wallet + withdraw
│   ├── business/[id].js      # Business detail + review writing
│   └── api/
│       ├── place-photo.js    # Google Places proxy (hides API key)
│       ├── ai-analyze.js     # Claude AI review analysis
│       ├── pay.js            # PayHero STK Push
│       └── pay-callback.js   # PayHero webhook receiver
├── components/
│   ├── Navbar.js             # Top nav + mobile bottom nav
│   ├── BusinessCard.js       # Card with Google photo
│   └── AuthModal.js          # Sign up / log in
├── lib/
│   ├── useUser.js            # Auth + wallet state (localStorage)
│   └── useToast.js           # Toast notification hook
├── data/
│   └── businesses.js         # 80 businesses (54 local + 26 international), earn multipliers, regions
├── styles/
│   └── globals.css
├── vercel.json               # Vercel deployment config
└── next.config.js            # Image domain allowlist
```

---

## Production upgrades (beyond free plan)

For a production launch, add:

- **Database**: Vercel Postgres or PlanetScale (MySQL) — store users, reviews, wallets server-side
- **Auth**: NextAuth.js with SMS OTP (Twilio or Africa's Talking)
- **PayHero callback verification**: Verify webhook signature before crediting wallet
- **Admin dashboard**: Review moderation, fraud detection, payout management
- **Email**: Resend or SendGrid for review notifications

---

## Built with

- **Next.js 14** — React framework with API routes
- **Google Places API** — Business photos and ratings
- **Anthropic Claude** — AI review analysis (Haiku model)
- **PayHero** — M-Pesa STK Push for Kenya
- **Vercel** — Deployment (free tier compatible)
