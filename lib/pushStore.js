// lib/pushStore.js
//
// Stores each user's Web Push subscription (the browser-issued endpoint +
// keys needed to send them a push) so the server can notify them later —
// including when their app/tab is completely closed.
//
// IMPORTANT — same Vercel serverless caveat as lib/paymentStore.js:
// This in-memory Map is NOT guaranteed to survive between requests on
// Vercel, since each invocation can run in a fresh container. It works
// reliably in local dev and often works across requests in a single warm
// container, but for production-correct behavior — where a subscription
// saved today must still be there in a week — replace this with a real
// persistent store (Vercel KV, Upstash Redis, or a database table) keyed
// by phone number. The get/set/remove/getAll functions below are the only
// interface the rest of the app uses; swap their bodies and nothing else
// needs to change.

const store = global.__reviewkePushStore || (global.__reviewkePushStore = new Map());

// Save or update a subscription for a phone number. A user can have
// multiple subscriptions (e.g. phone + desktop browser) — we keep the
// most recent one per phone for simplicity; extend to an array if you
// want to notify every device a user has installed the app on.
export function saveSubscription(phone, subscription) {
  if (!phone || !subscription) return;
  store.set(phone, { subscription, updatedAt: Date.now() });
}

export function getSubscription(phone) {
  const entry = store.get(phone);
  return entry ? entry.subscription : null;
}

export function removeSubscription(phone) {
  store.delete(phone);
}

// Returns every stored subscription, used for broadcast notifications
// (e.g. "new review job available" sent to everyone, not one user).
export function getAllSubscriptions() {
  return Array.from(store.entries()).map(([phone, entry]) => ({
    phone,
    subscription: entry.subscription,
    updatedAt: entry.updatedAt,
  }));
}

export function subscriptionCount() {
  return store.size;
}
