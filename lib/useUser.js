import { useState, useEffect } from 'react';
import { DAILY_FREE_LIMIT, WITHDRAWAL_TAX_RATE, PRO_PRICE_KES } from './config';

export { DAILY_FREE_LIMIT, PRO_PRICE_KES };
export const TAX_RATE_WITHDRAW = WITHDRAWAL_TAX_RATE;

const STORAGE_KEY = 'reviewke_user';
// IMPORTANT: wallet, transactions, and daily-task data are now stored
// PER ACCOUNT (keyed by phone number inside one JSON blob per key below),
// not as a single global value shared by whoever last used the browser.
// Previously these were flat keys (one wallet for the whole device), so
// logging in as a different account correctly restored that account's
// name/plan but kept showing the PREVIOUS user's balance, review count,
// and daily task counter — which is exactly the "daily reviews / reviews
// written not matching" symptom. Each function below reads/writes only
// the slice for `user.phone`.
const WALLET_KEY  = 'reviewke_wallet';
const TX_KEY      = 'reviewke_transactions';
const TASKS_KEY   = 'reviewke_tasks';
const REVIEWED_KEY = 'reviewke_reviewed_businesses';
// A registry of every account ever created on this device, keyed by phone
// number. STORAGE_KEY only ever holds "whoever is currently signed in" —
// without this registry, logging out and back in (or a second person
// signing in) would have no record to restore from, and login() would
// have to fabricate a placeholder user instead of recovering their real
// name, plan, and review preference.
const ACCOUNTS_KEY = 'reviewke_accounts';

// Normalizes any Kenyan phone number format a user might type or paste
// into one canonical form: a 10-digit string starting with 0, e.g.
// "0712345678". This is THE single source of truth for phone formatting
// — every place that reads or writes a phone number (signup, login,
// M-Pesa STK push, the accounts registry, reviewed-business tracking)
// must go through this function so the same physical number always maps
// to the same key, regardless of how the user typed it.
//
// Accepts all of these and normalizes them identically:
//   "0712345678"      (already correct)
//   "712345678"       (missing leading 0 — common when a UI shows a
//                       separate "+254" prefix and expects 9 digits)
//   "254712345678"    (pasted with country code, no plus)
//   "+254712345678"   (pasted with country code, with plus)
//   "0112345678"      (07 and 01 ranges are both valid Safaricom/Airtel
//                       prefixes — 01 covers newer Safaricom 4G lines)
export function normalizePhone(raw) {
  if (!raw) return '';
  const digits = String(raw).replace(/\D/g, ''); // strip everything but digits
  if (!digits) return '';

  // 254XXXXXXXXX (12 digits, country code without +) → 0XXXXXXXXX
  if (digits.length === 12 && digits.startsWith('254')) {
    return '0' + digits.slice(3);
  }
  // 9 digits with no leading 0 (e.g. "712345678" or "112345678") → add it
  if (digits.length === 9 && (digits.startsWith('7') || digits.startsWith('1'))) {
    return '0' + digits;
  }
  // Already in 0XXXXXXXXX form (10 digits starting with 0)
  if (digits.length === 10 && digits.startsWith('0')) {
    return digits;
  }
  // Anything else (partial input while typing, malformed paste) — return
  // digits as-is so the UI can still show what the user typed; validation
  // elsewhere checks the final normalized length before accepting it.
  return digits;
}

// True only for a complete, valid Kenyan mobile number in normalized
// (0XXXXXXXXX) form — 10 digits, starting with 0, and the 2nd digit is
// 7 or 1 (covers all current Safaricom/Airtel/Telkom mobile ranges).
export function isValidPhone(raw) {
  const n = normalizePhone(raw);
  return /^0[71]\d{8}$/.test(n);
}

function loadAccount(phone) {
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
    return accounts[phone] || null;
  } catch {
    return null;
  }
}

function saveAccount(userData) {
  if (!userData?.phone) return;
  try {
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '{}');
    accounts[userData.phone] = userData;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {}
}

// Generic per-phone-number storage helpers. Each of WALLET_KEY, TX_KEY,
// and TASKS_KEY holds ONE JSON object on disk, shaped like
// { [phone]: <that user's data> } — these two functions are the only
// thing that reads/writes that shape, so every other function below just
// calls loadForPhone(KEY, phone) / saveForPhone(KEY, phone, data).
function loadForPhone(storageKey, phone, fallback) {
  if (!phone) return fallback;
  try {
    const all = JSON.parse(localStorage.getItem(storageKey) || '{}');
    return all[phone] !== undefined ? all[phone] : fallback;
  } catch {
    return fallback;
  }
}

function saveForPhone(storageKey, phone, data) {
  if (!phone) return;
  try {
    const all = JSON.parse(localStorage.getItem(storageKey) || '{}');
    all[phone] = data;
    localStorage.setItem(storageKey, JSON.stringify(all));
  } catch {}
}

export function useUser() {
  const [user, setUser]               = useState(null);
  const [balance, setBalance]         = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalTax, setTotalTax]       = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [tasksToday, setTasksToday]   = useState(0);
  const [taskDate, setTaskDate]       = useState('');
  const [reviewedBusinesses, setReviewedBusinesses] = useState([]); // array of business ids this user has already reviewed
  const [loaded, setLoaded]           = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem(STORAGE_KEY);
      const parsedUser = u ? JSON.parse(u) : null;
      if (parsedUser) setUser(parsedUser);

      const phone = parsedUser?.phone || null;

      const wallet = loadForPhone(WALLET_KEY, phone, { balance: 0, totalEarned: 0, totalTax: 0 });
      setBalance(wallet.balance || 0);
      setTotalEarned(wallet.totalEarned || 0);
      setTotalTax(wallet.totalTax || 0);

      const txs = loadForPhone(TX_KEY, phone, []);
      setTransactions(txs);

      const tasks = loadForPhone(TASKS_KEY, phone, null);
      const today = new Date().toDateString();
      if (tasks && tasks.date === today) {
        setTasksToday(tasks.count || 0);
        setTaskDate(tasks.date);
      } else {
        setTasksToday(0);
        setTaskDate(today);
      }

      // Reviewed-businesses list is keyed per-user (by phone) so switching
      // accounts on the same device doesn't leak one user's review history
      // into another's "already reviewed" lock.
      if (phone) {
        const allReviewed = JSON.parse(localStorage.getItem(REVIEWED_KEY) || '{}');
        setReviewedBusinesses(allReviewed[phone] || []);
      }
    } catch {}
    setLoaded(true);
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    saveAccount(userData);

    const phone = userData.phone;

    // Reload EVERYTHING scoped to this phone number — wallet, transactions,
    // today's task count, and reviewed-businesses — so switching accounts
    // (or logging back in after a logout) shows that account's real data
    // instead of leftover state from whoever was using the browser before.
    const wallet = loadForPhone(WALLET_KEY, phone, { balance: 0, totalEarned: 0, totalTax: 0 });
    setBalance(wallet.balance || 0);
    setTotalEarned(wallet.totalEarned || 0);
    setTotalTax(wallet.totalTax || 0);

    const txs = loadForPhone(TX_KEY, phone, []);
    setTransactions(txs);

    const tasks = loadForPhone(TASKS_KEY, phone, null);
    const today = new Date().toDateString();
    if (tasks && tasks.date === today) {
      setTasksToday(tasks.count || 0);
      setTaskDate(tasks.date);
    } else {
      setTasksToday(0);
      setTaskDate(today);
    }

    try {
      const allReviewed = JSON.parse(localStorage.getItem(REVIEWED_KEY) || '{}');
      setReviewedBusinesses(allReviewed[phone] || []);
    } catch {
      setReviewedBusinesses([]);
    }
  }

  // Used by the "Log in" tab — restores a previously-created account by
  // phone number instead of overwriting it with placeholder data. If no
  // account exists for that number yet, falls back to creating one (so
  // logging in with a brand-new number still works rather than erroring).
  function loginByPhone(rawPhone, fallback = {}) {
    const fullPhone = normalizePhone(rawPhone);
    const existing = loadAccount(fullPhone);
    if (existing) {
      login(existing);
      return existing;
    }
    const created = { name: fallback.name || 'Reviewer', phone: fullPhone, email: fallback.email || '' };
    login(created);
    return created;
  }
  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    // Reset every piece of in-memory state too, not just `user` — without
    // this, a brand-new signup right after logout would briefly render
    // with the PREVIOUS account's balance/transactions/task count still
    // in memory until something else happened to update them.
    setBalance(0);
    setTotalEarned(0);
    setTotalTax(0);
    setTransactions([]);
    setTasksToday(0);
    setTaskDate('');
    setReviewedBusinesses([]);
  }

  // Lets a signed-in user change their local/international/both review
  // preference after signup (e.g. from a settings menu).
  function setReviewPreference(pref) {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, reviewPreference: pref };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      saveAccount(updated);
      return updated;
    });
  }

  // Has this signed-in user already submitted a review for this business?
  // Used to lock the "Write a review" flow to once-per-business-per-user.
  function hasReviewed(businessId) {
    return reviewedBusinesses.includes(businessId);
  }

  // Records that the current user has reviewed this business — call this
  // at the same time you call addEarning() for the review, so the two
  // states never drift apart (earned-but-not-locked, or locked-but-not-earned).
  function markReviewed(businessId) {
    if (!user) return;
    setReviewedBusinesses(prev => {
      if (prev.includes(businessId)) return prev;
      const updated = [...prev, businessId];
      try {
        const allReviewed = JSON.parse(localStorage.getItem(REVIEWED_KEY) || '{}');
        allReviewed[user.phone] = updated;
        localStorage.setItem(REVIEWED_KEY, JSON.stringify(allReviewed));
      } catch {}
      return updated;
    });
  }

  function getRemainingTasks() {
    const today = new Date().toDateString();
    if (taskDate !== today) return DAILY_FREE_LIMIT;
    if (user?.plan === 'pro') return Infinity;
    return Math.max(0, DAILY_FREE_LIMIT - tasksToday);
  }

  function consumeTask() {
    const today = new Date().toDateString();
    let count = tasksToday;
    if (taskDate !== today) { count = 0; setTaskDate(today); }
    if (user?.plan !== 'pro' && count >= DAILY_FREE_LIMIT) return false;
    const newCount = count + 1;
    setTasksToday(newCount);
    saveForPhone(TASKS_KEY, user?.phone, { date: today, count: newCount });
    return true;
  }

  function addEarning(amount, description) {
    const newBalance = balance + amount;
    const newTotalEarned = totalEarned + amount;
    setBalance(newBalance); setTotalEarned(newTotalEarned);
    saveForPhone(WALLET_KEY, user?.phone, { balance:newBalance, totalEarned:newTotalEarned, totalTax });
    const newTxs = [{ id:Date.now(), type:'earn', desc:description, amount, date:new Date().toLocaleDateString('en-KE') }, ...transactions];
    setTransactions(newTxs);
    saveForPhone(TX_KEY, user?.phone, newTxs);
  }

  function withdraw(grossAmount) {
    const tax = Math.round(grossAmount * TAX_RATE_WITHDRAW);
    const net = grossAmount - tax;
    const newBalance = balance - grossAmount;
    const newTotalTax = totalTax + tax;
    setBalance(newBalance); setTotalTax(newTotalTax);
    saveForPhone(WALLET_KEY, user?.phone, { balance:newBalance, totalEarned, totalTax:newTotalTax });
    const newTxs = [
      { id:Date.now()+1, type:'tax', desc:'Withdrawal tax (16%)', amount:-tax, date:new Date().toLocaleDateString('en-KE') },
      { id:Date.now(), type:'withdraw', desc:'Withdrawal to M-Pesa', amount:-net, date:new Date().toLocaleDateString('en-KE'), pending:true,
        releaseDate: (() => { const d = new Date(); d.setHours(d.getHours()+72); return d.toISOString(); })() },
      ...transactions,
    ];
    setTransactions(newTxs);
    saveForPhone(TX_KEY, user?.phone, newTxs);
    return { net, tax };
  }

  // Pro upgrade is only granted after successful M-Pesa payment confirmation
  function upgradePro() {
    const updated = { ...user, plan: 'pro', proSince: new Date().toISOString() };
    setUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    saveAccount(updated);
    const newTxs = [{ id:Date.now(), type:'upgrade', desc:'Pro plan subscription', amount:-PRO_PRICE_KES, date:new Date().toLocaleDateString('en-KE') }, ...transactions];
    setTransactions(newTxs);
    saveForPhone(TX_KEY, updated.phone, newTxs);
  }

  return {
    user, balance, totalEarned, totalTax, transactions,
    tasksToday, loaded,
    login, loginByPhone, logout, addEarning, withdraw, upgradePro, setReviewPreference,
    getRemainingTasks, consumeTask, hasReviewed, markReviewed,
    DAILY_FREE_LIMIT, PRO_PRICE_KES,
  };
}
