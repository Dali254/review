// lib/config.js
//
// EDIT THIS FILE to change earning rates, fees, and limits across the
// entire app. Every page imports from here instead of hardcoding numbers,
// so a single edit updates the businesses page, business pages, wallet,
// and admin dashboard consistently.

// ── Earnings per review, by star rating ──
// What a reviewer earns when they give 1–5 stars. Shown on the businesses
// page, the business detail page, and used to calculate payouts.
export const EARN_RATES = {
  1: 50,
  2: 70,
  3: 100,
  4: 120,
  5: 150,
};

// ── Publish verification fee ──
// A small KES amount charged via M-Pesa STK push before a review is
// published, used to confirm the phone number is real and deter fake
// reviews. Set to 0 to make publishing completely free.
export const PUBLISH_FEE_KES = 0;

// ── Withdrawal tax ──
// Percentage deducted when a reviewer withdraws their balance to M-Pesa.
// 0.16 = 16%. This is the only fee taken from the reviewer's earnings;
// the publish fee above is a separate, small, one-time-per-review charge.
export const WITHDRAWAL_TAX_RATE = 0.2;

// ── Daily review limit (free plan) ──
// How many reviews a Free-plan user can submit per day before being
// asked to upgrade to Pro. Pro-plan users are unlimited.
export const DAILY_FREE_LIMIT = 10;

// ── Pro plan subscription price ──
// Monthly price in KES for unlimited daily reviews.
export const PRO_PRICE_KES = 199;

// ── Withdrawal minimum ──
// Smallest amount (in KES, before tax) a user can withdraw at once.
export const MIN_WITHDRAWAL_KES = 100;

// ── Currency display ──
// KES is always the real currency — all M-Pesa payments, balances, and
// calculations happen in KES under the hood. USD_RATE is only used to
// convert KES amounts for DISPLAY when the user switches to USD view via
// the currency switcher in the navbar. Update this number to change the
// exchange rate shown across the whole app.
export const USD_RATE = 129; // 1 USD = 129 KES

// ── Free publishing via WhatsApp sharing ──
// Users who don't want to pay the small publish verification fee can
// instead share their review link to this many WhatsApp groups/contacts.
// Once they've completed all shares, the review publishes for free.
export const SHARE_TARGET_COUNT = 10;

// Helper: average a set of category star ratings (1-5) and look up the
// earn rate, defaulting to the 3-star rate if something is malformed.
export function earnForRating(rating) {
  return EARN_RATES[Math.round(rating)] ?? EARN_RATES[3];
}
