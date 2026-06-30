// lib/feeLedger.js
//
// A platform-wide record of every fee ReviewKE has collected — publish
// verification fees, withdrawal tax, and Pro subscription payments.
// This is separate from each user's personal transaction history
// (lib/useUser.js) because the admin dashboard needs to see fees from
// ALL users, not just the one currently signed in.
//
// IMPORTANT — this is a localStorage-backed ledger, so it only sees fees
// collected in THIS browser. That's fine for local development and demos,
// but for a real multi-user admin dashboard you need every fee event
// written to a real database (or at minimum the same persistent store
// used in lib/paymentStore.js) so the dashboard reflects every user,
// not just whoever is currently on the device viewing /admin.
// The functions below (recordFee, getFees) are the only interface the
// rest of the app uses — swap the body of each to read/write a real
// backend and nothing else needs to change.

const LEDGER_KEY = 'reviewke_fee_ledger';

export const FEE_TYPES = {
  PUBLISH: 'publish_fee',
  WITHDRAWAL_TAX: 'withdrawal_tax',
  PRO_SUBSCRIPTION: 'pro_subscription',
};

export function recordFee({ type, amount, userName, userPhone, businessName, reference }) {
  if (typeof window === 'undefined') return;
  try {
    const existing = JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]');
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      amount,
      userName: userName || 'Unknown',
      userPhone: userPhone || '',
      businessName: businessName || null,
      reference: reference || null,
      timestamp: new Date().toISOString(),
    };
    const updated = [entry, ...existing].slice(0, 2000); // cap stored history
    localStorage.setItem(LEDGER_KEY, JSON.stringify(updated));
  } catch {}
}

export function getFees() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(LEDGER_KEY) || '[]');
  } catch {
    return [];
  }
}

export function clearFees() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEDGER_KEY);
}

// Aggregate totals by fee type, plus an overall sum — used by the
// admin dashboard summary cards.
export function summarizeFees(fees) {
  const summary = {
    total: 0,
    byType: { [FEE_TYPES.PUBLISH]: 0, [FEE_TYPES.WITHDRAWAL_TAX]: 0, [FEE_TYPES.PRO_SUBSCRIPTION]: 0 },
    count: fees.length,
  };
  for (const f of fees) {
    summary.total += f.amount;
    summary.byType[f.type] = (summary.byType[f.type] || 0) + f.amount;
  }
  return summary;
}
