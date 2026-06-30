import { useState, useEffect } from 'react';

const STORAGE_KEY = 'reviewke_user';
const WALLET_KEY = 'reviewke_wallet';
const TX_KEY = 'reviewke_transactions';

export function useUser() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalTax, setTotalTax] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const u = localStorage.getItem(STORAGE_KEY);
      const w = localStorage.getItem(WALLET_KEY);
      const t = localStorage.getItem(TX_KEY);
      if (u) setUser(JSON.parse(u));
      if (w) {
        const wallet = JSON.parse(w);
        setBalance(wallet.balance || 0);
        setTotalEarned(wallet.totalEarned || 0);
        setTotalTax(wallet.totalTax || 0);
      }
      if (t) setTransactions(JSON.parse(t));
    } catch {}
    setLoaded(true);
  }, []);

  function login(userData) {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  }

  function logout() {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  function addEarning(amount, taxAmount, description) {
    const newBalance = balance + amount;
    const newTotalEarned = totalEarned + amount;
    const newTotalTax = totalTax + taxAmount;
    setBalance(newBalance);
    setTotalEarned(newTotalEarned);
    setTotalTax(newTotalTax);
    localStorage.setItem(WALLET_KEY, JSON.stringify({
      balance: newBalance, totalEarned: newTotalEarned, totalTax: newTotalTax,
    }));

    const newTxs = [
      { id: Date.now() + 1, type: 'earn', desc: description, amount, date: new Date().toLocaleDateString('en-KE'), icon: '⭐' },
      { id: Date.now(), type: 'tax', desc: 'Platform fee', amount: -taxAmount, date: new Date().toLocaleDateString('en-KE'), icon: '📤' },
      ...transactions,
    ];
    setTransactions(newTxs);
    localStorage.setItem(TX_KEY, JSON.stringify(newTxs));
  }

  function withdraw(amount) {
    const newBalance = balance - amount;
    setBalance(newBalance);
    localStorage.setItem(WALLET_KEY, JSON.stringify({ balance: newBalance, totalEarned, totalTax }));
    const newTxs = [
      { id: Date.now(), type: 'withdraw', desc: 'Withdrawal to M-Pesa', amount: -amount, date: new Date().toLocaleDateString('en-KE'), icon: '💸' },
      ...transactions,
    ];
    setTransactions(newTxs);
    localStorage.setItem(TX_KEY, JSON.stringify(newTxs));
  }

  return { user, balance, totalEarned, totalTax, transactions, loaded, login, logout, addEarning, withdraw };
}
