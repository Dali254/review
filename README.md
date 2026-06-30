# ReviewKE 🇰🇪

**Rate Kenyan businesses and earn M-Pesa rewards.**

A full Next.js web app where Kenyan users review 50+ businesses, earn KES 15–35 per review, and receive payment via M-Pesa (PayHero STK Push). A 10% platform fee is collected per review.

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

- 🏢 **50+ Kenyan businesses** — Telecom, Banking, Supermarkets, Insurance, Fuel, Healthcare, Hospitality, Transport, E-Commerce, Government, Education, Real Estate
- 🖼️ **Google Maps photos** — Real business photos pulled via Google Places API
- 🤖 **AI insights** — Claude AI analyzes reviews and generates sentiment insights
- 💚 **M-Pesa payments** — STK Push via PayHero for fee collection
- 💰 **Wallet** — Track earnings, view transactions, withdraw to M-Pesa
- 📱 **Mobile-first** — Fully responsive with bottom navigation
- ⚡ **Vercel-optimized** — Edge-ready Next.js with API routes

---

## Earning structure

| Stars | You earn | Platform fee (10%) |
|-------|----------|---------------------|
| ⭐    | KES 15   | KES 1.50            |
| ⭐⭐   | KES 20   | KES 2               |
| ⭐⭐⭐  | KES 25   | KES 2.50            |
| ⭐⭐⭐⭐ | KES 30   | KES 3               |
| ⭐⭐⭐⭐⭐| KES 35   | KES 3.50            |

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

### Google Places API (for business photos)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project → **Enable these APIs**:
   - Places API
   - Maps JavaScript API
3. Go to **Credentials → Create API Key**
4. Restrict to your Vercel domain: `*.vercel.app`
5. **Free tier**: 28,500 photo requests/month — more than enough

> Without this key, the app still works — it shows colored logo placeholders instead of photos.

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
│   ├── businesses.js         # Browse all 50+ businesses
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
│   └── businesses.js         # 50+ businesses with Google Place IDs
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
