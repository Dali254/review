// In-memory payment status store.
//
// IMPORTANT — Vercel serverless caveat:
// Each serverless function invocation can run in a fresh container, so this
// in-memory Map is NOT guaranteed to persist between the /api/pay call and a
// later /api/pay-status poll, or between /api/pay-callback and /api/pay-status.
// It works fine in a single long-lived dev server and often works on Vercel
// within the same warm container, but for a production-correct deployment
// replace this with a real store (Vercel KV / Upstash Redis / a database row)
// keyed by `reference`. The read/write interface below is intentionally the
// only thing that needs to change — swap the body of get/set and nothing
// else in the app needs to know.

const store = global.__reviewkePaymentStore || (global.__reviewkePaymentStore = new Map());

export function setPaymentStatus(reference, status, extra = {}) {
  store.set(reference, { status, updatedAt: Date.now(), ...extra });
}

export function getPaymentStatus(reference) {
  return store.get(reference) || null;
}
